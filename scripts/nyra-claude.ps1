#!/usr/bin/env pwsh
# NYRA Claude Code with Auto-Injected Secrets

. "$PSScriptRoot\lib\InfisicalToken.ps1"
$projectId = Get-NyraInfisicalProjectId
Assert-NyraInfisicalToken
& infisical run --projectId=$projectId --env=development -- claude @args
