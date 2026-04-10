# Claude Memory Storage

This directory contains persistent memory for Claude Code sessions across different PCs.

## Directory Structure
```
.claude/
├── memory/                 # Persistent cross-PC memory storage
│   ├── memory.db          # SQLite database with conversation memory
│   ├── hnsw.index         # Vector search index
│   ├── hnsw.metadata.json # Vector search metadata
│   └── state.json         # Memory state configuration
├── projects/              # Per-project memory (auto-generated)
└── ...
```

## Environment Variables

Set these environment variables to use this location:

```bash
# Memory persistence
CLAUDE_FLOW_MEMORY_DIR=./.claude/memory
CLAUDE_FLOW_MEMORY_PERSISTENCE=true

# ReasoningBank database
REASONINGBANK_DB_PATH=.claude/memory/memory.db

# Memory backend configuration
MEMORY_BACKEND=hybrid
MEMORY_PRIMARY_STORE=letta
MEMORY_SECONDARY_STORE=mem0

# Swarm memory sharing
SWARM_MEMORY_SHARED=true
```

## Cross-PC Setup

1. **Add to .env.archon-os:**
   ```bash
   CLAUDE_FLOW_MEMORY_DIR=./.claude/memory
   REASONINGBANK_DB_PATH=.claude/memory/memory.db
   ```

2. **Copy existing memory:**
   ```bash
   # Copy current memory to repo
   cp .swarm/memory.db .claude/memory/
   cp .swarm/hnsw.index .claude/memory/
   cp .swarm/hnsw.metadata.json .claude/memory/
   cp .swarm/state.json .claude/memory/
   ```

3. **Commit to git:**
   ```bash
   git add .claude/memory/
   git commit -m "Add persistent cross-PC memory storage"
   ```

## Usage

Once configured, memory will persist across:
- Different PCs/environments
- Git clones and pulls
- Docker container restarts
- Session interruptions

The memory database contains:
- Conversation context
- Agent learning patterns
- Project-specific insights
- Code understanding
- User preferences
