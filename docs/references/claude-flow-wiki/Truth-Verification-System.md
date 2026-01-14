# Truth Verification System

## Overview

The Truth Verification System is a framework that provides verification and truth scoring for multi-agent operations in Claude-Flow. It includes real verification checks, training integration for continuous improvement, and practical tools for quality assurance.

**Important Note**: This system is currently a functional prototype that demonstrates verification concepts. While it performs real checks (compile, test, lint), full integration with all agent operations is still in development.

## Quick Start

### Initialize Verification System

```bash
# Initialize with specific mode (local version)
./claude-flow verify init strict      # Production mode (0.95 threshold)
./claude-flow verify init moderate    # Default mode (0.85 threshold)
./claude-flow verify init development # Development mode (0.75 threshold)

# After npm publish, will be available as:
npx claude-flow@alpha verify init strict
```

## Current Implementation Status

### ✅ What's Working

1. **Real Verification Checks**
   - Runs actual `npm run typecheck`, `npm test`, `npm run lint`
   - Returns real scores based on actual command output
   - Stores verification history in `.swarm/verification-memory.json`

2. **Truth Scoring & Reporting**
   ```bash
   ./claude-flow truth              # Basic truth scores
   ./claude-flow truth --report     # Detailed breakdown
   ./claude-flow truth --analyze    # Failure pattern analysis
   ./claude-flow truth --json       # Machine-readable output
   ./claude-flow truth --export report.json  # Export to file
   ```

3. **Training Integration (NEW!)**
   ```bash
   ./claude-flow verify-train status     # Show training status
   ./claude-flow verify-train feed       # Feed verification data to training
   ./claude-flow verify-train predict    # Predict verification outcomes
   ./claude-flow verify-train recommend  # Get agent recommendations
   ```

4. **Verification Hooks**
   ```bash
   # Manual verification hooks
   node src/cli/simple-commands/verification-hooks.js pre task-123 coder
   node src/cli/simple-commands/verification-hooks.js post task-123 coder
   node src/cli/simple-commands/verification-hooks.js status
   ```

### ⚠️ What's In Progress

1. **Automatic Integration**: Verification isn't automatically called by swarm/agent commands yet
2. **Limited Agent Types**: Only 4 agent types have specific verification logic
3. **Consensus Features**: Multi-agent consensus is simulated, not implemented

## Verification-Training Integration

### How Learning Works

The system uses **real machine learning** to improve over time:

1. **Exponential Moving Average**: Updates agent reliability scores with learning rate of 0.1
2. **Pattern Recognition**: Tracks which checks (compile, test, lint) succeed/fail most often
3. **Trend Detection**: Identifies if agents are improving or declining
4. **Predictive Scoring**: Predicts future verification outcomes based on history

### Example: System Learning in Action

```bash
# Initial state: coder agent at 62.5% reliability
./claude-flow verify-train status

# Feed verification data to training
./claude-flow verify-train feed

# After 10 successful verifications:
# - Coder reliability: 62.5% → 81.5% 
# - System shows: "📈 Agent coder is improving (+0.289)"
# - Prediction changes: "use_different_agent" → "add_additional_checks"
# - Confidence increases: 60% → 70%
```

### Training Data Storage

```
.claude-flow/
├── training/
│   └── verification-data.jsonl    # Training data in JSONL format
├── models/
│   ├── verification-model.json    # Main learning model
│   └── agent-coder.json          # Agent-specific models
└── metrics/
    └── agent-performance.json     # Performance metrics
```

## Actual Verification Process

### What Happens During Verification

```javascript
// For Coder Agents:
1. compile:   Runs 'npm run typecheck' → Score based on errors
2. test:      Runs 'npm test' → Score based on pass/fail
3. lint:      Runs 'npm run lint' → Score based on warnings/errors
4. typecheck: Runs 'npm run typecheck' → Score based on errors

// Scores:
- No errors: 1.0
- Warnings only: 0.8
- Errors: 0.5
- Command fails: 0.3
```

### Real Rollback Mechanism

When verification fails and rollback is enabled:
```bash
# Set environment variable
export VERIFICATION_ROLLBACK=true

# If verification fails, system runs:
git reset --hard HEAD

# You'll see:
"🔄 Attempting rollback..."
"✅ Rollback completed"
```

## CLI Commands

### Verification Commands

```bash
# Initialize verification system
./claude-flow verify init <mode>

# Run verification on a task
./claude-flow verify verify task-123 --agent coder

# Check verification status
./claude-flow verify status
```

### Truth Scoring Commands

```bash
# Basic truth report
./claude-flow truth

# Detailed analysis options
./claude-flow truth --report           # Detailed breakdown
./claude-flow truth --analyze          # Failure patterns
./claude-flow truth --agent coder      # Agent-specific
./claude-flow truth --detailed         # With history
./claude-flow truth --json            # JSON output only
./claude-flow truth --export file.json # Export to file
```

### Training Integration Commands

```bash
# Check training status
./claude-flow verify-train status

# Feed existing verifications to training
./claude-flow verify-train feed

# Predict if a task will pass
./claude-flow verify-train predict default coder
# Output: Predicted Score: 0.613, Confidence: 70%

# Get agent recommendation
./claude-flow verify-train recommend
# Output: Recommended: coder, Reliability: 81.5%

# Get improvement recommendations
./claude-flow verify-train recommendations
```

## Environment Variables

```bash
# Set verification mode
export VERIFICATION_MODE=strict        # strict/moderate/development

# Enable automatic rollback
export VERIFICATION_ROLLBACK=true

# Custom threshold
export VERIFICATION_THRESHOLD=0.95
```

## Integration Examples

### Manual Verification in Scripts

```bash
#!/bin/bash
# Run pre-task verification
node src/cli/simple-commands/verification-hooks.js pre $TASK_ID coder

# Execute task
npm run build

# Run post-task verification
node src/cli/simple-commands/verification-hooks.js post $TASK_ID coder

# Feed results to training
node src/cli/simple-commands/verification-hooks.js train $TASK_ID coder
```

### CI/CD Integration

```yaml
name: Verification Pipeline
on: [push]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Verification
        run: |
          ./claude-flow verify init strict
          ./claude-flow verify verify ${{ github.sha }} --agent coder
      
      - name: Check Truth Score
        run: |
          SCORE=$(./claude-flow truth --json | jq .averageScore)
          echo "Truth score: $SCORE"
          if (( $(echo "$SCORE < 0.85" | bc -l) )); then
            exit 1
          fi
```

## How Training Improves the System

### Learning Cycle

1. **Verification Runs** → Generates scores (pass/fail)
2. **Training Ingests** → Updates agent reliability scores
3. **Pattern Detection** → Identifies common failure points
4. **Prediction Improves** → Better task outcome predictions
5. **Recommendations Update** → Suggests best agents for tasks

### Agent Performance Tracking

```json
// Example: .claude-flow/models/agent-coder.json
{
  "agentType": "coder",
  "totalTasks": 72,
  "successfulTasks": 12,
  "averageScore": 0.815,
  "trend": {
    "direction": "improving",
    "change": 0.289,
    "recentAverage": 0.914,
    "previousAverage": 0.625
  },
  "checkPerformance": {
    "compile": { "total": 20, "passed": 15, "avgScore": 0.75 },
    "test": { "total": 20, "passed": 10, "avgScore": 0.50 },
    "lint": { "total": 20, "passed": 18, "avgScore": 0.90 }
  }
}
```

## Current Limitations

### Integration Gaps

1. **Not Auto-Integrated**: You need to manually run verification commands
2. **Basic Checks Only**: Runs npm scripts, not sophisticated analysis
3. **Limited Agent Types**: Only coder, reviewer, tester, architect have specific logic
4. **No Real Consensus**: Multi-agent consensus is simulated

### What's Simulated vs Real

| Feature | Status | Details |
|---------|--------|---------|
| Compile Check | ✅ Real | Runs actual `npm run typecheck` |
| Test Execution | ✅ Real | Runs actual `npm test` |
| Lint Check | ✅ Real | Runs actual `npm run lint` |
| Git Rollback | ✅ Real | Runs actual `git reset --hard` |
| Training System | ✅ Real | Real learning with persistence |
| Agent Consensus | ❌ Simulated | Returns hardcoded values |
| Byzantine Tolerance | ❌ Simulated | Not implemented |
| Cryptographic Signing | ❌ Simulated | Not implemented |

## Best Practices

### 1. Regular Training Updates

```bash
# Daily: Feed new verification data to training
./claude-flow verify-train feed

# Weekly: Check training recommendations
./claude-flow verify-train recommendations

# Monthly: Review agent performance trends
./claude-flow verify-train status
```

### 2. Monitor Agent Reliability

```bash
# Check which agents are performing well
./claude-flow verify-train status | grep "Agent Reliability"

# Get recommendations for underperforming agents
./claude-flow verify-train recommendations
```

### 3. Use Predictions for Task Planning

```bash
# Before assigning a task, check predicted success
./claude-flow verify-train predict default coder

# If prediction is low, consider:
# - Using a different agent
# - Adding additional checks
# - Reviewing recent failures
```

## Troubleshooting

### Low Truth Scores

```bash
# Analyze what's failing
./claude-flow truth --analyze

# Check specific agent
./claude-flow truth --agent coder --detailed

# Review training recommendations
./claude-flow verify-train recommendations
```

### Verification Not Running

```bash
# Check if npm scripts exist
npm run typecheck  # Should be defined in package.json
npm run test       # Should be defined in package.json
npm run lint       # Should be defined in package.json

# Run manual verification
node src/cli/simple-commands/verification-hooks.js status
```

### Training Not Improving

```bash
# Check if data is being fed
./claude-flow verify-train status
# Look for "Training Data Points" - should be increasing

# Manually trigger learning
./claude-flow verify-train feed

# Check agent trends
cat .claude-flow/models/agent-coder.json | jq '.trend'
```

## Future Development

### Planned Improvements

1. **Auto-Integration**: Automatic verification for all agent operations
2. **Deep Code Analysis**: AST-based verification, not just npm scripts
3. **Real Consensus**: Actual multi-agent voting system
4. **Smart Rollback**: Selective rollback of only failed changes
5. **Dashboard UI**: Web interface for monitoring verification metrics

### How to Contribute

The verification system is ready for enhancement. Key areas:

1. **Integration Points**: Add verification hooks to swarm/agent commands
2. **Check Types**: Add more verification checks beyond compile/test/lint
3. **Agent Types**: Add verification logic for more agent types
4. **Training Models**: Improve prediction algorithms

## Related Documentation

- [Training Pipeline](./Training-Pipeline.md) - Machine learning system for continuous improvement
- [Verification-Training Integration](./Verification-Training-Integration.md) - How verification feeds training
- [Verification Integration Guide](../docs/verification-integration.md)
- [Pair Programming System](./Pair-Programming-System.md) - Collaborative development with verification
- [Agent System Overview](./Agent-System-Overview.md)
- [Performance Benchmarking](./Performance-Benchmarking.md)

---

*The Truth Verification System provides a foundation for quality assurance in AI-generated code. While not fully integrated, it offers real verification checks, learning capabilities, and practical tools for improving agent reliability over time.*