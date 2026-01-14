/**
 * MCP Integration Core Module
 * Provides unified interface for all MCP server interactions
 */

const EventEmitter = require('events');
const mcpIntegration = require('../../config/mcp-integration');

class MCPCore extends EventEmitter {
  constructor() {
    super();
    this.isInitialized = false;
    this.activeConnections = new Map();
    this.operationQueue = [];
    this.metrics = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      fallbackUsage: 0
    };
  }

  async initialize() {
    if (this.isInitialized) {
      return { status: 'already_initialized' };
    }

    try {
      const config = mcpIntegration.config;
      
      Object.keys(config.servers || {}).forEach(serverName => {
        this.activeConnections.set(serverName, {
          status: 'disconnected',
          lastCheck: null,
          errorCount: 0
        });
      });

      this.isInitialized = true;
      this.emit('initialized');

      return {
        status: 'success',
        serversConfigured: this.activeConnections.size,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.emit('error', error);
      throw new Error(`MCP initialization failed: ${error.message}`);
    }
  }

  getStatus() {
    const health = mcpIntegration.getHealthReport();
    
    return {
      initialized: this.isInitialized,
      health: health,
      metrics: this.metrics,
      activeConnections: this.activeConnections.size,
      timestamp: new Date().toISOString()
    };
  }

  async shutdown() {
    if (!this.isInitialized) {
      return { status: 'not_initialized' };
    }

    try {
      this.operationQueue = [];
      this.activeConnections.clear();
      this.isInitialized = false;
      this.emit('shutdown');

      return {
        status: 'success',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.emit('error', error);
      throw new Error(`MCP shutdown failed: ${error.message}`);
    }
  }
}

module.exports = MCPCore;
