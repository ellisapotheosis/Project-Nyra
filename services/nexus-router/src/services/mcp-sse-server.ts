/**
 * MCP SSE Server - Native JSON-RPC 2.0 MCP Protocol over Server-Sent Events
 *
 * Exposes native MCP protocol (initialize, list_tools, call_tool) via SSE transport.
 * Compatible with ChatGPT Developer Mode and standard MCP clients.
 */

import { Request, Response } from 'express';
import { MCPProxyService, MCPTool } from './mcp-proxy';
import { AuditLogger } from './audit-logger';
import { createLogger } from '../utils/logger';

const logger = createLogger('mcp-sse-server');

export interface MCPInitializeRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: 'initialize';
  params: {
    protocolVersion: string;
    capabilities: Record<string, unknown>;
    clientInfo: {
      name: string;
      version: string;
    };
  };
}

export interface MCPInitializeResult {
  protocolVersion: string;
  capabilities: Record<string, unknown>;
  serverInfo: {
    name: string;
    version: string;
  };
}

export interface MCPToolsListRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: 'tools/list';
  params?: Record<string, unknown>;
}

export interface MCPToolsListResult {
  tools: MCPTool[];
}

export interface MCPCallToolRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: 'tools/call';
  params: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

export interface MCPErrorResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface MCPSuccessResponse {
  jsonrpc: '2.0';
  id: string | number;
  result: unknown;
}

export type MCPResponse = MCPSuccessResponse | MCPErrorResponse;

export class MCPSSEServer {
  private static instance: MCPSSEServer;
  private mcpProxy: MCPProxyService;
  private requestIdCounter: number = 0;

  private constructor() {
    this.mcpProxy = MCPProxyService.getInstance();
  }

  public static getInstance(): MCPSSEServer {
    if (!MCPSSEServer.instance) {
      MCPSSEServer.instance = new MCPSSEServer();
    }
    return MCPSSEServer.instance;
  }

  /**
   * Handle SSE connection for native MCP protocol
   */
  public async handleSSEConnection(req: Request, res: Response): Promise<void> {
    try {
      const clientId = this.generateClientId();

      logger.info(`MCP SSE client connected: ${clientId}`);

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      // Send connection acknowledgment
      this.sendSSEEvent(res, 'connected', {
        clientId,
        serverName: 'Nexus MCP Router',
        serverVersion: '1.0.0',
        supportedMethods: ['initialize', 'tools/list', 'tools/call'],
      });

      // Keep connection alive with heartbeat
      const heartbeatInterval = setInterval(() => {
        if (!res.writableEnded) {
          this.sendSSEEvent(res, 'heartbeat', { timestamp: new Date().toISOString() });
        } else {
          clearInterval(heartbeatInterval);
        }
      }, 30000); // 30 second heartbeat

      // Handle client disconnect
      req.on('close', () => {
        logger.info(`MCP SSE client disconnected: ${clientId}`);
        clearInterval(heartbeatInterval);
        res.end();
      });

      req.on('error', (error) => {
        logger.error(`MCP SSE client error: ${clientId}`, error);
        clearInterval(heartbeatInterval);
        res.end();
      });

      // Handle incoming MCP requests (via POST to same endpoint with request body)
      // This is handled by a separate POST handler that uses this class's processRequest method
    } catch (error) {
      logger.error('Error handling MCP SSE connection:', error);
      res.status(500).json({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32000,
          message: error instanceof Error ? error.message : 'Internal server error',
        },
      });
    }
  }

  /**
   * Process incoming MCP JSON-RPC request
   */
  public async processRequest(request: any): Promise<MCPResponse> {
    try {
      // Validate JSON-RPC 2.0 format
      if (!request.jsonrpc || request.jsonrpc !== '2.0') {
        return this.createErrorResponse(request.id, -32600, 'Invalid Request: jsonrpc must be "2.0"');
      }

      if (!request.method) {
        return this.createErrorResponse(request.id, -32600, 'Invalid Request: method is required');
      }

      const id = request.id;
      const method = request.method;
      const params = request.params || {};

      logger.debug(`MCP request: ${method} (id: ${id})`);

      // Route to appropriate handler
      switch (method) {
        case 'initialize':
          return this.handleInitialize(id, params);

        case 'tools/list':
          return this.handleToolsList(id, params);

        case 'tools/call':
          return this.handleToolsCall(id, params);

        default:
          return this.createErrorResponse(id, -32601, `Method not found: ${method}`);
      }
    } catch (error) {
      logger.error('Error processing MCP request:', error);
      return this.createErrorResponse(
        request.id || null,
        -32000,
        error instanceof Error ? error.message : 'Internal server error'
      );
    }
  }

  /**
   * Handle initialize method
   */
  private async handleInitialize(
    id: string | number,
    params: Record<string, unknown>
  ): Promise<MCPSuccessResponse> {
    logger.debug(`Initialize request from ${(params.clientInfo as any)?.name || 'unknown'}`);

    const result: MCPInitializeResult = {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
      serverInfo: {
        name: 'Nexus MCP Router',
        version: '1.0.0',
      },
    };

    return {
      jsonrpc: '2.0',
      id,
      result,
    };
  }

  /**
   * Handle tools/list method
   */
  private async handleToolsList(
    id: string | number,
    _params: Record<string, unknown>
  ): Promise<MCPSuccessResponse | MCPErrorResponse> {
    try {
      const tools = this.mcpProxy.getAllTools();

      const result: MCPToolsListResult = {
        tools: tools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
          server: tool.server,
        })),
      };

      logger.debug(`Listing ${tools.length} tools`);

      return {
        jsonrpc: '2.0',
        id,
        result,
      };
    } catch (error) {
      logger.error('Error listing tools:', error);
      return this.createErrorResponse(
        id,
        -32000,
        error instanceof Error ? error.message : 'Failed to list tools'
      );
    }
  }

  /**
   * Handle tools/call method
   */
  private async handleToolsCall(
    id: string | number,
    params: Record<string, unknown>
  ): Promise<MCPSuccessResponse | MCPErrorResponse> {
    try {
      const toolName = params.name as string;
      const toolArgs = params.arguments as Record<string, unknown>;

      if (!toolName) {
        return this.createErrorResponse(id, -32602, 'Invalid params: name is required');
      }

      logger.info(`Calling tool: ${toolName}`);

      // Record start time for duration tracking
      const startTime = Date.now();
      let success = false;
      let result: any;

      try {
        // Call the tool via MCPProxyService
        result = await this.mcpProxy.callTool(toolName, toolArgs);
        success = true;
      } catch (callError) {
        // Log the error but re-throw it for the caller
        const duration = Date.now() - startTime;

        // Log to audit file if it's a GitHub operation
        if (this.isGitHubWriteOperation(toolName)) {
          AuditLogger.getInstance().logToolCall(
            toolName,
            toolArgs,
            false,
            undefined,
            callError instanceof Error ? callError.message : String(callError),
            duration
          );
        }
        throw callError;
      }

      // Log GitHub write operations for audit
      if (this.isGitHubWriteOperation(toolName)) {
        const duration = Date.now() - startTime;
        AuditLogger.getInstance().logToolCall(
          toolName,
          toolArgs,
          success,
          result,
          undefined,
          duration
        );
      }

      return {
        jsonrpc: '2.0',
        id,
        result,
      };
    } catch (error) {
      logger.error('Error calling tool:', error);
      return this.createErrorResponse(
        id,
        -32000,
        error instanceof Error ? error.message : 'Tool call failed'
      );
    }
  }

  /**
   * Check if operation is a GitHub write operation (for audit logging)
   */
  private isGitHubWriteOperation(toolName: string): boolean {
    const writeOps = [
      'create_branch',
      'create_or_update_file',
      'push_files',
      'create_pull_request',
      'add_comment_to_pending_review',
      'pull_request_review_write',
      'merge_pull_request',
      'update_pull_request',
      'delete_file',
      'create_issue',
      'update_issue',
      'add_issue_comment',
    ];

    return writeOps.some((op) => toolName.includes(op));
  }

  /**
   * Redact sensitive data from parameters (tokens, passwords, etc.)
   */
  private redactSensitiveData(params: Record<string, unknown>): Record<string, unknown> {
    const redacted = { ...params };
    const sensitiveKeys = ['token', 'password', 'secret', 'auth', 'key'];

    for (const [key, value] of Object.entries(redacted)) {
      if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
        redacted[key] = '[REDACTED]';
      }
    }

    return redacted;
  }

  /**
   * Create error response
   */
  private createErrorResponse(
    id: string | number | null,
    code: number,
    message: string,
    data?: unknown
  ): MCPErrorResponse {
    return {
      jsonrpc: '2.0',
      id: id || null,
      error: {
        code,
        message,
        ...(data && { data }),
      },
    };
  }

  /**
   * Send SSE event
   */
  private sendSSEEvent(res: Response, eventType: string, data: any): void {
    try {
      const event = `event: ${eventType}\n`;
      const dataLine = `data: ${JSON.stringify(data)}\n\n`;
      res.write(event + dataLine);
    } catch (error) {
      logger.error('Error sending SSE event:', error);
    }
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    this.requestIdCounter++;
    return `client_${Date.now()}_${this.requestIdCounter}`;
  }
}
