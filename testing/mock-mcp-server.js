#!/usr/bin/env node

/**
 * Mock MCP Server for Testing Kilometers CLI
 * 
 * This server simulates various MCP scenarios to test the CLI wrapper:
 * - Normal operations
 * - Error conditions  
 * - High-risk content
 * - Large payloads
 * - Different response patterns
 */

const readline = require('readline');

class MockMCPServer {
    constructor() {
        this.requestCount = 0;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        });
        
        // Test scenarios configuration
        this.scenarios = {
            normal: true,
            slow_responses: false,
            high_risk_content: false,
            large_payloads: false,
            random_errors: false,
            simulate_crash: false
        };
        
        this.setupSignalHandlers();
        this.log('Mock MCP Server started');
        this.log(`Process ID: ${process.pid}`);
        this.printScenarios();
    }

    log(message) {
        console.error(`[Mock MCP] ${new Date().toISOString()} - ${message}`);
    }

    printScenarios() {
        this.log('Available test scenarios:');
        Object.entries(this.scenarios).forEach(([key, enabled]) => {
            this.log(`  ${key}: ${enabled ? 'ENABLED' : 'disabled'}`);
        });
        this.log('Send JSON-RPC requests to test different behaviors');
    }

    setupSignalHandlers() {
        process.on('SIGINT', () => {
            this.log('Received SIGINT, shutting down gracefully');
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            this.log('Received SIGTERM, shutting down gracefully');
            process.exit(0);
        });
    }

    start() {
        this.rl.on('line', (line) => {
            try {
                this.handleRequest(line.trim());
            } catch (error) {
                this.log(`Error processing request: ${error.message}`);
                this.sendError(-32700, 'Parse error', null);
            }
        });

        this.rl.on('close', () => {
            this.log('Input stream closed, shutting down');
            process.exit(0);
        });

        // Send initialization response
        this.sendResponse({
            jsonrpc: "2.0",
            id: "init",
            result: {
                protocolVersion: "2024-11-05",
                capabilities: {
                    tools: {
                        listChanged: true
                    },
                    resources: {
                        subscribe: true,
                        listChanged: true
                    },
                    prompts: {
                        listChanged: true
                    }
                },
                serverInfo: {
                    name: "mock-mcp-server",
                    version: "1.0.0"
                }
            }
        });
    }

    handleRequest(line) {
        if (!line) return;

        this.requestCount++;
        this.log(`Processing request #${this.requestCount}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);

        let request;
        try {
            request = JSON.parse(line);
        } catch (error) {
            this.log(`Invalid JSON received: ${error.message}`);
            return;
        }

        // Validate JSON-RPC structure
        if (request.jsonrpc !== "2.0") {
            this.sendError(-32600, 'Invalid Request', request.id);
            return;
        }

        // Handle different methods
        this.handleMethod(request);
    }

    async handleMethod(request) {
        const { method, params, id } = request;

        // Simulate slow responses if enabled
        if (this.scenarios.slow_responses) {
            await this.delay(1000 + Math.random() * 2000);
        }

        // Simulate random errors if enabled
        if (this.scenarios.random_errors && Math.random() < 0.2) {
            this.sendError(-32603, 'Simulated random error', id);
            return;
        }

        // Simulate crash scenario
        if (this.scenarios.simulate_crash && this.requestCount > 3) {
            this.log('Simulating server crash!');
            process.exit(1);
        }

        switch (method) {
            case 'ping':
                this.handlePing(id);
                break;

            case 'initialize':
                this.handleInitialize(params, id);
                break;

            case 'tools/list':
                this.handleToolsList(id);
                break;

            case 'tools/call':
                this.handleToolsCall(params, id);
                break;

            case 'resources/list':
                this.handleResourcesList(id);
                break;

            case 'resources/read':
                this.handleResourcesRead(params, id);
                break;

            case 'prompts/list':
                this.handlePromptsList(id);
                break;

            case 'prompts/get':
                this.handlePromptsGet(params, id);
                break;

            default:
                this.log(`Unknown method: ${method}`);
                this.sendError(-32601, 'Method not found', id);
        }
    }

    handlePing(id) {
        this.sendResponse({
            jsonrpc: "2.0",
            id,
            result: {}
        });
    }

    handleInitialize(params, id) {
        this.log(`Client capabilities: ${JSON.stringify(params?.capabilities || {})}`);
        
        this.sendResponse({
            jsonrpc: "2.0",
            id,
            result: {
                protocolVersion: "2024-11-05",
                capabilities: {
                    tools: { listChanged: true },
                    resources: { subscribe: true, listChanged: true },
                    prompts: { listChanged: true }
                },
                serverInfo: {
                    name: "mock-mcp-server",
                    version: "1.0.0-test"
                }
            }
        });
    }

    handleToolsList(id) {
        const tools = [
            {
                name: "test_tool",
                description: "A test tool for validation",
                inputSchema: {
                    type: "object",
                    properties: {
                        action: { type: "string" },
                        data: { type: "string" }
                    }
                }
            }
        ];

        if (this.scenarios.high_risk_content) {
            tools.push({
                name: "dangerous_tool",
                description: "Tool that simulates dangerous operations",
                inputSchema: {
                    type: "object",
                    properties: {
                        command: { type: "string" },
                        target: { type: "string" }
                    }
                }
            });
        }

        this.sendResponse({
            jsonrpc: "2.0",
            id,
            result: { tools }
        });
    }

    handleToolsCall(params, id) {
        const { name, arguments: args } = params;
        
        this.log(`Tool call: ${name} with args: ${JSON.stringify(args)}`);

        let result;
        if (name === "test_tool") {
            result = {
                content: [{
                    type: "text",
                    text: `Test tool executed with action: ${args?.action || 'none'}`
                }]
            };
        } else if (name === "dangerous_tool" && this.scenarios.high_risk_content) {
            result = {
                content: [{
                    type: "text",
                    text: "Simulated dangerous operation: accessing /etc/passwd\nroot:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin"
                }]
            };
        } else {
            this.sendError(-32602, `Unknown tool: ${name}`, id);
            return;
        }

        // Add large payload if scenario is enabled
        if (this.scenarios.large_payloads) {
            result.content[0].text += '\n\nLarge payload data:\n' + 'A'.repeat(50000);
        }

        this.sendResponse({
            jsonrpc: "2.0",
            id,
            result
        });
    }

    handleResourcesList(id) {
        const resources = [
            {
                uri: "test://safe-file.txt",
                name: "Safe Test File",
                description: "A safe test file for validation"
            }
        ];

        if (this.scenarios.high_risk_content) {
            resources.push({
                uri: "file:///etc/passwd",
                name: "System Password File",
                description: "Dangerous system file access"
            });
        }

        this.sendResponse({
            jsonrpc: "2.0",
            id,
            result: { resources }
        });
    }

    handleResourcesRead(params, id) {
        const { uri } = params;
        
        this.log(`Resource read: ${uri}`);

        let content;
        if (uri === "test://safe-file.txt") {
            content = "This is safe test content from the mock MCP server.";
        } else if (uri.includes("/etc/passwd") && this.scenarios.high_risk_content) {
            content = "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nSimulated /etc/passwd content";
        } else {
            this.sendError(-32602, `Resource not found: ${uri}`, id);
            return;
        }

        // Add large content if scenario is enabled
        if (this.scenarios.large_payloads) {
            content += '\n\nLarge content:\n' + 'B'.repeat(75000);
        }

        this.sendResponse({
            jsonrpc: "2.0",
            id,
            result: {
                contents: [{
                    uri,
                    mimeType: "text/plain",
                    text: content
                }]
            }
        });
    }

    handlePromptsList(id) {
        this.sendResponse({
            jsonrpc: "2.0",
            id,
            result: {
                prompts: [
                    {
                        name: "test_prompt",
                        description: "A test prompt for validation"
                    }
                ]
            }
        });
    }

    handlePromptsGet(params, id) {
        const { name } = params;
        
        if (name !== "test_prompt") {
            this.sendError(-32602, `Unknown prompt: ${name}`, id);
            return;
        }

        this.sendResponse({
            jsonrpc: "2.0",
            id,
            result: {
                description: "Test prompt response",
                messages: [
                    {
                        role: "user",
                        content: {
                            type: "text",
                            text: "This is a test prompt from the mock MCP server."
                        }
                    }
                ]
            }
        });
    }

    sendResponse(response) {
        const json = JSON.stringify(response);
        console.log(json);
        this.log(`Sent response: ${json.substring(0, 100)}${json.length > 100 ? '...' : ''}`);
    }

    sendError(code, message, id) {
        const error = {
            jsonrpc: "2.0",
            id,
            error: { code, message }
        };
        console.log(JSON.stringify(error));
        this.log(`Sent error: ${code} - ${message}`);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Handle command line arguments to configure scenarios
const args = process.argv.slice(2);
const server = new MockMCPServer();

args.forEach(arg => {
    if (arg.startsWith('--enable-')) {
        const scenario = arg.replace('--enable-', '');
        if (server.scenarios.hasOwnProperty(scenario)) {
            server.scenarios[scenario] = true;
            server.log(`Enabled scenario: ${scenario}`);
        }
    }
});

// Start the server
server.start();