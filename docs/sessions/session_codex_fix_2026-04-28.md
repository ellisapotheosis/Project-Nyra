# Session: Fix Codex-CLI TOML Parsing Error (2026-04-28)

## Problem
Codex-cli failed to load with error:
```
Error loading config.toml: invalid type: string "maximum", expected struct AgentRoleToml in `agents`
```

## Root Cause
The `[agents]` section in `.codex/config.toml` mixed direct properties with nested subsections, causing TOML parser confusion:
```toml
[agents]
autonomy_level = "maximum"  # Direct property
permission_bypass = true
[agents.explorer]           # Nested subsection
```

## Solution
Moved agent configuration to separate `[agent_config]` section:
```toml
[agent_config]
autonomy_level = "maximum"
permission_bypass = true
max_threads = 10
max_depth = 3

[agents.explorer]           # Clean structure
```

## File Modified
- **Location**: `/home/ellisapotheosis/repos/project-nyra/.codex/config.toml`
- **Lines Changed**: 43 (moved [agents] → [agent_config])

## Verification
- ✅ `codex --help` loads without TOML error
- ✅ Config structure now valid
- ✅ Agent subsections remain functional

## TOML Lesson
When TOML section has both:
- Direct key-value pairs
- Nested subsections (e.g., [section.subsection])

Parser expects values to be tables/structs, not strings. Solution: separate direct config into distinct parent section.

## Related Issues Fixed (Earlier Session)
1. Codex escaping backslashes: `C:\Users\...` → `C:\\Users\\...`
2. Gemini enum: `defaultApprovalMode: "always"` → `"default"`

## Status
✅ Codex-cli now loads and functional
