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
