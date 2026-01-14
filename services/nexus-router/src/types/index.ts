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
