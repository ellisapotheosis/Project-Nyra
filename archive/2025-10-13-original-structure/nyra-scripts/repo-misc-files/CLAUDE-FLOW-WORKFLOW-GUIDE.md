# NYRA Claude-Flow & Flow-Nexus Workflow Wizard Guide

## 🚀 Overview

This guide provides comprehensive instructions for using claude-flow and flow-nexus workflow wizards for document cleaning, ingestion, and multi-agent coordination in the NYRA mortgage assistant ecosystem.

## 📋 Table of Contents

1. [Claude-Flow Workflow Wizards](#claude-flow-workflow-wizards)
2. [Flow-Nexus Workflow Management](#flow-nexus-workflow-management)
3. [Hive-Mind and Swarm Coordination](#hive-mind-and-swarm-coordination)
4. [Document Cleaning Workflows](#document-cleaning-workflows)
5. [MCP Server Integration](#mcp-server-integration)
6. [Troubleshooting](#troubleshooting)

---

## 🤖 Claude-Flow Workflow Wizards

### Getting Started with Claude-Flow

#### 1. Initialize Your Environment
```powershell
# Navigate to project root
cd "C:\Dev\DevProjects\Personal-Projects\Project-Nyra"

# Initialize claude-flow (if not already done)
npx claude-flow@alpha init --force

# Check system status
npx claude-flow@alpha status
```

#### 2. Available Claude-Flow Commands

##### **Hive-Mind Operations**
```bash
# Initialize hive-mind system
npx claude-flow@alpha hive-mind init

# Spawn a new hive-mind session with agents
npx claude-flow@alpha hive-mind spawn "clean documents and extract insights" --claude

# Resume an existing session
npx claude-flow@alpha hive-mind resume session-xxxxx-xxxxx

# List active hive-mind sessions  
npx claude-flow@alpha hive-mind list

# Get hive-mind status
npx claude-flow@alpha hive-mind status
```

##### **Agent Management**
```bash
# List available agents
npx claude-flow@alpha agents list

# Get agent categories
npx claude-flow@alpha agents categories

# Spawn specific agent types
npx claude-flow@alpha swarm "analyze mortgage documents" --agents researcher,coder,reviewer --claude
```

##### **SPARC Workflows**
```bash
# List available SPARC modes
npx claude-flow@alpha sparc modes

# Run SPARC workflow for document processing
npx claude-flow@alpha sparc run document-cleaner "process mortgage applications"

# Use batch processing
npx claude-flow@alpha sparc batch researcher,analyzer "mortgage document analysis"

# TDD workflow
npx claude-flow@alpha sparc tdd "document validation system"
```

### 🔄 Creating Custom Workflows

#### Step 1: Workflow Definition
Create a new workflow file in `Cleaning-Setup/workflows/`:

```yaml
# custom-workflow.yaml
name: mortgage-document-analysis
description: "Complete mortgage document analysis with AI agents"
version: "1.0.0"

# Agent configuration
agents:
  - type: researcher
    role: "Document analyzer"
    capabilities: ["document_analysis", "data_extraction"]
  - type: coder
    role: "Data processor"  
    capabilities: ["data_transformation", "api_integration"]
  - type: reviewer
    role: "Quality controller"
    capabilities: ["validation", "compliance_check"]

# Workflow stages
stages:
  - name: analyze
    agent: researcher
    task: "Analyze uploaded mortgage documents for completeness"
    output: "analysis_report.json"
    
  - name: extract
    agent: coder
    task: "Extract key data points from documents"
    depends_on: ["analyze"]
    output: "extracted_data.json"
    
  - name: validate
    agent: reviewer
    task: "Validate extracted data for compliance"
    depends_on: ["extract"]
    output: "validation_report.json"

# Integration settings
integration:
  mcp_servers: ["notion", "filesystem", "fastmcp"]
  channels: ["claude-flow-documents", "claude-flow-workflows"]
```

#### Step 2: Execute Custom Workflow
```bash
# Run the custom workflow
npx claude-flow@alpha run workflows/custom-workflow.yaml --claude

# Run with specific input/output directories  
npx claude-flow@alpha run workflows/custom-workflow.yaml --input ./raw-documents --output ./processed-documents
```

---

## 🌊 Flow-Nexus Workflow Management

### Flow-Nexus Setup and Commands

#### 1. Basic Flow-Nexus Operations
```bash
# Check flow-nexus version and capabilities
npx flow-nexus@latest --version
npx flow-nexus@latest --help

# List available flow templates
npx flow-nexus@latest list templates

# Create a new workflow
npx flow-nexus@latest create workflow document-processing --template basic

# List existing workflows
npx flow-nexus@latest list workflows
```

#### 2. Advanced Flow-Nexus Features
```bash
# Create complex multi-stage workflow
npx flow-nexus@latest create workflow nyra-mortgage-pipeline --template advanced

# Set workflow parameters
npx flow-nexus@latest config workflow nyra-mortgage-pipeline \
  --param input_dir="./raw-documents" \
  --param output_dir="./processed-documents" \
  --param ai_model="claude-3-haiku"

# Execute workflow with monitoring
npx flow-nexus@latest run workflow nyra-mortgage-pipeline --monitor --verbose
```

#### 3. Flow-Nexus Integration with Claude-Flow
```bash
# Create integrated flow that uses claude-flow agents
npx flow-nexus@latest create workflow claude-integration \
  --integration claude-flow \
  --agents "researcher,coder,reviewer"

# Run integrated workflow
npx flow-nexus@latest run workflow claude-integration --claude-flow
```

### 🔧 Flow-Nexus Configuration

Create a flow configuration file `flow-nexus-config.json`:

```json
{
  "workflow": {
    "name": "nyra-document-pipeline",
    "description": "Complete mortgage document processing pipeline",
    "version": "1.0.0"
  },
  "stages": [
    {
      "name": "intake",
      "type": "file_processor",
      "config": {
        "input_formats": ["pdf", "docx", "txt"],
        "output_format": "json",
        "processors": ["ocr", "text_extraction"]
      }
    },
    {
      "name": "analysis",
      "type": "ai_processor", 
      "config": {
        "model": "claude-3-haiku",
        "task": "document_analysis",
        "output_schema": "./schemas/analysis-schema.json"
      }
    },
    {
      "name": "validation",
      "type": "validation_processor",
      "config": {
        "rules": "./validation/mortgage-rules.json",
        "compliance_checks": true
      }
    },
    {
      "name": "storage",
      "type": "storage_processor",
      "config": {
        "vector_store": "chromadb",
        "knowledge_base": "notion",
        "backup": true
      }
    }
  ],
  "integrations": {
    "claude_flow": {
      "enabled": true,
      "agents": ["researcher", "analyst", "validator"],
      "coordination": "hive-mind"
    },
    "mcp_servers": {
      "notion": "knowledge_storage",
      "filesystem": "file_operations", 
      "fastmcp": "external_apis"
    }
  }
}
```

---

## 🧠 Hive-Mind and Swarm Coordination

### Understanding Hive-Mind Architecture

The hive-mind system enables multiple AI agents to work collaboratively on complex tasks:

#### 1. Hive-Mind Session Management
```bash
# Start a comprehensive document processing session
npx claude-flow@alpha hive-mind spawn \
  "Process mortgage applications and extract key insights" \
  --namespace mortgage-processing \
  --agents researcher,analyst,coder,reviewer \
  --claude

# Monitor session progress
npx claude-flow@alpha hive-mind monitor session-xxxxx-xxxxx

# Get session results
npx claude-flow@alpha hive-mind results session-xxxxx-xxxxx
```

#### 2. Swarm Intelligence Features
```bash
# Initialize swarm for distributed processing
npx claude-flow@alpha swarm init --type research --agents 5

# Run swarm analysis
npx claude-flow@alpha swarm "Analyze 100 mortgage documents for compliance patterns" --parallel

# Coordinate ruv-swarm for advanced coordination
npx ruv-swarm@latest coordinate --task "document-analysis" --agents 8
```

### 🎯 Advanced Coordination Patterns

#### Pattern 1: Research and Analysis Swarm
```bash
# Step 1: Initialize research swarm
npx claude-flow@alpha hive-mind spawn \
  "Research mortgage industry trends and regulations" \
  --agents researcher,analyst --claude

# Step 2: Coordinate with data extraction
npx claude-flow@alpha swarm "Extract trends from research data" \
  --agents coder,data-analyst --claude

# Step 3: Synthesize findings
npx claude-flow@alpha hive-mind spawn \
  "Synthesize research findings into actionable insights" \
  --agents reviewer,synthesizer --claude
```

#### Pattern 2: Document Processing Pipeline
```bash
# Parallel document processing with coordination
npx claude-flow@alpha hive-mind spawn \
  "Process mortgage documents through complete pipeline" \
  --namespace document-pipeline \
  --agents document-processor,validator,indexer \
  --coordination-mode pipeline \
  --claude
```

---

## 📄 Document Cleaning Workflows

### Running the Complete Document Cleaning Workflow

#### Method 1: Using the Pre-built Workflow
```powershell
# Navigate to Cleaning-Setup directory
cd "C:\Dev\DevProjects\Personal-Projects\Project-Nyra\Cleaning-Setup"

# Run the complete cleaning workflow
.\scripts\mcp-wrappers\claude-flow-clean.bat

# Alternative: Run with custom parameters
.\scripts\mcp-wrappers\claude-flow-workflow.bat clean-documents.yaml ./custom-input ./custom-output
```

#### Method 2: Using Claude-Flow Commands Directly
```bash
# Run cleaning workflow with claude-flow
cd "C:\Dev\DevProjects\Personal-Projects\Project-Nyra"
npx claude-flow@alpha run Cleaning-Setup/workflows/clean-documents.yaml --claude

# Run with hive-mind coordination
npx claude-flow@alpha hive-mind spawn \
  "Clean and process documents in Cleaning-Setup/raw-documents" \
  --namespace document-cleaning \
  --claude
```

#### Method 3: Python Script Integration
```powershell
# Direct Python execution
cd "C:\Dev\DevProjects\Personal-Projects\Project-Nyra\Cleaning-Setup"
python scripts\document_processor.py

# With custom configuration
python scripts\document_processor.py --config custom-llamaindex.config.yaml
```

### 📊 Monitoring Document Processing

#### Real-time Monitoring
```bash
# Monitor active workflows
npx claude-flow@alpha workflows list

# Get workflow status
npx claude-flow@alpha workflow status document-cleaning-pipeline

# View processing logs
npx claude-flow@alpha logs --workflow document-cleaning --tail
```

#### Progress Tracking
```bash
# Check hive-mind session progress
npx claude-flow@alpha hive-mind progress session-xxxxx-xxxxx

# View metrics and performance
npx claude-flow@alpha metrics --session session-xxxxx-xxxxx
```

---

## 🔌 MCP Server Integration

### Coordinating Multiple MCP Servers

#### 1. Meta-MCP Channel Management
```bash
# List available MCP channels
npx claude-flow@alpha mcp channels list

# Switch to specific channel
npx claude-flow@alpha mcp channel use claude-flow-documents

# Route heavy operations to separate channel
npx claude-flow@alpha mcp route desktop-commander heavy-mcp-desktop
```

#### 2. FastMCP Integration
```bash
# Start FastMCP server for external APIs
npx @gofastmcp/server@latest start --port 8000

# Integrate with claude-flow workflows
npx claude-flow@alpha mcp connect fastmcp http://localhost:8000
```

#### 3. Archon MCP Coordination
```bash
# Start archon for multi-agent coordination
python -m archon.mcp start --port 9000

# Connect archon to claude-flow
npx claude-flow@alpha mcp connect archon http://localhost:9000
```

### 🏗️ Advanced MCP Configuration

Create an MCP integration configuration file:

```json
{
  "mcp_integration": {
    "channels": {
      "orchestration": {
        "servers": ["claude-flow", "archon", "ruv-swarm"],
        "priority": 1,
        "token_limit": 50000
      },
      "workflows": {
        "servers": ["fastmcp", "filesystem"],
        "priority": 2,
        "token_limit": 30000
      },
      "documents": {
        "servers": ["llamaindex", "notion", "tome"],
        "priority": 3,
        "token_limit": 25000
      },
      "heavy": {
        "servers": ["desktop-commander"],
        "priority": 10,
        "token_limit": 200000,
        "isolation": true
      }
    },
    "routing_rules": {
      "document_processing": "documents",
      "workflow_execution": "workflows",
      "agent_coordination": "orchestration",
      "system_operations": "heavy"
    }
  }
}
```

---

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. Claude-Flow Commands Not Working
```bash
# Issue: Command not found
# Solution: Ensure you're using the alpha version
npx claude-flow@alpha --version

# Issue: MCP servers not connecting
# Solution: Check server status
npx claude-flow@alpha mcp status

# Issue: Hive-mind sessions failing
# Solution: Reinitialize hive-mind
npx claude-flow@alpha hive-mind init --force
```

#### 2. Document Processing Failures
```bash
# Issue: Python import errors
# Solution: Reinstall dependencies
pip install --user --upgrade llama-index

# Issue: ChromaDB connection fails
# Solution: Check ChromaDB service
python -c "import chromadb; print('ChromaDB OK')"

# Issue: File permissions
# Solution: Check file permissions in Cleaning-Setup directory
```

#### 3. Flow-Nexus Integration Issues
```bash
# Issue: Flow-nexus not found
# Solution: Reinstall globally
npm install -g flow-nexus@latest

# Issue: Workflow execution fails
# Solution: Validate workflow configuration
npx flow-nexus@latest validate workflow your-workflow.json
```

### 🔧 Advanced Troubleshooting

#### Enable Debug Logging
```bash
# Enable verbose logging for claude-flow
export DEBUG=claude-flow:*
npx claude-flow@alpha --verbose run your-workflow

# Enable flow-nexus debugging
npx flow-nexus@latest run workflow --debug --log-level verbose
```

#### System Health Checks
```bash
# Run comprehensive system check
npx claude-flow@alpha doctor

# Check MCP server health
npx claude-flow@alpha mcp health-check --all

# Validate workflow definitions
npx claude-flow@alpha workflows validate --all
```

---

## 🎯 Next Steps and Advanced Usage

### 1. Custom Agent Development
- Create custom agents for specific NYRA workflows
- Integrate with mortgage-specific APIs
- Build compliance checking agents

### 2. Advanced Workflow Patterns
- Implement hot-potato workflow patterns
- Create self-improving workflows
- Build workflow templates for mortgage operations

### 3. Production Deployment
- Set up monitoring and alerting
- Configure auto-scaling for high-volume processing
- Implement backup and disaster recovery

### 4. Integration Expansion
- Connect to mortgage industry APIs
- Integrate with CRM systems
- Build real-time processing pipelines

---

**📚 Additional Resources:**
- Check `CLAUDE.md` for detailed claude-flow documentation
- View `NYRA-Claude-Flow-Setup-Report.md` for system configuration details
- Monitor `Cleaning-Setup/logs/` for processing logs
- Use `.\scripts\system-status.bat` for quick health checks

*This guide is part of the NYRA Claude-Flow Complete Setup. For issues, check the setup log files and system status.*