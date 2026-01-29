# Quick maintenance script - wrapper for infra\scripts\runtime\nyra-maintenance.ps1
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& "$scriptDir\infra\scripts\runtime\nyra-maintenance.ps1" @args
