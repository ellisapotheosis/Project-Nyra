/**
 * Long-term Learning System
 * Enables agents to learn from experiences and improve over time
 */

import { v4 as uuidv4 } from 'uuid';
import { LearningPattern } from '../types';
import { Logger } from '../utils/logger';
import { MemoryManager } from '../memory/memory-manager';

export class LearningSystem {
  private logger: Logger;
  private memoryManager: MemoryManager;
  private patterns: Map<string, LearningPattern>;
  private agentId: string;

  constructor(memoryManager: MemoryManager, agentId: string) {
    this.logger = new Logger('LearningSystem');
    this.memoryManager = memoryManager;
    this.agentId = agentId;
    this.patterns = new Map();

    this.loadPatterns().catch((error) => {
      this.logger.error('Failed to load learning patterns during init — system will start with empty patterns:', error);
    });
  }

  private async loadPatterns(): Promise<void> {
    const memories = await this.memoryManager.getMemoriesByType('skill' as any, 1000);

    for (const memory of memories) {
      if (memory.metadata.learningPattern) {
        const pattern: LearningPattern = memory.metadata.learningPattern;
        this.patterns.set(pattern.id, pattern);
      }
    }

    this.logger.info('Learning patterns loaded:', { count: this.patterns.size });
  }

  async recordExperience(
    pattern: string,
    context: string,
    success: boolean,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      let learningPattern = Array.from(this.patterns.values()).find(p => p.pattern === pattern);

      if (!learningPattern) {
        learningPattern = {
          id: uuidv4(),
          agentId: this.agentId,
          pattern,
          occurrences: 0,
          successRate: 0,
          contexts: [],
          createdAt: new Date(),
          lastUsed: new Date(),
          confidence: 0,
        };
        this.patterns.set(learningPattern.id, learningPattern);
      }

      // Update pattern statistics
      learningPattern.occurrences++;
      learningPattern.lastUsed = new Date();

      if (!learningPattern.contexts.includes(context)) {
        learningPattern.contexts.push(context);
      }

      // Update success rate
      const totalAttempts = learningPattern.occurrences;
      const currentSuccesses = learningPattern.successRate * (totalAttempts - 1);
      learningPattern.successRate = (currentSuccesses + (success ? 1 : 0)) / totalAttempts;

      // Update confidence based on occurrences and success rate
      learningPattern.confidence = this.calculateConfidence(
        learningPattern.occurrences,
        learningPattern.successRate
      );

      // Store pattern in memory
      await this.memoryManager.addMemory(
        `Learned pattern: ${pattern}`,
        'skill' as any,
        { learningPattern, success, context, ...metadata },
        learningPattern.confidence
      );

      this.logger.info('Experience recorded:', { pattern, success, successRate: learningPattern.successRate });
    } catch (error) {
      this.logger.error('Failed to record experience:', error);
      throw error;
    }
  }

  async getPattern(pattern: string): Promise<LearningPattern | null> {
    const found = Array.from(this.patterns.values()).find(p => p.pattern === pattern);
    return found || null;
  }

  async getTopPatterns(limit = 10): Promise<LearningPattern[]> {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  async getPatternsByContext(context: string): Promise<LearningPattern[]> {
    return Array.from(this.patterns.values())
      .filter(p => p.contexts.includes(context))
      .sort((a, b) => b.successRate - a.successRate);
  }

  async recommendAction(context: string, threshold = 0.7): Promise<LearningPattern | null> {
    const relevantPatterns = await this.getPatternsByContext(context);

    const bestPattern = relevantPatterns.find(
      p => p.confidence >= threshold && p.successRate >= threshold
    );

    if (bestPattern) {
      this.logger.info('Action recommended:', { pattern: bestPattern.pattern, confidence: bestPattern.confidence });
    }

    return bestPattern || null;
  }

  async trainOnHistory(): Promise<void> {
    try {
      this.logger.info('Training on historical data');

      // Get all skill memories
      const memories = await this.memoryManager.getMemoriesByType('skill' as any, 10000);

      for (const memory of memories) {
        if (memory.metadata.success !== undefined) {
          await this.recordExperience(
            memory.content,
            memory.metadata.context || 'general',
            memory.metadata.success,
            memory.metadata
          );
        }
      }

      this.logger.info('Training complete:', { patterns: this.patterns.size });
    } catch (error) {
      this.logger.error('Failed to train on history:', error);
      throw error;
    }
  }

  async prunePatterns(minOccurrences = 3, minConfidence = 0.3): Promise<number> {
    try {
      let removed = 0;

      for (const [id, pattern] of this.patterns.entries()) {
        if (pattern.occurrences < minOccurrences || pattern.confidence < minConfidence) {
          this.patterns.delete(id);
          removed++;
        }
      }

      this.logger.info('Patterns pruned:', { removed, remaining: this.patterns.size });
      return removed;
    } catch (error) {
      this.logger.error('Failed to prune patterns:', error);
      throw error;
    }
  }

  async analyzeProgress(timeRange: { start: Date; end: Date }): Promise<{
    totalPatterns: number;
    avgSuccessRate: number;
    improvement: number;
    topSkills: Array<{ pattern: string; confidence: number }>;
  }> {
    const patterns = Array.from(this.patterns.values());

    const totalPatterns = patterns.length;
    const avgSuccessRate = patterns.reduce((sum, p) => sum + p.successRate, 0) / totalPatterns;

    // Calculate improvement (simple version)
    const recentPatterns = patterns.filter(p => p.lastUsed >= timeRange.start);
    const oldPatterns = patterns.filter(p => p.lastUsed < timeRange.start);

    const recentAvg = recentPatterns.reduce((sum, p) => sum + p.successRate, 0) / recentPatterns.length;
    const oldAvg = oldPatterns.reduce((sum, p) => sum + p.successRate, 0) / oldPatterns.length;
    const improvement = recentAvg - oldAvg;

    const topSkills = patterns
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10)
      .map(p => ({ pattern: p.pattern, confidence: p.confidence }));

    return {
      totalPatterns,
      avgSuccessRate,
      improvement,
      topSkills,
    };
  }

  private calculateConfidence(occurrences: number, successRate: number): number {
    // Confidence increases with both occurrences and success rate
    // Using a sigmoid-like function
    const occurrenceFactor = Math.min(occurrences / 10, 1);
    const successFactor = successRate;

    return (occurrenceFactor * 0.3 + successFactor * 0.7);
  }

  getStatistics(): {
    totalPatterns: number;
    avgOccurrences: number;
    avgSuccessRate: number;
    avgConfidence: number;
  } {
    const patterns = Array.from(this.patterns.values());

    return {
      totalPatterns: patterns.length,
      avgOccurrences: patterns.reduce((sum, p) => sum + p.occurrences, 0) / patterns.length || 0,
      avgSuccessRate: patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length || 0,
      avgConfidence: patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length || 0,
    };
  }
}
