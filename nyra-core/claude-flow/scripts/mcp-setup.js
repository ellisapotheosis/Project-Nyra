#!/usr/bin/env node

/**
 * MCP Setup and Initialization Script
 * Handles MCP server setup, connection testing, and troubleshooting
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class MCPSetup {
  constructor() {
    this.configPath = path.join(__dirname, '..', 'config', 'mcp-servers.json');
    this.logFile = path.join(__dirname, '..', 'logs', 'mcp-setup.log');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${level}: ${message}\n`;
    
    console.log(logMessage.trim());
    fs.appendFileSync(this.logFile, logMessage);
  }

  /**
   * Test MCP server connectivity
   */
  async testServerConnectivity() {
    this.log('Testing MCP server connectivity...');
    
    const servers = [
      { name: 'desktop-commander', command: 'claude mcp list | findstr desktop-commander' },
      { name: 'ruv-swarm', command: 'claude mcp list | findstr ruv-swarm' },
      { name: 'flow-nexus', command: 'claude mcp list | findstr flow-nexus' },
      { name: 'claude-flow', command: 'claude mcp list | findstr claude-flow' }
    ];

    const results = {};
    
    for (const server of servers) {
      try {
        const result = await this.executeCommand(server.command);
        results[server.name] = {
          connected: result.includes('✓'),
          output: result.trim()
        };
        
        this.log(`${server.name}: ${results[server.name].connected ? 'Connected' : 'Disconnected'}`);
      } catch (error) {
        results[server.name] = {
          connected: false,
          error: error.message
        };
        this.log(`${server.name}: Error - ${error.message}`, 'ERROR');
      }
    }

    return results;
  }

  /**
   * Install missing MCP servers
   */
  async installMCPServers() {
    this.log('Installing MCP servers...');

    const installCommands = [
      'claude mcp add desktop-commander npx -y @wonderwhy-er/desktop-commander@latest',
      'claude mcp add ruv-swarm npx ruv-swarm@latest mcp start',
      'claude mcp add flow-nexus npx flow-nexus@latest mcp start',
      'claude mcp add claude-flow npx claude-flow@alpha mcp start'
    ];

    for (const command of installCommands) {
      try {
        this.log(`Executing: ${command}`);
        await this.executeCommand(command);
        this.log('Installation command completed successfully');
      } catch (error) {
        this.log(`Installation failed: ${error.message}`, 'ERROR');
      }
    }
  }

  /**
   * Fix claude-flow connection issues
   */
  async fixClaudeFlowConnection() {
    this.log('Attempting to fix claude-flow connection...');

    const fixCommands = [
      'npm install claude-flow@alpha --save',
      'claude mcp remove claude-flow',
      'claude mcp add claude-flow npx claude-flow@alpha mcp start'
    ];

    for (const command of fixCommands) {
      try {
        this.log(`Executing fix command: ${command}`);
        await this.executeCommand(command);
        await this.delay(2000); // Wait between commands
      } catch (error) {
        this.log(`Fix command failed: ${error.message}`, 'WARN');
      }
    }

    // Test the connection
    const testResult = await this.testServerConnectivity();
    const claudeFlowStatus = testResult['claude-flow'];
    
    if (claudeFlowStatus?.connected) {
      this.log('claude-flow connection fixed successfully!');
    } else {
      this.log('claude-flow connection still has issues', 'ERROR');
      this.log('Manual intervention may be required', 'WARN');
    }
  }

  /**
   * Generate MCP integration report
   */
  async generateIntegrationReport() {
    this.log('Generating MCP integration report...');

    const connectivity = await this.testServerConnectivity();
    const packageInfo = await this.getPackageInfo();
    const claudeConfig = await this.getClaudeConfig();

    const report = {
      timestamp: new Date().toISOString(),
      project: 'Project Nyra - Claude Flow',
      connectivity,
      packageInfo,
      claudeConfig: claudeConfig ? 'Available' : 'Not found',
      recommendations: this.generateRecommendations(connectivity)
    };

    const reportPath = path.join(__dirname, '..', 'docs', 'mcp-integration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`Integration report saved to: ${reportPath}`);
    return report;
  }

  /**
   * Generate recommendations based on connectivity status
   */
  generateRecommendations(connectivity) {
    const recommendations = [];

    Object.entries(connectivity).forEach(([server, status]) => {
      if (!status.connected) {
        recommendations.push({
          server,
          issue: 'Server not connected',
          action: `Run: claude mcp add ${server} <command>`,
          priority: server === 'claude-flow' ? 'high' : 'medium'
        });
      }
    });

    if (recommendations.length === 0) {
      recommendations.push({
        server: 'all',
        issue: 'All servers connected',
        action: 'Monitor performance and update regularly',
        priority: 'low'
      });
    }

    return recommendations;
  }

  /**
   * Execute shell command and return output
   */
  executeCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Command failed: ${error.message}`));
          return;
        }
        resolve(stdout || stderr);
      });
    });
  }

  /**
   * Get package information
   */
  async getPackageInfo() {
    try {
      const packagePath = path.join(__dirname, '..', 'package.json');
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      return {
        name: packageData.name,
        version: packageData.version,
        dependencies: Object.keys(packageData.dependencies || {})
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Get Claude configuration
   */
  async getClaudeConfig() {
    try {
      const claudeConfigPath = path.join(process.env.HOME || process.env.USERPROFILE, '.claude.json');
      return fs.existsSync(claudeConfigPath);
    } catch (error) {
      return false;
    }
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Main setup routine
   */
  async run() {
    this.log('Starting MCP integration setup...');

    try {
      // Test current connectivity
      const connectivity = await this.testServerConnectivity();
      
      // Fix claude-flow if needed
      if (!connectivity['claude-flow']?.connected) {
        await this.fixClaudeFlowConnection();
      }

      // Generate integration report
      await this.generateIntegrationReport();

      this.log('MCP integration setup completed successfully!');
      
    } catch (error) {
      this.log(`Setup failed: ${error.message}`, 'ERROR');
      process.exit(1);
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new MCPSetup();
  setup.run();
}

module.exports = MCPSetup;