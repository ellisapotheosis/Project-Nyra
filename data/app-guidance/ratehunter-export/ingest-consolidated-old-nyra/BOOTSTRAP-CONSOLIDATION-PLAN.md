# Bootstrap Consolidation Plan

**Date**: 2026-01-27  
**Source**: C:\Users\edane\OneDrive\Dev\NYRA-AIO-Bootstrap  
**Target**: C:\Dev\Projects\Repos\Project-Nyra\bootstrap

## Executive Summary

Consolidate beneficial features, scripts, and UI components from NYRA-AIO-Bootstrap into the main Project-Nyra bootstrap installer. Focus on:
1. **Bootstrap automation scripts** (prerequisites, Tailscale, Cloudflared, Ollama)
2. **GUI components** (Claude Flow GUI, dashboard interfaces)
3. **Claude configs and patterns** (MCP configs, SPARC modes)
4. **React/Next.js components and patterns**

---

## 1. Bootstrap Scripts to Integrate

### Source: `NYRA-MASTER-BOOTSTRAP-KIT-v4-FRESH-20251129-142521/scripts/windows/`

#### ✅ Prerequisites Installer
**File**: `00-install-prereqs.bat`
**Purpose**: Automated installation of core tools via winget
**Features**:
- Git, Node.js, Docker Desktop
- Cloudflared, Tailscale
- PowerShell 7
**Target**: `bootstrap/scripts/windows/install-prerequisites.ps1`

#### ✅ Tailscale Join Script
**File**: `55-tailscale-join.ps1`
**Purpose**: Automated Tailscale VPN setup with auth key support
**Features**:
- Auto-install via winget
- Auth key parameter support
- Hostname configuration
- Status display
**Target**: `bootstrap/scripts/tailscale/setup-tailscale.ps1`

#### ✅ LiteLLM Config Generator
**File**: `70-generate-litellm-config.ps1`
**Purpose**: Dynamic LiteLLM configuration from worker YAML
**Features**:
- Parse workers.yaml
- Generate environment variables
- Create litellm-config.yaml
**Target**: `bootstrap/scripts/orchestrator/generate-litellm-config.ps1`

#### ✅ Cloudflared Tunnel Scripts
**File**: `50-cloudflared-login-and-create-tunnels.bat`
**Purpose**: Automated Cloudflare tunnel creation
**Target**: `bootstrap/scripts/cloudflare/setup-tunnels.ps1`

#### ✅ Ollama Setup Scripts
**Files**: `60-worker-ollama-setup.bat`, `61-worker-ollama-pull-models.bat`
**Purpose**: GPU worker Ollama installation and model pulling
**Target**: `bootstrap/scripts/workers/setup-ollama.ps1`

---

## 2. GUI Components to Integrate

### Source: `claude-flow-gui-main/claude-flow-gui-main/`

#### 🎨 Claude Flow Command Builder
**Type**: Node.js + Express backend, vanilla JS frontend
**Features**:
- SPARC mode selection (17 modes)
- Command builder interface
- Workflow templates
- Command history & favorites
- Memory operations UI
- Setup management

**Integration Strategy**:
1. Port to React/TypeScript in existing installer
2. Add as separate tab/screen in Electron app
3. Integrate SPARC mode patterns into main flow

**Target Components**:
```
bootstrap/installer/src/renderer/components/
├── ClaudeFlowBuilder/
│   ├── CommandBuilder.tsx
│   ├── SPARCModeSelector.tsx
│   ├── WorkflowTemplates.tsx
│   ├── CommandHistory.tsx
│   └── MemoryManager.tsx
```

### Source: `nyra-core-docker-ui/dashboard/`

#### 📊 Dashboard Interface
**Type**: HTML/CSS/JS dashboard
**Features**:
- Service status monitoring
- Real-time updates
- Container management
- System metrics

**Integration Strategy**:
- Convert to React components
- Integrate with health check screen
- Add to completion screen

---

## 3. Claude Configurations

### Source: `IDE-Configs/Claude-Configs/`

#### ⚙️ Claude Desktop Config
**File**: `claude_desktop_config.comprehensive.json`
**Purpose**: Comprehensive MCP server configurations
**Features**:
- Multiple MCP servers (GitHub, Filesystem, Brave Search, etc.)
- Environment variable configurations
- Server-specific settings

**Target**: `bootstrap/configs/claude/claude_desktop_config.json`

#### 📝 SPARC Modes Config
**File**: `sparc-modes.json`
**Purpose**: Claude Flow SPARC mode definitions
**Target**: `bootstrap/configs/claude/sparc-modes.json`

#### 📖 Environment Variables Guide
**File**: `ENVIRONMENT_VARIABLES_GUIDE.md`
**Purpose**: Documentation for MCP environment setup
**Target**: `bootstrap/docs/ENVIRONMENT-VARIABLES.md`

---

## 4. React/Next.js Patterns

### From Notebooks: React Configuration Templates

#### 🚨 Critical Pattern: Parallel Execution
**Source**: CLAUDE-MD-React notebook
**Key Principles**:
- Batch ALL React operations in single message
- Component creation coordination
- State management batching
- Concurrent testing
- Build operation parallelization

**Application to Installer**:
```typescript
// Apply to installer component creation
// Always batch related components together
[BatchCreate]:
  - NetworkConfigScreen.tsx
  - NetworkConfigForm.tsx
  - NetworkConfigValidator.ts
  - NetworkConfigTypes.ts
  - NetworkConfig.test.tsx
```

#### 🎯 SPARC Integration
**Modes to Integrate**:
- `spec-pseudocode` - Planning mode
- `architect` - Design mode
- `code` - Implementation mode
- `tdd` - Test-driven mode
- `debug` - Troubleshooting mode
- `security-review` - Security audit
- `integration` - Integration mode
- `performance-optimizer` - Performance mode
- `docs-writer` - Documentation mode

**Target**: Add mode selector to installer workflow

---

## 5. UI Component Libraries

### Existing in Project-Nyra
- **Shadcn/ui**: Already configured
- **Radix UI**: Primitives installed
- **Tailwind CSS**: Configured

### Potential Additions from Bootstrap Kits
- **Magic UI**: Check if any magic-ui components exist in kits
- **Custom animations**: Framer Motion patterns
- **Chart components**: For dashboard/monitoring

---

## 6. Integration Priority

### Phase 1: Core Scripts (Week 1)
✅ **High Priority**
1. Prerequisites installer
2. Tailscale setup
3. Cloudflared tunnel setup
4. Docker validation scripts

**Deliverables**:
- New PowerShell scripts in `bootstrap/scripts/`
- Integration into existing installer IPC handlers
- Add UI screens for each setup step

### Phase 2: GUI Enhancements (Week 2)
🎨 **Medium Priority**
1. Claude Flow Command Builder UI
2. SPARC mode selector
3. Workflow templates
4. Command history

**Deliverables**:
- New React components
- State management for command builder
- Backend API for command execution

### Phase 3: Configs & Documentation (Week 3)
📝 **Medium Priority**
1. Claude Desktop configs
2. SPARC modes config
3. Environment variable guide
4. Architecture documentation

**Deliverables**:
- Config files in `bootstrap/configs/`
- Documentation in `bootstrap/docs/`
- Setup automation for configs

### Phase 4: Dashboard & Monitoring (Week 4)
📊 **Low Priority**
1. Dashboard components
2. Service monitoring
3. Health check visualization
4. System metrics display

**Deliverables**:
- Dashboard React components
- Real-time update system
- Integration with health check flow

---

## 7. File Mapping

### Scripts
```
Source → Target

NYRA-AIO-Bootstrap/IDE-Configs/GUI-Installer/Consolidate-and-Cleanup/
  NYRA-MASTER-BOOTSTRAP-KIT-v4-FRESH-20251129-142521/scripts/windows/
    00-install-prereqs.bat → bootstrap/scripts/windows/install-prerequisites.ps1
    55-tailscale-join.ps1 → bootstrap/scripts/tailscale/setup-tailscale.ps1
    70-generate-litellm-config.ps1 → bootstrap/scripts/orchestrator/generate-litellm-config.ps1
    50-cloudflared-login-and-create-tunnels.bat → bootstrap/scripts/cloudflare/setup-tunnels.ps1
    60-worker-ollama-setup.bat → bootstrap/scripts/workers/setup-ollama.ps1
    61-worker-ollama-pull-models.bat → bootstrap/scripts/workers/pull-models.ps1
```

### GUI Components
```
claude-flow-gui-main/claude-flow-gui-main/
  public/ → bootstrap/installer/src/renderer/components/ClaudeFlowBuilder/
  src/server.js → bootstrap/installer/src/main/api/claude-flow-api.ts

nyra-core-docker-ui/dashboard/
  *.html/*.css/*.js → bootstrap/installer/src/renderer/components/Dashboard/
```

### Configs
```
IDE-Configs/Claude-Configs/
  claude_desktop_config.comprehensive.json → bootstrap/configs/claude/claude_desktop_config.json
  sparc-modes.json → bootstrap/configs/claude/sparc-modes.json
  ENVIRONMENT_VARIABLES_GUIDE.md → bootstrap/docs/ENVIRONMENT-VARIABLES.md
```

---

## 8. Implementation Checklist

### Scripts Integration
- [ ] Copy and adapt prerequisite installer
- [ ] Integrate Tailscale setup script
- [ ] Add Cloudflared tunnel creation
- [ ] Include Ollama setup for workers
- [ ] Add LiteLLM config generator
- [ ] Create unified script orchestration

### GUI Integration
- [ ] Port Claude Flow GUI to React
- [ ] Add SPARC mode selector component
- [ ] Create workflow template builder
- [ ] Add command history component
- [ ] Integrate memory manager UI
- [ ] Port dashboard components

### Configuration
- [ ] Copy Claude Desktop configs
- [ ] Add SPARC modes configuration
- [ ] Create environment variable templates
- [ ] Document configuration process
- [ ] Add config validation

### Testing
- [ ] Test all scripts on clean Windows install
- [ ] Verify GUI components in Electron app
- [ ] Validate configs with Claude Desktop
- [ ] End-to-end integration test
- [ ] Document known issues

### Documentation
- [ ] Update README with new features
- [ ] Create setup guides for new scripts
- [ ] Document SPARC integration
- [ ] Add troubleshooting section
- [ ] Create video walkthrough

---

## 9. Architecture Changes

### New Installer Screens
```
Current Flow:
1. Welcome
2. PC Detection
3. Network Config
4. Docker Setup
5. Tailscale Setup
6. Service Deployment
7. GPU Config (if applicable)
8. Health Check
9. Complete

Enhanced Flow:
1. Welcome
2. PC Detection
3. Prerequisites Install ← NEW
4. Network Config
5. Docker Setup
6. Tailscale Setup ← ENHANCED
7. Cloudflare Tunnels ← NEW
8. Claude Flow Setup ← NEW
9. Service Deployment
10. GPU Config (if applicable) ← ENHANCED (Ollama)
11. Health Check ← ENHANCED (Dashboard)
12. Complete ← ENHANCED (Command Builder)
```

### New IPC Handlers
```typescript
// New handlers to add to installer/src/main/main.ts

ipcMain.handle('install-prerequisites', async () => {
  // Run install-prerequisites.ps1
});

ipcMain.handle('setup-cloudflare-tunnels', async (_, config) => {
  // Run setup-tunnels.ps1
});

ipcMain.handle('generate-litellm-config', async (_, workers) => {
  // Run generate-litellm-config.ps1
});

ipcMain.handle('setup-ollama', async (_, models) => {
  // Run setup-ollama.ps1 and pull-models.ps1
});

ipcMain.handle('build-claude-command', async (_, command) => {
  // Generate Claude Flow command from builder
});
```

---

## 10. Risk Assessment

### High Risk
- **Breaking existing installer**: Careful testing required
- **PowerShell script compatibility**: Test on multiple Windows versions
- **Claude Desktop config conflicts**: Backup existing configs

### Medium Risk
- **UI/UX changes**: User testing needed
- **Performance impact**: Monitor Electron app size
- **Dependency conflicts**: Check npm package versions

### Low Risk
- **Documentation updates**: Can be done incrementally
- **Dashboard features**: Optional, can be disabled
- **SPARC modes**: Non-breaking addition

---

## 11. Success Criteria

### Must Have
✅ All core scripts working on clean install
✅ GUI installer includes Tailscale/Cloudflared setup
✅ Claude configs automatically deployed
✅ End-to-end test passes on all 4 PC roles

### Should Have
✅ Claude Flow command builder integrated
✅ SPARC mode selector functional
✅ Dashboard monitoring available
✅ Comprehensive documentation

### Nice to Have
✅ Workflow template system
✅ Command history/favorites
✅ Real-time service monitoring
✅ Automated troubleshooting

---

## 12. Rollout Plan

### Development
- **Week 1-2**: Core scripts + basic GUI integration
- **Week 3**: Claude configs + SPARC integration
- **Week 4**: Dashboard + polish

### Testing
- **Alpha**: Internal testing on orchestrator PC
- **Beta**: Test on all 4 PCs in network
- **RC**: Community testing if applicable

### Deployment
- **Phase 1**: Release to orchestrator-mini only
- **Phase 2**: Roll out to worker PCs
- **Phase 3**: Full production deployment

---

## Notes

- Keep original NYRA-AIO-Bootstrap as reference/backup
- Document all changes in git commits
- Create rollback plan for each phase
- Monitor performance impact of new features
- Gather user feedback early and often

---

**Last Updated**: 2026-01-27
**Author**: Warp AI Agent
**Status**: 📝 Planning Phase
