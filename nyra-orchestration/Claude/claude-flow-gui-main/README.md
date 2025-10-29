# Claude Flow Command Builder

A visual command builder and workflow manager for **Claude Code + Claude Flow** integration. This GUI helps you generate proper Claude Flow commands that work with Claude Code's AI capabilities.

## What This Does

Instead of trying to execute Claude Flow directly, this tool:
- **Generates Claude Code commands** that use Claude Flow's SPARC methodology
- **Builds workflow templates** for systematic development
- **Manages command history** and favorites
- **Provides visual interface** for complex Claude Flow operations

## Key Features

### 🎯 **Command Builder**
- **SPARC Mode Selection**: Choose from 17 specialized AI modes (architect, coder, TDD, security, etc.)
- **Claude Spawn Builder**: Generate enhanced Claude sessions with project context
- **Memory Operations**: Store/query persistent knowledge across sessions
- **Quick Commands**: One-click access to common operations

### 🔄 **Workflow Templates**
- **Pre-built Templates**: Full feature development, bug fixes, etc.
- **Custom Workflows**: Create multi-step development processes
- **Variable Support**: Use placeholders like `{feature}` in prompts
- **Step-by-Step Execution**: Guided workflow execution

### 📚 **History & Favorites**
- **Command History**: Track all generated commands
- **Favorites**: Save frequently used commands
- **Quick Reuse**: Click to load previous commands

### ⚙️ **Setup & Management**
- **System Status**: Check Claude Code and Claude Flow installation
- **Repository Management**: Clone/update Claude Flow repo
- **Project Initialization**: Set up SPARC in your projects

## Installation & Usage

1. **Start the GUI**:
   ```bash
   cd ~/claude-flow-gui
   ./start.sh
   ```

2. **Open in browser**: http://localhost:3456

3. **Setup (first time)**:
   - Go to Setup tab
   - Clone Claude Flow repository
   - Initialize in your project directory

4. **Build commands**:
   - Use Command Builder tab
   - Select SPARC mode and enter prompt
   - Copy generated command
   - Run in your terminal with Claude Code

## Example Workflow

### Building a REST API
1. **Specification**: `npx claude-flow sparc run spec-pseudocode "REST API for user management"`
2. **Architecture**: `npx claude-flow sparc run architect "user management API design"`
3. **TDD Implementation**: `npx claude-flow sparc run tdd "user CRUD operations"`
4. **Security Review**: `npx claude-flow sparc run security-review "API security audit"`

### Generated Commands Look Like:
```bash
# SPARC mode with specific prompt
npx claude-flow sparc run architect "design microservices architecture"

# Claude spawn with enhanced capabilities
npx claude-flow claude spawn "build React dashboard" --coverage 95 --research

# Memory operations
npx claude-flow memory store auth_progress "JWT implementation complete"
```

## How It Integrates with Claude Code

This GUI generates commands that:
1. **Enhance Claude Code sessions** with SPARC methodology
2. **Provide persistent memory** across development sessions
3. **Use specialized AI modes** for different development tasks
4. **Maintain project context** through CLAUDE.md files

## SPARC Modes Available

- **spec-pseudocode**: Plan implementation approach
- **architect**: Design system structure  
- **code**: Clean code implementation
- **tdd**: Test-driven development
- **debug**: Troubleshooting and optimization
- **security-review**: Security analysis
- **integration**: System integration
- **performance-optimizer**: Performance tuning
- **docs-writer**: Documentation creation
- **devops**: CI/CD and deployment
- **qa**: Quality assurance testing

## Requirements

- **Claude Code**: Must be installed first
- **Node.js 18+**: For running the GUI
- **Git**: For repository management
- **Claude Flow**: Installed via npm (or uses npx)

## Troubleshooting

- **Commands not working?** Ensure Claude Code is installed and working
- **Port 3456 in use?** Change PORT environment variable
- **Claude Flow errors?** Check installation status in Setup tab

## Development

The GUI is built with:
- **Backend**: Node.js/Express with REST API
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Storage**: JSON files for configuration and data
- **Git Integration**: For repository management

## What's Different from Direct Execution

This tool **generates commands** instead of trying to execute Claude Flow directly because:
- Claude Flow works **with** Claude Code, not independently
- Commands need to run in proper project context
- Memory and configuration need to persist across sessions
- SPARC methodology requires Claude Code's AI capabilities

The GUI makes it easy to build complex Claude Flow commands without memorizing syntax or options.