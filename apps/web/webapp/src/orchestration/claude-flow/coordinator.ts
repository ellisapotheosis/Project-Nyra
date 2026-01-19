import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../../lib/utils/logger';

export interface StrategicPlan {
  objective: string;
  approach: string;
  keySteps: string[];
  expectedOutcome: string;
  riskAssessment: string[];
  timeline: string;
}

export interface CoordinatorConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export class ClaudeFlowCoordinator {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(config: CoordinatorConfig) {
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.model = config.model || 'claude-sonnet-4-5-20250929';
    this.maxTokens = config.maxTokens || 4096;
    this.temperature = config.temperature || 0.7;
  }

  /**
   * Generate a strategic plan for a high-level objective
   */
  async generateStrategicPlan(objective: string, context?: Record<string, any>): Promise<StrategicPlan> {
    try {
      logger.info('Claude Flow: Generating strategic plan', { objective });

      const systemPrompt = `You are a strategic planning AI that excels at breaking down complex objectives into actionable plans.
Your role is to analyze high-level objectives and create comprehensive strategic plans with:
1. Clear approach and methodology
2. Key steps and milestones
3. Expected outcomes and success metrics
4. Risk assessment and mitigation strategies
5. Realistic timeline estimation

Focus on strategic thinking, not tactical execution details.`;

      const userPrompt = `Objective: ${objective}

${context ? `Context:\n${JSON.stringify(context, null, 2)}` : ''}

Create a comprehensive strategic plan in JSON format with the following structure:
{
  "objective": "restated objective",
  "approach": "overall strategic approach",
  "keySteps": ["step 1", "step 2", ...],
  "expectedOutcome": "what success looks like",
  "riskAssessment": ["risk 1", "risk 2", ...],
  "timeline": "estimated timeline"
}`;

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Extract JSON from response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from Claude response');
      }

      const plan: StrategicPlan = JSON.parse(jsonMatch[0]);
      logger.info('Claude Flow: Strategic plan generated successfully', { plan });

      return plan;
    } catch (error) {
      logger.error('Claude Flow: Error generating strategic plan', { error });
      throw error;
    }
  }

  /**
   * Analyze a situation and provide strategic recommendations
   */
  async analyzeAndRecommend(
    situation: string,
    constraints?: Record<string, any>
  ): Promise<{
    analysis: string;
    recommendations: string[];
    priorities: string[];
  }> {
    try {
      logger.info('Claude Flow: Analyzing situation', { situation });

      const systemPrompt = `You are a strategic analyst AI that provides high-level analysis and recommendations.
Focus on:
1. Understanding the broader context and implications
2. Identifying key opportunities and challenges
3. Providing actionable strategic recommendations
4. Prioritizing actions based on impact and feasibility`;

      const userPrompt = `Situation: ${situation}

${constraints ? `Constraints:\n${JSON.stringify(constraints, null, 2)}` : ''}

Provide your analysis and recommendations in JSON format:
{
  "analysis": "detailed analysis of the situation",
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "priorities": ["priority 1", "priority 2", ...]
}`;

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from Claude response');
      }

      const result = JSON.parse(jsonMatch[0]);
      logger.info('Claude Flow: Analysis complete', { result });

      return result;
    } catch (error) {
      logger.error('Claude Flow: Error analyzing situation', { error });
      throw error;
    }
  }

  /**
   * Review and refine a plan based on feedback or new information
   */
  async refinePlan(
    currentPlan: StrategicPlan,
    feedback: string,
    newContext?: Record<string, any>
  ): Promise<StrategicPlan> {
    try {
      logger.info('Claude Flow: Refining plan', { feedback });

      const systemPrompt = `You are a strategic planning AI that excels at iterative refinement.
Your role is to take existing plans and improve them based on new feedback or context.
Maintain strategic focus while adapting to new information.`;

      const userPrompt = `Current Plan:
${JSON.stringify(currentPlan, null, 2)}

Feedback: ${feedback}

${newContext ? `New Context:\n${JSON.stringify(newContext, null, 2)}` : ''}

Refine the strategic plan based on this feedback and new context.
Return the updated plan in the same JSON format.`;

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from Claude response');
      }

      const refinedPlan: StrategicPlan = JSON.parse(jsonMatch[0]);
      logger.info('Claude Flow: Plan refined successfully', { refinedPlan });

      return refinedPlan;
    } catch (error) {
      logger.error('Claude Flow: Error refining plan', { error });
      throw error;
    }
  }
}
