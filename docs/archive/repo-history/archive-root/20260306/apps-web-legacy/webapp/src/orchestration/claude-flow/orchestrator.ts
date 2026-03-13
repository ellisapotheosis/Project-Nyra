/**
 * Claude-Flow Strategic Orchestrator
 * Handles high-level agent coordination, workflow management, and context
 */

import { EventEmitter } from 'events';
import Anthropic from '@anthropic-ai/sdk';
import {
  Task,
  TaskResult,
  OrchestrationContext,
  AgentType,
  OrchestrationMetrics,
} from '../types';

export class ClaudeFlowOrchestrator extends EventEmitter {
  private claude: Anthropic;
  private agents: Map<string, any> = new Map();
  private sharedMemory: Map<string, any> = new Map();
  private metrics: OrchestrationMetrics = {
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    averageCompletionTime: 0,
    activeAgents: 0,
  };

  constructor() {
    super();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required for Claude-Flow orchestration');
    }

    this.claude = new Anthropic({ apiKey });
  }

  async initialize(): Promise<void> {
    console.log('🧠 Initializing Claude-Flow Strategic Orchestrator...');

    // Execute Claude-Flow hooks
    try {
      const { execSync } = require('child_process');
      execSync('npx claude-flow@alpha hooks pre-task --description "Claude-Flow strategic orchestrator initialization"', {
        stdio: 'inherit',
      });
    } catch (error) {
      console.warn('⚠️  Claude-Flow hooks not available:', error);
    }

    console.log('✅ Claude-Flow orchestrator initialized');
  }

  async executeTask<T = any>(
    task: Task,
    context: OrchestrationContext
  ): Promise<TaskResult<T>> {
    console.log(`🧠 [Claude-Flow] Executing strategic task: ${task.type}`);
    this.metrics.totalTasks++;

    const startTime = Date.now();

    try {
      // Build system prompt for strategic coordination
      const systemPrompt = this.buildStrategicPrompt(task, context);

      // Execute via Claude API with function calling
      const response = await this.claude.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: this.buildTaskMessage(task, context),
          },
        ],
      });

      // Parse response and extract structured result
      const result = this.parseClaudeResponse(response);

      this.metrics.completedTasks++;
      this.updateAverageCompletionTime(Date.now() - startTime);

      return {
        success: true,
        data: result as T,
        metadata: {
          orchestrationLayer: 'strategic',
          model: 'claude-sonnet-4-5',
          processingTime: Date.now() - startTime,
        },
      };

    } catch (error) {
      this.metrics.failedTasks++;
      console.error('❌ [Claude-Flow] Task execution failed:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async executeParallelTasks<T = any>(
    tasks: Task[],
    context: OrchestrationContext
  ): Promise<TaskResult<T>[]> {
    console.log(`🧠 [Claude-Flow] Executing ${tasks.length} strategic tasks in parallel`);

    return Promise.all(
      tasks.map(task => this.executeTask<T>(task, context))
    );
  }

  async spawnAgent(type: AgentType, config?: Record<string, any>): Promise<string> {
    const agentId = `cf-agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.agents.set(agentId, {
      id: agentId,
      type,
      config,
      createdAt: new Date(),
      status: 'active',
    });

    this.metrics.activeAgents = this.agents.size;

    console.log(`🤖 [Claude-Flow] Spawned strategic agent: ${type} (${agentId})`);

    return agentId;
  }

  /**
   * Provide strategic guidance to tactical layer
   */
  async provideGuidance(task: Task, context: OrchestrationContext): Promise<any> {
    const guidance = await this.claude.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Provide strategic guidance for tactical task: ${JSON.stringify(task)}`,
        },
      ],
    });

    return this.parseClaudeResponse(guidance);
  }

  /**
   * Handle result from tactical layer
   */
  handleTacticalResult(taskId: string, result: TaskResult): void {
    // Store result in shared memory for context
    this.updateSharedMemory(`tactical-result:${taskId}`, result);
    this.emit('tactical:result-received', taskId, result);
  }

  updateSharedMemory(key: string, value: any): void {
    this.sharedMemory.set(key, value);
    this.emit('memory:update', key, value);
  }

  getMetrics(): OrchestrationMetrics {
    return { ...this.metrics };
  }

  private buildStrategicPrompt(task: Task, context: OrchestrationContext): string {
    return `You are a strategic AI coordinator for Nyra, an intelligent mortgage assistant.

Your role is HIGH-LEVEL coordination:
- Agent coordination and workflow management
- Context management across conversations
- Pattern learning and optimization
- Strategic decision-making

Current Task: ${task.type}
Priority: ${task.priority}
Context: ${JSON.stringify(context)}

You have access to:
- Lead qualification agents
- Campaign management agents
- Document processing coordination
- Mortgage calculation oversight

Provide strategic coordination and delegate tactical execution as needed.`;
  }

  private buildTaskMessage(task: Task, context: OrchestrationContext): string {
    return `Execute strategic coordination for:

Task Type: ${task.type}
Priority: ${task.priority}
Payload: ${JSON.stringify(task.payload)}
Dependencies: ${task.dependencies.join(', ') || 'none'}

Context:
- Session: ${context.sessionId}
- User: ${context.userId || 'anonymous'}
- Metadata: ${JSON.stringify(context.metadata)}

Please coordinate the execution of this task and provide a structured response with:
1. Execution plan
2. Agents to deploy
3. Expected timeline
4. Success criteria`;
  }

  private parseClaudeResponse(response: any): any {
    // Extract structured data from Claude response
    const content = response.content[0];

    if (content.type === 'text') {
      // Try to parse as JSON, fallback to text
      try {
        return JSON.parse(content.text);
      } catch {
        return { output: content.text };
      }
    }

    return { output: content };
  }

  private updateAverageCompletionTime(completionTime: number): void {
    const totalTime = this.metrics.averageCompletionTime * (this.metrics.completedTasks - 1);
    this.metrics.averageCompletionTime = (totalTime + completionTime) / this.metrics.completedTasks;
  }

  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Claude-Flow orchestrator...');
    this.agents.clear();
    this.sharedMemory.clear();
    this.removeAllListeners();
  }
}
