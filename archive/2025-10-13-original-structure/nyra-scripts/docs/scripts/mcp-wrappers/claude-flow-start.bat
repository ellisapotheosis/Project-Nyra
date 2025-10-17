@echo off
REM Claude-Flow Start Command Wrapper for Windows
REM Supports the /c command requirement for claude-flow MCP servers

setlocal enabledelayedexpansion

REM Change to project root directory
cd /d "C:\Dev\DevProjects\Personal-Projects\Project-Nyra"

REM Set environment variables
set CLAUDE_FLOW_ROOT=C:\Dev\DevProjects\Personal-Projects\Project-Nyra
set CLAUDE_FLOW_CHANNELS=orchestration,workflows,documents
set NODE_ENV=development

REM Default channel if not provided
set CHANNEL=%1
if "%CHANNEL%"=="" set CHANNEL=orchestration

echo Starting Claude-Flow MCP server with channel: %CHANNEL%
echo Working directory: %CD%

REM Use /c wrapper as required by claude-flow
cmd /c "npx claude-flow@alpha mcp start --channel %CHANNEL%"

if !ERRORLEVEL! neq 0 (
    echo Error: Failed to start claude-flow MCP server
    echo Exit code: !ERRORLEVEL!
    pause
    exit /b !ERRORLEVEL!
)

echo Claude-Flow MCP server started successfully
endlocal