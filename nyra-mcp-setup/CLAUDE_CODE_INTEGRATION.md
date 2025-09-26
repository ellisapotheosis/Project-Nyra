# 🎯 Claude Code + Claude-Flow Integration Guide

## 🚀 Quick Setup for Claude Code

### 1. Install Claude Code Extension
```bash
# In VS Code
ext install anthropic.claude-code
```

### 2. Configure MCP Servers

#### Option A: Through Claude Code UI
1. Open VS Code
2. Press `Ctrl+Shift+P`
3. Type "Claude: Configure MCP Servers"
4. Add the following configuration:

```json
{
  "mcp.servers": {
    "nyra-core": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-p", "3000:3000",
        "-v", "${workspaceFolder}/nyra-mcp-setup/configs:/configs",
        "-e", "CONFIG_FILE=/configs/metamcp-config.yaml",
        "-e", "PORT=core-services",
        "metatool-ai/metamcp:latest"
      ]
    }
  }
}
```

#### Option B: Direct settings.json
Add to `.vscode/settings.json`:

```json
{
  "claude.mcp.enabled": true,
  "claude.mcp.servers": {
    "metamcp-core": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "-p", "3000:3000", "-v", "${workspaceFolder}/nyra-mcp-setup/configs:/configs", "-e", "CONFIG_FILE=/configs/metamcp-config.yaml", "-e", "PORT=core-services", "metatool-ai/metamcp:latest"],
      "env": {
        "GITHUB_TOKEN": "${env:GITHUB_TOKEN}",
        "FIRECRAWL_API_KEY": "${env:FIRECRAWL_API_KEY}"
      }
    },
    "fastmcp": {
      "command": "python",
      "args": ["-m", "fastmcp", "serve"],
      "cwd": "${workspaceFolder}"
    },
    "claude-flow": {
      "command": "npx",
      "args": ["claude-flow@alpha", "mcp", "start"],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

### 3. Claude-Flow Specific Setup

Create `.claude-flow/config.yml` in your project root:

```yaml
name: nyra-project
description: Nyra AI Assistant Project

agents:
  coordinator:
    type: orchestrator
    tools:
      - metamcp-core
      - claude-flow
      
  developer:
    type: executor
    tools:
      - filesystem
      - git
      - fastmcp
      
  analyst:
    type: analyzer
    tools:
      - web-search
      - firecrawl
      - memory

workflows:
  default:
    steps:
      - name: analyze
        agent: analyst
        tools: [web-search, memory]
        
      - name: plan
        agent: coordinator
        tools: [claude-flow]
        
      - name: implement
        agent: developer
        tools: [filesystem, git, fastmcp]

security:
  allowed_paths:
    - "${workspaceFolder}"
    - "C:/Users/edane/Desktop/Scratch"
    - "C:/NYRA/sandbox"
```

## 🎮 Using Claude Code with MCP

### Basic Commands

1. **Initialize MCP connection:**
   ```
   Claude: Connect to MCP servers
   ```

2. **Check server status:**
   ```
   Claude: Show MCP server status
   ```

3. **Execute with specific tools:**
   ```
   Claude: Run with tools [filesystem, git, github]
   ```

### Advanced Workflows

#### Multi-Agent Task
```typescript
// In Claude Code, use this pattern:
// @claude-flow
async function refactorCodebase() {
  // Step 1: Analyze current structure
  await claude.analyze({
    tools: ['filesystem', 'git'],
    prompt: 'Analyze the current codebase structure'
  });
  
  // Step 2: Create improvement plan
  await claude.plan({
    tools: ['claude-flow', 'memory'],
    prompt: 'Create a refactoring plan based on analysis'
  });
  
  // Step 3: Implement changes
  await claude.implement({
    tools: ['filesystem', 'fastmcp'],
    prompt: 'Implement the refactoring plan'
  });
}
```

#### Custom Tool Creation
```python
# @claude-tool
# name: nyra_custom_analyzer
# description: Custom analysis tool for Nyra project

from fastmcp import tool

@tool()
def analyze_nyra_module(module_name: str) -> dict:
    """Analyze a specific Nyra module"""
    # Claude will implement this based on your needs
    pass
```

## 🔧 Claude Code Shortcuts

### Keyboard Shortcuts
- `Ctrl+Shift+M`: Open MCP panel
- `Ctrl+Shift+C`: Chat with Claude
- `Ctrl+Shift+T`: Select tools for current task
- `Ctrl+Shift+R`: Run current workflow

### Command Palette
- `Claude: Create new MCP tool`
- `Claude: Switch MCP port`
- `Claude: Enable heavy services`
- `Claude: Show resource usage`

## 📋 Best Practices

### 1. Context Management
```javascript
// Always specify tools to minimize context usage
// BAD:
await claude.ask("Analyze all files");

// GOOD:
await claude.ask("Analyze Python files in nyra-core", {
  tools: ['filesystem'],
  paths: ['nyra-core/**/*.py']
});
```

### 2. Tool Selection
```yaml
# Group tools by context usage
light_tools: [filesystem, memory, git]
medium_tools: [github, docker, web-search]
heavy_tools: [desktop-commander, browser-mcp]

# Use heavy tools only when necessary
workflow:
  - use: light_tools
    for: "initial analysis"
  - use: medium_tools
    for: "integration tasks"
  - use: heavy_tools
    for: "ui automation only"
```

### 3. Error Handling
```typescript
// Always wrap MCP calls in try-catch
try {
  const result = await claude.execute({
    tool: 'filesystem',
    action: 'read',
    path: 'config.json'
  });
} catch (error) {
  // Fallback to alternative approach
  await claude.ask("Please analyze the error and suggest alternatives");
}
```

## 🐱 Nyra-Specific Claude Prompts

### Project Understanding
```
"As Nyra, analyze the Project-Nyra structure and create a mental model of how all components interact. Focus on the nyra-core, nyra-webapp, and nyra-voice modules."
```

### Tool Creation
```
"Create a FastMCP tool that helps Ellis manage the Nyra project more efficiently. The tool should integrate with our existing Git workflow and provide smart suggestions."
```

### Workflow Automation
```
"Design a Claude-Flow workflow that automates the process of:
1. Checking for new issues in GitHub
2. Analyzing them for priority
3. Creating implementation plans
4. Assigning to appropriate modules"
```

## 🚨 Troubleshooting

### MCP Connection Issues
```bash
# Check if MetaMCP is running
docker ps | grep metamcp

# Restart MCP services
docker-compose restart

# View logs
docker logs nyra-metamcp-core
```

### Claude Code Not Responding
1. Reload VS Code window: `Ctrl+Shift+P` → "Reload Window"
2. Check Claude Code output: View → Output → Claude
3. Restart MCP connection: Claude → Disconnect → Connect

### Tool Registration Failed
```python
# Manually register tool with MetaMCP
import requests

response = requests.post(
    "http://localhost:3000/register",
    json={
        "name": "my_tool",
        "type": "fastmcp",
        "endpoint": "http://localhost:8000"
    }
)
```

## 🎉 You're Ready!

With this setup, Claude Code can now:
- ✅ Manage all MCP servers through MetaMCP
- ✅ Create tools on-the-fly with FastMCP
- ✅ Coordinate complex workflows with Claude-Flow
- ✅ Keep context usage optimal with port separation
- ✅ Work seamlessly on the Nyra project

Remember: **Start with core services, add others as needed!**

---
*"Let's build amazing things together, Ellis! 🐱✨" - Nyra*