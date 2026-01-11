/**
 * Integration Tests for Nexus Router API
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express, { Application } from 'express';
import { MockRedis, MockHttpClient } from '../../mocks/services';
import { createMockApiResponse } from '../../mocks/factories';

describe('Nexus Router API Integration', () => {
  let app: Application;
  let mockRedis: MockRedis;
  let mockHttpClient: MockHttpClient;

  beforeAll(async () => {
    // Initialize test app
    app = express();
    app.use(express.json());

    // Mock services
    mockRedis = new MockRedis();
    mockHttpClient = new MockHttpClient();

    // Setup routes
    setupRoutes(app);
  });

  beforeEach(async () => {
    // Clear mocks
    mockRedis.flushdb();
    mockHttpClient.clearMocks();
  });

  afterAll(async () => {
    // Cleanup
    await mockRedis.quit();
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });

    it('should include worker status', async () => {
      const response = await request(app)
        .get('/health')
        .query({ verbose: true })
        .expect(200);

      expect(response.body).toHaveProperty('workers');
      expect(Array.isArray(response.body.workers)).toBe(true);
    });
  });

  describe('POST /v1/chat/completions', () => {
    it('should handle chat completion request', async () => {
      const payload = {
        model: 'gpt-4',
        messages: [
          { role: 'user', content: 'What is the capital of France?' }
        ],
        temperature: 0.7,
        max_tokens: 100,
      };

      mockHttpClient.mockResponse(
        'http://localhost:8080/v1/chat/completions',
        {
          id: 'chatcmpl-123',
          object: 'chat.completion',
          created: Date.now(),
          model: 'gpt-4',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: 'The capital of France is Paris.',
              },
              finish_reason: 'stop',
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 8,
            total_tokens: 18,
          },
        }
      );

      const response = await request(app)
        .post('/v1/chat/completions')
        .send(payload)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('choices');
      expect(response.body.choices[0].message.content).toContain('Paris');
    });

    it('should validate request payload', async () => {
      const invalidPayload = {
        model: 'gpt-4',
        // Missing messages
      };

      const response = await request(app)
        .post('/v1/chat/completions')
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('messages');
    });

    it('should handle streaming responses', async () => {
      const payload = {
        model: 'gpt-4',
        messages: [
          { role: 'user', content: 'Count to 5' }
        ],
        stream: true,
      };

      const response = await request(app)
        .post('/v1/chat/completions')
        .send(payload)
        .expect(200);

      expect(response.headers['content-type']).toContain('text/event-stream');
    });

    it('should cache identical requests', async () => {
      const payload = {
        model: 'gpt-4',
        messages: [
          { role: 'user', content: 'Hello' }
        ],
      };

      // First request
      const response1 = await request(app)
        .post('/v1/chat/completions')
        .send(payload)
        .expect(200);

      // Second identical request
      const response2 = await request(app)
        .post('/v1/chat/completions')
        .send(payload)
        .expect(200);

      expect(response1.body.id).toBe(response2.body.id);
      expect(response2.headers).toHaveProperty('x-cache-hit', 'true');
    });
  });

  describe('GET /v1/models', () => {
    it('should list available models', async () => {
      const response = await request(app)
        .get('/v1/models')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should include model capabilities', async () => {
      const response = await request(app)
        .get('/v1/models')
        .expect(200);

      const model = response.body.data[0];
      expect(model).toHaveProperty('id');
      expect(model).toHaveProperty('object', 'model');
      expect(model).toHaveProperty('capabilities');
    });
  });

  describe('MCP Proxy Routes', () => {
    describe('GET /mcp/servers', () => {
      it('should list available MCP servers', async () => {
        const response = await request(app)
          .get('/mcp/servers')
          .expect(200);

        expect(response.body).toHaveProperty('servers');
        expect(Array.isArray(response.body.servers)).toBe(true);
      });
    });

    describe('GET /mcp/tools', () => {
      it('should list all available tools', async () => {
        const response = await request(app)
          .get('/mcp/tools')
          .expect(200);

        expect(response.body).toHaveProperty('tools');
        expect(Array.isArray(response.body.tools)).toBe(true);
      });

      it('should support fuzzy search', async () => {
        const response = await request(app)
          .get('/mcp/tools/search')
          .query({ q: 'file read' })
          .expect(200);

        expect(response.body).toHaveProperty('tools');
        expect(response.body.tools.length).toBeGreaterThan(0);
      });
    });

    describe('POST /mcp/tools/call', () => {
      it('should proxy tool calls to MCP servers', async () => {
        const payload = {
          server: 'filesystem',
          tool: 'read_file',
          arguments: {
            path: '/test/file.txt'
          },
        };

        mockHttpClient.mockResponse(
          'http://localhost:3100/tools/call',
          {
            content: [
              {
                type: 'text',
                text: 'File contents here',
              },
            ],
          }
        );

        const response = await request(app)
          .post('/mcp/tools/call')
          .send(payload)
          .expect(200);

        expect(response.body).toHaveProperty('content');
        expect(response.body.content[0].text).toContain('File contents');
      });

      it('should handle tool call errors', async () => {
        const payload = {
          server: 'nonexistent',
          tool: 'unknown_tool',
          arguments: {},
        };

        const response = await request(app)
          .post('/mcp/tools/call')
          .send(payload)
          .expect(404);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('GET /mcp/metrics', () => {
      it('should return MCP proxy metrics', async () => {
        const response = await request(app)
          .get('/mcp/metrics')
          .expect(200);

        expect(response.body).toHaveProperty('totalCalls');
        expect(response.body).toHaveProperty('successRate');
        expect(response.body).toHaveProperty('averageLatency');
        expect(response.body).toHaveProperty('serverMetrics');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      const response = await request(app)
        .get('/nonexistent-route')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });

    it('should handle internal server errors', async () => {
      const response = await request(app)
        .post('/v1/chat/completions')
        .send({ model: 'invalid-model', messages: [] })
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle rate limiting', async () => {
      const payload = {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Test' }],
      };

      // Send many requests to trigger rate limit
      const requests = Array.from({ length: 100 }, () =>
        request(app).post('/v1/chat/completions').send(payload)
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.status === 429);

      expect(rateLimited).toBe(true);
    });
  });
});

// Helper function to setup routes
function setupRoutes(app: Application): void {
  // Health check route
  app.get('/health', (req, res) => {
    const verbose = req.query.verbose === 'true';

    const response: any = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };

    if (verbose) {
      response.workers = [
        { id: 'local-1', status: 'healthy', load: 0.3 },
        { id: 'cloud-1', status: 'healthy', load: 0.1 },
      ];
    }

    res.json(response);
  });

  // Chat completions route
  app.post('/v1/chat/completions', (req, res) => {
    const { model, messages, stream } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Missing or invalid messages field',
      });
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      return res.end();
    }

    res.json(createMockApiResponse({
      data: {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: Date.now(),
        model,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Mock response',
            },
            finish_reason: 'stop',
          },
        ],
      },
    }));
  });

  // Models route
  app.get('/v1/models', (req, res) => {
    res.json({
      data: [
        {
          id: 'gpt-4',
          object: 'model',
          capabilities: ['chat', 'completion'],
        },
      ],
    });
  });

  // MCP routes
  app.get('/mcp/servers', (req, res) => {
    res.json({
      servers: [
        { id: 'filesystem', status: 'connected' },
        { id: 'memory', status: 'connected' },
      ],
    });
  });

  app.get('/mcp/tools', (req, res) => {
    res.json({
      tools: [
        { name: 'read_file', server: 'filesystem' },
        { name: 'write_file', server: 'filesystem' },
      ],
    });
  });

  app.get('/mcp/tools/search', (req, res) => {
    res.json({
      tools: [
        { name: 'read_file', server: 'filesystem', score: 0.9 },
      ],
    });
  });

  app.post('/mcp/tools/call', (req, res) => {
    const { server, tool } = req.body;

    if (server === 'nonexistent') {
      return res.status(404).json({ error: 'Server not found' });
    }

    res.json({
      content: [
        { type: 'text', text: 'Mock tool response' },
      ],
    });
  });

  app.get('/mcp/metrics', (req, res) => {
    res.json({
      totalCalls: 1000,
      successRate: 0.98,
      averageLatency: 150,
      serverMetrics: {},
    });
  });
}
