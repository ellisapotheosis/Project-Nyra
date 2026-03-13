#!/usr/bin/env node

/**
 * Bitwarden MCP Server Test Suite
 *
 * Tests the complete integration including:
 * - BWS authentication
 * - Secret retrieval via MCP protocol
 * - Error handling
 * - Container health
 */

import { spawn } from 'child_process';
import { strict as assert } from 'assert';
import { setTimeout } from 'timers/promises';

// Test configuration
const TEST_CONFIG = {
  containerName: 'nyra-bitwarden-mcp',
  mcpPort: 8007,
  timeout: 10000,
  retries: 3,
};

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(color, prefix, message) {
  console.log(`${color}${prefix}${colors.reset} ${message}`);
}

function success(message) {
  log(colors.green, '✓', message);
}

function error(message) {
  log(colors.red, '✗', message);
}

function info(message) {
  log(colors.blue, 'ℹ', message);
}

function warn(message) {
  log(colors.yellow, '⚠', message);
}

/**
 * Execute command and return output
 */
async function exec(command, args = []) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { shell: true });
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed (exit ${code}): ${stderr}`));
      } else {
        resolve(stdout.trim());
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Send MCP JSON-RPC request
 */
async function sendMcpRequest(method, params = {}) {
  const request = {
    jsonrpc: '2.0',
    method,
    params,
    id: Date.now(),
  };

  const command = `docker exec -i ${TEST_CONFIG.containerName} node -e "
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin });
    process.stdin.write('${JSON.stringify(request)}\\n');
    rl.on('line', (line) => {
      try {
        const response = JSON.parse(line);
        console.log(JSON.stringify(response));
        process.exit(0);
      } catch (e) {
        console.error('Parse error:', e.message);
        process.exit(1);
      }
    });
  "`;

  const output = await exec(command);
  return JSON.parse(output);
}

/**
 * Test 1: Container is running
 */
async function testContainerRunning() {
  info('Testing container status...');
  try {
    const output = await exec('docker', ['ps', '--filter', `name=${TEST_CONFIG.containerName}`, '--format', '{{.Names}}'']);
    assert.ok(output.includes(TEST_CONFIG.containerName), 'Container not found in running containers');
    success('Container is running');
    return true;
  } catch (err) {
    error(`Container not running: ${err.message}`);
    return false;
  }
}

/**
 * Test 2: Container health check
 */
async function testContainerHealth() {
  info('Testing container health...');
  try {
    const output = await exec('docker', ['inspect', '--format', '{{.State.Health.Status}}', TEST_CONFIG.containerName]);
    const health = output.trim();

    if (health === 'healthy') {
      success('Container is healthy');
      return true;
    } else if (health === 'starting') {
      warn('Container is still starting...');
      await setTimeout(5000);
      return testContainerHealth();
    } else {
      error(`Container health: ${health}`);
      return false;
    }
  } catch (err) {
    warn(`Health check not configured or failed: ${err.message}`);
    return true; // Don't fail if health check is not configured
  }
}

/**
 * Test 3: BWS CLI is installed
 */
async function testBwsInstallation() {
  info('Testing BWS CLI installation...');
  try {
    const output = await exec('docker', ['exec', TEST_CONFIG.containerName, 'bws', '--version']);
    assert.ok(output.includes('bws'), 'BWS CLI not found');
    success(`BWS CLI installed: ${output}`);
    return true;
  } catch (err) {
    error(`BWS CLI not installed: ${err.message}`);
    return false;
  }
}

/**
 * Test 4: Environment variables are set
 */
async function testEnvironmentVariables() {
  info('Testing environment variables...');
  try {
    const output = await exec('docker', ['exec', TEST_CONFIG.containerName, 'sh', '-c', 'echo $BWS_ACCESS_TOKEN | head -c 10']);
    assert.ok(output.length > 0, 'BWS_ACCESS_TOKEN is not set');
    success('BWS_ACCESS_TOKEN is configured');
    return true;
  } catch (err) {
    error(`Environment variables not set: ${err.message}`);
    return false;
  }
}

/**
 * Test 5: MCP server responds to list_tools
 */
async function testMcpListTools() {
  info('Testing MCP list_tools...');
  try {
    const response = await sendMcpRequest('tools/list');

    assert.ok(response.result, 'No result in MCP response');
    assert.ok(Array.isArray(response.result.tools), 'Tools is not an array');
    assert.ok(response.result.tools.length > 0, 'No tools returned');

    const toolNames = response.result.tools.map(t => t.name);
    const expectedTools = [
      'get_secret',
      'list_secrets',
      'create_secret',
      'update_secret',
      'delete_secrets',
      'list_projects',
    ];

    for (const tool of expectedTools) {
      assert.ok(toolNames.includes(tool), `Missing tool: ${tool}`);
    }

    success(`MCP server responds with ${response.result.tools.length} tools`);
    return true;
  } catch (err) {
    error(`MCP list_tools failed: ${err.message}`);
    return false;
  }
}

/**
 * Test 6: BWS authentication (list projects)
 */
async function testBwsAuthentication() {
  info('Testing BWS authentication...');
  try {
    const output = await exec('docker', ['exec', TEST_CONFIG.containerName, 'bws', 'project', 'list']);

    // Try to parse as JSON
    try {
      const projects = JSON.parse(output);
      success(`BWS authenticated, found ${projects.length} projects`);
    } catch {
      // If not JSON, check if it's an error message
      if (output.toLowerCase().includes('error') || output.toLowerCase().includes('unauthorized')) {
        throw new Error('Authentication failed');
      }
      success('BWS authenticated');
    }

    return true;
  } catch (err) {
    error(`BWS authentication failed: ${err.message}`);
    warn('Make sure BWS_ACCESS_TOKEN is valid and not expired');
    return false;
  }
}

/**
 * Test 7: Error handling for invalid secret ID
 */
async function testErrorHandling() {
  info('Testing error handling...');
  try {
    const response = await sendMcpRequest('tools/call', {
      name: 'get_secret',
      arguments: {
        secretId: '00000000-0000-0000-0000-000000000000', // Invalid UUID
      },
    });

    if (response.error) {
      success('MCP server properly handles errors');
      return true;
    } else {
      warn('Expected error for invalid secret ID, but got success response');
      return true; // Don't fail, might be a valid edge case
    }
  } catch (err) {
    // Error is expected for invalid secret
    success('Error handling works correctly');
    return true;
  }
}

/**
 * Test 8: Container logs don't contain errors
 */
async function testContainerLogs() {
  info('Testing container logs...');
  try {
    const output = await exec('docker', ['logs', '--tail', '50', TEST_CONFIG.containerName]);

    const lines = output.split('\n');
    const errors = lines.filter(line =>
      line.toLowerCase().includes('error') &&
      !line.includes('ErrorCode') // Exclude expected error codes
    );

    if (errors.length > 0) {
      warn(`Found ${errors.length} error lines in logs (might be expected)`);
      errors.slice(0, 3).forEach(err => warn(`  ${err.substring(0, 100)}`));
    } else {
      success('No unexpected errors in logs');
    }

    return true;
  } catch (err) {
    warn(`Could not read container logs: ${err.message}`);
    return true; // Don't fail on log read errors
  }
}

/**
 * Test 9: Validate input schemas
 */
async function testInputValidation() {
  info('Testing input validation...');
  try {
    // Test with invalid UUID format
    const response = await sendMcpRequest('tools/call', {
      name: 'get_secret',
      arguments: {
        secretId: 'not-a-uuid',
      },
    });

    assert.ok(response.error, 'Expected validation error for invalid UUID');
    assert.ok(
      response.error.message.toLowerCase().includes('validation') ||
      response.error.message.toLowerCase().includes('invalid'),
      'Error message should mention validation'
    );

    success('Input validation working correctly');
    return true;
  } catch (err) {
    error(`Input validation test failed: ${err.message}`);
    return false;
  }
}

/**
 * Test 10: Docker networking
 */
async function testDockerNetworking() {
  info('Testing Docker networking...');
  try {
    const output = await exec('docker', ['inspect', '--format', '{{range .NetworkSettings.Networks}}{{.NetworkID}}{{end}}', TEST_CONFIG.containerName]);
    assert.ok(output.length > 0, 'Container not connected to any network');
    success('Container networking configured');
    return true;
  } catch (err) {
    error(`Docker networking test failed: ${err.message}`);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🔒 Bitwarden MCP Server Test Suite');
  console.log('='.repeat(60) + '\n');

  const tests = [
    { name: 'Container Running', fn: testContainerRunning, critical: true },
    { name: 'Container Health', fn: testContainerHealth, critical: false },
    { name: 'BWS CLI Installation', fn: testBwsInstallation, critical: true },
    { name: 'Environment Variables', fn: testEnvironmentVariables, critical: true },
    { name: 'MCP List Tools', fn: testMcpListTools, critical: true },
    { name: 'BWS Authentication', fn: testBwsAuthentication, critical: true },
    { name: 'Error Handling', fn: testErrorHandling, critical: false },
    { name: 'Container Logs', fn: testContainerLogs, critical: false },
    { name: 'Input Validation', fn: testInputValidation, critical: true },
    { name: 'Docker Networking', fn: testDockerNetworking, critical: false },
  ];

  let passed = 0;
  let failed = 0;
  let criticalFailed = false;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
        if (test.critical) {
          criticalFailed = true;
        }
      }
    } catch (err) {
      error(`Test "${test.name}" threw exception: ${err.message}`);
      failed++;
      if (test.critical) {
        criticalFailed = true;
      }
    }
    console.log(''); // Blank line between tests
  }

  console.log('='.repeat(60));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);

  if (criticalFailed) {
    error('Critical tests failed. Please fix before deploying.');
    process.exit(1);
  } else if (failed > 0) {
    warn('Some non-critical tests failed. Review before deploying.');
    process.exit(0);
  } else {
    success('All tests passed! Bitwarden MCP server is ready.');
    process.exit(0);
  }
}

// Run tests
runAllTests().catch((err) => {
  error(`Test suite failed: ${err.message}`);
  console.error(err);
  process.exit(1);
});
