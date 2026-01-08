/**
 * MCP Configuration Manager
 * Handles loading and managing MCP server configurations
 */

const fs = require('fs');
const path = require('path');
const { MCPLogger } = require('../utils/logger');
const { MCPValidator } = require('../utils/validator');

class MCPConfig {
  constructor(configPath) {
    this.logger = new MCPLogger('MCPConfig');
    this.validator = new MCPValidator();
    
    // Configuration paths
    this.configPath = configPath || this.findConfigPath();
    this.customFunctions = new Map();
    
    // Configuration data
    this.config = {
      mcpServers: {},
      performance: {
        maxConnections: 10,
        connectionTimeout: 30000,
        healthCheckInterval: 60000,
        tokenExpiry: 3600000,
        sessionExpiry: 86400000
      },
      auth: {
        tokenExpiry: 3600000,
        sessionExpiry: 86400000,
        maxRetries: 3
      },
      logging: {
        level: 'info',
        enableConsole: true,
        enableFile: false
      }
    };
    
    this.logger.info(`MCP configuration manager initialized with path: ${this.configPath}`);
  }

  /**
   * Find configuration file path
   */
  findConfigPath() {
    const possiblePaths = [
      './mcp.json',
      './config/mcp.json',
      './claude-flow.config.json',
      process.env.MCP_CONFIG_PATH
    ].filter(Boolean);
    
    for (const configPath of possiblePaths) {
      try {
        if (fs.existsSync(configPath)) {
          this.logger.debug(`Found configuration file: ${configPath}`);
          return path.resolve(configPath);
        }
      } catch (error) {
        this.logger.debug(`Error checking config path ${configPath}:`, error.message);
      }
    }
    
    this.logger.warn('No configuration file found, using default configuration');
    return null;
  }

  /**
   * Load configuration from file
   */
  async load() {
    try {
      if (!this.configPath) {
        this.logger.info('Using default configuration (no config file found)');
        return this.config;
      }

      this.logger.info(`Loading MCP configuration from: ${this.configPath}`);
      
      const configData = fs.readFileSync(this.configPath, 'utf8');
      const parsedConfig = JSON.parse(configData);
      
      // Merge with default configuration
      this.config = this.mergeConfig(this.config, parsedConfig);
      
      // Validate configuration
      const validationResult = this.validateConfig();
      if (!validationResult.valid) {
        this.logger.error('Configuration validation failed:', validationResult.errors);
        throw new Error('Invalid configuration: ' + validationResult.errors.join(', '));
      }
      
      // Process environment variables
      this.processEnvironmentVariables();
      
      this.logger.info('MCP configuration loaded successfully');
      return this.config;
    } catch (error) {
      this.logger.error('Failed to load MCP configuration:', error);
      throw error;
    }
  }

  /**
   * Merge configuration objects
   */
  mergeConfig(defaultConfig, userConfig) {
    const merged = { ...defaultConfig };
    
    for (const [key, value] of Object.entries(userConfig)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        merged[key] = this.mergeConfig(merged[key] || {}, value);
      } else {
        merged[key] = value;
      }
    }
    
    return merged;
  }

  /**
   * Validate configuration
   */
  validateConfig() {
    const errors = [];
    
    // Validate MCP servers
    if (this.config.mcpServers) {
      for (const [serverName, serverConfig] of Object.entries(this.config.mcpServers)) {
        if (!this.validator.isValidServerName(serverName)) {
          errors.push(`Invalid server name: ${serverName}`);
        }
        
        if (!this.validator.isValidServerConfig(serverConfig)) {
          errors.push(`Invalid configuration for server: ${serverName}`);
        }
      }
    }
    
    // Validate performance settings
    if (this.config.performance) {
      const perf = this.config.performance;
      
      if (perf.maxConnections && (typeof perf.maxConnections !== 'number' || perf.maxConnections < 1)) {
        errors.push('Invalid maxConnections value');
      }
      
      if (perf.connectionTimeout && !this.validator.isValidTimeout(perf.connectionTimeout)) {
        errors.push('Invalid connectionTimeout value');
      }
      
      if (perf.healthCheckInterval && !this.validator.isValidTimeout(perf.healthCheckInterval)) {
        errors.push('Invalid healthCheckInterval value');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Process environment variables in configuration
   */
  processEnvironmentVariables() {
    this.config = this.resolveEnvironmentVariables(this.config);
  }

  /**
   * Recursively resolve environment variables
   */
  resolveEnvironmentVariables(obj) {
    if (typeof obj === 'string') {
      return this.resolveEnvironmentVariable(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.resolveEnvironmentVariables(item));
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.resolveEnvironmentVariables(value);
      }
      return result;
    }
    
    return obj;
  }

  /**
   * Resolve a single environment variable
   */
  resolveEnvironmentVariable(str) {
    return str.replace(/\$\{([^}]+)\}/g, (match, varExpression) => {
      const [varName, defaultValue] = varExpression.split(':');
      const value = process.env[varName];
      
      if (value !== undefined) {
        return value;
      }
      
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      
      this.logger.warn(`Environment variable not found: ${varName}`);
      return match;
    });
  }

  /**
   * Get server configuration
   */
  getServerConfig(serverName) {
    return this.config.mcpServers?.[serverName] || null;
  }

  /**
   * Get all servers
   */
  getServers() {
    return this.config.mcpServers || {};
  }

  /**
   * Get enabled server names
   */
  getServerNames() {
    const servers = this.getServers();
    return Object.keys(servers).filter(serverName => {
      const config = servers[serverName];
      return !config.disabled;
    });
  }

  /**
   * Get configuration value
   */
  get(path, defaultValue) {
    const keys = path.split('.');
    let current = this.config;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && current.hasOwnProperty(key)) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }
    
    return current;
  }

  /**
   * Set configuration value
   */
  set(path, value) {
    const keys = path.split('.');
    let current = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  }

  /**
   * Add or update server configuration
   */
  addServer(serverName, serverConfig) {
    if (!this.validator.isValidServerName(serverName)) {
      throw new Error(`Invalid server name: ${serverName}`);
    }
    
    if (!this.validator.isValidServerConfig(serverConfig)) {
      throw new Error(`Invalid server configuration for: ${serverName}`);
    }
    
    if (!this.config.mcpServers) {
      this.config.mcpServers = {};
    }
    
    this.config.mcpServers[serverName] = serverConfig;
    this.logger.info(`Added/updated server configuration: ${serverName}`);
  }

  /**
   * Remove server configuration
   */
  removeServer(serverName) {
    if (this.config.mcpServers && this.config.mcpServers[serverName]) {
      delete this.config.mcpServers[serverName];
      this.logger.info(`Removed server configuration: ${serverName}`);
    }
  }

  /**
   * Enable server
   */
  enableServer(serverName) {
    const serverConfig = this.getServerConfig(serverName);
    if (serverConfig) {
      serverConfig.disabled = false;
      this.logger.info(`Enabled server: ${serverName}`);
    }
  }

  /**
   * Disable server
   */
  disableServer(serverName) {
    const serverConfig = this.getServerConfig(serverName);
    if (serverConfig) {
      serverConfig.disabled = true;
      this.logger.info(`Disabled server: ${serverName}`);
    }
  }

  /**
   * Register custom function
   */
  registerCustomFunction(name, fn) {
    if (typeof fn !== 'function') {
      throw new Error('Custom function must be a function');
    }
    
    this.customFunctions.set(name, fn);
    this.logger.debug(`Registered custom function: ${name}`);
  }

  /**
   * Get custom function
   */
  getCustomFunction(name) {
    return this.customFunctions.get(name);
  }

  /**
   * Save configuration to file
   */
  async save(filePath) {
    try {
      const targetPath = filePath || this.configPath;
      
      if (!targetPath) {
        throw new Error('No configuration file path specified');
      }
      
      // Create backup of existing file
      if (fs.existsSync(targetPath)) {
        const backupPath = `${targetPath}.backup.${Date.now()}`;
        fs.copyFileSync(targetPath, backupPath);
        this.logger.debug(`Created configuration backup: ${backupPath}`);
      }
      
      // Write configuration
      const configData = JSON.stringify(this.config, null, 2);
      fs.writeFileSync(targetPath, configData);
      
      this.logger.info(`Configuration saved to: ${targetPath}`);
    } catch (error) {
      this.logger.error('Failed to save configuration:', error);
      throw error;
    }
  }

  /**
   * Reload configuration from file
   */
  async reload() {
    this.logger.info('Reloading MCP configuration');
    return await this.load();
  }

  /**
   * Get configuration summary
   */
  getSummary() {
    const servers = this.getServers();
    const serverCount = Object.keys(servers).length;
    const enabledServers = this.getServerNames().length;
    
    return {
      configPath: this.configPath,
      totalServers: serverCount,
      enabledServers: enabledServers,
      disabledServers: serverCount - enabledServers,
      customFunctions: this.customFunctions.size,
      performance: this.config.performance,
      auth: this.config.auth
    };
  }

  /**
   * Export configuration (without sensitive data)
   */
  exportConfig(includeSensitive = false) {
    const exported = JSON.parse(JSON.stringify(this.config));
    
    if (!includeSensitive) {
      // Remove sensitive information
      if (exported.mcpServers) {
        for (const serverConfig of Object.values(exported.mcpServers)) {
          if (serverConfig.headers?.Authorization) {
            serverConfig.headers.Authorization = '[REDACTED]';
          }
          if (serverConfig.apiKey) {
            serverConfig.apiKey = '[REDACTED]';
          }
          if (serverConfig.auth) {
            serverConfig.auth = '[REDACTED]';
          }
        }
      }
    }
    
    return exported;
  }
}

module.exports = { MCPConfig };