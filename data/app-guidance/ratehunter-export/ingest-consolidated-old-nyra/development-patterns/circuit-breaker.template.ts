/**
 * Circuit Breaker Template
 *
 * Pattern: Circuit Breaker Pattern
 * Purpose: Prevent cascading failures in distributed systems
 *
 * Usage:
 *   1. Copy to: packages/shared/src/resilience/circuit-breaker.ts
 *   2. Use to wrap external API calls or unreliable operations
 *
 * @author {{author}}
 * @date {{date}}
 */

import { EventEmitter } from 'events';
import { Logger } from '@nyra/shared/logger';

/**
 * Circuit breaker states
 */
export enum CircuitState {
  /** Circuit is closed, requests flow normally */
  CLOSED = 'CLOSED',
  /** Circuit is open, requests fail immediately */
  OPEN = 'OPEN',
  /** Circuit is testing if service has recovered */
  HALF_OPEN = 'HALF_OPEN'
}

/**
 * Circuit breaker configuration options
 */
export interface CircuitBreakerOptions {
  /** Number of consecutive failures before opening circuit */
  failureThreshold: number;
  /** Number of successful requests in HALF_OPEN state to close circuit */
  successThreshold: number;
  /** Time in ms to wait before attempting recovery */
  timeout: number;
  /** Time window in ms for failure threshold calculation */
  volumeThreshold?: number;
  /** Error filter - return true to count error, false to ignore */
  errorFilter?: (error: Error) => boolean;
  /** Callback when circuit state changes */
  onStateChange?: (state: CircuitState) => void;
  /** Callback when circuit opens */
  onOpen?: () => void;
  /** Callback when circuit closes */
  onClose?: () => void;
  /** Custom name for logging and monitoring */
  name?: string;
}

/**
 * Circuit breaker execution result
 */
export interface CircuitBreakerResult<T> {
  /** Whether the operation succeeded */
  success: boolean;
  /** Operation result (if successful) */
  data?: T;
  /** Error (if failed) */
  error?: Error;
  /** Current circuit state */
  state: CircuitState;
  /** Time taken in milliseconds */
  duration: number;
}

/**
 * Circuit breaker statistics
 */
export interface CircuitBreakerStats {
  /** Current circuit state */
  state: CircuitState;
  /** Total number of requests */
  totalRequests: number;
  /** Number of successful requests */
  successCount: number;
  /** Number of failed requests */
  failureCount: number;
  /** Number of rejected requests (circuit open) */
  rejectedCount: number;
  /** Current consecutive failure count */
  consecutiveFailures: number;
  /** Timestamp of last state change */
  lastStateChange: Date;
  /** Average execution time in ms */
  averageExecutionTime: number;
}

/**
 * Circuit Breaker implementation
 *
 * Prevents cascading failures by temporarily blocking requests
 * when failure threshold is exceeded.
 *
 * @example
 * ```typescript
 * const breaker = new CircuitBreaker({
 *   failureThreshold: 5,
 *   successThreshold: 2,
 *   timeout: 60000, // 1 minute
 *   onStateChange: (state) => {
 *     console.log(`Circuit breaker state: ${state}`);
 *   }
 * });
 *
 * async function callAPI() {
 *   return breaker.execute(async () => {
 *     const response = await fetch('https://api.example.com/data');
 *     return response.json();
 *   });
 * }
 * ```
 */
export class CircuitBreaker extends EventEmitter {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private consecutiveFailures = 0;
  private nextAttempt: number = Date.now();
  private stats = {
    totalRequests: 0,
    successCount: 0,
    failureCount: 0,
    rejectedCount: 0,
    totalExecutionTime: 0,
    lastStateChange: new Date()
  };

  constructor(
    private options: CircuitBreakerOptions,
    private logger?: Logger
  ) {
    super();

    // Validate options
    if (options.failureThreshold < 1) {
      throw new Error('failureThreshold must be at least 1');
    }
    if (options.successThreshold < 1) {
      throw new Error('successThreshold must be at least 1');
    }
    if (options.timeout < 1) {
      throw new Error('timeout must be at least 1');
    }

    this.logger?.info(`Circuit breaker initialized: ${this.getName()}`, {
      failureThreshold: options.failureThreshold,
      successThreshold: options.successThreshold,
      timeout: options.timeout
    });
  }

  /**
   * Execute operation with circuit breaker protection
   *
   * @param operation - Async operation to execute
   * @returns Operation result
   * @throws {Error} If circuit is open or operation fails
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.stats.totalRequests++;

    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        this.stats.rejectedCount++;
        const error = new Error(`Circuit breaker is OPEN for ${this.getName()}`);
        (error as any).code = 'CIRCUIT_OPEN';
        this.logger?.warn('Request rejected - circuit breaker open', {
          name: this.getName(),
          nextAttempt: new Date(this.nextAttempt)
        });
        throw error;
      }

      // Transition to HALF_OPEN to test recovery
      this.transitionTo(CircuitState.HALF_OPEN);
    }

    const startTime = Date.now();

    try {
      const result = await operation();
      const duration = Date.now() - startTime;

      this.onSuccess(duration);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.onFailure(error as Error, duration);
      throw error;
    }
  }

  /**
   * Execute operation and return result object instead of throwing
   *
   * @param operation - Async operation to execute
   * @returns Result object with success/failure information
   */
  async executeWithFallback<T>(
    operation: () => Promise<T>
  ): Promise<CircuitBreakerResult<T>> {
    const startTime = Date.now();

    try {
      const data = await this.execute(operation);
      const duration = Date.now() - startTime;

      return {
        success: true,
        data,
        state: this.state,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        error: error as Error,
        state: this.state,
        duration
      };
    }
  }

  /**
   * Handle successful operation
   */
  private onSuccess(duration: number): void {
    this.stats.successCount++;
    this.stats.totalExecutionTime += duration;
    this.failureCount = 0;
    this.consecutiveFailures = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;

      this.logger?.debug('Successful request in HALF_OPEN state', {
        name: this.getName(),
        successCount: this.successCount,
        threshold: this.options.successThreshold
      });

      if (this.successCount >= this.options.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
      }
    }
  }

  /**
   * Handle failed operation
   */
  private onFailure(error: Error, duration: number): void {
    // Check if error should be counted
    if (this.options.errorFilter && !this.options.errorFilter(error)) {
      this.logger?.debug('Error ignored by filter', {
        name: this.getName(),
        error: error.message
      });
      return;
    }

    this.stats.failureCount++;
    this.stats.totalExecutionTime += duration;
    this.failureCount++;
    this.consecutiveFailures++;
    this.successCount = 0;

    this.logger?.warn('Operation failed', {
      name: this.getName(),
      error: error.message,
      consecutiveFailures: this.consecutiveFailures,
      threshold: this.options.failureThreshold
    });

    if (this.consecutiveFailures >= this.options.failureThreshold) {
      this.transitionTo(CircuitState.OPEN);
      this.nextAttempt = Date.now() + this.options.timeout;

      this.logger?.error('Circuit breaker opened', {
        name: this.getName(),
        nextAttempt: new Date(this.nextAttempt)
      });
    }
  }

  /**
   * Transition to new circuit state
   */
  private transitionTo(newState: CircuitState): void {
    if (this.state === newState) {
      return;
    }

    const oldState = this.state;
    this.state = newState;
    this.stats.lastStateChange = new Date();

    this.logger?.info('Circuit breaker state changed', {
      name: this.getName(),
      oldState,
      newState
    });

    // Emit event
    this.emit('stateChange', newState, oldState);

    // Call callbacks
    this.options.onStateChange?.(newState);

    if (newState === CircuitState.OPEN) {
      this.options.onOpen?.();
      this.emit('open');
    } else if (newState === CircuitState.CLOSED) {
      this.options.onClose?.();
      this.emit('close');
    }
  }

  /**
   * Get current circuit breaker state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      totalRequests: this.stats.totalRequests,
      successCount: this.stats.successCount,
      failureCount: this.stats.failureCount,
      rejectedCount: this.stats.rejectedCount,
      consecutiveFailures: this.consecutiveFailures,
      lastStateChange: this.stats.lastStateChange,
      averageExecutionTime:
        this.stats.totalRequests > 0
          ? this.stats.totalExecutionTime / this.stats.totalRequests
          : 0
    };
  }

  /**
   * Manually reset circuit breaker to CLOSED state
   */
  reset(): void {
    this.logger?.info('Circuit breaker manually reset', {
      name: this.getName()
    });

    this.failureCount = 0;
    this.successCount = 0;
    this.consecutiveFailures = 0;
    this.nextAttempt = Date.now();
    this.transitionTo(CircuitState.CLOSED);
  }

  /**
   * Manually open circuit breaker
   */
  open(): void {
    this.logger?.info('Circuit breaker manually opened', {
      name: this.getName()
    });

    this.transitionTo(CircuitState.OPEN);
    this.nextAttempt = Date.now() + this.options.timeout;
  }

  /**
   * Check if circuit is currently open
   */
  isOpen(): boolean {
    return this.state === CircuitState.OPEN;
  }

  /**
   * Check if circuit is currently closed
   */
  isClosed(): boolean {
    return this.state === CircuitState.CLOSED;
  }

  /**
   * Get circuit breaker name for logging
   */
  private getName(): string {
    return this.options.name || 'unnamed';
  }
}

/**
 * Circuit breaker factory with common configurations
 */
export class CircuitBreakerFactory {
  /**
   * Create circuit breaker for external API calls
   */
  static createForAPI(name: string, logger?: Logger): CircuitBreaker {
    return new CircuitBreaker(
      {
        name: `api:${name}`,
        failureThreshold: 5,
        successThreshold: 2,
        timeout: 60000, // 1 minute
        errorFilter: (error) => {
          // Don't count client errors (4xx) as failures
          const status = (error as any).status;
          return !status || status >= 500;
        }
      },
      logger
    );
  }

  /**
   * Create circuit breaker for database operations
   */
  static createForDatabase(name: string, logger?: Logger): CircuitBreaker {
    return new CircuitBreaker(
      {
        name: `db:${name}`,
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 30000 // 30 seconds
      },
      logger
    );
  }

  /**
   * Create circuit breaker for microservice communication
   */
  static createForService(name: string, logger?: Logger): CircuitBreaker {
    return new CircuitBreaker(
      {
        name: `service:${name}`,
        failureThreshold: 5,
        successThreshold: 3,
        timeout: 45000 // 45 seconds
      },
      logger
    );
  }
}

/**
 * Usage Example:
 *
 * // Create circuit breaker for external API
 * const apiBreaker = CircuitBreakerFactory.createForAPI('payment-gateway', logger);
 *
 * // Use with try-catch
 * try {
 *   const result = await apiBreaker.execute(async () => {
 *     return await paymentGateway.processPayment(amount);
 *   });
 *   console.log('Payment processed:', result);
 * } catch (error) {
 *   console.error('Payment failed:', error.message);
 * }
 *
 * // Use with fallback
 * const result = await apiBreaker.executeWithFallback(async () => {
 *   return await paymentGateway.processPayment(amount);
 * });
 *
 * if (result.success) {
 *   console.log('Payment processed:', result.data);
 * } else {
 *   console.error('Payment failed:', result.error);
 *   // Use fallback logic
 * }
 *
 * // Monitor circuit breaker
 * apiBreaker.on('stateChange', (newState, oldState) => {
 *   console.log(`Circuit breaker changed: ${oldState} -> ${newState}`);
 * });
 *
 * // Get statistics
 * const stats = apiBreaker.getStats();
 * console.log('Circuit breaker stats:', stats);
 */
