# Project Nyra Health Check Standard

All services in the Nyra ecosystem must implement a GET `/health` endpoint.

## Response Payload

```json
{
  "status": "healthy" | "degraded" | "unhealthy",
  "version": "1.0.0",
  "service": "service-name",
  "checks": {
    "database": { "status": "healthy" },
    "upstream-api": { "status": "healthy", "latencyMs": 45 }
  },
  "timestamp": "ISO-8601"
}
```

## Status Codes

- `200 OK`: All critical components are healthy.
- `503 Service Unavailable`: One or more critical components are unhealthy.

## Critical vs. Non-Critical Checks

- **Critical**: Database connection, mandatory internal APIs.
- **Non-Critical**: External optional integrations (e.g., Slack notifications), caches.
- If a non-critical check fails, the overall status should be `degraded` but return `200 OK`.
