import { describe, expect, it } from '@jest/globals';
import {
  isLocalClusterAlias,
  isRemoteGeminiAlias,
  isRemoteOpenAIAlias,
  normalizeRoutingModel,
  resolveProviderModelAlias,
} from '../src/services/worker-manager';

describe('worker-manager NYRA routing aliases', () => {
  it('normalizes model aliases before routing decisions', () => {
    expect(normalizeRoutingModel('  NYRA/LOCAL-CLUSTER  ')).toBe('nyra/local-cluster');
  });

  it('recognizes the NYRA local cluster aliases', () => {
    expect(isLocalClusterAlias('local-cluster')).toBe(true);
    expect(isLocalClusterAlias('nyra/local-cluster')).toBe(true);
    expect(isLocalClusterAlias('gpt-5.2-codex')).toBe(false);
  });

  it('recognizes the named remote expert aliases', () => {
    expect(isRemoteOpenAIAlias('remote/openai-codex')).toBe(true);
    expect(isRemoteGeminiAlias('remote/gemini-2.5-pro')).toBe(true);
    expect(isRemoteGeminiAlias('remote/gemini-1.5-pro')).toBe(true);
    expect(isRemoteGeminiAlias('gemini-2.5-pro')).toBe(false);
  });

  it('maps NYRA remote expert aliases back to provider defaults before API calls', () => {
    expect(
      resolveProviderModelAlias('remote/openai-codex', 'openai', 'gpt-5.2-codex')
    ).toBe('gpt-5.2-codex');
    expect(
      resolveProviderModelAlias(
        'remote/gemini-2.5-pro',
        'google-gemini',
        'gemini-2.5-pro'
      )
    ).toBe('gemini-2.5-pro');
  });
});
