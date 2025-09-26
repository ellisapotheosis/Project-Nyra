/**
 * MCP Environment Configuration
 * Manages environment variables for MCP servers with Infisical integration
 */

const fs = require('fs');
const path = require('path');

class McpEnvConfig {
  constructor() {
    this.requiredVars = {
      'FLOW_NEXUS_TOKEN': {
        description: 'Authentication token for Flow Nexus MCP server',
        required: true,
        mcp_server: 'flow-nexus'
      },
      'FLOW_NEXUS_URL': {
        description: 'Flow Nexus API endpoint URL',
        required: true,
        mcp_server: 'flow-nexus',
        default: 'https://flow-nexus.ruv.io'
      },
      'NOTION_TOKEN': {
        description: 'Notion integration token for documentation',
        required: false,
        mcp_server: 'notion',
        purpose: 'documentation_sync'
      }
    };

    this.optionalVars = {
      'DESKTOP_COMMANDER_CONFIG': {
        description: 'Desktop Commander configuration',
        mcp_server: 'desktop-commander',
        purpose: 'system_integration'
      },
      'RUV_SWARM_TOKEN': {
        description: 'rUv Swarm authentication token',
        mcp_server: 'ruv-swarm',
        purpose: 'neural_coordination'
      },
      'CLAUDE_FLOW_CONFIG': {
        description: 'Claude Flow additional configuration',
        mcp_server: 'claude-flow',
        purpose: 'workflow_coordination'
      },
      'GITHUB_TOKEN': {
        description: 'GitHub personal access token',
        mcp_server: 'flow-nexus',
        purpose: 'github_integration'
      }
    };

    this.mcpServerConfig = {
      'flow-nexus': {
        name: 'Flow Nexus',
        priority: 1,
        required_vars: ['FLOW_NEXUS_TOKEN', 'FLOW_NEXUS_URL'],
        optional_vars: ['GITHUB_TOKEN'],
        features: ['cloud_execution', 'github_integration', 'neural_training']
      },
      'desktop-commander': {
        name: 'Desktop Commander',
        priority: 2,
        required_vars: [],
        optional_vars: ['DESKTOP_COMMANDER_CONFIG'],
        features: ['file_operations', 'process_management', 'system_commands']
      },
      'ruv-swarm': {
        name: 'rUv Swarm',
        priority: 3,
        required_vars: [],
        optional_vars: ['RUV_SWARM_TOKEN'],
        features: ['neural_coordination', 'swarm_management', 'memory_operations']
      },
      'claude-flow': {
        name: 'Claude Flow',
        priority: 4,
        required_vars: [],
        optional_vars: ['CLAUDE_FLOW_CONFIG'],
        features: ['agent_spawning', 'workflow_coordination', 'sparc_integration']
      },
      'notion': {
        name: 'Notion Integration',
        priority: 5,
        required_vars: [],
        optional_vars: ['NOTION_TOKEN'],
        features: ['documentation_sync', 'project_management']
      }
    };
  }

  // Check environment variable status
  checkEnvironment() {
    const status = {
      overall_status: 'unknown',
      required_missing: [],
      optional_missing: [],
      configured_servers: [],
      environment_vars: {}
    };

    // Check required variables
    Object.entries(this.requiredVars).forEach(([varName, config]) => {
      const value = process.env[varName];
      status.environment_vars[varName] = {
        set: !!value,
        required: config.required,
        mcp_server: config.mcp_server,
        description: config.description
      };

      if (config.required && !value) {
        status.required_missing.push(varName);
      }
    });

    // Check optional variables
    Object.entries(this.optionalVars).forEach(([varName, config]) => {
      const value = process.env[varName];
      status.environment_vars[varName] = {
        set: !!value,
        required: false,
        mcp_server: config.mcp_server,
        description: config.description,
        purpose: config.purpose
      };

      if (!value) {
        status.optional_missing.push(varName);
      }
    });

    // Determine overall status
    if (status.required_missing.length === 0) {
      status.overall_status = 'ready';
    } else {
      status.overall_status = 'incomplete';
    }

    // Check which servers are properly configured
    Object.entries(this.mcpServerConfig).forEach(([serverKey, serverConfig]) => {
      const requiredVarsSet = serverConfig.required_vars.every(varName => 
        process.env[varName]
      );
      
      if (requiredVarsSet) {
        status.configured_servers.push({
          server: serverKey,
          name: serverConfig.name,
          priority: serverConfig.priority,
          features: serverConfig.features
        });
      }
    });

    return status;
  }

  // Generate Infisical setup commands
  generateInfisicalCommands() {
    const commands = {
      powershell: [],
      bash: [],
      cmd: []
    };

    // Required variables
    Object.keys(this.requiredVars).forEach(varName => {
      commands.powershell.push(`$env:${varName} = (infisical secrets get ${varName} --env=prod --plain)`);
      commands.bash.push(`export ${varName}=$(infisical secrets get ${varName} --env=prod --plain)`);
      commands.cmd.push(`set ${varName}=(infisical secrets get ${varName} --env=prod --plain)`);
    });

    // Optional variables (with error handling)
    Object.keys(this.optionalVars).forEach(varName => {
      commands.powershell.push(
        `try { $env:${varName} = (infisical secrets get ${varName} --env=prod --plain) } catch { Write-Host "Optional: ${varName} not found" }`
      );
      commands.bash.push(`${varName}=$(infisical secrets get ${varName} --env=prod --plain 2>/dev/null) && export ${varName}`);
      commands.cmd.push(`for /f %%i in ('infisical secrets get ${varName} --env=prod --plain 2^>nul') do set ${varName}=%%i`);
    });

    return commands;
  }

  // Generate .env template
  generateEnvTemplate() {
    let template = '# Project Nyra MCP Environment Configuration\n';
    template += '# Generated automatically - configure in Infisical\n\n';

    template += '# Required Environment Variables\n';
    Object.entries(this.requiredVars).forEach(([varName, config]) => {
      template += `# ${config.description}\n`;
      template += `${varName}=${config.default || 'your-token-here'}\n\n`;
    });

    template += '# Optional Environment Variables\n';
    Object.entries(this.optionalVars).forEach(([varName, config]) => {
      template += `# ${config.description} (${config.purpose})\n`;
      template += `# ${varName}=optional-value\n\n`;
    });

    return template;
  }

  // Validate MCP server configuration
  validateMcpServers() {
    const validation = {
      valid_servers: [],
      invalid_servers: [],
      warnings: []
    };

    Object.entries(this.mcpServerConfig).forEach(([serverKey, serverConfig]) => {
      const serverValidation = {
        server: serverKey,
        name: serverConfig.name,
        required_vars_status: {},
        optional_vars_status: {},
        overall_valid: true
      };

      // Check required variables
      serverConfig.required_vars.forEach(varName => {
        const isSet = !!process.env[varName];
        serverValidation.required_vars_status[varName] = isSet;
        if (!isSet) {
          serverValidation.overall_valid = false;
        }
      });

      // Check optional variables
      serverConfig.optional_vars.forEach(varName => {
        serverValidation.optional_vars_status[varName] = !!process.env[varName];
      });

      if (serverValidation.overall_valid) {
        validation.valid_servers.push(serverValidation);
      } else {
        validation.invalid_servers.push(serverValidation);
      }

      // Add warnings for missing optional variables that enable important features
      serverConfig.optional_vars.forEach(varName => {
        if (!process.env[varName]) {
          const varConfig = this.optionalVars[varName];
          if (varConfig && varConfig.purpose) {
            validation.warnings.push(
              `${serverConfig.name}: Missing ${varName} - ${varConfig.purpose} features unavailable`
            );
          }
        }
      });
    });

    return validation;
  }

  // Get configuration recommendations
  getRecommendations() {
    const status = this.checkEnvironment();
    const recommendations = [];

    if (status.required_missing.length > 0) {
      recommendations.push({
        priority: 'high',
        type: 'missing_required',
        message: `Required environment variables missing: ${status.required_missing.join(', ')}`,
        action: 'Run the Infisical setup script to configure these variables'
      });
    }

    if (status.optional_missing.includes('GITHUB_TOKEN')) {
      recommendations.push({
        priority: 'medium',
        type: 'enhanced_features',
        message: 'GitHub token not configured - using Flow Nexus GitHub integration only',
        action: 'Set GITHUB_TOKEN for enhanced GitHub features'
      });
    }

    if (status.optional_missing.includes('NOTION_TOKEN')) {
      recommendations.push({
        priority: 'low',
        type: 'documentation_sync',
        message: 'Notion integration not configured',
        action: 'Set NOTION_TOKEN to enable documentation synchronization'
      });
    }

    // Check for Flow Nexus specific configuration
    if (!process.env.FLOW_NEXUS_URL) {
      recommendations.push({
        priority: 'medium',
        type: 'configuration',
        message: 'Flow Nexus URL not set - using default endpoint',
        action: 'Verify FLOW_NEXUS_URL points to correct instance'
      });
    }

    return recommendations;
  }

  // Display environment status
  displayStatus() {
    const status = this.checkEnvironment();
    const validation = this.validateMcpServers();
    const recommendations = this.getRecommendations();

    console.log('🔐 MCP Environment Status\n');
    
    // Overall status
    const statusIcon = status.overall_status === 'ready' ? '✅' : '⚠️';
    console.log(`${statusIcon} Overall Status: ${status.overall_status}`);
    
    if (status.required_missing.length > 0) {
      console.log(`❌ Missing Required: ${status.required_missing.join(', ')}`);
    }
    
    if (status.optional_missing.length > 0) {
      console.log(`ℹ️ Missing Optional: ${status.optional_missing.join(', ')}`);
    }
    
    console.log('');

    // MCP Server Status
    console.log('🔌 MCP Server Configuration:');
    validation.valid_servers.forEach(server => {
      console.log(`  ✅ ${server.name}: Ready`);
    });
    
    validation.invalid_servers.forEach(server => {
      const missingVars = Object.entries(server.required_vars_status)
        .filter(([_, isSet]) => !isSet)
        .map(([varName]) => varName);
      console.log(`  ❌ ${server.name}: Missing ${missingVars.join(', ')}`);
    });
    
    console.log('');

    // Warnings
    if (validation.warnings.length > 0) {
      console.log('⚠️ Warnings:');
      validation.warnings.forEach(warning => {
        console.log(`  • ${warning}`);
      });
      console.log('');
    }

    // Recommendations
    if (recommendations.length > 0) {
      console.log('💡 Recommendations:');
      recommendations.forEach(rec => {
        const priorityIcon = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🔵';
        console.log(`  ${priorityIcon} ${rec.message}`);
        console.log(`     Action: ${rec.action}`);
      });
    }

    return {
      status,
      validation,
      recommendations
    };
  }
}

module.exports = { McpEnvConfig };