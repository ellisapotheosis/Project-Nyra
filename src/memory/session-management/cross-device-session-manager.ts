/**
 * NYRA Cross-Device Session Management System
 * Handles session persistence and context sharing across 4 PCs and cloud instances
 */

import { EventEmitter } from 'events';
import { DistributedKnowledgeGraph } from '../knowledge-graph/distributed-knowledge-graph';

export interface SessionContext {
  id: string;
  userId: string;
  deviceId: string;
  startTime: Date;
  lastActivity: Date;
  contextData: {
    conversation: ConversationContext[];
    agentStates: Map<string, AgentState>;
    workflowState: WorkflowState;
    memoryAnchors: MemoryAnchor[];
    preferences: UserPreferences;
  };
  metadata: {
    location: 'orchestrator' | 'worker1' | 'worker2' | 'worker3' | 'cloud';
    quality: 'high' | 'medium' | 'low';
    priority: number;
    tags: string[];
  };
  checksum: string;
  version: number;
}

export interface ConversationContext {
  messageId: string;
  role: 'user' | 'assistant' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  embeddings?: Float32Array;
  relatedNodes: string[];
  contextWindow: number;
  importance: number;
}

export interface AgentState {
  agentId: string;
  type: string;
  currentTask?: string;
  memory: Map<string, any>;
  learningState: LearningState;
  performance: PerformanceMetrics;
  lastUpdate: Date;
}

export interface WorkflowState {
  workflowId: string;
  currentStep: number;
  completedSteps: string[];
  pendingSteps: string[];
  variables: Map<string, any>;
  branchingHistory: BranchingPoint[];
}

export interface MemoryAnchor {
  id: string;
  type: 'episodic' | 'semantic' | 'procedural' | 'working';
  content: any;
  importance: number;
  associatedNodes: string[];
  lastAccessed: Date;
  accessCount: number;
}

export interface UserPreferences {
  communicationStyle: 'formal' | 'casual' | 'technical' | 'creative';
  responseLength: 'brief' | 'detailed' | 'comprehensive';
  domainFocus: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  privacySettings: PrivacySettings;
}

export interface PrivacySettings {
  dataRetention: number; // days
  shareAcrossDevices: boolean;
  anonymizePersonalInfo: boolean;
  encryptSensitiveData: boolean;
}

export interface LearningState {
  patterns: Map<string, PatternData>;
  adaptations: Adaptation[];
  performanceHistory: PerformancePoint[];
  knowledgeGraph: Set<string>; // Node IDs in knowledge graph
}

export interface PatternData {
  pattern: string;
  frequency: number;
  confidence: number;
  lastSeen: Date;
  contexts: string[];
}

export interface Adaptation {
  trigger: string;
  action: string;
  timestamp: Date;
  effectiveness: number;
}

export interface PerformancePoint {
  timestamp: Date;
  metric: string;
  value: number;
  context: string;
}

export interface PerformanceMetrics {
  responseTime: number;
  accuracy: number;
  userSatisfaction: number;
  taskCompletion: number;
  memoryEfficiency: number;
}

export interface BranchingPoint {
  stepId: string;
  decision: string;
  alternatives: string[];
  timestamp: Date;
  reasoning: string;
}

export interface SessionSyncEvent {
  type: 'session_created' | 'session_updated' | 'session_merged' | 'context_shared';
  sessionId: string;
  sourceDevice: string;
  targetDevices: string[];
  payload: Partial<SessionContext>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

export class CrossDeviceSessionManager extends EventEmitter {
  private sessions: Map<string, SessionContext> = new Map();
  private deviceId: string;
  private knowledgeGraph: DistributedKnowledgeGraph;
  private syncInterval: NodeJS.Timeout;
  private contextBuffer: Map<string, ConversationContext[]> = new Map();
  private sessionStorage: SessionStorageAdapter;
  private encryptionKey?: CryptoKey;

  constructor(
    deviceId: string,
    knowledgeGraph: DistributedKnowledgeGraph,
    sessionStorage: SessionStorageAdapter
  ) {
    super();
    this.deviceId = deviceId;
    this.knowledgeGraph = knowledgeGraph;
    this.sessionStorage = sessionStorage;

    // Start periodic synchronization
    this.syncInterval = setInterval(() => this.syncSessions(), 30000); // 30 seconds

    // Listen for knowledge graph updates
    this.knowledgeGraph.on('nodeAdded', this.handleKnowledgeGraphUpdate.bind(this));
    this.knowledgeGraph.on('nodeUpdated', this.handleKnowledgeGraphUpdate.bind(this));
  }

  /**
   * Create a new session context
   */
  async createSession(userId: string, initialContext?: Partial<SessionContext>): Promise<SessionContext> {
    const sessionId = this.generateSessionId();

    const session: SessionContext = {
      id: sessionId,
      userId,
      deviceId: this.deviceId,
      startTime: new Date(),
      lastActivity: new Date(),
      contextData: {
        conversation: [],
        agentStates: new Map(),
        workflowState: {
          workflowId: '',
          currentStep: 0,
          completedSteps: [],
          pendingSteps: [],
          variables: new Map(),
          branchingHistory: []
        },
        memoryAnchors: [],
        preferences: await this.loadUserPreferences(userId)
      },
      metadata: {
        location: this.deviceId as any,
        quality: 'high',
        priority: 1,
        tags: []
      },
      checksum: '',
      version: 1,
      ...initialContext
    };

    session.checksum = await this.computeSessionChecksum(session);
    this.sessions.set(sessionId, session);

    // Persist to storage
    await this.sessionStorage.saveSession(session);

    // Broadcast session creation
    this.broadcastSessionEvent({
      type: 'session_created',
      sessionId,
      sourceDevice: this.deviceId,
      targetDevices: ['orchestrator', 'worker1', 'worker2', 'worker3', 'cloud'],
      payload: session,
      priority: 'medium',
      timestamp: new Date()
    });

    this.emit('sessionCreated', session);
    return session;
  }

  /**
   * Add conversation context to session
   */
  async addConversationContext(
    sessionId: string,
    role: ConversationContext['role'],
    content: string,
    metadata?: Partial<ConversationContext>
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Generate embeddings for content
    const embeddings = await this.knowledgeGraph['embeddingModel'].embed(content);

    const context: ConversationContext = {
      messageId: this.generateMessageId(),
      role,
      content,
      timestamp: new Date(),
      embeddings: new Float32Array(embeddings),
      relatedNodes: [],
      contextWindow: session.contextData.conversation.length,
      importance: this.calculateImportance(content, role),
      ...metadata
    };

    // Find related knowledge nodes
    context.relatedNodes = await this.findRelatedKnowledgeNodes(content);

    session.contextData.conversation.push(context);
    session.lastActivity = new Date();
    session.version++;

    // Update context buffer for efficient access
    if (!this.contextBuffer.has(sessionId)) {
      this.contextBuffer.set(sessionId, []);
    }
    this.contextBuffer.get(sessionId)!.push(context);

    // Maintain context window size
    this.maintainContextWindow(session);

    // Update session checksum
    session.checksum = await this.computeSessionChecksum(session);

    // Persist changes
    await this.sessionStorage.saveSession(session);

    // Broadcast context update
    this.broadcastSessionEvent({
      type: 'session_updated',
      sessionId,
      sourceDevice: this.deviceId,
      targetDevices: ['orchestrator', 'worker1', 'worker2', 'worker3'],
      payload: { contextData: { conversation: [context] } },
      priority: 'medium',
      timestamp: new Date()
    });

    this.emit('contextAdded', sessionId, context);
  }

  /**
   * Update agent state in session
   */
  async updateAgentState(sessionId: string, agentId: string, state: Partial<AgentState>): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const currentState = session.contextData.agentStates.get(agentId) || {
      agentId,
      type: 'unknown',
      memory: new Map(),
      learningState: {
        patterns: new Map(),
        adaptations: [],
        performanceHistory: [],
        knowledgeGraph: new Set()
      },
      performance: {
        responseTime: 0,
        accuracy: 0,
        userSatisfaction: 0,
        taskCompletion: 0,
        memoryEfficiency: 0
      },
      lastUpdate: new Date()
    };

    const updatedState: AgentState = {
      ...currentState,
      ...state,
      lastUpdate: new Date()
    };

    session.contextData.agentStates.set(agentId, updatedState);
    session.lastActivity = new Date();
    session.version++;
    session.checksum = await this.computeSessionChecksum(session);

    await this.sessionStorage.saveSession(session);
    this.emit('agentStateUpdated', sessionId, agentId, updatedState);
  }

  /**
   * Merge sessions from different devices
   */
  async mergeSessions(primarySessionId: string, secondarySessionIds: string[]): Promise<SessionContext> {
    const primarySession = this.sessions.get(primarySessionId);
    if (!primarySession) {
      throw new Error(`Primary session ${primarySessionId} not found`);
    }

    const secondarySessions = secondarySessionIds
      .map(id => this.sessions.get(id))
      .filter(session => session !== undefined) as SessionContext[];

    // Merge conversation contexts
    const allConversations = [
      ...primarySession.contextData.conversation,
      ...secondarySessions.flatMap(s => s.contextData.conversation)
    ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Merge agent states
    const mergedAgentStates = new Map(primarySession.contextData.agentStates);
    for (const session of secondarySessions) {
      for (const [agentId, state] of session.contextData.agentStates) {
        const existing = mergedAgentStates.get(agentId);
        if (!existing || state.lastUpdate > existing.lastUpdate) {
          mergedAgentStates.set(agentId, state);
        }
      }
    }

    // Merge memory anchors
    const allMemoryAnchors = [
      ...primarySession.contextData.memoryAnchors,
      ...secondarySessions.flatMap(s => s.contextData.memoryAnchors)
    ];

    // Remove duplicates and sort by importance
    const uniqueAnchors = Array.from(
      new Map(allMemoryAnchors.map(anchor => [anchor.id, anchor])).values()
    ).sort((a, b) => b.importance - a.importance);

    const mergedSession: SessionContext = {
      ...primarySession,
      contextData: {
        ...primarySession.contextData,
        conversation: allConversations,
        agentStates: mergedAgentStates,
        memoryAnchors: uniqueAnchors
      },
      lastActivity: new Date(),
      version: Math.max(
        primarySession.version,
        ...secondarySessions.map(s => s.version)
      ) + 1
    };

    mergedSession.checksum = await this.computeSessionChecksum(mergedSession);
    this.sessions.set(primarySessionId, mergedSession);

    // Remove secondary sessions
    for (const id of secondarySessionIds) {
      this.sessions.delete(id);
      await this.sessionStorage.deleteSession(id);
    }

    await this.sessionStorage.saveSession(mergedSession);

    this.broadcastSessionEvent({
      type: 'session_merged',
      sessionId: primarySessionId,
      sourceDevice: this.deviceId,
      targetDevices: ['orchestrator', 'worker1', 'worker2', 'worker3'],
      payload: mergedSession,
      priority: 'high',
      timestamp: new Date()
    });

    this.emit('sessionsMerged', primarySessionId, secondarySessionIds, mergedSession);
    return mergedSession;
  }

  /**
   * Share context with other devices
   */
  async shareContext(sessionId: string, contextType: 'conversation' | 'agent_state' | 'workflow', targetDevices: string[]): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    let sharedData: any;
    switch (contextType) {
      case 'conversation':
        sharedData = { conversation: session.contextData.conversation };
        break;
      case 'agent_state':
        sharedData = { agentStates: Array.from(session.contextData.agentStates.entries()) };
        break;
      case 'workflow':
        sharedData = { workflowState: session.contextData.workflowState };
        break;
    }

    this.broadcastSessionEvent({
      type: 'context_shared',
      sessionId,
      sourceDevice: this.deviceId,
      targetDevices,
      payload: sharedData,
      priority: 'medium',
      timestamp: new Date()
    });

    this.emit('contextShared', sessionId, contextType, targetDevices);
  }

  /**
   * Restore session from storage
   */
  async restoreSession(sessionId: string): Promise<SessionContext | null> {
    // First check in-memory cache
    let session = this.sessions.get(sessionId);

    if (!session) {
      // Load from storage
      session = await this.sessionStorage.loadSession(sessionId);
      if (session) {
        this.sessions.set(sessionId, session);
      }
    }

    return session || null;
  }

  /**
   * Get session context with smart context window
   */
  async getSessionContext(sessionId: string, maxMessages?: number): Promise<ConversationContext[]> {
    const session = await this.restoreSession(sessionId);
    if (!session) {
      return [];
    }

    let conversation = session.contextData.conversation;

    if (maxMessages && conversation.length > maxMessages) {
      // Smart context selection - keep high importance messages and recent messages
      const recentMessages = conversation.slice(-Math.floor(maxMessages * 0.7));
      const importantMessages = conversation
        .filter(msg => !recentMessages.includes(msg))
        .sort((a, b) => b.importance - a.importance)
        .slice(0, Math.floor(maxMessages * 0.3));

      conversation = [...importantMessages, ...recentMessages]
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }

    return conversation;
  }

  /**
   * Calculate importance score for conversation context
   */
  private calculateImportance(content: string, role: ConversationContext['role']): number {
    let importance = 0.5; // Base importance

    // Role-based importance
    if (role === 'user') importance += 0.3;
    if (role === 'system') importance += 0.2;

    // Content-based importance
    const keywordMatches = [
      /\b(important|critical|urgent|remember|note)\b/i,
      /\b(error|problem|issue|bug)\b/i,
      /\b(decision|choose|select)\b/i,
      /\b(summary|conclusion|result)\b/i
    ];

    for (const pattern of keywordMatches) {
      if (pattern.test(content)) {
        importance += 0.1;
      }
    }

    // Length-based importance (longer messages often contain more context)
    if (content.length > 500) importance += 0.1;
    if (content.length > 1000) importance += 0.1;

    return Math.min(importance, 1.0);
  }

  /**
   * Find related knowledge nodes for conversation context
   */
  private async findRelatedKnowledgeNodes(content: string): Promise<string[]> {
    const relatedNodes = await this.knowledgeGraph.searchSimilar(content, 5, 0.7);
    return relatedNodes.map(node => node.id);
  }

  /**
   * Maintain context window size for optimal performance
   */
  private maintainContextWindow(session: SessionContext): void {
    const maxContextSize = 1000; // Maximum conversation entries
    const trimToSize = 800; // Trim to this size when limit is exceeded

    if (session.contextData.conversation.length > maxContextSize) {
      // Keep high importance messages and recent messages
      const conversation = session.contextData.conversation;
      const recent = conversation.slice(-Math.floor(trimToSize * 0.7));
      const important = conversation
        .filter(msg => !recent.includes(msg))
        .sort((a, b) => b.importance - a.importance)
        .slice(0, Math.floor(trimToSize * 0.3));

      session.contextData.conversation = [...important, ...recent]
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }
  }

  /**
   * Handle knowledge graph updates
   */
  private async handleKnowledgeGraphUpdate(node: any): Promise<void> {
    // Update related session contexts when knowledge graph changes
    for (const [sessionId, session] of this.sessions) {
      const relatedContexts = session.contextData.conversation.filter(
        ctx => ctx.relatedNodes.includes(node.id)
      );

      if (relatedContexts.length > 0) {
        // Update session metadata to indicate related knowledge has changed
        session.metadata.tags.push(`kg-update-${Date.now()}`);
        session.version++;
        session.checksum = await this.computeSessionChecksum(session);
        await this.sessionStorage.saveSession(session);
      }
    }
  }

  /**
   * Sync sessions with other devices
   */
  private async syncSessions(): Promise<void> {
    for (const session of this.sessions.values()) {
      if (Date.now() - session.lastActivity.getTime() < 300000) { // Active in last 5 minutes
        this.broadcastSessionEvent({
          type: 'session_updated',
          sessionId: session.id,
          sourceDevice: this.deviceId,
          targetDevices: ['orchestrator', 'worker1', 'worker2', 'worker3'],
          payload: session,
          priority: 'low',
          timestamp: new Date()
        });
      }
    }
  }

  /**
   * Broadcast session event to other devices
   */
  private broadcastSessionEvent(event: SessionSyncEvent): void {
    // Implementation depends on transport layer (WebRTC, cloudflared, etc.)
    this.emit('broadcastEvent', event);
  }

  /**
   * Load user preferences from storage
   */
  private async loadUserPreferences(userId: string): Promise<UserPreferences> {
    // Default preferences - would load from storage in real implementation
    return {
      communicationStyle: 'technical',
      responseLength: 'detailed',
      domainFocus: ['development', 'ai', 'infrastructure'],
      learningStyle: 'mixed',
      privacySettings: {
        dataRetention: 30,
        shareAcrossDevices: true,
        anonymizePersonalInfo: false,
        encryptSensitiveData: true
      }
    };
  }

  private generateSessionId(): string {
    return `nyra-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async computeSessionChecksum(session: SessionContext): Promise<string> {
    const content = JSON.stringify({
      id: session.id,
      contextData: session.contextData,
      version: session.version
    });
    const encoder = new TextEncoder();
    const hash = await crypto.subtle.digest('SHA-256', encoder.encode(content));
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.removeAllListeners();
  }
}

export interface SessionStorageAdapter {
  saveSession(session: SessionContext): Promise<void>;
  loadSession(sessionId: string): Promise<SessionContext | null>;
  deleteSession(sessionId: string): Promise<void>;
  listSessions(userId?: string): Promise<string[]>;
}

export class FileSessionStorage implements SessionStorageAdapter {
  private storageDir: string;

  constructor(storageDir: string) {
    this.storageDir = storageDir;
  }

  async saveSession(session: SessionContext): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');

    await fs.mkdir(this.storageDir, { recursive: true });
    const filePath = path.join(this.storageDir, `${session.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(session, null, 2));
  }

  async loadSession(sessionId: string): Promise<SessionContext | null> {
    const fs = await import('fs/promises');
    const path = await import('path');

    const filePath = path.join(this.storageDir, `${sessionId}.json`);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');

    const filePath = path.join(this.storageDir, `${sessionId}.json`);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Session file doesn't exist, ignore
    }
  }

  async listSessions(userId?: string): Promise<string[]> {
    const fs = await import('fs/promises');
    const path = await import('path');

    try {
      const files = await fs.readdir(this.storageDir);
      const sessionFiles = files.filter(file => file.endsWith('.json'));

      if (userId) {
        // Filter by user ID - would need to read each file to check
        const sessions: string[] = [];
        for (const file of sessionFiles) {
          const sessionId = file.replace('.json', '');
          const session = await this.loadSession(sessionId);
          if (session && session.userId === userId) {
            sessions.push(sessionId);
          }
        }
        return sessions;
      }

      return sessionFiles.map(file => file.replace('.json', ''));
    } catch (error) {
      return [];
    }
  }
}

export class DistributedSessionStorage implements SessionStorageAdapter {
  private primaryStorage: SessionStorageAdapter;
  private replicaStorages: SessionStorageAdapter[];
  private replicationFactor: number;

  constructor(
    primaryStorage: SessionStorageAdapter,
    replicaStorages: SessionStorageAdapter[],
    replicationFactor: number = 2
  ) {
    this.primaryStorage = primaryStorage;
    this.replicaStorages = replicaStorages;
    this.replicationFactor = replicationFactor;
  }

  async saveSession(session: SessionContext): Promise<void> {
    // Save to primary storage
    await this.primaryStorage.saveSession(session);

    // Replicate to subset of replica storages
    const selectedReplicas = this.replicaStorages
      .slice(0, this.replicationFactor);

    await Promise.all(
      selectedReplicas.map(storage =>
        storage.saveSession(session).catch(() => {
          // Log error but don't fail the operation
        })
      )
    );
  }

  async loadSession(sessionId: string): Promise<SessionContext | null> {
    // Try primary storage first
    try {
      const session = await this.primaryStorage.loadSession(sessionId);
      if (session) return session;
    } catch (error) {
      // Primary storage failed, try replicas
    }

    // Try replica storages
    for (const storage of this.replicaStorages) {
      try {
        const session = await storage.loadSession(sessionId);
        if (session) {
          // Repair primary storage
          this.primaryStorage.saveSession(session).catch(() => {});
          return session;
        }
      } catch (error) {
        continue;
      }
    }

    return null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    // Delete from all storages
    const deletePromises = [
      this.primaryStorage.deleteSession(sessionId),
      ...this.replicaStorages.map(storage => storage.deleteSession(sessionId))
    ];

    await Promise.allSettled(deletePromises);
  }

  async listSessions(userId?: string): Promise<string[]> {
    // Get sessions from primary storage
    return this.primaryStorage.listSessions(userId);
  }
}