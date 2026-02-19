@{
    RootModule = 'NYRA.MCPServers.psm1'
    ModuleVersion = '1.0.0'
    GUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    Author = 'NYRA Development Team'
    Description = 'NPX-based MCP server management for Infisical and Bitwarden'
    PowerShellVersion = '7.0'
    FunctionsToExport = @(
        'Start-InfisicalMCP',
        'Start-BitwardenMCP',
        'Get-InfisicalSecret',
        'Get-InfisicalSecrets',
        'Get-BitwardenItem',
        'Edit-InfisicalConfig',
        'Show-MCPServerPaths'
    )
    AliasesToExport = @(
        'infisical-mcp',
        'bitwarden-mcp',
        'get-secret',
        'list-secrets',
        'get-bw',
        'edit-infisical'
    )
}
