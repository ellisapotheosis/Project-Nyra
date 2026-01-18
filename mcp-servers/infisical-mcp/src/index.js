#!/usr/bin/env node

/**
 * Nyra Infisical MCP Server
 * Provides secure secret management capabilities through Model Context Protocol
 *
 * @version 1.0.0
 * @author Project Nyra Team
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const winston = require('winston');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

// Configuration
const config = {
  serverName: 'infisical-mcp',
  serverVersion: '1.0.0',
  port: process.env.MCP_PORT || 8006,
  logLevel: process.env.LOG_LEVEL || 'info',
  infisicalProjectId: process.env.INFISICAL_PROJECT_ID,
  infisicalEnvironment: process.env.INFISICAL_ENVIRONMENT || 'development',
  cachePath: process.env.CACHE_PATH || '/app/cache',
  secretsPath: process.env.SECRETS_PATH || '/app/secrets',
};

// Logger setup
const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: config.serverName,
    version: config.serverVersion
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({
      filename: '/app/logs/infisical-mcp.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: '/app/logs/infisical-mcp-error.log',
      level: 'error',
      maxsize: 10485760,
      maxFiles: 5
    })
  ]
});

/**
 * Infisical CLI wrapper for secret management
 */
class InfisicalClient {
  constructor() {
    this.authenticated = false;
    this.lastHealthCheck = null;
  }

  /**
   * Execute Infisical CLI command
   */
  async executeCommand(args, options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn('infisical', args, {
        stdio: ['inherit', 'pipe', 'pipe'],
        env: {
          ...process.env,
          INFISICAL_DISABLE_UPDATE_CHECK: 'true',
          ...options.env
        },
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
          resolve({ stdout: stdout.trim(), stderr: stderr.trim(), code });
        } else {
          reject(new Error(`Infisical command failed with code ${code}: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to spawn Infisical CLI: ${error.message}`));
      });
    });
  }

  /**
   * Check authentication status
   */
  async checkAuth() {
    try {
      const result = await this.executeCommand(['secrets', 'get', '__health__']);
      this.authenticated = true;
      this.lastHealthCheck = new Date();
      return true;
    } catch (error) {
      this.authenticated = false;
      logger.warn('Infisical authentication check failed', { error: error.message });
      return false;
    }
  }

  /**
   * Get a secret by name
   */
  async getSecret(secretName, options = {}) {
    try {
      const args = [
        'secrets', 'get', secretName,
        '--env', options.environment || config.infisicalEnvironment,
        '--projectId', options.projectId || config.infisicalProjectId,
        '--plain'
      ];

      if (options.path) {
        args.push('--path', options.path);
      }

      const result = await this.executeCommand(args);
      return result.stdout;
    } catch (error) {
      logger.error('Failed to get secret', { secretName, error: error.message });
      throw error;
    }
  }

  /**
   * List all secrets
   */
  async listSecrets(options = {}) {
    try {
      const args = [
        'secrets', 'list',
        '--env', options.environment || config.infisicalEnvironment,
        '--projectId', options.projectId || config.infisicalProjectId,
        '--format', 'json'
      ];

      if (options.path) {
        args.push('--path', options.path);
      }

      const result = await this.executeCommand(args);
      return JSON.parse(result.stdout);
    } catch (error) {
      logger.error('Failed to list secrets', { error: error.message });
      throw error;
    }
  }

  /**
   * Set a secret
   */
  async setSecret(secretName, secretValue, options = {}) {
    try {
      const args = [
        'secrets', 'set', secretName, secretValue,
        '--env', options.environment || config.infisicalEnvironment,
        '--projectId', options.projectId || config.infisicalProjectId
      ];

      if (options.path) {
        args.push('--path', options.path);
      }

      const result = await this.executeCommand(args);
      return { success: true, message: result.stdout };
    } catch (error) {
      logger.error('Failed to set secret', { secretName, error: error.message });
      throw error;
    }
  }

  /**
   * Delete a secret
   */
  async deleteSecret(secretName, options = {}) {
    try {
      const args = [
        'secrets', 'delete', secretName,
        '--env', options.environment || config.infisicalEnvironment,
        '--projectId', options.projectId || config.infisicalProjectId
      ];

      if (options.path) {
        args.push('--path', options.path);
      }

      const result = await this.executeCommand(args);
      return { success: true, message: result.stdout };
    } catch (error) {
      logger.error('Failed to delete secret', { secretName, error: error.message });
      throw error;
    }
  }

  /**
   * Export secrets to file
   */
  async exportSecrets(options = {}) {
    try {
      const outputPath = options.outputPath || path.join(config.secretsPath, 'secrets.env');
      const args = [
        'secrets', 'export',
        '--env', options.environment || config.infisicalEnvironment,
        '--projectId', options.projectId || config.infisicalProjectId,
        '--format', options.format || 'dotenv'
      ];

      const result = await this.executeCommand(args);

      // Write to file
      await fs.writeFile(outputPath, result.stdout, 'utf8');

      return {
        success: true,
        path: outputPath,
        secretCount: result.stdout.split('\n').filter(line => line.trim()).length
      };
    } catch (error) {
      logger.error('Failed to export secrets', { error: error.message });
      throw error;
    }
  }
}

// Initialize Infisical client
const infisicalClient = new InfisicalClient();

// Initialize MCP server
const server = new Server(
  {
    name: config.serverName,
    version: config.serverVersion,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define MCP tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_secret',
      description: 'Retrieve a secret value from Infisical',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of the secret to retrieve',
          },
          environment: {
            type: 'string',
            description: 'Environment (development, staging, production)',
          },
          path: {
            type: 'string',
            description: 'Path to the secret (optional)',
          },
          projectId: {
            type: 'string',
            description: 'Infisical project ID (optional, uses default)',
          },
        },
        required: ['name'],
      },
    },
    {
      name: 'list_secrets',
      description: 'List all secrets in Infisical project',
      inputSchema: {
        type: 'object',
        properties: {
          environment: {
            type: 'string',
            description: 'Environment to list secrets from',
          },
          path: {
            type: 'string',
            description: 'Path to list secrets from (optional)',
          },
          projectId: {
            type: 'string',
            description: 'Infisical project ID (optional)',
          },
        },
      },
    },
    {
      name: 'set_secret',
      description: 'Create or update a secret in Infisical',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of the secret',
          },
          value: {
            type: 'string',
            description: 'Value of the secret',
          },
          environment: {
            type: 'string',
            description: 'Environment to set secret in',
          },
          path: {
            type: 'string',
            description: 'Path for the secret (optional)',
          },
          projectId: {
            type: 'string',
            description: 'Infisical project ID (optional)',
          },
        },
        required: ['name', 'value'],
      },
    },
    {
      name: 'delete_secret',
      description: 'Delete a secret from Infisical',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of the secret to delete',
          },
          environment: {
            type: 'string',
            description: 'Environment to delete from',
          },
          path: {
            type: 'string',
            description: 'Path of the secret (optional)',
          },
          projectId: {
            type: 'string',
            description: 'Infisical project ID (optional)',
          },
        },
        required: ['name'],
      },
    },
    {
      name: 'export_secrets',
      description: 'Export all secrets to a file',
      inputSchema: {
        type: 'object',
        properties: {
          environment: {
            type: 'string',
            description: 'Environment to export from',
          },
          format: {
            type: 'string',
            enum: ['dotenv', 'json', 'yaml'],
            description: 'Export format',
          },
          outputPath: {
            type: 'string',
            description: 'Output file path (optional)',
          },
          projectId: {
            type: 'string',
            description: 'Infisical project ID (optional)',
          },
        },
      },
    },
    {
      name: 'check_auth',
      description: 'Check Infisical authentication status',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    logger.info('Tool called', { tool: name, args });

    switch (name) {
      case 'get_secret': {
        const value = await infisicalClient.getSecret(args.name, args);
        return {
          content: [
            {
              type: 'text',
              text: value,
            },
          ],
        };
      }

      case 'list_secrets': {
        const secrets = await infisicalClient.listSecrets(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(secrets, null, 2),
            },
          ],
        };
      }

      case 'set_secret': {
        const result = await infisicalClient.setSecret(args.name, args.value, args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result),
            },
          ],
        };
      }

      case 'delete_secret': {
        const result = await infisicalClient.deleteSecret(args.name, args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result),
            },
          ],
        };
      }

      case 'export_secrets': {
        const result = await infisicalClient.exportSecrets(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result),
            },
          ],
        };
      }

      case 'check_auth': {
        const authenticated = await infisicalClient.checkAuth();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                authenticated,
                lastCheck: infisicalClient.lastHealthCheck,
                projectId: config.infisicalProjectId,
                environment: config.infisicalEnvironment,
              }),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    logger.error('Tool execution failed', {
      tool: name,
      error: error.message,
      stack: error.stack,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: error.message,
            tool: name,
          }),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  logger.info('Starting Infisical MCP Server', {
    version: config.serverVersion,
    port: config.port,
    environment: config.infisicalEnvironment,
  });

  // Check initial authentication
  const authenticated = await infisicalClient.checkAuth();
  if (!authenticated) {
    logger.warn('Initial authentication check failed - server will still start but tools may fail');
  }

  // Create transport and connect
  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info('Infisical MCP Server running', {
    authenticated,
    projectId: config.infisicalProjectId,
  });

  // Periodic health checks
  setInterval(async () => {
    try {
      await infisicalClient.checkAuth();
    } catch (error) {
      logger.error('Health check failed', { error: error.message });
    }
  }, 300000); // Every 5 minutes
}

// Error handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise });
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
main().catch((error) => {
  logger.error('Failed to start server', { error: error.message, stack: error.stack });
  process.exit(1);
});
