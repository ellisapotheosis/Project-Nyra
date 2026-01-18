#!/usr/bin/env node

/**
 * Bitwarden Secrets Manager MCP Server
 *
 * Provides secure access to Bitwarden secrets via Model Context Protocol
 * Reference: https://github.com/modelcontextprotocol/servers/tree/main/src/bws
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import { spawn } from 'child_process';
import { z } from 'zod';

// Validation schemas
const GetSecretSchema = z.object({
  secretId: z.string().uuid('Invalid secret UUID'),
});

const ListSecretsSchema = z.object({
  projectId: z.string().uuid('Invalid project UUID').optional(),
});

const CreateSecretSchema = z.object({
  key: z.string().min(1, 'Secret key is required'),
  value: z.string().min(1, 'Secret value is required'),
  projectId: z.string().uuid('Invalid project UUID'),
  note: z.string().optional(),
});

const UpdateSecretSchema = z.object({
  secretId: z.string().uuid('Invalid secret UUID'),
  key: z.string().min(1).optional(),
  value: z.string().min(1).optional(),
  note: z.string().optional(),
});

const DeleteSecretSchema = z.object({
  secretIds: z.array(z.string().uuid('Invalid secret UUID')),
});

// Environment configuration
const BWS_ACCESS_TOKEN = process.env.BWS_ACCESS_TOKEN;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

if (!BWS_ACCESS_TOKEN) {
  console.error('ERROR: BWS_ACCESS_TOKEN environment variable is required');
  process.exit(1);
}

/**
 * Execute BWS CLI command
 */
async function executeBwsCommand(args) {
  return new Promise((resolve, reject) => {
    const bws = spawn('bws', args, {
      env: {
        ...process.env,
        BWS_ACCESS_TOKEN,
      },
    });

    let stdout = '';
    let stderr = '';

    bws.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    bws.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    bws.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`BWS command failed: ${stderr}`));
      } else {
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (error) {
          resolve(stdout);
        }
      }
    });

    bws.on('error', (error) => {
      reject(new Error(`Failed to execute BWS: ${error.message}`));
    });
  });
}

/**
 * Initialize MCP Server
 */
const server = new Server(
  {
    name: 'bitwarden-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_secret',
      description: 'Retrieve a secret by ID from Bitwarden Secrets Manager',
      inputSchema: {
        type: 'object',
        properties: {
          secretId: {
            type: 'string',
            description: 'UUID of the secret to retrieve',
            pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
          },
        },
        required: ['secretId'],
      },
    },
    {
      name: 'list_secrets',
      description: 'List all secrets, optionally filtered by project',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: {
            type: 'string',
            description: 'Optional project UUID to filter secrets',
            pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
          },
        },
      },
    },
    {
      name: 'create_secret',
      description: 'Create a new secret in Bitwarden Secrets Manager',
      inputSchema: {
        type: 'object',
        properties: {
          key: {
            type: 'string',
            description: 'Secret key/name',
          },
          value: {
            type: 'string',
            description: 'Secret value',
          },
          projectId: {
            type: 'string',
            description: 'Project UUID to associate the secret with',
            pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
          },
          note: {
            type: 'string',
            description: 'Optional note for the secret',
          },
        },
        required: ['key', 'value', 'projectId'],
      },
    },
    {
      name: 'update_secret',
      description: 'Update an existing secret',
      inputSchema: {
        type: 'object',
        properties: {
          secretId: {
            type: 'string',
            description: 'UUID of the secret to update',
            pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
          },
          key: {
            type: 'string',
            description: 'New secret key/name',
          },
          value: {
            type: 'string',
            description: 'New secret value',
          },
          note: {
            type: 'string',
            description: 'New note for the secret',
          },
        },
        required: ['secretId'],
      },
    },
    {
      name: 'delete_secrets',
      description: 'Delete one or more secrets',
      inputSchema: {
        type: 'object',
        properties: {
          secretIds: {
            type: 'array',
            items: {
              type: 'string',
              pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
            },
            description: 'Array of secret UUIDs to delete',
            minItems: 1,
          },
        },
        required: ['secretIds'],
      },
    },
    {
      name: 'list_projects',
      description: 'List all projects in the organization',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ],
}));

/**
 * Handle tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'get_secret': {
        const { secretId } = GetSecretSchema.parse(args);
        const result = await executeBwsCommand(['secret', 'get', secretId]);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'list_secrets': {
        const { projectId } = ListSecretsSchema.parse(args);
        const cmdArgs = ['secret', 'list'];
        if (projectId) {
          cmdArgs.push('--project-id', projectId);
        }
        const result = await executeBwsCommand(cmdArgs);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_secret': {
        const { key, value, projectId, note } = CreateSecretSchema.parse(args);
        const cmdArgs = ['secret', 'create', key, value, '--project-id', projectId];
        if (note) {
          cmdArgs.push('--note', note);
        }
        const result = await executeBwsCommand(cmdArgs);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'update_secret': {
        const { secretId, key, value, note } = UpdateSecretSchema.parse(args);
        const cmdArgs = ['secret', 'edit', secretId];
        if (key) cmdArgs.push('--key', key);
        if (value) cmdArgs.push('--value', value);
        if (note) cmdArgs.push('--note', note);
        const result = await executeBwsCommand(cmdArgs);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'delete_secrets': {
        const { secretIds } = DeleteSecretSchema.parse(args);
        const cmdArgs = ['secret', 'delete', ...secretIds];
        const result = await executeBwsCommand(cmdArgs);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, deleted: secretIds }, null, 2),
            },
          ],
        };
      }

      case 'list_projects': {
        const result = await executeBwsCommand(['project', 'list']);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Validation error: ${error.errors.map((e) => e.message).join(', ')}`
      );
    }
    throw new McpError(
      ErrorCode.InternalError,
      `Tool execution failed: ${error.message}`
    );
  }
});

/**
 * Start server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Bitwarden MCP Server running on stdio');
  console.error(`Log level: ${LOG_LEVEL}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
