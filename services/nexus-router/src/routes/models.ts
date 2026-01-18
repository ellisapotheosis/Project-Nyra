import { Router, Request, Response } from 'express';
import { createLogger } from '../utils/logger';
import { ModelDiscoveryService } from '../services/model-discovery';

const logger = createLogger('models-route');
const router = Router();

/**
 * GET /api/models
 * List all discovered models with full capability matrix
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const discoveryService = ModelDiscoveryService.getInstance();

    // Parse query filters
    const {
      provider,
      availability,
      supportsToolCalling,
      supportsVision,
      minContextLength,
      maxVramRequirements,
    } = req.query;

    // Build filter
    const filter: any = {};
    if (provider) filter.provider = provider as string;
    if (availability) filter.availability = availability as string;
    if (supportsToolCalling !== undefined) {
      filter.supportsToolCalling = supportsToolCalling === 'true';
    }
    if (supportsVision !== undefined) {
      filter.supportsVision = supportsVision === 'true';
    }
    if (minContextLength) {
      filter.minContextLength = parseInt(minContextLength as string, 10);
    }
    if (maxVramRequirements) {
      filter.maxVramRequirements = parseFloat(maxVramRequirements as string);
    }

    // Get filtered models
    const models = discoveryService.getModels(
      Object.keys(filter).length > 0 ? filter : undefined
    );

    // Format in OpenAI-compatible format with extended capabilities
    const formattedModels = models.map((model) => ({
      id: model.id,
      object: 'model',
      created: Math.floor(model.lastChecked.getTime() / 1000),
      owned_by: model.provider,
      available: model.availability === 'available',
      provider: model.provider,

      // Extended capability matrix
      capabilities: {
        maxContextLength: model.maxContextLength,
        vramRequirements: model.vramRequirements,
        supportsStreaming: model.supportsStreaming,
        supportsToolCalling: model.supportsToolCalling,
        supportsVision: model.supportsVision,
        parameterSize: model.parameterSize,
        quantization: model.quantization,
        architecture: model.architecture,
      },

      // Cost information
      pricing: {
        costPer1kInputTokens: model.costPer1kInputTokens,
        costPer1kOutputTokens: model.costPer1kOutputTokens,
        currency: 'USD',
      },

      // Runtime info
      runtime:
        model.provider === 'local-gpu'
          ? {
              workerUrl: model.workerUrl,
              workerId: model.workerId,
              responseTime: model.responseTime,
            }
          : undefined,

      // Metadata
      metadata: {
        aliases: model.aliases,
        lastChecked: model.lastChecked.toISOString(),
      },
    }));

    // Group by provider for metadata
    const byProvider = models.reduce(
      (acc, model) => {
        acc[model.provider] = (acc[model.provider] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const status = discoveryService.getStatus();

    res.json({
      object: 'list',
      data: formattedModels,
      metadata: {
        totalModels: models.length,
        byProvider,
        availableModels: models.filter((m) => m.availability === 'available').length,
        unavailableModels: models.filter((m) => m.availability === 'unavailable')
          .length,
        lastDiscovery: status.lastDiscovery.toISOString(),
        nextDiscovery: status.nextDiscovery.toISOString(),
        cacheVersion: discoveryService.getCacheVersion(),
      },
    });
  } catch (error) {
    logger.error('Models list error:', error);
    res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : 'Failed to list models',
        type: 'server_error',
      },
    });
  }
});

/**
 * GET /api/models/:id
 * Get detailed model information by ID or alias
 */
router.get('/:model', async (req: Request, res: Response): Promise<void> => {
  try {
    const modelId = req.params.model;
    const discoveryService = ModelDiscoveryService.getInstance();

    // Look up model (supports aliases)
    const model = discoveryService.getModel(modelId);

    if (!model) {
      res.status(404).json({
        error: {
          message: `Model '${modelId}' not found`,
          type: 'invalid_request_error',
          details: 'Model may not be available or discovery has not run yet',
        },
      });
      return;
    }

    // Return comprehensive model details
    res.json({
      id: model.id,
      name: model.name,
      object: 'model',
      created: Math.floor(model.lastChecked.getTime() / 1000),
      owned_by: model.provider,
      available: model.availability === 'available',
      provider: model.provider,

      // Full capability matrix
      capabilities: {
        maxContextLength: model.maxContextLength,
        vramRequirements: model.vramRequirements,
        supportsStreaming: model.supportsStreaming,
        supportsToolCalling: model.supportsToolCalling,
        supportsVision: model.supportsVision,
        parameterSize: model.parameterSize,
        quantization: model.quantization,
        architecture: model.architecture,
      },

      // Cost information
      pricing: {
        costPer1kInputTokens: model.costPer1kInputTokens,
        costPer1kOutputTokens: model.costPer1kOutputTokens,
        currency: 'USD',
        estimatedCostPer1MTokens: model.costPer1kInputTokens
          ? {
              input: model.costPer1kInputTokens * 1000,
              output: model.costPer1kOutputTokens
                ? model.costPer1kOutputTokens * 1000
                : undefined,
            }
          : undefined,
      },

      // Runtime information
      runtime:
        model.provider === 'local-gpu'
          ? {
              workerUrl: model.workerUrl,
              workerId: model.workerId,
              responseTime: model.responseTime,
              location: 'local',
            }
          : {
              location: 'cloud',
              endpoint:
                model.provider === 'anthropic'
                  ? 'https://api.anthropic.com/v1/messages'
                  : 'https://openrouter.ai/api/v1/chat/completions',
            },

      // Metadata
      metadata: {
        aliases: model.aliases,
        lastChecked: model.lastChecked.toISOString(),
        availability: model.availability,
      },

      // Recommended use cases based on capabilities
      recommendedFor: getRecommendedUseCases(model),
    });
  } catch (error) {
    logger.error('Model details error:', error);
    res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : 'Failed to get model details',
        type: 'server_error',
      },
    });
  }
});

/**
 * POST /api/models/discovery/refresh
 * Trigger manual model discovery refresh
 */
router.post('/discovery/refresh', async (_req: Request, res: Response) => {
  try {
    const discoveryService = ModelDiscoveryService.getInstance();

    // Trigger async discovery
    discoveryService
      .discoverModels()
      .then(() => {
        logger.info('Manual discovery refresh completed');
      })
      .catch((error) => {
        logger.error('Manual discovery refresh failed:', error);
      });

    res.json({
      success: true,
      message: 'Model discovery refresh triggered',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Discovery refresh error:', error);
    res.status(500).json({
      error: {
        message:
          error instanceof Error ? error.message : 'Failed to trigger discovery refresh',
        type: 'server_error',
      },
    });
  }
});

/**
 * GET /api/models/discovery/status
 * Get current discovery service status
 */
router.get('/discovery/status', async (_req: Request, res: Response) => {
  try {
    const discoveryService = ModelDiscoveryService.getInstance();
    const status = discoveryService.getStatus();

    res.json({
      status: 'operational',
      discovery: {
        lastDiscovery: status.lastDiscovery.toISOString(),
        nextDiscovery: status.nextDiscovery.toISOString(),
        discovering: status.discovering,
        refreshInterval: '5 minutes',
        refreshIntervalMs: 5 * 60 * 1000,
      },
      models: {
        total: status.totalModels,
        available: status.availableModels,
        unavailable: status.unavailableModels,
      },
      errors: status.errors.length > 0 ? status.errors : undefined,
      cacheVersion: discoveryService.getCacheVersion(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Discovery status error:', error);
    res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : 'Failed to get discovery status',
        type: 'server_error',
      },
    });
  }
});

/**
 * Helper: Get recommended use cases for a model
 */
function getRecommendedUseCases(model: any): string[] {
  const useCases: string[] = [];

  if (model.supportsToolCalling) {
    useCases.push('function-calling', 'agentic-workflows');
  }

  if (model.supportsVision) {
    useCases.push('image-analysis', 'visual-qa');
  }

  if (model.maxContextLength >= 100000) {
    useCases.push('long-context', 'document-analysis');
  }

  if (model.vramRequirements && model.vramRequirements <= 12) {
    useCases.push('edge-deployment', 'local-inference');
  }

  if (model.costPer1kInputTokens && model.costPer1kInputTokens < 0.001) {
    useCases.push('high-volume', 'cost-sensitive');
  }

  if (model.parameterSize) {
    const size = model.parameterSize.toLowerCase();
    if (size.includes('70b') || size.includes('671b') || size.includes('405b')) {
      useCases.push('reasoning', 'complex-tasks');
    } else if (size.includes('7b') || size.includes('8b') || size.includes('13b')) {
      useCases.push('fast-inference', 'chat');
    }
  }

  if (model.architecture === 'claude') {
    useCases.push('code-generation', 'analysis', 'writing');
  }

  if (model.architecture === 'deepseek') {
    useCases.push('coding', 'reasoning');
  }

  return useCases.length > 0 ? useCases : ['general-purpose'];
}

export { router as modelsRouter };
