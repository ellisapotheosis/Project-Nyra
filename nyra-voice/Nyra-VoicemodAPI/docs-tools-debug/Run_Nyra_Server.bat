
@echo off
cd /d "%~dp0"
echo Launching Nyra voice interface on http://localhost:8000 ...
python -m http.server 8000
pause
