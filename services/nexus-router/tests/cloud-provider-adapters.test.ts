import { describe, expect, it } from '@jest/globals';
import {
  buildGeminiRequestBody,
  formatProviderResponse,
  getDefaultGeminiModel,
  getDefaultOpenAIModel,
  resolveRequestModel,
} from '../src/services/cloud-provider-adapters';

describe('cloud-provider-adapters', () => {
  describe('resolveRequestModel', () => {
    it('uses the provider fallback when the request model is omitted', () => {
      expect(resolveRequestModel(undefined, getDefaultOpenAIModel())).toBe('gpt-5.2-codex');
      expect(resolveRequestModel('default', getDefaultOpenAIModel())).toBe('gpt-5.2-codex');
    });

    it('preserves explicit model requests', () => {
      expect(resolveRequestModel('gemini-2.5-pro', getDefaultGeminiModel())).toBe(
        'gemini-2.5-pro'
      );
    });
  });

  describe('buildGeminiRequestBody', () => {
    it('translates OpenAI-style messages into Gemini contents and system instructions', () => {
      const geminiRequest = buildGeminiRequestBody({
        model: 'gemini-2.5-pro',
        temperature: 0.2,
        max_tokens: 512,
        stop: ['DONE'],
        messages: [
          { role: 'system', content: 'Keep answers terse.' },
          { role: 'user', content: 'Summarize this diff.' },
          { role: 'assistant', content: 'Previous summary.' },
        ],
      });

      expect(geminiRequest.systemInstruction).toEqual({
        parts: [{ text: 'Keep answers terse.' }],
      });
      expect(geminiRequest.contents).toEqual([
        { role: 'user', parts: [{ text: 'Summarize this diff.' }] },
        { role: 'model', parts: [{ text: 'Previous summary.' }] },
      ]);
      expect(geminiRequest.generationConfig).toEqual({
        temperature: 0.2,
        maxOutputTokens: 512,
        stopSequences: ['DONE'],
      });
    });
  });

  describe('formatProviderResponse', () => {
    it('normalizes Gemini responses into OpenAI chat completions', () => {
      const formatted = formatProviderResponse(
        {
          responseId: 'gemini-response-1',
          modelVersion: 'gemini-2.5-pro',
          candidates: [
            {
              finishReason: 'STOP',
              content: {
                parts: [{ text: 'Grid ready.' }],
              },
            },
          ],
          usageMetadata: {
            promptTokenCount: 12,
            candidatesTokenCount: 7,
            totalTokenCount: 19,
          },
        },
        'google-gemini'
      );

      expect(formatted.model).toBe('gemini-2.5-pro');
      expect(formatted.choices[0].message.content).toBe('Grid ready.');
      expect(formatted.choices[0].finish_reason).toBe('stop');
      expect(formatted.usage.total_tokens).toBe(19);
    });

    it('normalizes Anthropic responses into OpenAI chat completions', () => {
      const formatted = formatProviderResponse(
        {
          id: 'msg_123',
          model: 'claude-sonnet-4',
          content: [{ text: 'Use the 5090 pool first.' }],
          stop_reason: 'end_turn',
          usage: {
            input_tokens: 10,
            output_tokens: 5,
          },
        },
        'anthropic'
      );

      expect(formatted.choices[0].message.content).toBe('Use the 5090 pool first.');
      expect(formatted.choices[0].finish_reason).toBe('stop');
      expect(formatted.usage.total_tokens).toBe(15);
    });
  });
});
