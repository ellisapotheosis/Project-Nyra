# Quick bootup script - wrapper for infra\scripts\runtime\nyra-up.ps1
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& "$scriptDir\infra\scripts\runtime\nyra-up.ps1" @args
