/**
 * Claude-Flow configuration for strategic orchestration with SPARC integration
 */

import { OrchestrationConfig } from '../types';
import sparcConfig from '../sparc-config';

export const claudeFlowConfig: OrchestrationConfig = {
  enabled: process.env.CLAUDE_FLOW_ENABLED === 'true',
  maxConcurrentTasks: 10,
  taskTimeout: 300000, // 5 minutes
  retryAttempts: 3,
  retryDelay: 2000, // 2 seconds
  sparc: {
    enabled: sparcConfig.enabled,
    memoryKey: sparcConfig.integration.claudeFlow.memoryKey,
    sessionPrefix: sparcConfig.integration.claudeFlow.sessionPrefix,
  },
};

export const claudeConfig = {
  model: 'claude-sonnet-4-5-20250929',
  maxTokens: 4096,
  temperature: 0.7,
  topP: 0.9,
};

export const strategicAgentCapabilities = {
  'lead-qualifier': {
    skills: [
      'intent-recognition',
      'slot-filling',
      'scoring-algorithm',
      'qualification-criteria',
      'context-management',
    ],
    maxConcurrentTasks: 5,
    averageProcessingTime: 3000,
    successRate: 0.95,
    sparcPhases: ['specification', 'refinement'],
  },
  'campaign-manager': {
    skills: [
      'campaign-planning',
      'content-personalization',
      'trigger-management',
      'performance-tracking',
      'optimization',
    ],
    maxConcurrentTasks: 3,
    averageProcessingTime: 5000,
    successRate: 0.92,
    sparcPhases: ['specification', 'architecture', 'refinement'],
  },
};

// SPARC workflow hooks for Claude-Flow
export const sparcHooks = {
  preTask: async (taskId: string, phase: string) => {
    console.log(`[SPARC] Starting ${phase} phase for task ${taskId}`);
    // Execute pre-task hook via Claude-Flow
  },
  postTask: async (taskId: string, phase: string, results: any) => {
    console.log(`[SPARC] Completed ${phase} phase for task ${taskId}`);
    // Store results in memory
  },
  phaseTransition: async (fromPhase: string, toPhase: string) => {
    console.log(`[SPARC] Transitioning from ${fromPhase} to ${toPhase}`);
    // Validate phase completion criteria
  },
};
