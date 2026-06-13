# GitHub MCP Server - CLAUDE.md

**Profile**: nodejs-mcp-integration
**Generated**: 2026-01-22
**Type**: GitHub Integration & Automation Service

## 🎯 Service Overview

GitHub MCP Server provides a Model Context Protocol bridge to GitHub operations, enabling Claude agents to interact with repositories, create pull requests, manage issues, orchestrate workflows, and automate development tasks within Project Nyra's CI/CD and repository management systems.

**Role**: GitHub API gateway and workflow automation
**Port**: 8088
**Architecture**: Event-driven MCP server with webhook support
**Status**: Active integration service

## 🏗️ Architecture

### Technology Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: MCP SDK (@modelcontextprotocol)
- **GitHub Integration**: Octokit (GitHub API client)
- **Protocols**: Stdio (primary), HTTP (fallback)
- **Integrations**: Nexus Router, Claude Flow, GitHub Apps

### Supported GitHub Features

- Repository management (clone, branch, tag)
- Pull request operations (create, review, merge)
- Issue management (create, comment, assign, close)
- Workflow automation (trigger, monitor, status)
- Code analysis and commenting
- Release management
- Project board operations

## 📋 Core Capabilities

### 1. Repository Operations

- Clone and initialize repositories
- Manage branches and tags
- Configure repository settings
- List commits and branches
- View file contents and trees
- Create and update files

### 2. Pull Request Management

- Create pull requests
- Review code with comments
- Manage PR labels and assignees
- Trigger PR checks and reviews
- Merge or close PRs
- Query PR history and status

### 3. Issue Management

- Create and edit issues
- Add labels, assignees, milestones
- Post comments and reactions
- Close and reopen issues
- Query issue history
- Link issues to PRs

### 4. Workflow Automation

- Trigger GitHub Actions workflows
- Monitor workflow runs
- Query workflow status
- Manage workflow artifacts
- Set workflow environment variables
- View workflow logs

### 5. Advanced Operations

- Code search and filtering
- Branch protection rules
- Webhook management
- Release creation and publishing
- Repository insights and statistics
- Team and permission management

## 🛠️ Configuration

### Environment Variables

```bash
# Core Service Configuration
NODE_ENV=development
PORT=8088
SERVICE_NAME=github-mcp

# GitHub Authentication
GITHUB_TOKEN=github_pat_xxxx
GITHUB_APP_ID=12345
GITHUB_APP_PRIVATE_KEY_FILE=/run/secrets/github-app-private-key
GITHUB_WEBHOOK_SECRET=webhook_secret_key

# Repository Configuration
DEFAULT_GITHUB_ORG=project-nyra
DEFAULT_GITHUB_REPO=Project-Nyra
GITHUB_API_VERSION=2022-11-28

# Nexus Router Integration
NEXUS_ROUTER_URL=http://localhost:8000
ROUTE_REQUESTS_THROUGH_NEXUS=true

# Orchestrator Integration
CLAUDE_FLOW_URL=http://localhost:9000

# Redis Cache
REDIS_URL=redis://localhost:6379
CACHE_TTL=1800

# Webhook Configuration
WEBHOOK_ENABLED=true
WEBHOOK_PORT=9090
WEBHOOK_PATH=/webhooks/github

# Rate Limiting
GITHUB_RATE_LIMIT=5000
RATE_LIMIT_RESET_HOURS=1

# Monitoring
LOG_LEVEL=debug
ENABLE_AUDIT_LOGGING=true
ENABLE_METRICS=true
```

## 📡 MCP Tool Definitions

### Tool: create_pull_request

Create a new pull request in a GitHub repository.

```json
{
  "name": "create_pull_request",
  "description": "Create a new pull request with specified base and head branches",
  "inputSchema": {
    "type": "object",
    "properties": {
      "owner": {
        "type": "string",
        "description": "Repository owner"
      },
      "repo": {
        "type": "string",
        "description": "Repository name"
      },
      "title": {
        "type": "string",
        "description": "PR title"
      },
      "description": {
        "type": "string",
        "description": "PR description in markdown"
      },
      "head": {
        "type": "string",
        "description": "Head branch name"
      },
      "base": {
        "type": "string",
        "description": "Base branch (default: main)"
      },
      "draft": {
        "type": "boolean",
        "description": "Create as draft PR"
      },
      "labels": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Labels to add"
      },
      "assignees": {
        "type": "array",
        "items": { "type": "string" },
        "description": "GitHub usernames to assign"
      },
      "reviewers": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Reviewers to request"
      }
    },
    "required": ["owner", "repo", "title", "head"]
  }
}
```

### Tool: create_issue

Create a new GitHub issue.

```json
{
  "name": "create_issue",
  "description": "Create a new issue in a repository",
  "inputSchema": {
    "type": "object",
    "properties": {
      "owner": { "type": "string" },
      "repo": { "type": "string" },
      "title": { "type": "string" },
      "description": { "type": "string" },
      "labels": { "type": "array", "items": { "type": "string" } },
      "assignees": { "type": "array", "items": { "type": "string" } },
      "milestone": { "type": "string" },
      "priority": {
        "type": "string",
        "enum": ["critical", "high", "medium", "low"]
      }
    },
    "required": ["owner", "repo", "title"]
  }
}
```

### Tool: trigger_workflow

Trigger a GitHub Actions workflow run.

```json
{
  "name": "trigger_workflow",
  "description": "Trigger a GitHub Actions workflow",
  "inputSchema": {
    "type": "object",
    "properties": {
      "owner": { "type": "string" },
      "repo": { "type": "string" },
      "workflowId": {
        "type": "string",
        "description": "Workflow ID or filename"
      },
      "ref": {
        "type": "string",
        "description": "Branch, tag, or commit SHA (default: main)"
      },
      "inputs": {
        "type": "object",
        "description": "Workflow input parameters"
      }
    },
    "required": ["owner", "repo", "workflowId"]
  }
}
```

### Tool: get_repository_info

Get detailed repository information.

```json
{
  "name": "get_repository_info",
  "description": "Retrieve repository metadata and statistics",
  "inputSchema": {
    "type": "object",
    "properties": {
      "owner": { "type": "string" },
      "repo": { "type": "string" },
      "includeStats": { "type": "boolean" },
      "includeContributors": { "type": "boolean" }
    },
    "required": ["owner", "repo"]
  }
}
```

### Tool: search_code

Search for code in repositories.

```json
{
  "name": "search_code",
  "description": "Search for code patterns across repositories",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": { "type": "string" },
      "owner": { "type": "string" },
      "repo": { "type": "string" },
      "language": { "type": "string" },
      "maxResults": { "type": "integer", "default": 30 }
    },
    "required": ["query"]
  }
}
```

## 🚀 Transport Configuration

### Stdio Transport (Primary)

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const transport = new StdioServerTransport();
const server = new Server(
  {
    name: "github-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

await server.connect(transport);
```

### HTTP Transport with Webhooks

```typescript
const app = express();

// MCP HTTP transport
const transport = new HTTPServerTransport({
  host: "0.0.0.0",
  port: 8088,
});

// GitHub webhooks
app.post("/webhooks/github", express.json(), async (req, res) => {
  const signature = req.headers["x-hub-signature-256"];
  const payload = JSON.stringify(req.body);

  // Verify webhook signature
  const hmac = crypto
    .createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  if (`sha256=${hmac}` !== signature) {
    return res.status(401).send("Unauthorized");
  }

  // Handle webhook event
  await handleWebhookEvent(req.body);
  res.status(200).send("OK");
});
```

## 💾 Resource Management

### Token Management

```typescript
interface GitHubRateLimit {
  limit: number;
  remaining: number;
  reset: number;
}

const checkRateLimit = async (octokit: Octokit): Promise<GitHubRateLimit> => {
  const { data } = await octokit.rest.rateLimit.get();
  return {
    limit: data.rate_limit.limit,
    remaining: data.rate_limit.remaining,
    reset: data.rate_limit.reset,
  };
};

// Implement backoff when rate limited
const withRateLimitHandling = async (fn: () => Promise<any>) => {
  try {
    return await fn();
  } catch (error) {
    if (
      error.status === 403 &&
      error.response?.headers["x-ratelimit-remaining"] === "0"
    ) {
      const resetTime =
        parseInt(error.response.headers["x-ratelimit-reset"]) * 1000;
      const waitTime = resetTime - Date.now();
      await delay(waitTime);
      return await fn(); // Retry
    }
    throw error;
  }
};
```

### Caching Strategy

```typescript
// Cache repository metadata
const cacheRepo = async (owner: string, repo: string, ttl: number = 1800) => {
  const key = `github:repo:${owner}/${repo}`;
  const cached = await redis.get(key);

  if (cached) return JSON.parse(cached);

  const data = await octokit.rest.repos.get({ owner, repo });
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
};
```

## 🛡️ Error Handling

### Error Types

```typescript
class GitHubError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "GitHubError";
  }
}

enum GitHubErrorCode {
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  RATE_LIMITED = "RATE_LIMITED",
  INVALID_INPUT = "INVALID_INPUT",
  CONFLICT = "CONFLICT",
  SERVER_ERROR = "SERVER_ERROR",
}
```

### Validation

```typescript
const validatePullRequest = (pr: PRInput): void => {
  if (!pr.title || pr.title.length === 0) {
    throw new GitHubError("PR title is required", "INVALID_INPUT");
  }

  if (!pr.head || !pr.base) {
    throw new GitHubError(
      "Both head and base branches required",
      "INVALID_INPUT"
    );
  }

  if (pr.head === pr.base) {
    throw new GitHubError("Head and base cannot be the same", "INVALID_INPUT");
  }
};
```

## 🔗 Nexus Router Integration

### Service Registration

```typescript
const registerWithNexus = async () => {
  await fetch(`${NEXUS_ROUTER_URL}/services/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "github-mcp",
      port: 8088,
      capabilities: {
        pr_management: true,
        issue_management: true,
        workflow_automation: true,
        code_search: true,
        webhooks: true,
      },
    }),
  });
};
```

### Request Routing

```typescript
const routeToNexus = async (request: GitHubRequest) => {
  if (process.env.ROUTE_REQUESTS_THROUGH_NEXUS === "true") {
    return fetch(`${NEXUS_ROUTER_URL}/github/call`, {
      method: "POST",
      headers: { "X-API-Key": process.env.API_KEY },
      body: JSON.stringify(request),
    });
  }
  return handleRequest(request);
};
```

## 🧪 Testing

### Unit Tests

```typescript
describe("GitHub MCP Server", () => {
  it("should create a pull request", async () => {
    const pr = await callTool("create_pull_request", {
      owner: "project-nyra",
      repo: "Project-Nyra",
      title: "Test PR",
      head: "feature/test",
      base: "main",
    });
    expect(pr.id).toBeDefined();
    expect(pr.number).toBeGreaterThan(0);
  });

  it("should create an issue", async () => {
    const issue = await callTool("create_issue", {
      owner: "project-nyra",
      repo: "Project-Nyra",
      title: "Test Issue",
      description: "Issue description",
    });
    expect(issue.id).toBeDefined();
  });

  it("should trigger a workflow", async () => {
    const run = await callTool("trigger_workflow", {
      owner: "project-nyra",
      repo: "Project-Nyra",
      workflowId: "test.yml",
      ref: "main",
    });
    expect(run.id).toBeDefined();
  });

  it("should handle rate limiting", async () => {
    // Simulate rate limit
    expect(() => withRateLimitHandling(fn)).toRetry();
  });
});

describe("Webhook Processing", () => {
  it("should handle push events", async () => {
    const payload = {
      action: "opened",
      pull_request: { id: 1, number: 1 },
    };
    await handleWebhookEvent(payload);
  });
});
```

## 📊 Monitoring & Metrics

### Key Metrics

```
github_requests_total                      # Total API requests
github_request_duration_seconds            # API latency
github_rate_limit_remaining                # Rate limit status
github_pr_operations_total                 # PR create/update/merge
github_issue_operations_total              # Issue operations
github_workflow_triggers_total             # Workflow triggers
github_webhook_deliveries                  # Webhook events processed
github_errors_total                        # Errors by type
```

### Health Checks

```bash
GET /health      # Service availability
GET /readiness   # Ready to accept requests
GET /status      # GitHub API connectivity
```

## 🚢 Deployment

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY src ./src
COPY tsconfig.json ./

EXPOSE 8088 9090

CMD ["node", "src/index.js"]
```

### Docker Compose

```yaml
github-mcp:
  build: ./services/github-mcp
  ports:
    - "8088:8088"
    - "9090:9090"
  environment:
    - GITHUB_TOKEN=${GITHUB_TOKEN}
    - GITHUB_APP_ID=${GITHUB_APP_ID}
    - GITHUB_WEBHOOK_SECRET=${GITHUB_WEBHOOK_SECRET}
    - NEXUS_ROUTER_URL=http://nexus-router:6000
    - REDIS_URL=redis://redis:6379
  depends_on:
    - redis
    - nexus-router
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8088/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

## 📚 Development Commands

```bash
# Install dependencies
npm install

# Development with hot reload
npm run dev

# Build TypeScript
npm run build

# Production start
npm start

# Run tests
npm test

# Coverage report
npm run test:coverage

# Lint code
npm run lint
```

## 🔐 Security Considerations

- GitHub token stored securely in environment
- Webhook signature verification
- Rate limiting to prevent abuse
- Input validation on all requests
- Audit logging of all operations
- No credentials in logs
- CORS configuration for web clients
- TLS/SSL for production

## 🔄 Workflow Integration

### Triggering Deployments

```typescript
// Trigger deployment workflow from Claude agents
const deploymentWorkflow = async (version: string) => {
  const run = await callTool("trigger_workflow", {
    owner: "project-nyra",
    repo: "Project-Nyra",
    workflowId: "deploy.yml",
    inputs: { version },
  });
  return run;
};
```

### PR Review Automation

```typescript
// Automated PR reviews from agents
const reviewPullRequest = async (prNumber: number) => {
  await octokit.rest.pulls.createReview({
    owner: "project-nyra",
    repo: "Project-Nyra",
    pull_number: prNumber,
    event: "APPROVE",
    body: "Automated review: Code quality checks passed",
  });
};
```

## 📖 Related Services

- **Nexus Router** - Central MCP gateway
- **Claude Flow** - Agent orchestration
- \*\*\*\* - Task management
- **Sequential Thinking MCP** - Complex decision making

## Resources

- GitHub API: https://docs.github.com/en/rest
- MCP SDK: https://github.com/modelcontextprotocol
- Octokit: https://octokit.github.io/rest.js/
- API Reference: `/docs/API.md`

---

**Status**: Active integration service
**Last Updated**: 2026-01-22
**Supported Operations**: PR management, issue tracking, workflow automation
