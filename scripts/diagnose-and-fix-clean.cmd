@echo off
REM Clean Diagnostics and Fix Script - ASCII Only
REM No special characters to avoid encoding issues

setlocal enabledelayedexpansion
set "PROJECTROOT=C:\Dev\Projects\Repos\Project-Nyra"
cd /d "%PROJECTROOT%"

echo.
echo ==============================================================
echo      PROJECT-NYRA DIAGNOSTICS AND FIXES
echo ==============================================================
echo.
echo Working Directory: %cd%
echo.

REM 1. CHECK ENVIRONMENT
echo [STEP 1] Node.js Environment
echo ======================================================
echo.
node --version
npm --version
pnpm --version
volta --version 2>nul || echo volta: CHECK FAILED
echo.

REM 2. CHECK IF node_modules EXISTS
echo [STEP 2] Node Modules Status
echo ======================================================
echo.
if exist "node_modules" (
    echo [OK] node_modules exists
    if exist "node_modules\better-sqlite3" (
        echo [OK] better-sqlite3 is installed
    ) else (
        echo [WARN] better-sqlite3 not found in node_modules
    )
) else (
    echo [CRITICAL] node_modules NOT FOUND - must install first
    echo Running: pnpm install
    echo.
    call pnpm install
    if !errorlevel! neq 0 (
        echo [ERROR] pnpm install failed with code !errorlevel!
    ) else (
        echo [OK] pnpm install completed successfully
    )
)
echo.

REM 3. TEST BETTER-SQLITE3
echo [STEP 3] Testing better-sqlite3
echo ======================================================
echo.
node -e "try { const db = require('better-sqlite3')(':memory:'); console.log('[OK] better-sqlite3 works'); } catch(e) { console.log('[ERROR] ' + e.message); process.exit(1); }" 2>&1
if !errorlevel! neq 0 (
    echo.
    echo [WARN] better-sqlite3 import failed - will rebuild
    echo Running: pnpm rebuild better-sqlite3
    echo.
    call npm cache clean --force
    call pnpm rebuild better-sqlite3
    if !errorlevel! neq 0 (
        echo [ERROR] Rebuild failed
        echo Trying alternative: pnpm install --force
        call pnpm install --force better-sqlite3
    )
)
echo.

REM 4. CHECK CLAUDE-FLOW
echo [STEP 4] Claude-Flow Submodule
echo ======================================================
echo.
if exist "submodules\claude-flow" (
    echo [OK] claude-flow submodule exists
) else (
    echo [WARN] claude-flow submodule not found
    echo Initializing submodules...
    call git submodule update --init --recursive
)
echo.

REM 5. CHECK MCP CONFIGURATION
echo [STEP 5] MCP Configuration
echo ======================================================
echo.
if exist ".mcp.json" (
    echo [OK] .mcp.json exists
) else (
    echo [WARN] .mcp.json not found
)
if exist ".mcp.json.development" (
    echo [OK] .mcp.json.development exists
) else (
    echo [WARN] .mcp.json.development not found
)
echo.

REM 6. VERIFY CRITICAL PACKAGES
echo [STEP 6] Critical Package Verification
echo ======================================================
echo.
setlocal disabledelayedexpansion
npm list turbo 2>nul | find "turbo" >nul && echo [OK] turbo installed || echo [WARN] turbo not found
npm list typescript 2>nul | find "typescript" >nul && echo [OK] typescript installed || echo [WARN] typescript not found
npm list better-sqlite3 2>nul | find "better-sqlite3" >nul && echo [OK] better-sqlite3 in npm list || echo [WARN] better-sqlite3 not in npm list
setlocal enabledelayedexpansion
echo.

REM 7. FINAL STATUS
echo [STEP 7] Final Verification
echo ======================================================
echo.
node -e "const db = require('better-sqlite3')(':memory:'); console.log('[SUCCESS] All systems operational');" 2>&1
if !errorlevel! neq 0 (
    echo [FAILURE] SQLite still not working - manual intervention needed
    echo.
    echo RECOMMENDED FIXES:
    echo 1. Install Visual Studio Build Tools:
    echo    winget install Microsoft.VisualStudio.2022.BuildTools
    echo 2. Clear and reinstall everything:
    echo    pnpm store prune
    echo    pnpm install --force
    echo 3. Check Node.js version - should be v20 or v24:
    echo    volta pin node@20
    echo    volta pin pnpm@latest
    exit /b 1
) else (
    echo [SUCCESS] All diagnostics passed
)
echo.
echo ==============================================================
echo                  DIAGNOSTICS COMPLETE
echo ==============================================================
echo.
