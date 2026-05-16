import axios from "axios";

/**
 * Distributed Voice Service
 * Routes audio synthesis requests to specific physical worker nodes.
 */
export class DistributedVoiceService {
  private workerEndpoints: Record<string, string> = {
    orchestrator: "http://localhost:8000",
    "5090": "http://worker-rtx5090.trex-fiordland.ts.net:8000",
    "3090": "http://worker-rtx3090ti.trex-fiordland.ts.net:8000",
    "3060": "http://worker-rtx3060.trex-fiordland.ts.net:8000",
  };

  /**
   * Synthesize and play audio on a specific worker's hardware
   */
  async speak(workerId: string, text: string, voice = "ellis"): Promise<void> {
    const endpoint = this.workerEndpoints[workerId];
    if (!endpoint) throw new Error(`Unknown worker: ${workerId}`);

    console.log(`[Voice] Routing speech request to ${workerId}: "${text}"`);

    await axios.post(`${endpoint}/v1/audio/speech`, {
      input: text,
      voice: voice,
      model: "pockettts-v1",
    });

    console.log(`[AUDIT] VOICE_OUTPUT: on ${workerId}`);
  }

  async checkClusterHealth(): Promise<Record<string, string>> {
    const health: Record<string, string> = {};
    for (const [id, url] of Object.entries(this.workerEndpoints)) {
      try {
        await axios.get(`${url}/health`, { timeout: 1000 });
        health[id] = "HEALTHY";
      } catch (e) {
        health[id] = "OFFLINE";
      }
    }
    return health;
  }
}
