package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

// EventDto represents the structure expected by the API
type EventDto struct {
	ID        string `json:"id"`
	Timestamp string `json:"timestamp"`
	Direction string `json:"direction"`
	Method    string `json:"method,omitempty"`
	Payload   string `json:"payload"` // Base64 encoded
	Size      int    `json:"size"`
}

// EventBatchDto represents a batch of events for the API
type EventBatchDto struct {
	Events         []EventDto `json:"events"`
	CliVersion     string     `json:"cliVersion"`
	BatchTimestamp string     `json:"batchTimestamp"`
}

// APIClient handles communication with the Kilometers API
type APIClient struct {
	endpoint   string
	apiKey     string
	httpClient *http.Client
	logger     *log.Logger
}

// NewAPIClient creates a new API client
func NewAPIClient(config *Config, logger *log.Logger) *APIClient {
	return &APIClient{
		endpoint: config.APIEndpoint,
		apiKey:   config.APIKey,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		logger: logger,
	}
}

// SendEvent sends a single event to the API
func (c *APIClient) SendEvent(event Event) error {
	dto := c.eventToDTO(event)

	jsonData, err := json.Marshal(dto)
	if err != nil {
		return fmt.Errorf("failed to marshal event: %w", err)
	}

	req, err := http.NewRequest("POST", c.endpoint+"/api/events", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if c.apiKey != "" {
		req.Header.Set("Authorization", "Bearer "+c.apiKey)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	c.logger.Printf("Successfully sent event %s to API", event.ID)
	return nil
}

// SendEventBatch sends multiple events in a single request
func (c *APIClient) SendEventBatch(events []Event) error {
	if len(events) == 0 {
		return nil
	}

	dtos := make([]EventDto, len(events))
	for i, event := range events {
		dtos[i] = c.eventToDTO(event)
	}

	batch := EventBatchDto{
		Events:         dtos,
		CliVersion:     "1.0.0",
		BatchTimestamp: time.Now().Format(time.RFC3339),
	}

	jsonData, err := json.Marshal(batch)
	if err != nil {
		return fmt.Errorf("failed to marshal batch: %w", err)
	}

	req, err := http.NewRequest("POST", c.endpoint+"/api/events/batch", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if c.apiKey != "" {
		req.Header.Set("Authorization", "Bearer "+c.apiKey)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	c.logger.Printf("Successfully sent batch of %d events to API", len(events))
	return nil
}

// TestConnection tests if the API is reachable
func (c *APIClient) TestConnection() error {
	req, err := http.NewRequest("GET", c.endpoint+"/health", nil)
	if err != nil {
		return fmt.Errorf("failed to create health check request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to reach API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return fmt.Errorf("API health check failed with status %d", resp.StatusCode)
	}

	c.logger.Printf("API connection test successful")
	return nil
}

// eventToDTO converts an Event to EventDto with proper base64 encoding
func (c *APIClient) eventToDTO(event Event) EventDto {
	return EventDto{
		ID:        event.ID,
		Timestamp: event.Timestamp.Format(time.RFC3339),
		Direction: event.Direction,
		Method:    event.Method,
		Payload:   base64.StdEncoding.EncodeToString(event.Payload),
		Size:      event.Size,
	}
}
