@echo off
REM NYRA Claude-Flow Quick Start Script
echo 🚀 Starting NYRA Claude-Flow Ecosystem...

cd /d "C:\Dev\DevProjects\Personal-Projects\Project-Nyra"

REM Start MCP servers
echo 📡 Starting MCP servers...
start /min cmd /c "npx claude-flow@alpha mcp start"

REM Wait a moment for servers to initialize
timeout /t 3 /nobreak > nul

REM Show status
echo 📊 System Status:
npx claude-flow@alpha status

echo ✅ NYRA Claude-Flow ecosystem is ready!
echo.
echo 📋 Quick Commands:
echo   cflow-status    - Check system status
echo   cflow-clean     - Run document cleaning workflow
echo   cflow-workflow  - Execute custom workflows
echo.
pause
