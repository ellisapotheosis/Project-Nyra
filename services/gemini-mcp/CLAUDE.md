# Gemini MCP Server - CLAUDE.md

**Profile**: nodejs-mcp-provider
**Generated**: 2026-01-22
**Type**: AI Provider Integration (Google Gemini)

## 🎯 Service Overview

Gemini MCP Server provides a Model Context Protocol bridge to Google's Gemini AI models, enabling seamless integration of advanced text generation, image analysis, and multimodal capabilities within Project Nyra's distributed agent ecosystem.

**Role**: AI provider gateway for Gemini models
**Port**: 8085
**Architecture**: Event-driven MCP server with Nexus Router integration
**Status**: Active provider service

## 🏗️ Architecture

### Technology Stack
- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: MCP SDK (@modelcontextprotocol)
- **AI Provider**: Google Gemini API
- **Protocols**: Stdio (primary), HTTP (fallback)
- **Integration**: Nexus Router, Claude Flow

### Supported Models
- **Text**: `gemini-pro`, `gemini-1.5-pro`
- **Vision**: `gemini-pro-vision`, `gemini-1.5-vision`
- **Embeddings**: Gemini embedding models

## 📋 Core Capabilities

### 1. Text Generation
- General conversation and Q&A
- Code generation and explanation
- Content creation and summarization
- Multi-turn conversations with context

### 2. Image Analysis
- Image understanding and description
- Visual question answering
- Document analysis and OCR
- Scene recognition and tagging

### 3. Multimodal Processing
- Combined text and image inputs
- Document processing with images
- Visual code analysis
- Content analysis across modalities

### 4. Integration Features
- Token counting for cost estimation
- Streaming responses for large outputs
- Rate limiting and quota management
- Fallback to alternative models

## 🛠️ Configuration

### Environment Variables
```bash
# Core Service Configuration
NODE_ENV=development
PORT=8085
SERVICE_NAME=gemini-mcp

# Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-pro
GEMINI_VISION_MODEL=gemini-pro-vision

# MCP Gateway Integration
MCP_GATEWAY_URL=http://localhost:4001
REGISTER_WITH_GATEWAY=true

# Orchestrator Integration
CLAUDE_FLOW_URL=http://localhost:9000
ENABLE_DUAL_ORCHESTRATOR=true

# Nexus Router
NEXUS_ROUTER_URL=http://localhost:8000
ROUTE_REQUESTS_THROUGH_NEXUS=true

# Redis Cache
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600

# Capabilities
ENABLE_IMAGE_ANALYSIS=true
ENABLE_CODE_GENERATION=true
ENABLE_MULTIMODAL=true

# Monitoring
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true
ENABLE_METRICS=true
```

## 📡 MCP Tool Definitions

### Tool: generate_text
Generate text using Gemini Pro model.

```json
{
  "name": "generate_text",
  "description": "Generate text using Google Gemini Pro model with optional context and constraints",
  "inputSchema": {
    "type": "object",
    "properties": {
      "prompt": {
        "type": "string",
        "description": "The input prompt for text generation"
      },
      "maxTokens": {
        "type": "integer",
        "description": "Maximum tokens in response (default: 2048)"
      },
      "temperature": {
        "type": "number",
        "minimum": 0,
        "maximum": 2,
        "description": "Sampling temperature (0=deterministic, 2=creative)"
      },
      "topP": {
        "type": "number",
        "description": "Nucleus sampling parameter"
      },
      "topK": {
        "type": "integer",
        "description": "Top-K sampling limit"
      },
      "stopSequences": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Stop generation at these sequences"
      },
      "systemPrompt": {
        "type": "string",
        "description": "System instructions for model behavior"
      }
    },
    "required": ["prompt"]
  }
}
```

### Tool: analyze_image
Analyze images using Gemini Vision model.

```json
{
  "name": "analyze_image",
  "description": "Analyze images and answer questions about them using Gemini Vision",
  "inputSchema": {
    "type": "object",
    "properties": {
      "imageUrl": {
        "type": "string",
        "description": "URL of the image to analyze"
      },
      "imageBase64": {
        "type": "string",
        "description": "Base64 encoded image data (PNG, JPEG, WEBP, GIF)"
      },
      "question": {
        "type": "string",
        "description": "Question to ask about the image"
      },
      "context": {
        "type": "string",
        "description": "Additional context about the image"
      },
      "detailedAnalysis": {
        "type": "boolean",
        "description": "Return detailed multi-paragraph analysis"
      }
    },
    "oneOf": [
      { "required": ["imageUrl", "question"] },
      { "required": ["imageBase64", "question"] }
    ]
  }
}
```

### Tool: process_multimodal
Process combined text and image inputs.

```json
{
  "name": "process_multimodal",
  "description": "Process multimodal requests combining text and images",
  "inputSchema": {
    "type": "object",
    "properties": {
      "text": {
        "type": "string",
        "description": "Text component of the request"
      },
      "images": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "url": { "type": "string" },
            "base64": { "type": "string" },
            "mimeType": {
              "type": "string",
              "enum": ["image/png", "image/jpeg", "image/webp", "image/gif"]
            }
          }
        },
        "description": "Images to process"
      },
      "task": {
        "type": "string",
        "enum": ["analyze", "compare", "extract", "understand"],
        "description": "Type of multimodal processing"
      }
    },
    "required": ["text", "images", "task"]
  }
}
```

### Tool: count_tokens
Estimate token usage for cost calculation.

```json
{
  "name": "count_tokens",
  "description": "Count tokens in text for cost estimation",
  "inputSchema": {
    "type": "object",
    "properties": {
      "text": {
        "type": "string",
        "description": "Text to count tokens for"
      },
      "model": {
        "type": "string",
        "description": "Model to use for counting (default: current model)"
      }
    },
    "required": ["text"]
  }
}
```

## 🚀 Transport Configuration

### Stdio Transport (Primary)
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const transport = new StdioServerTransport();
const server = new Server(
  {
    name: 'gemini-mcp',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

await server.connect(transport);
```

### HTTP Transport (Alternative)
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { HTTPServerTransport } from '@modelcontextprotocol/sdk/server/http.js';

const transport = new HTTPServerTransport({
  host: '0.0.0.0',
  port: 8085
});

await server.connect(transport);
```

## 💾 Resource Management

### Token Management
```typescript
interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

const calculateCost = (tokens: number, model: string): number => {
  const rates: Record<string, number> = {
    'gemini-pro': 0.0005 / 1000,           // $0.0005 per 1M tokens
    'gemini-pro-vision': 0.00125 / 1000,   // $0.00125 per 1M tokens
  };
  return tokens * (rates[model] || rates['gemini-pro']);
};
```

### Rate Limiting
```typescript
class RateLimiter {
  private quotaPerMinute: number = 60;
  private requestTimestamps: number[] = [];

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(
      ts => now - ts < 60000
    );
    return this.requestTimestamps.length < this.quotaPerMinute;
  }

  recordRequest(): void {
    this.requestTimestamps.push(Date.now());
  }
}
```

### Cache Layer
```typescript
// Cache Gemini responses in Redis
const cacheKey = (prompt: string, model: string) =>
  `gemini:${model}:${hashString(prompt)}`;

const getOrGenerate = async (prompt: string, model: string) => {
  const key = cacheKey(prompt, model);
  const cached = await redis.get(key);

  if (cached) {
    return JSON.parse(cached);
  }

  const response = await gemini.generateText(prompt, model);
  await redis.setex(key, 3600, JSON.stringify(response));
  return response;
};
```

## 🛡️ Error Handling

### Error Types
```typescript
class GeminiError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

// Error codes
enum GeminiErrorCode {
  INVALID_API_KEY = 'INVALID_API_KEY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  MODEL_NOT_FOUND = 'MODEL_NOT_FOUND',
  INVALID_INPUT = 'INVALID_INPUT',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT'
}
```

### Retry Logic
```typescript
const retryWithBackoff = async (
  fn: () => Promise<any>,
  maxRetries: number = 3
) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (!error.retryable || i === maxRetries - 1) {
        throw error;
      }
      const delay = Math.pow(2, i) * 1000; // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
```

## 🔗 Nexus Router Integration

### Request Routing
```typescript
// Register with Nexus Router
const registerWithNexus = async () => {
  await fetch(`${NEXUS_ROUTER_URL}/services/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'gemini-mcp',
      port: 8085,
      capabilities: {
        text_generation: true,
        image_analysis: true,
        multimodal: true,
        streaming: true
      }
    })
  });
};

// Route requests through Nexus
const routeRequest = async (request: AIRequest) => {
  if (process.env.ROUTE_REQUESTS_THROUGH_NEXUS === 'true') {
    return fetch(`${NEXUS_ROUTER_URL}/gemini/call`, {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }
  // Direct call
  return handleRequest(request);
};
```

### Dual Orchestrator Coordination
```typescript
// Register with Claude Flow
const registerWithOrchestrators = async () => {
  const orchestrators = [
    process.env.CLAUDE_FLOW_URL,
  ];

  for (const url of orchestrators) {
    try {
      await fetch(`${url}/api/services/register`, {
        method: 'POST',
        body: JSON.stringify({
          name: 'gemini-mcp',
          type: 'provider',
          capabilities: ['text_generation', 'image_analysis']
        })
      });
    } catch (error) {
      logger.error(`Failed to register with ${url}`, error);
    }
  }
};
```

## 🧪 Testing

### Unit Tests
```typescript
describe('Gemini MCP Server', () => {
  it('should generate text with prompt', async () => {
    const response = await callTool('generate_text', {
      prompt: 'Write a haiku about clouds'
    });
    expect(response).toContain('text');
    expect(response.text).toBeTruthy();
  });

  it('should count tokens accurately', async () => {
    const result = await callTool('count_tokens', {
      text: 'Hello world'
    });
    expect(result.tokens).toBeGreaterThan(0);
  });

  it('should handle rate limiting', async () => {
    const limiter = new RateLimiter();
    for (let i = 0; i < 60; i++) {
      expect(limiter.canMakeRequest()).toBe(true);
      limiter.recordRequest();
    }
    expect(limiter.canMakeRequest()).toBe(false);
  });
});

describe('Image Analysis', () => {
  it('should analyze images from URL', async () => {
    const response = await callTool('analyze_image', {
      imageUrl: 'https://example.com/image.jpg',
      question: 'What is in this image?'
    });
    expect(response.analysis).toBeTruthy();
  });

  it('should handle base64 encoded images', async () => {
    const base64 = Buffer.from('PNG data').toString('base64');
    const response = await callTool('analyze_image', {
      imageBase64: base64,
      question: 'Describe the image'
    });
    expect(response.analysis).toBeTruthy();
  });
});
```

### Integration Tests
- Test with actual Gemini API key
- Test streaming responses
- Test multimodal requests
- Test cache behavior
- Test error handling and retries

## 📊 Monitoring & Metrics

### Key Metrics
```
gemini_requests_total                      # Total requests
gemini_request_duration_seconds            # Request latency
gemini_tokens_used_total                   # Cumulative tokens
gemini_errors_total                        # Errors by type
gemini_cache_hits_total                    # Cache hit rate
gemini_image_analysis_requests             # Image analysis calls
gemini_multimodal_requests                 # Multimodal requests
```

### Health Checks
```bash
GET /health      # Service availability
GET /readiness   # Ready to accept requests
GET /liveness    # Process health
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

EXPOSE 8085

CMD ["node", "src/index.js"]
```

### Docker Compose
```yaml
gemini-mcp:
  build: ./services/gemini-mcp
  ports:
    - "8085:8085"
  environment:
    - GEMINI_API_KEY=${GEMINI_API_KEY}
    - NEXUS_ROUTER_URL=http://nexus-router:6000
    - REDIS_URL=redis://redis:6379
  depends_on:
    - redis
    - nexus-router
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8085/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

## 📚 Development Commands

```bash
# Install dependencies
npm install

# Development mode with hot reload
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

# Format code
npm run format
```

## 🔐 Security Considerations

- API key stored securely in environment
- No sensitive data in logs
- Input validation on all requests
- Rate limiting to prevent abuse
- Image size limits for processing
- Token counting for cost control
- CORS configuration for web clients
- Encrypted connections required

## 📖 Related Services

- **Nexus Router** - Central MCP gateway
- **Claude Flow** - Agent orchestration
- **** - Task management
- **Serena MCP** - Agent coordination
- **LiteLLM Proxy** - Multi-provider routing

## Resources

- Gemini API: https://ai.google.dev
- MCP SDK: https://github.com/modelcontextprotocol
- API Reference: `/docs/API.md`
- Examples: `/docs/examples/`

---

**Status**: Active provider service
**Last Updated**: 2026-01-22
**Supported Models**: Gemini Pro, Gemini Vision, Embeddings
