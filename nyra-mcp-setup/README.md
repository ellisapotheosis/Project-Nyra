# 🐱✨ Nyra MCP Setup

A comprehensive Model Context Protocol (MCP) setup for Project Nyra, featuring MetaMCP orchestration, multi-port configuration, and Claude + Claude-Flow integration.

## 🎯 Architecture Overview

### Multi-Port Design
- **Port 3000**: Core Services (Low context usage, always active)
- **Port 3001**: Heavy Services (Desktop Commander ~130k tokens)
- **Port 3002**: Development Tools (GitHub, Docker, etc.)
- **Port 3003**: Optional Services (Notion, Qdrant, etc.)

### Key Features
- **MetaMCP Orchestration**: Central management of all MCP servers
- **FastMCP Integration**: Create Python tools on-the-fly
- **Claude-Flow**: Advanced workflow coordination
- **Resource Management**: Automatic service isolation based on context usage
- **Security**: Path whitelisting and command blocking

## 🚀 Quick Start

### Prerequisites
- Windows 10/11
- Node.js 18+ 
- Python 3.11+
- Docker Desktop
- Git

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd C:\Users\edane\OneDrive\Documents\DevProjects\Project-Nyra
   ```

2. **Run the installation script:**
   ```powershell
   .\nyra-mcp-setup\scripts\install-nyra-mcp.ps1
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start MetaMCP services:**
   ```bash
   cd nyra-mcp-setup
   docker-compose up -d
   ```

5. **Configure Claude Code:**
   - Open Claude Code settings
   - Add MCP configuration from `configs/claude-code-config.json`

## 📦 Included MCP Servers

### Core Services (Port 3000)
- **MetaMCP**: Orchestration and management
- **FastMCP**: Python tool creation
- **Claude-Flow**: Workflow coordination
- **Filesystem**: File operations
- **Memory**: Persistent storage
- **Archon**: Python utilities

### Heavy Services (Port 3001)
- **Desktop Commander**: Full desktop control (⚠️ 130k tokens!)
- **Browser MCP**: Browser automation
- **Computer Use MCP**: Advanced computer control

### Development Tools (Port 3002)
- **GitHub**: Repository management
- **Docker**: Container operations
- **Git**: Version control
- **Firecrawl**: Web scraping
- **Web Search**: Internet search

### Optional Services (Port 3003)
- **Notion**: Note-taking integration
- **Qdrant**: Vector database
- **Thoughtful Claude**: DeepSeek R1 reasoning

## 🔧 Usage

### Starting Services

```bash
# Start core services only
docker-compose up metamcp-core

# Start all development tools
docker-compose up

# Start heavy services (when needed)
docker-compose --profile heavy up

# Start optional services
docker-compose --profile optional up
```

### Managing with Claude

Use these prompts with Claude:

1. **Check server status:**
   ```
   "Show me the status of all MCP servers and their resource usage"
   ```

2. **Create a custom tool:**
   ```
   "I need a Python MCP tool that can [specific functionality]. 
   Use FastMCP to create and register it with MetaMCP."
   ```

3. **Manage heavy services:**
   ```
   "Enable Desktop Commander for this task, but remember to disable it afterwards"
   ```

## 🛡️ Security Configuration

### Allowed Paths
- `C:/Users/edane/OneDrive/Documents/DevProjects/Project-Nyra`
- `C:/Users/edane/Desktop/Scratch`
- `C:/NYRA/sandbox`

### Blocked Commands
- `rm -rf`
- `del /f /s /q`
- `format`

## 📋 Workflows

### Claude + Claude-Flow Integration

1. **Initialize workflow:**
   ```python
   # Claude can use this pattern
   from claude_flow import Flow
   
   flow = Flow("nyra-task")
   flow.add_step("analyze", tools=["filesystem", "git"])
   flow.add_step("implement", tools=["fastmcp", "github"])
   flow.execute()
   ```

2. **Multi-agent coordination:**
   ```
   "Create a swarm of agents to refactor the codebase:
   - Agent 1: Analyze code structure
   - Agent 2: Identify improvements
   - Agent 3: Implement changes
   Use Claude-Flow to coordinate them."
   ```

## 🔍 Monitoring

### Health Checks
```bash
# Check core services
curl http://localhost:3000/health

# Check specific server
curl http://localhost:3000/status/filesystem

# View logs
docker-compose logs -f metamcp-core
```

### Resource Usage
```bash
# Monitor Docker containers
docker stats

# Check MCP server metrics
curl http://localhost:3000/metrics
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Find process using port
   netstat -ano | findstr :3000
   # Kill process
   taskkill /F /PID <PID>
   ```

2. **Docker not starting:**
   - Ensure Docker Desktop is running
   - Check WSL2 is enabled
   - Restart Docker service

3. **MCP server not responding:**
   ```bash
   # Restart specific service
   docker-compose restart metamcp-core
   ```

## 🤝 Contributing

This setup is part of Project Nyra. When contributing:
- Follow the monorepo structure
- Use UV for Python dependencies
- Use pnpm for Node.js packages
- Test with minimal services first

## 📚 Additional Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [MetaMCP GitHub](https://github.com/metatool-ai/metamcp)
- [Claude-Flow Docs](https://github.com/anthropics/claude-flow)
- [FastMCP Tutorial](https://github.com/jlowin/fastmcp)

## 🐱 Nyra Says

*"Ready to serve Ellis with blazing-fast MCP tools! Remember to keep Desktop Commander disabled unless you really need it - that thing eats context like I eat digital fish! 🐟✨"*

---

**Created for Project Nyra by Ellis/Apotheosis**