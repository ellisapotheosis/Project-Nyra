/**
 * Docker Hub API Client
 *
 * Implements Docker Hub API v2 operations with:
 * - Authentication and token management
 * - Repository operations
 * - Image and tag management
 * - Webhook configuration
 * - Build automation
 * - Rate limiting and caching
 */

import axios from 'axios';

const DOCKERHUB_API_URL = 'https://hub.docker.com/v2';
const DOCKERHUB_REGISTRY_URL = 'https://registry.hub.docker.com/v2';

export class DockerHubAPI {
  constructor(options = {}) {
    this.username = options.username;
    this.token = options.token;
    this.namespace = options.namespace || this.username;
    this.logger = options.logger;
    this.authToken = null;
    this.tokenExpiry = null;

    // Metrics tracking
    this.metrics = {
      requests: 0,
      errors: 0,
      cacheHits: 0,
      cacheMisses: 0,
      lastRequest: null,
    };

    // Simple cache
    this.cache = new Map();
    this.cacheTTL = (options.cacheTTL || 300) * 1000; // 5 minutes default

    // Rate limiting
    this.rateLimit = {
      max: options.rateLimit || 100,
      window: 60000, // 1 minute
      requests: [],
    };

    // Initialize axios instance
    this.client = axios.create({
      baseURL: DOCKERHUB_API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        this.metrics.errors++;
        this.logger?.error({ error: error.message }, 'API request failed');
        throw error;
      }
    );
  }

  /**
   * Check if authenticated
   */
  isAuthenticated() {
    return !!this.token;
  }

  /**
   * Get authentication headers
   */
  async getAuthHeaders() {
    if (!this.authToken || Date.now() >= this.tokenExpiry) {
      await this.authenticate();
    }

    return {
      Authorization: `Bearer ${this.authToken}`,
    };
  }

  /**
   * Authenticate with Docker Hub
   */
  async authenticate() {
    try {
      const response = await this.client.post('/users/login', {
        username: this.username,
        password: this.token,
      });

      this.authToken = response.data.token;
      // Token expires in 5 minutes
      this.tokenExpiry = Date.now() + 4 * 60 * 1000;

      this.logger?.info('Successfully authenticated with Docker Hub');
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Authentication failed');
      throw new Error(`Docker Hub authentication failed: ${error.message}`);
    }
  }

  /**
   * Check rate limit
   */
  async checkRateLimit() {
    const now = Date.now();
    this.rateLimit.requests = this.rateLimit.requests.filter(
      (time) => now - time < this.rateLimit.window
    );

    if (this.rateLimit.requests.length >= this.rateLimit.max) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    this.rateLimit.requests.push(now);
  }

  /**
   * Get from cache or fetch
   */
  async cachedRequest(key, fetchFn) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      this.metrics.cacheHits++;
      return cached.data;
    }

    this.metrics.cacheMisses++;
    const data = await fetchFn();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  /**
   * List repositories
   */
  async listRepositories(page = 1, pageSize = 25) {
    await this.checkRateLimit();
    this.metrics.requests++;
    this.metrics.lastRequest = new Date().toISOString();

    const headers = await this.getAuthHeaders();
    const response = await this.client.get(
      `/repositories/${this.namespace}`,
      {
        headers,
        params: { page, page_size: pageSize },
      }
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  /**
   * Get repository details
   */
  async getRepository(repository) {
    await this.checkRateLimit();
    this.metrics.requests++;
    this.metrics.lastRequest = new Date().toISOString();

    const cacheKey = `repo:${this.namespace}/${repository}`;
    const data = await this.cachedRequest(cacheKey, async () => {
      const headers = await this.getAuthHeaders();
      const response = await this.client.get(
        `/repositories/${this.namespace}/${repository}`,
        { headers }
      );
      return response.data;
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  /**
   * List tags for a repository
   */
  async listTags(repository, page = 1, pageSize = 25) {
    await this.checkRateLimit();
    this.metrics.requests++;
    this.metrics.lastRequest = new Date().toISOString();

    const headers = await this.getAuthHeaders();
    const response = await this.client.get(
      `/repositories/${this.namespace}/${repository}/tags`,
      {
        headers,
        params: { page, page_size: pageSize },
      }
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  /**
   * Get tag details
   */
  async getTag(repository, tag) {
    await this.checkRateLimit();
    this.metrics.requests++;
    this.metrics.lastRequest = new Date().toISOString();

    const cacheKey = `tag:${this.namespace}/${repository}:${tag}`;
    const data = await this.cachedRequest(cacheKey, async () => {
      const headers = await this.getAuthHeaders();
      const response = await this.client.get(
        `/repositories/${this.namespace}/${repository}/tags/${tag}`,
        { headers }
      );
      return response.data;
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  /**
   * Delete a tag
   */
  async deleteTag(repository, tag) {
    await this.checkRateLimit();
    this.metrics.requests++;
    this.metrics.lastRequest = new Date().toISOString();

    const headers = await this.getAuthHeaders();
    await this.client.delete(
      `/repositories/${this.namespace}/${repository}/tags/${tag}`,
      { headers }
    );

    // Clear cache
    this.cache.delete(`tag:${this.namespace}/${repository}:${tag}`);

    return {
      content: [
        {
          type: 'text',
          text: `Successfully deleted tag ${tag} from ${this.namespace}/${repository}`,
        },
      ],
    };
  }

  /**
   * Update repository metadata
   */
  async updateRepository(repository, updates) {
    await this.checkRateLimit();
    this.metrics.requests++;
    this.metrics.lastRequest = new Date().toISOString();

    const headers = await this.getAuthHeaders();
    const response = await this.client.patch(
      `/repositories/${this.namespace}/${repository}`,
      updates,
      { headers }
    );

    // Clear cache
    this.cache.delete(`repo:${this.namespace}/${repository}`);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  /**
   * Create a new repository
   */
  async createRepository(repository, options = {}) {
    await this.checkRateLimit();
    this.metrics.requests++;
    this.metrics.lastRequest = new Date().toISOString();

    const headers = await this.getAuthHeaders();
    const response = await this.client.post(
      '/repositories/',
      {
        namespace: this.namespace,
        name: repository,
        description: options.description || '',
        is_private: options.is_private || false,
      },
      { headers }
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  /**
   * List webhooks for a repository
   */
  async listWebhooks(repository) {
    await this.checkRateLimit();
    this.metrics.requests++;
    this.metrics.lastRequest = new Date().toISOString();

    const headers = await this.getAuthHeaders();
    const response = await this.client.get(
      `/repositories/${this.namespace}/${repository}/webhooks`,
      { headers }
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  /**
   * Create a webhook
   */
  async createWebhook(repository, options) {
    await this.checkRateLimit();
    this.metrics.requests++;
    this.metrics.lastRequest = new Date().toISOString();

    const headers = await this.getAuthHeaders();
    const response = await this.client.post(
      `/repositories/${this.namespace}/${repository}/webhooks`,
      {
        name: options.name,
        webhooks: [
          {
            webhook_url: options.webhook_url,
          },
        ],
      },
      { headers }
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  /**
   * Get build history
   */
  async getBuildHistory(repository) {
    await this.checkRateLimit();
    this.metrics.requests++;
    this.metrics.lastRequest = new Date().toISOString();

    const headers = await this.getAuthHeaders();
    const response = await this.client.get(
      `/repositories/${this.namespace}/${repository}/buildhistory`,
      { headers }
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      rateLimitRemaining: this.rateLimit.max - this.rateLimit.requests.length,
    };
  }
}
