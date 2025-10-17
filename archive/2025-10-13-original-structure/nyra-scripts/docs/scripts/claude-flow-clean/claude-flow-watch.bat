@echo off
REM Claude-Flow Watch Mode Script
REM Monitors raw-documents folder and auto-processes new files

setlocal enabledelayedexpansion

cd /d "C:\Dev\DevProjects\Personal-Projects\Project-Nyra\Cleaning-Setup"

echo 👁️  Starting Claude-Flow Document Watch Mode
echo =============================================
echo Monitoring: %CD%\raw-documents\
echo Auto-processing: Enabled
echo Press Ctrl+C to stop watching
echo.

REM Create batch file for processing
echo @echo off > temp_process.bat
echo echo 🔄 Processing new document... >> temp_process.bat
echo cd /d "%CD%" >> temp_process.bat
echo npx claude-flow@alpha run workflows/clean-documents.yaml --claude ^|^| python scripts\document_processor.py >> temp_process.bat
echo echo ✅ Document processing complete >> temp_process.bat
echo echo. >> temp_process.bat

REM Start the Python watcher
echo Starting Python file watcher...
python -c "
import time
import os
import subprocess
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class DocumentHandler(FileSystemEventHandler):
    def __init__(self):
        self.processing = False
        self.supported_extensions = {'.pdf', '.docx', '.txt', '.md', '.csv', '.json'}
        
    def on_created(self, event):
        if event.is_directory:
            return
            
        file_path = Path(event.src_path)
        if file_path.suffix.lower() in self.supported_extensions:
            print(f'📄 New document detected: {file_path.name}')
            self.process_document(file_path)
    
    def on_moved(self, event):
        if event.is_directory:
            return
            
        file_path = Path(event.dest_path)
        if file_path.suffix.lower() in self.supported_extensions:
            print(f'📄 Document moved to folder: {file_path.name}')
            self.process_document(file_path)
    
    def process_document(self, file_path):
        if self.processing:
            print('⏳ Already processing, queuing document...')
            return
            
        try:
            self.processing = True
            print(f'🚀 Starting processing of: {file_path.name}')
            
            # Wait for file to be fully written
            time.sleep(2)
            
            # Run the processing batch file
            result = subprocess.run(['temp_process.bat'], 
                                  capture_output=True, text=True, shell=True)
            
            if result.returncode == 0:
                print(f'✅ Successfully processed: {file_path.name}')
            else:
                print(f'❌ Failed to process: {file_path.name}')
                print(f'Error: {result.stderr}')
                
        except Exception as e:
            print(f'💥 Error processing {file_path.name}: {e}')
        finally:
            self.processing = False
            print('👁️  Watching for new documents...')

# Set up the observer
raw_docs_path = 'raw-documents'
if not os.path.exists(raw_docs_path):
    os.makedirs(raw_docs_path)
    print(f'📁 Created directory: {raw_docs_path}')

event_handler = DocumentHandler()
observer = Observer()
observer.schedule(event_handler, raw_docs_path, recursive=False)

print(f'👁️  Watching directory: {os.path.abspath(raw_docs_path)}')
print('📄 Supported formats: PDF, DOCX, TXT, MD, CSV, JSON')
print('🔄 Auto-processing: Enabled')
print()

observer.start()

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print()
    print('🛑 Stopping document watcher...')
    observer.stop()
    
observer.join()
print('✅ Document watcher stopped')
"

REM Clean up
del temp_process.bat 2>nul

echo.
echo 📊 Watch Mode Summary:
echo =====================
echo • Monitored directory: %CD%\raw-documents\
echo • Processed documents: %CD%\cleaned-documents\
echo • Processing reports: %CD%\reports\
echo • Error logs: %CD%\logs\
echo.
echo 💡 Tips:
echo • Drop files into raw-documents folder for auto-processing
echo • Check cleaned-documents folder for results
echo • Review processing reports for quality metrics
echo • Use system-status.bat to check system health

pause
endlocal