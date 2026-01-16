@echo off
REM Infisical CLI Docker Shim for Windows
REM Routes Infisical CLI commands to Docker container

setlocal enabledelayedexpansion

set CONTAINER_NAME=nyra-infisical-mcp

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
    echo Run: docker-compose -f docker-compose.infisical.yml up -d infisical-mcp
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

REM Execute Infisical command
if "%~1"=="" (
    REM No arguments - show help
    docker exec %CONTAINER_NAME% infisical --help
) else (
    REM Pass all arguments
    docker exec -e INFISICAL_PROJECT_ID=%INFISICAL_PROJECT_ID% ^
                -e INFISICAL_TOKEN=%INFISICAL_TOKEN% ^
                %CONTAINER_NAME% infisical %*
)

endlocal
exit /b %errorlevel%
