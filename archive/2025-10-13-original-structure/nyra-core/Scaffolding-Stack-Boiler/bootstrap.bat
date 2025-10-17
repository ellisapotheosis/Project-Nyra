@echo off
setlocal enableextensions
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0bootstrap.ps1"
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [!] Bootstrap failed with exit code %ERRORLEVEL%.
  pause
)
endlocal
