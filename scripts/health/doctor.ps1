# Quick doctor script - wrapper for infra\scripts\runtime\nyra-doctor.ps1
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& "$scriptDir\infra\scripts\runtime\nyra-doctor.ps1" @args
