import { RedisClient } from './redis-client';
import { createLogger } from '../utils/logger';

const logger = createLogger('rate-limit-store');

/**
 * Rate limit configuration levels
 */
export interface RateLimitConfig {
  global: GlobalRateLimit;
  perIp: PerIpRateLimit;
  perServer: Record<string, ServerRateLimit>;
  perTool: Record<string, ToolRateLimit>;
  redis: RedisConfig;
}

export interface GlobalRateLimit {
  enabled: boolean;
  windowMs: number;
  maxRequests: number;
  message: string;
  backend: 'memory' | 'redis';
}

export interface PerIpRateLimit {
  enabled: boolean;
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  excludeIps: string[];
}

export interface ServerRateLimit {
  serverId: string;
  enabled: boolean;
  windowMs: number;
  maxRequests: number;
  priority: number;
}

export interface ToolRateLimit {
  toolId: string;
  enabled: boolean;
  windowMs: number;
  maxRequests: number;
  costWeight: number;
}

export interface RedisConfig {
  enabled: boolean;
  cluster: string[];
}

/**
 * Rate limit usage statistics
 */
export interface RateLimitStats {
  timestamp: string;
  global: {
    totalRequests: number;
    allowedRequests: number;
    blockedRequests: number;
    utilizationPercent: number;
  };
  perIp: {
    [ip: string]: {
      requests: number;
      allowedRequests: number;
      blockedRequests: number;
      utilizationPercent: number;
      lastRequest: string;
    };
  };
  perServer: {
    [serverId: string]: {
      requests: number;
      allowedRequests: number;
      blockedRequests: number;
      utilizationPercent: number;
      lastRequest: string;
    };
  };
  perTool: {
    [toolId: string]: {
      requests: number;
      allowedRequests: number;
      blockedRequests: number;
      utilizationPercent: number;
      lastRequest: string;
    };
  };
}

/**
 * RateLimitStore - Manages rate limit configuration and statistics
 */
export class RateLimitStore {
  private static instance: RateLimitStore;
  private config: RateLimitConfig;
  private stats: RateLimitStats;
  private statsCache: Map<string, any> = new Map();
  private memoryBackend: Map<string, number[]> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.stats = this.initializeStats();
  }

  static getInstance(): RateLimitStore {
    if (!RateLimitStore.instance) {
      RateLimitStore.instance = new RateLimitStore();
    }
    return RateLimitStore.instance;
  }

  /**
   * Initialize the store with auto-save to Redis
   */
  async initialize(): Promise<void> {
    try {
      // Try to load config from Redis
      const redis = RedisClient.getInstance();
      if (redis.isConnected()) {
        await this.loadConfigFromRedis();
        logger.info('Rate limit config loaded from Redis');
      } else {
        logger.warn('Redis not available - using default rate limit config');
      }

      // Start stats update interval
      this.startStatsInterval();
    } catch (error) {
      logger.error('Failed to initialize rate limit store, using defaults:', error);
    }
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): RateLimitConfig {
    return {
      global: {
        enabled: true,
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 1000,
        message: 'Too many requests from system, please try again later',
        backend: 'redis',
      },
      perIp: {
        enabled: true,
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 300,
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
        excludeIps: ['127.0.0.1', '::1'],
      },
      perServer: {},
      perTool: {},
      redis: {
        enabled: true,
        cluster: [],
      },
    };
  }

  /**
   * Initialize statistics
   */
  private initializeStats(): RateLimitStats {
    return {
      timestamp: new Date().toISOString(),
      global: {
        totalRequests: 0,
        allowedRequests: 0,
        blockedRequests: 0,
        utilizationPercent: 0,
      },
      perIp: {},
      perServer: {},
      perTool: {},
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): RateLimitConfig {
    return JSON.parse(JSON.stringify(this.config));
  }

  /**
   * Update configuration
   */
  async updateConfig(updates: Partial<RateLimitConfig>): Promise<void> {
    try {
      // Deep merge configuration
      if (updates.global) {
        this.config.global = { ...this.config.global, ...updates.global };
      }
      if (updates.perIp) {
        this.config.perIp = { ...this.config.perIp, ...updates.perIp };
      }
      if (updates.perServer) {
        this.config.perServer = { ...this.config.perServer, ...updates.perServer };
      }
      if (updates.perTool) {
        this.config.perTool = { ...this.config.perTool, ...updates.perTool };
      }
      if (updates.redis) {
        this.config.redis = { ...this.config.redis, ...updates.redis };
      }

      // Save to Redis
      await this.saveConfigToRedis();
      logger.info('Rate limit config updated', { updates });
    } catch (error) {
      logger.error('Failed to update rate limit config:', error);
      throw error;
    }
  }

  /**
   * Add or update per-server rate limit
   */
  async addServerLimit(serverId: string, limit: ServerRateLimit): Promise<void> {
    try {
      this.config.perServer[serverId] = limit;
      await this.saveConfigToRedis();
      logger.info(`Server rate limit added: ${serverId}`, { limit });
    } catch (error) {
      logger.error(`Failed to add server rate limit: ${serverId}`, error);
      throw error;
    }
  }

  /**
   * Remove per-server rate limit
   */
  async removeServerLimit(serverId: string): Promise<void> {
    try {
      delete this.config.perServer[serverId];
      await this.saveConfigToRedis();
      logger.info(`Server rate limit removed: ${serverId}`);
    } catch (error) {
      logger.error(`Failed to remove server rate limit: ${serverId}`, error);
      throw error;
    }
  }

  /**
   * Add or update per-tool rate limit
   */
  async addToolLimit(toolId: string, limit: ToolRateLimit): Promise<void> {
    try {
      this.config.perTool[toolId] = limit;
      await this.saveConfigToRedis();
      logger.info(`Tool rate limit added: ${toolId}`, { limit });
    } catch (error) {
      logger.error(`Failed to add tool rate limit: ${toolId}`, error);
      throw error;
    }
  }

  /**
   * Remove per-tool rate limit
   */
  async removeToolLimit(toolId: string): Promise<void> {
    try {
      delete this.config.perTool[toolId];
      await this.saveConfigToRedis();
      logger.info(`Tool rate limit removed: ${toolId}`);
    } catch (error) {
      logger.error(`Failed to remove tool rate limit: ${toolId}`, error);
      throw error;
    }
  }

  /**
   * Record request for statistics
   */
  recordRequest(
    type: 'global' | 'ip' | 'server' | 'tool',
    key: string,
    allowed: boolean
  ): void {
    const timestamp = Date.now();

    switch (type) {
      case 'global':
        this.stats.global.totalRequests++;
        if (allowed) {
          this.stats.global.allowedRequests++;
        } else {
          this.stats.global.blockedRequests++;
        }
        break;

      case 'ip':
        if (!this.stats.perIp[key]) {
          this.stats.perIp[key] = {
            requests: 0,
            allowedRequests: 0,
            blockedRequests: 0,
            utilizationPercent: 0,
            lastRequest: new Date().toISOString(),
          };
        }
        this.stats.perIp[key].requests++;
        if (allowed) {
          this.stats.perIp[key].allowedRequests++;
        } else {
          this.stats.perIp[key].blockedRequests++;
        }
        this.stats.perIp[key].lastRequest = new Date().toISOString();
        break;

      case 'server':
        if (!this.stats.perServer[key]) {
          this.stats.perServer[key] = {
            requests: 0,
            allowedRequests: 0,
            blockedRequests: 0,
            utilizationPercent: 0,
            lastRequest: new Date().toISOString(),
          };
        }
        this.stats.perServer[key].requests++;
        if (allowed) {
          this.stats.perServer[key].allowedRequests++;
        } else {
          this.stats.perServer[key].blockedRequests++;
        }
        this.stats.perServer[key].lastRequest = new Date().toISOString();
        break;

      case 'tool':
        if (!this.stats.perTool[key]) {
          this.stats.perTool[key] = {
            requests: 0,
            allowedRequests: 0,
            blockedRequests: 0,
            utilizationPercent: 0,
            lastRequest: new Date().toISOString(),
          };
        }
        this.stats.perTool[key].requests++;
        if (allowed) {
          this.stats.perTool[key].allowedRequests++;
        } else {
          this.stats.perTool[key].blockedRequests++;
        }
        this.stats.perTool[key].lastRequest = new Date().toISOString();
        break;
    }
  }

  /**
   * Calculate utilization percentage
   */
  private calculateUtilization(current: number, max: number): number {
    return max > 0 ? Math.round((current / max) * 100) : 0;
  }

  /**
   * Get current statistics
   */
  getStats(): RateLimitStats {
    const stats = JSON.parse(JSON.stringify(this.stats));
    stats.timestamp = new Date().toISOString();

    // Update utilization percentages
    const globalConfig = this.config.global;
    stats.global.utilizationPercent = this.calculateUtilization(
      stats.global.allowedRequests,
      globalConfig.maxRequests
    );

    const perIpConfig = this.config.perIp;
    Object.keys(stats.perIp).forEach((ip) => {
      stats.perIp[ip].utilizationPercent = this.calculateUtilization(
        stats.perIp[ip].allowedRequests,
        perIpConfig.maxRequests
      );
    });

    Object.keys(stats.perServer).forEach((serverId) => {
      const serverConfig = this.config.perServer[serverId];
      if (serverConfig) {
        stats.perServer[serverId].utilizationPercent = this.calculateUtilization(
          stats.perServer[serverId].allowedRequests,
          serverConfig.maxRequests
        );
      }
    });

    Object.keys(stats.perTool).forEach((toolId) => {
      const toolConfig = this.config.perTool[toolId];
      if (toolConfig) {
        stats.perTool[toolId].utilizationPercent = this.calculateUtilization(
          stats.perTool[toolId].allowedRequests,
          toolConfig.maxRequests
        );
      }
    });

    return stats;
  }

  /**
   * Get stats for a specific level
   */
  getStatsByLevel(
    level: 'global' | 'perIp' | 'perServer' | 'perTool'
  ): Record<string, any> {
    const stats = this.getStats();
    return stats[level] || {};
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = this.initializeStats();
    logger.info('Rate limit statistics reset');
  }

  /**
   * Save config to Redis
   */
  private async saveConfigToRedis(): Promise<void> {
    try {
      const redis = RedisClient.getInstance();
      if (redis.isConnected()) {
        const configJson = JSON.stringify(this.config);
        await redis.set('nexus:rate-limit:config', configJson);
        logger.debug('Rate limit config saved to Redis');
      }
    } catch (error) {
      logger.error('Failed to save rate limit config to Redis:', error);
    }
  }

  /**
   * Load config from Redis
   */
  private async loadConfigFromRedis(): Promise<void> {
    try {
      const redis = RedisClient.getInstance();
      if (redis.isConnected()) {
        const configJson = await redis.get('nexus:rate-limit:config');
        if (configJson) {
          this.config = JSON.parse(configJson);
          logger.debug('Rate limit config loaded from Redis');
        }
      }
    } catch (error) {
      logger.error('Failed to load rate limit config from Redis:', error);
    }
  }

  /**
   * Start stats update interval
   */
  private startStatsInterval(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Update stats every 5 seconds
    this.updateInterval = setInterval(() => {
      try {
        this.statsCache.clear();
      } catch (error) {
        logger.error('Error in stats update interval:', error);
      }
    }, 5000);
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}
