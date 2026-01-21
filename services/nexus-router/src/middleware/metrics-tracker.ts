/**
 * Metrics Tracking Middleware
 *
 * Tracks all HTTP requests and records metrics for observability.
 * - Records latency, status codes, providers, routes
 * - Tracks token usage and costs
 * - Creates distributed traces
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { MetricsCollectorService } from '../services/metrics-collector';
import { Trace, TraceSpan } from '../types/metrics';

const metricsCollector = MetricsCollectorService.getInstance();

// Extend Express Request to include metrics data
declare global {
  namespace Express {
    interface Request {
      startTime?: number;
      traceId?: string;
      requestId?: string;
    }
  }
}

/**
 * Middleware to track request metrics
 */
export function metricsTracker(req: Request, res: Response, next: NextFunction): void {
  // Start timer
  req.startTime = Date.now();

  // Generate trace and request IDs
  req.traceId = uuidv4();
  req.requestId = uuidv4();

  // Store original end function
  const originalEnd = res.end;

  // Override end function to record metrics
  res.end = function (this: Response, ...args: any[]): Response {
    const endTime = Date.now();
    const latency = endTime - (req.startTime || endTime);

    // Determine provider and route from request
    const provider = getProviderFromRequest(req);
    const route = getRouteFromRequest(req);

    // Determine status
    const statusCode = res.statusCode;
    let status: 'success' | 'error' | 'timeout';
    if (statusCode >= 200 && statusCode < 300) {
      status = 'success';
    } else if (statusCode === 408 || statusCode === 504) {
      status = 'timeout';
    } else {
      status = 'error';
    }

    // Extract token usage and cost from response (if available)
    const tokens = extractTokenUsage(res);
    const cost = calculateCost(provider, tokens);
    const cached = isCachedResponse(res);

    // Record request in metrics collector
    metricsCollector.recordRequest({
      timestamp: req.startTime || endTime,
      provider,
      route,
      latency,
      status,
      tokens,
      cost,
      cached,
      traceId: req.traceId,
    });

    // Create trace if enabled
    if (req.traceId) {
      const trace = createTrace(req, res, latency, status, provider, route, tokens, cost, cached);
      metricsCollector.recordTrace(trace);
    }

    // Call original end function
    return originalEnd.apply(this, args as any);
  };

  next();
}

/**
 * Get provider from request
 */
function getProviderFromRequest(req: Request): string {
  // Try to get from request body
  if (req.body?.provider) {
    return req.body.provider;
  }

  // Try to get from request headers
  if (req.headers['x-provider']) {
    return req.headers['x-provider'] as string;
  }

  // Default
  return 'unknown';
}

/**
 * Get route from request
 */
function getRouteFromRequest(req: Request): string {
  // Use the route path
  const route = req.route?.path || req.path;

  // Normalize route (remove IDs, etc.)
  return route.replace(/\/[0-9a-f-]{36}/gi, '/:id');
}

/**
 * Extract token usage from response
 */
function extractTokenUsage(res: Response): { input: number; output: number; total: number } {
  // Try to get from response locals
  if (res.locals?.tokenUsage) {
    return res.locals.tokenUsage;
  }

  // Try to parse from response body (if JSON)
  try {
    const body = (res as any)._body;
    if (body && typeof body === 'object') {
      if (body.usage) {
        return {
          input: body.usage.prompt_tokens || 0,
          output: body.usage.completion_tokens || 0,
          total: body.usage.total_tokens || 0,
        };
      }
    }
  } catch {
    // Ignore parsing errors
  }

  return { input: 0, output: 0, total: 0 };
}

/**
 * Calculate cost based on provider and token usage
 */
function calculateCost(provider: string, tokens: { input: number; output: number }): number {
  // Cost per 1K tokens (USD)
  const pricing: Record<string, { input: number; output: number }> = {
    'openai-gpt-4': { input: 0.03, output: 0.06 },
    'openai-gpt-3.5': { input: 0.0015, output: 0.002 },
    'anthropic-claude-3-opus': { input: 0.015, output: 0.075 },
    'anthropic-claude-3-sonnet': { input: 0.003, output: 0.015 },
    'anthropic-claude-3-haiku': { input: 0.00025, output: 0.00125 },
    'google-gemini-pro': { input: 0.00025, output: 0.0005 },
  };

  const providerPricing = pricing[provider] || { input: 0.001, output: 0.002 };

  const inputCost = (tokens.input / 1000) * providerPricing.input;
  const outputCost = (tokens.output / 1000) * providerPricing.output;

  return inputCost + outputCost;
}

/**
 * Check if response was cached
 */
function isCachedResponse(res: Response): boolean {
  return res.getHeader('x-cache-hit') === 'true' || res.locals?.cached === true;
}

/**
 * Create a distributed trace
 */
function createTrace(
  req: Request,
  res: Response,
  latency: number,
  status: 'success' | 'error' | 'timeout',
  provider: string,
  route: string,
  tokens: { input: number; output: number; total: number },
  cost: number,
  cached: boolean
): Trace {
  const startTime = req.startTime || Date.now();
  const endTime = startTime + latency;

  // Create main span
  const mainSpan: TraceSpan = {
    spanId: uuidv4(),
    name: `${req.method} ${route}`,
    startTime,
    endTime,
    duration: latency,
    status: status === 'success' ? 'ok' : 'error',
    attributes: {
      'http.method': req.method,
      'http.route': route,
      'http.status_code': res.statusCode,
      'http.user_agent': req.headers['user-agent'],
      'provider': provider,
      'cached': cached,
    },
  };

  // Create trace
  const trace: Trace = {
    traceId: req.traceId!,
    requestId: req.requestId!,
    timestamp: startTime,
    duration: latency,
    status,
    provider,
    model: res.locals?.model || 'unknown',
    route,
    method: req.method,
    statusCode: res.statusCode,
    latency,
    tokens,
    cost,
    cached,
    spans: [mainSpan],
  };

  // Add error information if applicable
  if (status === 'error' && res.locals?.error) {
    trace.error = {
      message: res.locals.error.message,
      code: res.locals.error.code,
      stack: res.locals.error.stack,
    };
  }

  return trace;
}
