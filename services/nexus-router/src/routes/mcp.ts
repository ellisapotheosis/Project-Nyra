import { Router, Request, Response } from "express";
import { MCPProxyService } from "../services/mcp-proxy";
import { createLogger } from "../utils/logger";

const logger = createLogger("mcp-route");
const router = Router();

// List all registered MCP servers
router.get("/servers", async (_req: Request, res: Response) => {
  try {
    const mcpProxy = MCPProxyService.getInstance();
    const servers = mcpProxy.getAllServers();

    res.json({
      servers: servers.map((s) => ({
        id: s.id,
        name: s.name,
        protocol: s.protocol,
        config: s.config,
        auth: s.auth ? { type: s.auth.type } : undefined,
        enabled: s.enabled,
        priority: s.priority,
        status: s.status,
        errorMessage: s.errorMessage,
        toolCount: s.tools?.length || 0,
        lastSync: s.lastSync,
      })),
      total: servers.length,
      enabled: servers.filter((s) => s.enabled).length,
    });
  } catch (error) {
    logger.error("Error listing MCP servers:", error);
    res.status(500).json({
      error: {
        message:
          error instanceof Error ? error.message : "Failed to list servers",
        type: "server_error",
      },
    });
  }
});

// Add a new MCP server
router.post("/servers", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      id,
      name,
      protocol,
      config,
      auth,
      enabled = true,
      priority = 10,
    } = req.body;

    // Validation
    if (!id || !name || !protocol || !config) {
      res.status(400).json({
        error: {
          message: "Missing required fields: id, name, protocol, config",
          type: "invalid_request_error",
        },
      });
      return;
    }

    if (!["stdio", "sse", "http"].includes(protocol)) {
      res.status(400).json({
        error: {
          message: "Invalid protocol. Must be: stdio, sse, or http",
          type: "invalid_request_error",
        },
      });
      return;
    }

    const mcpProxy = MCPProxyService.getInstance();
    const existingServers = mcpProxy.getAllServers();
    if (existingServers.find((s) => s.id === id)) {
      res.status(409).json({
        error: {
          message: `Server with id '${id}' already exists`,
          type: "conflict_error",
        },
      });
      return;
    }

    const newServer = {
      id,
      name,
      protocol,
      config,
      auth,
      enabled,
      priority,
    };

    await mcpProxy.registerServer(newServer);

    res.status(201).json({
      server: {
        ...newServer,
        status: "connected",
      },
      message: `MCP server '${name}' registered successfully`,
    });
  } catch (error) {
    logger.error("Error adding MCP server:", error);
    res.status(500).json({
      error: {
        message:
          error instanceof Error ? error.message : "Failed to add server",
        type: "server_error",
      },
    });
  }
});

// Update an existing MCP server
router.patch(
  "/servers/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const serverId = String(req.params.id);
      const updates = req.body;

      const mcpProxy = MCPProxyService.getInstance();
      const updatedServer = await mcpProxy.updateServer(serverId, updates);

      res.json({
        server: {
          id: updatedServer.id,
          name: updatedServer.name,
          protocol: updatedServer.protocol,
          config: updatedServer.config,
          auth: updatedServer.auth
            ? { type: updatedServer.auth.type }
            : undefined,
          enabled: updatedServer.enabled,
          priority: updatedServer.priority,
          status: updatedServer.status,
          errorMessage: updatedServer.errorMessage,
        },
        message: `Server '${serverId}' updated successfully`,
      });
    } catch (error) {
      logger.error("Error updating MCP server:", error);
      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;
      res.status(statusCode).json({
        error: {
          message:
            error instanceof Error ? error.message : "Failed to update server",
          type: statusCode === 404 ? "not_found_error" : "server_error",
        },
      });
    }
  }
);

// Remove an MCP server
router.delete(
  "/servers/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const serverId = String(req.params.id);

      const mcpProxy = MCPProxyService.getInstance();
      await mcpProxy.unregisterServer(serverId);

      res.json({
        message: `Server '${serverId}' removed successfully`,
        id: serverId,
      });
    } catch (error) {
      logger.error("Error removing MCP server:", error);
      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;
      res.status(statusCode).json({
        error: {
          message:
            error instanceof Error ? error.message : "Failed to remove server",
          type: statusCode === 404 ? "not_found_error" : "server_error",
        },
      });
    }
  }
);

// Test connection to an MCP server
router.post(
  "/servers/:id/test",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const serverId = String(req.params.id);

      const mcpProxy = MCPProxyService.getInstance();
      const result = await mcpProxy.testConnection(serverId);

      res.json({
        serverId,
        ...result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Error testing MCP server connection:", error);
      res.status(500).json({
        error: {
          message:
            error instanceof Error ? error.message : "Connection test failed",
          type: "server_error",
        },
      });
    }
  }
);

// List all available tools across all MCP servers
router.get("/tools", async (req: Request, res: Response) => {
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
      server: serverId || "all",
    });
  } catch (error) {
    logger.error("Error listing MCP tools:", error);
    res.status(500).json({
      error: {
        message:
          error instanceof Error ? error.message : "Failed to list tools",
        type: "server_error",
      },
    });
  }
});

// Fuzzy search tools across all MCP servers
router.get(
  "/tools/search",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query) {
        res.status(400).json({
          error: {
            message: 'Query parameter "q" is required',
            type: "invalid_request_error",
          },
        });
        return;
      }

      const mcpProxy = MCPProxyService.getInstance();
      const results = mcpProxy.fuzzySearchTools(query, limit);

      logger.info(
        `Fuzzy search for "${query}" returned ${results.length} results`
      );

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
      logger.error("Error searching MCP tools:", error);
      res.status(500).json({
        error: {
          message: error instanceof Error ? error.message : "Search failed",
          type: "server_error",
        },
      });
    }
  }
);

// Call a tool on an MCP server
router.post(
  "/tools/call",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { tool, params } = req.body;

      if (!tool) {
        res.status(400).json({
          error: {
            message: "Tool name is required",
            type: "invalid_request_error",
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
      logger.error("Error calling MCP tool:", error);
      res.status(500).json({
        error: {
          message: error instanceof Error ? error.message : "Tool call failed",
          type: "server_error",
        },
      });
    }
  }
);

// Proxy a raw MCP request to a specific server
router.post(
  "/proxy/:serverId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const serverId = String(req.params.serverId);
      const mcpRequest = req.body;

      if (!mcpRequest.method) {
        res.status(400).json({
          error: {
            message: "MCP method is required",
            type: "invalid_request_error",
          },
        });
        return;
      }

      const mcpProxy = MCPProxyService.getInstance();
      const response = await mcpProxy.proxyRequest(serverId, mcpRequest);

      if (response.error) {
        res.status(400).json({
          jsonrpc: "2.0",
          error: response.error,
          id: mcpRequest.id || null,
        });
        return;
      }

      res.json({
        jsonrpc: "2.0",
        result: response.result,
        id: mcpRequest.id || null,
      });
    } catch (error) {
      logger.error("Error proxying MCP request:", error);
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: error instanceof Error ? error.message : "Proxy failed",
        },
        id: req.body.id || null,
      });
    }
  }
);

// Get MCP metrics
router.get("/metrics", async (_req: Request, res: Response) => {
  try {
    const mcpProxy = MCPProxyService.getInstance();
    const metrics = await mcpProxy.getMetrics();

    res.json({
      mcp: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Error getting MCP metrics:", error);
    res.status(500).json({
      error: {
        message:
          error instanceof Error ? error.message : "Failed to get metrics",
        type: "server_error",
      },
    });
  }
});

export { router as mcpRouter };
