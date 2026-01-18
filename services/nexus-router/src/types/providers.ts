// Provider types
export type ProviderType =
  | 'anthropic'
  | 'aws-bedrock'
  | 'google-gemini'
  | 'openai'
  | 'openrouter'
  | 'meta-llama'
  | 'cohere';

export interface ProviderConfig {
  id: string;
  name: string;
  type: ProviderType;
  enabled: boolean;
  apiKey?: string;
  baseUrl?: string;
  models: string[];
  tokenForwarding: boolean;
  maxTokens?: number;
  timeout?: number;
  priority?: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderHealth {
  providerId: string;
  healthy: boolean;
  responseTime?: number;
  lastCheck: string;
  error?: string;
  details?: {
    modelsAvailable?: number;
    rateLimitRemaining?: number;
    quotaUsed?: number;
  };
}

export interface ProviderTestResult {
  providerId: string;
  success: boolean;
  responseTime: number;
  error?: string;
  details?: {
    modelsDiscovered?: string[];
    apiVersion?: string;
    capabilities?: string[];
  };
}

export interface CreateProviderRequest {
  name: string;
  type: ProviderType;
  apiKey?: string;
  baseUrl?: string;
  models?: string[];
  enabled?: boolean;
  tokenForwarding?: boolean;
  maxTokens?: number;
  timeout?: number;
  priority?: number;
  metadata?: Record<string, any>;
}

export interface UpdateProviderRequest {
  name?: string;
  enabled?: boolean;
  apiKey?: string;
  baseUrl?: string;
  models?: string[];
  tokenForwarding?: boolean;
  maxTokens?: number;
  timeout?: number;
  priority?: number;
  metadata?: Record<string, any>;
}

export interface ProvidersListResponse {
  providers: ProviderConfig[];
  metadata: {
    total: number;
    enabled: number;
    disabled: number;
    byType: Record<ProviderType, number>;
  };
}
