import { CompletionRequest, CompletionResponse, Message } from '../types';

export type CloudProvider = 'anthropic' | 'google-gemini' | 'openai' | 'openrouter';

interface GeminiPart {
  text: string;
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

interface GeminiRequestBody {
  systemInstruction?: {
    parts: GeminiPart[];
  };
  contents: GeminiContent[];
  generationConfig?: {
    temperature?: number;
    topP?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
  };
}

const DEFAULT_OPENAI_MODEL = 'gpt-5.2-codex';
const DEFAULT_GEMINI_MODEL = 'gemini-1.5-pro';

export function resolveRequestModel(
  requestedModel: string | undefined,
  fallbackModel: string
): string {
  if (!requestedModel || requestedModel.trim() === '' || requestedModel === 'default') {
    return fallbackModel;
  }

  return requestedModel;
}

export function withResolvedModel(
  requestBody: CompletionRequest,
  fallbackModel: string
): CompletionRequest {
  return {
    ...requestBody,
    model: resolveRequestModel(requestBody.model, fallbackModel),
  };
}

export function buildGeminiRequestBody(requestBody: CompletionRequest): GeminiRequestBody {
  const systemMessages = requestBody.messages
    .filter((message) => message.role === 'system')
    .map((message) => message.content.trim())
    .filter(Boolean);

  const contents = requestBody.messages
    .filter((message) => message.role !== 'system')
    .map((message) => toGeminiContent(message));

  return {
    ...(systemMessages.length > 0
      ? {
          systemInstruction: {
            parts: [{ text: systemMessages.join('\n\n') }],
          },
        }
      : {}),
    contents,
    generationConfig: {
      ...(requestBody.temperature !== undefined
        ? { temperature: requestBody.temperature }
        : {}),
      ...(requestBody.top_p !== undefined ? { topP: requestBody.top_p } : {}),
      ...(requestBody.max_tokens !== undefined
        ? { maxOutputTokens: requestBody.max_tokens }
        : {}),
      ...(requestBody.stop
        ? {
            stopSequences: Array.isArray(requestBody.stop)
              ? requestBody.stop
              : [requestBody.stop],
          }
        : {}),
    },
  };
}

function toGeminiContent(message: Message): GeminiContent {
  return {
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  };
}

export function formatProviderResponse(
  response: any,
  provider: CloudProvider
): CompletionResponse {
  if (response.choices && response.model) {
    return response as CompletionResponse;
  }

  if (provider === 'anthropic' && response.content) {
    return {
      id: response.id || `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: response.model || 'claude-sonnet-4',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: response.content[0]?.text || '',
          },
          finish_reason: response.stop_reason === 'end_turn' ? 'stop' : 'length',
        },
      ],
      usage: {
        prompt_tokens: response.usage?.input_tokens || 0,
        completion_tokens: response.usage?.output_tokens || 0,
        total_tokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
      },
    };
  }

  if (provider === 'google-gemini' && response.candidates) {
    const candidate = response.candidates[0];
    const content = Array.isArray(candidate?.content?.parts)
      ? candidate.content.parts
          .map((part: { text?: string }) => part.text || '')
          .join('')
      : '';

    return {
      id: response.responseId || `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: response.modelVersion || DEFAULT_GEMINI_MODEL,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content,
          },
          finish_reason: mapGeminiFinishReason(candidate?.finishReason),
        },
      ],
      usage: {
        prompt_tokens: response.usageMetadata?.promptTokenCount || 0,
        completion_tokens: response.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: response.usageMetadata?.totalTokenCount || 0,
      },
    };
  }

  return response as CompletionResponse;
}

function mapGeminiFinishReason(reason?: string): string {
  switch (reason) {
    case 'STOP':
      return 'stop';
    case 'MAX_TOKENS':
      return 'length';
    case 'SAFETY':
      return 'content_filter';
    default:
      return 'stop';
  }
}

export function getDefaultOpenAIModel(): string {
  return DEFAULT_OPENAI_MODEL;
}

export function getDefaultGeminiModel(): string {
  return DEFAULT_GEMINI_MODEL;
}
