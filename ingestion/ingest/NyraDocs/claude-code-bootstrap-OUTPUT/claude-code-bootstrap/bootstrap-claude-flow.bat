@echo off
REM ========================================================================
REM Bootstrap claude-flow Repository with Configuration Files
REM ========================================================================
REM 
REM This batch file copies settings from the bootstrap package to your
REM local claude-flow repository.
REM
REM Source: C:\Dev\DevProjects\Personal-Projects\claude-code-bootstrap
REM Target: C:\Dev\DevProjects\Personal-Projects\Project-Nyra\nyra-orchestration\Claude\claude-flow
REM
REM ========================================================================

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "REPO_PATH=C:\Dev\DevProjects\Personal-Projects\Project-Nyra\nyra-orchestration\Claude\claude-flow"

echo.
echo ========================================
echo  Claude-Flow Bootstrap Script
echo ========================================
echo Source:      %SCRIPT_DIR%
echo Destination: %REPO_PATH%
echo ========================================
echo.

REM Validate repository exists
if not exist "%REPO_PATH%" (
    echo [ERROR] Repository not found at:
    echo         %REPO_PATH%
    echo.
    echo Please verify the path is correct.
    pause
    exit /b 1
)

echo [OK] Repository found
echo.

REM Validate source files
echo Validating source files...
set "ALL_VALID=1"

if exist "%SCRIPT_DIR%claude-flow\settings-alpha-all-modes.json" (
    echo [OK] Claude-Flow alpha settings
) else (
    echo [ERROR] Missing: claude-flow\settings-alpha-all-modes.json
    set "ALL_VALID=0"
)

if exist "%SCRIPT_DIR%settings.json" (
    echo [OK] Base Claude settings
) else (
    echo [WARN] Optional file missing: settings.json
)

if "%ALL_VALID%"=="0" (
    echo.
    echo [ERROR] Required files missing. Cannot proceed.
    pause
    exit /b 1
)

echo.
echo Copying files...
echo.

REM Create .claude directory if it doesn't exist
if not exist "%REPO_PATH%\.claude" (
    echo [INFO] Creating .claude directory...
    mkdir "%REPO_PATH%\.claude"
)

REM Backup existing settings if present
if exist "%REPO_PATH%\.claude\settings.json" (
    for /f "tokens=1-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do (set mytime=%%a%%b)
    set "TIMESTAMP=!mydate!-!mytime!"
    echo [INFO] Backing up existing settings.json...
    copy "%REPO_PATH%\.claude\settings.json" "%REPO_PATH%\.claude\settings.json.backup-!TIMESTAMP!" >nul
    echo        Backup created: settings.json.backup-!TIMESTAMP!
)

REM Copy alpha settings
echo.
echo [COPY] Claude-Flow alpha settings with all features
copy /Y "%SCRIPT_DIR%claude-flow\settings-alpha-all-modes.json" "%REPO_PATH%\.claude\settings.json" >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK]   Copied to: %REPO_PATH%\.claude\settings.json
) else (
    echo [ERROR] Failed to copy settings file
    pause
    exit /b 1
)

REM Copy base settings as local override (optional)
if exist "%SCRIPT_DIR%settings.json" (
    echo.
    echo [COPY] Base Claude settings (as local override)
    copy /Y "%SCRIPT_DIR%settings.json" "%REPO_PATH%\.claude\settings.local.json" >nul
    if %ERRORLEVEL% EQU 0 (
        echo [OK]   Copied to: %REPO_PATH%\.claude\settings.local.json
    )
)

REM Summary
echo.
echo ========================================
echo  Summary
echo ========================================
echo.
echo [SUCCESS] Bootstrap completed!
echo.
echo Files Updated:
echo   * Claude-Flow alpha settings with all features
if exist "%REPO_PATH%\.claude\settings.local.json" (
    echo   * Base Claude settings (as local override)
)
echo.
echo Next Steps:
echo   1. Review the copied settings in .claude\settings.json
echo   2. Customize settings if needed (Infisical project ID, etc.)
echo   3. Test claude-flow: npx claude-flow@alpha --help
echo   4. Restart Claude Code to load new settings
echo.
echo Backups: Timestamped backups saved with .backup-* extension
echo.
echo ========================================
echo.

pause
