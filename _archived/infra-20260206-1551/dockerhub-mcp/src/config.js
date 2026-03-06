/**
 * Configuration loader with Infisical support
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Load configuration from environment and Infisical secrets
 */
export async function loadConfig() {
  const config = {
    mcp: {
      port: parseInt(process.env.MCP_PORT || '8007', 10),
      host: process.env.MCP_HOST || '0.0.0.0',
    },
    dockerhub: {
      username: process.env.DOCKERHUB_USERNAME,
      token: process.env.DOCKERHUB_TOKEN,
      namespace: process.env.DOCKERHUB_NAMESPACE || process.env.DOCKERHUB_USERNAME,
    },
    infisical: {
      projectId: process.env.INFISICAL_PROJECT_ID,
      token: process.env.INFISICAL_TOKEN,
    },
    service: {
      logLevel: process.env.LOG_LEVEL || 'info',
      cacheTTL: parseInt(process.env.CACHE_TTL || '300', 10),
      rateLimit: parseInt(process.env.RATE_LIMIT || '100', 10),
      enableMetrics: process.env.ENABLE_METRICS === 'true',
    },
    nyra: {
      environment: process.env.NYRA_ENVIRONMENT || 'development',
      pcId: process.env.NYRA_PC_ID || 'orchestrator',
    },
  };

  // Try to load secrets from Infisical volume if available
  try {
    const secretsPath = '/app/secrets/dockerhub.json';
    const secrets = JSON.parse(await readFile(secretsPath, 'utf-8'));

    if (secrets.DOCKERHUB_USERNAME) {
      config.dockerhub.username = secrets.DOCKERHUB_USERNAME;
    }
    if (secrets.DOCKERHUB_TOKEN) {
      config.dockerhub.token = secrets.DOCKERHUB_TOKEN;
    }
    if (secrets.DOCKERHUB_NAMESPACE) {
      config.dockerhub.namespace = secrets.DOCKERHUB_NAMESPACE;
    }
  } catch (error) {
    // Secrets file not found, use environment variables
    console.log('Using environment variables for Docker Hub credentials');
  }

  // Validate required configuration
  if (!config.dockerhub.username || !config.dockerhub.token) {
    throw new Error(
      'Docker Hub credentials not configured. Set DOCKERHUB_USERNAME and DOCKERHUB_TOKEN environment variables or configure Infisical secrets.'
    );
  }

  return config;
}
