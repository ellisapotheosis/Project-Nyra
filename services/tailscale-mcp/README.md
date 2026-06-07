# Project Nyra Tailscale MCP

Stdio MCP server for Oracle VPS network inventory.

It exposes tools for:

- Tailscale status and Serve configuration.
- Docker container endpoint inventory through the Docker Engine socket.
- Caddy virtual-host mapping review.
- Controlled Tailscale Service configuration with dry-run as the default.

The Docker Compose service runs the server in Streamable HTTP mode so Grafbase Nexus can consume it at `http://tailscale-mcp:8780/mcp`.

The server intentionally does not store credentials. It expects the host Tailscale socket, Docker socket, and read-only repository mount from the Oracle compose service.
