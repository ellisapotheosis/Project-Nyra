@{
    ModuleVersion = '1.0.0'
    GUID = '7f2c8a5b-9d3e-4f1a-8b6c-2e5d4a3f9c1b'
    Author = 'NYRA Development'
    Description = 'Claude Code, Claude Flow, and Archon MCP environment detection and profile management for Windows 11 and WSL'
    PowerShellVersion = '5.1'
    RootModule = 'ClaudeEnvironment.psm1'
    FunctionsToExport = @(
        'Test-ClaudeCodeActive',
        'Test-ClaudeFlowActive',
        'Test-ArchonMCPActive',
        'Get-ClaudeEnvironmentContext',
        'Switch-ToClaudeProfile',
        'Switch-ToDefaultProfile',
        'Initialize-ClaudeAutoDetection',
        'Get-WSLClaudeSetup',
        'Install-WSLClaudeProfile',
        'Show-ClaudeEnvironmentStatus',
        'Start-ClaudeFlowDev'
    )
    AliasesToExport = @('claude-status', 'claude-on', 'claude-off', 'cf-start')
}
