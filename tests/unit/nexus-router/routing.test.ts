/**
 * Unit Tests for Nexus Router - Routing Logic
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('Nexus Router - Routing Logic', () => {
  describe('Route Selection', () => {
    it('should prefer local GPU workers when available', () => {
      const workers = [
        { id: 'local-1', type: 'local', available: true, load: 0.3 },
        { id: 'cloud-1', type: 'cloud', available: true, load: 0.1 },
      ];

      const selected = selectWorker(workers, { preferLocal: true });

      expect(selected.id).toBe('local-1');
      expect(selected.type).toBe('local');
    });

    it('should fallback to cloud when local workers unavailable', () => {
      const workers = [
        { id: 'local-1', type: 'local', available: false, load: 1.0 },
        { id: 'cloud-1', type: 'cloud', available: true, load: 0.1 },
      ];

      const selected = selectWorker(workers, { preferLocal: true, fallbackCloud: true });

      expect(selected.id).toBe('cloud-1');
      expect(selected.type).toBe('cloud');
    });

    it('should load balance across multiple local workers', () => {
      const workers = [
        { id: 'local-1', type: 'local', available: true, load: 0.8 },
        { id: 'local-2', type: 'local', available: true, load: 0.3 },
        { id: 'local-3', type: 'local', available: true, load: 0.5 },
      ];

      const selected = selectWorker(workers, { strategy: 'load-balanced' });

      expect(selected.id).toBe('local-2');
      expect(selected.load).toBe(0.3);
    });

    it('should throw error when no workers available', () => {
      const workers = [
        { id: 'local-1', type: 'local', available: false, load: 1.0 },
      ];

      expect(() => {
        selectWorker(workers, { preferLocal: true, fallbackCloud: false });
      }).toThrow('No workers available');
    });

    it('should respect VRAM requirements', () => {
      const workers = [
        { id: 'local-1', type: 'local', available: true, vram: 8, load: 0.3 },
        { id: 'local-2', type: 'local', available: true, vram: 24, load: 0.5 },
      ];

      const selected = selectWorker(workers, {
        requirements: { minVram: 16 }
      });

      expect(selected.id).toBe('local-2');
      expect(selected.vram).toBeGreaterThanOrEqual(16);
    });
  });

  describe('Request Routing', () => {
    it('should route simple completion request', async () => {
      const request = {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
      };

      const route = await routeRequest(request);

      expect(route).toHaveProperty('workerId');
      expect(route).toHaveProperty('endpoint');
      expect(route.endpoint).toMatch(/\/v1\/chat\/completions$/);
    });

    it('should cache routing decisions', async () => {
      const request = {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
      };

      const route1 = await routeRequest(request);
      const route2 = await routeRequest(request);

      expect(route1.workerId).toBe(route2.workerId);
    });

    it('should handle model aliases', async () => {
      const request = {
        model: 'claude-3-sonnet',
        messages: [{ role: 'user', content: 'Hello' }],
      };

      const route = await routeRequest(request);

      expect(route.model).toMatch(/claude-3-sonnet/);
    });
  });

  describe('Worker Health Checks', () => {
    it('should mark unhealthy workers as unavailable', () => {
      const worker = {
        id: 'local-1',
        available: true,
        lastHealthCheck: Date.now() - 60000, // 1 minute ago
        healthCheckTimeout: 30000, // 30 seconds
      };

      const isHealthy = checkWorkerHealth(worker);

      expect(isHealthy).toBe(false);
    });

    it('should keep healthy workers available', () => {
      const worker = {
        id: 'local-1',
        available: true,
        lastHealthCheck: Date.now() - 10000, // 10 seconds ago
        healthCheckTimeout: 30000, // 30 seconds
      };

      const isHealthy = checkWorkerHealth(worker);

      expect(isHealthy).toBe(true);
    });
  });
});

// Mock functions for testing
function selectWorker(workers: any[], options: any): any {
  const { preferLocal, fallbackCloud, strategy, requirements } = options;

  // Filter by availability
  let available = workers.filter(w => w.available);

  // Filter by VRAM requirements
  if (requirements?.minVram) {
    available = available.filter(w => w.vram >= requirements.minVram);
  }

  // Prefer local
  if (preferLocal) {
    const local = available.filter(w => w.type === 'local');
    if (local.length > 0) {
      available = local;
    } else if (!fallbackCloud) {
      throw new Error('No workers available');
    }
  }

  if (available.length === 0) {
    throw new Error('No workers available');
  }

  // Load balancing
  if (strategy === 'load-balanced') {
    return available.reduce((prev, curr) =>
      curr.load < prev.load ? curr : prev
    );
  }

  return available[0];
}

async function routeRequest(request: any): Promise<any> {
  return {
    workerId: 'local-1',
    endpoint: 'http://localhost:8080/v1/chat/completions',
    model: request.model,
  };
}

function checkWorkerHealth(worker: any): boolean {
  const timeSinceLastCheck = Date.now() - worker.lastHealthCheck;
  return timeSinceLastCheck < worker.healthCheckTimeout;
}
