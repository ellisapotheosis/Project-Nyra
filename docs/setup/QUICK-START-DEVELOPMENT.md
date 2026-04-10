# Quick Start - Project-Nyra Development Environment

## One-Line Setup (Windows PowerShell)
```powershell
.\setup-dev-environment.ps1 -Environment development
```

## One-Line Setup (Bash/WSL/Linux)
```bash
./setup-dev-environment.sh development
```

## What This Does

1. Loads development environment variables
2. Configures MCP servers to use local code
3. Enables hot reload for immediate feedback
4. Sets up pnpm workspace linking
5. Verifies all dependencies

## Start Development

```bash
pnpm dev
```

## Edit Code

Changes in these directories auto-reload:
- `C:\Dev\Projects\Repos\Project-Nyra\submodules\archon-os`
- `C:\Dev\Projects\Repos\Project-Nyra\submodules\archon`

## Switch to Production

```powershell
.\setup-dev-environment.ps1 -Environment production
```

## Verify Setup

```bash
bash validate-setup.sh
```

## Environment Status

Current Mode: **DEVELOPMENT**
- NODE_ENV: development
- MCP_HOT_RELOAD: true
- Uses local code from submodules

## Files Created

```
Project-Nyra/
├── .env.development         (dev environment vars)
├── .env.production          (prod environment vars)
├── .mcp.json                (active MCP config)
├── .mcp.json.development    (dev MCP servers)
├── .mcp.json.production     (prod MCP servers)
├── setup-dev-environment.ps1 (Windows setup)
├── setup-dev-environment.sh  (Bash setup)
├── validate-setup.sh         (verification)
└── DEVELOPMENT-SETUP-COMPLETE.md (full documentation)
```

## Package Locations

- **archon-os**: `submodules/archon-os`
- **Archon**: `submodules/archon`

Both are registered in `pnpm-workspace.yaml` for automatic resolution.

## Hot Reload

MCP servers automatically reload when you:
1. Modify source files in submodules
2. Save changes (file watcher triggers)
3. No manual restart needed

## Common Tasks

```bash
# Start development servers
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Clean and rebuild
pnpm clean && pnpm build

# View workspace packages
pnpm ls --depth 0

# Check node version
node --version

# Check pnpm version
pnpm --version
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Changes not appearing | Run setup script again |
| Package not found | Run `pnpm install` |
| Port already in use | Change port in .env.development |
| NODE_ENV not set | Check .env.development exists |
| MCP server won't start | Check console for error messages |

## Full Documentation

See `DEVELOPMENT-SETUP-COMPLETE.md` for complete information including:
- Detailed environment configuration
- MCP server setup
- Workspace structure
- Advanced troubleshooting
- Production deployment

---

**Status**: ✓ Ready for Development
**Last Updated**: 2026-01-10
**Node Version**: 20.x+ (via Volta)
**pnpm Version**: 10.27.0+
