@echo off
REM PROJECT NYRA - ONE-CLICK SETUP
REM Double-click this file to start autonomous deployment

echo.
echo ========================================
echo   PROJECT NYRA - AUTONOMOUS SETUP
echo ========================================
echo.
echo This will set up everything while you sleep.
echo Estimated time: 4-8 hours
echo.
echo Press any key to continue, or Ctrl+C to cancel...
pause > nul

echo.
echo Starting PowerShell setup script...
echo.

PowerShell -NoProfile -ExecutionPolicy Bypass -Command "& '%~dp0setup-autonomous.ps1'"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   SETUP INITIATED SUCCESSFULLY
    echo ========================================
    echo.
    echo You can now close this window and go to sleep.
    echo Check progress in: setup-transcript.log
    echo.
) else (
    echo.
    echo ========================================
    echo   SETUP FAILED
    echo ========================================
    echo.
    echo Check setup-errors.log for details
    echo.
)

pause
