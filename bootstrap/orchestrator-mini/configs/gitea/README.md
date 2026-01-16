# Gitea Configuration Directory

This directory contains configuration files for the Gitea local git server.

## Files

### app.ini
Main Gitea configuration file. This is a template file - most configuration is managed through environment variables in `docker-compose.yml` for easier orchestration and secret management.

**Key Sections:**
- `[repository]` - Repository settings (default branch, private repos, etc.)
- `[server]` - Server configuration (domain, ports, SSH, LFS)
- `[database]` - PostgreSQL connection settings
- `[security]` - Security settings (password complexity, secret keys)
- `[service]` - Service settings (registration, signin requirements)
- `[webhook]` - Webhook configuration
- `[log]` - Logging configuration
- `[api]` - API settings (Swagger, response limits)
- `[oauth2]` - OAuth2 configuration

## Customization

To customize Gitea configuration:

1. **Environment Variables** (Recommended)
   - Edit `bootstrap/orchestrator-mini/docker/.env.gitea`
   - Restart Gitea: `docker-compose restart gitea`

2. **app.ini** (Advanced)
   - Edit this file for settings not available via environment variables
   - Restart Gitea: `docker-compose restart gitea`

## Documentation

- Gitea Configuration Cheat Sheet: https://docs.gitea.io/en-us/config-cheat-sheet/
- Setup Guide: `bootstrap/docs/GITEA-SETUP.md`

## Git Hooks

Custom Git hooks can be placed in the `hooks/` subdirectory. See the `.sample` files for examples.

## Security Notes

- Never commit secrets or passwords to this directory
- Use Infisical or environment variables for credentials
- Regularly update `GITEA_SECRET_KEY` and `GITEA_INTERNAL_TOKEN` in production
