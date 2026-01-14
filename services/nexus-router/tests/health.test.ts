import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import axios from 'axios';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:8000';

describe('Nexus Router Health Endpoints', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await axios.get(`${BASE_URL}/health`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('service', 'nexus-router');
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('timestamp');
      expect(response.data).toHaveProperty('components');
    });

    it('should include Redis component status', async () => {
      const response = await axios.get(`${BASE_URL}/health`);

      expect(response.data.components).toHaveProperty('redis');
      expect(response.data.components.redis).toHaveProperty('status');
      expect(response.data.components.redis).toHaveProperty('connected');
    });

    it('should include worker status', async () => {
      const response = await axios.get(`${BASE_URL}/health`);

      expect(response.data.components).toHaveProperty('workers');
      expect(response.data.components.workers).toHaveProperty('healthy');
      expect(response.data.components.workers).toHaveProperty('total');
      expect(response.data.components.workers).toHaveProperty('details');
      expect(Array.isArray(response.data.components.workers.details)).toBe(true);
    });

    it('should include metrics', async () => {
      const response = await axios.get(`${BASE_URL}/health`);

      expect(response.data).toHaveProperty('metrics');
      expect(response.data.metrics).toHaveProperty('totalRequests');
      expect(response.data.metrics).toHaveProperty('localRequests');
      expect(response.data.metrics).toHaveProperty('cloudRequests');
      expect(response.data.metrics).toHaveProperty('localPercentage');
    });
  });

  describe('GET /health/ready', () => {
    it('should return readiness status', async () => {
      const response = await axios.get(`${BASE_URL}/health/ready`);

      expect([200, 503]).toContain(response.status);
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('timestamp');
    });
  });

  describe('GET /health/live', () => {
    it('should return liveness status', async () => {
      const response = await axios.get(`${BASE_URL}/health/live`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'alive');
      expect(response.data).toHaveProperty('timestamp');
    });
  });
});
