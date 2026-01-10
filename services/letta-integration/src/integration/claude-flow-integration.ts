/**
 * Claude Flow Integration
 * Integrates Letta memory system with Claude Flow orchestration
 */

import { EventEmitter } from 'events';
import { MemoryManager } from '../memory/memory-manager';
import { LearningSystem } from '../learning/learning-system';
import { SearchEngine } from '../search/search-engine';
import { ClaudeFlowIntegration, MemoryType } from '../types';
import { Logger } from '../utils/logger';

export class ClaudeFlowBridge extends EventEmitter {
  private logger: Logger;
  private memoryManager: MemoryManager;
  private learningSystem: LearningSystem;
  private searchEngine: SearchEngine;
  private config: ClaudeFlowIntegration;

  constructor(
    memoryManager: MemoryManager,
    learningSystem: LearningSystem,
    searchEngine: SearchEngine,
    config: ClaudeFlowIntegration = {}
  ) {
    super();
    this.logger = new Logger('ClaudeFlowBridge');
    this.memoryManager = memoryManager;
    this.learningSystem = learningSystem;
    this.searchEngine = searchEngine;
    this.config = config;
  }

  async onAgentSpawned(agentId: string, agentRole: string): Promise<void> {
    try {
      this.logger.info('Agent spawned:', { agentId, agentRole });

      // Load relevant memories for the agent role
      const memories = await this.searchEngine.semanticSearch(
        `${agentRole} agent tasks and patterns`,
        agentId,
        20
      );

      // Store agent initialization
      await this.memoryManager.addMemory(
        `Agent ${agentRole} spawned in swarm ${this.config.swarmId}`,
        MemoryType.EXPERIENCE,
        { agentId, agentRole, swarmId: this.config.swarmId },
        0.6
      );

      this.emit('agentMemoryLoaded', { agentId, memories: memories.length });
    } catch (error) {
      this.logger.error('Failed to handle agent spawn:', error);
    }
  }

  async onTaskCompleted(
    agentId: string,
    taskDescription: string,
    success: boolean,
    result?: any
  ): Promise<void> {
    try {
      this.logger.info('Task completed:', { agentId, success });

      // Record experience for learning
      await this.learningSystem.recordExperience(
        taskDescription,
        this.config.swarmId || 'default',
        success,
        { result, agentId }
      );

      // Store task outcome as memory
      await this.memoryManager.addMemory(
        `Task: ${taskDescription}. Success: ${success}`,
        MemoryType.EXPERIENCE,
        { taskDescription, success, result, agentId },
        success ? 0.8 : 0.5
      );

      this.emit('taskLearned', { agentId, success });
    } catch (error) {
      this.logger.error('Failed to handle task completion:', error);
    }
  }

  async shareMemoryAcrossSwarm(memory: string, importance = 0.7): Promise<void> {
    if (!this.config.sharedMemory) {
      this.logger.debug('Shared memory disabled');
      return;
    }

    try {
      this.logger.info('Sharing memory across swarm');

      await this.memoryManager.addMemory(
        memory,
        MemoryType.KNOWLEDGE,
        { shared: true, swarmId: this.config.swarmId, broadcast: true },
        importance
      );

      this.emit('memoryShared', { memory });
    } catch (error) {
      this.logger.error('Failed to share memory:', error);
    }
  }

  async getRelevantContext(query: string, limit = 10): Promise<string> {
    try {
      const results = await this.searchEngine.semanticSearch(
        query,
        this.config.agentRole || 'default',
        limit
      );

      const context = results
        .map(r => `[${r.relevance.toFixed(2)}] ${r.memory.content}`)
        .join('\n\n');

      return context;
    } catch (error) {
      this.logger.error('Failed to get relevant context:', error);
      return '';
    }
  }

  async getActionRecommendation(context: string): Promise<string | null> {
    try {
      const pattern = await this.learningSystem.recommendAction(context, 0.7);

      if (pattern) {
        return pattern.pattern;
      }

      return null;
    } catch (error) {
      this.logger.error('Failed to get action recommendation:', error);
      return null;
    }
  }

  async recordAgentInteraction(
    fromAgent: string,
    toAgent: string,
    message: string,
    outcome: 'success' | 'failure'
  ): Promise<void> {
    try {
      await this.memoryManager.addMemory(
        `Agent ${fromAgent} communicated with ${toAgent}: ${message}`,
        MemoryType.EXPERIENCE,
        { fromAgent, toAgent, message, outcome, swarmId: this.config.swarmId },
        outcome === 'success' ? 0.7 : 0.4
      );

      // Learn from the interaction
      await this.learningSystem.recordExperience(
        `${fromAgent} -> ${toAgent} interaction`,
        this.config.coordinationMode || 'mesh',
        outcome === 'success',
        { message }
      );
    } catch (error) {
      this.logger.error('Failed to record agent interaction:', error);
    }
  }

  async getSwarmKnowledge(): Promise<string[]> {
    try {
      const memories = await this.memoryManager.getMemoriesByType(MemoryType.KNOWLEDGE, 100);

      return memories
        .filter(m => m.metadata.shared)
        .map(m => m.content);
    } catch (error) {
      this.logger.error('Failed to get swarm knowledge:', error);
      return [];
    }
  }

  async analyzeSwarmPerformance(): Promise<{
    successRate: number;
    commonPatterns: string[];
    recommendations: string[];
  }> {
    try {
      const stats = this.learningSystem.getStatistics();
      const topPatterns = await this.learningSystem.getTopPatterns(10);

      return {
        successRate: stats.avgSuccessRate,
        commonPatterns: topPatterns.map(p => p.pattern),
        recommendations: this.generateRecommendations(topPatterns),
      };
    } catch (error) {
      this.logger.error('Failed to analyze swarm performance:', error);
      return {
        successRate: 0,
        commonPatterns: [],
        recommendations: [],
      };
    }
  }

  private generateRecommendations(patterns: any[]): string[] {
    const recommendations: string[] = [];

    const highConfidence = patterns.filter(p => p.confidence > 0.8);
    if (highConfidence.length > 0) {
      recommendations.push(`Focus on high-confidence patterns: ${highConfidence[0].pattern}`);
    }

    const lowSuccess = patterns.filter(p => p.successRate < 0.5);
    if (lowSuccess.length > 0) {
      recommendations.push(`Avoid low-success patterns: ${lowSuccess[0].pattern}`);
    }

    return recommendations;
  }

  setSwarmConfig(config: ClaudeFlowIntegration): void {
    this.config = { ...this.config, ...config };
    this.logger.info('Swarm config updated:', this.config);
  }
}
