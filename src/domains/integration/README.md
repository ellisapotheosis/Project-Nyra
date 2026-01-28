# Integration Domain - MCP Protocol, Provider Management, Tool Execution

**Domain Type**: Generic
**Bounded Context**: Integration
**Aggregate Roots**: MCPServer, Provider, Tool, Transport

## Overview

The Integration Domain connects Claude Flow V3 to external systems, AI providers, and tools via the Model Context Protocol (MCP). It provides unified provider management, tool execution, and transport layer abstraction.

## Ubiquitous Language

| Term | Definition |
|------|------------|
| **MCP** | Model Context Protocol for AI tool integration |
| **Provider** | AI model supplier (Anthropic, OpenAI, Google, etc.) |
| **Tool** | Executable capability exposed via MCP |
| **Transport** | Communication protocol (stdio, SSE, WebSocket) |
| **Server** | MCP server exposing tools and resources |
| **Client** | MCP client consuming tools |
| **Resource** | Data source accessible via MCP (files, APIs) |
| **Prompt** | Template for model interactions |

## Aggregates

### 1. MCPServer Aggregate Root

**Invariants**:
- Server must have unique name
- Transport must be valid and configured
- Tools must be registered before execution
- Server lifecycle (init → ready → running → stopped)

**Domain Events**:
- `MCPServerInitialized`
- `MCPServerStarted`
- `MCPServerStopped`
- `MCPServerError`
- `ToolRegistered`
- `ResourceRegistered`

```typescript
class MCPServer {
  private readonly id: MCPServerId;
  private name: string;
  private transport: Transport;
  private tools: Map<string, Tool>;
  private resources: Map<string, Resource>;
  private prompts: Map<string, Prompt>;
  private status: ServerStatus;

  initialize(config: MCPServerConfig): void;
  start(): void;
  stop(): void;
  registerTool(tool: Tool): void;
  registerResource(resource: Resource): void;
  executeTool(toolName: string, params: any): Promise<any>;
  listTools(): Tool[];
}
```

### 2. Provider Aggregate Root

**Invariants**:
- Provider must have valid API credentials
- Model list must be up-to-date
- Rate limits must be enforced
- Fallback provider configured for resilience

**Domain Events**:
- `ProviderConnected`
- `ProviderDisconnected`
- `ProviderError`
- `ModelListUpdated`
- `RateLimitExceeded`

```typescript
class Provider {
  private readonly id: ProviderId;
  private name: string;
  private type: ProviderType; // anthropic, openai, google, openrouter
  private credentials: Credentials;
  private models: Model[];
  private rateLimit: RateLimit;
  private fallback: Provider | null;

  connect(): void;
  disconnect(): void;
  listModels(): Model[];
  execute(model: string, messages: Message[]): Promise<Response>;
  checkRateLimit(): boolean;
}
```

### 3. Tool Aggregate Root

**Invariants**:
- Tool must have unique name
- Input schema must be valid JSON Schema
- Tool must be idempotent or clearly marked as non-idempotent
- Execution timeout must be specified

**Domain Events**:
- `ToolExecuted`
- `ToolFailed`
- `ToolTimeout`
- `ToolDeprecated`

```typescript
class Tool {
  private readonly id: ToolId;
  private name: string;
  private description: string;
  private inputSchema: JSONSchema;
  private handler: ToolHandler;
  private timeout: number;
  private idempotent: boolean;
  private deprecated: boolean;

  execute(params: any): Promise<any>;
  validate(params: any): ValidationResult;
  deprecate(reason: string): void;
}
```

### 4. Transport Aggregate Root

**Invariants**:
- Transport type must be supported (stdio, SSE, WebSocket)
- Connection must be established before communication
- Messages must conform to MCP protocol
- Reconnection strategy configured

**Domain Events**:
- `TransportConnected`
- `TransportDisconnected`
- `TransportError`
- `MessageSent`
- `MessageReceived`

```typescript
class Transport {
  private readonly id: TransportId;
  private type: TransportType;
  private connection: Connection;
  private reconnectStrategy: ReconnectStrategy;
  private messageQueue: Message[];

  connect(): void;
  disconnect(): void;
  send(message: Message): void;
  receive(): Promise<Message>;
  reconnect(): void;
}
```

## Value Objects

### ProviderId
```typescript
class ProviderId {
  constructor(private readonly value: string) {
    if (!this.isValid(value)) throw new InvalidProviderIdError();
  }

  private isValid(value: string): boolean {
    return /^provider-[a-zA-Z0-9]+$/.test(value);
  }
}
```

### ToolName
```typescript
class ToolName {
  constructor(private readonly value: string) {
    if (!this.isValid(value)) throw new InvalidToolNameError();
  }

  private isValid(value: string): boolean {
    return /^[a-z][a-z0-9-_]*$/.test(value) && value.length <= 64;
  }
}
```

### TransportType
```typescript
enum TransportType {
  STDIO = 'stdio',       // Standard input/output (npx commands)
  SSE = 'sse',          // Server-Sent Events (HTTP streaming)
  WEBSOCKET = 'ws',     // WebSocket (bidirectional)
}
```

### ProviderType
```typescript
enum ProviderType {
  ANTHROPIC = 'anthropic',
  OPENAI = 'openai',
  GOOGLE = 'google',
  AZURE = 'azure',
  OPENROUTER = 'openrouter',
  OLLAMA = 'ollama',
}
```

## Domain Services

### ProviderRoutingService
```typescript
class ProviderRoutingService {
  route(request: ModelRequest): Provider;
  selectModel(task: Task, constraints: Constraints): Model;
  fallback(failedProvider: Provider): Provider;
  loadBalance(providers: Provider[]): Provider;
}
```

### ToolExecutionService
```typescript
class ToolExecutionService {
  execute(tool: Tool, params: any): Promise<any>;
  validateInput(tool: Tool, params: any): ValidationResult;
  handleError(error: Error, tool: Tool): void;
  retry(tool: Tool, params: any, maxRetries: number): Promise<any>;
}
```

### MCPClientService
```typescript
class MCPClientService {
  connect(server: MCPServer): void;
  listTools(server: MCPServer): Tool[];
  executeTool(server: MCPServer, toolName: string, params: any): Promise<any>;
  listResources(server: MCPServer): Resource[];
}
```

### TransportManagerService
```typescript
class TransportManagerService {
  createTransport(type: TransportType, config: TransportConfig): Transport;
  sendMessage(transport: Transport, message: Message): void;
  receiveMessage(transport: Transport): Promise<Message>;
  handleReconnect(transport: Transport): void;
}
```

## Domain Events

### ProviderConnected
```typescript
interface ProviderConnected {
  type: 'integration:provider-connected';
  aggregateId: string; // ProviderId
  payload: {
    providerId: string;
    providerName: string;
    providerType: string;
    modelCount: number;
    connectedAt: number;
  };
}
```

### ToolExecuted
```typescript
interface ToolExecuted {
  type: 'integration:tool-executed';
  aggregateId: string; // ToolId
  payload: {
    toolId: string;
    toolName: string;
    serverId: string;
    params: any;
    result: any;
    duration: number;
    executedAt: number;
    success: boolean;
  };
}
```

### TransportError
```typescript
interface TransportError {
  type: 'integration:transport-error';
  aggregateId: string; // TransportId
  payload: {
    transportId: string;
    transportType: string;
    error: string;
    willReconnect: boolean;
    errorAt: number;
  };
}
```

## Repository Interfaces

```typescript
interface MCPServerRepository {
  save(server: MCPServer): Promise<void>;
  findById(id: MCPServerId): Promise<MCPServer | null>;
  findByName(name: string): Promise<MCPServer | null>;
  findRunning(): Promise<MCPServer[]>;
  delete(id: MCPServerId): Promise<boolean>;
}

interface ProviderRepository {
  save(provider: Provider): Promise<void>;
  findById(id: ProviderId): Promise<Provider | null>;
  findByType(type: ProviderType): Promise<Provider[]>;
  findActive(): Promise<Provider[]>;
}

interface ToolRepository {
  save(tool: Tool): Promise<void>;
  findById(id: ToolId): Promise<Tool | null>;
  findByName(name: string): Promise<Tool | null>;
  findByServer(serverId: MCPServerId): Promise<Tool[]>;
}

interface TransportRepository {
  save(transport: Transport): Promise<void>;
  findById(id: TransportId): Promise<Transport | null>;
  findByType(type: TransportType): Promise<Transport[]>;
}
```

## Integration Points (Context Map)

### Swarm Domain (Open Host Service)
- Agents execute MCP tools
- Provider routing for agent tasks
- Multi-agent tool coordination

### Security Domain (Conformist)
- Provider credential management
- Tool execution authorization
- Audit logging for external calls

### Performance Domain (Customer-Supplier)
- Provider latency metrics
- Tool execution performance
- Transport optimization

### Memory Domain (Anti-Corruption Layer)
- Cache provider responses
- Store tool execution history
- MCP resource persistence

## MCP Protocol Patterns

### Server Configuration
```json
{
  "mcpServers": {
    "claude-flow": {
      "command": "npx",
      "args": ["-y", "@claude-flow/cli@latest"],
      "transport": "stdio"
    },
    "ruv-swarm": {
      "command": "npx",
      "args": ["-y", "ruv-swarm", "mcp", "start"],
      "transport": "stdio"
    }
  }
}
```

### Tool Invocation
```typescript
interface ToolInvocation {
  toolName: string;
  parameters: Record<string, any>;
  timeout?: number;
  retryPolicy?: RetryPolicy;
}
```

### Provider Routing
```typescript
interface ProviderRoutingStrategy {
  primary: Provider;
  fallback: Provider[];
  loadBalancing: 'round-robin' | 'least-latency' | 'cost-optimized';
  circuitBreaker: CircuitBreakerConfig;
}
```

## Integration Ecosystem

### Core MCP Servers
1. **@claude-flow/cli**: Claude Flow V3 coordination
2. **ruv-swarm**: Advanced swarm orchestration
3. **flow-nexus**: Cloud deployment and E2B sandboxes
4. **agentic-jujutsu**: Version control with ReasoningBank

### Provider Integration
1. **Anthropic**: Claude Sonnet 4, Opus 4, Haiku
2. **OpenAI**: GPT-4, GPT-3.5
3. **Google**: Gemini 2.0 Flash, Gemini Pro
4. **OpenRouter**: DeepSeek-R1, aggregated models
5. **Ollama**: Local LLMs (DeepSeek, Llama, Qwen)

### Transport Protocols
1. **stdio**: CLI tools (npx commands)
2. **SSE**: HTTP streaming (long-running operations)
3. **WebSocket**: Bidirectional real-time communication

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| MCP Response Time | <100ms | ⚙️ |
| Provider Latency (p95) | <2s | 📊 |
| Tool Execution Success | >99% | ⚙️ |
| Connection Pooling | Active | ✅ |
| Circuit Breaker | Enabled | ✅ |

## CLI Commands

```bash
# List MCP servers
npx @claude-flow/cli@latest mcp list

# Start MCP server
npx @claude-flow/cli@latest mcp start --name <server>

# Execute tool
npx @claude-flow/cli@latest mcp execute --tool <tool> --params '{}'

# List providers
npx @claude-flow/cli@latest providers list

# Add provider
npx @claude-flow/cli@latest providers add --name <provider> --api-key <key>

# Test provider
npx @claude-flow/cli@latest providers test --name <provider>
```

## References

- ADR-001: Deep agentic-flow Integration
- ADR-008: MCP Protocol Adoption
- V3 MCP Optimization Skill
- Model Context Protocol Specification
- Provider Integration Guide
