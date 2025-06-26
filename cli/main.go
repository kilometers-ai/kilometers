package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"sync"
	"time"
)

// MCP JSON-RPC message structure
type MCPMessage struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      interface{}     `json:"id,omitempty"`
	Method  string          `json:"method,omitempty"`
	Params  json.RawMessage `json:"params,omitempty"`
	Result  json.RawMessage `json:"result,omitempty"`
	Error   *MCPError       `json:"error,omitempty"`
}

type MCPError struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// Event represents a captured MCP interaction
type Event struct {
	ID        string    `json:"id"`
	Timestamp time.Time `json:"timestamp"`
	Direction string    `json:"direction"` // "request" | "response"
	Method    string    `json:"method,omitempty"`
	Payload   []byte    `json:"payload"`
	Size      int       `json:"size"`
}

// ProcessWrapper handles the transparent MCP server wrapping
type ProcessWrapper struct {
	cmd    *exec.Cmd
	stdin  io.WriteCloser
	stdout io.ReadCloser
	stderr io.ReadCloser
	events chan Event
	wg     sync.WaitGroup
	logger *log.Logger
}

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintf(os.Stderr, "Usage: %s <mcp-server-command> [args...]\n", os.Args[0])
		fmt.Fprintf(os.Stderr, "\nExample: %s npx @modelcontextprotocol/server-github\n", os.Args[0])
		os.Exit(1)
	}

	// Initialize logger
	logger := log.New(os.Stderr, "[km] ", log.LstdFlags)
	logger.Printf("Starting Kilometers CLI wrapper for: %v", os.Args[1:])

	// Create and start the process wrapper
	wrapper, err := NewProcessWrapper(os.Args[1], os.Args[2:], logger)
	if err != nil {
		logger.Fatalf("Failed to create process wrapper: %v", err)
	}

	// Start the wrapper
	if err := wrapper.Start(); err != nil {
		logger.Fatalf("Failed to start process wrapper: %v", err)
	}

	// Wait for completion
	if err := wrapper.Wait(); err != nil {
		logger.Printf("Process exited with error: %v", err)
		os.Exit(1)
	}

	logger.Printf("Process completed successfully")
}

// NewProcessWrapper creates a new process wrapper
func NewProcessWrapper(command string, args []string, logger *log.Logger) (*ProcessWrapper, error) {
	cmd := exec.Command(command, args...)

	// Create pipes for monitoring
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to create stdin pipe: %w", err)
	}

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to create stdout pipe: %w", err)
	}

	stderr, err := cmd.StderrPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to create stderr pipe: %w", err)
	}

	return &ProcessWrapper{
		cmd:    cmd,
		stdin:  stdin,
		stdout: stdout,
		stderr: stderr,
		events: make(chan Event, 100), // Buffered channel for events
		logger: logger,
	}, nil
}

// Start begins the process and monitoring
func (pw *ProcessWrapper) Start() error {
	// Start the wrapped process
	if err := pw.cmd.Start(); err != nil {
		return fmt.Errorf("failed to start command: %w", err)
	}

	pw.logger.Printf("Started process with PID: %d", pw.cmd.Process.Pid)

	// Start monitoring goroutines
	pw.wg.Add(4)
	go pw.monitorStdin()
	go pw.monitorStdout()
	go pw.forwardStderr()
	go pw.processEvents()

	return nil
}

// Wait waits for the process to complete
func (pw *ProcessWrapper) Wait() error {
	// Wait for the process to finish
	err := pw.cmd.Wait()

	// Close the events channel to signal event processor to stop
	close(pw.events)

	// Wait for all goroutines to finish
	pw.wg.Wait()

	return err
}

// monitorStdin reads from os.Stdin and forwards to the wrapped process while monitoring
func (pw *ProcessWrapper) monitorStdin() {
	defer pw.wg.Done()
	defer pw.stdin.Close()

	scanner := bufio.NewScanner(os.Stdin)
	for scanner.Scan() {
		line := scanner.Bytes()

		// Parse and capture the request
		if msg := pw.parseMCPMessage(line); msg != nil {
			event := Event{
				ID:        pw.generateEventID(),
				Timestamp: time.Now(),
				Direction: "request",
				Method:    msg.Method,
				Payload:   line,
				Size:      len(line),
			}

			// Send event to processing channel (non-blocking)
			select {
			case pw.events <- event:
			default:
				pw.logger.Printf("Warning: Event buffer full, dropping request event")
			}
		}

		// Forward to wrapped process
		if _, err := pw.stdin.Write(append(line, '\n')); err != nil {
			pw.logger.Printf("Error writing to stdin: %v", err)
			return
		}
	}

	if err := scanner.Err(); err != nil {
		pw.logger.Printf("Error reading from stdin: %v", err)
	}
}

// monitorStdout reads from the wrapped process and forwards to os.Stdout while monitoring
func (pw *ProcessWrapper) monitorStdout() {
	defer pw.wg.Done()

	scanner := bufio.NewScanner(pw.stdout)
	for scanner.Scan() {
		line := scanner.Bytes()

		// Parse and capture the response
		if msg := pw.parseMCPMessage(line); msg != nil {
			event := Event{
				ID:        pw.generateEventID(),
				Timestamp: time.Now(),
				Direction: "response",
				Method:    msg.Method,
				Payload:   line,
				Size:      len(line),
			}

			// Send event to processing channel (non-blocking)
			select {
			case pw.events <- event:
			default:
				pw.logger.Printf("Warning: Event buffer full, dropping response event")
			}
		}

		// Forward to stdout
		if _, err := os.Stdout.Write(append(line, '\n')); err != nil {
			pw.logger.Printf("Error writing to stdout: %v", err)
			return
		}
	}

	if err := scanner.Err(); err != nil {
		pw.logger.Printf("Error reading from stdout: %v", err)
	}
}

// forwardStderr simply forwards stderr from the wrapped process
func (pw *ProcessWrapper) forwardStderr() {
	defer pw.wg.Done()

	_, err := io.Copy(os.Stderr, pw.stderr)
	if err != nil {
		pw.logger.Printf("Error forwarding stderr: %v", err)
	}
}

// processEvents handles captured events (currently just logs them)
func (pw *ProcessWrapper) processEvents() {
	defer pw.wg.Done()

	eventCount := 0
	for event := range pw.events {
		eventCount++

		// For now, just log the events
		// TODO: Send to API when available
		pw.logger.Printf("Event #%d: %s %s (%d bytes)",
			eventCount, event.Direction, event.Method, event.Size)

		// In debug mode, could also log the payload
		if os.Getenv("KM_DEBUG") == "true" {
			pw.logger.Printf("Payload: %s", string(event.Payload))
		}
	}

	pw.logger.Printf("Processed %d total events", eventCount)
}

// parseMCPMessage attempts to parse a JSON-RPC message
func (pw *ProcessWrapper) parseMCPMessage(data []byte) *MCPMessage {
	var msg MCPMessage
	if err := json.Unmarshal(data, &msg); err != nil {
		// Not valid JSON or not an MCP message, that's ok
		return nil
	}

	// Validate it's a JSON-RPC 2.0 message
	if msg.JSONRPC != "2.0" {
		return nil
	}

	return &msg
}

// generateEventID creates a unique event identifier
func (pw *ProcessWrapper) generateEventID() string {
	return fmt.Sprintf("%d-%d", time.Now().UnixNano(), pw.cmd.Process.Pid)
}
