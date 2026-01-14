/**
 * Core types for RuVector Search
 */

export interface Vector {
  id: string;
  values: number[];
  metadata?: Record<string, any>;
}

export interface SearchResult {
  id: string;
  score: number;
  vector?: number[];
  metadata?: Record<string, any>;
}

export interface SearchQuery {
  vector?: number[];
  text?: string;
  filter?: Record<string, any>;
  limit?: number;
  offset?: number;
  includeVectors?: boolean;
  includeMetadata?: boolean;
}

export interface HybridSearchQuery extends SearchQuery {
  alpha?: number; // Weight between vector (1.0) and keyword (0.0) search
  keywordFields?: string[];
}

export interface EmbeddingRequest {
  text: string | string[];
  model?: string;
  provider?: EmbeddingProvider;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  model: string;
  provider: string;
  dimensions: number;
  tokensUsed?: number;
}

export type EmbeddingProvider = 'openai' | 'cohere' | 'local';

export interface BatchEmbeddingJob {
  id: string;
  texts: string[];
  provider: EmbeddingProvider;
  model?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: EmbeddingResponse;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface IndexConfig {
  name: string;
  dimensions: number;
  metric?: 'cosine' | 'euclidean' | 'dot';
  onDisk?: boolean;
  optimizerConfig?: {
    deletedThreshold?: number;
    vacuumMinVectorNumber?: number;
    defaultSegmentNumber?: number;
  };
  hnswConfig?: {
    m?: number;
    efConstruct?: number;
    fullScanThreshold?: number;
  };
}

export interface IndexStats {
  name: string;
  vectorCount: number;
  dimensions: number;
  indexedVectorsCount: number;
  pointsCount: number;
  segmentsCount: number;
  status: string;
  optimizerStatus?: string;
  memoryUsage?: number;
}

export interface SearchAnalytics {
  totalSearches: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  cacheHitRate: number;
  errorRate: number;
  topQueries: Array<{
    query: string;
    count: number;
    avgLatency: number;
  }>;
  providerUsage: Record<string, number>;
}

export interface DistributedNode {
  id: string;
  url: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  load: number;
  lastCheck: Date;
  collections?: string[];
}

export interface SearchCoordinatorConfig {
  nodes: DistributedNode[];
  strategy: 'round-robin' | 'least-load' | 'consistent-hash';
  healthCheckInterval: number;
  maxRetries: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
}

export interface PerformanceMetrics {
  requestsPerSecond: number;
  averageLatency: number;
  cacheHitRate: number;
  embeddingLatency: number;
  searchLatency: number;
  memoryUsage: number;
  cpuUsage?: number;
}

export interface QdrantPoint {
  id: string | number;
  vector: number[] | Record<string, number[]>;
  payload?: Record<string, any>;
}

export interface QdrantSearchParams {
  vector: number[] | Record<string, number[]>;
  limit?: number;
  offset?: number;
  filter?: any;
  with_payload?: boolean | string[];
  with_vector?: boolean;
  score_threshold?: number;
}

export interface QdrantSearchResponse {
  id: string | number;
  score: number;
  version: number;
  payload?: Record<string, any>;
  vector?: number[] | Record<string, number[]>;
}
