const express = require('express');
const { SSEServerTransport } = require('@modelcontextprotocol/sdk/server/sse.js');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3100;
const transports = new Map();

const GITEA_URL = process.env.GITEA_URL || 'http://gitea:3000';
const GITEA_TOKEN = process.env.GITEA_TOKEN;
const GITEA_OWNER = process.env.GITEA_OWNER;
const GITEA_REPO = process.env.GITEA_REPO || 'Project-Nyra';

// Initialise the MCP server
const server = new Server({
  name: 'gitea-mcp-server',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

// Define supported tools
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'gitea_list_files',
      description: 'List files in Gitea repository',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Path in repository (default: root)' },
          ref: { type: 'string', description: 'Branch/tag/commit (default: main)' },
        },
      },
    },
    {
      name: 'gitea_read_file',
      description: 'Read a file from Gitea repository',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path' },
          ref: { type: 'string', description: 'Branch/tag/commit (default: main)' },
        },
        required: ['path'],
      },
    },
    {
      name: 'gitea_create_file',
      description: 'Create or update a file in Gitea repository',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path' },
          content: { type: 'string', description: 'File content' },
          message: { type: 'string', description: 'Commit message' },
          branch: { type: 'string', description: 'Branch (default: main)' },
        },
        required: ['path', 'content', 'message'],
      },
    },
    {
      name: 'gitea_delete_file',
      description: 'Delete a file from Gitea repository',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path to delete' },
          message: { type: 'string', description: 'Commit message' },
          branch: { type: 'string', description: 'Branch (default: main)' },
        },
        required: ['path', 'message'],
      },
    },
    {
      name: 'gitea_list_branches',
      description: 'List all branches in the repository',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'gitea_create_branch',
      description: 'Create a new branch from an existing branch',
      inputSchema: {
        type: 'object',
        properties: {
          branch_name: { type: 'string', description: 'Name of the new branch' },
          from_branch: { type: 'string', description: 'Source branch (default: main)' },
        },
        required: ['branch_name'],
      },
    },
    {
      name: 'gitea_list_commits',
      description: 'List recent commits on a branch',
      inputSchema: {
        type: 'object',
        properties: {
          branch: { type: 'string', description: 'Branch name (default: main)' },
          limit: { type: 'number', description: 'Number of commits to return (default: 10)' },
        },
      },
    },
    {
      name: 'gitea_create_pull_request',
      description: 'Create a pull request between branches',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'PR title' },
          body: { type: 'string', description: 'PR description' },
          head: { type: 'string', description: 'Head branch (source)' },
          base: { type: 'string', description: 'Base branch (target, default: main)' },
        },
        required: ['title', 'head'],
      },
    },
    {
      name: 'gitea_list_pull_requests',
      description: 'List pull requests in the repository',
      inputSchema: {
        type: 'object',
        properties: {
          state: { type: 'string', enum: ['open', 'closed', 'all'], description: 'PR state filter (default: open)' },
          limit: { type: 'number', description: 'Number of PRs to return (default: 10)' },
        },
      },
    },
    {
      name: 'gitea_get_repository_info',
      description: 'Get repository information and statistics',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ],
}));

// Handler for tool calls
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  try {
    switch (name) {
      case 'gitea_list_files': {
        const { path = '', ref = 'main' } = args;
        const url = `${GITEA_URL}/api/v1/repos/${GITEA_OWNER}/${GITEA_REPO}/contents/${path}?ref=${ref}`;
        const response = await fetch(url, {
          headers: { Authorization: `token ${GITEA_TOKEN}` },
        });
        const files = await response.json();
        return {
          content: [{ type: 'text', text: JSON.stringify(files, null, 2) }],
        };
      }
      case 'gitea_read_file': {
        const { path, ref = 'main' } = args;
        const url = `${GITEA_URL}/api/v1/repos/${GITEA_OWNER}/${GITEA_REPO}/contents/${path}?ref=${ref}`;
        const response = await fetch(url, {
          headers: { Authorization: `token ${GITEA_TOKEN}` },
        });
        const data = await response.json();
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return {
          content: [{ type: 'text', text: content }],
        };
      }
      case 'gitea_create_file': {
        const { path, content, message, branch = 'main' } = args;
        const url = `${GITEA_URL}/api/v1/repos/${GITEA_OWNER}/${GITEA_REPO}/contents/${path}`;
        // Check if the file exists to determine update vs create
        let sha = null;
        try {
          const check = await fetch(`${url}?ref=${branch}`, {
            headers: { Authorization: `token ${GITEA_TOKEN}` },
          });
          if (check.ok) {
            const existing = await check.json();
            sha = existing.sha;
          }
        } catch (e) {
          // Ignore errors when checking existence
        }
        const body = {
          message,
          content: Buffer.from(content).toString('base64'),
          branch,
        };
        if (sha) body.sha = sha;
        const method = sha ? 'PUT' : 'POST';
        const response = await fetch(url, {
          method,
          headers: {
            Authorization: `token ${GITEA_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        const result = await response.json();
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'gitea_delete_file': {
        const { path, message, branch = 'main' } = args;
        const url = `${GITEA_URL}/api/v1/repos/${GITEA_OWNER}/${GITEA_REPO}/contents/${path}`;
        // Get file SHA (required for deletion)
        const fileInfo = await fetch(`${url}?ref=${branch}`, {
          headers: { Authorization: `token ${GITEA_TOKEN}` },
        });
        if (!fileInfo.ok) {
          throw new Error(`File not found: ${path}`);
        }
        const fileData = await fileInfo.json();
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            Authorization: `token ${GITEA_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            sha: fileData.sha,
            branch,
          }),
        });
        const result = await response.json();
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'gitea_list_branches': {
        const url = `${GITEA_URL}/api/v1/repos/${GITEA_OWNER}/${GITEA_REPO}/branches`;
        const response = await fetch(url, {
          headers: { Authorization: `token ${GITEA_TOKEN}` },
        });
        const branches = await response.json();
        return {
          content: [{ type: 'text', text: JSON.stringify(branches, null, 2) }],
        };
      }
      case 'gitea_create_branch': {
        const { branch_name, from_branch = 'main' } = args;
        const url = `${GITEA_URL}/api/v1/repos/${GITEA_OWNER}/${GITEA_REPO}/branches`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `token ${GITEA_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            new_branch_name: branch_name,
            old_branch_name: from_branch,
          }),
        });
        const result = await response.json();
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'gitea_list_commits': {
        const { branch = 'main', limit = 10 } = args;
        const url = `${GITEA_URL}/api/v1/repos/${GITEA_OWNER}/${GITEA_REPO}/commits?sha=${branch}&limit=${limit}`;
        const response = await fetch(url, {
          headers: { Authorization: `token ${GITEA_TOKEN}` },
        });
        const commits = await response.json();
        return {
          content: [{ type: 'text', text: JSON.stringify(commits, null, 2) }],
        };
      }
      case 'gitea_create_pull_request': {
        const { title, body = '', head, base = 'main' } = args;
        const url = `${GITEA_URL}/api/v1/repos/${GITEA_OWNER}/${GITEA_REPO}/pulls`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `token ${GITEA_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            body,
            head,
            base,
          }),
        });
        const result = await response.json();
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'gitea_list_pull_requests': {
        const { state = 'open', limit = 10 } = args;
        const url = `${GITEA_URL}/api/v1/repos/${GITEA_OWNER}/${GITEA_REPO}/pulls?state=${state}&limit=${limit}`;
        const response = await fetch(url, {
          headers: { Authorization: `token ${GITEA_TOKEN}` },
        });
        const prs = await response.json();
        return {
          content: [{ type: 'text', text: JSON.stringify(prs, null, 2) }],
        };
      }
      case 'gitea_get_repository_info': {
        const url = `${GITEA_URL}/api/v1/repos/${GITEA_OWNER}/${GITEA_REPO}`;
        const response = await fetch(url, {
          headers: { Authorization: `token ${GITEA_TOKEN}` },
        });
        const repoInfo = await response.json();
        return {
          content: [{ type: 'text', text: JSON.stringify(repoInfo, null, 2) }],
        };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

function createTransport(messagePath, res) {
  const transport = new SSEServerTransport(messagePath, res);
  transports.set(transport.sessionId, transport);
  transport.onclose = () => {
    transports.delete(transport.sessionId);
  };
  return transport;
}

async function connectTransport(messagePath, res) {
  const transport = createTransport(messagePath, res);
  try {
    await server.connect(transport);
  } catch (error) {
    transports.delete(transport.sessionId);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
}

async function forwardTransportMessage(req, res) {
  const { sessionId } = req.query;
  if (typeof sessionId !== 'string' || sessionId.length === 0) {
    res.status(400).json({ error: 'Missing sessionId query parameter' });
    return;
  }

  const transport = transports.get(sessionId);
  if (!transport) {
    res.status(404).json({ error: `No active SSE transport for session ${sessionId}` });
    return;
  }

  try {
    await transport.handlePostMessage(req, res, req.body);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
}

// SSE endpoints for legacy and MCP-prefixed clients.
app.get('/sse', async (req, res) => {
  await connectTransport('/message', res);
});

app.get('/mcp/sse', async (req, res) => {
  await connectTransport('/mcp/message', res);
});

app.post('/message', express.json(), async (req, res) => {
  await forwardTransportMessage(req, res);
});

app.post('/mcp/message', express.json(), async (req, res) => {
  await forwardTransportMessage(req, res);
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'gitea-mcp' });
});

app.listen(PORT, () => {
  console.log(`Gitea MCP server listening on port ${PORT}`);
});
