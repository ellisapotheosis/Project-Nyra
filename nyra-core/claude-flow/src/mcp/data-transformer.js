/**
 * MCP Data Transformer
 * Handles data transformation between different MCP servers and formats
 */

const { MCPLogger } = require('./utils/logger');
const { MCPValidator } = require('./utils/validator');

class MCPDataTransformer {
  constructor(config) {
    this.config = config;
    this.logger = new MCPLogger('MCPDataTransformer');
    this.validator = new MCPValidator();
    
    // Transformation rules and mappings
    this.transformationRules = new Map();
    this.schemaCache = new Map();
    this.typeConverters = new Map();
    
    // Initialize built-in transformers
    this.initializeBuiltinTransformers();
  }

  /**
   * Initialize built-in data transformers
   */
  initializeBuiltinTransformers() {
    // String transformers
    this.typeConverters.set('string', {
      normalize: (value) => String(value).trim(),
      validate: (value) => typeof value === 'string',
      sanitize: (value) => this.sanitizeString(value)
    });

    // Number transformers
    this.typeConverters.set('number', {
      normalize: (value) => {
        const num = Number(value);
        return isNaN(num) ? 0 : num;
      },
      validate: (value) => typeof value === 'number' && !isNaN(value),
      sanitize: (value) => Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Number(value)))
    });

    // Boolean transformers
    this.typeConverters.set('boolean', {
      normalize: (value) => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
        }
        return Boolean(value);
      },
      validate: (value) => typeof value === 'boolean',
      sanitize: (value) => Boolean(value)
    });

    // Array transformers
    this.typeConverters.set('array', {
      normalize: (value) => Array.isArray(value) ? value : [value],
      validate: (value) => Array.isArray(value),
      sanitize: (value) => Array.isArray(value) ? value.filter(item => item != null) : []
    });

    // Object transformers
    this.typeConverters.set('object', {
      normalize: (value) => {
        if (typeof value === 'object' && value !== null) return value;
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            return {};
          }
        }
        return {};
      },
      validate: (value) => typeof value === 'object' && value !== null && !Array.isArray(value),
      sanitize: (value) => this.sanitizeObject(value)
    });

    this.logger.info('Built-in data transformers initialized');
  }

  /**
   * Transform input data for an MCP tool
   */
  async transformInput(serverName, toolName, parameters) {
    try {
      this.logger.debug(`Transforming input for ${serverName}/${toolName}`, parameters);

      // Get transformation rules for this server/tool combination
      const rules = this.getTransformationRules(serverName, toolName, 'input');
      
      // Apply transformations
      const transformed = await this.applyTransformations(parameters, rules);
      
      // Validate transformed data
      if (rules.schema) {
        await this.validateAgainstSchema(transformed, rules.schema);
      }

      this.logger.debug(`Input transformation complete for ${serverName}/${toolName}`, transformed);
      return transformed;
    } catch (error) {
      this.logger.error(`Input transformation failed for ${serverName}/${toolName}:`, error);
      throw error;
    }
  }

  /**
   * Transform output data from an MCP tool
   */
  async transformOutput(serverName, toolName, result) {
    try {
      this.logger.debug(`Transforming output for ${serverName}/${toolName}`, result);

      // Get transformation rules for this server/tool combination
      const rules = this.getTransformationRules(serverName, toolName, 'output');
      
      // Apply transformations
      const transformed = await this.applyTransformations(result, rules);
      
      // Validate transformed data
      if (rules.schema) {
        await this.validateAgainstSchema(transformed, rules.schema);
      }

      this.logger.debug(`Output transformation complete for ${serverName}/${toolName}`, transformed);
      return transformed;
    } catch (error) {
      this.logger.error(`Output transformation failed for ${serverName}/${toolName}:`, error);
      throw error;
    }
  }

  /**
   * Transform resource data from an MCP server
   */
  async transformResource(serverName, resource) {
    try {
      this.logger.debug(`Transforming resource for ${serverName}`, resource);

      // Get transformation rules for this server's resources
      const rules = this.getTransformationRules(serverName, '*', 'resource');
      
      // Apply transformations
      const transformed = await this.applyTransformations(resource, rules);
      
      this.logger.debug(`Resource transformation complete for ${serverName}`, transformed);
      return transformed;
    } catch (error) {
      this.logger.error(`Resource transformation failed for ${serverName}:`, error);
      throw error;
    }
  }

  /**
   * Get transformation rules for a server/tool/direction combination
   */
  getTransformationRules(serverName, toolName, direction) {
    const key = `${serverName}:${toolName}:${direction}`;
    
    // Check for specific rules first
    if (this.transformationRules.has(key)) {
      return this.transformationRules.get(key);
    }
    
    // Check for wildcard rules
    const wildcardKey = `${serverName}:*:${direction}`;
    if (this.transformationRules.has(wildcardKey)) {
      return this.transformationRules.get(wildcardKey);
    }
    
    // Check for default rules
    const defaultKey = `*:*:${direction}`;
    if (this.transformationRules.has(defaultKey)) {
      return this.transformationRules.get(defaultKey);
    }
    
    // Return default transformation rules
    return {
      transformations: [],
      schema: null,
      options: {}
    };
  }

  /**
   * Apply transformation rules to data
   */
  async applyTransformations(data, rules) {
    let result = data;
    
    for (const transformation of rules.transformations || []) {
      result = await this.applyTransformation(result, transformation);
    }
    
    return result;
  }

  /**
   * Apply a single transformation to data
   */
  async applyTransformation(data, transformation) {
    try {
      switch (transformation.type) {
        case 'field-mapping':
          return this.applyFieldMapping(data, transformation);
        case 'type-conversion':
          return this.applyTypeConversion(data, transformation);
        case 'value-mapping':
          return this.applyValueMapping(data, transformation);
        case 'field-filter':
          return this.applyFieldFilter(data, transformation);
        case 'custom-function':
          return await this.applyCustomFunction(data, transformation);
        case 'normalize':
          return this.normalizeData(data, transformation);
        case 'sanitize':
          return this.sanitizeData(data, transformation);
        default:
          this.logger.warn(`Unknown transformation type: ${transformation.type}`);
          return data;
      }
    } catch (error) {
      this.logger.error(`Transformation failed:`, transformation, error);
      throw error;
    }
  }

  /**
   * Apply field mapping transformation
   */
  applyFieldMapping(data, transformation) {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const result = {};
    const mapping = transformation.mapping || {};
    
    for (const [sourceField, targetField] of Object.entries(mapping)) {
      if (data.hasOwnProperty(sourceField)) {
        result[targetField] = data[sourceField];
      }
    }
    
    // Include unmapped fields if specified
    if (transformation.includeUnmapped) {
      for (const [key, value] of Object.entries(data)) {
        if (!mapping.hasOwnProperty(key)) {
          result[key] = value;
        }
      }
    }
    
    return result;
  }

  /**
   * Apply type conversion transformation
   */
  applyTypeConversion(data, transformation) {
    const targetType = transformation.targetType;
    const converter = this.typeConverters.get(targetType);
    
    if (!converter) {
      this.logger.warn(`No converter found for type: ${targetType}`);
      return data;
    }
    
    if (transformation.field) {
      // Convert specific field
      if (typeof data === 'object' && data !== null && data.hasOwnProperty(transformation.field)) {
        return {
          ...data,
          [transformation.field]: converter.normalize(data[transformation.field])
        };
      }
    } else {
      // Convert entire value
      return converter.normalize(data);
    }
    
    return data;
  }

  /**
   * Apply value mapping transformation
   */
  applyValueMapping(data, transformation) {
    const valueMap = transformation.valueMap || {};
    const field = transformation.field;
    
    if (field && typeof data === 'object' && data !== null) {
      if (data.hasOwnProperty(field) && valueMap.hasOwnProperty(data[field])) {
        return {
          ...data,
          [field]: valueMap[data[field]]
        };
      }
    } else if (valueMap.hasOwnProperty(data)) {
      return valueMap[data];
    }
    
    return data;
  }

  /**
   * Apply field filter transformation
   */
  applyFieldFilter(data, transformation) {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const allowedFields = transformation.allowedFields || [];
    const excludedFields = transformation.excludedFields || [];
    
    const result = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Include field if it's in allowed list (if specified) and not in excluded list
      const isAllowed = allowedFields.length === 0 || allowedFields.includes(key);
      const isExcluded = excludedFields.includes(key);
      
      if (isAllowed && !isExcluded) {
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * Apply custom function transformation
   */
  async applyCustomFunction(data, transformation) {
    const functionName = transformation.function;
    const args = transformation.args || [];
    
    // Check for registered custom functions
    const customFunction = this.config.getCustomFunction(functionName);
    if (customFunction) {
      return await customFunction(data, ...args);
    }
    
    this.logger.warn(`Custom function not found: ${functionName}`);
    return data;
  }

  /**
   * Normalize data
   */
  normalizeData(data, transformation) {
    if (typeof data === 'string') {
      return data.trim().toLowerCase();
    }
    
    if (typeof data === 'object' && data !== null) {
      const result = {};
      for (const [key, value] of Object.entries(data)) {
        result[key] = this.normalizeData(value, transformation);
      }
      return result;
    }
    
    return data;
  }

  /**
   * Sanitize data
   */
  sanitizeData(data, transformation) {
    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }
    
    if (typeof data === 'object' && data !== null) {
      return this.sanitizeObject(data);
    }
    
    return data;
  }

  /**
   * Sanitize string data
   */
  sanitizeString(str) {
    return String(str)
      .replace(/[<>]/g, '') // Remove potential XSS characters
      .replace(/\x00/g, '') // Remove null bytes
      .substring(0, 10000); // Limit length
  }

  /**
   * Sanitize object data
   */
  sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    const result = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key
      const sanitizedKey = this.sanitizeString(key);
      
      // Recursively sanitize value
      if (typeof value === 'string') {
        result[sanitizedKey] = this.sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        result[sanitizedKey] = this.sanitizeObject(value);
      } else {
        result[sanitizedKey] = value;
      }
    }
    
    return result;
  }

  /**
   * Validate data against a schema
   */
  async validateAgainstSchema(data, schema) {
    try {
      // Simple schema validation (in production, consider using a library like Joi or Ajv)
      if (schema.type && typeof data !== schema.type) {
        throw new Error(`Expected type ${schema.type}, got ${typeof data}`);
      }
      
      if (schema.required && Array.isArray(schema.required)) {
        for (const requiredField of schema.required) {
          if (typeof data === 'object' && data !== null && !data.hasOwnProperty(requiredField)) {
            throw new Error(`Required field missing: ${requiredField}`);
          }
        }
      }
      
      if (schema.properties && typeof data === 'object' && data !== null) {
        for (const [field, fieldSchema] of Object.entries(schema.properties)) {
          if (data.hasOwnProperty(field)) {
            await this.validateAgainstSchema(data[field], fieldSchema);
          }
        }
      }
    } catch (error) {
      this.logger.error('Schema validation failed:', error);
      throw error;
    }
  }

  /**
   * Register transformation rules
   */
  registerTransformationRules(serverName, toolName, direction, rules) {
    const key = `${serverName}:${toolName}:${direction}`;
    this.transformationRules.set(key, rules);
    this.logger.debug(`Registered transformation rules for: ${key}`);
  }

  /**
   * Register a custom transformer function
   */
  registerCustomTransformer(name, transformerFunction) {
    this.typeConverters.set(name, {
      normalize: transformerFunction,
      validate: (value) => true,
      sanitize: transformerFunction
    });
    this.logger.debug(`Registered custom transformer: ${name}`);
  }

  /**
   * Get transformation statistics
   */
  getTransformationStats() {
    return {
      registeredRules: this.transformationRules.size,
      typeConverters: this.typeConverters.size,
      cachedSchemas: this.schemaCache.size
    };
  }

  /**
   * Clear transformation cache
   */
  clearCache() {
    this.schemaCache.clear();
    this.logger.debug('Transformation cache cleared');
  }
}

module.exports = MCPDataTransformer;