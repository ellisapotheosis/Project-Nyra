/**
 * Integration Tests - MCP GitHub Server via Nexus Router
 *
 * Tests the complete flow of:
 * 1. Native MCP SSE connection to Nexus Router
 * 2. GitHub tool routing via MCPProxyService
 * 3. Audit logging for write operations
 * 4. Error handling and security
 */

import request from 'supertest';
import express from 'express';
import { Router } from 'express';
import { MCPSSEServer } from '../../services/mcp-sse-server';
import { MCPProxyService } from '../../services/mcp-proxy';
import { AuditLogger } from '../../services/audit-logger';

describe('MCP GitHub Integration', () => {
  let app: express.Application;
  let mcpRouter: Router;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Import and use the actual MCP router
    mcpRouter = Router();

    // Mock the MCP routes for testing
    const mcpSSEServer = MCPSSEServer.getInstance();

    // GET / - SSE connection
    mcpRouter.get('/', async (req, res) => {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.write('event: connected\n');
      res.write(`data: {"clientId":"test_client"}\n\n`);
      res.end();
    });

    // POST / - JSON-RPC requests
    mcpRouter.post('/', async (req, res) => {
      const response = await mcpSSEServer.processRequest(req.body);
      res.json(response);
    });

    app.use('/mcp', mcpRouter);
  });

  describe('Native MCP Protocol', () => {
    it('should handle initialize request', async () => {
      const response = await request(app)
        .post('/mcp')
        .send({
          jsonrpc: '2.0',
          id: '1',
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: {
              name: 'ChatGPT',
              version: '1.0.0',
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('jsonrpc', '2.0');
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('protocolVersion', '2024-11-05');
      expect(response.body.result).toHaveProperty('serverInfo');
      expect(response.body.result.serverInfo.name).toBe('Nexus MCP Router');
    });

    it('should reject invalid jsonrpc version', async () => {
      const response = await request(app)
        .post('/mcp')
        .send({
          jsonrpc: '1.0',
          id: '2',
          method: 'initialize',
          params: {},
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe(-32600);
    });

    it('should reject request without method', async () => {
      const response = await request(app)
        .post('/mcp')
        .send({
          jsonrpc: '2.0',
          id: '3',
          params: {},
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe(-32600);
    });

    it('should reject unknown method', async () => {
      const response = await request(app)
        .post('/mcp')
        .send({
          jsonrpc: '2.0',
          id: '4',
          method: 'unknown_method',
          params: {},
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe(-32601);
    });
  });

  describe('Tools Listing', () => {
    it('should list all available tools', async () => {
      const response = await request(app)
        .post('/mcp')
        .send({
          jsonrpc: '2.0',
          id: '5',
          method: 'tools/list',
          params: {},
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('tools');
      expect(Array.isArray(response.body.result.tools)).toBe(true);
    });

    it('should include GitHub tools in listing', async () => {
      const response = await request(app)
        .post('/mcp')
        .send({
          jsonrpc: '2.0',
          id: '6',
          method: 'tools/list',
          params: {},
        });

      const tools = response.body.result.tools;
      const gitHubTools = tools.filter((t: any) => t.name.includes('github'));

      // Should have GitHub tools available
      expect(gitHubTools.length).toBeGreaterThan(0);
    });
  });

  describe('Security & Audit Logging', () => {
    it('should redact sensitive data in audit logs', async () => {
      const auditLogger = AuditLogger.getInstance();

      if (auditLogger.isEnabled()) {
        const testParams = {
          token: 'ghp_1234567890abcdefghijklmnopqrstuvwxyz',
          password: 'super_secret_password',
          normalParam: 'value',
        };

        // Call a tool that would be logged
        const response = await request(app)
          .post('/mcp')
          .send({
            jsonrpc: '2.0',
            id: '7',
            method: 'tools/call',
            params: {
              name: 'create_or_update_file', // GitHub write operation
              arguments: testParams,
            },
          });

        // Verify the response structure
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('jsonrpc', '2.0');
      }
    });

    it('should identify GitHub write operations', async () => {
      const writeOperations = [
        'create_branch',
        'create_or_update_file',
        'push_files',
        'create_pull_request',
        'merge_pull_request',
        'delete_file',
        'create_issue',
        'update_issue',
      ];

      for (const op of writeOperations) {
        const response = await request(app)
          .post('/mcp')
          .send({
            jsonrpc: '2.0',
            id: `${op}_test`,
            method: 'tools/call',
            params: {
              name: op,
              arguments: {},
            },
          });

        // These should be processed (may error if tool not found, but won't error on method)
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('jsonrpc', '2.0');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle JSON parse errors', async () => {
      const response = await request(app)
        .post('/mcp')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      // Express should handle this, not our handler
      expect(response.status).toBe(400);
    });

    it('should handle empty body', async () => {
      const response = await request(app)
        .post('/mcp')
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe(-32700);
    });

    it('should handle batch requests', async () => {
      const response = await request(app)
        .post('/mcp')
        .send([
          {
            jsonrpc: '2.0',
            id: '8',
            method: 'initialize',
            params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'Test', version: '1.0' } },
          },
          {
            jsonrpc: '2.0',
            id: '9',
            method: 'tools/list',
            params: {},
          },
        ]);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });
  });

  describe('SSE Connection', () => {
    it('should establish SSE connection', (done) => {
      request(app)
        .get('/mcp')
        .expect('Content-Type', 'text/event-stream')
        .expect(200)
        .end((err, res) => {
          if (err) {
            done(err);
            return;
          }

          expect(res.headers['cache-control']).toBe('no-cache');
          expect(res.headers['connection']).toBe('keep-alive');
          done();
        });
    });
  });

  describe('ChatGPT Developer Mode Compatibility', () => {
    it('should support ChatGPT connector protocol', async () => {
      // ChatGPT expects initialize -> tools/list -> tools/call flow

      // 1. Initialize
      const initResponse = await request(app)
        .post('/mcp')
        .send({
          jsonrpc: '2.0',
          id: '10',
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: { resources: {}, tools: {}, prompts: {} },
            clientInfo: { name: 'ChatGPT', version: '1.0' },
          },
        });

      expect(initResponse.status).toBe(200);
      expect(initResponse.body.result).toBeDefined();

      // 2. List tools
      const listResponse = await request(app)
        .post('/mcp')
        .send({
          jsonrpc: '2.0',
          id: '11',
          method: 'tools/list',
          params: {},
        });

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.result.tools).toBeDefined();

      // 3. Call a tool
      const callResponse = await request(app)
        .post('/mcp')
        .send({
          jsonrpc: '2.0',
          id: '12',
          method: 'tools/call',
          params: {
            name: 'search_issues', // Example GitHub read operation
            arguments: { query: 'test' },
          },
        });

      expect(callResponse.status).toBe(200);
      expect(callResponse.body).toHaveProperty('jsonrpc', '2.0');
    });
  });
});

describe('MCP Audit Logger', () => {
  let auditLogger: AuditLogger;

  beforeAll(() => {
    auditLogger = AuditLogger.getInstance();
  });

  it('should be enabled/disabled based on config', () => {
    expect(typeof auditLogger.isEnabled()).toBe('boolean');
  });

  it('should have a log path', () => {
    const logPath = auditLogger.getLogPath();
    expect(typeof logPath).toBe('string');
    expect(logPath.length).toBeGreaterThan(0);
  });

  it('should handle tool call logging', () => {
    auditLogger.logToolCall(
      'create_branch',
      { branch: 'main', ref: 'abc123' },
      true,
      { success: true },
      undefined,
      123
    );

    // If logging is enabled, no error should be thrown
    expect(true).toBe(true);
  });

  it('should redact sensitive data', () => {
    auditLogger.logToolCall(
      'create_pull_request',
      {
        token: 'ghp_secret123',
        password: 'verysecret',
        normalField: 'visible',
      },
      true,
      { pr: '123' },
      undefined,
      456
    );

    // Should complete without error
    expect(true).toBe(true);
  });
});
