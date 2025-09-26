/**
 * MCP-Archon Integration Configuration
 * Connects Archon's 54 agents with MCP server orchestration
 */

const path = require('path');
const fs = require('fs');

// Load Claude agent definitions
const CLAUDE_AGENTS_PATH = path.join(__dirname, '../.claude/agents');

class McpArchonConfig {
  constructor() {
    this.mcpServers = this.initializeMcpServers();
    this.agentCapabilities = this.loadAgentCapabilities();
    this.routingRules = this.defineRoutingRules();
    this.orchestrationPatterns = this.setupOrchestrationPatterns();
  }

  initializeMcpServers() {
    return {
      // Priority-based server configuration from .claude/settings.local.json
      'desktop-commander': {
        priority: 1,
        capabilities: ['file_operations', 'process_management', 'system_commands'],
        status: 'connected',
        fallback: 'ruv-swarm'
      },
      'ruv-swarm': {
        priority: 2,
        capabilities: ['neural_coordination', 'swarm_management', 'memory_operations'],
        status: 'connected',
        fallback: 'flow-nexus'
      },
      'flow-nexus': {
        priority: 3,
        capabilities: ['cloud_execution', 'template_management', 'realtime_monitoring'],
        status: 'connected',
        fallback: null
      },
      'claude-flow': {
        priority: 0, // Highest when available
        capabilities: ['agent_spawning', 'workflow_coordination', 'sparc_integration'],
        status: 'unstable', // Connection issues
        fallback: 'desktop-commander'
      }
    };
  }

  loadAgentCapabilities() {
    // Map Archon's agents to MCP server capabilities
    return {
      // Core Development Agents (from .claude/agents/core/)
      'coder': {
        mcp_servers: ['claude-flow', 'desktop-commander'],
        capabilities: ['code_generation', 'file_operations', 'git_operations'],
        concurrent_limit: 4
      },
      'reviewer': {
        mcp_servers: ['desktop-commander', 'ruv-swarm'],
        capabilities: ['code_analysis', 'security_scan', 'quality_metrics'],
        concurrent_limit: 2
      },
      'tester': {
        mcp_servers: ['desktop-commander', 'flow-nexus'],
        capabilities: ['test_execution', 'coverage_analysis', 'performance_testing'],
        concurrent_limit: 3
      },
      'planner': {
        mcp_servers: ['ruv-swarm', 'flow-nexus'],
        capabilities: ['task_breakdown', 'resource_allocation', 'workflow_design'],
        concurrent_limit: 1
      },
      'researcher': {
        mcp_servers: ['flow-nexus', 'desktop-commander'],
        capabilities: ['web_search', 'documentation_analysis', 'technology_research'],
        concurrent_limit: 2
      },

      // SPARC Methodology Agents (from .claude/agents/sparc/)
      'specification': {
        mcp_servers: ['ruv-swarm', 'desktop-commander'],
        capabilities: ['requirements_analysis', 'use_case_modeling', 'specification_writing'],
        concurrent_limit: 1
      },
      'pseudocode': {
        mcp_servers: ['desktop-commander', 'ruv-swarm'],
        capabilities: ['algorithm_design', 'logic_modeling', 'pseudocode_generation'],
        concurrent_limit: 1
      },
      'architecture': {
        mcp_servers: ['flow-nexus', 'ruv-swarm'],
        capabilities: ['system_design', 'technology_selection', 'architecture_documentation'],
        concurrent_limit: 1
      },
      'refinement': {
        mcp_servers: ['claude-flow', 'desktop-commander'],
        capabilities: ['code_optimization', 'performance_tuning', 'refactoring'],
        concurrent_limit: 2
      },

      // Specialized Development Agents
      'backend-dev': {
        mcp_servers: ['desktop-commander', 'flow-nexus'],
        capabilities: ['api_development', 'database_design', 'server_configuration'],
        concurrent_limit: 2
      },
      'frontend-dev': {
        mcp_servers: ['desktop-commander', 'flow-nexus'],
        capabilities: ['ui_development', 'frontend_frameworks', 'responsive_design'],
        concurrent_limit: 2
      },
      'devops': {
        mcp_servers: ['flow-nexus', 'desktop-commander'],
        capabilities: ['deployment', 'ci_cd', 'infrastructure_management'],
        concurrent_limit: 1
      },

      // GitHub & Repository Management
      'github-modes': {
        mcp_servers: ['flow-nexus', 'desktop-commander'],
        capabilities: ['repository_analysis', 'pr_management', 'issue_tracking'],
        concurrent_limit: 1
      }
    };
  }

  defineRoutingRules() {
    return {
      // Task type to agent routing
      task_routing: {
        'code_generation': ['coder', 'backend-dev', 'frontend-dev'],
        'testing': ['tester'],
        'code_review': ['reviewer'],
        'planning': ['planner'],
        'research': ['researcher'],
        'architecture': ['architecture'],
        'deployment': ['devops'],
        'documentation': ['docs-writer']
      },

      // File pattern to agent routing
      file_routing: {
        '*.js|*.ts|*.jsx|*.tsx': ['coder', 'frontend-dev'],
        '*.py|*.java|*.go|*.rs': ['coder', 'backend-dev'],
        '*.test.*|*spec.*': ['tester'],
        '*.md|*.rst|*.txt': ['docs-writer'],
        '*.yml|*.yaml|Dockerfile': ['devops'],
        '*.sql|migrations/*': ['backend-dev']
      },

      // MCP server priority routing
      server_routing: {
        'file_operations': ['desktop-commander', 'claude-flow'],
        'cloud_execution': ['flow-nexus', 'desktop-commander'],
        'neural_coordination': ['ruv-swarm', 'flow-nexus'],
        'workflow_orchestration': ['claude-flow', 'ruv-swarm']
      }
    };
  }

  setupOrchestrationPatterns() {
    return {
      // SPARC Workflow Pattern
      sparc_workflow: {
        name: 'SPARC TDD Workflow',
        phases: [
          {
            phase: 'specification',
            agents: ['specification', 'researcher'],
            mcp_servers: ['ruv-swarm', 'desktop-commander'],
            parallel: true
          },
          {
            phase: 'pseudocode',
            agents: ['pseudocode', 'planner'],
            mcp_servers: ['desktop-commander', 'ruv-swarm'],
            parallel: true
          },
          {
            phase: 'architecture',
            agents: ['architecture'],
            mcp_servers: ['flow-nexus', 'ruv-swarm'],
            parallel: false
          },
          {
            phase: 'refinement',
            agents: ['coder', 'tester', 'reviewer'],
            mcp_servers: ['claude-flow', 'desktop-commander'],
            parallel: true
          },
          {
            phase: 'completion',
            agents: ['integration', 'devops'],
            mcp_servers: ['flow-nexus', 'desktop-commander'],
            parallel: true
          }
        ]
      },

      // Web Application Scaffolding Pattern
      webapp_scaffold: {
        name: 'Full-Stack Web Application Scaffolding',
        phases: [
          {
            phase: 'planning',
            agents: ['planner', 'architecture'],
            mcp_servers: ['ruv-swarm', 'flow-nexus'],
            parallel: true
          },
          {
            phase: 'backend_setup',
            agents: ['backend-dev', 'coder'],
            mcp_servers: ['desktop-commander', 'flow-nexus'],
            parallel: true
          },
          {
            phase: 'frontend_setup',
            agents: ['frontend-dev', 'coder'],
            mcp_servers: ['desktop-commander', 'flow-nexus'],
            parallel: true
          },
          {
            phase: 'testing_setup',
            agents: ['tester'],
            mcp_servers: ['desktop-commander', 'flow-nexus'],
            parallel: false
          },
          {
            phase: 'deployment',
            agents: ['devops'],
            mcp_servers: ['flow-nexus', 'desktop-commander'],
            parallel: false
          }
        ]
      },

      // Multi-Agent Coordination Pattern
      multi_agent_coordination: {
        name: 'Concurrent Multi-Agent Development',
        max_concurrent_agents: 8,
        coordination_hooks: {
          pre_task: 'npx claude-flow@alpha hooks pre-task --description "{task}" --agentType "{agentType}"',
          post_task: 'npx claude-flow@alpha hooks post-task --taskId "{taskId}" --success {success}',
          session_restore: 'npx claude-flow@alpha hooks session-restore --sessionId "{sessionId}"',
          session_end: 'npx claude-flow@alpha hooks session-end --exportMetrics true'
        }
      }
    };
  }

  // Get MCP server for specific capability
  getMcpServerForCapability(capability) {
    const servers = this.routingRules.server_routing[capability] || [];
    for (const serverName of servers) {
      const server = this.mcpServers[serverName];
      if (server && server.status === 'connected') {
        return serverName;
      }
    }
    return null;
  }

  // Get agents for specific task type
  getAgentsForTask(taskType) {
    return this.routingRules.task_routing[taskType] || [];
  }

  // Get orchestration pattern by name
  getOrchestrationPattern(patternName) {
    return this.orchestrationPatterns[patternName];
  }

  // Validate configuration
  validate() {
    const errors = [];
    
    // Check MCP server connectivity
    Object.entries(this.mcpServers).forEach(([name, config]) => {
      if (config.status !== 'connected' && config.status !== 'unstable') {
        errors.push(`MCP server ${name} is not available: ${config.status}`);
      }
    });

    // Check agent capability mappings
    Object.entries(this.agentCapabilities).forEach(([agentName, config]) => {
      config.mcp_servers.forEach(serverName => {
        if (!this.mcpServers[serverName]) {
          errors.push(`Agent ${agentName} references unknown MCP server: ${serverName}`);
        }
      });
    });

    return errors;
  }
}

module.exports = { McpArchonConfig };