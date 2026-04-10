# Project-Nyra: Development vs Production Environment Setup

## 🎯 Overview

This document explains the **smart environment switching** setup for Project-Nyra that allows you to seamlessly switch between:
- **Development**: Live editing of your forked archon-os and archon repositories
- **Production**: Stable npm packages and Docker containers

## 📁 Folder Structure

### **Development Structure**
```
Project-Nyra/
├── .mcp.json (environment-aware configuration)
├── scripts/
│   ├── link-dev-packages.ps1 (npm/pnpm linking setup)
│   ├── switch-environment.ps1 (environment switcher)
│   ├── setup-development-repos.ps1 (clone your forks)
│   └── start-nyra-docker-infrastructure.ps1
├── submodules/ (YOUR FORKED DEVELOPMENT CODE)
│   ├── archon-os/ (github.com/ellisapotheosis/archon-os)
│   │   ├── src/mcp/server.js (local MCP server)
│   │   ├── packages/ruv-swarm/ (ruv-swarm source)
│   │   └── package.json (pnpm linked globally)
│   └── archon/ (github.com/ellisapotheosis/archon)
│       ├── frontend/ (React frontend - port 8051)
│       ├── backend/ (Node.js backend - port 8080)
│       └── database/ (database layer)
├── config/
│   └── development-links.json (tracks linked packages)
└── .nyra-environment (current environment indicator)
```

### **Production Structure**
```
Project-Nyra/
├── .mcp.json (uses npm packages)
├── docker/ (production containers)
│   ├── orchestrator/ (MCP servers)
│   └── client/ (UI services)
├── node_modules/ (npm packages only)
└── (no submodules/ directory needed)
```

## 🔄 How Environment Switching Works

### **The Smart `.mcp.json` Configuration**

When you run `link-dev-packages.ps1`, your `.mcp.json` is updated to conditionally switch between:

```json
{
  "mcpServers": {
    "archon-os": {
      "command": "node",
      "args": ["-e", "
        const env = process.env.NODE_ENV || 'production';
        if (env === 'development' && fs.existsSync('./submodules/archon-os')) {
          // Use your local development code
          spawn('node', ['./submodules/archon-os/src/mcp/server.js']);
        } else {
          // Use stable npm package
          spawn('npx', ['archon-os@alpha', 'mcp', 'start']);
        }
      "],
      "env": {
        "NODE_ENV": "${NODE_ENV}",
        "NYRA_DEV_MODE": "${NYRA_DEV_MODE}"
      }
    }
  }
}
```

## 🛠️ Development Workflow

### **1. Setup Development Environment**
```powershell
# Clone your forked repositories as submodules
.\scripts\setup-development-repos.ps1 -Force

# Link packages for live editing
.\scripts\link-dev-packages.ps1

# Switch to development mode
.\scripts\switch-environment.ps1 -Environment development
```

### **2. Development Features**
- **Live Code Editing**: Edit files in `submodules/archon-os/` or `submodules/archon/`
- **Hot Reloading**: Changes appear instantly in running MCP servers
- **npm/pnpm Linking**: Your local code is globally linked
- **Environment Variables**: `NODE_ENV=development`, `NYRA_DEV_MODE=true`

### **3. Development Commands**
```powershell
# Test with your local code
nyra-claude.ps1 flow --version

# Edit and see changes live
code submodules/archon-os/src/
code submodules/archon/frontend/

# Commit your changes
cd submodules/archon-os
git add .
git commit -m "Add new feature"
git push origin main
```

## 🏭 Production Workflow

### **1. Setup Production Environment**
```powershell
# Switch to production mode
.\scripts\switch-environment.ps1 -Environment production

# Start production infrastructure
.\scripts\start-nyra-docker-infrastructure.ps1 -Force
```

### **2. Production Features**
- **Stable Packages**: Uses published `archon-os@alpha`, `ruv-swarm@latest`
- **Docker Containers**: Containerized services for reliability
- **No Development Dependencies**: Clean production environment
- **Environment Variables**: `NODE_ENV=production`, `NYRA_DEV_MODE=false`

### **3. Production Commands**
```powershell
# Use stable npm packages
nyra-claude.ps1 flow --version

# Start containerized services
docker-compose -f docker/orchestrator/docker-compose.yml up -d
docker-compose -f docker/client/docker-compose.yml up -d
```

## 📋 npm/pnpm Linking Explained

### **What npm/pnpm link does:**
1. **Global Link**: Creates a global symlink to your local package
2. **Local Link**: Links the global package to your project
3. **Live Updates**: Changes in source code are immediately reflected

### **Example Linking Process:**
```powershell
# 1. In submodules/archon-os/
pnpm link --global  # Creates global link

# 2. In Project-Nyra root
pnpm link --global ./submodules/archon-os  # Links locally

# 3. Now when Node.js imports 'archon-os'
# it uses your local ./submodules/archon-os code instead of npm package
```

### **Benefits:**
- ✅ **Live Development**: Edit code and see changes instantly
- ✅ **No Build Steps**: Direct source code execution
- ✅ **Version Control**: Your changes are tracked in git submodules
- ✅ **Easy Switching**: Toggle between dev/prod with single command

## 🚀 Quick Start Examples

### **Start Development Session**
```powershell
# 1. Setup (one time)
.\scripts\setup-development-repos.ps1 -Force
.\scripts\link-dev-packages.ps1

# 2. Switch to dev mode
.\scripts\switch-environment.ps1 -Environment development

# 3. Edit and test
code submodules/archon-os/src/mcp/server.js
nyra-claude.ps1 flow memory store "test" "value"
# Your edits are now live!
```

### **Switch to Production**
```powershell
# 1. Switch to production
.\scripts\switch-environment.ps1 -Environment production

# 2. Start production services
.\scripts\start-nyra-docker-infrastructure.ps1 -Force

# 3. Use stable packages
nyra-claude.ps1 flow --version
# Now using archon-os@alpha from npm
```

## 🎯 Best Practices

### **Development**
- ✅ Make small, incremental changes
- ✅ Test locally before committing
- ✅ Keep submodules up-to-date with upstream
- ✅ Use feature branches in your forks

### **Production**
- ✅ Use tagged, stable releases
- ✅ Test in production environment before deploying
- ✅ Monitor containerized services
- ✅ Keep environment variables secure

## 🔧 Troubleshooting

### **"Package not found" errors:**
```powershell
# Relink packages
.\scripts\link-dev-packages.ps1 -Force

# Check linking status
pnpm list --global --depth=0
```

### **MCP servers using wrong version:**
```powershell
# Check current environment
type .nyra-environment

# Force environment switch
.\scripts\switch-environment.ps1 -Environment development -Force
```

### **Submodules not found:**
```powershell
# Clone your forks
.\scripts\setup-development-repos.ps1 -Force

# Initialize git submodules
git submodule init
git submodule update
```

## 💡 Advanced Tips

### **Multiple Environment Support**
You can extend this system to support more environments:
- `staging`: Pre-production testing
- `testing`: Automated testing environment
- `local`: Local development with mocked services

### **Custom Package Versions**
Edit `link-dev-packages.ps1` to support different versions:
- Development branches: `feature/new-mcp-tools`
- Release candidates: `v2.0.0-rc1`
- Specific commits: Pin to specific commit hashes

### **IDE Integration**
- **VSCode**: Open `submodules/` as workspace folders
- **TypeScript**: Configure paths for better IntelliSense
- **Debugging**: Attach debugger to local Node.js processes

This setup gives you the **best of both worlds**: the flexibility of live development with the stability of production packages! 🎉