#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { SequentialThinkingServer, ThoughtData } from './lib.js';

/**
 * Sequential Thinking MCP Server
 * Provides structured step-by-step reasoning capabilities
 */

// Parse command line arguments
const argv = await yargs(hideBin(process.argv))
  .option('name', {
    alias: 'n',
    type: 'string',
    description: 'Server name',
    default: 'sequential-thinking'
  })
  .option('version', {
    alias: 'v',
    type: 'string',
    description: 'Server version',
    default: '1.0.0'
  })
  .help()
  .argv;

// Initialize the sequential thinking server
const thinkingServer = new SequentialThinkingServer();

// Create MCP server instance
const server = new Server(
  {
    name: argv.name,
    version: argv.version,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Tool: sequential_thinking
 * Enables step-by-step reasoning with support for:
 * - Linear thought progression
 * - Thought revisions
 * - Alternative path branching
 * - Dynamic thought count adjustment
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'sequential_thinking',
      description: `
A tool for structured, step-by-step reasoning and problem-solving.
Break down complex tasks into sequential thoughts with the ability to revise,
branch into alternative approaches, and dynamically adjust the reasoning scope.

Key Features:
- **Sequential Reasoning**: Numbered progression from start to conclusion
- **Thought Revisions**: Reconsider and refine previous reasoning steps
- **Branch Exploration**: Explore multiple solution paths from divergence points
- **Dynamic Adjustment**: Expand or contract thought scope as needed
- **Context Preservation**: Maintain reasoning chain for full problem context

Use Cases:
- Breaking down complex problems into manageable steps
- Planning multi-stage implementations
- Systematic debugging and root cause analysis
- Exploring alternative solution approaches
- Architectural decision-making with multiple considerations
      `.trim(),
      inputSchema: {
        type: 'object',
        properties: {
          thought: {
            type: 'string',
            description: 'The current reasoning step or thought content',
          },
          nextThoughtNeeded: {
            type: 'boolean',
            description: 'Whether another thought step is required to complete reasoning',
          },
          thoughtNumber: {
            type: 'integer',
            description: 'The current step position in the reasoning chain (1-indexed)',
            minimum: 1,
          },
          totalThoughts: {
            type: 'integer',
            description: 'Estimated total number of thoughts needed (can be adjusted)',
            minimum: 1,
          },
          isRevision: {
            type: 'boolean',
            description: 'Indicates this thought revises previous reasoning (optional)',
          },
          revisesThought: {
            type: 'integer',
            description: 'Which thought number is being revised (required if isRevision=true)',
            minimum: 1,
          },
          branchFromThought: {
            type: 'integer',
            description: 'Thought number where this alternative path diverges (optional)',
            minimum: 1,
          },
          branchId: {
            type: 'string',
            description: 'Identifier for this alternative reasoning branch (optional)',
          },
          needsMoreThoughts: {
            type: 'boolean',
            description: 'Request to increase total thought count due to complexity (optional)',
          },
        },
        required: ['thought', 'nextThoughtNeeded', 'thoughtNumber', 'totalThoughts'],
      },
    },
  ],
}));

/**
 * Handle tool execution requests
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== 'sequential_thinking') {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  try {
    // Extract and validate thought data
    const thoughtData = request.params.arguments as ThoughtData;

    // Process the thought through the thinking server
    const result = await thinkingServer.processThought(thoughtData);

    // Return structured result
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    // Handle errors gracefully
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: errorMessage,
            thought: request.params.arguments?.thought,
            thoughtNumber: request.params.arguments?.thoughtNumber,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start the MCP server with stdio transport
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log startup (to stderr so it doesn't interfere with stdio protocol)
  console.error(`Sequential Thinking MCP Server started`);
  console.error(`Name: ${argv.name}`);
  console.error(`Version: ${argv.version}`);
  console.error(`Transport: stdio`);
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
