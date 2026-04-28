# Letta Integration - Agent Memory & Reasoning Service

## 🎯 SERVICE CONTEXT

**Purpose**: TypeScript service providing persistent agent memory, long-term context management, and conversational reasoning using the Letta (formerly MemGPT) memory architecture integrated with RuVector search.

**Port**: 3150
**Language**: TypeScript + Express.js + Letta SDK
**Dependencies**: letta-js, @anthropic-sdk, axios, redis, @types/node

## 🚨 CRITICAL DEVELOPMENT RULES

### Memory Service Development Pattern
**MANDATORY**: All Letta endpoints, memory handlers, and context managers MUST be developed in parallel.

### Memory Architecture Rules
**CRITICAL**: Every memory operation MUST follow Letta's hybrid memory model:

- **Core Memory**: Fixed agent identity, goals, and constraints (system context)
- **Archival Memory**: Long-term knowledge base with semantic search
- **Recall Memory**: Short-term conversation buffer for immediate context
- **Vector Embeddings**: All memories stored with semantic embeddings for fast retrieval
- **Memory Consolidation**: Automatic compression of old memories

## 📊 LETTA AGENT MEMORY ARCHITECTURE

### Multi-Tier Memory Model
```
┌─────────────────────────────────────────────────────────────────┐
│                    LETTA AGENT MEMORY SYSTEM                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ CORE MEMORY (Fixed)                                               │
│ ├─ Agent Identity: Name, role, personality                       │
│ ├─ System Prompt: Instructions and constraints                   │
│                                                                   │
│ ARCHIVAL MEMORY (Long-term, Searchable)                          │
│ ├─ Documents: Embedded with vector embeddings                    │
│ ├─ RuVector Indexes: Fast vector search                          │
│                                                                   │
│ RECALL MEMORY (Short-term, Working Context)                      │
│ ├─ Message Buffer: Recent conversation history (sliding window)  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🐝 LETTA INTEGRATION WORKFLOW

Use  workflows for memory system updates and integration testing.

### Available Agents
- `memory_architect`: Memory System Design
- `context_manager`: Context & Session Management
- `vector_search_engineer`: Semantic Search & Indexing

## 🔧 TYPESCRIPT + LETTA PATTERNS

### Letta Client Integration
```typescript
import { LettaClient } from 'letta-js';
// Integration with RuVector for semantic search
```

## 🔒 SECURITY & COMPLIANCE

- **Memory Security**: All memories encrypted at rest (AES-256).
- **Access Control**: Secure token management for Letta API.

## 📈 PERFORMANCE TARGETS

- **Memory search**: < 50ms p95
- **Context assembly**: < 100ms p95
- **Vector search optimization**: High-speed retrieval via RuVector.

---

**This service provides persistent, searchable agent memory enabling long-term context management and continuous learning.**
