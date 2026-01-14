# 📊 Claude Flow Benchmark System

## 🚀 Overview

The Claude Flow Benchmark System provides comprehensive performance testing and analysis for AI agent orchestration, swarm coordination, and development workflows. It enables systematic evaluation of different coordination strategies, agent configurations, and task execution patterns.

**Key Update (v2.0.0-alpha.88)**: The benchmark CLI now uses real claude-flow execution by default. The `real` subcommand is deprecated - use direct commands: `swarm`, `hive-mind`, and `sparc`.

## 🎯 Key Features

- **Swarm Performance Testing** - Evaluate multi-agent coordination effectiveness
- **SPARC Mode Benchmarking** - Test-driven development workflow analysis
- **Hive-Mind Intelligence Testing** - Collective decision-making performance
- **Real Execution Metrics** - Token usage, execution time, agent efficiency
- **Comparative Analysis** - Side-by-side strategy comparison
- **Non-Interactive Mode** - Full automation for CI/CD pipelines
- **Comprehensive Reporting** - HTML, JSON, and Markdown outputs

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- Claude CLI (for real swarm execution)
- 8GB+ RAM recommended for large swarms

### Setup

```bash
# Clone the repository
git clone https://github.com/ruvnet/claude-flow
cd claude-flow/benchmark

# Install Python dependencies
pip install -r requirements.txt

# Install Claude Flow CLI
npm install -g claude-flow@alpha

# Verify installation
swarm-bench --version
```

## 🖥️ Swarm-Bench CLI

The `swarm-bench` CLI is the primary interface for running benchmarks.

### Basic Usage

```bash
# Run a swarm benchmark (always uses real claude-flow)
swarm-bench swarm "Build a REST API" --strategy development

# Run with specific agent count
swarm-bench swarm "Create authentication system" --max-agents 8

# Run hive-mind benchmark
swarm-bench hive-mind "Design architecture" --max-workers 8

# Run SPARC mode (mode before task)
swarm-bench sparc coder "Create user service"

# Run with parallel execution and monitoring
swarm-bench swarm "Implement database schema" --parallel --monitor

# List recent benchmark runs
swarm-bench list

# Show details for a specific run
swarm-bench show <run-id>

# Use mock execution for testing (without claude-flow)
swarm-bench run "Test objective" --mock
```

### Command Structure

```bash
swarm-bench [command] [options]
```

#### Commands

| Command | Description | Example |
|---------|-------------|---------|
| `swarm` | Run real swarm benchmarks | `swarm-bench swarm "Build API" --strategy development` |
| `hive-mind` | Run hive-mind benchmarks | `swarm-bench hive-mind "Design system" --max-workers 8` |
| `sparc` | Run SPARC mode benchmarks | `swarm-bench sparc coder "Implement feature"` |
| `run` | Run benchmark (with --mock option) | `swarm-bench run "Test" --mock` |
| `list` | List recent benchmark runs | `swarm-bench list` |
| `show` | Show details for a run | `swarm-bench show <run-id>` |
| `serve` | Start web interface | `swarm-bench serve` |
| `clean` | Clean up results | `swarm-bench clean` |

### 🔧 CLI Options

#### Global Options
```bash
-v, --verbose            # Enable verbose output
-c, --config PATH        # Configuration file path
--mock                   # Use mock execution instead of real claude-flow
--claude-flow-path TEXT  # Path to claude-flow (default: ./claude-flow)
--timeout INTEGER        # Command timeout in seconds
--stream / --no-stream   # Stream output
--version               # Show version
--help                  # Show help message
```

#### Swarm Command Options
```bash
swarm-bench swarm OBJECTIVE [OPTIONS]

Positional:
  OBJECTIVE              # The goal or task for claude-flow (required)

Options:
  --strategy [auto|research|development|analysis|testing|optimization|maintenance]
  --mode [centralized|distributed|hierarchical|mesh|hybrid]
  --sparc-mode TEXT     # Specific SPARC mode to test
  --all-modes          # Test all SPARC modes and swarm strategies
  --max-agents INTEGER  # Maximum agents (default: 5)
  --timeout INTEGER     # Timeout in minutes (default: 60)
  --task-timeout INTEGER # Individual task timeout in seconds (default: 300)
  --parallel           # Enable parallel execution
  --monitor            # Enable monitoring
  -o, --output [json|sqlite]  # Output formats
  --output-dir PATH     # Output directory (default: ./reports)
  --name TEXT           # Benchmark name
  --description TEXT    # Benchmark description
```

#### Hive-Mind Command Options
```bash
swarm-bench hive-mind TASK [OPTIONS]

Positional:
  TASK                   # The task for the hive-mind (required)

Options:
  --queen-type [strategic|tactical|adaptive]  # Queen type (default: strategic)
  --max-workers INTEGER  # Maximum worker agents (default: 8)
  --consensus [majority|weighted|byzantine]  # Consensus algorithm (default: majority)
  --timeout INTEGER     # Timeout in minutes (default: 60)
  --monitor            # Enable monitoring
  --output-dir PATH    # Output directory (default: ./reports)
```

#### SPARC Command Options
```bash
swarm-bench sparc MODE TASK [OPTIONS]

Positional:
  MODE                  # SPARC mode: coder|architect|tdd|reviewer|tester|optimizer|documenter|debugger
  TASK                  # The task to accomplish (required)

Options:
  --namespace TEXT      # Memory namespace
  --timeout INTEGER     # Timeout in minutes (default: 60)
  --non-interactive    # Non-interactive mode (default: True)
  --output-dir PATH    # Output directory (default: ./reports)
```

## 📊 Benchmark Modes

### 1. Swarm Mode
Tests multi-agent coordination with different topologies:

```bash
# Hierarchical topology
swarm-bench swarm "Build e-commerce platform" \
  --mode hierarchical --max-agents 8

# Mesh topology for collaborative tasks
swarm-bench swarm "Research and implement ML pipeline" \
  --mode mesh --max-agents 5

# Distributed mode with monitoring
swarm-bench swarm "Refactor legacy codebase" \
  --mode distributed --monitor

# Development strategy with parallel execution
swarm-bench swarm "Build authentication system" \
  --strategy development --max-agents 6 --parallel

# Test all SPARC modes
swarm-bench swarm "Shopping cart feature" \
  --all-modes --parallel
```

### 2. Hive-Mind Mode
Tests collective intelligence and consensus:

```bash
# Basic hive-mind benchmark
swarm-bench hive-mind "Design microservices architecture" \
  --max-workers 8

# With adaptive queen type
swarm-bench hive-mind "Solve complex problem" \
  --queen-type adaptive --max-workers 10

# Byzantine consensus for critical tasks
swarm-bench hive-mind "Critical security audit" \
  --consensus byzantine --max-workers 7 --monitor
```

### 3. SPARC Mode
Tests different SPARC development phases:

```bash
# Run SPARC benchmark (mode is positional argument before task)
swarm-bench sparc coder "Create user service"

# Different SPARC modes
swarm-bench sparc architect "Design microservices"
swarm-bench sparc tdd "Create test suite"
swarm-bench sparc reviewer "Review codebase"
swarm-bench sparc optimizer "Optimize performance"
swarm-bench sparc debugger "Fix critical bug"

# With memory namespace
swarm-bench sparc coder "Implement authentication" \
  --namespace auth-project --timeout 120
```

## 📈 Metrics and Analysis

### Core Metrics

| Metric | Description | Unit |
|--------|-------------|------|
| `execution_time` | Total execution duration | seconds |
| `input_tokens` | Tokens consumed by inputs | count |
| `output_tokens` | Tokens generated | count |
| `agents_spawned` | Number of agents created | count |
| `tasks_completed` | Successfully completed tasks | count |
| `coordination_efficiency` | Inter-agent coordination score | 0-100% |
| `memory_usage` | Peak memory consumption | MB |
| `error_rate` | Task failure percentage | % |

### Performance Indicators

```python
# Example metric thresholds
{
  "execution_time": {"max": 300, "target": 150},
  "token_efficiency": {"min": 0.7, "target": 0.85},
  "success_rate": {"min": 0.95, "target": 0.99},
  "coordination_score": {"min": 80, "target": 90}
}
```

## 🔄 Configuration

### YAML Configuration

Create `benchmark-config.yaml`:

```yaml
benchmark:
  name: "API Development Benchmark"
  description: "Test REST API creation efficiency"
  
  defaults:
    mode: swarm
    agents: 6
    timeout: 1800
    iterations: 3
    
  tasks:
    - name: "Simple CRUD API"
      description: "Build basic CRUD endpoints"
      complexity: low
      expected_time: 120
      
    - name: "Authenticated API" 
      description: "API with JWT authentication"
      complexity: medium
      expected_time: 300
      
    - name: "Microservices API"
      description: "Multi-service architecture"
      complexity: high
      expected_time: 600
      
  strategies:
    - hierarchical
    - mesh
    - adaptive
    
  metrics:
    collect:
      - execution_time
      - token_usage
      - agent_efficiency
      - coordination_score
    
  output:
    format: html
    include_charts: true
    export_raw: true
```

### Python Configuration

```python
from swarm_benchmark import BenchmarkConfig, SwarmBenchmark

config = BenchmarkConfig(
    name="Custom Benchmark",
    mode="swarm",
    default_agents=6,
    timeout=1800,
    strategies=["hierarchical", "mesh"],
    metrics=["execution_time", "token_usage"]
)

benchmark = SwarmBenchmark(config)
results = benchmark.run(task="Build authentication system")
```

## 🏃 Running Benchmarks

### Quick Start Examples

```bash
# 1. Simple swarm benchmark
swarm-bench swarm "Create TODO app with React" --strategy development

# 2. Hive-mind benchmark
swarm-bench hive-mind "Design payment system" --max-workers 8

# 3. SPARC mode benchmark
swarm-bench sparc coder "Build authentication"

# 4. CI/CD integration with parallel execution
swarm-bench swarm "$TASK" \
  --parallel \
  --output json \
  --output-dir ./results
```

### Advanced Usage

```bash
# Swarm with all SPARC modes testing
swarm-bench swarm "Build microservices platform" \
  --all-modes \
  --parallel \
  --timeout 120 \
  --max-agents 10

# Hive-mind with Byzantine consensus
swarm-bench hive-mind "Performance-critical API" \
  --consensus byzantine \
  --max-workers 12 \
  --queen-type tactical

# SPARC with namespace and extended timeout
swarm-bench sparc architect "Complex system refactoring" \
  --namespace project-v2 \
  --timeout 180

# Custom configuration with verbose output
swarm-bench swarm "Enterprise application" \
  -c custom-config.yaml \
  --strategy optimization \
  --max-agents 15 \
  -v
```

## 📊 Output Formats

### HTML Report
HTML output format is available through the swarm command:

```bash
swarm-bench run "Build API" --output html --output-dir ./reports
```

Note: The HTML output is currently basic. Enhanced visualization features are planned for future releases.

### JSON Output
Structured data for programmatic analysis:

```json
{
  "benchmark": {
    "id": "bench-2024-01-15-001",
    "task": "Build REST API",
    "mode": "swarm",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "results": {
    "execution_time": 245.3,
    "input_tokens": 15234,
    "output_tokens": 48291,
    "agents_spawned": 6,
    "tasks_completed": 12,
    "success_rate": 1.0
  },
  "analysis": {
    "efficiency_score": 87.5,
    "coordination_score": 92.3,
    "recommendations": [...]
  }
}
```

### Viewing Results
To view benchmark results, use the `show` command:

```bash
swarm-bench show <benchmark-id> --format json
```

## 🔌 CI/CD Integration

### GitHub Actions

```yaml
name: Benchmark Suite

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:

jobs:
  benchmark:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'
        
    - name: Install dependencies
      run: |
        pip install -r benchmark/requirements.txt
        npm install -g claude-flow@alpha
        
    - name: Run benchmarks
      run: |
        cd benchmark
        swarm-bench swarm "Run test suite" \
          --strategy auto \
          --output json \
          --output-dir ./results
          
    - name: Upload results
      uses: actions/upload-artifact@v3
      with:
        name: benchmark-results
        path: benchmark/results/
        
    - name: List benchmark results
      run: |
        cd benchmark
        swarm-bench list --format json > results-list.json
        
    - name: Comment on PR
      if: github.event_name == 'pull_request'
      run: |
        cd benchmark
        echo "## Benchmark Results" > comment.md
        swarm-bench list >> comment.md
        gh pr comment $PR_NUMBER --body-file comment.md
```

### Docker Support

```dockerfile
FROM python:3.10-slim

WORKDIR /benchmark

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Install Node.js and Claude Flow
RUN apt-get update && apt-get install -y nodejs npm
RUN npm install -g claude-flow@alpha

# Copy benchmark code
COPY . .

# Run benchmark
ENTRYPOINT ["swarm-bench"]
CMD ["swarm", "Default benchmark", "--strategy", "auto"]
```

## 🧪 Testing Strategies

### Performance Testing

```bash
# Load testing with increasing agent counts
for agents in 2 4 6 8 10 12; do
  swarm-bench swarm "Scale test" --max-agents $agents \
    --output json --output-dir ./results
done

# Stress testing with complex tasks
swarm-bench swarm "Build complete SaaS platform" \
  --max-agents 12 --timeout 120 --mode distributed
```

### Regression Testing

```bash
# Run benchmark and save results
swarm-bench swarm "Standard benchmark suite" \
  --output json --output-dir ./baseline

# Run current version
swarm-bench swarm "Standard benchmark suite" \
  --output json --output-dir ./current

# Compare results manually or with custom scripts
```

## 📈 Best Practices

### 1. Task Design
- Use consistent, measurable tasks
- Include complexity indicators
- Define clear success criteria
- Provide adequate context

### 2. Agent Configuration
- Start with auto-detection
- Scale based on task complexity
- Balance agent types
- Monitor coordination overhead

### 3. Metric Selection
- Focus on relevant metrics
- Set realistic thresholds
- Track trends over time
- Consider cost vs performance

### 4. Automation
- Use non-interactive mode for CI/CD
- Implement regression checks
- Archive historical results
- Generate automated reports

## 🔍 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Timeout errors | Increase `--timeout` or optimize task |
| High token usage | Reduce agent count or use efficient strategies |
| Low coordination score | Switch to mesh or adaptive topology |
| Inconsistent results | Increase iterations for statistical significance |

### Debug Mode

```bash
# Enable detailed logging
swarm-bench swarm "Debug test" -v

# Run with mock execution for testing
swarm-bench run "Test task" --mock

# Check configuration
swarm-bench --version
swarm-bench --help
```

## 📚 Advanced Topics

### Custom Executors

```python
from swarm_benchmark.core import BaseExecutor

class CustomExecutor(BaseExecutor):
    def execute_swarm(self, config):
        # Custom swarm execution logic
        pass
    
    def execute_sparc(self, config):
        # Custom SPARC execution logic
        pass

# Register custom executor
benchmark = SwarmBenchmark(executor=CustomExecutor())
```

### Statistical Analysis

```python
from swarm_benchmark.analysis import StatisticalAnalyzer

analyzer = StatisticalAnalyzer()
results = analyzer.compare_strategies(
    data=benchmark_results,
    test="anova",
    confidence=0.95
)

print(f"P-value: {results.p_value}")
print(f"Significant difference: {results.is_significant}")
```

## 🔗 Related Documentation

### Benchmarking Guides
- **[SWE-bench Evaluation](SWE-Bench-Evaluation)** - Official software engineering benchmark
- **[Performance Benchmarking](Performance-Benchmarking)** - Comprehensive performance testing guide
- [Agent Performance Analysis](Agent-Categories) - Understanding agent efficiency
- [Multi-Mode Comparison](Workflow-Orchestration) - Comparing execution strategies

### Core System Documentation  
- [Swarm Orchestration](Workflow-Orchestration)
- [Agent System Overview](Agent-System-Overview)
- [SPARC Methodology](SPARC-Methodology)
- [Performance Optimization](Development-Patterns)
- [Non-Interactive Mode](Non-Interactive-Mode)

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/ruvnet/claude-flow/issues)
- **Documentation**: [Full documentation](https://github.com/ruvnet/claude-flow/wiki)
- **Examples**: [Benchmark examples](https://github.com/ruvnet/claude-flow/tree/main/benchmark/examples)

---

*Claude Flow Benchmark System - Measure, analyze, and optimize AI agent performance*