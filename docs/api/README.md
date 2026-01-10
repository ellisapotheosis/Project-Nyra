# Project Nyra API Documentation

Welcome to the Project Nyra API documentation. This directory contains comprehensive API references for all available interfaces.

## 📚 Documentation Index

### [OpenAPI Specification](./openapi.yaml)
Complete OpenAPI 3.0 specification for the REST API. Can be imported into tools like Postman, Insomnia, or used with code generators.

### [Interactive API Docs](./swagger-ui.html)
Interactive Swagger UI for testing API endpoints directly in your browser. Features:
- Live API testing
- Authentication support
- Request/response examples
- Code generation in multiple languages

**To use:** Open `swagger-ui.html` in a browser or serve via HTTP server.

### [REST API Reference](./REST-API.md)
Detailed REST API documentation with:
- Complete endpoint reference
- Request/response schemas
- Code examples (cURL, JavaScript, Python)
- Authentication guide
- Error handling
- Rate limiting
- Pagination

### [WebSocket API Reference](./WEBSOCKET-API.md)
Real-time WebSocket API documentation covering:
- Connection setup
- Authentication
- Message formats
- Event channels (MCP status, GPU metrics, agent coordination)
- Subscription management
- Code examples in multiple languages
- Best practices

### [MCP API Reference](./MCP-API.md)
Model Context Protocol API documentation for:
- MCP server aggregation
- Tool discovery and search
- Tool execution
- Direct proxy access
- Server registration
- Metrics and monitoring
- Integration examples

## 🚀 Quick Start

### 1. Authentication

Obtain an API token:

```bash
curl -X POST https://api.project-nyra.io/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your-password"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

### 2. Make Your First API Call

```bash
# Check API health
curl https://api.project-nyra.io/health

# List available models
curl https://api.project-nyra.io/v1/models \
  -H "Authorization: Bearer YOUR_TOKEN"

# Send a chat completion request
curl -X POST https://api.project-nyra.io/v1/chat/completions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4",
    "messages": [
      {"role": "user", "content": "What is a mortgage rate?"}
    ]
  }'
```

### 3. Connect to WebSocket

```javascript
const ws = new WebSocket('wss://api.project-nyra.io/ws?token=YOUR_TOKEN');

ws.onopen = () => {
  // Subscribe to real-time events
  ws.send(JSON.stringify({
    type: 'subscribe',
    payload: { channel: 'mcp:status' }
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Event:', message);
};
```

### 4. Use MCP Tools

```bash
# Discover available tools
curl https://api.project-nyra.io/mcp/tools/search?q=swarm \
  -H "Authorization: Bearer YOUR_TOKEN"

# Call a tool
curl -X POST https://api.project-nyra.io/mcp/tools/call \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "swarm_init",
    "params": {
      "topology": "mesh",
      "maxAgents": 5
    }
  }'
```

## 🌐 Base URLs

| Environment | REST API | WebSocket |
|-------------|----------|-----------|
| Production | `https://api.project-nyra.io` | `wss://api.project-nyra.io/ws` |
| Staging | `https://staging-api.project-nyra.io` | `wss://staging-api.project-nyra.io/ws` |
| Development | `http://localhost:3000` | `ws://localhost:3001` |

## 📊 API Features

### REST API
- ✅ LLM chat completions with intelligent routing
- ✅ Multi-model support (local GPU + cloud)
- ✅ MCP server aggregation
- ✅ User and application management
- ✅ Document processing
- ✅ Agent orchestration
- ✅ Analytics and metrics

### WebSocket API
- ✅ Real-time event streaming
- ✅ MCP server status updates
- ✅ GPU metrics monitoring
- ✅ Agent coordination events
- ✅ Swarm activity tracking
- ✅ Bi-directional communication

### MCP API
- ✅ Multi-server tool aggregation
- ✅ Fuzzy tool search
- ✅ Direct server proxy
- ✅ Health monitoring
- ✅ Automatic failover
- ✅ Tool caching

## 🔐 Authentication

All API endpoints (except health checks) require JWT authentication:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Token Lifecycle

1. **Login**: `POST /auth/login` - Get access & refresh tokens
2. **Use**: Include access token in Authorization header
3. **Refresh**: `POST /auth/refresh` - Get new access token before expiry
4. **Logout**: `POST /auth/logout` - Invalidate tokens

### Token Expiry
- **Access Token**: 1 hour
- **Refresh Token**: 7 days

## 📈 Rate Limits

| User Type | Requests/Hour | Burst Limit |
|-----------|---------------|-------------|
| Authenticated | 1000 | 50/min |
| Unauthenticated | 100 | 10/min |
| Premium | 10000 | 100/min |

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1704931260
```

## 🐛 Error Handling

All errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context"
    },
    "request_id": "req_abc123"
  }
}
```

Common error codes:
- `INVALID_REQUEST` - Invalid parameters
- `AUTHENTICATION_REQUIRED` - Missing authentication
- `INVALID_TOKEN` - Invalid or expired token
- `PERMISSION_DENIED` - Insufficient permissions
- `RESOURCE_NOT_FOUND` - Resource doesn't exist
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

## 📦 SDKs and Tools

### Official SDKs
- **JavaScript/TypeScript**: `npm install @project-nyra/sdk`
- **Python**: `pip install project-nyra`

### Third-Party Integrations
- **Postman Collection**: [Download](./postman-collection.json)
- **Insomnia Workspace**: [Download](./insomnia-workspace.json)
- **OpenAPI Generator**: Use `openapi.yaml` for code generation

## 🔧 Development Tools

### Local Testing

```bash
# Start local development server
cd services/nexus-router
npm install
npm run dev

# Server runs on http://localhost:3000
```

### Testing with cURL

```bash
# Save token to environment variable
export NYRA_TOKEN="your-jwt-token"

# Use in requests
curl https://api.project-nyra.io/v1/models \
  -H "Authorization: Bearer $NYRA_TOKEN"
```

### Testing with Postman

1. Import `openapi.yaml` into Postman
2. Set up environment variables:
   - `base_url`: API base URL
   - `token`: JWT access token
3. Use `{{token}}` in Authorization header

## 📖 Additional Resources

### Documentation
- [Architecture Overview](../architecture/system-architecture.md)
- [Deployment Guide](../deployment/README.md)
- [Environment Setup](../guides/environment-setup.md)

### API Guides
- [Authentication Guide](./guides/authentication.md)
- [Pagination Guide](./guides/pagination.md)
- [WebSocket Guide](./guides/websocket.md)
- [MCP Integration Guide](./guides/mcp-integration.md)

### Examples
- [REST API Examples](./examples/rest-api/)
- [WebSocket Examples](./examples/websocket/)
- [MCP Examples](./examples/mcp/)

## 🆘 Support

### Getting Help
- **Documentation**: https://docs.project-nyra.io
- **Email**: support@project-nyra.io
- **GitHub Issues**: https://github.com/project-nyra/api/issues
- **Discord**: https://discord.gg/project-nyra

### Status Page
Monitor API uptime and incidents: https://status.project-nyra.io

### Changelog
Stay updated with API changes: [CHANGELOG.md](./CHANGELOG.md)

## 🤝 Contributing

We welcome contributions to our API documentation!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for details.

## 📄 License

This API documentation is licensed under [MIT License](../../LICENSE).

---

**Version:** 1.0.0
**Last Updated:** 2026-01-10

For the most up-to-date information, visit our [online documentation](https://docs.project-nyra.io).
