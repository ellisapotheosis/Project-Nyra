const API_BASE = process.env.NEXT_PUBLIC_NEXUS_URL || 'http://localhost:8000';

export class NexusAPI {
  private static async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  static async getServers() {
    return this.fetch('/api/servers');
  }

  static async getTools() {
    return this.fetch('/api/tools');
  }

  static async getGPUWorkers() {
    return this.fetch('/api/gpu/workers');
  }

  static async getModelRoutes() {
    return this.fetch('/api/routes');
  }

  static async getMetrics() {
    return this.fetch('/api/metrics');
  }

  static async updateModelRoute(id: string, updates: any) {
    return this.fetch(`/api/routes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  static async testServer(serverId: string) {
    return this.fetch(`/api/servers/${serverId}/test`, {
      method: 'POST',
    });
  }

  static connectWebSocket(onMessage: (data: any) => void): WebSocket {
    const ws = new WebSocket(`ws://localhost:8000/ws`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    return ws;
  }
}
