/**
 * MCP Logger Utility
 * Centralized logging for MCP integration components
 */

class MCPLogger {
  constructor(component) {
    this.component = component;
    this.logLevel = process.env.MCP_LOG_LEVEL || 'info';
    this.enableConsole = process.env.MCP_CONSOLE_LOGGING !== 'false';
    this.enableFile = process.env.MCP_FILE_LOGGING === 'true';
    
    // Log levels (lower number = higher priority)
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4
    };
    
    this.currentLevel = this.levels[this.logLevel] || this.levels.info;
  }

  /**
   * Format log message with timestamp and component
   */
  formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.component}]`;
    
    if (args.length > 0) {
      return `${prefix} ${message} ${JSON.stringify(args)}`;
    }
    
    return `${prefix} ${message}`;
  }

  /**
   * Check if log level should be output
   */
  shouldLog(level) {
    return this.levels[level] <= this.currentLevel;
  }

  /**
   * Log error message
   */
  error(message, ...args) {
    if (this.shouldLog('error')) {
      const formatted = this.formatMessage('error', message, ...args);
      
      if (this.enableConsole) {
        console.error(formatted);
      }
      
      if (this.enableFile) {
        this.writeToFile('error', formatted);
      }
    }
  }

  /**
   * Log warning message
   */
  warn(message, ...args) {
    if (this.shouldLog('warn')) {
      const formatted = this.formatMessage('warn', message, ...args);
      
      if (this.enableConsole) {
        console.warn(formatted);
      }
      
      if (this.enableFile) {
        this.writeToFile('warn', formatted);
      }
    }
  }

  /**
   * Log info message
   */
  info(message, ...args) {
    if (this.shouldLog('info')) {
      const formatted = this.formatMessage('info', message, ...args);
      
      if (this.enableConsole) {
        console.log(formatted);
      }
      
      if (this.enableFile) {
        this.writeToFile('info', formatted);
      }
    }
  }

  /**
   * Log debug message
   */
  debug(message, ...args) {
    if (this.shouldLog('debug')) {
      const formatted = this.formatMessage('debug', message, ...args);
      
      if (this.enableConsole) {
        console.debug(formatted);
      }
      
      if (this.enableFile) {
        this.writeToFile('debug', formatted);
      }
    }
  }

  /**
   * Log trace message
   */
  trace(message, ...args) {
    if (this.shouldLog('trace')) {
      const formatted = this.formatMessage('trace', message, ...args);
      
      if (this.enableConsole) {
        console.trace(formatted);
      }
      
      if (this.enableFile) {
        this.writeToFile('trace', formatted);
      }
    }
  }

  /**
   * Write log message to file
   */
  writeToFile(level, message) {
    // In a production environment, you might want to use a proper logging library
    // like winston or bunyan for file logging with rotation, etc.
    try {
      const fs = require('fs');
      const path = require('path');
      
      const logDir = process.env.MCP_LOG_DIR || './logs';
      const logFile = path.join(logDir, `mcp-${new Date().toISOString().split('T')[0]}.log`);
      
      // Ensure log directory exists
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      // Append to log file
      fs.appendFileSync(logFile, message + '\n');
    } catch (error) {
      // Fallback to console if file logging fails
      console.error('Failed to write to log file:', error);
      console.log(message);
    }
  }

  /**
   * Log with custom level
   */
  log(level, message, ...args) {
    switch (level) {
      case 'error':
        this.error(message, ...args);
        break;
      case 'warn':
        this.warn(message, ...args);
        break;
      case 'info':
        this.info(message, ...args);
        break;
      case 'debug':
        this.debug(message, ...args);
        break;
      case 'trace':
        this.trace(message, ...args);
        break;
      default:
        this.info(message, ...args);
    }
  }

  /**
   * Create child logger with additional context
   */
  child(additionalContext) {
    const childLogger = new MCPLogger(`${this.component}:${additionalContext}`);
    childLogger.logLevel = this.logLevel;
    childLogger.enableConsole = this.enableConsole;
    childLogger.enableFile = this.enableFile;
    childLogger.currentLevel = this.currentLevel;
    return childLogger;
  }

  /**
   * Time a function execution and log the duration
   */
  async timeFunction(name, fn) {
    const start = Date.now();
    this.debug(`Starting ${name}`);
    
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.info(`Completed ${name} in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`Failed ${name} after ${duration}ms:`, error);
      throw error;
    }
  }

  /**
   * Log performance metrics
   */
  performance(operation, metrics) {
    this.info(`Performance [${operation}]:`, {
      duration: metrics.duration,
      memory: metrics.memory,
      cpu: metrics.cpu,
      ...metrics
    });
  }

  /**
   * Set log level dynamically
   */
  setLogLevel(level) {
    if (this.levels.hasOwnProperty(level)) {
      this.logLevel = level;
      this.currentLevel = this.levels[level];
      this.info(`Log level changed to: ${level}`);
    } else {
      this.warn(`Invalid log level: ${level}`);
    }
  }

  /**
   * Enable/disable console logging
   */
  setConsoleLogging(enabled) {
    this.enableConsole = enabled;
    this.info(`Console logging ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Enable/disable file logging
   */
  setFileLogging(enabled) {
    this.enableFile = enabled;
    this.info(`File logging ${enabled ? 'enabled' : 'disabled'}`);
  }
}

module.exports = { MCPLogger };