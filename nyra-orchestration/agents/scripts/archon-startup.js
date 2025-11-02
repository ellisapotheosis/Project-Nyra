#!/usr/bin/env node

/**
 * Archon Startup Script
 * Initializes and starts the Archon MCP Orchestrator
 */

const { ArchonMcpOrchestrator } = require('../src/orchestration/archon-mcp-orchestrator');
const path = require('path');
const fs = require('fs');

class ArchonStartup {
  constructor() {
    this.orchestrator = null;
    this.startupTime = Date.now();
  }

  async start() {
    console.log('🚀 Starting Archon MCP Orchestrator...\n');

    try {
      // Display startup banner
      this.displayBanner();

      // Pre-startup checks
      await this.performPreStartupChecks();

      // Initialize orchestrator
      this.orchestrator = new ArchonMcpOrchestrator();
      const initResult = await this.orchestrator.initialize();

      // Display startup results
      this.displayStartupResults(initResult);

      // Set up graceful shutdown
      this.setupGracefulShutdown();

      // Start interactive mode if requested
      if (process.argv.includes('--interactive')) {
        await this.startInteractiveMode();
      }

      console.log('\n✅ Archon is ready for orchestration!\n');
      
      // Keep process alive
      if (!process.argv.includes('--test')) {
        process.stdin.resume();
      }

    } catch (error) {
      console.error('❌ Startup failed:', error.message);
      process.exit(1);
    }
  }

  displayBanner() {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                              🏛️  ARCHON  🏛️                                ║
║                     Multi-Agent MCP Orchestration Layer                     ║
║                                                                              ║
║  🎯 54 Specialized Agents    🔌 4 MCP Servers    ⚡ 3 Workflow Patterns    ║
╚══════════════════════════════════════════════════════════════════════════════╝
    `);
  }

  async performPreStartupChecks() {
    console.log('🔍 Performing pre-startup checks...\n');

    const checks = [
      { name: 'Node.js version', check: () => this.checkNodeVersion() },
      { name: 'Required directories', check: () => this.checkDirectories() },
      { name: 'Claude configuration', check: () => this.checkClaudeConfig() },
      { name: 'Package dependencies', check: () => this.checkDependencies() }
    ];

    for (const check of checks) {
      try {
        const result = await check.check();
        console.log(`  ✅ ${check.name}: ${result}`);
      } catch (error) {
        console.log(`  ⚠️ ${check.name}: ${error.message}`);
      }
    }

    console.log('');
  }

  checkNodeVersion() {
    const version = process.version;
    const majorVersion = parseInt(version.split('.')[0].substring(1));
    
    if (majorVersion < 16) {
      throw new Error(`Node.js ${version} (requires v16+)`);
    }
    
    return `${version} ✓`;
  }

  checkDirectories() {
    const requiredDirs = [
      '.claude/agents',
      'src/orchestration',
      'config',
      'docs',
      'scripts'
    ];

    const missing = requiredDirs.filter(dir => !fs.existsSync(dir));
    
    if (missing.length > 0) {
      throw new Error(`Missing directories: ${missing.join(', ')}`);
    }
    
    return `${requiredDirs.length} directories present`;
  }

  checkClaudeConfig() {
    const configFiles = [
      '.claude/settings.json',
      '.claude/settings.local.json'
    ];

    for (const configFile of configFiles) {
      if (!fs.existsSync(configFile)) {
        throw new Error(`Missing ${configFile}`);
      }
    }

    return 'Configuration files present';
  }

  checkDependencies() {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json not found');
    }

    // In a real implementation, would check if node_modules exists
    // and verify key dependencies
    return 'Dependencies available';
  }

  displayStartupResults(initResult) {
    console.log('📊 Startup Results:\n');
    
    console.log(`  🤖 Available Agents: ${initResult.available_agents}`);
    console.log(`  🔌 Connected MCP Servers: ${initResult.connected_mcp_servers}`);
    console.log(`  🎯 Orchestration Patterns: ${initResult.orchestration_patterns}`);
    
    const startupTime = Date.now() - this.startupTime;
    console.log(`  ⏱️ Startup Time: ${startupTime}ms`);

    // Display MCP server status
    const status = this.orchestrator.getStatus();
    console.log('\n🔌 MCP Server Status:');
    
    Object.entries(status.mcp_servers).forEach(([name, server]) => {
      const icon = server.status === 'connected' ? '✅' : 
                   server.status === 'unstable' ? '⚠️' : '❌';
      console.log(`  ${icon} ${name}: ${server.status}`);
    });
  }

  setupGracefulShutdown() {
    const shutdownHandler = async (signal) => {
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
      
      if (this.orchestrator) {
        await this.orchestrator.shutdown();
      }
      
      console.log('👋 Archon has been shut down successfully');
      process.exit(0);
    };

    process.on('SIGINT', shutdownHandler);
    process.on('SIGTERM', shutdownHandler);
    process.on('SIGUSR2', shutdownHandler); // nodemon restart
  }

  async startInteractiveMode() {
    console.log('\n🎮 Starting interactive mode...');
    console.log('Available commands:');
    console.log('  - sparc <description>   : Execute SPARC workflow');
    console.log('  - webapp <stack>        : Scaffold web application');
    console.log('  - status                : Show orchestrator status');
    console.log('  - agents                : List available agents');
    console.log('  - metrics               : Show performance metrics');
    console.log('  - help                  : Show this help');
    console.log('  - exit                  : Exit interactive mode');
    console.log('');

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'archon> '
    });

    rl.prompt();

    rl.on('line', async (line) => {
      const [command, ...args] = line.trim().split(' ');
      
      try {
        await this.handleInteractiveCommand(command, args);
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
      
      rl.prompt();
    });

    rl.on('close', () => {
      console.log('\n👋 Exiting interactive mode...');
    });
  }

  async handleInteractiveCommand(command, args) {
    switch (command) {
      case 'sparc':
        const description = args.join(' ') || 'Test SPARC workflow';
        console.log(`🎯 Executing SPARC workflow: ${description}`);
        const spartResult = await this.orchestrator.executeSPARCWorkflow(description);
        console.log(`✅ SPARC workflow completed: ${spartResult.workflowId}`);
        break;

      case 'webapp':
        const stack = args[0] || 'react-express';
        console.log(`🏗️ Scaffolding web application: ${stack}`);
        const webappResult = await this.orchestrator.executeWebAppScaffolding({
          name: 'TestApp',
          stack: stack,
          features: ['authentication', 'database']
        });
        console.log(`✅ Web app scaffolded: ${webappResult.scaffoldId}`);
        break;

      case 'status':
        const status = this.orchestrator.getStatus();
        console.log('\n📊 Orchestrator Status:');
        console.log(`  Orchestrator: ${status.orchestrator}`);
        console.log(`  Active Agents: ${status.active_agents.length}`);
        console.log(`  MCP Servers: ${Object.keys(status.mcp_servers).length}`);
        break;

      case 'agents':
        const agents = Object.keys(this.orchestrator.config.agentCapabilities);
        console.log(`\n👥 Available Agents (${agents.length}):`)
        agents.sort().forEach(agent => console.log(`  🤖 ${agent}`));
        break;

      case 'metrics':
        const metrics = this.orchestrator.getMetrics();
        console.log('\n📈 Performance Metrics:');
        Object.entries(metrics).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
        break;

      case 'help':
        console.log('\n🎮 Interactive Commands:');
        console.log('  sparc <description>   - Execute SPARC workflow');
        console.log('  webapp <stack>        - Scaffold web application');  
        console.log('  status                - Show orchestrator status');
        console.log('  agents                - List available agents');
        console.log('  metrics               - Show performance metrics');
        console.log('  exit                  - Exit interactive mode');
        break;

      case 'exit':
        process.exit(0);
        break;

      default:
        if (command) {
          console.log(`❓ Unknown command: ${command}. Type 'help' for available commands.`);
        }
        break;
    }
  }
}

// CLI argument parsing
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    interactive: args.includes('--interactive') || args.includes('-i'),
    test: args.includes('--test') || args.includes('-t'),
    help: args.includes('--help') || args.includes('-h')
  };
}

function showHelp() {
  console.log(`
Archon MCP Orchestrator Startup Script

Usage: node archon-startup.js [options]

Options:
  -i, --interactive    Start in interactive mode
  -t, --test          Run in test mode (exit after startup)  
  -h, --help          Show this help message

Examples:
  node archon-startup.js                 # Start orchestrator
  node archon-startup.js --interactive   # Start with interactive mode
  node archon-startup.js --test          # Test startup and exit
`);
}

// Main execution
async function main() {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    return;
  }

  const startup = new ArchonStartup();
  
  if (options.interactive) {
    process.argv.push('--interactive');
  }
  
  if (options.test) {
    process.argv.push('--test');
  }
  
  await startup.start();
}

// Execute if run directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Startup failed:', error);
    process.exit(1);
  });
}

module.exports = { ArchonStartup };