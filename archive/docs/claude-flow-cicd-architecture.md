# Claude Flow CI/CD Container - Architecture Diagram

## Container Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   nyra-claude-flow-cicd Container                       │
│                   (node:20-bullseye base image)                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ Installed Global Packages                                         │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ • @claude-flow/cli@latest (v3.0.0-alpha.104)                     │ │
│  │ • agentdb@latest (150x-12,500x faster vector search)             │ │
│  │ • agentic-flow@latest (neural optimization)                      │ │
│  │ • ruv-swarm@latest (swarm coordination)                          │ │
│  │ • pnpm, typescript, ts-node                                      │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ System Tools                                                      │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ • Git (version control)                                           │ │
│  │ • Python3 + pip (AI/ML libraries)                                │ │
│  │ • curl, jq (API interactions)                                    │ │
│  │ • sqlite3 (database operations)                                  │ │
│  │ • vim, ssh-client (utilities)                                    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ Working Directory: /workspace                                     │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ Mounted: Entire project repository (read-write)                  │ │
│  │ - Source code                                                     │ │
│  │ - Configuration files (claude-flow.config.json)                  │ │
│  │ - Git repository (.git/)                                         │ │
│  │ - Claude Flow state (.claude-flow/)                              │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ Persistent Data: /data/                                           │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ /data/claude-flow/     → claude_flow_cicd_data (Claude Flow)     │ │
│  │ /data/agentdb/         → claude_flow_cicd_agentdb (Memory)       │ │
│  │ /data/neural/          → claude_flow_cicd_neural (Training)      │ │
│  │ /data/git-cache/       → claude_flow_cicd_git_cache (Git)        │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ Configuration: /root/                                             │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ /root/.gitconfig       → Mounted from configs/gitconfig          │ │
│  │ /root/.git-credentials → Mounted from configs/git-credentials    │ │
│  │ /root/.ssh/            → Mounted from configs/ssh/               │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ Running Services                                                  │ │
│  ├───────────────────────────────────────────────────────────────────┤ │
│  │ • Claude Flow Daemon (background workers)                        │ │
│  │ • AgentDB (memory database)                                      │ │
│  │ • Hook System (27 hooks + 12 workers)                           │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└──────────┬──────────────────────────┬───────────────────────────────────┘
           │                          │
           │                          │
    ┌──────▼───────┐          ┌──────▼──────┐
    │ nyra-network │          │ claude-flow-│
    │  (external)  │          │    cicd     │
    │   bridge     │          │   bridge    │
    └──────┬───────┘          └─────────────┘
           │
           │
┌──────────▼──────────────────────────────────────────────────┐
│              External Services via nyra-network              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ postgres │  │  redis   │  │   n8n    │  │   dify   │   │
│  │  :5432   │  │  :6379   │  │  :5678   │  │  :8000   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  letta   │  │   mem0   │  │ graphiti │  │  twenty  │   │
│  │  :8000   │  │  :8081   │  │  :9100   │  │  :3000   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                               │
                               │
                ┌──────────────▼─────────────────┐
                │      External APIs             │
                ├────────────────────────────────┤
                │ • Anthropic (Claude)           │
                │ • OpenAI (GPT)                 │
                │ • Google (Gemini)              │
                │ • OpenRouter (DeepSeek)        │
                │ • GitHub (via Git)             │
                └────────────────────────────────┘
```

## Volume Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   Docker Volume Management                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ claude_flow_cicd_data                                   │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ Purpose: Claude Flow persistent data                    │   │
│  │ Mounted: /data/claude-flow                              │   │
│  │ Contains:                                               │   │
│  │ • Configuration cache                                   │   │
│  │ • Session state                                         │   │
│  │ • Task history                                          │   │
│  │ • Performance metrics                                   │   │
│  │ Backup Priority: Medium                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ claude_flow_cicd_agentdb (CRITICAL)                     │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ Purpose: AgentDB memory database                        │   │
│  │ Mounted: /data/agentdb                                  │   │
│  │ Contains:                                               │   │
│  │ • Vector embeddings (HNSW indexed)                      │   │
│  │ • Pattern library                                       │   │
│  │ • Learning history                                      │   │
│  │ • ReasoningBank trajectories                            │   │
│  │ Backup Priority: CRITICAL (backup daily)                │   │
│  │ Performance: 150x-12,500x faster than alternatives      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ claude_flow_cicd_neural                                 │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ Purpose: Neural pattern training data                   │   │
│  │ Mounted: /data/neural                                   │   │
│  │ Contains:                                               │   │
│  │ • Trained neural networks                               │   │
│  │ • Pattern recognition models                            │   │
│  │ • Learning checkpoints                                  │   │
│  │ • Performance optimization data                         │   │
│  │ Backup Priority: High                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ claude_flow_cicd_git_cache                              │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ Purpose: Git repository cache                           │   │
│  │ Mounted: /data/git-cache                                │   │
│  │ Contains:                                               │   │
│  │ • Git object cache                                      │   │
│  │ • Cloned repositories                                   │   │
│  │ • Git LFS cache                                         │   │
│  │ Backup Priority: Low (can be rebuilt)                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Backup Strategy:
• Daily:   claude_flow_cicd_agentdb (critical memory data)
• Weekly:  claude_flow_cicd_neural (training progress)
• Monthly: claude_flow_cicd_data (configuration/metrics)
• Never:   claude_flow_cicd_git_cache (rebuildable)
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Data Flow Architecture                      │
└─────────────────────────────────────────────────────────────────────┘

1. Task Initiation
   ┌─────────┐
   │  User   │
   └────┬────┘
        │ CLI Command
        ▼
   ┌────────────────┐
   │ Claude Flow    │
   │ CLI            │
   └────┬───────────┘
        │
        ▼

2. Pre-Task Hook
   ┌────────────────┐     ┌──────────────┐
   │ Hook System    │────▶│  AgentDB     │
   │ (pre-task)     │     │  Search      │
   └────────────────┘     └──────────────┘
        │                        │
        │ Context               │ Similar patterns
        │                        │
        ▼                        ▼
   ┌────────────────────────────────┐
   │   Task Preparation             │
   │ • Load patterns                │
   │ • Get recommendations          │
   │ • Initialize memory            │
   └────────────────────────────────┘
        │
        ▼

3. Task Execution
   ┌────────────────┐
   │ Swarm Init     │
   └────┬───────────┘
        │
        ▼
   ┌────────────────┐     ┌──────────────┐     ┌──────────────┐
   │ Agent 1        │     │ Agent 2      │     │ Agent 3      │
   │ (coder)        │     │ (tester)     │     │ (reviewer)   │
   └────┬───────────┘     └──────┬───────┘     └──────┬───────┘
        │                        │                     │
        │ Shared Memory          │                     │
        └────────────────────────┼─────────────────────┘
                                │
                                ▼
                         ┌──────────────┐
                         │  AgentDB     │
                         │  (HNSW)      │
                         └──────────────┘
        │
        ▼

4. Task Completion
   ┌────────────────┐
   │ Collect        │
   │ Results        │
   └────┬───────────┘
        │
        ▼
   ┌────────────────┐     ┌──────────────┐
   │ Hook System    │────▶│  AgentDB     │
   │ (post-task)    │     │  Store       │
   └────────────────┘     └──────────────┘
        │                        │
        │ Success metrics       │ Pattern storage
        │                        │
        ▼                        ▼
   ┌────────────────────────────────┐
   │   Learning & Optimization      │
   │ • Store successful patterns    │
   │ • Train neural networks        │
   │ • Update performance metrics   │
   │ • Persist session state        │
   └────────────────────────────────┘
        │
        ▼
   ┌────────────────┐
   │ Result         │
   │ Returned       │
   └────────────────┘
```

## Memory System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AgentDB Memory Architecture                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Input Layer                                                   │ │
│  ├───────────────────────────────────────────────────────────────┤ │
│  │ • Task descriptions                                           │ │
│  │ • Code patterns                                               │ │
│  │ • Error messages                                              │ │
│  │ • Configuration data                                          │ │
│  └─────────────────────────────┬─────────────────────────────────┘ │
│                                │                                   │
│                                ▼                                   │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Embedding Layer (sentence-transformers)                       │ │
│  ├───────────────────────────────────────────────────────────────┤ │
│  │ • Generate vector embeddings                                  │ │
│  │ • Dimensionality: 384-768                                     │ │
│  │ • Quantization: scalar/int8/binary                           │ │
│  └─────────────────────────────┬─────────────────────────────────┘ │
│                                │                                   │
│                                ▼                                   │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ HNSW Index (150x-12,500x faster)                              │ │
│  ├───────────────────────────────────────────────────────────────┤ │
│  │ • M parameter: 16 (connectivity)                              │ │
│  │ • EF construction: 200 (build accuracy)                       │ │
│  │ • EF search: 100 (search accuracy)                           │ │
│  │ • Distance metric: cosine similarity                          │ │
│  └─────────────────────────────┬─────────────────────────────────┘ │
│                                │                                   │
│                ┌───────────────┴──────────────┐                   │
│                ▼                               ▼                   │
│  ┌──────────────────────┐       ┌──────────────────────┐         │
│  │ Pattern Storage      │       │ Learning Algorithms  │         │
│  ├──────────────────────┤       ├──────────────────────┤         │
│  │ • Successful tasks   │       │ • Decision Transform │         │
│  │ • Error patterns     │       │ • Q-Learning         │         │
│  │ • Optimization hints │       │ • SARSA              │         │
│  │ • Code snippets      │       │ • Actor-Critic       │         │
│  └──────────────────────┘       └──────────────────────┘         │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Query Interface                                               │ │
│  ├───────────────────────────────────────────────────────────────┤ │
│  │ • Semantic search (vector similarity)                         │ │
│  │ • Keyword search (SQL LIKE)                                   │ │
│  │ • Hybrid search (combine both)                                │ │
│  │ • Filtered search (by namespace, tags, date)                 │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Performance Comparison:
┌──────────────────┬──────────────┬──────────────┐
│ Operation        │ Traditional  │ AgentDB      │
├──────────────────┼──────────────┼──────────────┤
│ Vector Search    │ 1500ms       │ 10ms (150x)  │
│ Pattern Matching │ 2500ms       │ 0.2ms (12.5k)│
│ Memory Retrieval │ 800ms        │ 5ms (160x)   │
│ Learning Update  │ 3000ms       │ 100ms (30x)  │
└──────────────────┴──────────────┴──────────────┘
```

## Hook System Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Hook System Flow                            │
└─────────────────────────────────────────────────────────────────────┘

Task Lifecycle:

1. PRE-TASK (before task starts)
   ┌──────────────┐
   │ User Request │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ pre-task     │──┐
   │ hook         │  │
   └──────┬───────┘  │
          │          │
          ▼          │
   • Search memory   │
   • Get similar     │
   • Recommend agent │
   • Load context    │
          │          │
          ▼          ▼
   ┌────────────────────┐
   │ Task Initialization│
   └────────────────────┘

2. EXECUTION (during task)
   ┌────────────────────┐
   │ Task Running       │
   └────────┬───────────┘
            │
            ├──▶ pre-edit hook (before file edit)
            │   • Check patterns
            │   • Validate syntax
            │   • Load context
            │
            ├──▶ post-edit hook (after file edit)
            │   • Train neural patterns
            │   • Update memory
            │   • Calculate metrics
            │
            ├──▶ pre-command hook (before bash)
            │   • Assess risk
            │   • Check safety
            │   • Log command
            │
            └──▶ post-command hook (after bash)
                • Track metrics
                • Store results
                • Update patterns

3. POST-TASK (after task completes)
   ┌────────────────────┐
   │ Task Complete      │
   └────────┬───────────┘
            │
            ▼
   ┌──────────────┐
   │ post-task    │──┐
   │ hook         │  │
   └──────┬───────┘  │
            │        │
            ▼        │
   • Store results   │
   • Update memory   │
   • Train neural    │
   • Calculate score │
            │        │
            ▼        ▼
   ┌────────────────────┐
   │ Learning Complete  │
   └────────────────────┘

4. BACKGROUND WORKERS (async)
   ┌────────────────────────────────────────┐
   │ Worker Daemon (12 workers)             │
   ├────────────────────────────────────────┤
   │                                        │
   │ • ultralearn     (deep learning)       │
   │ • optimize       (performance)         │
   │ • consolidate    (memory)              │
   │ • predict        (preloading)          │
   │ • audit          (security)            │
   │ • map            (codebase)            │
   │ • preload        (resources)           │
   │ • deepdive       (analysis)            │
   │ • document       (auto-docs)           │
   │ • refactor       (suggestions)         │
   │ • benchmark      (performance)         │
   │ • testgaps       (coverage)            │
   │                                        │
   └────────────────────────────────────────┘
            │
            └──▶ Triggered by:
                 • Task completion
                 • Performance threshold
                 • Time interval
                 • Manual dispatch
```

## Resource Allocation

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Resource Allocation                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Container Resources (Docker limits)                                │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │ CPU: 4 cores (limit), 2 cores (reserved)                       ││
│  │ Memory: 8GB (limit), 4GB (reserved)                            ││
│  │ Swap: Disabled (for performance)                               ││
│  │ Network: Unlimited                                             ││
│  │ I/O: Unlimited                                                 ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  Memory Allocation (inside container)                               │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │ Node.js Heap:        2GB (default)                             ││
│  │ AgentDB Cache:       2GB (AGENTDB_CACHE_SIZE)                  ││
│  │ Claude Flow Cache:   2GB (CLAUDE_FLOW_CACHE_SIZE)              ││
│  │ System/Other:        2GB (OS, buffers, etc.)                   ││
│  │ ─────────────────────────────────────────                      ││
│  │ Total:               8GB                                       ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  Disk Allocation (volumes)                                          │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │ claude_flow_cicd_data:      5GB (typical)                      ││
│  │ claude_flow_cicd_agentdb:   10GB (growing with patterns)       ││
│  │ claude_flow_cicd_neural:    5GB (model checkpoints)            ││
│  │ claude_flow_cicd_git_cache: 5GB (git objects)                  ││
│  │ ─────────────────────────────────────                          ││
│  │ Total:                      ~25GB                              ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  Network Bandwidth                                                  │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │ Internal (nyra-network):    Unlimited (bridge network)         ││
│  │ External (Internet):        Unlimited (host network)           ││
│  │ Typical usage:              100-500 Mbps                       ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Performance Tuning:
• Increase CPU for faster swarm operations
• Increase Memory for larger models/more agents
• Increase AgentDB cache for better search performance
• Monitor with: docker stats nyra-claude-flow-cicd
```

---

**Legend:**
- ┌─┐ : Container/Service boundaries
- ─▶  : Data flow direction
- │   : Vertical connection
- ▼   : Downward flow
- •   : List item/component

**Last Updated:** 2026-01-26
