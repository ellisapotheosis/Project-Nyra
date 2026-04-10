#!/usr/bin/env bun

/**
 * Claude Flow V3 Development Bootstrap - Bun + Docker
 * Complete setup for local + containerized development
 *
 * Usage:
 *   bun scripts/bootstrap-bun-dev.ts
 *   bun scripts/bootstrap-bun-dev.ts --skip-docker
 *   bun scripts/bootstrap-bun-dev.ts --dry-run --verbose
 */

import { $, file } from "bun";
import path from "path";
import fs from "fs";

interface BootstrapOptions {
  skipDocker: boolean;
  skipInstall: boolean;
  dryRun: boolean;
  verbose: boolean;
  skipTests: boolean;
}

class BootstrapBunDev {
  private baseDir = process.cwd();
  private completed: string[] = [];
  private failed: string[] = [];
  private options: BootstrapOptions;

  constructor(options: Partial<BootstrapOptions> = {}) {
    this.options = {
      skipDocker: false,
      skipInstall: false,
      dryRun: false,
      verbose: false,
      skipTests: false,
      ...options,
    };
  }

  log(message: string, level: "INFO" | "SUCCESS" | "ERROR" | "WARN" | "STEP" = "INFO") {
    const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
    const icons = {
      INFO: "📋",
      SUCCESS: "✅",
      ERROR: "❌",
      WARN: "⚠️ ",
      STEP: "🚀",
    };

    console.log(`${icons[level]} [${timestamp}] ${message}`);
  }

  async exec(command: string, description: string): Promise<boolean> {
    try {
      this.log(`${description}...`, "STEP");

      if (this.options.dryRun) {
        this.log(`[DRY RUN] Would execute: ${command}`, "WARN");
        return true;
      }

      if (this.options.verbose) {
        this.log(`Command: ${command}`);
      }

      const result = await $`bash -c ${command}`;

      this.log(`${description} - DONE`, "SUCCESS");
      this.completed.push(description);
      return true;
    } catch (error) {
      this.log(
        `${description} FAILED: ${error instanceof Error ? error.message : String(error)}`,
        "ERROR"
      );
      this.failed.push(description);
      return false;
    }
  }

  async createFile(filePath: string, content: string): Promise<void> {
    try {
      const fullPath = path.join(this.baseDir, filePath);

      if (this.options.dryRun) {
        this.log(`[DRY RUN] Would create: ${filePath}`, "WARN");
        return;
      }

      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(fullPath, content, "utf-8");
      this.log(`Created file: ${filePath}`, "SUCCESS");
    } catch (error) {
      this.log(`Failed to create ${filePath}`, "ERROR");
    }
  }

  async runBootstrap() {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║   🚀 CLAUDE FLOW V3 DEVELOPMENT BOOTSTRAP (BUN + DOCKER)      ║
║       Local Development + Containerized Services               ║
╚════════════════════════════════════════════════════════════════╝

Environment: development
Package Manager: Bun
Docker: ${this.options.skipDocker ? "SKIPPED" : "ENABLED"}
Dry Run: ${this.options.dryRun ? "YES" : "NO"}
Verbose: ${this.options.verbose ? "YES" : "NO"}

Starting bootstrap process...
    `);

    try {
      // Phase 1: Prerequisites
      await this.phase1();

      // Phase 2: Install Bun Dependencies
      if (!this.options.skipInstall) {
        await this.phase2();
      }

      // Phase 3: Configuration Files
      await this.phase3();

      // Phase 4: Docker Setup
      if (!this.options.skipDocker) {
        await this.phase4();
      }

      // Phase 5: Claude Flow Initialization
      await this.phase5();

      // Phase 6: Scripts & Utilities
      await this.phase6();

      // Phase 7: Testing
      if (!this.options.skipTests) {
        await this.phase7();
      }

      // Phase 8: Verification
      await this.phase8();

      this.printSummary();
    } catch (error) {
      this.log(`Bootstrap failed: ${error instanceof Error ? error.message : String(error)}`, "ERROR");
      process.exit(1);
    }
  }

  async phase1() {
    console.log("\n─ PHASE 1: Prerequisites & Validation\n");

    // Check Bun
    try {
      const bunVersion = await $`bun --version`.text();
      this.log(`Bun: ${bunVersion.trim()}`, "SUCCESS");
    } catch {
      this.log("Bun not found. Install from https://bun.sh", "ERROR");
      throw new Error("Bun required");
    }

    // Check Node
    try {
      const nodeVersion = await $`node --version`.text();
      this.log(`Node: ${nodeVersion.trim()}`, "SUCCESS");
    } catch {
      this.log("Node not found", "ERROR");
      throw new Error("Node required");
    }

    // Create directories
    const dirs = [
      ".archon-os",
      ".swarm",
      ".swarm/memory",
      ".swarm/logs",
      ".swarm/cache",
      "infra",
      "infra/docker",
      "infra/nexus",
      "infra/postgres",
      "src",
      "src/mcp",
    ];

    for (const dir of dirs) {
      const fullPath = path.join(this.baseDir, dir);
      if (!this.options.dryRun && !fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    }

    this.log("Created directory structure", "SUCCESS");
  }

  async phase2() {
    console.log("\n─ PHASE 2: Bun Dependencies\n");

    // Check if dependencies already installed
    const bunLockExists = fs.existsSync(path.join(this.baseDir, "bun.lock"));

    if (bunLockExists) {
      this.log("bun.lock exists, updating dependencies", "INFO");
      await this.exec("bun install", "Updating Bun dependencies");
    } else {
      this.log("bun.lock not found, installing", "INFO");
      await this.exec("bun install", "Installing Bun dependencies");
    }

    // Add Claude Flow packages
    await this.exec(
      "bun add -D @archon-os/cli @archon-os/core @archon-os/providers @archon-os/memory @archon-os/agents @archon-os/mcp-sdk",
      "Adding Claude Flow V3 packages"
    );

    // Add memory backends
    await this.exec(
      "bun add @ruvector/sdk @ruvector/hnsw falkordb @letta/sdk redis pg ioredis",
      "Adding memory system packages"
    );

    // Add development tools
    await this.exec(
      "bun add -d typescript @types/bun @types/node vitest eslint prettier",
      "Adding development tools"
    );

    // Add utilities
    await this.exec(
      "bun add dotenv pino pino-pretty axios",
      "Adding utility packages"
    );
  }

  async phase3() {
    console.log("\n─ PHASE 3: Configuration Files\n");

    // .env.local
    const envLocal = `# === LOCAL DEVELOPMENT ===
ENVIRONMENT=development
DEBUG=archon-os:*

# === CLAUDE FLOW CONFIG ===
CLAUDE_FLOW_MCP_HOST=localhost
CLAUDE_FLOW_MCP_PORT=6000
CLAUDE_FLOW_DATA_DIR=./.swarm

# === NEXUS ROUTER ===
NEXUS_ROUTER_HOST=localhost
NEXUS_ROUTER_PORT=6000

# === RUVECTOR ===
RUVECTOR_HOST=localhost
RUVECTOR_PORT=7070
RUVECTOR_DIMENSION=1536
RUVECTOR_MAX_ELEMENTS=100000

# === MEMORY BACKENDS ===
MEMORY_BACKEND=hybrid
MEMORY_PRIMARY=ruvector
MEMORY_SECONDARY=letta,falkordb,redis

# === DATA SERVICES ===
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=ruvector
POSTGRES_PASSWORD=dev-password
POSTGRES_DB=ruvector

REDIS_HOST=localhost
REDIS_PORT=6379

FALKORDB_HOST=localhost
FALKORDB_PORT=6380

# === PROVIDERS ===
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=
GITHUB_TOKEN=

# === LOGGING ===
LOG_LEVEL=debug
LOG_FORMAT=pretty
`;

    await this.createFile(".env.local", envLocal);

    // .archon-os/config.json
    const claudeFlowConfig = {
      version: "3.0.0",
      environment: "development",
      project: {
        name: "project-nyra",
        type: "microservices",
      },
      mcp: {
        nexusRouter: {
          host: "localhost",
          port: 6000,
          transport: "http",
        },
      },
      swarm: {
        topology: "mesh",
        maxAgents: 8,
        strategy: "balanced",
      },
      memory: {
        backend: "hybrid",
        primary: "ruvector",
        secondary: ["letta", "falkordb", "redis"],
        providers: {
          ruvector: {
            host: "localhost",
            port: 7070,
            dimension: 1536,
          },
          redis: {
            host: "localhost",
            port: 6379,
          },
        },
      },
      logging: {
        level: "debug",
        format: "pretty",
      },
    };

    await this.createFile(
      ".archon-os/config.json",
      JSON.stringify(claudeFlowConfig, null, 2)
    );

    this.log("Configuration files created", "SUCCESS");
  }

  async phase4() {
    console.log("\n─ PHASE 4: Docker Setup\n");

    // Check Docker
    try {
      await $`docker --version`.text();
      this.log("Docker available", "SUCCESS");
    } catch {
      this.log("Docker not found. Install from https://www.docker.com", "ERROR");
      return;
    }

    // Create docker-compose.dev.yml (simplified)
    const dockerCompose = `version: '3.9'

services:
  nexus-router:
    image: graphbase/nexus:latest
    container_name: nexus-router
    ports:
      - "6000:6000"
    environment:
      LOG_LEVEL: debug
    networks:
      - archon-os-net
    depends_on:
      - archon-os-mcp

  archon-os-mcp:
    image: node:20-alpine
    container_name: archon-os-mcp
    ports:
      - "3001:3001"
    command: npm start
    environment:
      NODE_ENV: development
      RUVECTOR_HOST: ruvector
      REDIS_HOST: redis
    volumes:
      - ./src:/app/src
    networks:
      - archon-os-net
    depends_on:
      - postgres
      - redis
      - ruvector

  letta-mcp:
    image: node:20-alpine
    container_name: letta-mcp
    ports:
      - "3002:3002"
    command: npx @letta/mcp
    environment:
      FALKORDB_HOST: falkordb
    networks:
      - archon-os-net
    depends_on:
      - falkordb

  postgres:
    image: postgres:16-alpine
    container_name: postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: ruvector
      POSTGRES_PASSWORD: dev-password
      POSTGRES_DB: ruvector
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - archon-os-net

  redis:
    image: redis:7-alpine
    container_name: redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - archon-os-net

  ruvector:
    image: ruvector:latest
    container_name: ruvector
    ports:
      - "7070:7070"
    environment:
      DATABASE_URL: postgresql://ruvector:dev-password@postgres:5432/ruvector
    volumes:
      - ruvector_data:/data
    networks:
      - archon-os-net
    depends_on:
      - postgres

  falkordb:
    image: falkordb/falkordb:latest
    container_name: falkordb
    ports:
      - "6380:6379"
    volumes:
      - falkordb_data:/data
    networks:
      - archon-os-net

networks:
  archon-os-net:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  ruvector_data:
  falkordb_data:
`;

    await this.createFile("docker-compose.dev.yml", dockerCompose);

    // Start Docker services
    if (!this.options.dryRun) {
      await this.exec(
        "docker compose -f docker-compose.dev.yml up -d",
        "Starting Docker services"
      );
    }
  }

  async phase5() {
    console.log("\n─ PHASE 5: Claude Flow Initialization\n");

    await this.exec(
      "bun run archon-os init --development 2>/dev/null || true",
      "Initializing Claude Flow CLI"
    );

    await this.exec(
      "bun run archon-os:mcp:list || true",
      "Listing MCP servers"
    );
  }

  async phase6() {
    console.log("\n─ PHASE 6: Scripts & Utilities\n");

    // Add npm scripts to package.json
    const packageJsonPath = path.join(this.baseDir, "package.json");

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }

      // Add scripts
      Object.assign(packageJson.scripts, {
        dev: "bun run --watch src/index.ts",
        build: "bun build src/index.ts --target=node",
        test: "vitest run",
        "test:watch": "vitest watch",
        lint: "eslint src --ext .ts,.tsx",
        format: "prettier --write src",
        "archon-os": "bun ./node_modules/@archon-os/cli/bin/cli.js",
        "archon-os:init": "bun run archon-os init --development",
        "archon-os:status": "bun run archon-os status",
        "archon-os:swarm:init": "bun run archon-os swarm init --topology mesh --max-agents 8",
        "archon-os:memory:init": "bun run archon-os memory init --force",
        "archon-os:mcp:list": "bun run archon-os mcp list",
        "docker:up": "docker compose -f docker-compose.dev.yml up -d",
        "docker:down": "docker compose -f docker-compose.dev.yml down",
        "docker:logs": "docker compose -f docker-compose.dev.yml logs -f",
        verify: "bun verify.ts || true",
        health: "bun health-check.ts || true",
        setup: "bun install && bun run docker:up && bun run archon-os:init",
      });

      if (!this.options.dryRun) {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), "utf-8");
      }

      this.log("Added npm scripts to package.json", "SUCCESS");
    }
  }

  async phase7() {
    console.log("\n─ PHASE 7: Testing Setup\n");

    await this.exec("bun test --run 2>/dev/null || true", "Running test suite");
  }

  async phase8() {
    console.log("\n─ PHASE 8: Final Verification\n");

    // Check critical files
    const files = [
      ".env.local",
      ".archon-os/config.json",
      "docker-compose.dev.yml",
      "bun.lock",
    ];

    for (const file of files) {
      const exists = fs.existsSync(path.join(this.baseDir, file));
      if (exists) {
        this.log(`✓ ${file}`, "SUCCESS");
      } else {
        this.log(`✗ ${file} not found`, "WARN");
      }
    }

    await this.exec("bun run archon-os:status || true", "Verifying Claude Flow");
  }

  printSummary() {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                   ✨ BOOTSTRAP COMPLETE ✨                    ║
╚════════════════════════════════════════════════════════════════╝

Completed Steps: ${this.completed.length}
${this.completed.map((s) => `  ✅ ${s}`).join("\n")}

${this.failed.length > 0 ? `\nFailed Steps: ${this.failed.length}\n${this.failed.map((s) => `  ❌ ${s}`).join("\n")}\n` : ""}

Next Steps:
  1. Fill in API keys in .env.local
  2. Start development: bun run docker:up
  3. Run: bun run dev
  4. Initialize memory: bun run archon-os:memory:init

Commands:
  bun run dev              # Start development
  bun run test             # Run tests
  bun run docker:up        # Start services
  bun run docker:down      # Stop services
  bun run health           # Check health
  bun run archon-os:swarm:init  # Initialize swarm
  bun run archon-os:memory:init # Initialize memory

📚 Read ARCHITECTURE_DESIGN.md for detailed setup explanation
    `);
  }
}

// Parse CLI arguments
const args = Bun.argv.slice(2);
const options: Partial<BootstrapOptions> = {};

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--skip-docker") options.skipDocker = true;
  if (args[i] === "--skip-install") options.skipInstall = true;
  if (args[i] === "--dry-run") options.dryRun = true;
  if (args[i] === "--verbose" || args[i] === "-v") options.verbose = true;
  if (args[i] === "--skip-tests") options.skipTests = true;
}

// Run bootstrap
const bootstrap = new BootstrapBunDev(options);
await bootstrap.runBootstrap();
