@echo off
REM Comprehensive SQLite/archon-os Diagnostics and Fix Script
REM Run from: cmd.exe /c "C:\Dev\Projects\Repos\Project-Nyra\scripts\diagnose-fix.cmd"

setlocal enabledelayedexpansion
set "PROJECTROOT=C:\Dev\Projects\Repos\Project-Nyra"
cd /d "%PROJECTROOT%"

echo.
echo ========================================================================
echo          PROJECT-NYRA COMPREHENSIVE DIAGNOSTICS AND FIXES
echo ========================================================================
echo.

REM 1. CHECK ENVIRONMENT
echo [STEP 1] Checking Node.js/npm/pnpm Environment
echo ────────────────────────────────────────────────────────────────────
node --version
npm --version
pnpm --version
volta --version 2>nul || echo volta: NOT FOUND
echo.

REM 2. CHECK BETTER-SQLITE3
echo [STEP 2] Checking better-sqlite3 Status
echo ────────────────────────────────────────────────────────────────────
if exist "node_modules\better-sqlite3" (
    echo [OK] better-sqlite3 is INSTALLED
    if exist "node_modules\better-sqlite3\build\Release\better_sqlite3.node" (
        echo [OK] Native binding found
    ) else (
        echo [WARN] Native binding MISSING - will rebuild
    )
) else (
    echo [WARN] better-sqlite3 NOT INSTALLED
)
echo.

REM 3. TEST BETTER-SQLITE3 IMPORT
echo [STEP 3] Testing better-sqlite3 Import
echo ────────────────────────────────────────────────────────────────────
node -e "try { require('better-sqlite3'); console.log('[OK] better-sqlite3 loaded successfully'); } catch(e) { console.log('[ERROR]', e.message); process.exit(1); }" 2>&1
if errorlevel 1 (
    echo [ERROR] better-sqlite3 import failed - will rebuild
    set "NEEDS_REBUILD=1"
)
echo.

REM 4. CHECK NODE_MODULES STATE
echo [STEP 4] Checking node_modules Installation State
echo ────────────────────────────────────────────────────────────────────
if not exist "node_modules" (
    echo [WARN] node_modules NOT FOUND - installing...
    call pnpm install
) else (
    echo [OK] node_modules directory exists
)
echo.

REM 5. REBUILD BETTER-SQLITE3 IF NEEDED
if defined NEEDS_REBUILD (
    echo [STEP 5] Rebuilding better-sqlite3
    echo ────────────────────────────────────────────────────────────────────
    echo Clearing npm cache...
    call npm cache clean --force
    echo Installing with rebuild...
    call pnpm rebuild better-sqlite3
    echo Retesting import...
    node -e "require('better-sqlite3'); console.log('[OK] better-sqlite3 rebuilt successfully');" 2>&1
    if errorlevel 1 (
        echo [ERROR] Rebuild failed. Trying alternative fix...
        call npm cache clean --force
        call pnpm install --force better-sqlite3
    )
) else (
    echo [STEP 5] Skipped - better-sqlite3 already working
)
echo.

REM 6. CHECK archon-os SUBMODULE
echo [STEP 6] Checking archon-os Submodule
echo ────────────────────────────────────────────────────────────────────
if exist "submodules\archon-os" (
    echo [OK] archon-os submodule found
) else (
    echo [WARN] archon-os submodule missing - initializing...
    call git submodule update --init --recursive
)
echo.

REM 7. CHECK MCP CONFIGURATION
echo [STEP 7] Checking MCP Configuration
echo ────────────────────────────────────────────────────────────────────
if exist ".mcp.json" (
    echo [OK] .mcp.json found
) else (
    echo [WARN] .mcp.json NOT FOUND
)
echo.

REM 8. FINAL VERIFICATION
echo [STEP 8] Final Verification
echo ────────────────────────────────────────────────────────────────────
echo Testing critical imports...
node -e "const db = require('better-sqlite3')(':memory:'); console.log('[OK] SQLite functional'); process.exit(0);" 2>&1
if errorlevel 1 (
    echo [ERROR] SQLite still not working
    exit /b 1
)

echo Testing Node.js/npm setup...
npm list better-sqlite3 2>nul | findstr "better-sqlite3" >nul
if errorlevel 1 (
    echo [WARN] better-sqlite3 not in package list
)

echo.
echo ========================================================================
echo                         DIAGNOSTICS COMPLETE
echo ========================================================================
echo.
echo Next steps:
echo  1. Review output above for any [ERROR] or [WARN] entries
echo  2. If better-sqlite3 rebuilt: try running your setup scripts
echo  3. If issues persist: check build tools (Visual Studio Build Tools)
echo  4. Run: pnpm install --force && pnpm rebuild
echo.
pause
exit /b 0
