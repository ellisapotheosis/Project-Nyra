# Bootstrap Folder Consolidation Plan

**Date**: January 8, 2026
**Status**: IN PROGRESS

## 🎯 Objective

Consolidate the messy bootstrap folder into a clean, organized structure optimized for the GUI installer.

## 📊 Current State Analysis

### Directories Found (26 total):
1. `.claude-flow` - Claude Flow configuration
2. `_backup` - Backups from consolidation
3. `_organized` - Previous organization attempt
4. `apps` - Application files
5. `archon-os` - Archon OS (git submodule)
6. `assets` - Asset files
7. `bootstrap` - DUPLICATE (nested bootstrap)
8. `CDesktop-files` - **DUPLICATE** of consolidation-kit + scattered files
9. `ci` - CI/CD files
10. `claude-bootstrap-1-7` - Old bootstrap version
11. `claude-code-dev-kit` - Git submodule (already installed)
12. `claude-flow` - Claude Flow files
13. `consolidation-kit` - **MASTER** consolidation kit
14. `data` - Data files
15. `docs` - Documentation
16. `gitea` - Gitea configuration
17. `gui-installer` - GUI installer files
18. `infra` - Infrastructure files
19. `input` - Input files
20. `input2` - More input files
21. `integrations` - Integration files
22. `master-kit` - Master kit files
23. `mcp-gemini-assistant` - Git submodule (already installed)
24. `mcp-servers` - MCP server configurations
25. `nyra-bootstrap-allinone-kit` - All-in-one kit
26. `nyra-stack` - Nyra stack files
27. `profiles` - Profile configurations
28. `prompts` - Prompt files
29. `scripts` - Script files
30. `services` - Service configurations
31. `tools` - Tool files

### Problems Identified

1. **Massive Duplication**:
   - CDesktop-files contains duplicates of consolidation-kit
   - Multiple versions of the same scripts
   - Nested bootstrap directory
   - Git submodules already moved to main bootstrap folder

2. **Disorganization**:
   - Files scattered across 30+ directories
   - No clear structure
   - Multiple "input" directories
   - Unclear naming conventions

3. **Conflicts**:
   - Multiple GUI installers
   - Multiple consolidation scripts
   - Duplicate configuration files

## 🎨 Proposed New Structure

```
bootstrap/
├── .archived/                    # OLD: Archive old/deprecated files
│   ├── claude-bootstrap-1-7/   # OLD: Previous version
│   ├── input/                   # OLD: Input files v1
│   ├── input2/                  # OLD: Input files v2
│   ├── master-kit/              # OLD: Superseded by consolidation-kit
│   ├── nyra-bootstrap-allinone-kit/  # OLD: Superseded
│   └── _organized/              # OLD: Previous attempt
│
├── core/                        # CORE: Essential bootstrap components
│   ├── consolidation-kit/      # Master consolidation system
│   ├── gui-installer/          # Unified GUI installer
│   └── scripts/                # Core bootstrap scripts
│
├── configs/                     # CONFIG: All configuration files
│   ├── environments/           # Environment files (.env templates)
│   ├── settings/               # Claude settings, MCP configs
│   ├── batch/                  # Batch configuration files
│   └── profiles/               # PC profile configurations
│
├── infrastructure/              # INFRA: Infrastructure setup
│   ├── docker/                 # Docker compose files
│   ├── ci/                     # CI/CD configurations
│   ├── gitea/                  # Gitea setup
│   └── services/               # Service configurations
│
├── applications/                # APPS: Application files
│   ├── apps/                   # App deployments
│   ├── tools/                  # Utility tools
│   └── integrations/           # Third-party integrations
│
├── mcp-ecosystem/               # MCP: All MCP-related files
│   ├── mcp-servers/            # MCP server configurations
│   ├── archon-os/              # Archon OS (keep submodule)
│   ├── claude-code-dev-kit/    # Dev kit (keep submodule)
│   ├── mcp-gemini-assistant/   # Gemini (keep submodule)
│   └── claude-flow/            # Claude Flow configs
│
├── data/                        # DATA: Data files and assets
│   ├── assets/                 # Static assets
│   ├── docs/                   # Documentation
│   ├── prompts/                # Prompt templates
│   └── templates/              # Various templates
│
├── nyra-stack/                  # STACK: Nyra-specific stack
│
└── README.md                    # Master bootstrap readme
```

## 📋 Consolidation Steps

### Phase 1: Merge CDesktop-files into consolidation-kit
1. ✅ Identify unique files in CDesktop-files
2. ⏳ Merge unique files into consolidation-kit
3. ⏳ Remove CDesktop-files directory
4. ⏳ Update all references

### Phase 2: Archive Old Files
1. ⏳ Move deprecated directories to .archived/
2. ⏳ Document what's archived
3. ⏳ Create archive index

### Phase 3: Reorganize Core Files
1. ⏳ Create new directory structure
2. ⏳ Move consolidation-kit to core/
3. ⏳ Merge all GUI installer files
4. ⏳ Consolidate scripts

### Phase 4: Organize Configurations
1. ⏳ Merge all .env files into configs/environments/
2. ⏳ Consolidate settings into configs/settings/
3. ⏳ Organize batch configs
4. ⏳ Merge profile files

### Phase 5: Infrastructure Organization
1. ⏳ Consolidate Docker files
2. ⏳ Organize CI/CD
3. ⏳ Organize service configs

### Phase 6: MCP Ecosystem Organization
1. ⏳ Verify submodules are correct
2. ⏳ Organize MCP server configs
3. ⏳ Consolidate Claude Flow configs

### Phase 7: Data & Documentation
1. ⏳ Consolidate documentation
2. ⏳ Organize prompts and templates
3. ⏳ Clean up assets

### Phase 8: Create Master Index
1. ⏳ Create comprehensive README
2. ⏳ Document directory structure
3. ⏳ Create quick-start guide

## 🔑 Key Decisions

1. **Keep Git Submodules**: archon-os, claude-code-dev-kit, mcp-gemini-assistant
2. **Master Source**: consolidation-kit is the master
3. **Archive Instead of Delete**: Preserve old files in .archived/
4. **Single GUI Installer**: Merge all installer versions
5. **Clear Naming**: Use descriptive directory names

## 📦 Files to Consolidate from CDesktop-files

### Unique Files Found:
- `1files/install-all-components.ps1` - Component installer
- `1files/ULTRA-FAST-START.md` - Fast start guide
- `BOOTSTRAP-WORKFLOW.md` - Workflow documentation
- `MORTGAGE-OPERATIONS-COMPLETE.md` - Mortgage operations guide
- `MORTGAGE-SPARC-WORKFLOWS.md` - SPARC workflows
- `PROJECT-NYRA-BATCH-INIT-GUIDE.md` - Batch init guide
- `PROJECT-NYRA-ENV.md` - Environment guide
- `PROJECT-NYRA-ROOT-CLAUDE.md` - Root Claude docs
- `PROJECT-NYRA-ULTIMATE-SETTINGS.json` - Ultimate settings
- `PROJECT-NYRA-ULTIMATE.env` - Ultimate env file
- `TECHNICAL-DECISIONS.md` - Technical decisions
- `Consolidate-Bootstrap.ps1` - Bootstrap consolidation script

### Files to Merge:
- Merge duplicate scripts with consolidation-kit versions
- Merge configuration files
- Consolidate documentation

## ⚠️ Safety Measures

1. Create backup before any changes
2. Git commit before major changes
3. Test GUI installer after consolidation
4. Validate all paths in scripts
5. Keep .archived/ for 30 days minimum

## 📈 Success Criteria

- ✅ No duplicate files
- ✅ Clear directory structure
- ✅ Single source of truth
- ✅ GUI installer works
- ✅ All scripts have correct paths
- ✅ Documentation is complete
- ✅ Easy to navigate

## 🚀 Next Steps After Consolidation

1. Begin repository-wide architectural analysis
2. Create project scaffolding improvements
3. Implement monorepo best practices
4. Optimize development workflows

---

**Status**: Phase 1 in progress
**Last Updated**: January 8, 2026
