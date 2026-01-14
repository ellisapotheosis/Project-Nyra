import { Router, Request, Response } from 'express';
import { MCPProxyService } from '../services/mcp-proxy';
import { createLogger } from '../utils/logger';

const logger = createLogger('mcp-route');
const router = Router();

// List all registered MCP servers
router.get('/servers', async (_req: Request, res: Response) => {
  try {
    const mcpProxy = MCPProxyService.getInstance();
    const servers = mcpProxy.getAllServers();

    res.json({
      servers: servers.map((s) => ({
        id: s.id,
        name: s.name,
        url: s.url,
        enabled: s.enabled,
        priority: s.priority,
        toolCount: s.tools?.length || 0,
        lastSync: s.lastSync,
      })),
      total: servers.length,
      enabled: servers.filter((s) => s.enabled).length,
    });
  } catch (error) {
    logger.error('Error listing MCP servers:', error);
    res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : 'Failed to list servers',
        type: 'server_error',
      },
    });
  }
});

// List all available tools across all MCP servers
router.get('/tools', async (req: Request, res: Response) => {
  try {
    const mcpProxy = MCPProxyService.getInstance();
    const serverId = req.query.server as string | undefined;

    const tools = serverId
      ? mcpProxy.getServerTools(serverId)
      : mcpProxy.getAllTools();

    res.json({
      tools: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        server: tool.server,
        inputSchema: tool.inputSchema,
      })),
      total: tools.length,
      server: serverId || 'all',
    });
  } catch (error) {
    logger.error('Error listing MCP tools:', error);
    res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : 'Failed to list tools',
        type: 'server_error',
      },
    });
  }
});

// Fuzzy search tools across all MCP servers
router.get('/tools/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!query) {
      res.status(400).json({
        error: {
          message: 'Query parameter "q" is required',
          type: 'invalid_request_error',
        },
      });
      return;
    }

    const mcpProxy = MCPProxyService.getInstance();
    const results = mcpProxy.fuzzySearchTools(query, limit);

    logger.info(`Fuzzy search for "${query}" returned ${results.length} results`);

    res.json({
      query,
      results: results.map((r) => ({
        tool: {
          name: r.tool.name,
          description: r.tool.description,
          server: r.tool.server,
          inputSchema: r.tool.inputSchema,
        },
        score: r.score,
        matches: r.matches,
      })),
      total: results.length,
    });
  } catch (error) {
    logger.error('Error searching MCP tools:', error);
    res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : 'Search failed',
        type: 'server_error',
      },
    });
  }
});

// Call a tool on an MCP server
router.post('/tools/call', async (req: Request, res: Response): Promise<void> => {
  try {
    const { tool, params } = req.body;

    if (!tool) {
      res.status(400).json({
        error: {
          message: 'Tool name is required',
          type: 'invalid_request_error',
        },
      });
      return;
    }

    const mcpProxy = MCPProxyService.getInstance();
    const result = await mcpProxy.callTool(tool, params || {});

    res.json({
      tool,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error calling MCP tool:', error);
    res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : 'Tool call failed',
        type: 'server_error',
      },
    });
  }
});

// Proxy a raw MCP request to a specific server
router.post('/proxy/:serverId', async (req: Request, res: Response): Promise<void> => {
  try {
    const serverId = req.params.serverId;
    const mcpRequest = req.body;

    if (!mcpRequest.method) {
      res.status(400).json({
        error: {
          message: 'MCP method is required',
          type: 'invalid_request_error',
        },
      });
      return;
    }

    const mcpProxy = MCPProxyService.getInstance();
    const response = await mcpProxy.proxyRequest(serverId, mcpRequest);

    if (response.error) {
      res.status(400).json({
        jsonrpc: '2.0',
        error: response.error,
        id: mcpRequest.id || null,
      });
      return;
    }

    res.json({
      jsonrpc: '2.0',
      result: response.result,
      id: mcpRequest.id || null,
    });
  } catch (error) {
    logger.error('Error proxying MCP request:', error);
    res.status(500).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: error instanceof Error ? error.message : 'Proxy failed',
      },
      id: req.body.id || null,
    });
  }
});

// Get MCP metrics
router.get('/metrics', async (_req: Request, res: Response) => {
  try {
    const mcpProxy = MCPProxyService.getInstance();
    const metrics = await mcpProxy.getMetrics();

    res.json({
      mcp: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error getting MCP metrics:', error);
    res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : 'Failed to get metrics',
        type: 'server_error',
      },
    });
  }
});

export { router as mcpRouter };
