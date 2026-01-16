# Bootstrap Configurations

Centralized shared configuration files for Project Nyra.

## Directory Structure

```
bootstrap/configs/
├── claude-flow/           # Claude Flow V3 configuration files
├── mcp/                   # MCP Server configurations
├── env/                   # Environment variable templates
├── infisical/             # Infisical secrets management
├── agents/                # Agent configuration files
├── quality/               # Code quality and linting configs
├── docker/                # Docker configuration files
└── README.md              # This file
```

## Usage

Deploy configs using the script:
```bash
./bootstrap/scripts/deploy-configs.sh
```

Or manually:
```bash
# Claude Flow
cp bootstrap/configs/claude-flow/claude-flow.config.json ./

# MCP
cp bootstrap/configs/mcp/mcp.development.json ./.mcp.json

# Environment
cp bootstrap/configs/env/env.example ./.env
```

## References

- [Config Management Guide](../docs/CONFIG-MANAGEMENT.md)
- [Environment Variables Guide](../../docs/environment/ENVIRONMENT_VARIABLES.md)

Last Updated: 2026-01-15
