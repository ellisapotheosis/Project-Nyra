# VSCode MCP Server

Provides VSCode editing capabilities as MCP tools for AI-assisted coding.

## Features

- **open_file** - Open and read file contents
- **edit_file** - Edit file contents
- **search_files** - Search for files in workspace
- **refactor** - Refactor code
- **get_file_contents** - Get specific file contents
- **list_directory** - List files in directory

## Docker Build

```bash
docker build -t nyra-vscode-mcp:latest .
```

## Docker Run (Standalone)

```bash
docker run -d \
  --name nyra-vscode-mcp \
  -p 8081:8081 \
  -v /path/to/workspace:/workspace \
  -e WORKSPACE_DIR=/workspace \
  nyra-vscode-mcp:latest
```

## Docker Compose

Already integrated in `docker-compose.nexus-mcp.yml`:

```yaml
vscode-mcp:
  build:
    context: ./mcp-servers/vscode
  volumes:
    - ../..:/workspace:rw
  ports:
    - "8081:8081"
```

## Usage via Nexus Router

The VSCode MCP server is accessible through Nexus Router at:
`http://nexus:6000`

Tools are exposed with fuzzy matching:
- Keywords: edit, code, file, refactor, IDE
- Aliases: modify, change, update, rewrite

## Integration with Project Nyra

This MCP server allows AI agents to:
1. Read code files from the workspace
2. Edit and refactor code
3. Search for files and symbols
4. Perform IDE-like operations

All operations are logged and can be audited through the Nyra Orchestrator.
