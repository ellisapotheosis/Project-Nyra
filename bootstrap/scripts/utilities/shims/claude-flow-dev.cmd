@echo off
REM Claude Flow Development Mode Docker Shim for Windows
REM Same container but with development environment secrets

setlocal enabledelayedexpansion

set CONTAINER_NAME=nyra-claude-flow-mcp
set INFISICAL_ENV=development
set INFISICAL_PATH=/nyra/claude-flow/dev

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop.
    exit /b 1
)

REM Check container status
for /f "tokens=*" %%i in ('docker ps -a -f "name=%CONTAINER_NAME%" --format "{{.Status}}"') do set CONTAINER_STATUS=%%i

if "%CONTAINER_STATUS%"=="" (
    echo [ERROR] Container %CONTAINER_NAME% does not exist.
    echo Run: docker-compose -f docker-compose.infisical.yml up -d claude-flow-mcp
    exit /b 1
)

REM Auto-start if container is stopped
echo %CONTAINER_STATUS% | findstr /C:"Up" >nul
if errorlevel 1 (
    echo [INFO] Starting container %CONTAINER_NAME%...
    docker start %CONTAINER_NAME% >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Failed to start container %CONTAINER_NAME%
        exit /b 1
    )
    timeout /t 3 /nobreak >nul
    echo [INFO] Container started successfully.
)

REM Execute command with dev environment Infisical secrets
if "%~1"=="" (
    REM No arguments - show help
    docker exec %CONTAINER_NAME% npx @claude-flow/cli@latest --help
) else (
    REM Pass all arguments with Infisical dev environment
    docker exec -e INFISICAL_PROJECT_ID=%INFISICAL_PROJECT_ID% ^
                -e INFISICAL_TOKEN=%INFISICAL_TOKEN% ^
                -e CLAUDE_FLOW_MODE=development ^
                %CONTAINER_NAME% ^
                sh -c "infisical run --env=%INFISICAL_ENV% --path=%INFISICAL_PATH% -- npx @claude-flow/cli@latest %*"
)

endlocal
exit /b %errorlevel%
