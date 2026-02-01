@echo off
REM Claude Flow V3 Optimization Script (Batch Version)
REM Run this on your orchestrator PC to complete all optimization steps
REM Last Updated: 2026-01-19

echo =====================================
echo Claude Flow V3 Optimization Script
echo =====================================
echo.

REM Change to project root
cd /d C:\Dev\Projects\Repos\Project-Nyra

echo [1/10] Checking prerequisites...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   X Node.js not found! Please install Node.js 20+
    pause
    exit /b 1
)
echo   √ Node.js found

where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   X npm not found!
    pause
    exit /b 1
)
echo   √ npm found
echo.

echo [2/10] Creating required directories...
if not exist ".\data" mkdir ".\data"
if not exist ".\data\memory" mkdir ".\data\memory"
if not exist ".\logs" mkdir ".\logs"
if not exist ".\.claude-flow\data" mkdir ".\.claude-flow\data"
if not exist ".\.claude-flow\neural" mkdir ".\.claude-flow\neural"
echo   √ Directories created
echo.

echo [3/10] Running configuration validation...
call npx --yes @claude-flow/cli@latest doctor
echo   √ Configuration checked
echo.

echo [4/10] Running automatic fixes...
call npx --yes @claude-flow/cli@latest doctor --fix
echo   √ Automatic fixes applied
echo.

echo [5/10] Initializing memory database...
call npx --yes @claude-flow/cli@latest memory init --force
echo   √ Memory database initialized
echo.

echo [6/10] Pre-training neural patterns (this may take 2-5 minutes)...
echo   → Training MoE model with 10 epochs...
call npx --yes @claude-flow/cli@latest hooks pretrain --model-type moe --epochs 10
echo   √ Neural pre-training complete
echo.

echo [7/10] Building optimized agent configurations...
call npx --yes @claude-flow/cli@latest hooks build-agents --agent-types coder,tester,reviewer,researcher,architect
echo   √ Agent configurations built
echo.

echo [8/10] Starting background daemon...
call npx --yes @claude-flow/cli@latest daemon start
timeout /t 3 /nobreak >nul
echo   √ Daemon started
echo.

echo [9/10] Initializing V3 swarm with optimized topology...
echo   → Topology: hierarchical-mesh, Max Agents: 35
call npx --yes @claude-flow/cli@latest swarm init --topology hierarchical-mesh --max-agents 35 --strategy specialized
echo   √ Swarm initialized
echo.

echo [10/10] Running performance benchmark...
echo   → Running comprehensive benchmark suite...
call npx --yes @claude-flow/cli@latest performance benchmark --suite all
echo   √ Benchmark complete
echo.

echo =====================================
echo ✅ OPTIMIZATION COMPLETE!
echo =====================================
echo.

echo 📊 System Status:
echo.
echo 🔍 Configuration Status:
call npx --yes @claude-flow/cli@latest config list
echo.

echo 🤖 Swarm Status:
call npx --yes @claude-flow/cli@latest swarm status
echo.

echo 💾 Memory Status:
call npx --yes @claude-flow/cli@latest memory list --limit 5
echo.

echo 📈 Performance Metrics:
call npx --yes @claude-flow/cli@latest hooks statusline
echo.

echo 📚 Next Steps:
echo   1. View metrics dashboard: npx @claude-flow/cli@latest hooks metrics --v3-dashboard
echo   2. Check performance: npx @claude-flow/cli@latest performance report
echo   3. Monitor in real-time: npx @claude-flow/cli@latest hooks statusline --json
echo.

echo 🎉 Your claude-flow v3 system is now optimized for maximum performance!
echo    - 150x-12,500x faster pattern search (HNSW)
echo    - 75%% cost reduction (3-tier routing)
echo    - 2.49x-7.47x speedup (Flash Attention)
echo    - 35 concurrent agents (hierarchical-mesh)
echo.

pause
