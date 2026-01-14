/**
 * Unit Tests for MCP Proxy Service
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { MockMcpServer } from '../../mocks/services';
import { createMockMcpRequest, createMockMcpResponse } from '../../mocks/factories';

describe('MCP Proxy Service', () => {
  let mcpServer: MockMcpServer;

  beforeEach(() => {
    mcpServer = new MockMcpServer();
  });

  describe('Tool Registration', () => {
    it('should register tools correctly', () => {
      const handler = jest.fn(async (args) => ({ result: 'success' }));

      mcpServer.registerTool('test-tool', handler);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should allow multiple tool registrations', () => {
      mcpServer.registerTool('tool-1', jest.fn());
      mcpServer.registerTool('tool-2', jest.fn());
      mcpServer.registerTool('tool-3', jest.fn());

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('Request Handling', () => {
    it('should handle tool call requests', async () => {
      const handler = jest.fn(async (args) => ({
        result: `Processed: ${args.input}`
      }));

      mcpServer.registerTool('process-data', handler);

      const request = createMockMcpRequest({
        params: {
          name: 'process-data',
          arguments: { input: 'test data' },
        },
      });

      const response = await mcpServer.handleRequest(request);

      expect(handler).toHaveBeenCalledWith({ input: 'test data' });
      expect(response.result.content[0].text).toContain('Processed: test data');
    });

    it('should return error for unknown tools', async () => {
      const request = createMockMcpRequest({
        params: {
          name: 'unknown-tool',
          arguments: {},
        },
      });

      await expect(mcpServer.handleRequest(request)).rejects.toThrow('Tool not found');
    });

    it('should handle tools with complex arguments', async () => {
      const handler = jest.fn(async (args) => ({
        sum: args.numbers.reduce((a: number, b: number) => a + b, 0),
        count: args.numbers.length,
      }));

      mcpServer.registerTool('calculate-sum', handler);

      const request = createMockMcpRequest({
        params: {
          name: 'calculate-sum',
          arguments: {
            numbers: [1, 2, 3, 4, 5],
          },
        },
      });

      const response = await mcpServer.handleRequest(request);
      const result = JSON.parse(response.result.content[0].text);

      expect(result.sum).toBe(15);
      expect(result.count).toBe(5);
    });

    it('should handle async tool execution', async () => {
      const handler = jest.fn(async (args) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return { delayed: true };
      });

      mcpServer.registerTool('async-tool', handler);

      const request = createMockMcpRequest({
        params: {
          name: 'async-tool',
          arguments: {},
        },
      });

      const startTime = Date.now();
      const response = await mcpServer.handleRequest(request);
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(10);
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Tool Discovery', () => {
    it('should support fuzzy tool name matching', () => {
      const tools = [
        { name: 'read_file', description: 'Read a file from disk' },
        { name: 'write_file', description: 'Write data to a file' },
        { name: 'delete_file', description: 'Delete a file' },
        { name: 'list_files', description: 'List files in directory' },
      ];

      const matches = fuzzySearchTools(tools, 'file read');

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].name).toBe('read_file');
    });

    it('should rank results by relevance', () => {
      const tools = [
        { name: 'read_file', description: 'Read a file from disk' },
        { name: 'file_metadata', description: 'Get file metadata' },
        { name: 'database_read', description: 'Read from database' },
      ];

      const matches = fuzzySearchTools(tools, 'read file');

      expect(matches[0].name).toBe('read_file');
      expect(matches[0].score).toBeGreaterThan(matches[1].score);
    });

    it('should handle empty search queries', () => {
      const tools = [
        { name: 'tool1', description: 'Tool 1' },
        { name: 'tool2', description: 'Tool 2' },
      ];

      const matches = fuzzySearchTools(tools, '');

      expect(matches.length).toBe(tools.length);
    });
  });

  describe('Server Aggregation', () => {
    it('should aggregate tools from multiple servers', () => {
      const servers = [
        {
          id: 'filesystem',
          tools: [
            { name: 'read_file' },
            { name: 'write_file' },
          ],
        },
        {
          id: 'memory',
          tools: [
            { name: 'store_data' },
            { name: 'retrieve_data' },
          ],
        },
      ];

      const aggregated = aggregateTools(servers);

      expect(aggregated.length).toBe(4);
      expect(aggregated.map(t => t.name)).toContain('read_file');
      expect(aggregated.map(t => t.name)).toContain('store_data');
    });

    it('should handle duplicate tool names across servers', () => {
      const servers = [
        {
          id: 'server1',
          tools: [{ name: 'search' }],
        },
        {
          id: 'server2',
          tools: [{ name: 'search' }],
        },
      ];

      const aggregated = aggregateTools(servers);

      expect(aggregated.length).toBe(2);
      expect(aggregated[0].server).not.toBe(aggregated[1].server);
    });
  });

  describe('Error Handling', () => {
    it('should handle tool execution errors', async () => {
      const handler = jest.fn(async () => {
        throw new Error('Tool execution failed');
      });

      mcpServer.registerTool('failing-tool', handler);

      const request = createMockMcpRequest({
        params: {
          name: 'failing-tool',
          arguments: {},
        },
      });

      await expect(mcpServer.handleRequest(request)).rejects.toThrow();
    });

    it('should validate request format', async () => {
      const invalidRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'invalid-method',
      };

      await expect(mcpServer.handleRequest(invalidRequest)).rejects.toThrow('Unknown method');
    });
  });

  describe('Caching', () => {
    it('should cache tool call results', async () => {
      let callCount = 0;

      const handler = jest.fn(async () => {
        callCount++;
        return { count: callCount };
      });

      mcpServer.registerTool('cached-tool', handler);

      const request = createMockMcpRequest({
        params: {
          name: 'cached-tool',
          arguments: { key: 'test' },
        },
      });

      // First call
      await mcpServer.handleRequest(request);

      // Second call (should use cache)
      await mcpServer.handleRequest(request);

      // Handler should only be called once
      expect(callCount).toBe(1);
    });
  });
});

// Helper functions
function fuzzySearchTools(tools: any[], query: string): any[] {
  if (!query) return tools;

  const lowerQuery = query.toLowerCase();

  return tools
    .map(tool => {
      const nameMatch = tool.name.toLowerCase().includes(lowerQuery);
      const descMatch = tool.description?.toLowerCase().includes(lowerQuery);

      let score = 0;
      if (nameMatch) score += 2;
      if (descMatch) score += 1;

      return { ...tool, score };
    })
    .filter(tool => tool.score > 0)
    .sort((a, b) => b.score - a.score);
}

function aggregateTools(servers: any[]): any[] {
  return servers.flatMap(server =>
    server.tools.map((tool: any) => ({
      ...tool,
      server: server.id,
    }))
  );
}
