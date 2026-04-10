# Integration Domain - MCP Protocol, Provider Management, Tool Execution

**Domain Type**: Generic
**Bounded Context**: Integration
**Aggregate Roots**: MCPServer, Provider, Tool, Transport

## Overview

The Integration Domain connects Archon OS to external systems, AI providers, and tools via the Model Context Protocol (MCP). It provides unified provider management, tool execution, and transport layer abstraction.

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

```typescript
class MCPServer {
  private readonly id: MCPServerId;
  private name: string;
  private transport: Transport;
  private tools: Map<string, Tool>;
  private resources: Map<string, Resource>;
  private status: ServerStatus;

  initialize(config: MCPServerConfig): void;
  start(): void;
  stop(): void;
  registerTool(tool: Tool): void;
  executeTool(toolName: string, params: any): Promise<any>;
}
```

### 2. Provider Aggregate Root

**Invariants**:
- Provider must have valid API credentials
- Model list must be up-to-date
- Rate limits must be enforced
- Fallback provider configured for resilience

```typescript
class Provider {
  private readonly id: ProviderId;
  private name: string;
  private type: ProviderType; // anthropic, openai, google, openrouter, ollama
  private credentials: Credentials;
  private models: Model[];
  private fallback: Provider | null;

  connect(): void;
  listModels(): Model[];
  execute(model: string, messages: Message[]): Promise<Response>;
}
```

## TransportType
```typescript
enum TransportType {
  STDIO = 'stdio',       // Standard input/output (npx commands)
  SSE = 'sse',          // Server-Sent Events (HTTP streaming)
  WEBSOCKET = 'ws',     // WebSocket (bidirectional)
}
```

## Integration Ecosystem

### Core MCP Servers
1. **archon**: Archon OS task management
2. **github-mcp**: GitHub repository integration
3. **gitea-mcp**: Self-hosted git integration
4. **nexus-router**: MCP aggregation and routing

### Provider Integration
1. **Anthropic**: Claude Sonnet, Opus, Haiku
2. **OpenAI**: GPT-4, GPT-3.5
3. **Google**: Gemini 2.0 Flash, Gemini Pro
4. **OpenRouter**: Aggregated models
5. **Ollama**: Local LLMs (DeepSeek, Llama, Qwen)

## CLI Commands

```bash
# List workflows
archon workflow list

# Check status
archon status
```

## References

- ADR-008: MCP Protocol Adoption
- Model Context Protocol Specification
- Provider Integration Guide
