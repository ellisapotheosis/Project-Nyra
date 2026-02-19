#!/usr/bin/env node

/**
 * Docker Hub MCP Health Check
 * Verifies server configuration and Docker Hub API connectivity
 */

import axios from 'axios';
import { config } from 'dotenv';

config();

const DOCKERHUB_API = 'https://hub.docker.com/v2';

async function healthCheck() {
  console.log('Docker Hub MCP Health Check');
  console.log('============================\n');

  const checks = {
    environment: false,
    dockerHubAPI: false,
    authentication: false,
  };

  // Check environment variables
  console.log('1. Environment Configuration:');
  const requiredEnvVars = [
    'DOCKERHUB_NAMESPACE',
    'LOG_LEVEL',
    'CACHE_TTL',
    'RATE_LIMIT',
  ];

  const optionalEnvVars = [
    'DOCKERHUB_USERNAME',
    'DOCKERHUB_PASSWORD',
    'DOCKERHUB_TOKEN',
  ];

  requiredEnvVars.forEach((envVar) => {
    const value = process.env[envVar];
    console.log(`   ${envVar}: ${value ? '✓' : '✗'} ${value || 'Not set'}`);
  });

  console.log('\n   Optional (for authenticated access):');
  optionalEnvVars.forEach((envVar) => {
    const value = process.env[envVar];
    console.log(
      `   ${envVar}: ${value ? '✓ Set' : '✗ Not set (anonymous access)'}`
    );
  });

  checks.environment = requiredEnvVars.every(
    (envVar) => process.env[envVar]
  );

  // Check Docker Hub API connectivity
  console.log('\n2. Docker Hub API Connectivity:');
  try {
    const response = await axios.get(`${DOCKERHUB_API}/repositories/library/nginx/`, {
      timeout: 5000,
    });

    if (response.status === 200) {
      console.log('   ✓ Docker Hub API is reachable');
      console.log(`   ✓ Response time: ${response.headers['x-response-time'] || 'N/A'}`);
      checks.dockerHubAPI = true;
    }
  } catch (error) {
    console.log(`   ✗ Docker Hub API connectivity failed: ${error.message}`);
  }

  // Check authentication if credentials are provided
  console.log('\n3. Authentication Status:');
  if (process.env.DOCKERHUB_TOKEN) {
    try {
      const response = await axios.get(`${DOCKERHUB_API}/user/`, {
        headers: {
          Authorization: `Bearer ${process.env.DOCKERHUB_TOKEN}`,
        },
        timeout: 5000,
      });

      if (response.status === 200) {
        console.log('   ✓ Token authentication successful');
        console.log(`   ✓ User: ${response.data.username}`);
        checks.authentication = true;
      }
    } catch (error) {
      console.log(`   ✗ Token authentication failed: ${error.message}`);
    }
  } else if (process.env.DOCKERHUB_USERNAME && process.env.DOCKERHUB_PASSWORD) {
    try {
      const response = await axios.post(`${DOCKERHUB_API}/users/login`, {
        username: process.env.DOCKERHUB_USERNAME,
        password: process.env.DOCKERHUB_PASSWORD,
      });

      if (response.status === 200) {
        console.log('   ✓ Username/password authentication successful');
        console.log(`   ✓ Token received`);
        checks.authentication = true;
      }
    } catch (error) {
      console.log(`   ✗ Username/password authentication failed: ${error.message}`);
    }
  } else {
    console.log('   ℹ No credentials provided - using anonymous access');
    console.log('   ℹ Rate limits: 100 pulls per 6 hours (anonymous)');
    checks.authentication = true; // Anonymous is valid
  }

  // Summary
  console.log('\n============================');
  console.log('Health Check Summary:');
  console.log(`   Environment: ${checks.environment ? '✓ OK' : '✗ FAIL'}`);
  console.log(`   Docker Hub API: ${checks.dockerHubAPI ? '✓ OK' : '✗ FAIL'}`);
  console.log(`   Authentication: ${checks.authentication ? '✓ OK' : '✗ FAIL'}`);

  const allChecks = Object.values(checks).every((check) => check);
  console.log(`\nOverall Status: ${allChecks ? '✓ HEALTHY' : '✗ UNHEALTHY'}`);

  process.exit(allChecks ? 0 : 1);
}

healthCheck().catch((error) => {
  console.error('Health check failed:', error.message);
  process.exit(1);
});
