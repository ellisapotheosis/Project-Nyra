/**
 * Agentic-Flow MCP Server
 *
 * Model Context Protocol server for agent orchestration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import pino from 'pino';
import { config } from './config/index.js';
import { initializeAgentDB } from './services/agentdb.js';
import { initializeRedis } from './services/redis.js';
import { initializePostgres } from './services/postgres.js';

// Initialize logger
const logger = pino({
  level: config.logLevel,
  transport: config.nodeEnv === 'development' ? {
    target: 'pino-pretty',
    options: { colorize: true }
  } : undefined,
});

async function main() {
  try {
    logger.info('Starting Agentic-Flow MCP Server...');

    // Initialize services
    const [agentdb, redis, postgres] = await Promise.all([
      initializeAgentDB(logger),
      initializeRedis(logger),
      initializePostgres(logger),
    ]);

    // Create MCP server
    const server = new Server(
      {
        name: 'agentic-flow',
        version: '2.0.0-alpha',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    // Register tools
    server.setRequestHandler('tools/list', async () => {
      return {
        tools: [
          {
            name: 'agentic_flow_spawn_agent',
            description: 'Spawn a new agent',
            inputSchema: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  description: 'Agent type (coder, tester, reviewer, etc.)',
                },
                config: {
                  type: 'object',
                  description: 'Agent configuration',
                },
              },
              required: ['type'],
            },
          },
          {
            name: 'agentic_flow_search_memory',
            description: 'Search AgentDB memory',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query',
                },
                k: {
                  type: 'number',
                  description: 'Number of results',
                  default: 10,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'agentic_flow_store_memory',
            description: 'Store data in AgentDB',
            inputSchema: {
              type: 'object',
              properties: {
                namespace: {
                  type: 'string',
                  description: 'Memory namespace',
                },
                key: {
                  type: 'string',
                  description: 'Memory key',
                },
                value: {
                  type: 'object',
                  description: 'Data to store',
                },
              },
              required: ['namespace', 'key', 'value'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'agentic_flow_spawn_agent': {
          const agentId = `agent-${Date.now()}`;
          await redis.setex(
            `agent:${agentId}`,
            3600,
            JSON.stringify({
              id: agentId,
              type: args.type,
              config: args.config || {},
              status: 'running',
              createdAt: new Date().toISOString(),
            })
          );
          return {
            content: [
              {
                type: 'text',
                text: `Agent spawned: ${agentId}`,
              },
            ],
          };
        }

        case 'agentic_flow_search_memory': {
          if (!agentdb) {
            throw new Error('AgentDB not available');
          }
          const embedding = new Array(1536).fill(0); // TODO: Generate real embedding
          const results = await agentdb.search(embedding, args.k || 10);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(results, null, 2),
              },
            ],
          };
        }

        case 'agentic_flow_store_memory': {
          const key = `memory:${args.namespace}:${args.key}`;
          await redis.setex(key, 3600, JSON.stringify(args.value));
          return {
            content: [
              {
                type: 'text',
                text: `Memory stored: ${args.namespace}:${args.key}`,
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });

    // Start server
    const transport = new StdioServerTransport();
    await server.connect(transport);

    logger.info('Agentic-Flow MCP Server running');

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down MCP server...');
      await Promise.all([
        redis?.quit(),
        postgres?.end(),
      ]);
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error({ error }, 'Failed to start MCP server');
    process.exit(1);
  }
}

main();
