@echo off
REM archon-os local wrapper
REM This script ensures archon-os runs from your project directory

set PROJECT_DIR=%CD%
set PWD=%PROJECT_DIR%
set CLAUDE_WORKING_DIR=%PROJECT_DIR%

REM Try to find archon-os binary
REM Check common locations for npm/npx installations

REM 1. Local node_modules (npm install archon-os)
if exist "%PROJECT_DIR%\node_modules\.bin\archon-os.cmd" (
  cd /d "%PROJECT_DIR%"
  "%PROJECT_DIR%\node_modules\.bin\archon-os.cmd" %*
  exit /b %ERRORLEVEL%
)

REM 2. Parent directory node_modules (monorepo setup)
if exist "%PROJECT_DIR%\..\node_modules\.bin\archon-os.cmd" (
  cd /d "%PROJECT_DIR%"
  "%PROJECT_DIR%\..\node_modules\.bin\archon-os.cmd" %*
  exit /b %ERRORLEVEL%
)

REM 3. Global installation (npm install -g archon-os)
where archon-os >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  cd /d "%PROJECT_DIR%"
  archon-os %*
  exit /b %ERRORLEVEL%
)

REM 4. Fallback to npx (will download if needed)
cd /d "%PROJECT_DIR%"
npx archon-os@latest %*
