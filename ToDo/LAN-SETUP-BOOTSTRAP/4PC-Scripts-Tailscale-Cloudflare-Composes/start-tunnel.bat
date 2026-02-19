@echo off
REM Start Project Nyra Cloudflared Tunnel
REM This script runs the orchestrator tunnel with the essential config

cd "C:\Users\edane\OneDrive\LANShare\cloudflared-configs"

REM Start cloudflared tunnel (run in background)
start "Cloudflared Tunnel - Project Nyra" cmd /k cloudflared tunnel --config orchestrator-essential.yml run

REM Keep the window open if there's an error
if errorlevel 1 (
    echo Error starting tunnel
    pause
)
