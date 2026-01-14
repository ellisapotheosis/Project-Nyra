@echo off
REM Health Check for MCP Servers (Windows)
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
echo   MCP Server Health Check (%ENV_NAME%)
echo ========================================
echo.

cd ..

REM Check if containers are running
docker-compose -f %COMPOSE_FILE% ps | find "Up" >nul
if %errorlevel% neq 0 (
    echo [ERROR] No containers are running
    cd scripts
    pause
    exit /b 1
)

echo [Container Status]
docker-compose -f %COMPOSE_FILE% ps
echo.

echo [Service Health Checks]
echo ----------------------------------------

REM Check PostgreSQL
echo Checking PostgreSQL...
docker-compose -f %COMPOSE_FILE% exec -T postgres-mcp pg_isready 2>nul
if %errorlevel% equ 0 (
    echo [OK] PostgreSQL: Connected
) else (
    echo [FAIL] PostgreSQL: Not reachable
)

REM Check Redis
echo Checking Redis...
docker-compose -f %COMPOSE_FILE% exec -T redis-mcp redis-cli ping 2>nul | find "PONG" >nul
if %errorlevel% equ 0 (
    echo [OK] Redis: Connected
) else (
    echo [FAIL] Redis: Not reachable
)

echo.
echo [Resource Usage]
echo ----------------------------------------
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo.
echo ========================================
echo   Health Check Complete
echo ========================================
echo.

cd scripts
pause
