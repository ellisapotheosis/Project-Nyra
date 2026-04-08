// Request types
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionRequest {
  model?: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  stream?: boolean;
}

// Response types
export interface CompletionChoice {
  index: number;
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface CompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: CompletionChoice[];
  usage: Usage;
  cached?: boolean;
  metadata?: {
    provider: string;
    worker: string;
    responseTime: number;
    cached: boolean;
  };
}

// Model types
export interface ModelInfo {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  available: boolean;
  provider: string;
}

export interface ModelsResponse {
  object: string;
  data: ModelInfo[];
  metadata?: {
    totalModels: number;
    localModels: number;
    cloudModels: number;
    healthyWorkers: number;
    totalWorkers: number;
  };
}

// Model Discovery types
export interface ModelCapabilities {
  id: string;
  name: string;
  aliases: string[];
  provider: 'local-gpu' | 'anthropic' | 'openrouter' | 'ollama' | 'openai' | 'google-gemini';
  availability: 'available' | 'unavailable' | 'degraded';

  // Performance characteristics
  maxContextLength: number;
  vramRequirements?: number;
  supportsStreaming: boolean;
  supportsToolCalling: boolean;
  supportsVision: boolean;

  // Cost information (per 1K tokens)
  costPer1kInputTokens?: number;
  costPer1kOutputTokens?: number;

  // Additional metadata
  parameterSize?: string;
  quantization?: string;
  architecture?: string;

  // Runtime info
  workerUrl?: string;
  workerId?: string;
  lastChecked: Date;
  responseTime?: number;
}

export interface DiscoveryStatus {
  lastDiscovery: Date;
  nextDiscovery: Date;
  totalModels: number;
  availableModels: number;
  unavailableModels: number;
  discovering: boolean;
  errors: string[];
}

// Health types
export interface ComponentHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  [key: string]: any;
}

export interface HealthResponse {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  components: {
    [key: string]: ComponentHealth;
  };
  metrics?: {
    [key: string]: any;
  };
}

// Export security types
export * from './security';

// Routing types
export type RoutingStrategy = 'cost-optimized' | 'latency-optimized' | 'quality-optimized';
export type RoutingProvider = 'local' | 'openai' | 'google-gemini' | 'anthropic' | 'openrouter';

export interface RoutingConfig {
  strategy: RoutingStrategy;
  preferLocal: boolean;
  fallbackCloud: boolean;
  costThreshold: number;
}

export interface CustomRoutingRule {
  id: string;
  pattern: string;
  targetProvider: RoutingProvider;
  targetModel?: string;
  priority: number;
  enabled: boolean;
  createdAt: Date;
}

export interface RoutingDecision {
  provider: RoutingProvider;
  reason: string;
  worker?: {
    url: string;
    models: string[];
    primaryUse: string;
    maxConcurrent: number;
  } | null;
}
