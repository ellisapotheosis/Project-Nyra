# RuVector Code Examples - Concrete Implementation Guide

**Date**: 2026-01-18
**Version**: 1.0

## Complete Working Examples

### Example 1: ReasoningBank Learner Agent

From `.claude/agents/v3/reasoningbank-learner.md`:

```bash
#!/bin/bash
# ReasoningBank Learning Cycle

SESSION_ID="rb-$(date +%s)"
TASK="Implement user authentication system"

# ============================================
# STEP 1: RETRIEVE - Search Similar Patterns
# ============================================

echo "🔍 Retrieving similar authentication patterns..."

# Search for patterns with minimum reward threshold
SIMILAR_PATTERNS=$(npx @archon-os/cli@latest hooks intelligence pattern-stats \
  --query "authentication implementation" \
  --k 10 \
  --namespace reasoningbank \
  --min-reward 0.8)

echo "Found patterns: $SIMILAR_PATTERNS"

# ============================================
# STEP 2: JUDGE - Start Trajectory Tracking
# ============================================

echo "📊 Starting trajectory tracking..."

npx @archon-os/cli@latest hooks intelligence trajectory-start \
  --session-id "$SESSION_ID" \
  --agent-type "reasoningbank-learner" \
  --task "$TASK"

# Search for initial context
mcp__archon-os__memory_search \
  --pattern="pattern:*" \
  --namespace="reasoningbank" \
  --limit=10

# ============================================
# STEP 3: DISTILL - Track Implementation Steps
# ============================================

echo "💻 Tracking implementation steps..."

# Track test writing
npx @archon-os/cli@latest hooks intelligence trajectory-step \
  --session-id "$SESSION_ID" \
  --operation "code-generation" \
  --outcome "success" \
  --metadata '{"files_changed": 3, "tests_passed": true}'

# Track feature implementation
npx @archon-os/cli@latest hooks intelligence trajectory-step \
  --session-id "$SESSION_ID" \
  --operation "implement-feature" \
  --outcome "success" \
  --metadata '{"files_changed": 2, "lines_added": 150}'

# Track testing
npx @archon-os/cli@latest hooks intelligence trajectory-step \
  --session-id "$SESSION_ID" \
  --operation "run-tests" \
  --outcome "success" \
  --metadata '{"tests_passed": 15, "coverage": 0.95}'

# ============================================
# STEP 4: CONSOLIDATE - End Trajectory
# ============================================

echo "🎓 Ending trajectory and storing pattern..."

# End trajectory with verdict
npx @archon-os/cli@latest hooks intelligence trajectory-end \
  --session-id "$SESSION_ID" \
  --verdict "success" \
  --reward 0.95

# Store the successful pattern
mcp__archon-os__memory_usage --action="store" \
  --namespace="reasoningbank" \
  --key="pattern:auth-implementation-$(date +%s)" \
  --value='{
    "task": "implement auth",
    "approach": "JWT with refresh tokens",
    "steps": [
      {"operation": "write-test", "outcome": "success"},
      {"operation": "implement-feature", "outcome": "success"},
      {"operation": "run-tests", "outcome": "success"}
    ],
    "outcome": "success",
    "reward": 0.95,
    "metadata": {
      "agent_type": "coder",
      "duration_ms": 1250,
      "files_changed": 5,
      "tests_passed": true,
      "coverage": 0.95
    }
  }'

# ============================================
# STEP 5: CONSOLIDATE - Prevent Forgetting
# ============================================

echo "🧠 Consolidating memory..."

# Consolidate patterns to prevent catastrophic forgetting
npx @archon-os/cli@latest neural consolidate --namespace reasoningbank

# Check consolidation status
npx @archon-os/cli@latest hooks intelligence stats --namespace reasoningbank

echo "✅ Learning cycle complete!"
```

---

### Example 2: Performance Engineer with SONA

From `.claude/agents/v3/performance-engineer.md`:

```javascript
// performance-engineer.ts
class PerformanceOptimizer {
  async optimizeAndTrack(component) {
    const sessionId = `perf-${Date.now()}`;

    // Start trajectory
    const trajectoryStart = await this.startTrajectory(sessionId, component);

    try {
      // Collect baseline metrics
      const baseline = await this.collectMetrics(component);

      // Apply optimizations
      const optimizations = [
        { type: 'FLASH_ATTENTION', enabled: true, expectedSpeedup: '2.49x-7.47x' },
        { type: 'HNSW_INDEXING', enabled: true, expectedImprovement: '150x-12500x' },
        { type: 'QUANTIZATION', method: 'int8', reduction: '50%' }
      ];

      // Apply each optimization and track
      for (const opt of optimizations) {
        const startTime = performance.now();

        const result = await this.applyOptimization(opt);

        const endTime = performance.now();

        // Track step
        await this.recordTrajectoryStep(sessionId, {
          operation: opt.type,
          outcome: result.success ? 'success' : 'failure',
          metrics: {
            duration_ms: endTime - startTime,
            improvement: result.improvement
          }
        });
      }

      // Measure new metrics
      const optimized = await this.collectMetrics(component);

      // Calculate quality score
      const qualityScore = this.calculateQuality(baseline, optimized);

      // End trajectory with verdict
      await this.endTrajectory(sessionId, {
        verdict: qualityScore > 0.85 ? 'success' : 'partial',
        reward: qualityScore
      });

      // Store pattern for learning
      await this.storeOptimizationPattern({
        component,
        optimizations,
        baseline,
        optimized,
        improvement: qualityScore,
        sessionId
      });

    } catch (error) {
      // Record failure
      await this.endTrajectory(sessionId, {
        verdict: 'failure',
        reward: 0.0,
        error: error.message
      });
      throw error;
    }
  }

  private async startTrajectory(sessionId, task) {
    return {
      sessionId,
      startTime: Date.now(),
      task
    };
  }

  private async recordTrajectoryStep(sessionId, step) {
    // Would execute: npx archon-os hooks intelligence trajectory-step
    console.log(`[${sessionId}] Step: ${step.operation} -> ${step.outcome}`);
  }

  private async endTrajectory(sessionId, result) {
    // Would execute: npx archon-os hooks intelligence trajectory-end
    console.log(`[${sessionId}] Verdict: ${result.verdict}, Reward: ${result.reward}`);
  }

  private calculateQuality(baseline, optimized) {
    // Calculate improvement ratio
    const cpuImprovement = baseline.cpu - optimized.cpu;
    const latencyImprovement = baseline.latency - optimized.latency;
    const memoryImprovement = baseline.memory - optimized.memory;

    // Weighted average
    return (
      (cpuImprovement * 0.3) +
      (latencyImprovement * 0.4) +
      (memoryImprovement * 0.3)
    ) / 100;
  }

  private async storeOptimizationPattern(pattern) {
    // MCP tool call
    console.log('Storing pattern:', pattern);
  }
}
```

---

### Example 3: Unified Memory Service with HNSW

From `.claude/agents/v3/v3-memory-specialist.md`:

```typescript
// memory-service.ts
import { HNSW } from 'ruvector';

class UnifiedMemoryService {
  private ruvector: ruvectorAdapter;
  private cache: MemoryCache;
  private indexer: HNSWIndexer;

  constructor() {
    this.indexer = new HNSWIndexer({
      dimensions: 1536,
      efConstruction: 200,
      M: 16,
      maxElements: 1000000
    });
  }

  /**
   * Store a memory entry with HNSW indexing
   */
  async store(entry: MemoryEntry): Promise<void> {
    // Generate embedding for entry
    const embedding = await this.generateEmbedding(entry.content);

    // Store in ruvector
    const storedEntry = {
      ...entry,
      embedding,
      createdAt: new Date()
    };

    await this.ruvector.store(storedEntry);

    // Index with HNSW (for 150x-12,500x faster search)
    await this.indexer.addPoint(entry.id, embedding);

    // Cache for hot access
    this.cache.set(entry.id, storedEntry);
  }

  /**
   * Query memory with semantic or structured search
   */
  async query(query: MemoryQuery): Promise<MemoryEntry[]> {
    if (query.semantic) {
      // Semantic search using HNSW vectors
      return this.semanticSearch(query);
    } else {
      // Structured query on ruvector
      return this.structuredQuery(query);
    }
  }

  /**
   * Semantic search with HNSW
   */
  private async semanticSearch(query: MemoryQuery): Promise<MemoryEntry[]> {
    // Generate embedding for query
    const queryEmbedding = await this.generateEmbedding(query.content);

    // Search HNSW index (very fast!)
    const startTime = performance.now();

    const results = await this.indexer.search(
      queryEmbedding,
      query.limit || 10
    );

    const searchTime = performance.now() - startTime;
    console.log(`HNSW search completed in ${searchTime.toFixed(2)}ms`);

    // Retrieve full entries
    const entries = await Promise.all(
      results.map(r => this.ruvector.get(r.id))
    );

    return entries.filter(e => e !== null);
  }

  /**
   * Structured query for filtering
   */
  private async structuredQuery(query: MemoryQuery): Promise<MemoryEntry[]> {
    return this.ruvector.query({
      filters: query.filters,
      orderBy: query.orderBy || 'createdAt'
    });
  }

  /**
   * Store SONA learning patterns
   */
  async storePattern(pattern: LearningPattern): Promise<void> {
    const embedding = await this.generateEmbedding(pattern.data);

    await this.store({
      id: pattern.id,
      content: pattern.data,
      metadata: {
        type: 'learning_pattern',
        sonaMode: pattern.mode,
        reward: pattern.reward,
        trajectory: pattern.trajectory,
        adaptationTime: pattern.adaptationTime
      },
      embedding
    });
  }

  /**
   * Retrieve patterns for SONA learning
   */
  async retrieveSimilarPatterns(query: string): Promise<LearningPattern[]> {
    const results = await this.query({
      type: 'semantic',
      content: query,
      filters: { type: 'learning_pattern' },
      limit: 5
    });

    return results.map(r => this.toLearningPattern(r));
  }

  private async generateEmbedding(content: string): Promise<number[]> {
    // Would call embeddings service
    return new Array(1536).fill(0);
  }

  private toLearningPattern(entry: MemoryEntry): LearningPattern {
    return {
      id: entry.id,
      data: entry.content,
      mode: entry.metadata?.sonaMode || 'balanced',
      reward: entry.metadata?.reward || 0.5,
      trajectory: entry.metadata?.trajectory || []
    };
  }
}
```

---

### Example 4: Hooks Integration

From `.claude/src/orchestration/workflow-coordinator.js`:

```javascript
// workflow-coordinator.js
class WorkflowCoordinator {
  async executePhase(phase, agentType) {
    const workflowId = `workflow-${Date.now()}`;

    // Pre-execution hook
    const preHook = `npx @archon-os/cli@latest hooks pre-task \
      --description "${phase.name}: ${agentType}"`;

    try {
      console.log(`[${phase.name}] Pre-hook: ${preHook}`);
      // Execute pre-hook: Initialize trajectory

      // Execute phase work
      const result = await this.executeWork(phase, agentType);

      // Post-execution hook
      const postHook = `npx @archon-os/cli@latest hooks post-task \
        --task-id "${workflowId}-${phase.name}"`;

      console.log(`[${phase.name}] Post-hook: ${postHook}`);
      // Execute post-hook: Store results

      return result;

    } catch (error) {
      // Record failure in trajectory
      console.error(`Phase ${phase.name} failed:`, error);
      throw error;
    }
  }

  async executeWork(phase, agentType) {
    // Simulate actual work
    return {
      phase: phase.name,
      agent: agentType,
      status: 'completed',
      output: 'Work output'
    };
  }
}
```

---

### Example 5: Pattern Distillation

```typescript
// pattern-distiller.ts
class PatternDistiller {
  /**
   * Distill successful patterns into reusable knowledge
   */
  async distillPattern(trajectory: Trajectory): Promise<Pattern> {
    const pattern: Pattern = {
      id: `pattern-${Date.now()}`,
      task: trajectory.task,
      approach: this.extractApproach(trajectory),
      steps: trajectory.steps,
      outcome: trajectory.verdict === 'success' ? 'success' : 'failure',
      reward: trajectory.reward,
      metadata: {
        agent_type: trajectory.agentType,
        duration_ms: trajectory.endTime - trajectory.startTime,
        files_changed: trajectory.metadata?.filesChanged || 0,
        tests_passed: trajectory.metadata?.testsPassed || false
      },
      embedding: await this.generateEmbedding(trajectory),
      created_at: new Date()
    };

    // Store in memory
    await this.memoryService.store({
      id: pattern.id,
      namespace: 'reasoningbank',
      key: `pattern:${pattern.task.replace(/\s+/g, '-')}`,
      value: JSON.stringify(pattern)
    });

    return pattern;
  }

  /**
   * Extract the approach/solution from trajectory
   */
  private extractApproach(trajectory: Trajectory): string {
    return trajectory.steps
      .filter(s => s.outcome === 'success')
      .map(s => s.operation)
      .join(' → ');
  }

  /**
   * Generate vector embedding for semantic search
   */
  private async generateEmbedding(trajectory: Trajectory): Promise<number[]> {
    const content = `Task: ${trajectory.task}\nApproach: ${trajectory.steps
      .map(s => s.operation)
      .join(', ')}\nOutcome: ${trajectory.verdict}`;

    // Would call embeddings service
    return new Array(1536).fill(Math.random());
  }
}
```

---

### Example 6: Consolidation (EWC++)

```typescript
// consolidation.ts
class ConsolidationManager {
  /**
   * Consolidate memory to prevent catastrophic forgetting
   */
  async consolidateMemory(namespace: string): Promise<void> {
    console.log(`Consolidating memory in namespace: ${namespace}`);

    // Step 1: Identify important patterns
    const importantPatterns = await this.identifyImportantPatterns(namespace);
    console.log(`Found ${importantPatterns.length} important patterns`);

    // Step 2: Calculate Fisher Information Matrix
    const fisherMatrix = await this.calculateFisherMatrix(importantPatterns);

    // Step 3: Set consolidation constraints
    for (const pattern of importantPatterns) {
      const importance = fisherMatrix.get(pattern.id) || 0.5;

      // Higher importance = larger penalty for changes
      pattern.consolidationPenalty = importance * 0.1;
    }

    // Step 4: Store consolidation metadata
    await this.storeConsolidationState({
      namespace,
      timestamp: Date.now(),
      patterns: importantPatterns.map(p => ({
        id: p.id,
        importance: fisherMatrix.get(p.id),
        penalty: p.consolidationPenalty
      }))
    });

    console.log(`Consolidation complete. ${importantPatterns.length} patterns protected.`);
  }

  /**
   * Identify patterns with high reward (important for performance)
   */
  private async identifyImportantPatterns(namespace: string): Promise<Pattern[]> {
    return await this.memoryService.query({
      type: 'structured',
      filters: {
        namespace,
        reward: { greaterThan: 0.8 }
      },
      limit: 100
    });
  }

  /**
   * Calculate Fisher Information Matrix
   * Higher value = more important for past learning
   */
  private async calculateFisherMatrix(patterns: Pattern[]): Promise<Map<string, number>> {
    const fisherMatrix = new Map<string, number>();

    for (const pattern of patterns) {
      // Fisher Information = gradient outer product
      // High reward patterns have higher Fisher information
      const fisherness = pattern.reward * pattern.reward;
      fisherMatrix.set(pattern.id, fisherness);
    }

    return fisherMatrix;
  }

  private async storeConsolidationState(state: any): Promise<void> {
    // Store consolidation metadata
    console.log('Stored consolidation state:', state);
  }
}
```

---

### Example 7: Complete Learning Loop

```typescript
// learning-loop.ts
class ReasoningBankLearner {
  /**
   * Complete 4-step intelligence pipeline
   */
  async runLearningCycle(task: string): Promise<void> {
    const sessionId = `rb-${Date.now()}`;

    console.log('🚀 Starting RuVector Learning Cycle');

    try {
      // ============================================
      // 1. RETRIEVE - Search for similar patterns
      // ============================================
      console.log('📚 RETRIEVE: Searching similar patterns...');

      const similarPatterns = await this.memory.search({
        query: task,
        namespace: 'reasoningbank',
        limit: 10,
        minReward: 0.8
      });

      console.log(`Found ${similarPatterns.length} similar patterns`);

      // ============================================
      // 2. JUDGE - Track trajectory with verdicts
      // ============================================
      console.log('📊 JUDGE: Starting trajectory tracking...');

      const trajectory = await this.startTrajectory(sessionId, {
        agentType: 'coder',
        task: task
      });

      // Execute work and track steps
      const steps = await this.executeWork(task, trajectory);

      // Assign verdict based on results
      const verdict = this.evaluateVerdicts(steps);

      // ============================================
      // 3. DISTILL - Extract and store pattern
      // ============================================
      console.log('🧠 DISTILL: Extracting learned patterns...');

      const pattern = await this.distiller.distillPattern({
        ...trajectory,
        steps,
        verdict: verdict.verdict,
        reward: verdict.reward
      });

      console.log(`Stored pattern: ${pattern.id}`);

      // ============================================
      // 4. CONSOLIDATE - Prevent forgetting
      // ============================================
      console.log('🔒 CONSOLIDATE: Consolidating memory...');

      await this.consolidation.consolidateMemory('reasoningbank');

      console.log('✅ Learning cycle complete');

    } catch (error) {
      console.error('❌ Learning cycle failed:', error);
      throw error;
    }
  }

  private async startTrajectory(sessionId: string, config: any): Promise<any> {
    return {
      sessionId,
      startTime: Date.now(),
      ...config
    };
  }

  private async executeWork(task: string, trajectory: any): Promise<any[]> {
    return [
      { operation: 'analyze', outcome: 'success' },
      { operation: 'design', outcome: 'success' },
      { operation: 'implement', outcome: 'success' },
      { operation: 'test', outcome: 'success' }
    ];
  }

  private evaluateVerdicts(steps: any[]): { verdict: string; reward: number } {
    const successCount = steps.filter(s => s.outcome === 'success').length;
    const totalCount = steps.length;

    const successRatio = successCount / totalCount;

    return {
      verdict: successRatio === 1 ? 'success' : 'partial',
      reward: successRatio * 0.9 + 0.1 // Reward between 0.1 and 1.0
    };
  }
}
```

---

## Usage Patterns

### CLI Commands

```bash
# Initialize trajectory
npx @archon-os/cli@latest hooks intelligence trajectory-start \
  --session-id "session-123" \
  --agent-type "coder" \
  --task "Implement feature"

# Track step
npx @archon-os/cli@latest hooks intelligence trajectory-step \
  --session-id "session-123" \
  --operation "write-code" \
  --outcome "success"

# End trajectory
npx @archon-os/cli@latest hooks intelligence trajectory-end \
  --session-id "session-123" \
  --verdict "success" \
  --reward 0.92

# Store pattern
mcp__archon-os__memory_usage --action="store" \
  --namespace="reasoningbank" \
  --key="pattern:feature-impl" \
  --value='{...}'

# Search patterns
mcp__archon-os__memory_search \
  --pattern="feature implementation" \
  --namespace="reasoningbank" \
  --limit=10

# Consolidate
npx @archon-os/cli@latest neural consolidate --namespace reasoningbank
```

---

## Key Types

```typescript
interface TrajectoryStep {
  operation: string;
  outcome: 'success' | 'failure';
  metadata?: Record<string, any>;
  timestamp?: Date;
}

interface Trajectory {
  sessionId: string;
  agentType: string;
  task: string;
  steps: TrajectoryStep[];
  verdict: 'success' | 'failure' | 'partial';
  reward: number; // 0.0 - 1.0
  startTime: number;
  endTime: number;
}

interface Pattern {
  id: string;
  task: string;
  approach: string;
  steps: TrajectoryStep[];
  outcome: 'success' | 'failure';
  reward: number;
  metadata: {
    agent_type: string;
    duration_ms: number;
    files_changed: number;
    tests_passed: boolean;
  };
  embedding: number[]; // 1536-dim vector
  created_at: Date;
}

interface MemoryQuery {
  type?: 'semantic' | 'structured';
  content?: string;
  filters?: Record<string, any>;
  limit?: number;
  threshold?: number;
}
```

---

**Document Version**: 1.0
**Status**: Reference Implementation
