# Quick shutdown script - wrapper for infra\scripts\runtime\nyra-down.ps1
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& "$scriptDir\infra\scripts\runtime\nyra-down.ps1" @args
