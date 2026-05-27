# Project Nyra API Examples

This directory contains working examples for using the Project Nyra API.

## Setup

Install dependencies:

```bash
npm install
```

Set your API token:

```bash
export NYRA_API_TOKEN="your-jwt-token-here"
```

For local development:

```bash
export NYRA_API_URL="http://localhost:3000"
export NYRA_WS_URL="ws://localhost:3001"
```

## REST API Examples

### Chat Completion

```bash
npm run rest:chat
```

Or directly:

```bash
bash rest-api/chat-completion.sh
```

This example demonstrates:

- Simple chat completions
- System prompts
- Multi-turn conversations
- Temperature and token control

## WebSocket Examples

### Real-time Event Client

```bash
npm run websocket
```

Or directly:

```bash
node websocket/client.js
```

This example demonstrates:

- WebSocket connection with authentication
- Subscribing to event channels
- Handling different event types
- Automatic reconnection
- Heartbeat/ping-pong

Subscribed channels:

- `mcp:status` - MCP server status updates
- `gpu:metrics` - GPU worker metrics
- `agent:coordination` - Agent lifecycle events
- `swarm:update` - Swarm activity updates

## MCP API Examples

### Tool Discovery and Execution

```bash
npm run mcp:discovery
```

Or directly:

```bash
node mcp/tool-discovery.js
```

This example demonstrates:

- Listing MCP servers
- Discovering available tools
- Fuzzy tool search
- Tool execution
- Complete swarm workflow
- Metrics collection

## Individual Examples

### REST API

#### List Available Models

```bash
curl https://api.project-nyra.io/v1/models \
  -H "Authorization: Bearer $NYRA_API_TOKEN"
```

#### Create Chat Completion

```bash
curl -X POST https://api.project-nyra.io/v1/chat/completions \
  -H "Authorization: Bearer $NYRA_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4",
    "messages": [
      {"role": "user", "content": "What is a mortgage?"}
    ]
  }'
```

### WebSocket API

#### Browser Example

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Project Nyra WebSocket Example</title>
  </head>
  <body>
    <h1>Project Nyra WebSocket</h1>
    <div id="status">Connecting...</div>
    <div id="events"></div>

    <script>
      const token = "YOUR_TOKEN";
      const ws = new WebSocket(`wss://api.project-nyra.io/ws?token=${token}`);

      ws.onopen = () => {
        document.getElementById("status").textContent = "Connected";

        // Subscribe to MCP status
        ws.send(
          JSON.stringify({
            type: "subscribe",
            payload: { channel: "mcp:status" },
          })
        );
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const eventsDiv = document.getElementById("events");
        eventsDiv.innerHTML += `<pre>${JSON.stringify(message, null, 2)}</pre>`;
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        document.getElementById("status").textContent = "Error";
      };
    </script>
  </body>
</html>
```

### MCP API

#### Search for Tools

```bash
curl "https://api.project-nyra.io/mcp/tools/search?q=swarm" \
  -H "Authorization: Bearer $NYRA_API_TOKEN"
```

#### Call a Tool

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

## Error Handling

All examples include proper error handling:

```javascript
try {
  const response = await api.post("/endpoint", data);
  console.log("Success:", response.data);
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error("Error:", error.response.data);
    console.error("Status:", error.response.status);
  } else if (error.request) {
    // No response received
    console.error("No response from server");
  } else {
    // Other error
    console.error("Error:", error.message);
  }
}
```

## Best Practices

### Authentication

Always store tokens securely:

```javascript
// ✅ Good: Use environment variables
const token = process.env.NYRA_API_TOKEN;

// ❌ Bad: Hardcode tokens
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

### Rate Limiting

Implement exponential backoff:

```javascript
async function callWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.response?.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

### WebSocket Reconnection

Always implement reconnection logic:

```javascript
let reconnectAttempts = 0;
const maxAttempts = 5;

function connect() {
  const ws = new WebSocket(url);

  ws.onclose = () => {
    if (reconnectAttempts < maxAttempts) {
      reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
      setTimeout(connect, delay);
    }
  };
}
```

## Troubleshooting

### Authentication Errors

```
Error: NYRA_API_TOKEN environment variable is not set
```

**Solution:** Set your token:

```bash
export NYRA_API_TOKEN="your-token"
```

### Connection Refused

```
Error: connect ECONNREFUSED 127.0.0.1:3000
```

**Solution:** Check that services are running:

```bash
# Check REST API
curl http://localhost:3000/health

# Check WebSocket
curl http://localhost:3001/health
```

### Rate Limit Exceeded

```
Error: 429 Too Many Requests
```

**Solution:** Implement rate limiting in your client or wait before retrying.

## Additional Resources

- [REST API Documentation](../REST-API.md)
- [WebSocket API Documentation](../WEBSOCKET-API.md)
- [MCP API Documentation](../MCP-API.md)
- [Interactive API Docs](../swagger-ui.html)

## Support

For issues or questions:

- **Email:** support@project-nyra.io
- **Documentation:** https://docs.project-nyra.io
- **GitHub:** https://github.com/project-nyra

## License

MIT
