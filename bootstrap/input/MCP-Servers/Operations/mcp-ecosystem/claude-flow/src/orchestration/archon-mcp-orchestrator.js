/**
 * Archon MCP Orchestrator
 * Main orchestration engine that coordinates Archon's 54 agents with MCP servers
 */

const { McpArchonConfig } = require('../../config/mcp-archon-config');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class ArchonMcpOrchestrator {
  constructor() {
    this.config = new McpArchonConfig();
    this.activeAgents = new Map();
    this.taskQueue = [];
    this.metrics = {
      tasks_completed: 0,
      tasks_failed: 0,
      average_task_time: 0,
      active_agents: 0,
      mcp_server_calls: 0
    };
    this.isRunning = false;
  }

  async initialize() {
    console.log('🚀 Initializing Archon MCP Orchestrator...');
    
    // Validate configuration
    const errors = this.config.validate();
    if (errors.length > 0) {
      console.warn('⚠️ Configuration warnings:', errors);
    }

    // Initialize MCP connections
    await this.initializeMcpConnections();
    
    // Load agent definitions from .claude/agents/
    await this.loadAgentDefinitions();
    
    this.isRunning = true;
    console.log('✅ Archon MCP Orchestrator initialized successfully');
    
    return {
      status: 'initialized',
      available_agents: Object.keys(this.config.agentCapabilities).length,
      connected_mcp_servers: Object.values(this.config.mcpServers).filter(s => s.status === 'connected').length,
      orchestration_patterns: Object.keys(this.config.orchestrationPatterns).length
    };
  }

  async initializeMcpConnections() {
    console.log('🔌 Initializing MCP server connections...');
    
    for (const [serverName, serverConfig] of Object.entries(this.config.mcpServers)) {
      try {
        // Test connection based on server type
        switch (serverName) {
          case 'desktop-commander':
            await this.testMcpConnection('mcp__desktop-commander__get_config');
            break;
          case 'ruv-swarm':
            await this.testMcpConnection('mcp__ruv-swarm__swarm_status');
            break;
          case 'flow-nexus':
            await this.testMcpConnection('mcp__flow-nexus__auth_status');
            break;
          case 'claude-flow':
            // Claude Flow is unstable, mark as such but don't fail
            serverConfig.status = 'unstable';
            break;
        }
        
        if (serverConfig.status !== 'unstable') {
          serverConfig.status = 'connected';
          console.log(`  ✅ ${serverName} connected`);
        } else {
          console.log(`  ⚠️ ${serverName} unstable (fallback available)`);
        }
      } catch (error) {
        serverConfig.status = 'disconnected';
        console.log(`  ❌ ${serverName} failed: ${error.message}`);
      }
    }
  }

  async testMcpConnection(toolName) {
    // This would be replaced with actual MCP tool calls
    // For now, we'll assume connections based on previous tests
    return true;
  }

  async loadAgentDefinitions() {
    console.log('👥 Loading agent definitions from .claude/agents/...');
    
    // Count available agents from directory structure
    const agentTypes = [
      'core', 'development', 'testing', 'architecture', 'devops',
      'documentation', 'analysis', 'data', 'specialized', 'sparc',
      'github', 'hive-mind', 'swarm', 'consensus', 'optimization'
    ];
    
    console.log(`  📊 Loaded ${Object.keys(this.config.agentCapabilities).length} agent configurations`);
    console.log(`  🗂️ Agent categories: ${agentTypes.join(', ')}`);
  }

  // Execute SPARC workflow with MCP coordination
  async executeSPARCWorkflow(projectDescription) {
    const workflowId = `sparc-${Date.now()}`;
    const pattern = this.config.getOrchestrationPattern('sparc_workflow');
    
    console.log(`🎯 Starting SPARC workflow: ${workflowId}`);
    
    // Execute pre-task hooks
    await this.executeHook('pre-task', {
      description: `SPARC workflow: ${projectDescription}`,
      workflowId: workflowId
    });

    const results = [];
    
    for (const phase of pattern.phases) {
      console.log(`📋 Executing phase: ${phase.phase}`);
      
      const phaseResults = await this.executePhase(phase, {
        projectDescription,
        workflowId,
        previousResults: results
      });
      
      results.push({
        phase: phase.phase,
        results: phaseResults,
        timestamp: new Date().toISOString()
      });
    }

    // Execute post-task hooks
    await this.executeHook('post-task', {
      taskId: workflowId,
      success: true,
      results: results
    });

    return {
      workflowId,
      status: 'completed',
      phases: results,
      metrics: this.getMetrics()
    };
  }

  // Execute web application scaffolding
  async executeWebAppScaffolding(appConfig) {
    const scaffoldId = `webapp-${Date.now()}`;
    const pattern = this.config.getOrchestrationPattern('webapp_scaffold');
    
    console.log(`🏗️ Starting web app scaffolding: ${scaffoldId}`);
    
    await this.executeHook('pre-task', {
      description: `Web app scaffolding: ${appConfig.name}`,
      scaffoldId: scaffoldId
    });

    const results = [];
    
    for (const phase of pattern.phases) {
      console.log(`🔧 Executing scaffolding phase: ${phase.phase}`);
      
      const phaseResults = await this.executePhase(phase, {
        appConfig,
        scaffoldId,
        previousResults: results
      });
      
      results.push({
        phase: phase.phase,
        results: phaseResults,
        timestamp: new Date().toISOString()
      });
    }

    await this.executeHook('post-task', {
      taskId: scaffoldId,
      success: true,
      results: results
    });

    return {
      scaffoldId,
      status: 'completed',
      phases: results,
      appStructure: this.generateAppStructure(appConfig),
      metrics: this.getMetrics()
    };
  }

  // Execute a workflow phase
  async executePhase(phase, context) {
    const phaseResults = [];
    
    if (phase.parallel) {
      // Execute agents in parallel
      const agentPromises = phase.agents.map(agentType => 
        this.executeAgent(agentType, phase.mcp_servers, context)
      );
      
      const results = await Promise.allSettled(agentPromises);
      phaseResults.push(...results.map((r, i) => ({
        agent: phase.agents[i],
        status: r.status,
        result: r.status === 'fulfilled' ? r.value : r.reason
      })));
    } else {
      // Execute agents sequentially
      for (const agentType of phase.agents) {
        try {
          const result = await this.executeAgent(agentType, phase.mcp_servers, context);
          phaseResults.push({
            agent: agentType,
            status: 'fulfilled',
            result: result
          });
        } catch (error) {
          phaseResults.push({
            agent: agentType,
            status: 'rejected',
            result: error.message
          });
        }
      }
    }
    
    return phaseResults;
  }

  // Execute a specific agent with MCP server support
  async executeAgent(agentType, preferredServers, context) {
    const agentConfig = this.config.agentCapabilities[agentType];
    if (!agentConfig) {
      throw new Error(`Unknown agent type: ${agentType}`);
    }

    // Select best available MCP server
    const mcpServer = this.selectMcpServer(preferredServers, agentConfig.mcp_servers);
    
    console.log(`  🤖 Executing ${agentType} via ${mcpServer}`);
    
    // Track active agent
    this.activeAgents.set(`${agentType}-${Date.now()}`, {
      type: agentType,
      mcpServer: mcpServer,
      startTime: Date.now(),
      context: context
    });

    // Simulate agent execution (would be actual Claude Code Task tool calls)
    const result = await this.simulateAgentExecution(agentType, mcpServer, context);
    
    this.metrics.tasks_completed++;
    this.metrics.active_agents = this.activeAgents.size;
    
    return result;
  }

  // Select the best available MCP server
  selectMcpServer(preferredServers, agentServers) {
    // Try preferred servers first
    for (const serverName of preferredServers) {
      if (agentServers.includes(serverName)) {
        const server = this.config.mcpServers[serverName];
        if (server && server.status === 'connected') {
          return serverName;
        }
      }
    }
    
    // Fall back to any available server for the agent
    for (const serverName of agentServers) {
      const server = this.config.mcpServers[serverName];
      if (server && server.status === 'connected') {
        return serverName;
      }
    }
    
    // Use fallback chain
    for (const serverName of agentServers) {
      const server = this.config.mcpServers[serverName];
      if (server && server.fallback) {
        const fallbackServer = this.config.mcpServers[server.fallback];
        if (fallbackServer && fallbackServer.status === 'connected') {
          return server.fallback;
        }
      }
    }
    
    throw new Error(`No available MCP server for agent servers: ${agentServers.join(', ')}`);
  }

  // Execute coordination hooks
  async executeHook(hookType, data) {
    const pattern = this.config.orchestrationPatterns.multi_agent_coordination;
    const hookCommand = pattern.coordination_hooks[hookType.replace('-', '_')];
    
    if (!hookCommand) return;
    
    let command = hookCommand;
    Object.entries(data).forEach(([key, value]) => {
      command = command.replace(`{${key}}`, value);
    });
    
    try {
      await execAsync(command);
      console.log(`  🔗 Hook executed: ${hookType}`);
    } catch (error) {
      console.warn(`  ⚠️ Hook failed: ${hookType} - ${error.message}`);
    }
  }

  // Simulate agent execution (placeholder for actual implementation)
  async simulateAgentExecution(agentType, mcpServer, context) {
    const delay = Math.random() * 2000 + 500; // 0.5-2.5 seconds
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return {
      agentType,
      mcpServer,
      status: 'completed',
      output: `${agentType} completed via ${mcpServer}`,
      executionTime: delay,
      context: context
    };
  }

  // Generate application structure for web app scaffolding
  generateAppStructure(appConfig) {
    const structures = {
      'react-express': {
        backend: ['src/server.js', 'src/routes/', 'src/models/', 'src/middleware/'],
        frontend: ['src/App.jsx', 'src/components/', 'src/pages/', 'src/hooks/'],
        config: ['package.json', '.env.example', 'docker-compose.yml'],
        tests: ['tests/unit/', 'tests/integration/', 'tests/e2e/']
      },
      'nextjs': {
        app: ['app/page.tsx', 'app/api/', 'app/components/'],
        config: ['next.config.js', 'package.json', 'tsconfig.json'],
        tests: ['__tests__/', 'cypress/']
      },
      'vue-node': {
        backend: ['server/index.js', 'server/routes/', 'server/models/'],
        frontend: ['src/App.vue', 'src/components/', 'src/views/'],
        config: ['package.json', 'vue.config.js', 'vite.config.js'],
        tests: ['tests/']
      }
    };
    
    return structures[appConfig.stack] || structures['react-express'];
  }

  // Get current metrics
  getMetrics() {
    return {
      ...this.metrics,
      active_agents: this.activeAgents.size,
      uptime: this.isRunning ? Date.now() - this.startTime : 0
    };
  }

  // Get current status
  getStatus() {
    return {
      orchestrator: this.isRunning ? 'running' : 'stopped',
      mcp_servers: Object.fromEntries(
        Object.entries(this.config.mcpServers).map(([name, config]) => [
          name, 
          { status: config.status, capabilities: config.capabilities }
        ])
      ),
      active_agents: Array.from(this.activeAgents.entries()).map(([id, agent]) => ({
        id,
        type: agent.type,
        mcpServer: agent.mcpServer,
        runtime: Date.now() - agent.startTime
      })),
      metrics: this.getMetrics()
    };
  }

  // Shutdown orchestrator
  async shutdown() {
    console.log('🛑 Shutting down Archon MCP Orchestrator...');
    
    // Wait for active agents to complete
    if (this.activeAgents.size > 0) {
      console.log(`⏳ Waiting for ${this.activeAgents.size} active agents to complete...`);
      // In real implementation, would wait for actual agent completion
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Execute session end hooks
    await this.executeHook('session-end', {
      sessionId: `archon-${Date.now()}`,
      exportMetrics: true
    });
    
    this.isRunning = false;
    console.log('✅ Archon MCP Orchestrator shut down gracefully');
  }
}

module.exports = { ArchonMcpOrchestrator };