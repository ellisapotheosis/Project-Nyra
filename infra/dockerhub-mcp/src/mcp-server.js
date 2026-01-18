#!/usr/bin/env node

/**
 * Docker Hub MCP Server
 *
 * Provides Model Context Protocol interface for Docker Hub operations:
 * - Repository management
 * - Image operations
 * - Tag management
 * - Webhook configuration
 * - Build automation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import pino from 'pino';
import { DockerHubAPI } from './dockerhub-api.js';
import { loadConfig } from './config.js';

// Initialize logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
    },
  },
});

// Load configuration
const config = await loadConfig();

// Initialize Docker Hub API client
const dockerhub = new DockerHubAPI({
  username: config.dockerhub.username,
  token: config.dockerhub.token,
  namespace: config.dockerhub.namespace,
  logger,
});

// Initialize MCP server
const server = new Server(
  {
    name: 'dockerhub-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Health check server
const app = express();
const port = config.mcp.port || 8007;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'dockerhub-mcp',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    dockerhub: {
      authenticated: dockerhub.isAuthenticated(),
      namespace: config.dockerhub.namespace,
    },
  });
});

app.get('/metrics', (req, res) => {
  res.json(dockerhub.getMetrics());
});

// MCP Tool Definitions
const tools = [
  {
    name: 'list_repositories',
    description: 'List all repositories in the Docker Hub namespace',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        page_size: { type: 'number', description: 'Items per page (default: 25)' },
      },
    },
  },
  {
    name: 'get_repository',
    description: 'Get details of a specific repository',
    inputSchema: {
      type: 'object',
      properties: {
        repository: { type: 'string', description: 'Repository name' },
      },
      required: ['repository'],
    },
  },
  {
    name: 'list_tags',
    description: 'List all tags for a repository',
    inputSchema: {
      type: 'object',
      properties: {
        repository: { type: 'string', description: 'Repository name' },
        page: { type: 'number', description: 'Page number (default: 1)' },
        page_size: { type: 'number', description: 'Items per page (default: 25)' },
      },
      required: ['repository'],
    },
  },
  {
    name: 'get_tag',
    description: 'Get details of a specific image tag',
    inputSchema: {
      type: 'object',
      properties: {
        repository: { type: 'string', description: 'Repository name' },
        tag: { type: 'string', description: 'Tag name' },
      },
      required: ['repository', 'tag'],
    },
  },
  {
    name: 'delete_tag',
    description: 'Delete a specific tag from a repository',
    inputSchema: {
      type: 'object',
      properties: {
        repository: { type: 'string', description: 'Repository name' },
        tag: { type: 'string', description: 'Tag name to delete' },
      },
      required: ['repository', 'tag'],
    },
  },
  {
    name: 'update_repository',
    description: 'Update repository description or other metadata',
    inputSchema: {
      type: 'object',
      properties: {
        repository: { type: 'string', description: 'Repository name' },
        description: { type: 'string', description: 'New description' },
        full_description: { type: 'string', description: 'Full README content' },
        is_private: { type: 'boolean', description: 'Private repository flag' },
      },
      required: ['repository'],
    },
  },
  {
    name: 'create_repository',
    description: 'Create a new Docker Hub repository',
    inputSchema: {
      type: 'object',
      properties: {
        repository: { type: 'string', description: 'Repository name' },
        description: { type: 'string', description: 'Repository description' },
        is_private: { type: 'boolean', description: 'Private repository flag (default: false)' },
      },
      required: ['repository'],
    },
  },
  {
    name: 'list_webhooks',
    description: 'List webhooks for a repository',
    inputSchema: {
      type: 'object',
      properties: {
        repository: { type: 'string', description: 'Repository name' },
      },
      required: ['repository'],
    },
  },
  {
    name: 'create_webhook',
    description: 'Create a webhook for repository events',
    inputSchema: {
      type: 'object',
      properties: {
        repository: { type: 'string', description: 'Repository name' },
        webhook_url: { type: 'string', description: 'Webhook endpoint URL' },
        name: { type: 'string', description: 'Webhook name' },
      },
      required: ['repository', 'webhook_url', 'name'],
    },
  },
  {
    name: 'get_build_history',
    description: 'Get build history for a repository',
    inputSchema: {
      type: 'object',
      properties: {
        repository: { type: 'string', description: 'Repository name' },
      },
      required: ['repository'],
    },
  },
];

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_repositories':
        return await dockerhub.listRepositories(args.page, args.page_size);

      case 'get_repository':
        return await dockerhub.getRepository(args.repository);

      case 'list_tags':
        return await dockerhub.listTags(args.repository, args.page, args.page_size);

      case 'get_tag':
        return await dockerhub.getTag(args.repository, args.tag);

      case 'delete_tag':
        return await dockerhub.deleteTag(args.repository, args.tag);

      case 'update_repository':
        return await dockerhub.updateRepository(args.repository, {
          description: args.description,
          full_description: args.full_description,
          is_private: args.is_private,
        });

      case 'create_repository':
        return await dockerhub.createRepository(args.repository, {
          description: args.description,
          is_private: args.is_private,
        });

      case 'list_webhooks':
        return await dockerhub.listWebhooks(args.repository);

      case 'create_webhook':
        return await dockerhub.createWebhook(args.repository, {
          webhook_url: args.webhook_url,
          name: args.name,
        });

      case 'get_build_history':
        return await dockerhub.getBuildHistory(args.repository);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    logger.error({ error, tool: name }, 'Tool execution failed');
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start servers
async function main() {
  // Start health check server
  app.listen(port, '0.0.0.0', () => {
    logger.info(`Docker Hub MCP health server listening on port ${port}`);
  });

  // Start MCP server on stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info('Docker Hub MCP server started successfully');
  logger.info({
    namespace: config.dockerhub.namespace,
    authenticated: dockerhub.isAuthenticated(),
  });
}

// Handle shutdown
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

// Start the server
main().catch((error) => {
  logger.error({ error }, 'Fatal error starting server');
  process.exit(1);
});
