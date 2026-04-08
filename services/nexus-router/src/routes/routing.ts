import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { WorkerManager } from '../services/worker-manager';
import { RedisClient } from '../services/redis-client';
import { createLogger } from '../utils/logger';
import { config } from '../config';

const logger = createLogger('routing-route');
const router = Router();

// Zod Schemas for validation
const RoutingStrategySchema = z.enum(['cost-optimized', 'latency-optimized', 'quality-optimized']);

const RoutingConfigSchema = z.object({
  strategy: RoutingStrategySchema.optional(),
  preferLocal: z.boolean().optional(),
  fallbackCloud: z.boolean().optional(),
  costThreshold: z.number().min(0).max(1).optional(),
});

const CustomRoutingRuleSchema = z.object({
  pattern: z.string().min(1),
  targetProvider: z.enum(['local', 'openai', 'google-gemini', 'anthropic', 'openrouter']),
  targetModel: z.string().optional(),
  priority: z.number().int().default(0),
  enabled: z.boolean().default(true),
});

const SimulateRequestSchema = z.object({
  model: z.string(),
  taskType: z.enum(['reasoning', 'analysis', 'coding', 'general']).optional(),
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string(),
  })).optional(),
});

export type RoutingConfig = z.infer<typeof RoutingConfigSchema>;
export type CustomRoutingRule = z.infer<typeof CustomRoutingRuleSchema>;
export type SimulateRequest = z.infer<typeof SimulateRequestSchema>;

// In-memory storage for custom rules (could be moved to Redis for persistence)
const customRules: Map<string, CustomRoutingRule & { id: string; createdAt: Date }> = new Map();

/**
 * GET /api/routing/config
 * Get current routing configuration
 */
router.get('/config', async (_req: Request, res: Response) => {
  try {
    const workerManager = WorkerManager.getInstance();
    const currentConfig = workerManager.getRoutingConfig();
    const rules = Array.from(customRules.values()).sort((a, b) => b.priority - a.priority);

    res.json({
      config: currentConfig,
      customRules: rules,
      metadata: {
        totalRules: rules.length,
        enabledRules: rules.filter((r) => r.enabled).length,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error getting routing config:', error);
    res.status(500).json({
      error: 'Failed to retrieve routing configuration',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PATCH /api/routing/config
 * Update routing configuration
 */
router.patch('/config', async (req: Request, res: Response) => {
  try {
    const validatedConfig = RoutingConfigSchema.parse(req.body);
    const workerManager = WorkerManager.getInstance();

    // Update the configuration
    workerManager.updateRoutingConfig(validatedConfig);

    // Store in Redis for persistence
    const redis = RedisClient.getInstance();
    if (redis.isConnected()) {
      await redis.set(
        'routing:config',
        JSON.stringify(validatedConfig),
        3600 * 24 * 30 // 30 days TTL
      );
    }

    logger.info('Routing configuration updated:', validatedConfig);

    res.json({
      success: true,
      config: workerManager.getRoutingConfig(),
      message: 'Routing configuration updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
      return;
    }

    logger.error('Error updating routing config:', error);
    res.status(500).json({
      error: 'Failed to update routing configuration',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/routing/rules
 * Add a custom routing rule
 */
router.post('/rules', async (req: Request, res: Response) => {
  try {
    const validatedRule = CustomRoutingRuleSchema.parse(req.body);

    // Generate unique ID
    const id = `rule_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const ruleWithMetadata = {
      id,
      ...validatedRule,
      createdAt: new Date(),
    };

    customRules.set(id, ruleWithMetadata);

    // Store in Redis for persistence
    const redis = RedisClient.getInstance();
    if (redis.isConnected()) {
      await redis.set(
        `routing:rule:${id}`,
        JSON.stringify(ruleWithMetadata),
        3600 * 24 * 30 // 30 days TTL
      );

      // Store rule IDs list
      const ruleIds = Array.from(customRules.keys());
      await redis.set('routing:rule:ids', JSON.stringify(ruleIds), 3600 * 24 * 30);
    }

    logger.info(`Custom routing rule created: ${id}`, validatedRule);

    res.status(201).json({
      success: true,
      rule: ruleWithMetadata,
      message: 'Custom routing rule created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
      return;
    }

    logger.error('Error creating routing rule:', error);
    res.status(500).json({
      error: 'Failed to create routing rule',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/routing/rules/:id
 * Delete a custom routing rule
 */
router.delete('/rules/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!customRules.has(id)) {
      res.status(404).json({
        error: 'Rule not found',
        message: `No routing rule found with id: ${id}`,
      });
      return;
    }

    const deletedRule = customRules.get(id);
    customRules.delete(id);

    // Remove from Redis
    const redis = RedisClient.getInstance();
    if (redis.isConnected()) {
      await redis.del(`routing:rule:${id}`);

      // Update rule IDs list
      const ruleIds = Array.from(customRules.keys());
      await redis.set('routing:rule:ids', JSON.stringify(ruleIds), 3600 * 24 * 30);
    }

    logger.info(`Custom routing rule deleted: ${id}`);

    res.json({
      success: true,
      deletedRule,
      message: 'Routing rule deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting routing rule:', error);
    res.status(500).json({
      error: 'Failed to delete routing rule',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/routing/simulate
 * Simulate routing for a request without executing it
 */
router.get('/simulate', async (req: Request, res: Response) => {
  try {
    // Parse query parameters
    const model = req.query.model as string;
    const taskType = req.query.taskType as string | undefined;

    if (!model) {
      res.status(400).json({
        error: 'Validation error',
        message: 'model parameter is required',
      });
      return;
    }

    const simulateRequest: SimulateRequest = {
      model,
      taskType: taskType as any,
    };

    const validatedRequest = SimulateRequestSchema.parse(simulateRequest);

    const workerManager = WorkerManager.getInstance();

    // Check if any custom rules match
    const matchingRule = findMatchingRule(validatedRequest.model);

    if (matchingRule) {
      res.json({
        decision: {
          provider: matchingRule.targetProvider,
          targetModel: matchingRule.targetModel || validatedRequest.model,
          reason: `Matched custom rule: ${matchingRule.pattern}`,
          worker: null,
        },
        matchedRule: {
          id: matchingRule.id,
          pattern: matchingRule.pattern,
          priority: matchingRule.priority,
        },
        currentConfig: workerManager.getRoutingConfig(),
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Simulate routing decision using worker manager
    const decision = await workerManager.routeRequest(
      validatedRequest.model,
      validatedRequest.taskType
    );

    // Get worker details if available
    const workerDetails = decision.worker
      ? {
          url: decision.worker.url,
          models: decision.worker.models,
          primaryUse: decision.worker.primaryUse,
          maxConcurrent: decision.worker.maxConcurrent,
        }
      : null;

    res.json({
      decision: {
        provider: decision.provider,
        reason: decision.reason,
        worker: workerDetails,
      },
      currentConfig: workerManager.getRoutingConfig(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
      return;
    }

    logger.error('Error simulating routing:', error);
    res.status(500).json({
      error: 'Failed to simulate routing',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Helper function to find matching custom routing rule
 */
function findMatchingRule(model: string): (CustomRoutingRule & { id: string }) | null {
  const enabledRules = Array.from(customRules.values())
    .filter((rule) => rule.enabled)
    .sort((a, b) => b.priority - a.priority);

  for (const rule of enabledRules) {
    try {
      // Try regex match first
      const regex = new RegExp(rule.pattern, 'i');
      if (regex.test(model)) {
        return rule;
      }
    } catch {
      // Fallback to simple string match if regex is invalid
      if (model.toLowerCase().includes(rule.pattern.toLowerCase())) {
        return rule;
      }
    }
  }

  return null;
}

/**
 * Initialize custom rules from Redis on startup
 */
export async function initializeRoutingRules(): Promise<void> {
  try {
    const redis = RedisClient.getInstance();
    if (!redis.isConnected()) {
      logger.info('Redis not connected, skipping routing rules initialization');
      return;
    }

    // Load rule IDs
    const ruleIdsJson = await redis.get('routing:rule:ids');
    if (!ruleIdsJson) {
      logger.info('No custom routing rules found in Redis');
      return;
    }

    const ruleIds: string[] = JSON.parse(ruleIdsJson);

    // Load each rule
    for (const id of ruleIds) {
      const ruleJson = await redis.get(`routing:rule:${id}`);
      if (ruleJson) {
        const rule = JSON.parse(ruleJson);
        customRules.set(id, {
          ...rule,
          createdAt: new Date(rule.createdAt),
        });
      }
    }

    logger.info(`Loaded ${customRules.size} custom routing rules from Redis`);
  } catch (error) {
    logger.error('Error initializing routing rules:', error);
  }
}

export { router as routingRouter };
