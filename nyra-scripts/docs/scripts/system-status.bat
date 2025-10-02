@echo off
REM NYRA Claude-Flow System Status Check
REM Comprehensive health check for all components

setlocal enabledelayedexpansion

set PROJECT_ROOT=C:\Dev\DevProjects\Personal-Projects\Project-Nyra
cd /d "%PROJECT_ROOT%"

echo 🔍 NYRA Claude-Flow System Status Check
echo =========================================
echo Project: %PROJECT_ROOT%
echo Timestamp: %DATE% %TIME%
echo.

REM ========== BASIC SYSTEM CHECKS ==========
echo 💻 System Environment:
echo ========================

REM PowerShell version
echo 🐚 PowerShell:
pwsh --version 2>nul && echo ✅ PowerShell 7+ Available || (echo ❌ PowerShell 7+ Missing & set HAS_ERRORS=1)
echo.

REM Node.js and npm
echo 📦 Node.js & npm:
node --version 2>nul && echo ✅ Node.js: !node --version! || (echo ❌ Node.js Missing & set HAS_ERRORS=1)
npm --version 2>nul && echo ✅ npm: !npm --version! || (echo ❌ npm Missing & set HAS_ERRORS=1)
echo.

REM Python
echo 🐍 Python:
python --version 2>nul && echo ✅ Python: !python --version! || (echo ❌ Python Missing & set HAS_ERRORS=1)
python -c "import sys; print(f'✅ Python executable: {sys.executable}')" 2>nul || (echo ❌ Python not working & set HAS_ERRORS=1)
echo.

REM UV package manager
echo 📋 UV Package Manager:
uv --version 2>nul && echo ✅ UV: !uv --version! || echo ⚠️  UV not found (optional)
echo.

REM Git
echo 🔄 Git:
git --version 2>nul && echo ✅ Git: !git --version! || (echo ❌ Git Missing & set HAS_ERRORS=1)
echo.

REM ========== MCP SERVERS STATUS ==========
echo 🤖 MCP Servers & Dependencies:
echo ===============================

REM Claude-Flow
echo 📊 Claude-Flow:
npx claude-flow@alpha --version 2>nul && echo ✅ Claude-Flow: !npx claude-flow@alpha --version! || echo ❌ Claude-Flow Missing

REM Flow-Nexus
echo 🌐 Flow-Nexus:
npm list -g flow-nexus 2>nul | findstr flow-nexus >nul && echo ✅ Flow-Nexus: Installed || echo ❌ Flow-Nexus Missing

REM FastMCP
echo ⚡ FastMCP:
npm list -g fastmcp 2>nul | findstr fastmcp >nul && echo ✅ FastMCP: Installed || echo ❌ FastMCP Missing

REM Archon MCP
echo 🏛️  Archon MCP:
npm list -g archon-mcp 2>nul | findstr archon-mcp >nul && echo ✅ Archon MCP: Installed || echo ❌ Archon MCP Missing

REM Meta-MCP
echo 🔀 Meta-MCP:
npm list -g meta-mcp 2>nul | findstr meta-mcp >nul && echo ✅ Meta-MCP: Installed || echo ❌ Meta-MCP Missing

REM RUV Tools
echo 🔧 RUV Tools:
npm list -g @ruv/cli 2>nul | findstr @ruv/cli >nul && echo ✅ RUV CLI: Installed || echo ❌ RUV CLI Missing
npm list -g ruv-swarm 2>nul | findstr ruv-swarm >nul && echo ✅ RUV Swarm: Installed || echo ❌ RUV Swarm Missing
echo.

REM ========== PYTHON DEPENDENCIES ==========
echo 🐍 Python Dependencies:
echo =======================

set PYTHON_DEPS=llama_index chromadb openai anthropic pydantic jsonschema watchdog rich typer
for %%d in (%PYTHON_DEPS%) do (
    python -c "import %%d; print('✅ %%d: OK')" 2>nul || echo ❌ %%d: Missing
)
echo.

REM ========== PROJECT STRUCTURE ==========
echo 📁 Project Structure:
echo =====================

set KEY_DIRS=Cleaning-Setup scripts .claude-flow workflows meta-mcp-config
for %%d in (%KEY_DIRS%) do (
    if exist "%%d" (echo ✅ %%d: Present) else (echo ❌ %%d: Missing & set HAS_ERRORS=1)
)
echo.

REM Critical files
set KEY_FILES=NYRA-Claude-Flow-Complete-Setup.ps1 CLAUDE-FLOW-WORKFLOW-GUIDE.md
for %%f in (%KEY_FILES%) do (
    if exist "%%f" (echo ✅ %%f: Present) else (echo ❌ %%f: Missing & set HAS_ERRORS=1)
)
echo.

REM ========== CONFIGURATION STATUS ==========
echo ⚙️  Configuration Files:
echo =========================

REM Claude-Flow config
if exist ".claude-flow\config.json" (
    echo ✅ Claude-Flow config: Present
) else (
    echo ❌ Claude-Flow config: Missing
    set HAS_ERRORS=1
)

REM Workflows
if exist "workflows\clean-documents.yaml" (
    echo ✅ Document cleaning workflow: Present
) else (
    echo ❌ Document cleaning workflow: Missing
    set HAS_ERRORS=1
)

REM Meta-MCP channels
if exist "meta-mcp-config\channels" (
    echo ✅ Meta-MCP channels: Present
    for %%f in (meta-mcp-config\channels\*.json) do echo   📄 %%~nxf
) else (
    echo ❌ Meta-MCP channels: Missing
    set HAS_ERRORS=1
)

REM LlamaIndex config
if exist "Cleaning-Setup\llamaindex.config.yaml" (
    echo ✅ LlamaIndex config: Present
) else (
    echo ❌ LlamaIndex config: Missing
    set HAS_ERRORS=1
)
echo.

REM ========== ENVIRONMENT VARIABLES ==========
echo 🌍 Environment Variables:
echo =========================

REM API Keys (check existence, not values)
echo 🔑 API Keys:
if defined OPENAI_API_KEY (echo ✅ OPENAI_API_KEY: Set) else (echo ⚠️  OPENAI_API_KEY: Not set)
if defined ANTHROPIC_API_KEY (echo ✅ ANTHROPIC_API_KEY: Set) else (echo ⚠️  ANTHROPIC_API_KEY: Not set)
if defined CLAUDE_API_KEY (echo ✅ CLAUDE_API_KEY: Set) else (echo ⚠️  CLAUDE_API_KEY: Not set)

REM NYRA environment variables
if defined NYRA_MCP_CONFIG_PATH (echo ✅ NYRA_MCP_CONFIG_PATH: Set) else (echo ⚠️  NYRA_MCP_CONFIG_PATH: Not set)
if defined NYRA_MCP_SERVERS_PATH (echo ✅ NYRA_MCP_SERVERS_PATH: Set) else (echo ⚠️  NYRA_MCP_SERVERS_PATH: Not set)

echo.

REM ========== ACTIVE PROCESSES ==========
echo 🔄 Active Processes:
echo ====================

REM Check for running MCP servers
tasklist /FI "IMAGENAME eq node.exe" 2>nul | findstr node.exe >nul && echo ✅ Node.js processes: Running || echo ⚠️  No Node.js processes found
tasklist /FI "IMAGENAME eq python.exe" 2>nul | findstr python.exe >nul && echo ✅ Python processes: Running || echo ⚠️  No Python processes found
tasklist /FI "IMAGENAME eq pwsh.exe" 2>nul | findstr pwsh.exe >nul && echo ✅ PowerShell processes: Running || echo ⚠️  No PowerShell processes found

echo.

REM ========== FINAL ASSESSMENT ==========
echo 📊 System Assessment:
echo ======================

if defined HAS_ERRORS (
    echo ❌ System Status: ISSUES DETECTED
    echo 🔧 Action Required: Run setup script or fix missing dependencies
    echo   Command: .\NYRA-Claude-Flow-Complete-Setup.ps1 -Mode install
) else (
    echo ✅ System Status: HEALTHY
    echo 🎯 Ready for: Document processing, workflow execution, MCP orchestration
)

echo.
echo 📚 Available Commands:
echo   • Setup/Repair: .\NYRA-Claude-Flow-Complete-Setup.ps1
echo   • Clean Documents: .\scripts\mcp-wrappers\claude-flow-clean.bat
echo   • Start Claude-Flow: .\scripts\mcp-wrappers\claude-flow-start.bat
echo   • Run Workflow: .\scripts\mcp-wrappers\claude-flow-workflow.bat
echo   • View Guide: notepad CLAUDE-FLOW-WORKFLOW-GUIDE.md

echo.
echo 💡 Quick Fixes:
if defined HAS_ERRORS (
    echo   1. Install missing dependencies with setup script
    echo   2. Check API keys in environment or .env file
    echo   3. Run: npm install -g claude-flow@alpha
    echo   4. Run: uv pip install llama_index chromadb
)
echo   • For API keys: Set in PowerShell profile or use secret manager
echo   • For MCP issues: Check port conflicts and configuration files
echo   • For Python issues: Verify virtual environment activation

echo.
echo 🔍 Detailed Logs:
echo   • Setup log: NYRA-Claude-Flow-Setup-Report.md
echo   • Processing logs: Cleaning-Setup\logs\
echo   • Claude-Flow logs: .claude-flow\logs\

pause
endlocal