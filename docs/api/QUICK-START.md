# Project Nyra API - Quick Start Guide

Get up and running with the Project Nyra API in 5 minutes.

## Prerequisites

- Node.js 18+ or Python 3.8+
- cURL (for command-line testing)
- API credentials (contact support@project-nyra.io)

## Step 1: Get Your API Token

### Option A: Using cURL

```bash
curl -X POST https://api.project-nyra.io/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

### Option B: Using JavaScript

```javascript
const axios = require('axios');

const response = await axios.post('https://api.project-nyra.io/auth/login', {
  email: 'your-email@example.com',
  password: 'your-password'
});

const token = response.data.access_token;
console.log('Token:', token);
```

### Save Your Token

```bash
export NYRA_API_TOKEN="your-token-here"
```

## Step 2: Test Your Connection

```bash
# Check API health
curl https://api.project-nyra.io/health

# Test authentication
curl https://api.project-nyra.io/v1/models \
  -H "Authorization: Bearer $NYRA_API_TOKEN"
```

Expected response:
```json
{
  "object": "list",
  "data": [
    {
      "id": "claude-sonnet-4",
      "object": "model",
      "available": true,
      "provider": "cloud"
    }
  ]
}
```

## Step 3: Make Your First API Call

### Chat Completion

```bash
curl -X POST https://api.project-nyra.io/v1/chat/completions \
  -H "Authorization: Bearer $NYRA_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4",
    "messages": [
      {
        "role": "user",
        "content": "Explain mortgage rates in simple terms"
      }
    ]
  }'
```

### In JavaScript

```javascript
const axios = require('axios');

const response = await axios.post(
  'https://api.project-nyra.io/v1/chat/completions',
  {
    model: 'claude-sonnet-4',
    messages: [
      { role: 'user', content: 'Explain mortgage rates in simple terms' }
    ]
  },
  {
    headers: {
      'Authorization': `Bearer ${process.env.NYRA_API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  }
);

console.log(response.data.choices[0].message.content);
```

### In Python

```python
import requests
import os

response = requests.post(
    'https://api.project-nyra.io/v1/chat/completions',
    headers={
        'Authorization': f'Bearer {os.environ["NYRA_API_TOKEN"]}',
        'Content-Type': 'application/json'
    },
    json={
        'model': 'claude-sonnet-4',
        'messages': [
            {'role': 'user', 'content': 'Explain mortgage rates in simple terms'}
        ]
    }
)

print(response.json()['choices'][0]['message']['content'])
```

## Step 4: Explore MCP Tools

### Discover Available Tools

```bash
curl https://api.project-nyra.io/mcp/tools \
  -H "Authorization: Bearer $NYRA_API_TOKEN"
```

### Search for Tools

```bash
curl "https://api.project-nyra.io/mcp/tools/search?q=swarm" \
  -H "Authorization: Bearer $NYRA_API_TOKEN"
```

### Execute a Tool

```bash
curl -X POST https://api.project-nyra.io/mcp/tools/call \
  -H "Authorization: Bearer $NYRA_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "swarm_init",
    "params": {
      "topology": "mesh",
      "maxAgents": 5
    }
  }'
```

## Step 5: Connect to WebSocket (Optional)

### JavaScript

```javascript
const WebSocket = require('ws');

const ws = new WebSocket(
  `wss://api.project-nyra.io/ws?token=${process.env.NYRA_API_TOKEN}`
);

ws.on('open', () => {
  console.log('Connected');

  // Subscribe to events
  ws.send(JSON.stringify({
    type: 'subscribe',
    payload: { channel: 'mcp:status' }
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('Event:', message);
});
```

### Browser

```html
<script>
  const token = 'your-token';
  const ws = new WebSocket(`wss://api.project-nyra.io/ws?token=${token}`);

  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: 'subscribe',
      payload: { channel: 'gpu:metrics' }
    }));
  };

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log('Event:', message);
  };
</script>
```

## Next Steps

### Explore Interactive Docs

1. Clone the repository or download the docs
2. Start the documentation server:
   ```bash
   cd docs/api
   node serve-docs.js
   ```
3. Open http://localhost:3500 in your browser
4. Try out API endpoints directly in Swagger UI

### Run Example Code

```bash
cd docs/api/examples
npm install

# Set your token
export NYRA_API_TOKEN="your-token"

# Run examples
npm run rest:chat      # REST API examples
npm run websocket      # WebSocket client
npm run mcp:discovery  # MCP tool discovery
```

### Read Full Documentation

- [REST API Reference](./REST-API.md) - Complete REST API docs
- [WebSocket API Reference](./WEBSOCKET-API.md) - Real-time events
- [MCP API Reference](./MCP-API.md) - Tool discovery and execution
- [OpenAPI Spec](./openapi.yaml) - Machine-readable API spec

## Common Issues

### 401 Unauthorized

**Problem:** Invalid or expired token

**Solution:**
```bash
# Get a new token
curl -X POST https://api.project-nyra.io/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email","password":"your-password"}'
```

### 429 Rate Limit Exceeded

**Problem:** Too many requests

**Solution:** Wait 60 seconds or implement exponential backoff

### Connection Timeout

**Problem:** Network or service issue

**Solution:**
1. Check service status: https://status.project-nyra.io
2. Verify your network connection
3. Try again with a longer timeout

## Rate Limits

| User Type | Requests/Hour |
|-----------|---------------|
| Free Tier | 100 |
| Authenticated | 1,000 |
| Premium | 10,000 |

## API Endpoints Summary

### REST API
- **Base URL:** `https://api.project-nyra.io/v1`
- **Health:** `GET /health`
- **Models:** `GET /v1/models`
- **Chat:** `POST /v1/chat/completions`
- **MCP Servers:** `GET /mcp/servers`
- **MCP Tools:** `GET /mcp/tools`
- **Tool Search:** `GET /mcp/tools/search`
- **Call Tool:** `POST /mcp/tools/call`

### WebSocket API
- **URL:** `wss://api.project-nyra.io/ws`
- **Auth:** Query parameter `?token=YOUR_TOKEN`
- **Channels:**
  - `mcp:status` - MCP server updates
  - `gpu:metrics` - GPU metrics
  - `tools:discovery` - Tool discovery
  - `agent:coordination` - Agent events
  - `swarm:update` - Swarm updates

## Code Templates

### REST API Client Class

```javascript
class NyraAPIClient {
  constructor(apiUrl, token) {
    this.apiUrl = apiUrl;
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async chatCompletion(messages, model = 'claude-sonnet-4') {
    return this.request('/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({ model, messages })
    });
  }

  async listTools() {
    return this.request('/mcp/tools');
  }

  async callTool(tool, params) {
    return this.request('/mcp/tools/call', {
      method: 'POST',
      body: JSON.stringify({ tool, params })
    });
  }
}

// Usage
const client = new NyraAPIClient(
  'https://api.project-nyra.io',
  process.env.NYRA_API_TOKEN
);

const response = await client.chatCompletion([
  { role: 'user', content: 'Hello!' }
]);
```

### WebSocket Client Class

```javascript
class NyraWebSocketClient {
  constructor(wsUrl, token) {
    this.wsUrl = wsUrl;
    this.token = token;
    this.handlers = new Map();
  }

  connect() {
    this.ws = new WebSocket(`${this.wsUrl}?token=${this.token}`);

    this.ws.onopen = () => {
      console.log('Connected');
      this.onConnect?.();
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const handler = this.handlers.get(message.type);
      if (handler) handler(message);
    };
  }

  subscribe(channel) {
    this.send({ type: 'subscribe', payload: { channel } });
  }

  on(messageType, handler) {
    this.handlers.set(messageType, handler);
  }

  send(message) {
    this.ws.send(JSON.stringify(message));
  }
}

// Usage
const ws = new NyraWebSocketClient(
  'wss://api.project-nyra.io/ws',
  process.env.NYRA_API_TOKEN
);

ws.on('event', (message) => {
  console.log('Event:', message.payload);
});

ws.connect();
ws.subscribe('mcp:status');
```

## Support

- **Email:** support@project-nyra.io
- **Documentation:** https://docs.project-nyra.io
- **Status:** https://status.project-nyra.io
- **GitHub:** https://github.com/project-nyra

## License

MIT License - See [LICENSE](../../LICENSE) for details.

---

**Happy Coding! 🚀**
