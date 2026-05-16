import { IVoiceClient, IntegrationHealth } from "./index";

export class MockVoiceClient implements IVoiceClient {
  async synthesize(text: string, voice: string): Promise<Buffer> {
    console.log(`[MockVoice] Synthesizing "${text}" with voice ${voice}`);
    return Buffer.from("mock-audio-payload");
  }

  async checkHealth(): Promise<IntegrationHealth> {
    return { status: "HEALTHY" };
  }
}
