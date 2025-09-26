/**
 * MCP Integration Usage Examples
 * Comprehensive examples showing how to use the MCP integration
 */

const MCPIntegration = require('../src/mcp/index');

class MCPExamples {
  constructor() {
    this.mcp = new MCPIntegration({
      configPath: './mcp.json'
    });
  }

  /**
   * Example 1: Basic Setup and Initialization
   */
  async basicSetup() {
    console.log('=== Basic Setup Example ===');
    
    try {
      // Initialize MCP integration
      await this.mcp.initialize();
      console.log('✅ MCP Integration initialized successfully');
      
      // Get status
      const status = this.mcp.getStatus();
      console.log('📊 Status:', {
        initialized: status.initialized,
        connectedServers: status.connectedServers.length,
        totalServers: status.totalServers
      });
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
    }
  }

  /**
   * Example 2: Connecting to Servers
   */
  async serverConnection() {
    console.log('\n=== Server Connection Example ===');
    
    try {
      // Connect to a specific server
      const connection = await this.mcp.connectToServer('claude-flow');
      console.log('✅ Connected to claude-flow server');
      
      // List available tools
      const tools = await this.mcp.listTools('claude-flow');
      console.log('🔧 Available tools:', tools.map(t => t.name).join(', '));
      
      // Check server health
      const health = await this.mcp.getServerHealth('claude-flow');
      console.log('❤️ Server health:', health.status);
      
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
    }
  }

  /**
   * Example 3: Tool Execution
   */
  async toolExecution() {
    console.log('\n=== Tool Execution Example ===');
    
    try {
      // Execute swarm initialization tool
      const swarmResult = await this.mcp.executeTool('claude-flow', 'swarm_init', {
        topology: 'mesh',
        maxAgents: 5,
        strategy: 'balanced'
      });
      console.log('🔄 Swarm initialized:', swarmResult);
      
      // Execute agent spawn tool
      const agentResult = await this.mcp.executeTool('claude-flow', 'agent_spawn', {
        type: 'researcher',
        capabilities: ['search', 'analyze', 'report']
      });
      console.log('🤖 Agent spawned:', agentResult);
      
      // Execute task orchestration
      const taskResult = await this.mcp.executeTool('claude-flow', 'task_orchestrate', {
        task: 'Analyze market trends in AI development',
        priority: 'high',
        strategy: 'adaptive'
      });
      console.log('📋 Task orchestrated:', taskResult);
      
    } catch (error) {
      console.error('❌ Tool execution failed:', error.message);
    }
  }

  /**
   * Example 4: Resource Access
   */
  async resourceAccess() {
    console.log('\n=== Resource Access Example ===');
    
    try {
      // List available resources
      const resources = await this.mcp.listResources('filesystem');
      console.log('📁 Available resources:', resources.length);
      
      // Access a specific resource
      const resource = await this.mcp.accessResource('filesystem', 'file://./package.json');
      console.log('📄 Resource accessed:', {
        uri: resource.uri,
        size: resource.text?.length || 0
      });
      
    } catch (error) {
      console.error('❌ Resource access failed:', error.message);
    }
  }

  /**
   * Example 5: Authentication Management
   */
  async authenticationExample() {
    console.log('\n=== Authentication Example ===');
    
    try {
      // Get authentication status for all servers
      const authStatus = this.mcp.authManager.getAuthStatus();
      console.log('🔐 Authentication status:', authStatus);
      
      // Manually authenticate with a server (if needed)
      const authResult = await this.mcp.authManager.authenticate('notion', {
        token: process.env.NOTION_TOKEN
      });
      console.log('✅ Authentication result:', authResult.authenticated);
      
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
    }
  }

  /**
   * Example 6: Error Handling and Retry Logic
   */
  async errorHandlingExample() {
    console.log('\n=== Error Handling Example ===');
    
    try {
      // Attempt to connect to a non-existent server
      try {
        await this.mcp.connectToServer('non-existent-server');
      } catch (error) {
        console.log('⚠️ Expected error caught:', error.message);
      }
      
      // Demonstrate retry logic
      let attempts = 0;
      const retryOperation = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error(`Temporary failure (attempt ${attempts})`);
        }
        return { success: true, attempts };
      };
      
      const result = await this.mcp.connectionManager.retryHandler.executeWithRetry(
        retryOperation,
        'test-operation',
        console
      );
      console.log('🔄 Retry successful:', result);
      
    } catch (error) {
      console.error('❌ Error handling example failed:', error.message);
    }
  }

  /**
   * Example 7: Data Transformation
   */
  async dataTransformationExample() {
    console.log('\n=== Data Transformation Example ===');
    
    try {
      // Register custom transformation rules
      this.mcp.dataTransformer.registerTransformationRules(
        'test-server',
        'test-tool',
        'input',
        {
          transformations: [
            {
              type: 'field-mapping',
              mapping: {
                'user_id': 'userId',
                'created_at': 'createdAt'
              }
            },
            {
              type: 'type-conversion',
              field: 'count',
              targetType: 'number'
            }
          ]
        }
      );
      
      // Test transformation
      const testData = {
        user_id: '12345',
        created_at: '2024-01-01T00:00:00Z',
        count: '42'
      };
      
      const transformed = await this.mcp.dataTransformer.transformInput(
        'test-server',
        'test-tool',
        testData
      );
      console.log('🔄 Data transformed:', transformed);
      
    } catch (error) {
      console.error('❌ Data transformation failed:', error.message);
    }
  }

  /**
   * Example 8: Batch Operations
   */
  async batchOperations() {
    console.log('\n=== Batch Operations Example ===');
    
    try {
      // Execute multiple tools concurrently
      const promises = [
        this.mcp.executeTool('claude-flow', 'swarm_status', {}),
        this.mcp.executeTool('claude-flow', 'agent_list', {}),
        this.mcp.executeTool('claude-flow', 'memory_usage', {})
      ];
      
      const results = await Promise.allSettled(promises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          console.log(`✅ Operation ${index + 1} succeeded`);
        } else {
          console.log(`❌ Operation ${index + 1} failed:`, result.reason.message);
        }
      });
      
    } catch (error) {
      console.error('❌ Batch operations failed:', error.message);
    }
  }

  /**
   * Example 9: Real-time Monitoring
   */
  async monitoringExample() {
    console.log('\n=== Monitoring Example ===');
    
    try {
      // Set up event listeners
      this.mcp.connectionManager.on('connected', ({ serverName }) => {
        console.log(`🔗 Connected to server: ${serverName}`);
      });
      
      this.mcp.connectionManager.on('disconnected', ({ serverName }) => {
        console.log(`🔌 Disconnected from server: ${serverName}`);
      });
      
      this.mcp.connectionManager.on('connectionError', ({ serverName, error }) => {
        console.log(`⚠️ Connection error for ${serverName}:`, error.message);
      });
      
      // Get connection statistics
      const stats = this.mcp.connectionManager.getConnectionStats();
      console.log('📊 Connection stats:', stats);
      
      // Monitor for a short period
      console.log('🔍 Monitoring for 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
    } catch (error) {
      console.error('❌ Monitoring example failed:', error.message);
    }
  }

  /**
   * Example 10: Configuration Management
   */
  async configurationExample() {
    console.log('\n=== Configuration Example ===');
    
    try {
      // Get configuration summary
      const summary = this.mcp.config.getSummary();
      console.log('⚙️ Configuration summary:', summary);
      
      // Add a new server dynamically
      this.mcp.config.addServer('dynamic-server', {
        type: 'http',
        url: 'https://api.example.com',
        headers: {
          'Authorization': 'Bearer dynamic-token'
        }
      });
      
      console.log('➕ Added dynamic server');
      
      // List all servers
      const servers = this.mcp.config.getServerNames();
      console.log('📋 Available servers:', servers);
      
    } catch (error) {
      console.error('❌ Configuration example failed:', error.message);
    }
  }

  /**
   * Example 11: Advanced Workflow
   */
  async advancedWorkflow() {
    console.log('\n=== Advanced Workflow Example ===');
    
    try {
      // 1. Initialize swarm
      console.log('1️⃣ Initializing swarm...');
      const swarmInit = await this.mcp.executeTool('claude-flow', 'swarm_init', {
        topology: 'hierarchical',
        maxAgents: 8,
        strategy: 'adaptive'
      });
      
      // 2. Spawn multiple agents
      console.log('2️⃣ Spawning agents...');
      const agentTypes = ['researcher', 'coder', 'tester', 'reviewer'];
      const agents = await Promise.all(
        agentTypes.map(type =>
          this.mcp.executeTool('claude-flow', 'agent_spawn', { type })
        )
      );
      
      // 3. Orchestrate complex task
      console.log('3️⃣ Orchestrating task...');
      const task = await this.mcp.executeTool('claude-flow', 'task_orchestrate', {
        task: 'Develop a machine learning model for sentiment analysis',
        priority: 'high',
        strategy: 'parallel',
        maxAgents: 4
      });
      
      // 4. Monitor progress
      console.log('4️⃣ Monitoring progress...');
      const status = await this.mcp.executeTool('claude-flow', 'task_status', {
        taskId: task.taskId
      });
      
      console.log('✅ Advanced workflow completed:', {
        swarmId: swarmInit.swarmId,
        agentsSpawned: agents.length,
        taskId: task.taskId,
        status: status.status
      });
      
    } catch (error) {
      console.error('❌ Advanced workflow failed:', error.message);
    }
  }

  /**
   * Run all examples
   */
  async runAllExamples() {
    console.log('🚀 Starting MCP Integration Examples\n');
    
    const examples = [
      this.basicSetup,
      this.serverConnection,
      this.toolExecution,
      this.resourceAccess,
      this.authenticationExample,
      this.errorHandlingExample,
      this.dataTransformationExample,
      this.batchOperations,
      this.monitoringExample,
      this.configurationExample,
      this.advancedWorkflow
    ];
    
    for (const example of examples) {
      try {
        await example.call(this);
      } catch (error) {
        console.error('Example failed:', error.message);
      }
      
      // Brief pause between examples
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🏁 All examples completed');
    
    // Cleanup
    await this.cleanup();
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    console.log('\n🧹 Cleaning up...');
    
    try {
      await this.mcp.shutdown();
      console.log('✅ MCP Integration shut down successfully');
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
    }
  }
}

// Usage examples for different scenarios

/**
 * Simple Usage Example
 */
async function simpleExample() {
  const mcp = new MCPIntegration();
  
  try {
    await mcp.initialize();
    
    const result = await mcp.executeTool('claude-flow', 'swarm_status', {});
    console.log('Swarm status:', result);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mcp.shutdown();
  }
}

/**
 * Configuration-based Example
 */
async function configExample() {
  const mcp = new MCPIntegration({
    configPath: './custom-mcp-config.json'
  });
  
  await mcp.initialize();
  
  // Your MCP operations here
  
  await mcp.shutdown();
}

/**
 * Environment-specific Example
 */
async function environmentExample() {
  // Set up environment variables
  process.env.MCP_LOG_LEVEL = 'debug';
  process.env.MCP_CONNECTION_TIMEOUT = '45000';
  
  const mcp = new MCPIntegration();
  await mcp.initialize();
  
  // Your operations here
  
  await mcp.shutdown();
}

// Export for use as a module
module.exports = {
  MCPExamples,
  simpleExample,
  configExample,
  environmentExample
};

// Run examples if called directly
if (require.main === module) {
  const examples = new MCPExamples();
  examples.runAllExamples().catch(console.error);
}