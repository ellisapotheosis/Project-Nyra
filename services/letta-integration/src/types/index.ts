/**
 * Core type definitions for Letta integration
 */

export interface LettaConfig {
  apiKey: string;
  baseUrl: string;
  agentId?: string;
  userId?: string;
  timeout?: number;
  retryAttempts?: number;
  enableSync?: boolean;
  enableAnalytics?: boolean;
}

export interface Memory {
  id: string;
  agentId: string;
  type: MemoryType;
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
  timestamp: Date;
  importance: number;
  tags: string[];
  references: string[];
}

export enum MemoryType {
  CONVERSATION = 'conversation',
  FACT = 'fact',
  SKILL = 'skill',
  EXPERIENCE = 'experience',
  PREFERENCE = 'preference',
  CONTEXT = 'context',
  KNOWLEDGE = 'knowledge'
}

export interface ConversationContext {
  id: string;
  agentId: string;
  sessionId: string;
  messages: Message[];
  summary: string;
  topics: string[];
  entities: Entity[];
  sentiment: Sentiment;
  startTime: Date;
  lastUpdate: Date;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Entity {
  text: string;
  type: string;
  mentions: number;
  firstSeen: Date;
  lastSeen: Date;
}

export interface Sentiment {
  score: number;
  label: 'positive' | 'neutral' | 'negative';
  confidence: number;
}

export interface LearningPattern {
  id: string;
  agentId: string;
  pattern: string;
  occurrences: number;
  successRate: number;
  contexts: string[];
  createdAt: Date;
  lastUsed: Date;
  confidence: number;
}

export interface SearchQuery {
  query: string;
  agentId?: string;
  type?: MemoryType[];
  tags?: string[];
  timeRange?: TimeRange;
  limit?: number;
  threshold?: number;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface SearchResult {
  memory: Memory;
  score: number;
  relevance: number;
  highlights?: string[];
}

export interface SyncStatus {
  lastSync: Date;
  status: 'idle' | 'syncing' | 'error';
  pendingChanges: number;
  conflicts: number;
}

export interface Analytics {
  agentId: string;
  totalMemories: number;
  memoryByType: Record<MemoryType, number>;
  conversationStats: ConversationStats;
  learningProgress: LearningProgress;
  searchMetrics: SearchMetrics;
}

export interface ConversationStats {
  totalConversations: number;
  averageLength: number;
  topTopics: Array<{ topic: string; count: number }>;
  sentimentDistribution: Record<string, number>;
}

export interface LearningProgress {
  totalPatterns: number;
  successRate: number;
  recentImprovements: Array<{ date: Date; improvement: number }>;
  topSkills: Array<{ skill: string; proficiency: number }>;
}

export interface SearchMetrics {
  totalSearches: number;
  averageResultCount: number;
  topQueries: Array<{ query: string; count: number }>;
  averageRelevance: number;
}

export interface ClaudeFlowIntegration {
  swarmId?: string;
  agentRole?: string;
  coordinationMode?: 'mesh' | 'hierarchical' | 'ring' | 'star';
  sharedMemory?: boolean;
}

export interface MemoryEvent {
  type: 'created' | 'updated' | 'deleted' | 'retrieved';
  memory: Memory;
  timestamp: Date;
  source: string;
}
