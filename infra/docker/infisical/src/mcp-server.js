#!/usr/bin/env node

/**
 * Nyra Infisical MCP Server
 * Provides secure secret management capabilities through MCP protocol
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const express = require('express');
const winston = require('winston');
const helmet = require('helmet');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Environment configuration
const config = {
  port: process.env.MCP_PORT || 8006,
  environment: process.env.NYRA_ENVIRONMENT || 'development',
  pcId: process.env.NYRA_PC_ID || 'orchestrator',
  infisicalProjectId: process.env.INFISICAL_PROJECT_ID,
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Logger setup
const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'infisical-mcp', pc: config.pcId },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({
      filename: '/app/logs/infisical-mcp.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ]
});

// Infisical CLI wrapper class
class InfisicalManager {
  constructor() {
    this.authenticated = false;
    this.lastSync = null;
  }

  async executeCommand(args, options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn('infisical', args, {
        stdio: ['inherit', 'pipe', 'pipe'],
        env: { ...process.env, ...options.env },
        cwd: options.cwd || '/app'
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, code });
        } else {
          reject(new Error(`Infisical command failed with code ${code}: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async checkAuthentication() {
    try {
      await this.executeCommand(['secrets', 'get', '__health_check__'], {
        env: { INFISICAL_DISABLE_UPDATE_CHECK: 'true' }
      });
      this.authenticated = true;
      return true;
    } catch (error) {
      this.authenticated = false;
      logger.warn('Infisical authentication check failed', { error: error.message });
      return false;
    }
  }

  async getSecrets(options = {}) {
    const args = ['secrets', 'get'];

    if (options.path) args.push('--path', options.path);
    if (options.env) args.push('--env', options.env);
    if (options.output) args.push('--output', options.output);
    if (options.recursive) args.push('--recursive');

    const result = await this.executeCommand(args);
    return JSON.parse(result.stdout);
  }

  async getSecret(name, options = {}) {
    const args = ['secrets', 'get', name];

    if (options.path) args.push('--path', options.path);
    if (options.env) args.push('--env', options.env);
    if (options.plain) args.push('--plain');

    const result = await this.executeCommand(args);
    return result.stdout.trim();
  }

  async exportSecrets(options = {}) {
    const args = ['export'];

    if (options.path) args.push('--path', options.path);
    if (options.env) args.push('--env', options.env);
    if (options.format) args.push('--format', options.format);
    if (options.output) args.push('--output', options.output);

    const result = await this.executeCommand(args);
    return result.stdout;
  }

  async runWithSecrets(command, options = {}) {
    const args = ['run'];

    if (options.path) args.push('--path', options.path);
    if (options.env) args.push('--env', options.env);

    args.push('--', ...command.split(' '));

    return await this.executeCommand(args);
  }
}

// MCP Server setup
const server = new Server(
  {
    name: 'nyra-infisical-mcp',
    version: '1.0.0',
    description: 'Infisical secret management MCP server for Nyra distributed infrastructure'
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {}
    }
  }
);

const infisicalManager = new InfisicalManager();

// MCP Tools
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'get_secret',
      description: 'Retrieve a specific secret by name',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Secret name to retrieve' },
          environment: { type: 'string', description: 'Environment (dev, staging, prod)' },
          path: { type: 'string', description: 'Secret path', default: '/' },
          plain: { type: 'boolean', description: 'Return plain value', default: false }
        },
        required: ['name']
      }
    },
    {
      name: 'get_secrets',
      description: 'Retrieve multiple secrets with optional filtering',
      inputSchema: {
        type: 'object',
        properties: {
          environment: { type: 'string', description: 'Environment (dev, staging, prod)' },
          path: { type: 'string', description: 'Secret path', default: '/' },
          recursive: { type: 'boolean', description: 'Include subfolders', default: false },
          output: { type: 'string', enum: ['json', 'yaml', 'dotenv'], default: 'json' }
        }
      }
    },
    {
      name: 'export_secrets',
      description: 'Export secrets to environment format',
      inputSchema: {
        type: 'object',
        properties: {
          environment: { type: 'string', description: 'Environment (dev, staging, prod)' },
          path: { type: 'string', description: 'Secret path', default: '/' },
          format: { type: 'string', enum: ['dotenv', 'json', 'yaml'], default: 'dotenv' }
        }
      }
    },
    {
      name: 'run_with_secrets',
      description: 'Execute command with injected secrets',
      inputSchema: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Command to execute' },
          environment: { type: 'string', description: 'Environment (dev, staging, prod)' },
          path: { type: 'string', description: 'Secret path', default: '/' }
        },
        required: ['command']
      }
    },
    {
      name: 'health_check',
      description: 'Check Infisical authentication and service health',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    }
  ]
}));

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_secret': {
        const secret = await infisicalManager.getSecret(args.name, {
          env: args.environment || config.environment,
          path: args.path,
          plain: args.plain
        });
        return {
          content: [{
            type: 'text',
            text: secret
          }]
        };
      }

      case 'get_secrets': {
        const secrets = await infisicalManager.getSecrets({
          env: args.environment || config.environment,
          path: args.path,
          recursive: args.recursive,
          output: args.output
        });
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(secrets, null, 2)
          }]
        };
      }

      case 'export_secrets': {
        const exported = await infisicalManager.exportSecrets({
          env: args.environment || config.environment,
          path: args.path,
          format: args.format
        });
        return {
          content: [{
            type: 'text',
            text: exported
          }]
        };
      }

      case 'run_with_secrets': {
        const result = await infisicalManager.runWithSecrets(args.command, {
          env: args.environment || config.environment,
          path: args.path
        });
        return {
          content: [{
            type: 'text',
            text: `Command executed successfully:\n${result.stdout}`
          }]
        };
      }

      case 'health_check': {
        const isAuth = await infisicalManager.checkAuthentication();
        const status = {
          authenticated: isAuth,
          pcId: config.pcId,
          environment: config.environment,
          projectId: config.infisicalProjectId,
          lastSync: infisicalManager.lastSync,
          timestamp: new Date().toISOString()
        };
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(status, null, 2)
          }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    logger.error('Tool execution failed', { tool: name, error: error.message });
    return {
      content: [{
        type: 'text',
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
});

// Express server for health checks and MetaMCP integration
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', async (req, res) => {
  try {
    const isAuth = await infisicalManager.checkAuthentication();
    const health = {
      status: 'healthy',
      authenticated: isAuth,
      pcId: config.pcId,
      environment: config.environment,
      timestamp: new Date().toISOString()
    };
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/mcp/capabilities', (req, res) => {
  res.json({
    serverName: 'nyra-infisical-mcp',
    version: '1.0.0',
    capabilities: ['secrets_management', 'environment_injection', 'secure_execution'],
    tools: ['get_secret', 'get_secrets', 'export_secrets', 'run_with_secrets', 'health_check']
  });
});

// Start servers
async function start() {
  logger.info('Starting Nyra Infisical MCP Server', { config });

  // Check authentication on startup
  await infisicalManager.checkAuthentication();

  // Start Express server
  app.listen(config.port, () => {
    logger.info(`Infisical MCP Server listening on port ${config.port}`);
  });

  // Start MCP server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info('MCP Server connected via stdio');
}

// Error handling
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason });
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

// Start the server
start().catch((error) => {
  logger.error('Failed to start server', { error: error.stack });
  process.exit(1);
});