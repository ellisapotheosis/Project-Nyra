/**
 * MCP Connection Manager
 * Handles connections to MCP servers with retry logic and connection pooling
 */

const EventEmitter = require('events');
const { MCPLogger } = require('./utils/logger');
const { MCPRetryHandler } = require('./utils/retry-handler');
const { MCPValidator } = require('./utils/validator');

class MCPConnectionManager extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.logger = new MCPLogger('MCPConnectionManager');
    this.retryHandler = new MCPRetryHandler();
    this.validator = new MCPValidator();
    
    // Connection pools
    this.connections = new Map();
    this.connectionQueue = new Map();
    this.healthChecks = new Map();
    
    // Configuration
    this.maxConnections = config.get('performance.maxConnections', 10);
    this.connectionTimeout = config.get('performance.connectionTimeout', 30000);
    this.healthCheckInterval = config.get('performance.healthCheckInterval', 60000);
    
    // Start health monitoring
    this.startHealthMonitoring();
  }

  /**
   * Connect to an MCP server
   */
  async connect(serverName) {
    try {
      // Validate server name
      if (!this.validator.isValidServerName(serverName)) {
        throw new Error(`Invalid server name: ${serverName}`);
      }

      // Check if already connected
      if (this.connections.has(serverName)) {
        const connection = this.connections.get(serverName);
        if (await this.isConnectionHealthy(connection)) {
          return connection;
        } else {
          // Cleanup stale connection
          await this.disconnect(serverName);
        }
      }

      // Check connection queue to prevent concurrent connections
      if (this.connectionQueue.has(serverName)) {
        return await this.connectionQueue.get(serverName);
      }

      // Create connection promise and add to queue
      const connectionPromise = this.createConnection(serverName);
      this.connectionQueue.set(serverName, connectionPromise);

      try {
        const connection = await connectionPromise;
        this.connections.set(serverName, connection);
        this.connectionQueue.delete(serverName);
        
        this.logger.info(`Successfully connected to MCP server: ${serverName}`);
        this.emit('connected', { serverName, connection });
        
        return connection;
      } catch (error) {
        this.connectionQueue.delete(serverName);
        throw error;
      }
    } catch (error) {
      this.logger.error(`Failed to connect to server ${serverName}:`, error);
      this.emit('connectionError', { serverName, error });
      throw error;
    }
  }

  /**
   * Create a new connection to an MCP server
   */
  async createConnection(serverName) {
    const serverConfig = this.config.getServerConfig(serverName);
    if (!serverConfig) {
      throw new Error(`Server configuration not found: ${serverName}`);
    }

    // Create connection based on server type
    let connection;
    switch (serverConfig.type) {
      case 'stdio':
        connection = await this.createStdioConnection(serverName, serverConfig);
        break;
      case 'http':
        connection = await this.createHttpConnection(serverName, serverConfig);
        break;
      case 'ws':
      case 'websocket':
        connection = await this.createWebSocketConnection(serverName, serverConfig);
        break;
      default:
        throw new Error(`Unsupported server type: ${serverConfig.type}`);
    }

    // Wrap connection with retry logic
    return this.wrapWithRetryLogic(connection, serverName);
  }

  /**
   * Create STDIO-based MCP connection
   */
  async createStdioConnection(serverName, config) {
    const { spawn } = require('child_process');
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Connection timeout for server: ${serverName}`));
      }, this.connectionTimeout);

      try {
        const process = spawn(config.command, config.args || [], {
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, ...config.env }
        });

        const connection = new MCPStdioConnection(serverName, process, this.logger);
        
        connection.once('ready', () => {
          clearTimeout(timeout);
          resolve(connection);
        });

        connection.once('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });

        // Initialize connection
        connection.initialize();
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * Create HTTP-based MCP connection
   */
  async createHttpConnection(serverName, config) {
    const MCPHttpConnection = require('./connections/http-connection');
    
    const connection = new MCPHttpConnection(serverName, {
      url: config.url,
      headers: config.headers || {},
      timeout: this.connectionTimeout,
      logger: this.logger
    });

    await connection.initialize();
    return connection;
  }

  /**
   * Create WebSocket-based MCP connection
   */
  async createWebSocketConnection(serverName, config) {
    const MCPWebSocketConnection = require('./connections/websocket-connection');
    
    const connection = new MCPWebSocketConnection(serverName, {
      url: config.url,
      headers: config.headers || {},
      timeout: this.connectionTimeout,
      logger: this.logger
    });

    await connection.initialize();
    return connection;
  }

  /**
   * Wrap connection with retry logic
   */
  wrapWithRetryLogic(connection, serverName) {
    const originalExecuteTool = connection.executeTool.bind(connection);
    const originalAccessResource = connection.accessResource.bind(connection);

    connection.executeTool = async (toolName, parameters) => {
      return await this.retryHandler.executeWithRetry(
        () => originalExecuteTool(toolName, parameters),
        `${serverName}/${toolName}`,
        this.logger
      );
    };

    connection.accessResource = async (resourceUri) => {
      return await this.retryHandler.executeWithRetry(
        () => originalAccessResource(resourceUri),
        `${serverName}/${resourceUri}`,
        this.logger
      );
    };

    return connection;
  }

  /**
   * Disconnect from an MCP server
   */
  async disconnect(serverName) {
    try {
      const connection = this.connections.get(serverName);
      if (connection) {
        await connection.disconnect();
        this.connections.delete(serverName);
        this.logger.info(`Disconnected from MCP server: ${serverName}`);
        this.emit('disconnected', { serverName });
      }
      
      // Clear health check
      const healthCheck = this.healthChecks.get(serverName);
      if (healthCheck) {
        clearInterval(healthCheck);
        this.healthChecks.delete(serverName);
      }
    } catch (error) {
      this.logger.error(`Error disconnecting from server ${serverName}:`, error);
      throw error;
    }
  }

  /**
   * Test all server connections
   */
  async testConnections() {
    const serverNames = this.config.getServerNames();
    const results = {};

    for (const serverName of serverNames) {
      try {
        const connection = await this.connect(serverName);
        const isHealthy = await this.isConnectionHealthy(connection);
        results[serverName] = { 
          status: isHealthy ? 'healthy' : 'unhealthy',
          connected: true
        };
      } catch (error) {
        results[serverName] = { 
          status: 'error', 
          connected: false, 
          error: error.message 
        };
      }
    }

    this.logger.info('Connection test results:', results);
    return results;
  }

  /**
   * Check if connection is healthy
   */
  async isConnectionHealthy(connection) {
    try {
      return await connection.ping();
    } catch (error) {
      this.logger.debug('Health check failed:', error.message);
      return false;
    }
  }

  /**
   * Start health monitoring for connections
   */
  startHealthMonitoring() {
    setInterval(async () => {
      for (const [serverName, connection] of this.connections) {
        try {
          const isHealthy = await this.isConnectionHealthy(connection);
          if (!isHealthy) {
            this.logger.warn(`Unhealthy connection detected: ${serverName}`);
            this.emit('connectionUnhealthy', { serverName, connection });
            
            // Attempt to reconnect
            await this.disconnect(serverName);
            // Connection will be re-established on next use
          }
        } catch (error) {
          this.logger.error(`Health check error for ${serverName}:`, error);
        }
      }
    }, this.healthCheckInterval);
  }

  /**
   * Get connection statistics
   */
  getConnectionStats() {
    return {
      totalConnections: this.connections.size,
      queuedConnections: this.connectionQueue.size,
      serverNames: Array.from(this.connections.keys()),
      maxConnections: this.maxConnections
    };
  }

  /**
   * Cleanup all connections
   */
  async cleanup() {
    this.logger.info('Cleaning up all MCP connections');
    
    const disconnectPromises = Array.from(this.connections.keys())
      .map(serverName => this.disconnect(serverName));
    
    await Promise.allSettled(disconnectPromises);
    
    // Clear all maps
    this.connections.clear();
    this.connectionQueue.clear();
    this.healthChecks.clear();
    
    this.logger.info('MCP connection cleanup complete');
  }
}

/**
 * STDIO Connection Implementation
 */
class MCPStdioConnection extends EventEmitter {
  constructor(serverName, process, logger) {
    super();
    this.serverName = serverName;
    this.process = process;
    this.logger = logger;
    this.messageQueue = [];
    this.requestId = 0;
    this.pendingRequests = new Map();
    
    this.setupProcess();
  }

  setupProcess() {
    this.process.stdout.on('data', (data) => {
      this.handleMessage(data.toString());
    });

    this.process.stderr.on('data', (data) => {
      this.logger.debug(`${this.serverName} stderr:`, data.toString());
    });

    this.process.on('error', (error) => {
      this.logger.error(`Process error for ${this.serverName}:`, error);
      this.emit('error', error);
    });

    this.process.on('exit', (code) => {
      this.logger.info(`Process exited for ${this.serverName} with code:`, code);
      this.emit('disconnected');
    });
  }

  async initialize() {
    // Send initialization request
    await this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {},
        resources: {}
      },
      clientInfo: {
        name: 'claude-flow-mcp',
        version: '1.0.0'
      }
    });
    
    this.emit('ready');
  }

  async sendRequest(method, params = {}) {
    const id = ++this.requestId;
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      
      const message = JSON.stringify(request) + '\n';
      this.process.stdin.write(message);
      
      // Timeout handling
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request timeout: ${method}`));
        }
      }, 30000);
    });
  }

  handleMessage(data) {
    const lines = data.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      try {
        const message = JSON.parse(line);
        
        if (message.id && this.pendingRequests.has(message.id)) {
          const { resolve, reject } = this.pendingRequests.get(message.id);
          this.pendingRequests.delete(message.id);
          
          if (message.error) {
            reject(new Error(message.error.message || 'Unknown error'));
          } else {
            resolve(message.result);
          }
        }
      } catch (error) {
        this.logger.error('Failed to parse message:', error, 'Data:', line);
      }
    }
  }

  async executeTool(toolName, parameters) {
    return await this.sendRequest('tools/call', {
      name: toolName,
      arguments: parameters
    });
  }

  async accessResource(resourceUri) {
    return await this.sendRequest('resources/read', {
      uri: resourceUri
    });
  }

  async listTools() {
    return await this.sendRequest('tools/list');
  }

  async listResources() {
    return await this.sendRequest('resources/list');
  }

  async ping() {
    try {
      await this.sendRequest('ping');
      return true;
    } catch (error) {
      return false;
    }
  }

  async disconnect() {
    if (this.process && !this.process.killed) {
      this.process.kill();
    }
  }
}

module.exports = MCPConnectionManager;