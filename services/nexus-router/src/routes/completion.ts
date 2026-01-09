import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { WorkerManager } from '../services/worker-manager';
import { RedisClient } from '../services/redis-client';
import { createLogger } from '../utils/logger';
import { CompletionRequest, CompletionResponse } from '../types';

const logger = createLogger('completion-route');
const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    const requestBody: CompletionRequest = req.body;

    // Validate request
    if (!requestBody.messages || !Array.isArray(requestBody.messages)) {
      return res.status(400).json({
        error: {
          message: 'Invalid request: messages array is required',
          type: 'invalid_request_error',
        },
      });
    }

    // Check for cached response
    const requestHash = generateRequestHash(requestBody);
    const redis = RedisClient.getInstance();
    const cachedResponse = await redis.checkRequestCache(requestHash);

    if (cachedResponse) {
      logger.info('Returning cached response');
      await redis.incrementMetric('requests:cached');

      return res.json({
        ...JSON.parse(cachedResponse),
        cached: true,
        responseTime: Date.now() - startTime,
      });
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
    const formattedResponse = formatResponse(response, routing.provider);

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

function formatResponse(response: any, provider: string): CompletionResponse {
  // If response is already in OpenAI format
  if (response.choices && response.model) {
    return response as CompletionResponse;
  }

  // Transform Anthropic format to OpenAI format
  if (provider === 'anthropic' && response.content) {
    return {
      id: response.id || `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: response.model || 'claude-sonnet-4',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: response.content[0]?.text || '',
          },
          finish_reason: response.stop_reason === 'end_turn' ? 'stop' : 'length',
        },
      ],
      usage: {
        prompt_tokens: response.usage?.input_tokens || 0,
        completion_tokens: response.usage?.output_tokens || 0,
        total_tokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
      },
    };
  }

  // Default passthrough
  return response;
}

export { router as completionRouter };
