import type { INerveClient, IntegrationHealth } from "./index";

export interface NerveVoiceSettings {
  voice: string;
  locale: string;
  maxCallSeconds: number;
  requireBrokerApproval: boolean;
}

export class MockNerveClient implements INerveClient {
  readonly settings = new Map<string, NerveVoiceSettings>();

  getDashboardUrl(workerId: string): string {
    return `http://${workerId}.trex-fiordland.ts.net:18789`;
  }

  async updateVoiceSettings(workerId: string, settings: NerveVoiceSettings): Promise<void> {
    this.settings.set(workerId, settings);
  }

  async checkHealth(): Promise<IntegrationHealth> {
    return { status: "HEALTHY", message: "Mock Nerve adapter ready" };
  }
}
