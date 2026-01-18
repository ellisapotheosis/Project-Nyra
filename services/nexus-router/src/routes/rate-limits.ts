import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  RateLimitStore,
  RateLimitConfig,
  ServerRateLimit,
  ToolRateLimit,
} from '../services/rate-limit-store';
import { createLogger } from '../utils/logger';

const logger = createLogger('rate-limits-route');
const router = Router();
const store = RateLimitStore.getInstance();

/**
 * Validation schemas
 */
const GlobalRateLimitSchema = z.object({
  enabled: z.boolean().optional(),
  windowMs: z.number().min(1000).optional(),
  maxRequests: z.number().min(1).optional(),
  message: z.string().optional(),
  backend: z.enum(['memory', 'redis']).optional(),
});

const PerIpRateLimitSchema = z.object({
  enabled: z.boolean().optional(),
  windowMs: z.number().min(1000).optional(),
  maxRequests: z.number().min(1).optional(),
  skipSuccessfulRequests: z.boolean().optional(),
  skipFailedRequests: z.boolean().optional(),
  excludeIps: z.array(z.string()).optional(),
});

const ServerRateLimitSchema = z.object({
  serverId: z.string().min(1),
  enabled: z.boolean(),
  windowMs: z.number().min(1000),
  maxRequests: z.number().min(1),
  priority: z.number().int().min(1).max(100).optional().default(50),
});

const ToolRateLimitSchema = z.object({
  toolId: z.string().min(1),
  enabled: z.boolean(),
  windowMs: z.number().min(1000),
  maxRequests: z.number().min(1),
  costWeight: z.number().min(0.1).max(10).optional().default(1),
});

const UpdateRateLimitSchema = z.object({
  global: GlobalRateLimitSchema.optional(),
  perIp: PerIpRateLimitSchema.optional(),
  perServer: z.record(ServerRateLimitSchema).optional(),
  perTool: z.record(ToolRateLimitSchema).optional(),
  redis: z
    .object({
      enabled: z.boolean().optional(),
      cluster: z.array(z.string()).optional(),
    })
    .optional(),
});

/**
 * GET /api/rate-limits
 * Get all rate limit configurations
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const config = store.getConfig();

    res.json({
      status: 'success',
      data: {
        global: config.global,
        perIp: config.perIp,
        perServer: config.perServer,
        perTool: config.perTool,
        redis: config.redis,
      },
      metadata: {
        totalServerLimits: Object.keys(config.perServer).length,
        totalToolLimits: Object.keys(config.perTool).length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error fetching rate limit config:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch rate limit configuration',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/rate-limits/global
 * Get global rate limit configuration
 */
router.get('/global', async (_req: Request, res: Response) => {
  try {
    const config = store.getConfig();

    res.json({
      status: 'success',
      data: config.global,
      metadata: {
        description: 'System-wide rate limiting configuration',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error fetching global rate limit:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch global rate limit configuration',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/rate-limits/per-ip
 * Get per-IP rate limit configuration
 */
router.get('/per-ip', async (_req: Request, res: Response) => {
  try {
    const config = store.getConfig();

    res.json({
      status: 'success',
      data: config.perIp,
      metadata: {
        description: 'Per-IP client rate limiting configuration',
        excludedIps: config.perIp.excludeIps,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error fetching per-IP rate limit:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch per-IP rate limit configuration',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/rate-limits/per-server
 * Get all per-server rate limits
 */
router.get('/per-server', async (_req: Request, res: Response) => {
  try {
    const config = store.getConfig();

    res.json({
      status: 'success',
      data: config.perServer,
      metadata: {
        description: 'MCP server-specific rate limiting configurations',
        totalServers: Object.keys(config.perServer).length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error fetching per-server rate limits:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch per-server rate limit configurations',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/rate-limits/per-server/:serverId
 * Get specific server rate limit
 */
router.get('/per-server/:serverId', async (req: Request, res: Response) => {
  try {
    const { serverId } = req.params;
    const config = store.getConfig();

    const serverLimit = config.perServer[serverId];
    if (!serverLimit) {
      return res.status(404).json({
        status: 'error',
        message: `No rate limit configuration found for server: ${serverId}`,
      });
    }

    res.json({
      status: 'success',
      data: serverLimit,
      metadata: {
        serverId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error fetching server rate limit:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch server rate limit configuration',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/rate-limits/per-tool
 * Get all per-tool rate limits
 */
router.get('/per-tool', async (_req: Request, res: Response) => {
  try {
    const config = store.getConfig();

    res.json({
      status: 'success',
      data: config.perTool,
      metadata: {
        description: 'Individual tool-specific rate limiting configurations',
        totalTools: Object.keys(config.perTool).length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error fetching per-tool rate limits:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch per-tool rate limit configurations',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/rate-limits/per-tool/:toolId
 * Get specific tool rate limit
 */
router.get('/per-tool/:toolId', async (req: Request, res: Response) => {
  try {
    const { toolId } = req.params;
    const config = store.getConfig();

    const toolLimit = config.perTool[toolId];
    if (!toolLimit) {
      return res.status(404).json({
        status: 'error',
        message: `No rate limit configuration found for tool: ${toolId}`,
      });
    }

    res.json({
      status: 'success',
      data: toolLimit,
      metadata: {
        toolId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error fetching tool rate limit:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch tool rate limit configuration',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PATCH /api/rate-limits
 * Update rate limit configurations
 */
router.patch('/', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = UpdateRateLimitSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid rate limit configuration',
        errors: validationResult.error.errors,
      });
    }

    const updates = validationResult.data as Partial<RateLimitConfig>;

    // Update configuration
    await store.updateConfig(updates);

    // Get updated config
    const config = store.getConfig();

    res.json({
      status: 'success',
      message: 'Rate limit configuration updated',
      data: {
        global: config.global,
        perIp: config.perIp,
        perServer: config.perServer,
        perTool: config.perTool,
        redis: config.redis,
      },
      metadata: {
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error updating rate limit config:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update rate limit configuration',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PATCH /api/rate-limits/global
 * Update global rate limit
 */
router.patch('/global', async (req: Request, res: Response) => {
  try {
    const validationResult = GlobalRateLimitSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid global rate limit configuration',
        errors: validationResult.error.errors,
      });
    }

    await store.updateConfig({ global: validationResult.data as any });
    const config = store.getConfig();

    res.json({
      status: 'success',
      message: 'Global rate limit configuration updated',
      data: config.global,
      metadata: {
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error updating global rate limit:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update global rate limit configuration',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PATCH /api/rate-limits/per-ip
 * Update per-IP rate limit
 */
router.patch('/per-ip', async (req: Request, res: Response) => {
  try {
    const validationResult = PerIpRateLimitSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid per-IP rate limit configuration',
        errors: validationResult.error.errors,
      });
    }

    await store.updateConfig({ perIp: validationResult.data as any });
    const config = store.getConfig();

    res.json({
      status: 'success',
      message: 'Per-IP rate limit configuration updated',
      data: config.perIp,
      metadata: {
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error updating per-IP rate limit:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update per-IP rate limit configuration',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/rate-limits/per-server
 * Add or update a server rate limit
 */
router.post('/per-server', async (req: Request, res: Response) => {
  try {
    const validationResult = ServerRateLimitSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid server rate limit configuration',
        errors: validationResult.error.errors,
      });
    }

    const serverLimit = validationResult.data as ServerRateLimit;
    await store.addServerLimit(serverLimit.serverId, serverLimit);

    res.status(201).json({
      status: 'success',
      message: `Rate limit added for server: ${serverLimit.serverId}`,
      data: serverLimit,
      metadata: {
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error adding server rate limit:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add server rate limit',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/rate-limits/per-server/:serverId
 * Remove server rate limit
 */
router.delete('/per-server/:serverId', async (req: Request, res: Response) => {
  try {
    const { serverId } = req.params;
    const config = store.getConfig();

    if (!config.perServer[serverId]) {
      return res.status(404).json({
        status: 'error',
        message: `No rate limit configuration found for server: ${serverId}`,
      });
    }

    await store.removeServerLimit(serverId);

    res.json({
      status: 'success',
      message: `Rate limit removed for server: ${serverId}`,
      metadata: {
        deletedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error removing server rate limit:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove server rate limit',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/rate-limits/per-tool
 * Add or update a tool rate limit
 */
router.post('/per-tool', async (req: Request, res: Response) => {
  try {
    const validationResult = ToolRateLimitSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid tool rate limit configuration',
        errors: validationResult.error.errors,
      });
    }

    const toolLimit = validationResult.data as ToolRateLimit;
    await store.addToolLimit(toolLimit.toolId, toolLimit);

    res.status(201).json({
      status: 'success',
      message: `Rate limit added for tool: ${toolLimit.toolId}`,
      data: toolLimit,
      metadata: {
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error adding tool rate limit:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add tool rate limit',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/rate-limits/per-tool/:toolId
 * Remove tool rate limit
 */
router.delete('/per-tool/:toolId', async (req: Request, res: Response) => {
  try {
    const { toolId } = req.params;
    const config = store.getConfig();

    if (!config.perTool[toolId]) {
      return res.status(404).json({
        status: 'error',
        message: `No rate limit configuration found for tool: ${toolId}`,
      });
    }

    await store.removeToolLimit(toolId);

    res.json({
      status: 'success',
      message: `Rate limit removed for tool: ${toolId}`,
      metadata: {
        deletedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error removing tool rate limit:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove tool rate limit',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/rate-limits/stats
 * Get current limit usage statistics
 */
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = store.getStats();

    res.json({
      status: 'success',
      data: stats,
      metadata: {
        description: 'Current rate limit usage statistics',
        refreshInterval: '5 seconds',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error fetching rate limit stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch rate limit statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/rate-limits/stats/global
 * Get global usage statistics
 */
router.get('/stats/global', async (_req: Request, res: Response) => {
  try {
    const stats = store.getStats();

    res.json({
      status: 'success',
      data: stats.global,
      metadata: {
        description: 'System-wide rate limit usage',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error fetching global stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch global statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/rate-limits/stats/per-ip
 * Get per-IP usage statistics
 */
router.get('/stats/per-ip', async (req: Request, res: Response) => {
  try {
    const stats = store.getStats();
    const { sort = 'requests' } = req.query;

    let data = Object.entries(stats.perIp).map(([ip, stat]) => ({
      ip,
      ...stat,
    }));

    // Sort by specified field
    if (sort === 'requests') {
      data.sort((a, b) => b.requests - a.requests);
    } else if (sort === 'blocked') {
      data.sort((a, b) => b.blockedRequests - a.blockedRequests);
    } else if (sort === 'utilization') {
      data.sort((a, b) => b.utilizationPercent - a.utilizationPercent);
    }

    res.json({
      status: 'success',
      data,
      metadata: {
        description: 'Per-IP rate limit usage',
        totalIps: Object.keys(stats.perIp).length,
        sortedBy: sort,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error fetching per-IP stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch per-IP statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/rate-limits/stats/per-server
 * Get per-server usage statistics
 */
router.get('/stats/per-server', async (req: Request, res: Response) => {
  try {
    const stats = store.getStats();
    const { sort = 'requests' } = req.query;

    let data = Object.entries(stats.perServer).map(([serverId, stat]) => ({
      serverId,
      ...stat,
    }));

    // Sort by specified field
    if (sort === 'requests') {
      data.sort((a, b) => b.requests - a.requests);
    } else if (sort === 'blocked') {
      data.sort((a, b) => b.blockedRequests - a.blockedRequests);
    } else if (sort === 'utilization') {
      data.sort((a, b) => b.utilizationPercent - a.utilizationPercent);
    }

    res.json({
      status: 'success',
      data,
      metadata: {
        description: 'Per-server rate limit usage',
        totalServers: Object.keys(stats.perServer).length,
        sortedBy: sort,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error fetching per-server stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch per-server statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/rate-limits/stats/per-tool
 * Get per-tool usage statistics
 */
router.get('/stats/per-tool', async (req: Request, res: Response) => {
  try {
    const stats = store.getStats();
    const { sort = 'requests' } = req.query;

    let data = Object.entries(stats.perTool).map(([toolId, stat]) => ({
      toolId,
      ...stat,
    }));

    // Sort by specified field
    if (sort === 'requests') {
      data.sort((a, b) => b.requests - a.requests);
    } else if (sort === 'blocked') {
      data.sort((a, b) => b.blockedRequests - a.blockedRequests);
    } else if (sort === 'utilization') {
      data.sort((a, b) => b.utilizationPercent - a.utilizationPercent);
    }

    res.json({
      status: 'success',
      data,
      metadata: {
        description: 'Per-tool rate limit usage',
        totalTools: Object.keys(stats.perTool).length,
        sortedBy: sort,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error fetching per-tool stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch per-tool statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/rate-limits/stats/reset
 * Reset statistics
 */
router.post('/stats/reset', async (_req: Request, res: Response) => {
  try {
    store.resetStats();

    res.json({
      status: 'success',
      message: 'Rate limit statistics reset',
      metadata: {
        resetAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error resetting stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reset statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export { router as rateLimitsRouter };
