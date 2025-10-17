@echo off
REM Claude-Flow Workflow Execution Wrapper for Windows
REM Handles workflow execution with input/output parameters

setlocal enabledelayedexpansion

REM Change to project root directory
cd /d "C:\Dev\DevProjects\Personal-Projects\Project-Nyra"

REM Set environment variables
set CLAUDE_FLOW_ROOT=C:\Dev\DevProjects\Personal-Projects\Project-Nyra
set NODE_ENV=development

REM Parse parameters
set WORKFLOW=%1
set INPUT=%2
set OUTPUT=%3

if "%WORKFLOW%"=="" (
    echo Usage: claude-flow-workflow.bat ^<workflow^> [input] [output]
    echo.
    echo Examples:
    echo   claude-flow-workflow.bat clean-documents.yaml
    echo   claude-flow-workflow.bat clean-documents.yaml ./raw-documents ./cleaned-documents
    exit /b 1
)

REM Check if workflow file exists
if not exist "Cleaning-Setup\workflows\%WORKFLOW%" (
    if not exist "%WORKFLOW%" (
        echo Error: Workflow file not found: %WORKFLOW%
        echo Searched in: Cleaning-Setup\workflows\ and current directory
        exit /b 1
    )
)

echo Executing Claude-Flow workflow: %WORKFLOW%
if not "%INPUT%"=="" echo Input directory: %INPUT%
if not "%OUTPUT%"=="" echo Output directory: %OUTPUT%
echo Working directory: %CD%
echo.

REM Build command with /c wrapper
if "%INPUT%"=="" (
    if "%OUTPUT%"=="" (
        REM No input/output specified
        cmd /c "npx claude-flow@alpha run %WORKFLOW%"
    ) else (
        REM Only output specified
        cmd /c "npx claude-flow@alpha run %WORKFLOW% --output %OUTPUT%"
    )
) else (
    if "%OUTPUT%"=="" (
        REM Only input specified
        cmd /c "npx claude-flow@alpha run %WORKFLOW% --input %INPUT%"
    ) else (
        REM Both input and output specified
        cmd /c "npx claude-flow@alpha run %WORKFLOW% --input %INPUT% --output %OUTPUT%"
    )
)

if !ERRORLEVEL! neq 0 (
    echo.
    echo Error: Workflow execution failed
    echo Exit code: !ERRORLEVEL!
    pause
    exit /b !ERRORLEVEL!
)

echo.
echo Workflow executed successfully
endlocal