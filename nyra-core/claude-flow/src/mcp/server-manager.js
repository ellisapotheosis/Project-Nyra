/**
 * MCP Server Manager
 * Manages MCP server lifecycle and configuration
 */

const { MCPLogger } = require('./utils/logger');
const { MCPValidator } = require('./utils/validator');

class MCPServerManager {
  constructor(config) {
    this.config = config;
    this.logger = new MCPLogger('MCPServerManager');
    this.validator = new MCPValidator();
    
    // Server state
    this.servers = new Map();
    this.serverProcesses = new Map();
    this.serverHealth = new Map();
    
    // Configuration
    this.startupTimeout = config.get('performance.startupTimeout', 30000);
    this.healthCheckInterval = config.get('performance.healthCheckInterval', 60000);
  }

  /**
   * Start all configured MCP servers
   */
  async startServers() {
    try {
      this.logger.info('Starting MCP servers');
      const serverConfigs = this.config.getServers();
      const startPromises = [];

      for (const [serverName, serverConfig] of Object.entries(serverConfigs)) {
        if (serverConfig.disabled) {
          this.logger.debug(`Skipping disabled server: ${serverName}`);
          continue;
        }

        startPromises.push(this.startServer(serverName, serverConfig));
      }

      const results = await Promise.allSettled(startPromises);
      const failures = results.filter(result => result.status === 'rejected');
      
      if (failures.length > 0) {
        this.logger.warn(`${failures.length} servers failed to start`);
        failures.forEach((failure, index) => {
          this.logger.error(`Server start failure:`, failure.reason);
        });
      }

      this.logger.info(`Started ${results.length - failures.length} MCP servers successfully`);
      return this.getServerStatus();
    } catch (error) {
      this.logger.error('Failed to start MCP servers:', error);
      throw error;
    }
  }

  /**
   * Start a specific MCP server
   */
  async startServer(serverName, serverConfig) {
    try {
      this.logger.info(`Starting MCP server: ${serverName}`);
      
      // Validate server configuration
      if (!this.validator.isValidServerConfig(serverConfig)) {
        throw new Error(`Invalid server configuration for ${serverName}`);
      }

      // Check if server is already running
      if (this.servers.has(serverName)) {
        this.logger.debug(`Server already running: ${serverName}`);
        return this.servers.get(serverName);
      }

      // Start server based on type
      let serverInfo;
      switch (serverConfig.type) {
        case 'stdio':
          serverInfo = await this.startStdioServer(serverName, serverConfig);
          break;
        case 'http':
          serverInfo = await this.startHttpServer(serverName, serverConfig);
          break;
        case 'ws':
        case 'websocket':
          serverInfo = await this.startWebSocketServer(serverName, serverConfig);
          break;
        default:
          throw new Error(`Unsupported server type: ${serverConfig.type}`);
      }

      // Store server info
      this.servers.set(serverName, {
        ...serverInfo,
        name: serverName,
        type: serverConfig.type,
        startTime: new Date(),
        config: serverConfig
      });

      // Set initial health status
      this.serverHealth.set(serverName, {
        status: 'starting',
        lastCheck: new Date(),
        consecutiveFailures: 0
      });

      this.logger.info(`Successfully started MCP server: ${serverName}`);
      return this.servers.get(serverName);
    } catch (error) {
      this.logger.error(`Failed to start server ${serverName}:`, error);
      throw error;
    }
  }

  /**
   * Start STDIO-based MCP server
   */
  async startStdioServer(serverName, config) {
    const { spawn } = require('child_process');
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Server startup timeout: ${serverName}`));
      }, this.startupTimeout);

      try {
        // Resolve environment variables in command and args
        const command = this.resolveEnvironmentVariables(config.command);
        const args = (config.args || []).map(arg => 
          this.resolveEnvironmentVariables(arg)
        );

        const process = spawn(command, args, {
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { 
            ...process.env, 
            ...config.env,
            // Add server-specific environment variables
            MCP_SERVER_NAME: serverName
          }
        });

        // Store process reference
        this.serverProcesses.set(serverName, process);

        // Handle process events
        process.on('error', (error) => {
          clearTimeout(timeout);
          this.logger.error(`Server process error for ${serverName}:`, error);
          reject(error);
        });

        process.on('exit', (code, signal) => {
          this.logger.info(`Server process exited: ${serverName}, code: ${code}, signal: ${signal}`);
          this.handleServerExit(serverName, code, signal);
        });

        // Monitor stderr for startup messages
        let startupOutput = '';
        process.stderr.on('data', (data) => {
          startupOutput += data.toString();
          this.logger.debug(`${serverName} stderr:`, data.toString());
        });

        // Consider server started after brief delay
        setTimeout(() => {
          clearTimeout(timeout);
          resolve({
            process,
            pid: process.pid,
            command,
            args,
            startupOutput
          });
        }, 2000);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * Start HTTP-based MCP server (external service)
   */
  async startHttpServer(serverName, config) {
    // For HTTP servers, we don't start a process but validate the URL
    const url = this.resolveEnvironmentVariables(config.url);
    
    if (!url) {
      throw new Error(`No URL specified for HTTP server: ${serverName}`);
    }

    // Test connection to HTTP server
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: config.headers || {},
        timeout: 5000
      });

      return {
        url,
        headers: config.headers || {},
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      // HTTP server might not be ready yet, that's okay
      this.logger.debug(`HTTP server not immediately available: ${serverName}`, error.message);
      return {
        url,
        headers: config.headers || {},
        status: 'pending'
      };
    }
  }

  /**
   * Start WebSocket-based MCP server
   */
  async startWebSocketServer(serverName, config) {
    const url = this.resolveEnvironmentVariables(config.url);
    
    if (!url) {
      throw new Error(`No URL specified for WebSocket server: ${serverName}`);
    }

    // For WebSocket servers, we'll validate during connection
    return {
      url,
      headers: config.headers || {},
      protocol: 'websocket'
    };
  }

  /**
   * Stop a specific MCP server
   */
  async stopServer(serverName) {
    try {
      this.logger.info(`Stopping MCP server: ${serverName}`);
      
      const serverInfo = this.servers.get(serverName);
      if (!serverInfo) {
        this.logger.debug(`Server not running: ${serverName}`);
        return;
      }

      // Stop process if it exists
      const process = this.serverProcesses.get(serverName);
      if (process && !process.killed) {
        process.kill('SIGTERM');
        
        // Give process time to shut down gracefully
        await new Promise(resolve => {
          const timeout = setTimeout(() => {
            if (!process.killed) {
              process.kill('SIGKILL');
            }
            resolve();
          }, 5000);
          
          process.on('exit', () => {
            clearTimeout(timeout);
            resolve();
          });
        });
      }

      // Cleanup
      this.servers.delete(serverName);
      this.serverProcesses.delete(serverName);
      this.serverHealth.delete(serverName);

      this.logger.info(`Successfully stopped MCP server: ${serverName}`);
    } catch (error) {
      this.logger.error(`Failed to stop server ${serverName}:`, error);
      throw error;
    }
  }

  /**
   * Stop all MCP servers
   */
  async stopServers() {
    try {
      this.logger.info('Stopping all MCP servers');
      const serverNames = Array.from(this.servers.keys());
      
      const stopPromises = serverNames.map(serverName => 
        this.stopServer(serverName).catch(error => {
          this.logger.error(`Failed to stop server ${serverName}:`, error);
        })
      );

      await Promise.allSettled(stopPromises);
      this.logger.info('All MCP servers stopped');
    } catch (error) {
      this.logger.error('Error stopping servers:', error);
      throw error;
    }
  }

  /**
   * Restart a specific server
   */
  async restartServer(serverName) {
    try {
      this.logger.info(`Restarting MCP server: ${serverName}`);
      
      const serverInfo = this.servers.get(serverName);
      if (!serverInfo) {
        throw new Error(`Server not found: ${serverName}`);
      }

      const serverConfig = serverInfo.config;
      
      // Stop the server
      await this.stopServer(serverName);
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Start the server
      await this.startServer(serverName, serverConfig);
      
      this.logger.info(`Successfully restarted MCP server: ${serverName}`);
    } catch (error) {
      this.logger.error(`Failed to restart server ${serverName}:`, error);
      throw error;
    }
  }

  /**
   * Get server status information
   */
  getServerStatus() {
    const servers = Array.from(this.servers.entries()).map(([name, info]) => {
      const health = this.serverHealth.get(name) || {};
      return {
        name,
        type: info.type,
        status: health.status || 'unknown',
        startTime: info.startTime,
        uptime: Date.now() - info.startTime.getTime(),
        pid: info.pid,
        lastHealthCheck: health.lastCheck,
        consecutiveFailures: health.consecutiveFailures
      };
    });

    return {
      total: servers.length,
      running: servers.filter(s => s.status === 'healthy').length,
      starting: servers.filter(s => s.status === 'starting').length,
      unhealthy: servers.filter(s => s.status === 'unhealthy').length,
      servers
    };
  }

  /**
   * Handle server process exit
   */
  handleServerExit(serverName, code, signal) {
    const serverInfo = this.servers.get(serverName);
    if (!serverInfo) return;

    this.logger.warn(`Server ${serverName} exited with code ${code}, signal ${signal}`);
    
    // Update health status
    this.serverHealth.set(serverName, {
      status: 'stopped',
      lastCheck: new Date(),
      exitCode: code,
      exitSignal: signal,
      consecutiveFailures: (this.serverHealth.get(serverName)?.consecutiveFailures || 0) + 1
    });

    // Auto-restart if configured
    const config = this.config.getServerConfig(serverName);
    if (config && config.autoRestart && code !== 0) {
      this.logger.info(`Auto-restarting server: ${serverName}`);
      setTimeout(() => {
        this.startServer(serverName, config).catch(error => {
          this.logger.error(`Failed to auto-restart server ${serverName}:`, error);
        });
      }, 5000);
    }
  }

  /**
   * Resolve environment variables in strings
   */
  resolveEnvironmentVariables(str) {
    if (typeof str !== 'string') return str;
    
    return str.replace(/\$\{([^}]+)\}/g, (match, varName) => {
      const [name, defaultValue] = varName.split(':');
      return process.env[name] || defaultValue || match;
    });
  }

  /**
   * Get server configuration
   */
  getServerConfig(serverName) {
    const serverInfo = this.servers.get(serverName);
    return serverInfo ? serverInfo.config : null;
  }

  /**
   * Check if server is running
   */
  isServerRunning(serverName) {
    const serverInfo = this.servers.get(serverName);
    const health = this.serverHealth.get(serverName);
    
    return serverInfo && 
           health && 
           (health.status === 'healthy' || health.status === 'starting');
  }

  /**
   * Update server health status
   */
  updateServerHealth(serverName, status, details = {}) {
    const currentHealth = this.serverHealth.get(serverName) || {};
    
    this.serverHealth.set(serverName, {
      ...currentHealth,
      status,
      lastCheck: new Date(),
      consecutiveFailures: status === 'healthy' ? 0 : 
                          (currentHealth.consecutiveFailures || 0) + 1,
      ...details
    });

    this.logger.debug(`Server health updated: ${serverName} -> ${status}`);
  }

  /**
   * Cleanup all servers
   */
  async cleanup() {
    await this.stopServers();
  }
}

module.exports = MCPServerManager;