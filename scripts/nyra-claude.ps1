#!/usr/bin/env pwsh
# NYRA Claude Code with Auto-Injected Secrets

# Inject secrets via Infisical
infisical run --env=development --command "claude $args"
