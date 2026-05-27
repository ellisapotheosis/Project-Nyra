import type { ServiceHealthSnapshot } from "./integrationHealth";

export interface HeartbeatNode {
  id: string;
  status: string;
  latency: string;
  load: string;
}

export interface HeartbeatStatus {
  status: string;
  timestamp: string;
  nodes: HeartbeatNode[];
  services: Record<string, string>;
}

export const healthApi = {
  async getHeartbeat(): Promise<HeartbeatStatus> {
    const response = await fetch("/api/health/heartbeat", {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Heartbeat request failed: ${response.status}`);
    }

    return response.json() as Promise<HeartbeatStatus>;
  },

  async getServiceHealth(): Promise<ServiceHealthSnapshot> {
    const response = await fetch("/api/health/services", { cache: "no-store" });
    const body = (await response.json()) as ServiceHealthSnapshot;

    if (!response.ok && body.missingProductionConfig.length === 0) {
      throw new Error(`Health API returned ${response.status}.`);
    }

    return body;
  },
};
