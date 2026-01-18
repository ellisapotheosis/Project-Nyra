import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { ProviderManager } from '../services/provider-manager';
import { createLogger } from '../utils/logger';
import {
  ProviderType,
  CreateProviderRequest,
  UpdateProviderRequest,
} from '../types/providers';

const logger = createLogger('providers-route');
const router = Router();

// Zod schemas for validation
const ProviderTypeSchema = z.enum([
  'anthropic',
  'aws-bedrock',
  'google-gemini',
  'openai',
  'openrouter',
  'meta-llama',
  'cohere',
]);

const CreateProviderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: ProviderTypeSchema,
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional(),
  models: z.array(z.string()).optional(),
  enabled: z.boolean().optional(),
  tokenForwarding: z.boolean().optional(),
  maxTokens: z.number().int().positive().optional(),
  timeout: z.number().int().positive().optional(),
  priority: z.number().int().min(1).max(100).optional(),
  metadata: z.record(z.any()).optional(),
});

const UpdateProviderSchema = z.object({
  name: z.string().min(1).optional(),
  enabled: z.boolean().optional(),
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional(),
  models: z.array(z.string()).optional(),
  tokenForwarding: z.boolean().optional(),
  maxTokens: z.number().int().positive().optional(),
  timeout: z.number().int().positive().optional(),
  priority: z.number().int().min(1).max(100).optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * GET /api/providers - List all providers
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const providerManager = ProviderManager.getInstance();
    const providers = await providerManager.listProviders();
    const metadata = await providerManager.getStatistics();

    // Sanitize API keys in response
    const sanitizedProviders = providers.map(p => ({
      ...p,
      apiKey: p.apiKey ? '***' + p.apiKey.slice(-4) : undefined,
    }));

    res.json({
      providers: sanitizedProviders,
      metadata,
    });
  } catch (error) {
    logger.error('List providers error:', error);
    res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : 'Failed to list providers',
        type: 'server_error',
      },
    });
  }
});

/**
 * POST /api/providers - Create a new provider
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = CreateProviderSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: {
          message: 'Invalid request body',
          type: 'validation_error',
          details: validationResult.error.errors,
        },
      });
      return;
    }

    const providerManager = ProviderManager.getInstance();
    const provider = await providerManager.createProvider(validationResult.data as CreateProviderRequest);

    // Sanitize API key in response
    const sanitized = {
      ...provider,
      apiKey: provider.apiKey ? '***' + provider.apiKey.slice(-4) : undefined,
    };

    res.status(201).json(sanitized);
  } catch (error) {
    logger.error('Create provider error:', error);
    res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : 'Failed to create provider',
        type: 'server_error',
      },
    });
  }
});

/**
 * GET /api/providers/:id - Get a specific provider
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const providerManager = ProviderManager.getInstance();
    const provider = await providerManager.getProvider(id);

    if (!provider) {
      res.status(404).json({
        error: {
          message: `Provider '${id}' not found`,
          type: 'not_found',
        },
      });
      return;
    }

    // Sanitize API key in response
    const sanitized = {
      ...provider,
      apiKey: provider.apiKey ? '***' + provider.apiKey.slice(-4) : undefined,
    };

    res.json(sanitized);
  } catch (error) {
    logger.error('Get provider error:', error);
    res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : 'Failed to get provider',
        type: 'server_error',
      },
    });
  }
});

/**
 * PATCH /api/providers/:id - Update a provider
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate request body
    const validationResult = UpdateProviderSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: {
          message: 'Invalid request body',
          type: 'validation_error',
          details: validationResult.error.errors,
        },
      });
      return;
    }

    const providerManager = ProviderManager.getInstance();
    const provider = await providerManager.updateProvider(id, validationResult.data);

    if (!provider) {
      res.status(404).json({
        error: {
          message: `Provider '${id}' not found`,
          type: 'not_found',
        },
      });
      return;
    }

    // Sanitize API key in response
    const sanitized = {
      ...provider,
      apiKey: provider.apiKey ? '***' + provider.apiKey.slice(-4) : undefined,
    };

    res.json(sanitized);
  } catch (error) {
    logger.error('Update provider error:', error);
    res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : 'Failed to update provider',
        type: 'server_error',
      },
    });
  }
});

/**
 * DELETE /api/providers/:id - Delete a provider
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const providerManager = ProviderManager.getInstance();
    const success = await providerManager.deleteProvider(id);

    if (!success) {
      res.status(404).json({
        error: {
          message: `Provider '${id}' not found`,
          type: 'not_found',
        },
      });
      return;
    }

    res.status(204).send();
  } catch (error) {
    logger.error('Delete provider error:', error);
    res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : 'Failed to delete provider',
        type: 'server_error',
      },
    });
  }
});

/**
 * GET /api/providers/:id/health - Check provider health
 */
router.get('/:id/health', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const providerManager = ProviderManager.getInstance();
    const health = await providerManager.checkProviderHealth(id);

    const statusCode = health.healthy ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Provider health check error:', error);
    res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : 'Failed to check provider health',
        type: 'server_error',
      },
    });
  }
});

/**
 * POST /api/providers/:id/test - Test provider connection
 */
router.post('/:id/test', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const providerManager = ProviderManager.getInstance();
    const result = await providerManager.testProvider(id);

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    logger.error('Provider test error:', error);
    res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : 'Failed to test provider',
        type: 'server_error',
      },
    });
  }
});

export { router as providersRouter };
