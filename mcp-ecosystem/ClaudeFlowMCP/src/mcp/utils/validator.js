/**
 * MCP Validator
 * Validation utilities for MCP integration
 */

class MCPValidator {
  constructor() {
    // Validation patterns
    this.patterns = {
      serverName: /^[a-zA-Z0-9][a-zA-Z0-9-_]*[a-zA-Z0-9]$/,
      toolName: /^[a-zA-Z0-9][a-zA-Z0-9-_/.]*[a-zA-Z0-9]$/,
      resourceUri: /^[a-zA-Z][a-zA-Z0-9+.-]*:/,
      url: /^https?:\/\/.+/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    };
    
    // Security patterns to detect potential threats
    this.securityPatterns = {
      xss: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      sqlInjection: /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
      pathTraversal: /\.\.[\/\\]/g,
      commandInjection: /[;&|`$()]/g
    };
  }

  /**
   * Validate server name
   */
  isValidServerName(serverName) {
    if (!serverName || typeof serverName !== 'string') {
      return false;
    }
    
    return this.patterns.serverName.test(serverName) &&
           serverName.length >= 2 &&
           serverName.length <= 50;
  }

  /**
   * Validate tool name
   */
  isValidToolName(toolName) {
    if (!toolName || typeof toolName !== 'string') {
      return false;
    }
    
    return this.patterns.toolName.test(toolName) &&
           toolName.length >= 1 &&
           toolName.length <= 100;
  }

  /**
   * Validate resource URI
   */
  isValidResourceUri(uri) {
    if (!uri || typeof uri !== 'string') {
      return false;
    }
    
    return this.patterns.resourceUri.test(uri) &&
           uri.length <= 2048;
  }

  /**
   * Validate URL
   */
  isValidUrl(url) {
    if (!url || typeof url !== 'string') {
      return false;
    }
    
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Validate server configuration
   */
  isValidServerConfig(config) {
    if (!config || typeof config !== 'object') {
      return false;
    }
    
    // Required fields
    if (!config.type || !['stdio', 'http', 'ws', 'websocket'].includes(config.type)) {
      return false;
    }
    
    // Type-specific validation
    switch (config.type) {
      case 'stdio':
        return this.validateStdioConfig(config);
      case 'http':
        return this.validateHttpConfig(config);
      case 'ws':
      case 'websocket':
        return this.validateWebSocketConfig(config);
      default:
        return false;
    }
  }

  /**
   * Validate STDIO server configuration
   */
  validateStdioConfig(config) {
    if (!config.command || typeof config.command !== 'string') {
      return false;
    }
    
    // Validate command is not suspicious
    if (this.containsSuspiciousContent(config.command)) {
      return false;
    }
    
    // Validate arguments
    if (config.args && !Array.isArray(config.args)) {
      return false;
    }
    
    if (config.args) {
      for (const arg of config.args) {
        if (typeof arg !== 'string' || this.containsSuspiciousContent(arg)) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Validate HTTP server configuration
   */
  validateHttpConfig(config) {
    if (!config.url || !this.isValidUrl(config.url)) {
      return false;
    }
    
    // Validate headers
    if (config.headers && typeof config.headers !== 'object') {
      return false;
    }
    
    if (config.headers) {
      for (const [key, value] of Object.entries(config.headers)) {
        if (typeof key !== 'string' || typeof value !== 'string') {
          return false;
        }
        
        if (this.containsSuspiciousContent(key) || this.containsSuspiciousContent(value)) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Validate WebSocket server configuration
   */
  validateWebSocketConfig(config) {
    if (!config.url || typeof config.url !== 'string') {
      return false;
    }
    
    // WebSocket URLs should use ws:// or wss://
    try {
      const urlObj = new URL(config.url);
      if (!['ws:', 'wss:'].includes(urlObj.protocol)) {
        return false;
      }
    } catch {
      return false;
    }
    
    return true;
  }

  /**
   * Validate tool parameters
   */
  validateToolParameters(parameters) {
    if (!parameters || typeof parameters !== 'object') {
      return true; // Empty parameters are valid
    }
    
    // Check for malicious content in parameters
    return !this.containsMaliciousContent(parameters);
  }

  /**
   * Validate authentication credentials
   */
  validateCredentials(credentials) {
    if (!credentials || typeof credentials !== 'object') {
      return false;
    }
    
    // Check for required fields based on auth type
    if (credentials.type === 'bearer' && !credentials.token) {
      return false;
    }
    
    if (credentials.type === 'basic' && (!credentials.username || !credentials.password)) {
      return false;
    }
    
    if (credentials.type === 'oauth' && (!credentials.clientId || !credentials.clientSecret)) {
      return false;
    }
    
    // Check for suspicious content
    return !this.containsMaliciousContent(credentials);
  }

  /**
   * Check for suspicious content that might indicate security threats
   */
  containsSuspiciousContent(str) {
    if (typeof str !== 'string') {
      return false;
    }
    
    // Check for path traversal
    if (this.securityPatterns.pathTraversal.test(str)) {
      return true;
    }
    
    // Check for command injection
    if (this.securityPatterns.commandInjection.test(str)) {
      return true;
    }
    
    // Check for extremely long strings (potential buffer overflow)
    if (str.length > 10000) {
      return true;
    }
    
    return false;
  }

  /**
   * Check for malicious content in objects
   */
  containsMaliciousContent(obj) {
    if (typeof obj === 'string') {
      return this.containsSuspiciousContent(obj) ||
             this.securityPatterns.xss.test(obj) ||
             this.securityPatterns.sqlInjection.test(obj);
    }
    
    if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        if (this.containsSuspiciousContent(key) || this.containsMaliciousContent(value)) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Sanitize input string
   */
  sanitizeString(str) {
    if (typeof str !== 'string') {
      return str;
    }
    
    return str
      .replace(/[<>]/g, '') // Remove potential XSS characters
      .replace(/[;&|`$()]/g, '') // Remove command injection characters
      .replace(/\.\.[\/\\]/g, '') // Remove path traversal
      .substring(0, 1000) // Limit length
      .trim();
  }

  /**
   * Validate JSON schema
   */
  validateSchema(data, schema) {
    const errors = [];
    
    try {
      this.validateSchemaRecursive(data, schema, '', errors);
    } catch (error) {
      errors.push(`Schema validation error: ${error.message}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Recursive schema validation
   */
  validateSchemaRecursive(data, schema, path, errors) {
    // Type validation
    if (schema.type) {
      const actualType = Array.isArray(data) ? 'array' : typeof data;
      if (actualType !== schema.type) {
        errors.push(`${path}: Expected type ${schema.type}, got ${actualType}`);
      }
    }
    
    // Required field validation
    if (schema.required && Array.isArray(schema.required)) {
      for (const requiredField of schema.required) {
        if (typeof data === 'object' && data !== null && !data.hasOwnProperty(requiredField)) {
          errors.push(`${path}: Missing required field ${requiredField}`);
        }
      }
    }
    
    // Properties validation
    if (schema.properties && typeof data === 'object' && data !== null) {
      for (const [field, fieldSchema] of Object.entries(schema.properties)) {
        if (data.hasOwnProperty(field)) {
          const fieldPath = path ? `${path}.${field}` : field;
          this.validateSchemaRecursive(data[field], fieldSchema, fieldPath, errors);
        }
      }
    }
    
    // Array validation
    if (schema.items && Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const itemPath = `${path}[${i}]`;
        this.validateSchemaRecursive(data[i], schema.items, itemPath, errors);
      }
    }
    
    // String validation
    if (schema.minLength && typeof data === 'string' && data.length < schema.minLength) {
      errors.push(`${path}: String too short (min: ${schema.minLength})`);
    }
    
    if (schema.maxLength && typeof data === 'string' && data.length > schema.maxLength) {
      errors.push(`${path}: String too long (max: ${schema.maxLength})`);
    }
    
    // Number validation
    if (schema.minimum && typeof data === 'number' && data < schema.minimum) {
      errors.push(`${path}: Number too small (min: ${schema.minimum})`);
    }
    
    if (schema.maximum && typeof data === 'number' && data > schema.maximum) {
      errors.push(`${path}: Number too large (max: ${schema.maximum})`);
    }
  }

  /**
   * Validate environment variable name
   */
  isValidEnvironmentVariable(name) {
    if (!name || typeof name !== 'string') {
      return false;
    }
    
    // Environment variable names should be uppercase with underscores
    return /^[A-Z][A-Z0-9_]*$/.test(name) && name.length <= 100;
  }

  /**
   * Validate timeout value
   */
  isValidTimeout(timeout) {
    return typeof timeout === 'number' &&
           timeout > 0 &&
           timeout <= 300000; // Max 5 minutes
  }

  /**
   * Validate port number
   */
  isValidPort(port) {
    return typeof port === 'number' &&
           Number.isInteger(port) &&
           port >= 1 &&
           port <= 65535;
  }

  /**
   * Get validation summary
   */
  getValidationSummary(validationResults) {
    const summary = {
      totalChecks: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      errors: []
    };
    
    for (const result of validationResults) {
      summary.totalChecks++;
      if (result.valid) {
        summary.passed++;
      } else {
        summary.failed++;
        if (result.errors) {
          summary.errors.push(...result.errors);
        }
      }
    }
    
    return summary;
  }
}

module.exports = { MCPValidator };