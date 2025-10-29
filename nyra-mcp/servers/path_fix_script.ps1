# Path fix script for MCP servers reorganization
param(
    [switch]$DryRun = $true
)

$root = 'C:\Dev\Tools\MCP-Servers'
$paths = @(
    'C:\Dev\Tools\MCP-Servers\GithubMCP',
    'C:\Dev\Tools\MCP-Servers\NyraTools', 
    'C:\Dev\Tools\MCP-Servers\FileSystemMCP'
)

$repl = @{
    'C:\Dev\GithubMCP' = 'C:\Dev\Tools\MCP-Servers\GithubMCP'
    'C:/Dev/GithubMCP' = 'C:/Dev/Tools/MCP-Servers/GithubMCP'
    'C:\\Dev\\GithubMCP' = 'C:\\Dev\\Tools\\MCP-Servers\\GithubMCP'
    'C:\Dev\NyraTools' = 'C:\Dev\Tools\MCP-Servers\NyraTools'
    'C:/Dev/NyraTools' = 'C:/Dev/Tools/MCP-Servers/NyraTools'
    'C:\\Dev\\NyraTools' = 'C:\\Dev\\Tools\\MCP-Servers\\NyraTools'
    'C:\Dev\NyraMCP' = 'C:\Dev\Tools\MCP-Servers\FileSystemMCP'
    'C:/Dev/NyraMCP' = 'C:/Dev/Tools/MCP-Servers/FileSystemMCP'
    'C:\\Dev\\NyraMCP' = 'C:\\Dev\\Tools\\MCP-Servers\\FileSystemMCP'
}

$ext = '*.ps1','*.psm1','*.psd1','*.ps1xml','*.bat','*.cmd','*.sh','*.py','*.ts','*.tsx','*.js','*.jsx','*.json','*.jsonc','*.yaml','*.yml','*.toml','*.ini','*.env','*.md','*Dockerfile','*.dockerignore','*.gitignore'

Write-Host "Scanning for hardcoded paths..." -ForegroundColor Yellow
$files = Get-ChildItem -Path $paths -Include $ext -Recurse -File -ErrorAction SilentlyContinue

if ($DryRun) {
    Write-Host "=== DRY RUN - REPORTING MATCHES ===" -ForegroundColor Cyan
    
    $report = foreach($f in $files){
        $t = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
        if (-not $t) { continue }
        $hits = @()
        foreach($k in $repl.Keys){
            if ($t -match [regex]::Escape($k)) { $hits += $k }
        }
        if ($hits.Count){
            [pscustomobject]@{File=$f.FullName; Matches=($hits | Select-Object -Unique) -join '; '}
        }
    }
    
    if ($report) {
        $report | Format-Table -AutoSize
        Write-Host "Found $($report.Count) files with hardcoded paths." -ForegroundColor Red
        Write-Host "Run with -DryRun:`$false to apply fixes." -ForegroundColor Yellow
    } else {
        Write-Host "No hardcoded paths found!" -ForegroundColor Green
    }
} else {
    Write-Host "=== APPLYING FIXES ===" -ForegroundColor Green
    
    $fixedCount = 0
    foreach($f in $files){
        $t = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
        if (-not $t) { continue }
        $orig = $t
        foreach($k in $repl.Keys){
            $t = $t.Replace($k, $repl[$k])
        }
        if ($t -ne $orig){
            Copy-Item -LiteralPath $f.FullName -Destination ($f.FullName + '.bak') -Force
            Set-Content -LiteralPath $f.FullName -Value $t -Encoding UTF8 -NoNewline
            Write-Host "Fixed: $($f.FullName)" -ForegroundColor Green
            $fixedCount++
        }
    }
    
    Write-Host "Fixed $fixedCount files." -ForegroundColor Cyan
    Write-Host "Running final verification..." -ForegroundColor Yellow
    
    # Run dry run again to verify
    & $PSCommandPath -DryRun
}