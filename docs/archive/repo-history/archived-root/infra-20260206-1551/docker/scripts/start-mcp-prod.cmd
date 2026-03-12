@echo off
REM Start MCP Servers - Production Environment (Windows)
REM Project Nyra

echo.
echo ========================================
echo   Starting MCP Servers (Production)
echo ========================================
echo.

REM Check if .env file exists
if not exist "..\..\..\.env" (
    echo [ERROR] .env file not found in project root
    echo Please create .env file with required environment variables
    pause
    exit /b 1
)

REM Check required environment variables
setlocal enabledelayedexpansion
set "MISSING_VARS="

for /f "tokens=*" %%i in ('type "..\..\..\.env" ^| findstr /v "^#"') do set %%i

if "!GOOGLE_GEMINI_API_KEY!"=="" set MISSING_VARS=!MISSING_VARS! GOOGLE_GEMINI_API_KEY
if "!ANTHROPIC_API_KEY!"=="" set MISSING_VARS=!MISSING_VARS! ANTHROPIC_API_KEY
if "!SUPABASE_URL!"=="" set MISSING_VARS=!MISSING_VARS! SUPABASE_URL
if "!SUPABASE_SERVICE_KEY!"=="" set MISSING_VARS=!MISSING_VARS! SUPABASE_SERVICE_KEY
if "!MCP_DB_PASSWORD!"=="" set MISSING_VARS=!MISSING_VARS! MCP_DB_PASSWORD
if "!MCP_REDIS_PASSWORD!"=="" set MISSING_VARS=!MISSING_VARS! MCP_REDIS_PASSWORD

if not "!MISSING_VARS!"=="" (
    echo [ERROR] Missing required environment variables:!MISSING_VARS!
    pause
    exit /b 1
)

REM Check Docker
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not in PATH
    pause
    exit /b 1
)

echo [1/3] Building Docker images (production)...
cd ..
docker-compose -f docker-compose.mcp.yml build --no-cache
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build Docker images
    cd scripts
    pause
    exit /b 1
)

echo.
echo [2/3] Starting MCP containers...
docker-compose -f docker-compose.mcp.yml up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start MCP containers
    cd scripts
    pause
    exit /b 1
)

echo.
echo [3/3] Waiting for containers to be healthy (30 seconds)...
timeout /t 30 /nobreak >nul

echo.
echo [SUCCESS] Checking container health...
docker-compose -f docker-compose.mcp.yml ps

echo.
echo ========================================
echo   MCP Servers Started (Production)!
echo ========================================
echo.
echo Container Status:
docker-compose -f docker-compose.mcp.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo.
echo View logs with:
echo   docker-compose -f docker-compose.mcp.yml logs -f [service-name]
echo.
echo Monitor resources:
echo   docker stats
echo.
echo Stop servers with:
echo   stop-mcp.cmd prod
echo.
echo [WARNING] Production Mode Active
echo Logs are in /var/log/nyra/
echo.

cd scripts
pause
