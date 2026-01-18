# Rate Limiting Configuration API

Comprehensive REST API for managing multi-level rate limiting in Nexus Router.

## Overview

The Rate Limiting API provides configuration management and statistics tracking for four distinct rate limiting levels:

1. **Global**: System-wide request limiting
2. **Per-IP**: Client-based rate limiting
3. **Per-Server**: MCP server-specific limits
4. **Per-Tool**: Individual tool limits

## Base URL

```
http://localhost:8000/api/rate-limits
```

## Rate Limit Configuration Structure

```json
{
  "global": {
    "enabled": true,
    "windowMs": 60000,
    "maxRequests": 1000,
    "message": "Too many requests from system",
    "backend": "redis"
  },
  "perIp": {
    "enabled": true,
    "windowMs": 900000,
    "maxRequests": 300,
    "skipSuccessfulRequests": false,
    "skipFailedRequests": false,
    "excludeIps": ["127.0.0.1", "::1"]
  },
  "perServer": {
    "server-1": {
      "serverId": "server-1",
      "enabled": true,
      "windowMs": 60000,
      "maxRequests": 500,
      "priority": 50
    }
  },
  "perTool": {
    "tool-1": {
      "toolId": "tool-1",
      "enabled": true,
      "windowMs": 60000,
      "maxRequests": 100,
      "costWeight": 1.0
    }
  },
  "redis": {
    "enabled": true,
    "cluster": []
  }
}
```

## Endpoints

### Configuration Management

#### GET /api/rate-limits

Get all rate limit configurations.

**Request:**
```bash
curl http://localhost:8000/api/rate-limits
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "global": {...},
    "perIp": {...},
    "perServer": {...},
    "perTool": {...},
    "redis": {...}
  },
  "metadata": {
    "totalServerLimits": 5,
    "totalToolLimits": 12,
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

---

#### GET /api/rate-limits/global

Get global rate limit configuration.

**Request:**
```bash
curl http://localhost:8000/api/rate-limits/global
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "enabled": true,
    "windowMs": 60000,
    "maxRequests": 1000,
    "message": "Too many requests from system",
    "backend": "redis"
  },
  "metadata": {
    "description": "System-wide rate limiting configuration",
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

---

#### PATCH /api/rate-limits/global

Update global rate limit configuration.

**Request:**
```bash
curl -X PATCH http://localhost:8000/api/rate-limits/global \
  -H "Content-Type: application/json" \
  -d '{
    "windowMs": 120000,
    "maxRequests": 2000
  }'
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Global rate limit configuration updated",
  "data": {
    "enabled": true,
    "windowMs": 120000,
    "maxRequests": 2000,
    "message": "Too many requests from system",
    "backend": "redis"
  },
  "metadata": {
    "updatedAt": "2026-01-18T12:00:00Z"
  }
}
```

---

#### GET /api/rate-limits/per-ip

Get per-IP rate limit configuration.

**Request:**
```bash
curl http://localhost:8000/api/rate-limits/per-ip
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "enabled": true,
    "windowMs": 900000,
    "maxRequests": 300,
    "skipSuccessfulRequests": false,
    "skipFailedRequests": false,
    "excludeIps": ["127.0.0.1", "::1"]
  },
  "metadata": {
    "description": "Per-IP client rate limiting configuration",
    "excludedIps": ["127.0.0.1", "::1"],
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

---

#### PATCH /api/rate-limits/per-ip

Update per-IP rate limit configuration.

**Request:**
```bash
curl -X PATCH http://localhost:8000/api/rate-limits/per-ip \
  -H "Content-Type: application/json" \
  -d '{
    "windowMs": 1200000,
    "maxRequests": 600,
    "excludeIps": ["127.0.0.1", "::1", "192.168.1.100"]
  }'
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Per-IP rate limit configuration updated",
  "data": {
    "enabled": true,
    "windowMs": 1200000,
    "maxRequests": 600,
    "skipSuccessfulRequests": false,
    "skipFailedRequests": false,
    "excludeIps": ["127.0.0.1", "::1", "192.168.1.100"]
  },
  "metadata": {
    "updatedAt": "2026-01-18T12:00:00Z"
  }
}
```

---

### Per-Server Rate Limits

#### GET /api/rate-limits/per-server

Get all per-server rate limit configurations.

**Request:**
```bash
curl http://localhost:8000/api/rate-limits/per-server
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "server-1": {
      "serverId": "server-1",
      "enabled": true,
      "windowMs": 60000,
      "maxRequests": 500,
      "priority": 50
    },
    "server-2": {
      "serverId": "server-2",
      "enabled": true,
      "windowMs": 60000,
      "maxRequests": 300,
      "priority": 60
    }
  },
  "metadata": {
    "description": "MCP server-specific rate limiting configurations",
    "totalServers": 2,
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

---

#### GET /api/rate-limits/per-server/:serverId

Get a specific server's rate limit configuration.

**Request:**
```bash
curl http://localhost:8000/api/rate-limits/per-server/server-1
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "serverId": "server-1",
    "enabled": true,
    "windowMs": 60000,
    "maxRequests": 500,
    "priority": 50
  },
  "metadata": {
    "serverId": "server-1",
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "No rate limit configuration found for server: unknown-server"
}
```

---

#### POST /api/rate-limits/per-server

Create or update a server rate limit.

**Request:**
```bash
curl -X POST http://localhost:8000/api/rate-limits/per-server \
  -H "Content-Type: application/json" \
  -d '{
    "serverId": "server-3",
    "enabled": true,
    "windowMs": 60000,
    "maxRequests": 750,
    "priority": 45
  }'
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Rate limit added for server: server-3",
  "data": {
    "serverId": "server-3",
    "enabled": true,
    "windowMs": 60000,
    "maxRequests": 750,
    "priority": 45
  },
  "metadata": {
    "createdAt": "2026-01-18T12:00:00Z"
  }
}
```

**Request Validation Errors (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Invalid server rate limit configuration",
  "errors": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "number",
      "path": ["maxRequests"],
      "message": "Number must be greater than or equal to 1"
    }
  ]
}
```

---

#### DELETE /api/rate-limits/per-server/:serverId

Remove a server rate limit configuration.

**Request:**
```bash
curl -X DELETE http://localhost:8000/api/rate-limits/per-server/server-3
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Rate limit removed for server: server-3",
  "metadata": {
    "deletedAt": "2026-01-18T12:00:00Z"
  }
}
```

---

### Per-Tool Rate Limits

#### GET /api/rate-limits/per-tool

Get all per-tool rate limit configurations.

**Request:**
```bash
curl http://localhost:8000/api/rate-limits/per-tool
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "tool-1": {
      "toolId": "tool-1",
      "enabled": true,
      "windowMs": 60000,
      "maxRequests": 100,
      "costWeight": 1.0
    },
    "tool-2": {
      "toolId": "tool-2",
      "enabled": true,
      "windowMs": 60000,
      "maxRequests": 50,
      "costWeight": 2.5
    }
  },
  "metadata": {
    "description": "Individual tool-specific rate limiting configurations",
    "totalTools": 2,
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

---

#### GET /api/rate-limits/per-tool/:toolId

Get a specific tool's rate limit configuration.

**Request:**
```bash
curl http://localhost:8000/api/rate-limits/per-tool/tool-1
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "toolId": "tool-1",
    "enabled": true,
    "windowMs": 60000,
    "maxRequests": 100,
    "costWeight": 1.0
  },
  "metadata": {
    "toolId": "tool-1",
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

---

#### POST /api/rate-limits/per-tool

Create or update a tool rate limit.

**Request:**
```bash
curl -X POST http://localhost:8000/api/rate-limits/per-tool \
  -H "Content-Type: application/json" \
  -d '{
    "toolId": "tool-3",
    "enabled": true,
    "windowMs": 60000,
    "maxRequests": 75,
    "costWeight": 1.5
  }'
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Rate limit added for tool: tool-3",
  "data": {
    "toolId": "tool-3",
    "enabled": true,
    "windowMs": 60000,
    "maxRequests": 75,
    "costWeight": 1.5
  },
  "metadata": {
    "createdAt": "2026-01-18T12:00:00Z"
  }
}
```

---

#### DELETE /api/rate-limits/per-tool/:toolId

Remove a tool rate limit configuration.

**Request:**
```bash
curl -X DELETE http://localhost:8000/api/rate-limits/per-tool/tool-3
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Rate limit removed for tool: tool-3",
  "metadata": {
    "deletedAt": "2026-01-18T12:00:00Z"
  }
}
```

---

## Statistics Endpoints

### GET /api/rate-limits/stats

Get all rate limit usage statistics.

**Request:**
```bash
curl http://localhost:8000/api/rate-limits/stats
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "timestamp": "2026-01-18T12:00:00Z",
    "global": {
      "totalRequests": 15234,
      "allowedRequests": 15000,
      "blockedRequests": 234,
      "utilizationPercent": 93
    },
    "perIp": {
      "192.168.1.100": {
        "requests": 500,
        "allowedRequests": 480,
        "blockedRequests": 20,
        "utilizationPercent": 78,
        "lastRequest": "2026-01-18T12:00:00Z"
      },
      "10.0.0.50": {
        "requests": 200,
        "allowedRequests": 200,
        "blockedRequests": 0,
        "utilizationPercent": 12,
        "lastRequest": "2026-01-18T12:00:00Z"
      }
    },
    "perServer": {
      "server-1": {
        "requests": 8000,
        "allowedRequests": 7800,
        "blockedRequests": 200,
        "utilizationPercent": 92,
        "lastRequest": "2026-01-18T12:00:00Z"
      }
    },
    "perTool": {
      "tool-1": {
        "requests": 2500,
        "allowedRequests": 2450,
        "blockedRequests": 50,
        "utilizationPercent": 88,
        "lastRequest": "2026-01-18T12:00:00Z"
      }
    }
  },
  "metadata": {
    "description": "Current rate limit usage statistics",
    "refreshInterval": "5 seconds",
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

---

#### GET /api/rate-limits/stats/global

Get global usage statistics.

**Request:**
```bash
curl http://localhost:8000/api/rate-limits/stats/global
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "totalRequests": 15234,
    "allowedRequests": 15000,
    "blockedRequests": 234,
    "utilizationPercent": 93
  },
  "metadata": {
    "description": "System-wide rate limit usage",
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

---

#### GET /api/rate-limits/stats/per-ip

Get per-IP usage statistics with sorting.

**Request:**
```bash
# Sort by requests (default)
curl "http://localhost:8000/api/rate-limits/stats/per-ip?sort=requests"

# Sort by blocked requests
curl "http://localhost:8000/api/rate-limits/stats/per-ip?sort=blocked"

# Sort by utilization percentage
curl "http://localhost:8000/api/rate-limits/stats/per-ip?sort=utilization"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "ip": "192.168.1.100",
      "requests": 500,
      "allowedRequests": 480,
      "blockedRequests": 20,
      "utilizationPercent": 78,
      "lastRequest": "2026-01-18T12:00:00Z"
    },
    {
      "ip": "10.0.0.50",
      "requests": 200,
      "allowedRequests": 200,
      "blockedRequests": 0,
      "utilizationPercent": 12,
      "lastRequest": "2026-01-18T12:00:00Z"
    }
  ],
  "metadata": {
    "description": "Per-IP rate limit usage",
    "totalIps": 2,
    "sortedBy": "requests",
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

---

#### GET /api/rate-limits/stats/per-server

Get per-server usage statistics with sorting.

**Query Parameters:**
- `sort`: `requests` (default), `blocked`, or `utilization`

**Request:**
```bash
curl "http://localhost:8000/api/rate-limits/stats/per-server?sort=utilization"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "serverId": "server-1",
      "requests": 8000,
      "allowedRequests": 7800,
      "blockedRequests": 200,
      "utilizationPercent": 92,
      "lastRequest": "2026-01-18T12:00:00Z"
    }
  ],
  "metadata": {
    "description": "Per-server rate limit usage",
    "totalServers": 1,
    "sortedBy": "utilization",
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

---

#### GET /api/rate-limits/stats/per-tool

Get per-tool usage statistics with sorting.

**Request:**
```bash
curl "http://localhost:8000/api/rate-limits/stats/per-tool?sort=blocked"
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "toolId": "tool-1",
      "requests": 2500,
      "allowedRequests": 2450,
      "blockedRequests": 50,
      "utilizationPercent": 88,
      "lastRequest": "2026-01-18T12:00:00Z"
    }
  ],
  "metadata": {
    "description": "Per-tool rate limit usage",
    "totalTools": 1,
    "sortedBy": "blocked",
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

---

#### POST /api/rate-limits/stats/reset

Reset all statistics counters.

**Request:**
```bash
curl -X POST http://localhost:8000/api/rate-limits/stats/reset
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Rate limit statistics reset",
  "metadata": {
    "resetAt": "2026-01-18T12:00:00Z"
  }
}
```

---

## Configuration Examples

### Example 1: Basic Global Rate Limiting

```bash
curl -X PATCH http://localhost:8000/api/rate-limits/global \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "windowMs": 60000,
    "maxRequests": 1000,
    "backend": "redis"
  }'
```

### Example 2: Add Server-Specific Rate Limits

```bash
# Add high-priority server with higher limits
curl -X POST http://localhost:8000/api/rate-limits/per-server \
  -H "Content-Type: application/json" \
  -d '{
    "serverId": "premium-server",
    "enabled": true,
    "windowMs": 60000,
    "maxRequests": 2000,
    "priority": 10
  }'

# Add limited-access server
curl -X POST http://localhost:8000/api/rate-limits/per-server \
  -H "Content-Type: application/json" \
  -d '{
    "serverId": "limited-server",
    "enabled": true,
    "windowMs": 60000,
    "maxRequests": 100,
    "priority": 90
  }'
```

### Example 3: Cost-Based Tool Limiting

```bash
# Expensive analysis tool
curl -X POST http://localhost:8000/api/rate-limits/per-tool \
  -H "Content-Type: application/json" \
  -d '{
    "toolId": "expensive-analysis",
    "enabled": true,
    "windowMs": 3600000,
    "maxRequests": 10,
    "costWeight": 3.0
  }'

# Lightweight tool
curl -X POST http://localhost:8000/api/rate-limits/per-tool \
  -H "Content-Type: application/json" \
  -d '{
    "toolId": "quick-check",
    "enabled": true,
    "windowMs": 60000,
    "maxRequests": 500,
    "costWeight": 0.5
  }'
```

---

## Error Handling

### Common Status Codes

- `200 OK` - Successful GET or PATCH request
- `201 Created` - Successful POST request
- `400 Bad Request` - Invalid request body or parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Error Response Format

```json
{
  "status": "error",
  "message": "Error description",
  "error": "Additional error details",
  "errors": [
    {
      "code": "validation_error",
      "message": "Error message",
      "path": ["field", "name"]
    }
  ]
}
```

---

## Best Practices

1. **Use Redis Backend**: Enable Redis for distributed rate limiting across multiple instances
2. **Set Realistic Limits**: Start with higher limits and gradually tune based on usage
3. **Monitor Utilization**: Check `/api/rate-limits/stats` regularly to monitor usage patterns
4. **Prioritize Important Servers**: Use priority setting to give precedence to critical services
5. **Cost-Weight Tools**: Use cost weights for tools with varying computational requirements
6. **Exclude Trusted IPs**: Add internal IPs to per-IP exclusion list for internal services
7. **Regular Reviews**: Periodically review and adjust configurations based on metrics

---

## Integration with Express Middleware

The rate limiter can be integrated as middleware:

```typescript
import { RateLimitStore } from './services/rate-limit-store';

const store = RateLimitStore.getInstance();

// In your Express app
app.use((req, res, next) => {
  const config = store.getConfig();
  const ip = req.ip || 'unknown';

  // Check if IP is excluded
  if (config.perIp.excludeIps.includes(ip)) {
    return next();
  }

  // Apply rate limiting logic
  // Record usage
  store.recordRequest('global', 'global', true);
  store.recordRequest('ip', ip, true);

  next();
});
```

---

## Performance Considerations

- **Update Frequency**: Configuration changes take effect immediately
- **Stats Refresh**: Statistics update every 5 seconds
- **Memory Usage**: In-memory backend uses minimal memory; use Redis for scalability
- **Response Time**: API endpoints respond in <100ms with Redis backend

---

## Support and Documentation

For detailed implementation guides and troubleshooting, see the main [Nexus Router Documentation](./README.md).
