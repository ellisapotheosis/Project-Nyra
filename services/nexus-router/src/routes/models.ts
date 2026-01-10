import { Router, Request, Response } from 'express';
import { config } from '../config';
import { WorkerManager } from '../services/worker-manager';
import { createLogger } from '../utils/logger';

const logger = createLogger('models-route');
const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const workerManager = WorkerManager.getInstance();
    const workerHealth = workerManager.getWorkerHealthStatus();

    // Collect models from healthy local workers
    const localModels = new Set<string>();
    const healthyWorkers = workerHealth.filter((w) => w.healthy);

    for (const worker of config.workers.local) {
      const workerId = worker.url.split('//')[1]?.split(':')[0] || 'unknown';
      const isHealthy = healthyWorkers.some((h) => h.workerId.includes(workerId));

      if (isHealthy) {
        worker.models.forEach((model) => localModels.add(model));
      }
    }

    // Cloud models (always available if API keys configured)
    const cloudModels: string[] = [];

    if (config.workers.cloud.anthropic.apiKey) {
      cloudModels.push(
        'claude-opus-4',
        'claude-sonnet-4',
        'claude-sonnet-3.5',
        config.workers.cloud.anthropic.model
      );
    }

    if (config.workers.cloud.openrouter.apiKey) {
      cloudModels.push(
        'deepseek/deepseek-r1',
        'deepseek/deepseek-chat',
        'anthropic/claude-3.5-sonnet',
        'google/gemini-pro',
        config.workers.cloud.openrouter.fallbackModel
      );
    }

    // Format in OpenAI models API format
    const allModels = [
      ...Array.from(localModels).map((model) => ({
        id: model,
        object: 'model',
        created: Math.floor(Date.now() / 1000),
        owned_by: 'local',
        available: true,
        provider: 'local-gpu',
      })),
      ...cloudModels.map((model) => ({
        id: model,
        object: 'model',
        created: Math.floor(Date.now() / 1000),
        owned_by: model.includes('anthropic') ? 'anthropic' : 'openrouter',
        available: true,
        provider: model.includes('anthropic') ? 'anthropic' : 'openrouter',
      })),
    ];

    // Remove duplicates
    const uniqueModels = Array.from(
      new Map(allModels.map((m) => [m.id, m])).values()
    );

    res.json({
      object: 'list',
      data: uniqueModels,
      metadata: {
        totalModels: uniqueModels.length,
        localModels: Array.from(localModels).length,
        cloudModels: cloudModels.length,
        healthyWorkers: healthyWorkers.length,
        totalWorkers: config.workers.local.length,
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

router.get('/:model', async (req: Request, res: Response): Promise<void> => {
  try {
    const modelId = req.params.model;
    const workerManager = WorkerManager.getInstance();
    const workerHealth = workerManager.getWorkerHealthStatus();

    // Check if model is available locally
    let foundLocally = false;
    let workerInfo = null;

    for (const worker of config.workers.local) {
      if (worker.models.some((m) => m === modelId || m.includes(modelId))) {
        const workerId = worker.url.split('//')[1]?.split(':')[0] || 'unknown';
        const isHealthy = workerHealth.some((h) => h.workerId.includes(workerId) && h.healthy);

        if (isHealthy) {
          foundLocally = true;
          workerInfo = {
            url: worker.url,
            primaryUse: worker.primaryUse,
            maxConcurrent: worker.maxConcurrent,
            timeout: worker.timeout,
          };
          break;
        }
      }
    }

    // Check cloud availability
    const cloudAvailable =
      config.workers.cloud.anthropic.apiKey || config.workers.cloud.openrouter.apiKey;

    if (!foundLocally && !cloudAvailable) {
      res.status(404).json({
        error: {
          message: `Model '${modelId}' not found or unavailable`,
          type: 'invalid_request_error',
        },
      });
      return;
    }

    res.json({
      id: modelId,
      object: 'model',
      created: Math.floor(Date.now() / 1000),
      owned_by: foundLocally ? 'local' : 'cloud',
      available: true,
      provider: foundLocally ? 'local-gpu' : 'cloud',
      details: foundLocally
        ? {
            location: 'local',
            worker: workerInfo,
          }
        : {
            location: 'cloud',
            fallbackAvailable: cloudAvailable,
          },
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

export { router as modelsRouter };
