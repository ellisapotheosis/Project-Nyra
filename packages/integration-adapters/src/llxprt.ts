import { ILLXPRTBridgeClient, IntegrationHealth } from "./index";

export class MockLLXPRTBridgeClient implements ILLXPRTBridgeClient {
  async complete(model: string, messages: any[]): Promise<string> {
    void messages;
    console.log(`[MockLLXPRT] Completing request with model ${model}`);
    return `[Mock response from ${model}] This is a subscription-bridge response.`;
  }

  async checkHealth(): Promise<IntegrationHealth> {
    return { status: "HEALTHY" };
  }
}
