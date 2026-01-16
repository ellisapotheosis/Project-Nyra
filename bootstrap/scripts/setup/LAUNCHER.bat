@echo off
REM Project Nyra - Windows Quick Launcher
REM One-click deployment launcher for Windows

SETLOCAL ENABLEDELAYEDEXPANSION

COLOR 0B
ECHO ====================================
ECHO   Project Nyra Quick Launcher
ECHO   Windows Deployment Assistant
ECHO ====================================
ECHO.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    COLOR 0C
    ECHO ERROR: This script requires administrator privileges.
    ECHO Please right-click and select "Run as administrator"
    PAUSE
    EXIT /B 1
)

REM Detect current directory
SET "PROJECT_ROOT=%~dp0..\.."
ECHO Project Root: %PROJECT_ROOT%
ECHO.

REM Main Menu
:MENU
COLOR 0B
CLS
ECHO ====================================
ECHO   Project Nyra Quick Launcher
ECHO ====================================
ECHO.
ECHO   [1] Launch Bootstrap GUI
ECHO   [2] Deploy PC1 - Orchestrator
ECHO   [3] Deploy PC2 - Worker 2 (RTX 3060)
ECHO   [4] Deploy PC3 - Worker 3 (RTX 5090)
ECHO   [5] Deploy PC4 - Worker 4 (RTX 3090 Ti)
ECHO   [6] Run Health Check
ECHO   [7] Run Daily Backup
ECHO   [8] Configure Static IP
ECHO   [9] View Documentation
ECHO   [0] Exit
ECHO.
SET /P CHOICE="Select option: "

IF "%CHOICE%"=="1" GOTO LAUNCH_GUI
IF "%CHOICE%"=="2" GOTO DEPLOY_PC1
IF "%CHOICE%"=="3" GOTO DEPLOY_PC2
IF "%CHOICE%"=="4" GOTO DEPLOY_PC3
IF "%CHOICE%"=="5" GOTO DEPLOY_PC4
IF "%CHOICE%"=="6" GOTO HEALTH_CHECK
IF "%CHOICE%"=="7" GOTO BACKUP
IF "%CHOICE%"=="8" GOTO CONFIGURE_IP
IF "%CHOICE%"=="9" GOTO DOCS
IF "%CHOICE%"=="0" GOTO EXIT
GOTO MENU

:LAUNCH_GUI
CLS
ECHO Launching Bootstrap GUI...
ECHO.
CD "%PROJECT_ROOT%\bootstrap\installer"
IF NOT EXIST "node_modules" (
    ECHO Installing dependencies...
    CALL npm install
)
ECHO.
ECHO Starting GUI...
START cmd /k "npm run dev"
ECHO.
ECHO Bootstrap GUI launched in new window.
PAUSE
GOTO MENU

:DEPLOY_PC1
CLS
ECHO Deploying PC1 - Orchestrator (Mac Mini)...
ECHO.
ECHO This will:
ECHO   - Configure static IP 10.0.0.1
ECHO   - Install Docker
ECHO   - Deploy 8 orchestrator services
ECHO   - Validate health
ECHO.
SET /P CONFIRM="Continue? (Y/N): "
IF /I NOT "%CONFIRM%"=="Y" GOTO MENU

ECHO.
ECHO Running bootstrap script...
PowerShell -ExecutionPolicy Bypass -File "%PROJECT_ROOT%\scripts\bootstrap-orchestrator.ps1"

ECHO.
ECHO Deployment complete!
PAUSE
GOTO MENU

:DEPLOY_PC2
CLS
ECHO Deploying PC2 - Worker 2 (RTX 3060)...
ECHO.
ECHO This will:
ECHO   - Configure static IP 10.0.0.2
ECHO   - Install Docker + NVIDIA Container Toolkit
ECHO   - Deploy TwentyCRM, n8n, Dify
ECHO   - Validate health
ECHO.
SET /P CONFIRM="Continue? (Y/N): "
IF /I NOT "%CONFIRM%"=="Y" GOTO MENU

ECHO.
ECHO Running bootstrap script...
PowerShell -ExecutionPolicy Bypass -File "%PROJECT_ROOT%\scripts\bootstrap-worker.ps1" -WorkerRole worker-2

ECHO.
ECHO Deployment complete!
PAUSE
GOTO MENU

:DEPLOY_PC3
CLS
ECHO Deploying PC3 - Worker 3 (RTX 5090)...
ECHO.
ECHO This will:
ECHO   - Configure static IP 10.0.0.3
ECHO   - Install Docker + NVIDIA Container Toolkit
ECHO   - Deploy Ollama, Neo4j, FalkorDB
ECHO   - Pull Ollama models (10-15 minutes)
ECHO   - Validate health
ECHO.
ECHO NOTE: First-time deployment takes 15-20 minutes (model downloads)
ECHO.
SET /P CONFIRM="Continue? (Y/N): "
IF /I NOT "%CONFIRM%"=="Y" GOTO MENU

ECHO.
ECHO Running bootstrap script...
PowerShell -ExecutionPolicy Bypass -File "%PROJECT_ROOT%\scripts\bootstrap-worker.ps1" -WorkerRole worker-3

ECHO.
ECHO Deployment complete!
PAUSE
GOTO MENU

:DEPLOY_PC4
CLS
ECHO Deploying PC4 - Worker 4 (RTX 3090 Ti)...
ECHO.
ECHO This will:
ECHO   - Configure static IP 10.0.0.4
ECHO   - Install Docker + NVIDIA Container Toolkit
ECHO   - Deploy Prometheus, Grafana, Loki
ECHO   - Validate health
ECHO.
SET /P CONFIRM="Continue? (Y/N): "
IF /I NOT "%CONFIRM%"=="Y" GOTO MENU

ECHO.
ECHO Running bootstrap script...
PowerShell -ExecutionPolicy Bypass -File "%PROJECT_ROOT%\scripts\bootstrap-worker.ps1" -WorkerRole worker-4

ECHO.
ECHO Deployment complete!
PAUSE
GOTO MENU

:HEALTH_CHECK
CLS
ECHO Running comprehensive health check...
ECHO Testing all 22 services across 4 PCs...
ECHO.
PowerShell -ExecutionPolicy Bypass -File "%PROJECT_ROOT%\scripts\health-check-all.ps1"

ECHO.
PAUSE
GOTO MENU

:BACKUP
CLS
ECHO Running daily backup...
ECHO.
ECHO This will backup:
ECHO   - PostgreSQL databases (TwentyCRM, n8n, Dify)
ECHO   - Redis data
ECHO   - AgentDB vector database
ECHO   - Environment configuration
ECHO   - n8n workflows
ECHO   - Docker volumes
ECHO.
SET /P CONFIRM="Continue? (Y/N): "
IF /I NOT "%CONFIRM%"=="Y" GOTO MENU

ECHO.
PowerShell -ExecutionPolicy Bypass -File "%PROJECT_ROOT%\scripts\backup-daily.ps1"

ECHO.
ECHO Backup complete!
PAUSE
GOTO MENU

:CONFIGURE_IP
CLS
ECHO Configure Static IP
ECHO.
ECHO Select PC role:
ECHO   [1] PC1 - Orchestrator (10.0.0.1)
ECHO   [2] PC2 - Worker 2 (10.0.0.2)
ECHO   [3] PC3 - Worker 3 (10.0.0.3)
ECHO   [4] PC4 - Worker 4 (10.0.0.4)
ECHO   [0] Back
ECHO.
SET /P PC_CHOICE="Select PC: "

IF "%PC_CHOICE%"=="1" SET "PC_ROLE=PC1"
IF "%PC_CHOICE%"=="2" SET "PC_ROLE=PC2"
IF "%PC_CHOICE%"=="3" SET "PC_ROLE=PC3"
IF "%PC_CHOICE%"=="4" SET "PC_ROLE=PC4"
IF "%PC_CHOICE%"=="0" GOTO MENU

IF NOT DEFINED PC_ROLE (
    ECHO Invalid selection!
    PAUSE
    GOTO CONFIGURE_IP
)

ECHO.
ECHO Configuring %PC_ROLE%...
PowerShell -ExecutionPolicy Bypass -File "%PROJECT_ROOT%\scripts\configure-static-ip.ps1" -PCRole %PC_ROLE%

ECHO.
PAUSE
GOTO MENU

:DOCS
CLS
ECHO Opening documentation...
ECHO.
ECHO Available documentation:
ECHO   [1] Complete Setup Guide
ECHO   [2] Master Troubleshooting
ECHO   [3] Claude Flow Workflows
ECHO   [4] Version Comparison
ECHO   [5] Quick Start
ECHO   [0] Back
ECHO.
SET /P DOC_CHOICE="Select document: "

IF "%DOC_CHOICE%"=="1" START "" "%PROJECT_ROOT%\docs\COMPLETE-SETUP-GUIDE.md"
IF "%DOC_CHOICE%"=="2" START "" "%PROJECT_ROOT%\docs\MASTER-TROUBLESHOOTING.md"
IF "%DOC_CHOICE%"=="3" START "" "%PROJECT_ROOT%\docs\workflows\TOP-15-CLAUDE-FLOW-WORKFLOWS.md"
IF "%DOC_CHOICE%"=="4" START "" "%PROJECT_ROOT%\docs\CLAUDE-FLOW-VERSION-COMPARISON.md"
IF "%DOC_CHOICE%"=="5" START "" "%PROJECT_ROOT%\NYRA-AIO-Bootstrap\QUICK-START.md"
IF "%DOC_CHOICE%"=="0" GOTO MENU

ECHO.
ECHO Document opened in default editor.
PAUSE
GOTO MENU

:EXIT
CLS
COLOR 07
ECHO Thank you for using Project Nyra Quick Launcher!
ECHO.
ECHO For support: support@ratehunter.net
ECHO GitHub: https://github.com/yourusername/Project-Nyra
ECHO.
PAUSE
EXIT /B 0
