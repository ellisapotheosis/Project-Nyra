# 🐱 PowerShell Scripts Execution Guide

## 📋 Overview
These scripts will:
1. Extract all your ZIP/7Z archives
2. Scan for cleaning/ingestion files (LlamaIndex, Archon, Claude, FastMCP, etc.)
3. Create an organized structure separating boilerplate from specialized tools

## 🚀 Step-by-Step Instructions

### Step 1: Copy Scripts to Downloads
```powershell
# First, copy the extraction_scripts folder to your Downloads
Copy-Item -Path "C:\Users\edane\OneDrive\Documents\DevProjects\Project-Nyra\extraction_scripts" -Destination "C:\Users\A1Panda\Downloads\" -Recurse
```

### Step 2: Run Extraction Script
```powershell
# Navigate to Downloads
cd C:\Users\A1Panda\Downloads

# Run the extraction script
.\extraction_scripts\1_extract_archives.ps1
```
**This will:**
- Extract all ZIP files
- Extract all 7Z files (requires 7-Zip installed)
- Create an extraction log

### Step 3: Scan Extracted Files
```powershell
# Run the scanning script
.\extraction_scripts\2_scan_extracted.ps1
```
**This will:**
- Scan all extracted folders
- Identify cleaning/ingestion files
- Create detailed reports in Project-Nyra folder

### Step 4: Prepare for Consolidation
```powershell
# Run the preparation script
.\extraction_scripts\3_prepare_for_consolidation.ps1
```
**This will:**
- Analyze the scan results
- Create a consolidation plan
- Generate the main bootstrap script in Downloads\scripts\

### Step 5: Run Main Consolidation
```powershell
# Run the main bootstrap script (created by step 4)
.\scripts\bootstrap_main.ps1
```
**This will create:**
- `all_in_one/` - Your consolidated boilerplate
- `cleaning-ingestion-systems/` - Segregated cleaning tools:
  - `llamaindex-systems/`
  - `archon-cleaning/`
  - `claude-ingestion/`
  - `fastmcp-ingestion/`
  - `graphrag-pipelines/`
  - `doc-processing/`
  - `other-cleaning/`
- `zip/` - All extracted archives moved here

## ⚠️ Prerequisites
- **7-Zip**: Required for .7z files. Download from https://www.7-zip.org/download.html
- **PowerShell Execution Policy**: You might need to run:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

## 📊 What Gets Segregated
The scripts will identify and separate:
- LlamaIndex components
- Archon cleaning systems
- Claude cleaning/ingestion tools
- FastMCP ingestion setups
- GraphRAG pipelines
- Document processing tools
- Embedding systems
- Vector store configurations
- Chunking processors
- Any other cleaning/ingestion related files

## 🎯 Final Result
After running all scripts, you'll have:
1. A clean `all_in_one` boilerplate structure
2. All cleaning/ingestion tools organized in `cleaning-ingestion-systems`
3. All archives moved to the `zip` folder
4. Detailed reports of what was found and processed

## 💡 Tips
- Run scripts in order (1, 2, 3, then bootstrap_main)
- Check logs if any extractions fail
- The scan report will show you all identified cleaning files
- You can re-run scripts safely - they won't duplicate work

Ready to consolidate your full-stack boilerplate! 🚀🐱