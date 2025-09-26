/**
 * Mock MCP Server for Testing
 * Simulates an MCP server for testing purposes
 */

const readline = require('readline');

class MockMCPServer {
  constructor() {
    this.capabilities = {
      tools: {
        echo: {
          description: 'Echo back the input message',
          inputSchema: {
            type: 'object',
            properties: {
              message: { type: 'string' }
            },
            required: ['message']
          }
        },
        math: {
          description: 'Perform basic math operations',
          inputSchema: {
            type: 'object',
            properties: {
              operation: { type: 'string', enum: ['add', 'subtract', 'multiply', 'divide'] },
              a: { type: 'number' },
              b: { type: 'number' }
            },
            required: ['operation', 'a', 'b']
          }
        }
      },
      resources: {
        'file://': {
          description: 'File system resources'
        }
      }
    };
    
    this.setupIO();
  }

  setupIO() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.rl.on('line', (line) => {
      this.handleMessage(line);
    });

    process.on('exit', () => {
      this.rl.close();
    });
  }

  handleMessage(line) {
    try {
      const message = JSON.parse(line);
      this.processMessage(message);
    } catch (error) {
      this.sendError(null, -32700, 'Parse error');
    }
  }

  processMessage(message) {
    const { jsonrpc, id, method, params } = message;

    if (jsonrpc !== '2.0') {
      this.sendError(id, -32600, 'Invalid Request');
      return;
    }

    switch (method) {
      case 'initialize':
        this.handleInitialize(id, params);
        break;
      case 'tools/list':
        this.handleToolsList(id);
        break;
      case 'tools/call':
        this.handleToolCall(id, params);
        break;
      case 'resources/list':
        this.handleResourcesList(id);
        break;
      case 'resources/read':
        this.handleResourceRead(id, params);
        break;
      case 'ping':
        this.handlePing(id);
        break;
      default:
        this.sendError(id, -32601, 'Method not found');
    }
  }

  handleInitialize(id, params) {
    this.sendResponse(id, {
      protocolVersion: '2024-11-05',
      capabilities: this.capabilities,
      serverInfo: {
        name: 'mock-mcp-server',
        version: '1.0.0'
      }
    });
  }

  handleToolsList(id) {
    const tools = Object.entries(this.capabilities.tools).map(([name, info]) => ({
      name,
      description: info.description,
      inputSchema: info.inputSchema
    }));

    this.sendResponse(id, { tools });
  }

  handleToolCall(id, params) {
    const { name, arguments: args } = params;

    switch (name) {
      case 'echo':
        this.sendResponse(id, {
          success: true,
          content: [{
            type: 'text',
            text: `Echo: ${args.message || 'No message provided'}`
          }]
        });
        break;

      case 'math':
        const result = this.performMathOperation(args);
        this.sendResponse(id, {
          success: true,
          content: [{
            type: 'text',
            text: `Result: ${result}`
          }]
        });
        break;

      default:
        this.sendError(id, -32602, `Unknown tool: ${name}`);
    }
  }

  handleResourcesList(id) {
    const resources = [
      {
        uri: 'file://test.txt',
        name: 'test.txt',
        description: 'Test text file'
      },
      {
        uri: 'file://data.json',
        name: 'data.json',
        description: 'Test JSON file'
      }
    ];

    this.sendResponse(id, { resources });
  }

  handleResourceRead(id, params) {
    const { uri } = params;

    switch (uri) {
      case 'file://test.txt':
        this.sendResponse(id, {
          contents: [{
            uri,
            mimeType: 'text/plain',
            text: 'This is a test file content.'
          }]
        });
        break;

      case 'file://data.json':
        this.sendResponse(id, {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              name: 'Test Data',
              version: '1.0.0',
              items: [1, 2, 3, 4, 5]
            }, null, 2)
          }]
        });
        break;

      default:
        this.sendError(id, -32602, `Resource not found: ${uri}`);
    }
  }

  handlePing(id) {
    this.sendResponse(id, { pong: true, timestamp: new Date().toISOString() });
  }

  performMathOperation(args) {
    const { operation, a, b } = args;

    switch (operation) {
      case 'add':
        return a + b;
      case 'subtract':
        return a - b;
      case 'multiply':
        return a * b;
      case 'divide':
        if (b === 0) {
          throw new Error('Division by zero');
        }
        return a / b;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  sendResponse(id, result) {
    const response = {
      jsonrpc: '2.0',
      id,
      result
    };
    
    console.log(JSON.stringify(response));
  }

  sendError(id, code, message, data = null) {
    const response = {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message,
        ...(data && { data })
      }
    };
    
    console.log(JSON.stringify(response));
  }
}

// Start the mock server
new MockMCPServer();