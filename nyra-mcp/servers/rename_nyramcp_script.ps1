# Rename NyraMCP references to FileSystemMCP
param(
    [switch]$DryRun = $true
)

$fs = Get-ChildItem 'C:\Dev\Tools\MCP-Servers\FileSystemMCP' -Recurse -File -Include *.yml,*.yaml,*.json,*.md,*.ps1,*.ts,*.js,*.py,*.bat,*.cmd -ErrorAction SilentlyContinue

if ($DryRun) {
    Write-Host "=== DRY RUN - FINDING NYRAMCP REFERENCES ===" -ForegroundColor Cyan
    
    $matchCount = 0
    foreach($f in $fs) {
        $content = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
        if (-not $content) { continue }
        
        if ($content -match '\bNyraMCP\b') {
            Write-Host "Found in: $($f.FullName.Replace('C:\Dev\Tools\MCP-Servers\FileSystemMCP\', ''))" -ForegroundColor Yellow
            $matchCount++
        }
    }
    
    if ($matchCount -gt 0) {
        Write-Host "Found NyraMCP references in $matchCount files." -ForegroundColor Red
        Write-Host "Run with -DryRun:`$false to apply renames." -ForegroundColor Yellow
    } else {
        Write-Host "No NyraMCP references found!" -ForegroundColor Green
    }
} else {
    Write-Host "=== APPLYING NYRAMCP -> FILESYSTEMMCP RENAMES ===" -ForegroundColor Green
    
    $fixedCount = 0
    foreach($f in $fs) {
        $t = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
        if (-not $t) { continue }
        
        if ($t -match '\bNyraMCP\b') {
            $orig = $t
            $t = $t -replace '\bNyraMCP\b', 'FileSystemMCP'
            
            if ($t -ne $orig) {
                Copy-Item $f.FullName ($f.FullName + '.bak') -Force
                Set-Content $f.FullName $t -Encoding UTF8 -NoNewline
                Write-Host "Renamed in: $($f.FullName)" -ForegroundColor Green
                $fixedCount++
            }
        }
    }
    
    Write-Host "Fixed $fixedCount files." -ForegroundColor Cyan
    Write-Host "Running final verification..." -ForegroundColor Yellow
    
    # Run dry run again to verify
    & $PSCommandPath -DryRun
}