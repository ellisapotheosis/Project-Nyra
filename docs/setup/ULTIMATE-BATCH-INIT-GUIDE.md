# Project Nyra - Ultimate Batch Initialization Guide

## Welcome to Your Complete Setup Documentation

This guide explains how to transform your Project Nyra repository into a fully orchestrated, memory-integrated, multi-agent development environment. Think of this as building a sophisticated AI-powered development factory where different specialized agents work together seamlessly, memory systems preserve knowledge across sessions, and your local GPU workers handle most of the computational load to save thousands of dollars in API costs.

## Understanding the Big Picture

Before diving into the technical steps, it helps to understand what we are building and why each piece matters. Project Nyra is not just a collection of applications and services. It is an intelligent mortgage operations platform where AI agents coordinate to handle complex workflows, memory systems track everything from borrower conversations to loan status changes, and automation handles repetitive tasks that would otherwise consume hours of manual work each day.

### The Three Core Systems Working Together

Your Project Nyra setup integrates three major systems that form the foundation of everything else. Understanding how these systems interact will help you make better decisions about configuration and troubleshooting.

**First, the Memory Systems create persistent intelligence.** Imagine traditional software where every time you start a new session, the system has completely forgotten what happened before. You would need to re-explain context, re-configure preferences, and re-teach patterns every single time. This is frustrating and inefficient. Your memory systems solve this by maintaining five different types of memory that serve different purposes. RuVector provides lightning-fast semantic search across your entire codebase, helping agents find relevant code patterns in milliseconds. Letta maintains agent state and personas, so your mortgage assistant agent remembers borrower preferences across conversations. Graphiti tracks temporal changes, allowing you to query "What was the loan application status three days ago?" FalkorDB stores the graph database backing Graphiti. Finally, Mem0 and OpenMemory handle user personalization that follows borrowers across different applications.

**Second, the Orchestration Systems coordinate work distribution.** When you ask for something complex like "analyze this loan application, check compliance, generate required documents, and create a follow-up campaign," a single agent cannot handle all of that efficiently. Instead, the orchestration systems (Claude-Flow, Archon, and Ruv-Swarm) break the request into smaller tasks, assign each task to the most appropriate specialist agent, coordinate parallel execution where possible, and aggregate results into a coherent response. This is similar to how a well-run mortgage brokerage operates - the loan officer does not personally handle every single piece of paperwork. Instead, they coordinate with processors, underwriters, compliance specialists, and other team members who each excel in their specific domain.

**Third, the Infrastructure Layer provides the foundation.** All the sophisticated AI and memory systems need somewhere to run, and they need fast, reliable communication between components. Your infrastructure includes Docker containers running databases and services, Tailscale creating a secure mesh network connecting all four of your PCs, and WSL2 providing a Linux environment on Windows for optimal performance. The infrastructure also includes your three GPU workers that run local AI models, dramatically reducing your API costs while maintaining excellent response quality.

### Why This Architecture Matters for Mortgage Operations

The mortgage industry is unique in its combination of high-volume repetitive tasks (processing applications, collecting documents, sending follow-up communications) and complex decision-making (compliance checking, loan product selection, risk assessment). Your architecture addresses both needs.

For repetitive tasks, the automation systems (n8n, Activepieces, campaign engine) handle drip campaigns, document collection reminders, and status updates automatically. Agents monitor for specific triggers (like a borrower uploading a document) and execute predefined workflows without human intervention. This frees up your time for higher-value activities like consulting with borrowers on complex scenarios or negotiating with lenders.

For complex decision-making, the AI agents provide sophisticated analysis. When a loan application comes in, agents can simultaneously check against hundreds of loan products across your thousand-plus lenders, identify the optimal matches, estimate approval probability based on historical patterns in your knowledge graph, and generate personalized recommendations. The memory systems ensure this analysis incorporates everything you know about the borrower from past conversations, previous loan applications, and documented preferences.

## Step One: Understanding Your Directory Structure

Your Project Nyra repository contains multiple directories, and each one serves a specific purpose in the larger system. Understanding this structure helps you customize configurations appropriately and troubleshoot when things do not work as expected.

### The Apps Directory - User-Facing Applications

The `apps/` directory contains the frontend applications that borrowers and your team interact with directly. Each application is a Next.js project with its own specific focus and technology stack.

`apps/mortgage-assistant` is your primary borrower-facing application. This is where borrowers chat with the AI assistant, upload documents, request quotes, and track their loan application progress. The application integrates with Dify for the conversational AI interface, Supabase for document storage, and your quote API for real-time rate information. The memory systems (Letta for conversation context, Graphiti for temporal tracking, Mem0 for preferences) work together to provide personalized experiences that remember past interactions and adapt to borrower needs.

`apps/ratehunter-landing` is your public-facing marketing site. This is optimized for search engines, loads quickly to maintain high Lighthouse scores, and focuses on lead capture and education. The landing page includes a quote calculator widget that connects to your quote API, educational content about different loan products, and lead capture forms that feed into your CRM and campaign engine.

`apps/crm-dashboard` provides your internal team with a comprehensive view of the loan pipeline, borrower management, task tracking, and analytics. This application integrates tightly with TwentyCRM for the underlying database, includes real-time updates via WebSockets, and provides visualization of pipeline metrics to help you identify bottlenecks and opportunities.

`apps/nyra-admin` is your system administration interface. This is where you manage workflows in the no-code builder, configure agent behaviors, monitor system health, and manage user permissions. The admin panel provides a non-technical interface for powerful capabilities, allowing you to make changes without editing code or configuration files directly.

### The Services Directory - Backend Logic

The `services/` directory contains the backend services that provide APIs, process data, and orchestrate complex operations. These services are typically written in Python or TypeScript and run as separate processes that communicate via HTTP APIs or message queues.

`services/quote-api` is your FastAPI-based service that interfaces with lender APIs (Rocket Mortgage, LenderPrice, and others) to fetch real-time rate quotes. The service implements caching to reduce API calls to expensive lender endpoints, handles rate lock expiration tracking, and provides a unified interface so your frontend applications do not need to understand the different lender API formats.

`services/campaign-engine` orchestrates your drip campaigns using workflows from Activepieces and n8n. This service manages multi-channel campaigns (email, SMS, voice calls) with sophisticated triggers based on borrower behavior, time-based schedules, and campaign performance metrics. The service integrates with Twilio for SMS and voice, SendGrid for email, and your memory systems to ensure communications are personalized and relevant.

`services/nyra-orchestrator` is the meta-orchestration service that coordinates AI agents across your infrastructure. This service receives high-level requests (like "process this new loan application"), breaks them down into specific tasks, assigns tasks to appropriate agents running on your GPU workers or cloud APIs, and aggregates results. Think of this as the conductor of an orchestra - each agent is a skilled musician, but the orchestrator ensures they all play together harmoniously.

### The Infrastructure Directories

`infra/` and `infrastructure/` contain Docker Compose files, Kubernetes manifests, and other infrastructure-as-code configurations. These define how services are deployed, how they connect to each other, what resources they require, and how they scale under load.

`bootstrap/` contains the initialization scripts you will use for setting up your 4-PC distributed environment. These PowerShell and bash scripts automate the tedious setup work - installing dependencies, configuring networking, starting services, and validating that everything works correctly.

## Step Two: Environment Configuration

Environment configuration is the foundation of your entire system. Every service needs to know how to connect to databases, where to find AI models, what API keys to use, and how to coordinate with other services. Keeping these configurations organized and secure is critical.

### Understanding the Master .env File

The `.env.master` file you now have in your repository root serves as the comprehensive template for all environment variables across your entire stack. This file is extensively commented to explain what each variable does, why it matters, and what values are appropriate for different scenarios.

The file is organized into logical sections. The core project settings define fundamental operating parameters like whether this machine is operating as an orchestrator or worker, what log level to use, and whether performance optimizations are enabled. The memory system sections configure each of the five memory systems with their connection URLs, capacity limits, and integration settings. The AI model sections define your local GPU workers and cloud API fallbacks, including routing rules for when to use which model. The infrastructure sections configure databases, caching layers, message queues, and other supporting services.

Rather than duplicating all these environment variables in multiple `.env` files scattered across different services, your configuration uses Infisical for centralized secret management. This means API keys and passwords are stored securely in Infisical, and services pull their required configurations at runtime. This approach provides several important benefits. First, secrets never appear in your Git repository, reducing the risk of accidental exposure. Second, you can rotate API keys in one central location and all services automatically use the new values. Third, different environments (development, staging, production) can have different configurations without requiring separate files in each service directory.

### Setting Up Infisical Integration

Infisical is your secret management service that replaces scattered `.env` files with centralized, encrypted storage. Here is how to set it up properly.

First, if you have not already, create an Infisical account and project. Your project ID (`8374cea9-e5e8-4050-bda4-b91f25ab30ef`) is already configured in your files. This ID is not secret - it simply identifies which project's secrets to fetch.

Next, install the Infisical CLI on your orchestrator PC. On Windows with WSL2, you can install it with:

```bash
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get update && sudo apt-get install -y infisical
```

Now you need to authenticate Infisical. You have two options: universal auth (best for automation) or user auth (best for development). For universal auth, generate a client ID and client secret in the Infisical web interface under project settings, then store these in your `.env` file:

```bash
INFISICAL_CLIENT_ID=your-client-id-here
INFISICAL_CLIENT_SECRET=your-client-secret-here
```

With Infisical configured, you can now populate it with your actual secrets. Go through the `.env.master` file and identify all variables marked with `${INFISICAL_...}` placeholders. For each one, add the actual value to Infisical using the web interface or CLI. For example:

```bash
infisical secrets set POSTGRES_PASSWORD "your-secure-password" --env=dev --path=/shared
infisical secrets set ANTHROPIC_API_KEY "sk-ant-your-key-here" --env=dev --path=/shared
infisical secrets set TWILIO_AUTH_TOKEN "your-twilio-token" --env=dev --path=/shared
```

The `--env=dev` flag specifies the environment (development, staging, production), and `--path=/shared` groups related secrets together. Your settings.json already configures Claude-Flow to automatically load secrets from Infisical at session start, so once secrets are populated, everything will work seamlessly.

## Step Three: Memory Systems Initialization

With environment variables configured, the next step is initializing your memory systems. Each memory system requires specific setup steps, and understanding the proper sequence prevents frustrating "service not found" errors.

### Starting Core Infrastructure Services

Your memory systems depend on underlying infrastructure services like PostgreSQL, Redis, and Neo4j/FalkorDB. These services are defined in your Docker Compose files and should be started first.

Navigate to your Project Nyra root directory and examine the `docker-compose.yml` file (or `docker-compose.memory.yml` if you have a specialized memory services composition). This file defines all the infrastructure services. Start them with:

```bash
docker-compose up -d postgres redis falkordb qdrant
```

The `-d` flag runs services in the background (detached mode). Verify they are running with:

```bash
docker-compose ps
```

You should see all services showing "Up" status. If any service fails to start, check the logs:

```bash
docker-compose logs postgres  # or redis, falkordb, etc.
```

Common issues at this stage include port conflicts (if you already have PostgreSQL running locally on port 5432), insufficient disk space, or missing environment variables. The error messages usually make the problem clear.

### Initializing RuVector Distributed Search

RuVector requires coordination across your three GPU workers to form a distributed cluster. The setup happens in stages.

On your orchestrator PC (Area51), RuVector operates in coordinator mode. This node maintains the central registry of vector indices and coordinates search queries across workers. Verify the RuVector configuration in your `.env.master`:

```bash
RUVECTOR_ENABLED=true
RUVECTOR_MODE=distributed
RUVECTOR_CONSENSUS_PEERS=worker-5090.tail-net.ts.net:7890,worker-3090.tail-net.ts.net:7890,worker-3060.tail-net.ts.net:7890
```

On each GPU worker, RuVector operates in worker mode. The worker participates in distributed consensus using the Raft protocol, stores a portion of the vector index, and handles search queries for its assigned partition.

Start RuVector on the orchestrator first:

```bash
ruvector start --mode coordinator --port 7890 --data-dir /mnt/nyra-data/ruvector
```

Then start RuVector on each worker:

```bash
# On worker-5090
ruvector start --mode worker --port 7890 --peers orchestrator.tail-net.ts.net:7890 --data-dir /opt/ruvector-data

# On worker-3090
ruvector start --mode worker --port 7890 --peers orchestrator.tail-net.ts.net:7890 --data-dir /opt/ruvector-data

# On worker-3060
ruvector start --mode worker --port 7890 --peers orchestrator.tail-net.ts.net:7890 --data-dir /opt/ruvector-data
```

The workers automatically discover each other through the Raft consensus protocol and begin synchronizing the vector index. You can verify cluster formation with:

```bash
ruvector cluster status
```

You should see all four nodes (orchestrator plus three workers) listed with "healthy" status.

### Initializing Letta Agent Memory

Letta provides the operating system-like memory management for your AI agents. Setting up Letta involves starting the server and initializing agent configurations.

Letta runs as a Docker container defined in your compose file. Start it with:

```bash
docker-compose up -d letta-server
```

The Letta server automatically creates its PostgreSQL database schema on first startup. Verify the server is running by checking the health endpoint:

```bash
curl http://localhost:8283/health
```

You should receive a JSON response indicating the server is healthy. Now create your first agent to test the configuration:

```bash
curl -X POST http://localhost:8283/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${LETTA_API_KEY}" \
  -d '{
    "name": "test-mortgage-agent",
    "persona": "You are a knowledgeable mortgage assistant",
    "human": "Borrower seeking mortgage information",
    "model": "claude-sonnet-4-20250514"
  }'
```

This creates an agent with core memory containing the persona and human descriptions. Letta automatically manages memory allocation, ensuring the agent remembers important facts in core memory while archiving historical conversations to archival memory when core memory fills up.

The MCP server integration for Letta enables Claude-Flow agents to directly manage Letta memory. Verify the MCP server is configured in your `settings-ultimate-enhanced.json` under the `mcpServers` section. When Claude-Flow starts, it will automatically connect to the Letta MCP server and expose memory management tools.

### Initializing Graphiti Temporal Knowledge Graph

Graphiti builds temporal knowledge graphs that track how entities and relationships evolve over time. This is particularly valuable for mortgage operations where you need historical context about borrower financial situations, property values, and loan terms.

Graphiti uses FalkorDB as its graph database backend. Verify FalkorDB is running:

```bash
docker-compose ps falkordb
```

If it is running, connect to the Redis CLI to verify the graph database is accessible:

```bash
redis-cli -h localhost -p 6379
AUTH your-falkordb-password
GRAPH.LIST
```

You should see an empty list initially since no graphs have been created yet. Now initialize your Nyra knowledge graph:

```bash
# Using the Graphiti CLI or API
graphiti graph create nyra_knowledge_graph \
  --backend falkordb \
  --url redis://localhost:6379 \
  --temporal-tracking true \
  --auto-extraction true \
  --extraction-model claude-sonnet-4-20250514
```

This creates the graph schema and enables automatic entity extraction from unstructured text. When borrowers send messages or documents, Graphiti automatically identifies entities (people, properties, loan amounts) and creates timestamped nodes and relationships in the knowledge graph.

Test the graph with a simple query:

```bash
graphiti query nyra_knowledge_graph \
  --cypher "CREATE (b:Borrower {name: 'Test User', timestamp: timestamp()}) RETURN b"
```

You should see a response confirming the borrower node was created with a timestamp. This timestamp enables temporal queries like "Show me all borrowers we contacted last week" or "What was the average loan amount requested in Q4 2024?"

### Initializing Mem0 and OpenMemory User Profiles

Mem0 and OpenMemory work together to provide cross-application user personalization. While Letta focuses on agent memory and Graphiti tracks entity relationships, Mem0/OpenMemory maintain user preference profiles that follow borrowers across your mortgage assistant, CRM, and landing pages.

Start the Mem0 server:

```bash
docker-compose up -d mem0-server
```

Verify it is running:

```bash
curl http://localhost:8080/health
```

Initialize the OpenMemory MCP server to bridge Mem0 with Claude-Flow:

```bash
npx @openmemory/mcp-server@latest
```

The MCP server starts automatically when Claude-Flow initializes (configured in your `settings-ultimate-enhanced.json`), but you can test it manually to verify connectivity.

Create a test user profile:

```bash
curl -X POST http://localhost:8080/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-borrower-001",
    "schema": "mortgage_borrower",
    "data": {
      "preferredContactMethod": "email",
      "loanIntent": "purchase",
      "propertyType": "single-family",
      "creditScore": 720
    }
  }'
```

This profile is now accessible from any application that queries Mem0. When the borrower visits your landing page, the page can load their preferred contact method and customize the experience. When they chat with the mortgage assistant, it can access their loan intent and property preferences to provide relevant recommendations.

## Step Four: Batch Initialization with Ultimate Configuration

Now that your memory systems and infrastructure are running, you can use the batch initialization system to configure all your apps and services simultaneously. This is where the `PROJECT-NYRA-ULTIMATE-BATCH-CONFIG.json` file you created comes into play.

### Understanding Batch Configuration Structure

Open the batch configuration file and examine its structure. The configuration is organized into several key sections.

The `_meta` section provides documentation about the configuration - what it does, when it was created, and what systems it integrates. This metadata helps you track configuration versions over time.

The `baseOptions` section defines defaults that apply to all projects unless specifically overridden. These include whether to use SPARC methodology, how many operations to run in parallel, whether to force overwrite existing files, and whether to integrate memory systems.

The `globalMemoryConfig` section configures memory systems that apply across all projects. This is where you specify which memory systems are enabled, how they connect to each other, and what their capacity limits are. Having global configuration prevents inconsistencies where different projects might try to use conflicting memory settings.

The `projectConfigs` section is the heart of the configuration. Each entry defines a specific project (an app or service), its technology stack, its memory requirements, the types of agents that work with it, and its integration points with other systems. For example, the `apps-mortgage-assistant` configuration specifies that it uses Next.js 14, integrates with Dify for AI, stores data in Supabase, and uses Letta, Graphiti, and Mem0 for memory systems.

The `executionPlan` section defines the order in which projects are initialized. This matters because some projects depend on others - for example, your frontend applications cannot connect to backend services until those services exist and are running. The execution plan groups projects into phases, with each phase completing before the next begins.

### Running Batch Initialization

With your configuration file ready, run the batch initialization:

```bash
cd C:\Dev\Projects\Repos\Project-Nyra
npx @claude-flow/cli@latest init --config PROJECT-NYRA-ULTIMATE-BATCH-CONFIG.json
```

The batch initializer processes your configuration and executes in phases. Watch the output carefully for any errors or warnings.

**Phase 1: Core Setup** initializes the orchestrator core, infrastructure configuration, and coordination center. This phase creates the root-level CLAUDE.md file with orchestrator-specific instructions, sets up Docker Compose configurations for all infrastructure services, and initializes the coordination system that manages multi-agent workflows.

**Phase 2: Services** sets up your backend services in parallel. Since you configured `maxConcurrency: 3`, up to three services initialize simultaneously. Each service gets its own directory-specific CLAUDE.md file that explains the service's purpose, technology stack, and how agents should interact with it. The initializer also creates skeleton code for key files, sets up test frameworks, and configures integration points with memory systems.

**Phase 3: Applications** initializes your frontend applications. These depend on the services from Phase 2 being available, so they run after services complete. Each app gets its CLAUDE.md configured for React/Next.js development patterns, UI component guidelines, and integration with the backend APIs created in Phase 2.

**Phase 4: Automation** sets up CI/CD workflows and bootstrap scripts. This phase creates GitHub Actions workflows for testing and deployment, PowerShell and bash scripts for environment setup, and validation suites to verify everything works correctly.

After batch initialization completes, you will have:

- A CLAUDE.md file in every project directory with context-specific instructions
- Memory system configurations integrated into each project
- Agent pool configurations specifying which agents work with which projects
- Test frameworks and CI/CD pipelines ready to use
- Documentation explaining how each piece fits into the larger system

### Customizing Directory-Specific CLAUDE.md Files

While batch initialization creates baseline CLAUDE.md files for each directory, you will want to customize these to match your specific needs and preferences. Let me explain how to think about this customization.

Each CLAUDE.md file serves as the "instruction manual" for agents working in that directory. When an agent needs to make changes to your mortgage assistant app, it reads `apps/mortgage-assistant/CLAUDE.md` to understand the app's architecture, coding conventions, testing requirements, and integration points. The better this file explains the context, the better agents perform.

For a frontend application like `apps/mortgage-assistant`, your CLAUDE.md should explain:

- The component structure and how React components are organized
- State management patterns (Zustand in this case) and when to use global vs local state
- UI conventions like your design system (shadcn-ui + magic-ui) and spacing/color standards
- API integration patterns and how to handle loading/error states
- Memory system usage - when to store conversation context in Letta, when to update the Graphiti knowledge graph, and when to modify user preferences in Mem0
- Testing expectations - what constitutes good test coverage, whether to favor unit or integration tests, and how to mock external dependencies
- Compliance considerations specific to mortgage applications - PII handling, audit logging, required disclosures

For a backend service like `services/quote-api`, your CLAUDE.md should explain:

- API design patterns - RESTful conventions, error response formats, pagination standards
- Integration with lender APIs - rate limiting considerations, caching strategies, fallback behaviors when APIs are unavailable
- Database schema and how to handle migrations
- Performance requirements - target response times, when to cache aggressively, when fresh data is critical
- Testing strategies - unit tests for business logic, integration tests for API contracts, load tests for performance validation
- Deployment considerations - Docker configuration, environment-specific settings, rolling restart procedures

The batch initializer creates these CLAUDE.md files with sensible defaults based on the project template (react-app, fastapi-microservice, etc.), but you know your specific requirements better than any template. Spend time refining these files, and you will notice agents make better decisions that align with your preferences.

## Step Five: Verification and Validation

After batch initialization completes, thorough verification ensures everything works correctly before you begin relying on the system for real work.

### Testing Memory System Integration

Start by verifying each memory system responds correctly and stores/retrieves data as expected.

For RuVector, create a test vector search:

```bash
# Add a test code snippet
ruvector add --collection code-snippets --text "function calculateMortgagePayment(principal, rate, years) { /* implementation */ }" --metadata '{"language": "javascript", "category": "calculations"}'

# Search for it
ruvector search --collection code-snippets --query "mortgage payment calculation" --k 5
```

You should see your test snippet returned in the results. This confirms RuVector is indexing correctly and can retrieve relevant documents.

For Letta, test agent memory persistence:

```bash
# Create a test agent
AGENT_ID=$(curl -X POST http://localhost:8283/agents \
  -H "Content-Type: application/json" \
  -d '{"name": "test-agent", "persona": "test persona"}' | jq -r '.id')

# Add to core memory
curl -X POST http://localhost:8283/agents/$AGENT_ID/memory/core \
  -H "Content-Type: application/json" \
  -d '{"key": "test_fact", "value": "The test is working correctly"}'

# Retrieve core memory
curl http://localhost:8283/agents/$AGENT_ID/memory/core
```

You should see your test fact in the core memory response. This confirms Letta persists agent memory and retrieves it correctly.

For Graphiti, test temporal queries:

```bash
# Create borrower node
graphiti query nyra_knowledge_graph \
  --cypher "CREATE (b:Borrower {name: 'Alice Smith', income: 75000, timestamp: timestamp()}) RETURN b"

# Wait a few seconds, then update income
sleep 5
graphiti query nyra_knowledge_graph \
  --cypher "MATCH (b:Borrower {name: 'Alice Smith'}) SET b.income = 80000, b.timestamp = timestamp() RETURN b"

# Query temporal history
graphiti query nyra_knowledge_graph \
  --cypher "MATCH (b:Borrower {name: 'Alice Smith'}) RETURN b.income, b.timestamp ORDER BY b.timestamp"
```

You should see both income values (75000 and 80000) with different timestamps, demonstrating Graphiti tracks changes over time.

For Mem0/OpenMemory, test user profile synchronization:

```bash
# Create profile
curl -X POST http://localhost:8080/profiles \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-123", "data": {"theme": "dark"}}'

# Update profile
curl -X PATCH http://localhost:8080/profiles/test-123 \
  -H "Content-Type: application/json" \
  -d '{"data": {"theme": "light"}}'

# Retrieve profile
curl http://localhost:8080/profiles/test-123
```

The retrieved profile should show `theme: "light"`, confirming updates propagate correctly.

### Testing Multi-Agent Coordination

Verify your orchestration systems can coordinate multiple agents working together on complex tasks.

Start by testing Claude-Flow basic orchestration:

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 5
npx @claude-flow/cli@latest task orchestrate --task "Analyze this code snippet for security vulnerabilities"
```

Watch the output to see task decomposition, agent assignment, and result aggregation working together. You should see Claude-Flow breaking the task into subtasks (static analysis, dependency checking, pattern matching), assigning each to appropriate agents, and combining results into a cohesive security analysis.

Test Ruv-Swarm WASM-powered performance:

```bash
npx ruv-swarm@latest swarm init --topology mesh --max-agents 10
npx ruv-swarm@latest task orchestrate --task "Process these 100 documents in parallel" --parallel-branches true
```

Ruv-Swarm should spawn multiple agents and process documents concurrently, demonstrating the performance benefits of parallel execution.

Test cross-memory-system coordination:

```bash
# This test verifies agents can query RuVector, update Letta memory, and create Graphiti relationships all in one operation
npx @claude-flow/cli@latest task orchestrate --task "Find code examples for mortgage calculations, remember the patterns, and create a knowledge graph node linking the borrower to these patterns" --memory-systems ruvector,letta,graphiti
```

The output should show the agent successfully queried RuVector for code patterns, stored relevant patterns in Letta memory, and created knowledge graph nodes in Graphiti. This demonstrates the memory systems working together harmoniously.

### Testing GPU Worker Integration

Verify your local GPU workers are handling AI workloads correctly.

Check Ollama is running on each worker:

```bash
# From orchestrator, test each worker
curl http://worker-5090.tail-net.ts.net:11434/v1/models
curl http://worker-3090.tail-net.ts.net:11434/v1/models
curl http://worker-3060.tail-net.ts.net:11434/v1/models
```

Each should return a list of loaded models. Verify the expected models are present - DeepSeek-R1 on worker-5090, Llama 3.1 on worker-3090, and CodeLlama on worker-3060.

Test model inference:

```bash
# Test worker-5090 with DeepSeek-R1
curl -X POST http://worker-5090.tail-net.ts.net:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-r1:236b-q4_K_M",
    "messages": [{"role": "user", "content": "Explain mortgage amortization in simple terms"}],
    "max_tokens": 200
  }'
```

You should receive a coherent explanation of mortgage amortization from the local model. This confirms the GPU worker is processing inference requests correctly.

Test Nexus Router intelligent routing:

```bash
# Make a request that should route to local worker
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "task": "coding",
    "messages": [{"role": "user", "content": "Write a Python function to calculate monthly mortgage payment"}]
  }'
```

Check the Nexus Router logs to verify it routed the request to worker-3060 (which has CodeLlama specialized for coding tasks). The routing decision should be based on the `task: "coding"` parameter and the worker capabilities defined in your configuration.

## Step Six: Ongoing Maintenance and Optimization

With your system fully initialized and verified, ongoing maintenance ensures it continues running smoothly and improves over time through neural optimization.

### Memory System Maintenance

Memory systems accumulate data over time and require periodic cleanup to maintain performance and comply with retention policies.

**RuVector Index Optimization**: As you add more code snippets and documents to RuVector, the index can become fragmented. Periodically rebuild the index for optimal search performance:

```bash
ruvector index rebuild --collection code-snippets --preserve-data true
```

This operation runs in the background and does not interrupt searches. New queries automatically use the old index until the rebuild completes, at which point RuVector switches atomically to the new index.

**Letta Memory Compaction**: Agents accumulate archival memory as conversations grow. Periodically archive old conversations and compact the database:

```bash
curl -X POST http://localhost:8283/admin/compact \
  -H "Authorization: Bearer ${LETTA_API_KEY}" \
  -d '{"older_than_days": 90, "compress": true}'
```

This moves conversations older than 90 days to compressed archival storage, freeing up space in the primary database while maintaining the ability to recall old information when needed.

**Graphiti Snapshot Management**: Graphiti creates periodic snapshots for temporal queries. Manage snapshot retention to balance query capabilities with storage costs:

```bash
graphiti snapshots prune nyra_knowledge_graph \
  --older-than 90d \
  --keep-interval 7d
```

This keeps daily snapshots for the last 90 days, then switches to weekly snapshots for older data. You can still query "What was the status 6 months ago" but with weekly rather than daily granularity.

**Mem0 Profile Cleanup**: Remove profiles for inactive users and comply with data retention policies:

```bash
curl -X POST http://localhost:8080/admin/cleanup \
  -H "Content-Type: application/json" \
  -d '{"inactive_days": 365, "delete_pii": true}'
```

This deletes profiles for users who have not interacted with any application in 365 days and ensures PII is properly removed.

### Neural Optimization Monitoring

Your system continuously trains neural models to improve performance. Monitor these models to understand what the system is learning and identify optimization opportunities.

Check neural model performance metrics:

```bash
npx @claude-flow/cli@latest neural metrics --model error_preventer
```

This shows how many errors the model has prevented, what the current accuracy is, and which types of errors it struggles with. If you notice the error prevention accuracy dropping, the model may need retraining with fresh data or the error patterns may have shifted.

Review task prediction accuracy:

```bash
npx @claude-flow/cli@latest neural metrics --model task_predictor
```

This shows how accurately the system predicts task completion time, optimal agent assignment, and resource requirements. High accuracy (>85%) means the system has learned your task patterns well. Lower accuracy suggests you may need more diverse training data or the patterns are too unpredictable for the current model.

Analyze performance optimization results:

```bash
npx @claude-flow/cli@latest neural metrics --model performance_optimizer
```

This shows concrete improvements from neural optimization - for example, "Command execution 15% faster than baseline" or "API calls reduced by 23% through intelligent caching". These metrics quantify the value of the neural optimization system.

### Checkpoint and Rollback Procedures

The hooks system creates automatic checkpoints, but knowing how to use them for recovery is critical when things go wrong.

List available checkpoints:

```bash
# Git tags
git tag -l "checkpoint-*" | sort -r | head -10

# Git branches
git branch -a | grep checkpoint | head -10

# Checkpoint metadata
ls -la .claude/checkpoints/*.json | head -10
```

Each checkpoint includes metadata explaining what was happening when it was created. Examine a checkpoint:

```bash
cat .claude/checkpoints/1736297234.json
```

You will see information like which file was being edited, what branch you were on, what the timestamp was, and a summary of changes. This helps you identify the right checkpoint to restore.

Rollback to a checkpoint:

```bash
# Option 1: Rollback using Git tag
git checkout checkpoint-20250108-143022

# Option 2: Rollback using Git branch
git checkout checkpoint/pre-edit-20250108-143022

# Option 3: Selective file restoration
git checkout checkpoint-20250108-143022 -- apps/mortgage-assistant/components/QuoteCalculator.tsx
```

Option 1 and 2 restore your entire working tree to the checkpoint state. Option 3 restores just a specific file, useful when only one component broke but everything else is fine.

After verifying the restoration worked correctly, you can either continue from that point or create a new branch to preserve the rollback while still having access to your original work:

```bash
# Create a branch from the restored state
git checkout -b fix-from-checkpoint

# Your original work is still available on the original branch
git checkout main
```

### Performance Tuning Based on Usage Patterns

As you use the system, monitor resource usage and adjust configurations for optimal performance.

**Database Connection Pooling**: If you notice PostgreSQL connection errors during peak usage, increase the connection pool size:

```bash
# In .env.master
DB_POOL_MAX=30  # Increased from 20
```

Restart services that use PostgreSQL for the change to take effect.

**Cache TTL Adjustment**: If your cache hit rate is too low, increase TTLs. If data freshness is a problem, decrease them:

```bash
# In settings-ultimate-enhanced.json under performance.caching
"memory": {
  "ttl": 300000  # Increased from 120000 (2min to 5min)
}
```

**GPU Worker Load Balancing**: If one GPU worker is consistently overloaded while others sit idle, adjust the routing weights in your Nexus Router configuration. Check current load distribution:

```bash
curl http://localhost:4000/admin/worker-stats
```

If worker-5090 is handling 70% of requests while worker-3060 handles only 10%, adjust routing rules to direct more simple tasks to worker-3060, reserving worker-5090 for truly complex reasoning tasks that require the larger model.

**Parallel Execution Tuning**: If you notice tasks queuing up rather than executing, increase parallelization limits:

```bash
# In settings-ultimate-enhanced.json under performance.parallelization
"maxConcurrent": 25  # Increased from 20
```

Be careful not to set this too high - excessive parallelization can overwhelm your GPUs with context-switching overhead and actually decrease performance.

## Conclusion: You Now Have a Sophisticated AI-Powered Development System

This guide walked you through transforming Project Nyra from a collection of directories into a fully integrated, memory-enhanced, multi-agent development environment. You now understand:

- How the five memory systems (RuVector, Letta, Graphiti, FalkorDB, Mem0/OpenMemory) work together to provide different types of intelligence and persistence
- How the orchestration systems (Claude-Flow, Archon, Ruv-Swarm) coordinate agents to handle complex tasks through decomposition and parallel execution
- How your 4-PC infrastructure with three GPU workers dramatically reduces API costs while maintaining excellent AI performance
- How batch initialization configures multiple projects simultaneously with appropriate memory integration and agent configurations
- How the hooks system creates continuous learning loops that make the system progressively smarter
- How checkpoints provide comprehensive rollback capabilities at multiple granularities
- How to verify, maintain, and optimize the system for peak performance

Your mortgage operations platform now has sophisticated AI capabilities that remember context across sessions, coordinate complex workflows automatically, and continuously improve through neural optimization. This foundation positions you to build powerful features like fully automated lead nurturing campaigns, AI-powered document processing, intelligent quote optimization across thousands of lenders, and predictive analytics that forecast loan approval probability.

The system is designed to grow with your needs. As you identify new use cases, you can spawn additional specialized agents, expand memory systems to track new entity types, and create new workflows in the no-code builders. The modular architecture ensures each component can evolve independently without breaking the larger system.

Start using your system, monitor its behavior, learn from the patterns it discovers, and continuously refine configurations to match your specific mortgage operations workflows. The investment in this sophisticated setup pays dividends through automation, intelligence, and cost savings that compound over time.
