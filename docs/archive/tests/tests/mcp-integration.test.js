/**
 * MCP Integration Tests
 * Comprehensive test suite for MCP integration functionality
 */

const MCPIntegration = require('../src/mcp/index');
const { MCPConfig } = require('../src/mcp/config/mcp-config');
const { MCPValidator } = require('../src/mcp/utils/validator');

// Test configuration
const testConfig = {
  mcpServers: {
    'test-stdio': {
      type: 'stdio',
      command: 'node',
      args: ['./tests/fixtures/mock-mcp-server.js']
    },
    'test-http': {
      type: 'http',
      url: 'http://localhost:3001',
      headers: {
        'Authorization': 'Bearer test-token'
      }
    }
  },
  performance: {
    maxConnections: 5,
    connectionTimeout: 5000,
    healthCheckInterval: 30000
  }
};

describe('MCP Integration', () => {
  let mcpIntegration;
  
  beforeEach(() => {
    mcpIntegration = new MCPIntegration({
      configPath: './tests/fixtures/test-config.json'
    });
  });
  
  afterEach(async () => {
    if (mcpIntegration) {
      await mcpIntegration.shutdown();
    }
  });

  describe('Initialization', () => {
    test('should initialize without config file', () => {
      const integration = new MCPIntegration();
      expect(integration).toBeInstanceOf(MCPIntegration);
      expect(integration.isInitialized).toBe(false);
    });

    test('should initialize with config file', async () => {
      await mcpIntegration.initialize();
      expect(mcpIntegration.isInitialized).toBe(true);
    });

    test('should handle initialization errors', async () => {
      const integration = new MCPIntegration({
        configPath: './non-existent-config.json'
      });
      
      await expect(integration.initialize()).rejects.toThrow();
    });
  });

  describe('Server Connection', () => {
    beforeEach(async () => {
      await mcpIntegration.initialize();
    });

    test('should connect to STDIO server', async () => {
      const connection = await mcpIntegration.connectToServer('test-stdio');
      expect(connection).toBeDefined();
      expect(mcpIntegration.connectedServers.has('test-stdio')).toBe(true);
    });

    test('should handle connection errors', async () => {
      await expect(mcpIntegration.connectToServer('non-existent-server'))
        .rejects.toThrow();
    });

    test('should reuse existing connections', async () => {
      const connection1 = await mcpIntegration.connectToServer('test-stdio');
      const connection2 = await mcpIntegration.connectToServer('test-stdio');
      expect(connection1).toBe(connection2);
    });
  });

  describe('Tool Execution', () => {
    beforeEach(async () => {
      await mcpIntegration.initialize();
      await mcpIntegration.connectToServer('test-stdio');
    });

    test('should execute tools successfully', async () => {
      const result = await mcpIntegration.executeTool('test-stdio', 'echo', {
        message: 'Hello, World!'
      });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    test('should handle tool execution errors', async () => {
      await expect(mcpIntegration.executeTool('test-stdio', 'non-existent-tool'))
        .rejects.toThrow();
    });

    test('should transform input parameters', async () => {
      // Mock data transformer
      mcpIntegration.dataTransformer.transformInput = jest.fn()
        .mockResolvedValue({ transformed: true });
      
      await mcpIntegration.executeTool('test-stdio', 'echo', { test: true });
      
      expect(mcpIntegration.dataTransformer.transformInput)
        .toHaveBeenCalledWith('test-stdio', 'echo', { test: true });
    });

    test('should transform output results', async () => {
      // Mock data transformer
      mcpIntegration.dataTransformer.transformOutput = jest.fn()
        .mockResolvedValue({ transformed: true });
      
      const result = await mcpIntegration.executeTool('test-stdio', 'echo', {});
      
      expect(mcpIntegration.dataTransformer.transformOutput)
        .toHaveBeenCalled();
      expect(result).toEqual({ transformed: true });
    });
  });

  describe('Resource Access', () => {
    beforeEach(async () => {
      await mcpIntegration.initialize();
      await mcpIntegration.connectToServer('test-stdio');
    });

    test('should access resources successfully', async () => {
      const resource = await mcpIntegration.accessResource('test-stdio', 'file://test.txt');
      expect(resource).toBeDefined();
    });

    test('should handle invalid resource URIs', async () => {
      await expect(mcpIntegration.accessResource('test-stdio', 'invalid-uri'))
        .rejects.toThrow();
    });
  });

  describe('Server Health', () => {
    beforeEach(async () => {
      await mcpIntegration.initialize();
      await mcpIntegration.connectToServer('test-stdio');
    });

    test('should check server health', async () => {
      const health = await mcpIntegration.getServerHealth('test-stdio');
      expect(health).toMatchObject({
        status: expect.any(String),
        server: 'test-stdio'
      });
    });

    test('should return disconnected status for non-connected servers', async () => {
      const health = await mcpIntegration.getServerHealth('non-connected');
      expect(health.status).toBe('disconnected');
    });
  });

  describe('Status and Management', () => {
    test('should return correct status', () => {
      const status = mcpIntegration.getStatus();
      expect(status).toMatchObject({
        initialized: expect.any(Boolean),
        connectedServers: expect.any(Array),
        totalServers: expect.any(Number),
        uptime: expect.any(Number)
      });
    });

    test('should shutdown gracefully', async () => {
      await mcpIntegration.initialize();
      await mcpIntegration.connectToServer('test-stdio');
      
      await mcpIntegration.shutdown();
      
      expect(mcpIntegration.isInitialized).toBe(false);
      expect(mcpIntegration.connectedServers.size).toBe(0);
    });
  });
});

describe('MCP Configuration', () => {
  let config;

  beforeEach(() => {
    config = new MCPConfig();
  });

  describe('Configuration Loading', () => {
    test('should load default configuration', async () => {
      const loadedConfig = await config.load();
      expect(loadedConfig).toBeDefined();
      expect(loadedConfig.performance).toBeDefined();
    });

    test('should merge user configuration with defaults', () => {
      const defaultConfig = { a: 1, b: { c: 2 } };
      const userConfig = { b: { d: 3 }, e: 4 };
      
      const merged = config.mergeConfig(defaultConfig, userConfig);
      
      expect(merged).toEqual({
        a: 1,
        b: { c: 2, d: 3 },
        e: 4
      });
    });

    test('should resolve environment variables', () => {
      process.env.TEST_VAR = 'test-value';
      
      const resolved = config.resolveEnvironmentVariable('${TEST_VAR}');
      expect(resolved).toBe('test-value');
      
      const withDefault = config.resolveEnvironmentVariable('${NON_EXISTENT:default}');
      expect(withDefault).toBe('default');
      
      delete process.env.TEST_VAR;
    });
  });

  describe('Server Management', () => {
    test('should add server configuration', () => {
      config.addServer('test-server', {
        type: 'stdio',
        command: 'node',
        args: ['test.js']
      });
      
      const serverConfig = config.getServerConfig('test-server');
      expect(serverConfig).toBeDefined();
      expect(serverConfig.type).toBe('stdio');
    });

    test('should validate server names', () => {
      expect(() => config.addServer('invalid-name!', {}))
        .toThrow('Invalid server name');
    });

    test('should enable/disable servers', () => {
      config.addServer('test-server', { type: 'stdio', command: 'node' });
      
      config.disableServer('test-server');
      expect(config.getServerConfig('test-server').disabled).toBe(true);
      
      config.enableServer('test-server');
      expect(config.getServerConfig('test-server').disabled).toBe(false);
    });
  });

  describe('Configuration Validation', () => {
    test('should validate configuration', () => {
      config.config.mcpServers = {
        'valid-server': {
          type: 'stdio',
          command: 'node'
        },
        'invalid-server': {
          // Missing type
          command: 'node'
        }
      };
      
      const validation = config.validateConfig();
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });
});

describe('MCP Validator', () => {
  let validator;

  beforeEach(() => {
    validator = new MCPValidator();
  });

  describe('Name Validation', () => {
    test('should validate server names', () => {
      expect(validator.isValidServerName('valid-server')).toBe(true);
      expect(validator.isValidServerName('invalid-name!')).toBe(false);
      expect(validator.isValidServerName('')).toBe(false);
      expect(validator.isValidServerName('a')).toBe(false); // Too short
    });

    test('should validate tool names', () => {
      expect(validator.isValidToolName('valid-tool')).toBe(true);
      expect(validator.isValidToolName('tools/list')).toBe(true);
      expect(validator.isValidToolName('invalid-tool!')).toBe(false);
    });

    test('should validate resource URIs', () => {
      expect(validator.isValidResourceUri('file://test.txt')).toBe(true);
      expect(validator.isValidResourceUri('http://example.com')).toBe(true);
      expect(validator.isValidResourceUri('invalid-uri')).toBe(false);
    });
  });

  describe('Security Validation', () => {
    test('should detect suspicious content', () => {
      expect(validator.containsSuspiciousContent('../../../etc/passwd')).toBe(true);
      expect(validator.containsSuspiciousContent('rm -rf /')).toBe(true);
      expect(validator.containsSuspiciousContent('normal content')).toBe(false);
    });

    test('should detect malicious content in objects', () => {
      const maliciousObj = {
        script: '<script>alert("xss")</script>',
        sql: 'DROP TABLE users;'
      };
      
      expect(validator.containsMaliciousContent(maliciousObj)).toBe(true);
      
      const safeObj = {
        message: 'Hello, world!',
        count: 42
      };
      
      expect(validator.containsMaliciousContent(safeObj)).toBe(false);
    });
  });

  describe('Schema Validation', () => {
    test('should validate against schema', () => {
      const schema = {
        type: 'object',
        required: ['name', 'age'],
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      };
      
      const validData = { name: 'John', age: 30 };
      const invalidData = { name: 'John' }; // Missing age
      
      expect(validator.validateSchema(validData, schema).valid).toBe(true);
      expect(validator.validateSchema(invalidData, schema).valid).toBe(false);
    });
  });
});

describe('MCP Connection Manager', () => {
  // Connection manager tests would go here
  // These would test the connection pooling, health checking, and retry logic
});

describe('MCP Data Transformer', () => {
  // Data transformer tests would go here
  // These would test the various transformation types and validation
});

describe('MCP Authentication Manager', () => {
  // Authentication manager tests would go here
  // These would test different auth methods and token management
});