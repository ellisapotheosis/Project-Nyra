@echo off
REM Start MCP Servers - Development Environment (Windows)
REM Project Nyra

echo.
echo ========================================
echo   Starting MCP Servers (Development)
echo ========================================
echo.

REM Check if .env file exists
if not exist "..\..\..\.env" (
    echo [ERROR] .env file not found in project root
    echo Please create .env file with required environment variables
    pause
    exit /b 1
)

REM Check required tools
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not in PATH
    pause
    exit /b 1
)

where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed or not in PATH
    pause
    exit /b 1
)

REM Create log directories
if not exist "..\logs\mcp-gemini" mkdir "..\logs\mcp-gemini"
if not exist "..\logs\mcp-claude-flow" mkdir "..\logs\mcp-claude-flow"
if not exist "..\logs\mcp-ruv-swarm" mkdir "..\logs\mcp-ruv-swarm"
if not exist "..\logs\mcp-archon" mkdir "..\logs\mcp-archon"

echo [1/3] Building Docker images...
cd ..
docker-compose -f docker-compose.mcp-dev.yml build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build Docker images
    cd scripts
    pause
    exit /b 1
)

echo.
echo [2/3] Starting MCP containers...
docker-compose -f docker-compose.mcp-dev.yml up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start MCP containers
    cd scripts
    pause
    exit /b 1
)

echo.
echo [3/3] Waiting for containers to be healthy...
timeout /t 10 /nobreak >nul

echo.
echo [SUCCESS] Checking container status...
docker-compose -f docker-compose.mcp-dev.yml ps

echo.
echo ========================================
echo   MCP Servers Started Successfully!
echo ========================================
echo.
echo Container Status:
docker-compose -f docker-compose.mcp-dev.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo.
echo View logs with:
echo   docker-compose -f docker-compose.mcp-dev.yml logs -f [service-name]
echo.
echo Stop servers with:
echo   stop-mcp.cmd
echo.

cd scripts
pause
