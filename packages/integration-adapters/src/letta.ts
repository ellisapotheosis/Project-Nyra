import { ILettaClient, IntegrationHealth } from "./index";

export class MockLettaClient implements ILettaClient {
  async syncContext(leadId: string, context: any): Promise<void> {
    void context;
    console.log(`[MockLetta] Syncing context for lead ${leadId}`);
    // Simulated mem0 write
    console.log(`[mem0] Writing person-centric memory for ${leadId}`);
    console.log(`[AUDIT] LETTA_CONTEXT_SYNC: For ${leadId}`);
  }

  async triggerAgent(agentId: string, task: string): Promise<void> {
    console.log(`[MockLetta] Triggering agent ${agentId} for task: ${task}`);
    console.log(`[AUDIT] LETTA_AGENT_TRIGGERED: ${agentId}`);
  }

  async checkHealth(): Promise<IntegrationHealth> {
    return { status: "HEALTHY" };
  }
}
