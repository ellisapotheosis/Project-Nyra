import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { WorkerManager } from '../services/worker-manager';
import { RedisClient } from '../services/redis-client';
import { createLogger } from '../utils/logger';
import { CompletionRequest } from '../types';
import { CloudProvider, formatProviderResponse } from '../services/cloud-provider-adapters';

const logger = createLogger('completion-route');
const router = Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();

  try {
    const requestBody: CompletionRequest = req.body;

    // Validate request
    if (!requestBody.messages || !Array.isArray(requestBody.messages)) {
      res.status(400).json({
        error: {
          message: 'Invalid request: messages array is required',
          type: 'invalid_request_error',
        },
      });
      return;
    }

    // Check for cached response
    const requestHash = generateRequestHash(requestBody);
    const redis = RedisClient.getInstance();
    const cachedResponse = await redis.checkRequestCache(requestHash);

    if (cachedResponse) {
      logger.info('Returning cached response');
      await redis.incrementMetric('requests:cached');

      res.json({
        ...JSON.parse(cachedResponse),
        cached: true,
        responseTime: Date.now() - startTime,
      });
      return;
    }

    // Route the request
    const workerManager = WorkerManager.getInstance();
    const model = requestBody.model || 'default';
    const taskType = inferTaskType(requestBody.messages);

    const routing = await workerManager.routeRequest(model, taskType);

    logger.info(`Routing decision: ${routing.reason}`);

    // Send request to selected provider
    const response = await workerManager.sendCompletionRequest(routing, requestBody);

    // Transform response to OpenAI format if needed
    const formattedResponse = formatProviderResponse(response, routing.provider as CloudProvider);

    // Cache the response
    await redis.cacheRequest(requestHash, JSON.stringify(formattedResponse), 3600);

    const responseTime = Date.now() - startTime;

    res.json({
      ...formattedResponse,
      metadata: {
        provider: routing.provider,
        worker: routing.worker ? routing.worker.url : 'cloud',
        responseTime,
        cached: false,
      },
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Completion error:', error);

    res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : 'Internal server error',
        type: 'server_error',
        responseTime,
      },
    });
  }
});

function generateRequestHash(request: CompletionRequest): string {
  const hashData = {
    messages: request.messages,
    model: request.model,
    temperature: request.temperature,
    max_tokens: request.max_tokens,
  };

  return crypto
    .createHash('sha256')
    .update(JSON.stringify(hashData))
    .digest('hex')
    .substring(0, 16);
}

function inferTaskType(messages: any[]): string {
  const lastMessage = messages[messages.length - 1];
  const content = typeof lastMessage.content === 'string'
    ? lastMessage.content.toLowerCase()
    : '';

  // Simple heuristics for task type inference
  if (content.includes('code') || content.includes('function') || content.includes('implement')) {
    return 'coding';
  }

  if (content.includes('analyze') || content.includes('review') || content.includes('evaluate')) {
    return 'analysis';
  }

  if (
    content.includes('think') ||
    content.includes('reason') ||
    content.includes('explain') ||
    content.includes('why')
  ) {
    return 'reasoning';
  }

  return 'general';
}

export { router as completionRouter };
