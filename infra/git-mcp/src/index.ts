#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import simpleGit, { SimpleGit, LogResult, StatusResult, DiffResult } from 'simple-git';
import { z } from 'zod';

// Environment configuration
const WORKSPACE_PATH = process.env.GIT_WORKSPACE || '/workspace';

// Initialize git instance
let git: SimpleGit;

try {
  git = simpleGit(WORKSPACE_PATH);
} catch (error) {
  console.error('Failed to initialize git:', error);
  process.exit(1);
}

// Validation schemas
const StatusSchema = z.object({
  path: z.string().optional(),
});

const LogSchema = z.object({
  maxCount: z.number().optional().default(10),
  file: z.string().optional(),
});

const DiffSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  file: z.string().optional(),
  cached: z.boolean().optional().default(false),
});

const AddSchema = z.object({
  files: z.array(z.string()),
});

const CommitSchema = z.object({
  message: z.string(),
  files: z.array(z.string()).optional(),
});

const BranchSchema = z.object({
  name: z.string().optional(),
  delete: z.boolean().optional().default(false),
  create: z.boolean().optional().default(false),
});

const CheckoutSchema = z.object({
  branch: z.string(),
  create: z.boolean().optional().default(false),
});

const PushSchema = z.object({
  remote: z.string().optional().default('origin'),
  branch: z.string().optional(),
  force: z.boolean().optional().default(false),
});

const PullSchema = z.object({
  remote: z.string().optional().default('origin'),
  branch: z.string().optional(),
});

const ResetSchema = z.object({
  mode: z.enum(['soft', 'mixed', 'hard']).optional().default('mixed'),
  commit: z.string().optional().default('HEAD'),
});

const StashSchema = z.object({
  action: z.enum(['save', 'pop', 'list', 'apply', 'drop']),
  message: z.string().optional(),
  index: z.number().optional(),
});

// Tool definitions
const tools: Tool[] = [
  {
    name: 'git_status',
    description: 'Get the working tree status',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Optional path to check status for',
        },
      },
    },
  },
  {
    name: 'git_log',
    description: 'Show commit logs',
    inputSchema: {
      type: 'object',
      properties: {
        maxCount: {
          type: 'number',
          description: 'Maximum number of commits to show',
          default: 10,
        },
        file: {
          type: 'string',
          description: 'Show log for specific file',
        },
      },
    },
  },
  {
    name: 'git_diff',
    description: 'Show changes between commits, commit and working tree, etc',
    inputSchema: {
      type: 'object',
      properties: {
        from: {
          type: 'string',
          description: 'Starting commit/branch (default: HEAD)',
        },
        to: {
          type: 'string',
          description: 'Ending commit/branch (default: working tree)',
        },
        file: {
          type: 'string',
          description: 'Show diff for specific file',
        },
        cached: {
          type: 'boolean',
          description: 'Show staged changes',
          default: false,
        },
      },
    },
  },
  {
    name: 'git_add',
    description: 'Add file contents to the staging area',
    inputSchema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string' },
          description: 'Files to add (use ["."] for all files)',
        },
      },
      required: ['files'],
    },
  },
  {
    name: 'git_commit',
    description: 'Record changes to the repository',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Commit message',
        },
        files: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific files to commit (optional)',
        },
      },
      required: ['message'],
    },
  },
  {
    name: 'git_push',
    description: 'Update remote refs along with associated objects',
    inputSchema: {
      type: 'object',
      properties: {
        remote: {
          type: 'string',
          description: 'Remote name',
          default: 'origin',
        },
        branch: {
          type: 'string',
          description: 'Branch name (default: current branch)',
        },
        force: {
          type: 'boolean',
          description: 'Force push',
          default: false,
        },
      },
    },
  },
  {
    name: 'git_pull',
    description: 'Fetch from and integrate with another repository or local branch',
    inputSchema: {
      type: 'object',
      properties: {
        remote: {
          type: 'string',
          description: 'Remote name',
          default: 'origin',
        },
        branch: {
          type: 'string',
          description: 'Branch name (default: current branch)',
        },
      },
    },
  },
  {
    name: 'git_branch',
    description: 'List, create, or delete branches',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Branch name (for create/delete operations)',
        },
        delete: {
          type: 'boolean',
          description: 'Delete the branch',
          default: false,
        },
        create: {
          type: 'boolean',
          description: 'Create a new branch',
          default: false,
        },
      },
    },
  },
  {
    name: 'git_checkout',
    description: 'Switch branches or restore working tree files',
    inputSchema: {
      type: 'object',
      properties: {
        branch: {
          type: 'string',
          description: 'Branch name to checkout',
        },
        create: {
          type: 'boolean',
          description: 'Create and checkout new branch',
          default: false,
        },
      },
      required: ['branch'],
    },
  },
  {
    name: 'git_reset',
    description: 'Reset current HEAD to the specified state',
    inputSchema: {
      type: 'object',
      properties: {
        mode: {
          type: 'string',
          enum: ['soft', 'mixed', 'hard'],
          description: 'Reset mode',
          default: 'mixed',
        },
        commit: {
          type: 'string',
          description: 'Commit to reset to',
          default: 'HEAD',
        },
      },
    },
  },
  {
    name: 'git_stash',
    description: 'Stash the changes in a dirty working directory',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['save', 'pop', 'list', 'apply', 'drop'],
          description: 'Stash action',
        },
        message: {
          type: 'string',
          description: 'Stash message (for save action)',
        },
        index: {
          type: 'number',
          description: 'Stash index (for pop/apply/drop actions)',
        },
      },
      required: ['action'],
    },
  },
];

// Create MCP server
const server = new Server(
  {
    name: 'git-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'git_status': {
        const { path } = StatusSchema.parse(args);
        const status: StatusResult = await git.status(path ? [path] : []);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(status, null, 2),
            },
          ],
        };
      }

      case 'git_log': {
        const { maxCount, file } = LogSchema.parse(args);
        const options: any = { maxCount };
        if (file) options.file = file;
        const log: LogResult = await git.log(options);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(log, null, 2),
            },
          ],
        };
      }

      case 'git_diff': {
        const { from, to, file, cached } = DiffSchema.parse(args);
        const options: string[] = [];
        if (cached) options.push('--cached');
        if (from) options.push(from);
        if (to) options.push(to);
        if (file) options.push('--', file);

        const diff = await git.diff(options);
        return {
          content: [
            {
              type: 'text',
              text: diff || 'No differences found',
            },
          ],
        };
      }

      case 'git_add': {
        const { files } = AddSchema.parse(args);
        await git.add(files);
        return {
          content: [
            {
              type: 'text',
              text: `Added files: ${files.join(', ')}`,
            },
          ],
        };
      }

      case 'git_commit': {
        const { message, files } = CommitSchema.parse(args);
        const result = files
          ? await git.commit(message, files)
          : await git.commit(message);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'git_push': {
        const { remote, branch, force } = PushSchema.parse(args);
        const options: string[] = [remote];
        if (branch) options.push(branch);
        if (force) options.push('--force');

        await git.push(options);
        return {
          content: [
            {
              type: 'text',
              text: `Pushed to ${remote}${branch ? `/${branch}` : ''}`,
            },
          ],
        };
      }

      case 'git_pull': {
        const { remote, branch } = PullSchema.parse(args);
        const result = await git.pull(remote, branch);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'git_branch': {
        const { name: branchName, delete: del, create } = BranchSchema.parse(args);

        if (!branchName) {
          const branches = await git.branch();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(branches, null, 2),
              },
            ],
          };
        }

        if (del) {
          await git.deleteLocalBranch(branchName);
          return {
            content: [
              {
                type: 'text',
                text: `Deleted branch: ${branchName}`,
              },
            ],
          };
        }

        if (create) {
          await git.checkoutLocalBranch(branchName);
          return {
            content: [
              {
                type: 'text',
                text: `Created and checked out branch: ${branchName}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: 'Please specify create or delete action',
            },
          ],
        };
      }

      case 'git_checkout': {
        const { branch, create } = CheckoutSchema.parse(args);

        if (create) {
          await git.checkoutLocalBranch(branch);
        } else {
          await git.checkout(branch);
        }

        return {
          content: [
            {
              type: 'text',
              text: `Checked out branch: ${branch}`,
            },
          ],
        };
      }

      case 'git_reset': {
        const { mode, commit } = ResetSchema.parse(args);
        await git.reset([`--${mode}`, commit]);
        return {
          content: [
            {
              type: 'text',
              text: `Reset to ${commit} with ${mode} mode`,
            },
          ],
        };
      }

      case 'git_stash': {
        const { action, message, index } = StashSchema.parse(args);

        let result: any;
        switch (action) {
          case 'save':
            result = await git.stash(['save', message || 'WIP']);
            break;
          case 'pop':
            result = await git.stash(['pop', index !== undefined ? `stash@{${index}}` : '']);
            break;
          case 'list':
            result = await git.stash(['list']);
            break;
          case 'apply':
            result = await git.stash(['apply', index !== undefined ? `stash@{${index}}` : '']);
            break;
          case 'drop':
            result = await git.stash(['drop', index !== undefined ? `stash@{${index}}` : '']);
            break;
        }

        return {
          content: [
            {
              type: 'text',
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  console.error('Starting Git MCP Server...');
  console.error(`Workspace: ${WORKSPACE_PATH}`);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Git MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
