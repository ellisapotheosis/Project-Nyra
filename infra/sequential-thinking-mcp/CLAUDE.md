# Sequential Thinking MCP - Claude Flow V3 Configuration

## 🚨 AUTOMATIC SWARM ORCHESTRATION

**CLI coordinates, Task tool agents do the actual work!**

---

## 🤖 INTELLIGENT 3-TIER MODEL ROUTING (ADR-026)

| Tier | Handler | Latency | Cost | Use Cases |
|------|---------|---------|------|-----------|
| **1** | Agent Booster | <1ms | $0 | Simple transforms |
| **2** | Haiku | ~500ms | $0.0002 | Simple tasks |
| **3** | Sonnet/Opus | 2-5s | $0.003-$0.015 | Complex reasoning |

---

## 🛡️ ANTI-DRIFT CONFIG

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 4 --strategy specialized
```

---

## 🔄 AUTO-START SWARM PROTOCOL & ⏸️ SPAWN AND WAIT PATTERN

1. Tell user concurrent tasks
2. STOP - no more tool calls
3. WAIT - let agents work
4. RESPOND - synthesize results

---

## 🧠 AUTO-LEARNING PROTOCOL

```bash
npx @claude-flow/cli@latest memory search --query '[keywords]' --namespace patterns
npx @claude-flow/cli@latest memory store --namespace patterns --key '[pattern]' --value '[result]'
npx @claude-flow/cli@latest hooks post-task --task-id '[id]' --success true --store-results true
```

---

## 🚀 V3 CLI COMMANDS & 🚀 AVAILABLE AGENTS & 🪝 V3 HOOKS SYSTEM

Agents: `backend-dev`, `api-docs`, `reviewer`, `reasoning-specialist`

---

## 📝 MEMORY COMMANDS REFERENCE

```bash
npx @claude-flow/cli@latest memory store --key "sequential-thinking-mcp" --value "content" --namespace patterns
npx @claude-flow/cli@latest memory search --query "sequential reasoning problem-solving" --namespace patterns
```

---

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"**

---

**Profile**: nodejs-mcp
**Generated**: 2026-01-16

## 🎯 Project Overview

Model Context Protocol server for structured step-by-step reasoning and complex problem-solving.

## 🏗️ Architecture

**Tech Stack**: Node.js, TypeScript, MCP SDK, @modelcontextprotocol/server-sequential-thinking
**Port**: 8093
**Type**: MCP Server - Reasoning Tool

## 📋 Development Commands

```bash
# Development
npm run dev

# Build
npm run build

# Test
npm test

# Lint
npm run lint

# Start MCP server
npx -y @modelcontextprotocol/server-sequential-thinking
```

## 🧠 Claude Flow Integration

### Available Agents

- researcher
- system-architect
- backend-dev
- reviewer
- planner

### Recommended Workflows

- Complex problem decomposition
- Multi-step architecture design
- Systematic debugging
- Code review processes
- Decision-making with alternatives

### Integration Examples

```bash
# Use with Claude Flow agents
npx @claude-flow/cli@latest agent spawn -t planner \
  --mcp-tool sequential_thinking

# Coordinate sequential reasoning across swarm
npx @claude-flow/cli@latest swarm init \
  --topology hierarchical \
  --enable-sequential-thinking
```

---

## 🛠️ Tech Stack Specific Guidelines

## Node.js MCP Server Development Guidelines

### MCP Server Structure
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'sequential-thinking',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);
```

### Tool Definition Pattern
```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'sequential_thinking',
      description: 'Enable step-by-step reasoning with revisions and branching',
      inputSchema: {
        type: 'object',
        properties: {
          thought: {
            type: 'string',
            description: 'Current reasoning step'
          },
          nextThoughtNeeded: {
            type: 'boolean',
            description: 'Whether continuation is needed'
          },
          thoughtNumber: {
            type: 'integer',
            description: 'Current step position'
          },
          totalThoughts: {
            type: 'integer',
            description: 'Estimated total steps'
          },
          isRevision: {
            type: 'boolean',
            description: 'Whether this revises previous reasoning'
          },
          revisesThought: {
            type: 'integer',
            description: 'Which thought number is being revised'
          },
          branchFromThought: {
            type: 'integer',
            description: 'Branch divergence point'
          },
          branchId: {
            type: 'string',
            description: 'Branch identifier'
          }
        },
        required: ['thought', 'nextThoughtNeeded', 'thoughtNumber', 'totalThoughts']
      }
    }
  ]
}));
```

### Tool Implementation
```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'sequential_thinking') {
    const {
      thought,
      nextThoughtNeeded,
      thoughtNumber,
      totalThoughts,
      isRevision,
      revisesThought,
      branchFromThought,
      branchId
    } = request.params.arguments;

    // Process sequential thought
    const result = await processThought({
      thought,
      nextThoughtNeeded,
      thoughtNumber,
      totalThoughts,
      isRevision,
      revisesThought,
      branchFromThought,
      branchId
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  throw new Error('Unknown tool');
});
```

### Sequential Thinking Patterns

#### Pattern 1: Linear Reasoning
```typescript
// Step 1: Initial analysis
{
  thought: "Analyze the problem requirements",
  nextThoughtNeeded: true,
  thoughtNumber: 1,
  totalThoughts: 5
}

// Step 2: Approach identification
{
  thought: "Identify potential solution approaches",
  nextThoughtNeeded: true,
  thoughtNumber: 2,
  totalThoughts: 5
}

// ... continue until final step
```

#### Pattern 2: Revision Flow
```typescript
// Initial thought
{
  thought: "The system needs three components",
  nextThoughtNeeded: true,
  thoughtNumber: 2,
  totalThoughts: 5
}

// Revision after deeper analysis
{
  thought: "Actually, four components are needed for proper separation",
  nextThoughtNeeded: true,
  thoughtNumber: 3,
  totalThoughts: 5,
  isRevision: true,
  revisesThought: 2
}
```

#### Pattern 3: Branch Exploration
```typescript
// Main path
{
  thought: "Primary approach using monolithic architecture",
  nextThoughtNeeded: true,
  thoughtNumber: 3,
  totalThoughts: 7
}

// Alternative branch
{
  thought: "Alternative: microservices architecture",
  nextThoughtNeeded: true,
  thoughtNumber: 4,
  totalThoughts: 7,
  branchFromThought: 3,
  branchId: "microservices-alt"
}
```

### Error Handling
```typescript
try {
  // Validate thought parameters
  if (thoughtNumber > totalThoughts) {
    throw new Error('Thought number exceeds total thoughts');
  }

  if (isRevision && !revisesThought) {
    throw new Error('Revision must specify which thought is being revised');
  }

  // Process thought
  const result = await processThought(params);

  return { content: [{ type: 'text', text: JSON.stringify(result) }] };
} catch (error) {
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        error: error.message,
        thought: params.thought,
        thoughtNumber: params.thoughtNumber
      })
    }],
    isError: true
  };
}
```

### Testing Sequential Thinking
```typescript
describe('Sequential Thinking Tool', () => {
  it('should handle linear reasoning flow', async () => {
    const thoughts = [
      { thought: 'Step 1', thoughtNumber: 1, totalThoughts: 3 },
      { thought: 'Step 2', thoughtNumber: 2, totalThoughts: 3 },
      { thought: 'Step 3', thoughtNumber: 3, totalThoughts: 3, nextThoughtNeeded: false }
    ];

    for (const thought of thoughts) {
      const result = await callTool('sequential_thinking', thought);
      expect(result).toBeDefined();
    }
  });

  it('should support thought revision', async () => {
    const result = await callTool('sequential_thinking', {
      thought: 'Revised approach',
      thoughtNumber: 3,
      totalThoughts: 5,
      isRevision: true,
      revisesThought: 2
    });

    expect(result.isRevision).toBe(true);
  });

  it('should handle branching', async () => {
    const result = await callTool('sequential_thinking', {
      thought: 'Alternative path',
      thoughtNumber: 4,
      totalThoughts: 7,
      branchFromThought: 3,
      branchId: 'alt-approach'
    });

    expect(result.branchId).toBe('alt-approach');
  });
});
```

### Performance Optimization
- Cache thought chains in memory
- Use streams for long reasoning sequences
- Implement thought pruning for memory efficiency
- Add timeouts for complex reasoning
- Monitor memory usage per session

### Best Practices
- Validate all thought parameters
- Maintain thought chain consistency
- Clear documentation of reasoning steps
- Version thought schemas
- Log all revisions and branches
- Implement thought visualization
- Provide reasoning summaries
- Support thought export/import

### Docker Integration
```dockerfile
FROM node:20-alpine
WORKDIR /app
RUN npm install -g @modelcontextprotocol/server-sequential-thinking@latest
USER node
CMD ["npx", "-y", "@modelcontextprotocol/server-sequential-thinking"]
```

### Environment Configuration
```bash
# Enable features
ENABLE_REVISIONS=true
ENABLE_BRANCHING=true
ENABLE_DYNAMIC_ADJUSTMENT=true

# Set limits
MAX_THOUGHTS=100
MAX_BRANCHES=10
TIMEOUT_MS=30000

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

---

## 📝 Use Cases

### 1. Complex Problem Decomposition
Break down architectural decisions, implementation plans, or debugging strategies into sequential, logical steps.

### 2. Code Review Workflows
Structure systematic code reviews with clear progression from high-level to detailed analysis.

### 3. Multi-Path Exploration
Evaluate multiple solution approaches using branch exploration before committing to final design.

### 4. Iterative Refinement
Revise earlier reasoning steps as new information emerges during the thought process.

### 5. Decision Documentation
Create auditable decision trails with clear reasoning chains for architectural and technical choices.

---

## 📝 Notes

- Auto-generated by Project Nyra Batch CLAUDE.md System
- For manual customization, edit this file directly
- To regenerate, run: `node scripts/batch-claude-md/batch-template-engine.js`
- Reference: https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking
