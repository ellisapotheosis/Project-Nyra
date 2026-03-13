@echo off
REM Stop MCP Servers (Windows)
REM Project Nyra

set ENV=%1
if "%ENV%"=="" set ENV=dev

if "%ENV%"=="prod" (
    set COMPOSE_FILE=docker-compose.mcp.yml
    set ENV_NAME=Production
) else if "%ENV%"=="production" (
    set COMPOSE_FILE=docker-compose.mcp.yml
    set ENV_NAME=Production
) else (
    set COMPOSE_FILE=docker-compose.mcp-dev.yml
    set ENV_NAME=Development
)

echo.
echo ========================================
echo   Stopping MCP Servers (%ENV_NAME%)
echo ========================================
echo.

cd ..
docker-compose -f %COMPOSE_FILE% down
if %errorlevel% neq 0 (
    echo [ERROR] Failed to stop MCP containers
    cd scripts
    pause
    exit /b 1
)

echo.
echo [SUCCESS] MCP Servers stopped successfully!
echo.
echo Data volumes are preserved. To remove volumes, run:
echo   docker-compose -f %COMPOSE_FILE% down -v
echo.

cd scripts
pause
