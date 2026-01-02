/**
 * MCP Retry Handler
 * Implements retry logic with exponential backoff for MCP operations
 */

class MCPRetryHandler {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.initialDelay = options.initialDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.backoffMultiplier = options.backoffMultiplier || 2;
    this.jitter = options.jitter || 0.1;
    
    // Retry conditions
    this.retryableErrors = options.retryableErrors || [
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'EAI_AGAIN',
      'SOCKET_TIMEOUT',
      'NETWORK_ERROR'
    ];
    
    this.retryableStatusCodes = options.retryableStatusCodes || [
      408, // Request Timeout
      429, // Too Many Requests
      500, // Internal Server Error
      502, // Bad Gateway
      503, // Service Unavailable
      504  // Gateway Timeout
    ];
  }

  /**
   * Execute a function with retry logic
   */
  async executeWithRetry(fn, operationName, logger) {
    let lastError;
    let attempt = 0;
    
    while (attempt <= this.maxRetries) {
      try {
        const result = await fn();
        
        if (attempt > 0) {
          logger?.info(`Operation succeeded on attempt ${attempt + 1}: ${operationName}`);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        attempt++;
        
        if (attempt > this.maxRetries) {
          logger?.error(`Operation failed after ${this.maxRetries + 1} attempts: ${operationName}`, error);
          break;
        }
        
        if (!this.shouldRetry(error)) {
          logger?.warn(`Non-retryable error for operation: ${operationName}`, error);
          break;
        }
        
        const delay = this.calculateDelay(attempt);
        logger?.warn(`Attempt ${attempt} failed for ${operationName}, retrying in ${delay}ms`, error.message);
        
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  /**
   * Determine if an error should trigger a retry
   */
  shouldRetry(error) {
    // Check error codes
    if (error.code && this.retryableErrors.includes(error.code)) {
      return true;
    }
    
    // Check HTTP status codes
    if (error.status && this.retryableStatusCodes.includes(error.status)) {
      return true;
    }
    
    if (error.response?.status && this.retryableStatusCodes.includes(error.response.status)) {
      return true;
    }
    
    // Check error messages for common patterns
    const errorMessage = error.message?.toLowerCase() || '';
    const retryablePatterns = [
      'timeout',
      'connection refused',
      'connection reset',
      'network error',
      'temporary failure',
      'service unavailable',
      'rate limit',
      'too many requests'
    ];
    
    return retryablePatterns.some(pattern => errorMessage.includes(pattern));
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  calculateDelay(attempt) {
    // Exponential backoff: delay = initialDelay * (backoffMultiplier ^ (attempt - 1))
    let delay = this.initialDelay * Math.pow(this.backoffMultiplier, attempt - 1);
    
    // Apply maximum delay limit
    delay = Math.min(delay, this.maxDelay);
    
    // Add jitter to prevent thundering herd
    const jitterAmount = delay * this.jitter;
    const jitter = (Math.random() - 0.5) * 2 * jitterAmount;
    
    return Math.max(0, Math.floor(delay + jitter));
  }

  /**
   * Sleep for specified milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create a retry wrapper for a function
   */
  wrap(fn, operationName, logger) {
    return async (...args) => {
      return await this.executeWithRetry(
        () => fn(...args),
        operationName,
        logger
      );
    };
  }

  /**
   * Execute with circuit breaker pattern
   */
  async executeWithCircuitBreaker(fn, operationName, logger, circuitBreakerOptions = {}) {
    const {
      failureThreshold = 5,
      resetTimeout = 60000,
      monitoringPeriod = 60000
    } = circuitBreakerOptions;
    
    const circuitKey = `circuit_${operationName}`;
    
    // Get or create circuit state
    if (!this.circuits) {
      this.circuits = new Map();
    }
    
    let circuit = this.circuits.get(circuitKey);
    if (!circuit) {
      circuit = {
        state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
        failures: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0
      };
      this.circuits.set(circuitKey, circuit);
    }
    
    // Check circuit state
    const now = Date.now();
    
    if (circuit.state === 'OPEN') {
      if (now < circuit.nextAttemptTime) {
        throw new Error(`Circuit breaker is OPEN for ${operationName}. Next attempt at ${new Date(circuit.nextAttemptTime)}`);
      } else {
        circuit.state = 'HALF_OPEN';
        logger?.info(`Circuit breaker transitioning to HALF_OPEN for ${operationName}`);
      }
    }
    
    try {
      const result = await this.executeWithRetry(fn, operationName, logger);
      
      // Success - reset circuit if it was half-open
      if (circuit.state === 'HALF_OPEN') {
        circuit.state = 'CLOSED';
        circuit.failures = 0;
        logger?.info(`Circuit breaker reset to CLOSED for ${operationName}`);
      }
      
      return result;
    } catch (error) {
      circuit.failures++;
      circuit.lastFailureTime = now;
      
      if (circuit.failures >= failureThreshold) {
        circuit.state = 'OPEN';
        circuit.nextAttemptTime = now + resetTimeout;
        logger?.error(`Circuit breaker opened for ${operationName} after ${circuit.failures} failures`);
      }
      
      throw error;
    }
  }

  /**
   * Get retry statistics
   */
  getRetryStats() {
    return {
      maxRetries: this.maxRetries,
      initialDelay: this.initialDelay,
      maxDelay: this.maxDelay,
      backoffMultiplier: this.backoffMultiplier,
      retryableErrors: this.retryableErrors,
      retryableStatusCodes: this.retryableStatusCodes,
      circuits: this.circuits ? Array.from(this.circuits.entries()) : []
    };
  }

  /**
   * Reset all circuit breakers
   */
  resetCircuitBreakers() {
    if (this.circuits) {
      for (const [key, circuit] of this.circuits) {
        circuit.state = 'CLOSED';
        circuit.failures = 0;
        circuit.lastFailureTime = 0;
        circuit.nextAttemptTime = 0;
      }
    }
  }

  /**
   * Configure retry parameters
   */
  configure(options) {
    if (options.maxRetries !== undefined) {
      this.maxRetries = options.maxRetries;
    }
    if (options.initialDelay !== undefined) {
      this.initialDelay = options.initialDelay;
    }
    if (options.maxDelay !== undefined) {
      this.maxDelay = options.maxDelay;
    }
    if (options.backoffMultiplier !== undefined) {
      this.backoffMultiplier = options.backoffMultiplier;
    }
    if (options.retryableErrors !== undefined) {
      this.retryableErrors = options.retryableErrors;
    }
    if (options.retryableStatusCodes !== undefined) {
      this.retryableStatusCodes = options.retryableStatusCodes;
    }
  }
}

module.exports = { MCPRetryHandler };