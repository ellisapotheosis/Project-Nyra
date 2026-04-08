/**
 * Providers Service - LLM provider abstraction
 *
 * Supports Anthropic, OpenAI, and other providers
 */

import type { Logger } from 'pino';
import type { Config } from '../config/index.js';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface CompletionOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  system?: string;
}

export interface CompletionResult {
  content: string;
  model: string;
  provider: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface LLMProvider {
  name: string;
  complete: (messages: Message[], options?: CompletionOptions) => Promise<CompletionResult>;
  isAvailable: () => boolean;
}

export interface ProvidersClient {
  anthropic?: LLMProvider;
  openai?: LLMProvider;
  default: LLMProvider;
  complete: (messages: Message[], options?: CompletionOptions) => Promise<CompletionResult>;
}

function createAnthropicProvider(apiKey: string, logger: Logger): LLMProvider {
  return {
    name: 'anthropic',
    isAvailable: () => !!apiKey,
    async complete(messages, options = {}): Promise<CompletionResult> {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: options.model || 'claude-3-5-sonnet-20241022',
          max_tokens: options.maxTokens || 4096,
          temperature: options.temperature ?? 0.7,
          system: options.system,
          messages: messages.filter(m => m.role !== 'system').map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Anthropic API error: ${response.status} - ${error}`);
      }

      const data = await response.json() as {
        content: Array<{ text: string }>;
        model: string;
        usage: { input_tokens: number; output_tokens: number };
      };

      return {
        content: data.content[0].text,
        model: data.model,
        provider: 'anthropic',
        usage: data.usage,
      };
    },
  };
}

function createOpenAIProvider(apiKey: string, logger: Logger): LLMProvider {
  return {
    name: 'openai',
    isAvailable: () => !!apiKey,
    async complete(messages, options = {}): Promise<CompletionResult> {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: options.model || 'gpt-4o',
          max_tokens: options.maxTokens || 4096,
          temperature: options.temperature ?? 0.7,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${error}`);
      }

      const data = await response.json() as {
        choices: Array<{ message: { content: string } }>;
        model: string;
        usage: { prompt_tokens: number; completion_tokens: number };
      };

      return {
        content: data.choices[0].message.content,
        model: data.model,
        provider: 'openai',
        usage: {
          input_tokens: data.usage.prompt_tokens,
          output_tokens: data.usage.completion_tokens,
        },
      };
    },
  };
}

function createMockProvider(logger: Logger): LLMProvider {
  return {
    name: 'mock',
    isAvailable: () => true,
    async complete(messages): Promise<CompletionResult> {
      logger.warn('Using mock LLM provider - no API keys configured');
      return {
        content: `[Mock response] Received ${messages.length} messages`,
        model: 'mock',
        provider: 'mock',
      };
    },
  };
}

export async function initializeProviders(
  config: Config,
  logger: Logger
): Promise<ProvidersClient> {
  const providers: ProvidersClient = {
    default: createMockProvider(logger),
    async complete(messages, options) {
      return this.default.complete(messages, options);
    },
  };

  if (config.anthropicApiKey) {
    providers.anthropic = createAnthropicProvider(config.anthropicApiKey, logger);
    providers.default = providers.anthropic;
    logger.info('Anthropic provider initialized');
  }

  if (config.openaiApiKey) {
    providers.openai = createOpenAIProvider(config.openaiApiKey, logger);
    if (!providers.anthropic) {
      providers.default = providers.openai;
    }
    logger.info('OpenAI provider initialized');
  }

  return providers;
}
