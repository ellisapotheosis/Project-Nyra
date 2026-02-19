@{
    # Module manifest for InfisicalWrappers
    ModuleVersion = '2.1.0'
    GUID = 'a8e6cf88-d5c5-4a8e-b3d9-1f5a8c6e2b4d'
    Author = 'NYRA Development Team'
    CompanyName = 'NYRA'
    Copyright = '(c) 2026 NYRA. All rights reserved.'
    Description = 'Infisical secret injection wrapper for Claude Code, Claude Flow, Gemini Flow, and MCP servers with Docker integration'

    PowerShellVersion = '5.1'

    RootModule = 'SecretsManagement.psm1'

    FunctionsToExport = @(
        'Import-InfisicalEnv',
        'Import-BWEnv',
        'Invoke-InfisicalTool',
        'Invoke-Infisical',
        'Invoke-InfisicalDev',
        'Invoke-InfisicalProd',
        'Invoke-InfisicalStaging',
        'Inject-ClaudeDesktopSecrets',
        'Start-InfisicalMCP',
        'Start-InfisicalMCPDocker',
        'Stop-InfisicalMCPDocker',
        'claude',
        'claude-code',
        'claude-flow',
        'gemini-flow',
        'gf',
        'gemini',
        'gemini-cli',
        'npx-claude',
        'npx-claude-code',
        'npx-claude-flow',
        'npx-claude-flow-alpha',
        'npx-gemini-flow',
        'npx-gemini-flow-alpha',
        'npx-gemini',
        'npx-gemini-cli',
        'pnpm-dlx-claude',
        'pnpm-dlx-claude-code',
        'pnpm-dlx-claude-flow',
        'pnpm-dlx-claude-flow-alpha',
        'pnpm-dlx-gemini-flow',
        'pnpm-dlx-gemini-flow-alpha',
        'pnpm-dlx-gemini',
        'pnpm-dlx-gemini-cli'
    )

    AliasesToExport = @('infis', 'infis-dev', 'infis-prod', 'infis-staging', 'infmcp', 'infmcp-docker')

    PrivateData = @{
        PSData = @{
            Tags = @('Infisical', 'Secrets', 'Claude', 'Gemini', 'MCP', 'Docker')
            ProjectUri = 'https://github.com/ruvnet/nyra'
        }
    }
}
