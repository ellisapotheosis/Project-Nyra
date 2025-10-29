@echo off
echo 🔍 NYRA Claude-Flow System Status
echo ================================

cd /d "C:\Dev\DevProjects\Personal-Projects\Project-Nyra"

echo.
echo 📊 Claude-Flow Status:
npx claude-flow@alpha status

echo.
echo 🧠 Hive-Mind Status:
npx claude-flow@alpha hive-mind status

echo.
echo 📡 MCP Servers:
npx claude-flow@alpha agents list

echo.
echo 📄 Document Processing:
python "C:\Dev\DevProjects\Personal-Projects\Project-Nyra\Cleaning-Setup\scripts\document_processor.py" --version

pause
