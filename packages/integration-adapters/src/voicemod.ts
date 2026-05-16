import axios from 'axios';
import { IntegrationHealth } from './index';

export interface VoicemodConfig {
  baseUrl: string;
  apiKey: string;
}

/**
 * Voicemod Integration Adapter
 * Provides click-to-call audio transformation for the broker cockpit.
 */
export class VoicemodIntegrationAdapter {
  constructor(private config: VoicemodConfig) {}

  async setVoice(voiceId: string): Promise<void> {
    console.log(`[Voicemod] Switching to voice: ${voiceId}`);
    // Mock implementation of Voicemod Control API
    await axios.post(`${this.config.baseUrl}/v1/voice/select`, {
      id: voiceId
    }, {
      headers: { 'x-api-key': this.config.apiKey }
    });
  }

  async getAvailableVoices(): Promise<string[]> {
    return ['ellis_standard', 'professional_broker', 'warm_assistant', 'deep_finance'];
  }

  async checkHealth(): Promise<IntegrationHealth> {
    try {
      await axios.get(`${this.config.baseUrl}/health`, { timeout: 1000 });
      return { status: 'HEALTHY', message: 'Voicemod adapter reachable' };
    } catch (e) {
      return { status: 'DOWN', message: (e as Error).message };
    }
  }
}
