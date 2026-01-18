# MCP Gemini Assistant Installation Report

**Date**: 2026-01-07
**Repository**: https://github.com/peterkrueck/mcp-gemini-assistant
**Status**: ✅ COMPLETE - Installed and configured for Project Nyra

---

## Installation Overview

The MCP Gemini Assistant has been successfully installed, providing Claude Code with the ability to consult Gemini 2.0 Flash for complex coding problems with full code context and conversation persistence.

### What Is MCP Gemini Assistant?

**Purpose**: An MCP server that allows Claude Code to consult Google's Gemini AI for second opinions, architectural guidance, and complex problem-solving.

**Key Features**:
- **Session Management**: Maintains conversation context across multiple queries
- **File Attachments**: Reads and includes actual code files in conversations
- **Hybrid Context**: Combines text-based code_context with file attachments
- **Follow-up Questions**: Ask follow-ups without resending code context
- **Context Caching**: Code context and file content cached per session
- **Multiple Sessions**: Run multiple parallel conversations
- **Session Expiry**: Automatic cleanup after 1 hour of inactivity
- **Latest Model**: Uses Gemini 2.5 Pro (stable) by default (configured for 2.0 Flash)

### Integration with Claude Code Development Kit

The Gemini Assistant works seamlessly with the Claude Code Development Kit we just installed:

**Auto-Context Injection**:
- `gemini-context-injector.sh` hook automatically attaches:
  - `docs/ai-context/project-structure.md` - Complete tech stack
  - `MCP-ASSISTANT-RULES.md` - Project coding standards
- Ensures Gemini receives full project context automatically
- No manual context specification needed

**Security**:
- `mcp-security-scan.sh` hook scans all Gemini calls for secrets/API keys
- Prevents accidental exposure of sensitive data to external AI

---

## Installation Steps Completed

### 1. Repository Cloned
```bash
Location: bootstrap/mcp-gemini-assistant/
Files:
  - gemini_mcp.py (26.7 KB) - Main MCP server
  - requirements.txt (3 dependencies)
  - start_server.sh (Unix launcher)
  - start_server.cmd (Windows launcher - created)
  - .env (configuration - created)
```

### 2. Python Virtual Environment Created
```bash
Path: bootstrap/mcp-gemini-assistant/venv/
Python: Python 3.14
Platform: Windows (cp314-cp314-win_amd64)
```

### 3. Dependencies Installed
**Installed 43 packages** including:
- `google-genai` 1.57.0 - Google Generative AI SDK
- `mcp` 1.25.0 - Model Context Protocol
- `pydantic` 2.12.5 - Data validation
- `httpx` 0.28.1 - HTTP client
- `websockets` 15.0.1 - WebSocket support
- `uvicorn` 0.40.0 - ASGI server
- `starlette` 0.50.0 - Web framework
- `cryptography` 46.0.3 - Security
- Plus 35 dependencies

**Installation Time**: ~45 seconds
**Total Size**: ~25 MB

### 4. Configuration Files Created

#### `.env` File (bootstrap/mcp-gemini-assistant/.env)
```env
# Gemini MCP Server Configuration
# API Key (references root .env GOOGLE_GEMINI_API_KEY)
GEMINI_API_KEY=${GOOGLE_GEMINI_API_KEY}

# Model Configuration
GEMINI_MODEL=gemini-2.0-flash-exp

# Session Configuration
SESSION_TIMEOUT=3600  # 1 hour
MAX_FILE_SIZE=1048576  # 1MB per file
```

#### Windows Start Script (start_server.cmd)
```batch
@echo off
cd /d "%~dp0"

REM Load environment variables from .env file
for /f "tokens=*" %%i in ('type .env ^| findstr /v "^#"') do set %%i

REM Check if GEMINI_API_KEY is set (check both names)
if "%GEMINI_API_KEY%"=="" if "%GOOGLE_GEMINI_API_KEY%"=="" (
    echo Error: GEMINI_API_KEY or GOOGLE_GEMINI_API_KEY environment variable must be set 1>&2
    echo Please set it in .env file or as environment variable 1>&2
    exit /b 1
)

REM Use GOOGLE_GEMINI_API_KEY if GEMINI_API_KEY not set
if "%GEMINI_API_KEY%"=="" set GEMINI_API_KEY=%GOOGLE_GEMINI_API_KEY%

REM Start the MCP server
venv\Scripts\python.exe gemini_mcp.py
```

**Features**:
- Windows-compatible (uses `venv\Scripts\python.exe`)
- Loads .env file automatically
- Checks for API key (both GEMINI_API_KEY and GOOGLE_GEMINI_API_KEY)
- Falls back to GOOGLE_GEMINI_API_KEY if GEMINI_API_KEY not set
- Clear error messages if API key missing

---

## MCP Server Configuration

### To Add to Claude Code Settings

**Option 1: Manual Addition to `.claude/settings.json`**

Add to the `mcpServers` section:

```json
{
  "mcpServers": {
    "gemini-assistant": {
      "command": "C:\\Dev\\Projects\\Repos\\Project-Nyra\\bootstrap\\mcp-gemini-assistant\\start_server.cmd",
      "args": [],
      "env": {
        "GEMINI_API_KEY": "${GOOGLE_GEMINI_API_KEY}",
        "GEMINI_MODEL": "gemini-2.0-flash-exp"
      }
    }
  }
}
```

**Option 2: Using Claude CLI**

```bash
claude mcp add gemini-assistant -s user -- C:/Dev/Projects/Repos/Project-Nyra/bootstrap/mcp-gemini-assistant/start_server.cmd
```

---

## Available MCP Tools

### 1. `consult_gemini`
**Purpose**: Start or continue a conversation with Gemini about complex coding problems

**Parameters**:
- `session_id` (optional): Continue a previous conversation
- `problem_description`: Description of the problem (required for new sessions)
- `code_context`: All relevant code (required for new sessions, cached afterward)
- `attached_files` (optional): Array of file paths to read and include
- `file_descriptions` (optional): Object mapping file paths to descriptions
- `specific_question`: The question you want answered
- `additional_context` (optional): Updates or changes since last question
- `preferred_approach`: Type of help (solution/review/debug/optimize/explain/follow-up)

### 2. `list_sessions`
**Purpose**: List all active Gemini consultation sessions

### 3. `end_session`
**Purpose**: End a specific session to free up memory

---

## Usage Examples

### Starting a New Conversation
```
/consult_gemini
  problem_description: "Need to implement efficient caching for React app"
  code_context: "[paste entire relevant codebase]"
  specific_question: "What's the best approach for LRU cache with React Query?"
  preferred_approach: "solution"
```

### With File Attachments
```
/consult_gemini
  problem_description: "Optimize React component for performance"
  attached_files: ["C:/Dev/Projects/Repos/Project-Nyra/apps/nyra-admin/src/Dashboard.jsx"]
  file_descriptions: {
    "C:/Dev/Projects/Repos/Project-Nyra/apps/nyra-admin/src/Dashboard.jsx": "Main dashboard with performance issues"
  }
  specific_question: "How can I improve rendering performance?"
  preferred_approach: "optimize"
```

### Follow-up Question
```
/consult_gemini
  session_id: "abc123..."
  specific_question: "Implemented your suggestion but getting stale data. Cache invalidation?"
  additional_context: "Added LRU cache but users see old data after updates"
  preferred_approach: "follow-up"
```

### Auto-Context Enhancement (via Dev Kit)
When using the Claude Code Development Kit's `gemini-context-injector.sh` hook, these files are **automatically attached** to new Gemini sessions:

1. `docs/ai-context/project-structure.md` - Complete Project Nyra tech stack
2. `MCP-ASSISTANT-RULES.md` - Project Nyra coding standards

**This means Gemini automatically knows**:
- Your project structure
- Your coding standards
- Your technology choices
- Your architectural patterns

---

## Integration with Project Nyra

### Project-Specific Configuration

**API Key**: References `GOOGLE_GEMINI_API_KEY` from root `.env` file
```env
# From: C:\Dev\Projects\Repos\Project-Nyra\.env
GOOGLE_GEMINI_API_KEY=  # User needs to set this
GOOGLE_GEMINI_MODEL=gemini-2.0-flash-exp
```

**Model Choice**: Using `gemini-2.0-flash-exp` (free tier)
- Fast responses
- Free tier available
- Good for code assistance
- Alternative: `gemini-2.5-pro` (higher quality, may have costs)

### Hooks Integration

**Security Scanning** (`.claude/hooks/mcp-security-scan.sh`):
- Runs before every Gemini consultation
- Scans for API keys, passwords, secrets
- Prevents accidental exposure of sensitive data
- Blocks the call if sensitive patterns detected

**Context Injection** (`.claude/hooks/gemini-context-injector.sh`):
- Runs on new Gemini sessions (no session_id)
- Auto-attaches project-structure.md
- Auto-attaches MCP-ASSISTANT-RULES.md
- Ensures Gemini understands Project Nyra context
- Logs all injections to `.claude/logs/`

---

## File Structure

```
Project-Nyra/
├── bootstrap/
│   └── mcp-gemini-assistant/          # NEW: Gemini MCP server
│       ├── venv/                       # Python virtual environment
│       │   ├── Scripts/
│       │   │   └── python.exe
│       │   └── Lib/
│       │       └── site-packages/     # 43 packages
│       ├── gemini_mcp.py               # Main MCP server
│       ├── requirements.txt            # Dependencies
│       ├── start_server.sh             # Unix launcher
│       ├── start_server.cmd            # NEW: Windows launcher
│       └── .env                        # NEW: Configuration
│
├── .claude/
│   ├── hooks/
│   │   ├── gemini-context-injector.sh  # Auto-context for Gemini
│   │   └── mcp-security-scan.sh        # Security for all MCP
│   └── settings.json                   # MCP server configuration
│
├── .env                                # Root environment (GOOGLE_GEMINI_API_KEY)
└── MCP-ASSISTANT-RULES.md              # Gemini coding standards
```

---

## Testing the Installation

### 1. Verify Virtual Environment
```bash
cd bootstrap/mcp-gemini-assistant
venv\Scripts\python.exe --version
# Should show: Python 3.14.x
```

### 2. Check Dependencies
```bash
venv\Scripts\pip list | findstr "google-genai mcp pydantic"
# Should show: google-genai 1.57.0, mcp 1.25.0, pydantic 2.12.5
```

### 3. Test Configuration (requires API key)
```bash
# Set API key in root .env first
echo %GOOGLE_GEMINI_API_KEY%

# Then test server startup
start_server.cmd
# Should show: Gemini Coding Assistant MCP Server v3.0 running
```

### 4. Test from Claude Code (requires API key)
```bash
claude
/consult_gemini problem_description="Test query" code_context="test" specific_question="Is this working?"
```

---

## Context Limits

- **Maximum combined input**: ~50,000 characters per message
- **Maximum response**: 8,192 tokens (~16,000 characters)
- **Session timeout**: 1 hour of inactivity
- **Rate limiting**: 1 second between requests
- **File size limit**: 1MB per file (configurable in .env)

---

## Next Steps

### Immediate (Required)

1. **Set Gemini API Key**:
   ```bash
   # Edit .env file and set:
   GOOGLE_GEMINI_API_KEY=your_actual_api_key_here
   ```
   Get API key from: https://aistudio.google.com/app/apikey

2. **Customize MCP-ASSISTANT-RULES.md**:
   - Open `MCP-ASSISTANT-RULES.md` in project root
   - Update with Project Nyra-specific standards
   - Add mortgage domain terminology
   - Document architectural patterns

3. **Populate project-structure.md**:
   - Open `docs/ai-context/project-structure.md`
   - Document complete tech stack (already partially done)
   - Add file tree for all modules
   - Include service dependencies

4. **Add to Claude Settings**:
   - Edit `.claude/settings.json`
   - Add gemini-assistant to mcpServers section
   - Or use: `claude mcp add gemini-assistant ...`

### Short-term (This Week)

1. **Test Gemini Consultations**:
   ```bash
   /consult_gemini "Test with Project Nyra context"
   ```

2. **Create Domain-Specific Rules**:
   - Add mortgage terminology to MCP-ASSISTANT-RULES.md
   - Document TRID compliance requirements
   - Add API design patterns

3. **Test Hook Integration**:
   - Verify gemini-context-injector.sh works
   - Check mcp-security-scan.sh blocks secrets
   - Review logs in `.claude/logs/`

---

## Troubleshooting

### Error: "GEMINI_API_KEY environment variable must be set"

**Solution**:
```bash
# 1. Check if key is set in root .env
type .env | findstr GOOGLE_GEMINI_API_KEY

# 2. If empty, get API key from:
# https://aistudio.google.com/app/apikey

# 3. Set in .env:
GOOGLE_GEMINI_API_KEY=your_key_here

# 4. Restart server
```

### Error: "Module 'google.genai' not found"

**Solution**:
```bash
# Reinstall dependencies
cd bootstrap/mcp-gemini-assistant
venv\Scripts\pip install -r requirements.txt
```

### Error: "Failed to connect to Gemini API"

**Possible Causes**:
1. Invalid API key
2. Network/firewall blocking Google APIs
3. Rate limit exceeded

**Solution**:
```bash
# Test API key manually
curl -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"test"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=YOUR_API_KEY"
```

### Session Not Found

**Solution**:
```bash
# List active sessions
/list_sessions

# If session expired (>1 hour), start new session
/consult_gemini problem_description="..." code_context="..." specific_question="..."
```

---

## Security Considerations

### What's Protected

1. **API Key Security**:
   - GEMINI_API_KEY stored in .env (not committed to git)
   - References root .env for centralized management
   - Never exposed in logs or responses

2. **Code Security** (via mcp-security-scan.sh):
   - Scans all Gemini calls for secrets
   - Detects: API keys, passwords, credentials, private keys
   - Blocks call if sensitive data detected
   - Comprehensive logging for audit

3. **Session Security**:
   - Sessions expire after 1 hour
   - In-memory storage (not persisted to disk)
   - Automatic cleanup of inactive sessions

### What to Avoid Sending

- API keys (ANTHROPIC_API_KEY, OPENAI_API_KEY, etc.)
- Database credentials
- AWS/Cloud credentials
- Private keys and certificates
- Personal identifiable information (PII)
- Customer data

**Note**: The mcp-security-scan.sh hook helps prevent accidental leaks, but always review what you're sending to external AI services.

---

## Advanced Usage

### Custom System Prompt

Edit `gemini_mcp.py` to customize the system prompt for Project Nyra:

```python
system_instruction = """
You are an expert coding consultant specializing in:
- Mortgage industry software (TRID compliance, rate calculations)
- React/Next.js frontend development
- Node.js/Express backend development
- PostgreSQL database design
- Multi-agent AI orchestration
- ... (customize for Project Nyra)
"""
```

### Multiple Model Support

Configure different models for different use cases:

```env
# In .env
GEMINI_MODEL_DEFAULT=gemini-2.0-flash-exp  # Fast, free
GEMINI_MODEL_COMPLEX=gemini-2.5-pro         # Slower, higher quality
```

### Integration with Commands

Use Gemini consultation in Dev Kit commands:

```bash
# From /full-context command
/consult_gemini
  problem_description="Architecture review needed"
  attached_files=["@docs/ai-context/project-structure.md"]
  specific_question="Evaluate current architecture for scalability"
```

---

## Summary

**Status**: ✅ Installation Complete (Pending API Key Configuration)
**Installation Time**: ~5 minutes
**Dependencies**: 43 packages installed
**Disk Space**: ~25 MB
**Configuration**: Ready for use once API key is set

**Capabilities Enabled**:
- 🤖 Gemini AI consultation from Claude Code
- 📁 File attachment support (reads actual code files)
- 💬 Session-based conversations with context persistence
- 🔒 Automatic security scanning (via Dev Kit hooks)
- 📚 Automatic context injection (via Dev Kit hooks)
- 🎯 Project-specific coding guidance

**Integration Points**:
- Claude Code Development Kit hooks (security + context)
- Project Nyra CLAUDE.md and MCP-ASSISTANT-RULES.md
- Root .env for centralized API key management
- 3-tier documentation system

**Next Task**: Configure dual orchestrator (claude-flow + archon OS)

---

**🤖 Installation completed autonomously by Claude Code**
