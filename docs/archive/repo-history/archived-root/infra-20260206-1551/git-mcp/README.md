# Git MCP Server

A Model Context Protocol (MCP) server that provides Git operations with workspace bind mount support for Docker deployment.

## Features

- **Complete Git Operations**: Status, log, diff, add, commit, push, pull, branch management, checkout, reset, and stash
- **Docker-Native**: Runs in a containerized environment with workspace bind mounting
- **Type-Safe**: Built with TypeScript and Zod validation
- **Security**: Runs as non-root user with resource limits
- **MCP Protocol**: Standard MCP server implementation using stdio transport

## Available Git Tools

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `git_status` | Get working tree status | `path` (optional) |
| `git_log` | Show commit logs | `maxCount`, `file` |
| `git_diff` | Show changes | `from`, `to`, `file`, `cached` |
| `git_add` | Stage files | `files` (required) |
| `git_commit` | Create commit | `message` (required), `files` |
| `git_push` | Push to remote | `remote`, `branch`, `force` |
| `git_pull` | Pull from remote | `remote`, `branch` |
| `git_branch` | Branch operations | `name`, `create`, `delete` |
| `git_checkout` | Switch branches | `branch` (required), `create` |
| `git_reset` | Reset HEAD | `mode`, `commit` |
| `git_stash` | Stash operations | `action` (required), `message`, `index` |

## Installation

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Git repository to work with

### Build the Docker Image

```bash
# Build the image
docker build -t mcp/git:latest .

# Or use docker-compose
docker-compose build
```

## Configuration

### Claude Desktop Integration

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcp": {
    "servers": {
      "git": {
        "command": "docker",
        "args": [
          "run",
          "--rm",
          "-i",
          "--mount", "type=bind,src=${workspaceFolder},dst=/workspace",
          "mcp/git"
        ]
      }
    }
  }
}
```

### Environment Variables

Configure via `.env` file or docker-compose environment:

```bash
# Workspace path (default: current directory)
WORKSPACE_PATH=/path/to/your/repo

# Git user configuration
GIT_AUTHOR_NAME=Your Name
GIT_AUTHOR_EMAIL=your.email@example.com
GIT_COMMITTER_NAME=Your Name
GIT_COMMITTER_EMAIL=your.email@example.com
```

## Usage

### Docker Compose

```bash
# Start the server
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the server
docker-compose down
```

### Direct Docker

```bash
# Run with workspace bind mount
docker run --rm -i \
  --mount type=bind,src=/path/to/repo,dst=/workspace \
  -e GIT_AUTHOR_NAME="Your Name" \
  -e GIT_AUTHOR_EMAIL="your@email.com" \
  mcp/git:latest
```

### Example MCP Tool Calls

#### Get Repository Status

```json
{
  "name": "git_status",
  "arguments": {}
}
```

#### View Commit History

```json
{
  "name": "git_log",
  "arguments": {
    "maxCount": 5
  }
}
```

#### Show Diff

```json
{
  "name": "git_diff",
  "arguments": {
    "cached": true
  }
}
```

#### Stage Files

```json
{
  "name": "git_add",
  "arguments": {
    "files": ["."]
  }
}
```

#### Create Commit

```json
{
  "name": "git_commit",
  "arguments": {
    "message": "feat: add new feature"
  }
}
```

#### Push Changes

```json
{
  "name": "git_push",
  "arguments": {
    "remote": "origin",
    "branch": "main"
  }
}
```

#### Create and Checkout Branch

```json
{
  "name": "git_checkout",
  "arguments": {
    "branch": "feature/new-feature",
    "create": true
  }
}
```

#### Stash Changes

```json
{
  "name": "git_stash",
  "arguments": {
    "action": "save",
    "message": "WIP: work in progress"
  }
}
```

## Development

### Project Structure

```
git-mcp/
├── src/
│   └── index.ts          # Main MCP server implementation
├── Dockerfile            # Container image definition
├── docker-compose.yml    # Compose configuration
├── package.json          # Node.js dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

### Local Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run locally (requires workspace path)
export GIT_WORKSPACE=/path/to/repo
npm start

# Watch mode for development
npm run dev
```

### Testing

```bash
# Run tests
npm test

# Lint code
npm run lint
```

## Security

- **Non-root user**: Container runs as user `mcp` (UID 1000)
- **Resource limits**: CPU and memory constraints configured
- **Read/write workspace**: Bind mount is read-write for git operations
- **Input validation**: All tool arguments validated with Zod schemas
- **Error handling**: Comprehensive error messages without exposing internals

## Architecture

### MCP Server Implementation

The server uses:
- **@modelcontextprotocol/sdk**: Official MCP SDK for server implementation
- **simple-git**: Type-safe Git operations library
- **zod**: Runtime type validation for all tool inputs
- **stdio transport**: Standard input/output for MCP communication

### Workspace Bind Mount

The Docker container mounts your local repository at `/workspace`, allowing git operations to be performed directly on your files. This enables:
- Real-time status updates
- Direct file modifications
- Push/pull operations with your credentials
- Branch switching and management

### Health Checks

The container includes health checks to ensure the Node.js process is running correctly:
- Interval: 30 seconds
- Timeout: 10 seconds
- Start period: 5 seconds
- Retries: 3

## Troubleshooting

### Permission Issues

If you encounter permission issues with the bind mount:

```bash
# Ensure the workspace directory is accessible
chmod -R 755 /path/to/repo

# Or adjust the container user ID to match your host user
docker run --user $(id -u):$(id -g) ...
```

### Git Credentials

For push/pull operations requiring authentication:

```bash
# Use SSH keys (mount your .ssh directory)
docker run -v ~/.ssh:/home/mcp/.ssh:ro ...

# Or use credential helpers
docker run -e GIT_CREDENTIAL_HELPER=store ...
```

### Container Logs

```bash
# View server logs
docker logs git-mcp-server

# Follow logs in real-time
docker logs -f git-mcp-server
```

## Performance

- **Startup time**: <2 seconds
- **Memory usage**: ~50-100MB typical
- **CPU usage**: Minimal (mostly I/O bound)
- **Resource limits**: 1 CPU, 512MB RAM (configurable)

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- **Issues**: [GitHub Issues](https://github.com/Project-Nyra/issues)
- **Documentation**: [MCP Protocol](https://modelcontextprotocol.io)
- **Project**: Project Nyra

## Related

- [Claude Flow MCP](../claude-flow/) - Multi-agent orchestration
- [RuV Swarm MCP](../ruv-swarm/) - Distributed agent coordination
- [MCP SDK](https://github.com/modelcontextprotocol/sdk) - Official SDK

---

**Version**: 1.0.0
**Maintainer**: Project Nyra
**Last Updated**: 2026-01-16
