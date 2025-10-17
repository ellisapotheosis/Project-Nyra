@echo off
REM Claude-Flow Document Cleaning Batch Script
REM Runs the complete NYRA document cleaning workflow

setlocal enabledelayedexpansion

REM Change to Cleaning-Setup directory
cd /d "C:\Dev\DevProjects\Personal-Projects\Project-Nyra\Cleaning-Setup"

REM Set environment variables
set CLAUDE_FLOW_ROOT=C:\Dev\DevProjects\Personal-Projects\Project-Nyra
set CLAUDE_FLOW_WORKSPACE=C:\Dev\DevProjects\Personal-Projects\Project-Nyra\Cleaning-Setup
set NODE_ENV=development

echo 📄 Starting NYRA Document Cleaning Workflow
echo =============================================
echo Working directory: %CD%
echo.

REM Check if raw-documents directory has files
if not exist "raw-documents\*" (
    echo ⚠️  No documents found in raw-documents directory
    echo Please place documents to process in: %CD%\raw-documents\
    echo.
    pause
    exit /b 1
)

REM Count files to process
for /f %%A in ('dir /b raw-documents\* 2^>nul ^| find /c /v ""') do set FILE_COUNT=%%A
echo 📊 Found %FILE_COUNT% files to process
echo.

REM Method 1: Try claude-flow workflow execution
echo 🔄 Method 1: Running claude-flow workflow...
cmd /c "npx claude-flow@alpha run workflows/clean-documents.yaml --claude"

if !ERRORLEVEL! equ 0 (
    echo ✅ Claude-flow workflow completed successfully
    goto :show_results
) else (
    echo ⚠️  Claude-flow workflow failed, trying Python method...
)

REM Method 2: Direct Python execution
echo.
echo 🐍 Method 2: Running Python document processor...
python scripts\document_processor.py

if !ERRORLEVEL! equ 0 (
    echo ✅ Python document processing completed successfully
    goto :show_results
) else (
    echo ❌ Python processing also failed
    goto :error_handling
)

:show_results
echo.
echo 📊 Processing Results:
echo ======================

REM Count processed files
if exist "cleaned-documents\*" (
    for /f %%A in ('dir /b cleaned-documents\* 2^>nul ^| find /c /v ""') do set PROCESSED_COUNT=%%A
    echo ✅ Processed documents: !PROCESSED_COUNT!
) else (
    set PROCESSED_COUNT=0
    echo ❌ No processed documents found
)

REM Check for reports
if exist "reports\*" (
    for /f %%A in ('dir /b reports\* 2^>nul ^| find /c /v ""') do set REPORT_COUNT=%%A
    echo 📄 Generated reports: !REPORT_COUNT!
    echo 📁 Latest report: 
    dir /b /od reports\*.json 2>nul | findstr /E ".json" | tail -1
) else (
    echo 📄 No reports generated
)

REM Check vector store
if exist "vector_store\*" (
    echo 🗄️  Vector store: Updated
) else (
    echo 🗄️  Vector store: Not created
)

echo.
echo 📁 Output Locations:
echo   • Cleaned documents: %CD%\cleaned-documents\
echo   • Processing reports: %CD%\reports\
echo   • Vector database: %CD%\vector_store\
echo   • Processing logs: %CD%\logs\

goto :end

:error_handling
echo.
echo 🚨 Error Handling:
echo ==================
echo Both claude-flow and Python processing methods failed.
echo.
echo 🔧 Troubleshooting Steps:
echo 1. Check that all dependencies are installed
echo 2. Verify API keys are set (OPENAI_API_KEY, ANTHROPIC_API_KEY)
echo 3. Ensure input files are in supported formats (PDF, DOCX, TXT, MD, CSV)
echo 4. Check logs in: %CD%\logs\
echo.
echo 📋 Quick fixes:
echo   • Run setup script: cd .. ^&^& .\NYRA-Claude-Flow-Complete-Setup.ps1 -Mode validate
echo   • Check system status: cd .. ^&^& .\scripts\system-status.bat
echo   • Manual Python test: python -c "import llama_index; print('LlamaIndex OK')"
echo.

:end
echo.
echo 🎯 Next Steps:
if !PROCESSED_COUNT! gtr 0 (
    echo   • Review processed documents in cleaned-documents folder
    echo   • Check processing reports for quality scores
    echo   • Query the vector database for document search
    echo   • Run additional workflows on the cleaned data
) else (
    echo   • Check error logs and troubleshoot issues
    echo   • Verify input document formats are supported
    echo   • Ensure all dependencies are properly installed
)

echo.
echo 📚 For more help:
echo   • Workflow guide: ..\CLAUDE-FLOW-WORKFLOW-GUIDE.md
echo   • Setup report: ..\NYRA-Claude-Flow-Setup-Report.md
echo   • System status: ..\scripts\system-status.bat

pause
endlocal