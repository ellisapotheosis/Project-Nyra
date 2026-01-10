/**
 * Basic WebSocket Client Example
 *
 * This example demonstrates:
 * - Connecting to WebSocket server
 * - Subscribing to channels
 * - Handling events
 * - Error handling
 */

import { WebSocketClient } from '@project-nyra/websocket-client';

async function main() {
  // Create client with options
  const client = new WebSocketClient('ws://localhost:8080', {
    token: process.env.WS_TOKEN || '',
    reconnect: true,
    maxReconnectAttempts: 5,
    debug: true,
  });

  // Setup event handlers
  client.onConnection((connected) => {
    console.log(`Connection status: ${connected ? 'Connected' : 'Disconnected'}`);
  });

  client.on('connected', (info) => {
    console.log('Connection info:', info);
    console.log('Session ID:', client.getSessionId());
  });

  client.onError((error) => {
    console.error('WebSocket error:', error.message);
  });

  // Connect to server
  try {
    await client.connect();
    console.log('Successfully connected!');
  } catch (error) {
    console.error('Failed to connect:', error);
    process.exit(1);
  }

  // Subscribe to channels
  await client.subscribe('mcp:status');
  await client.subscribe('gpu:metrics');
  await client.subscribe('agent:coordination');
  console.log('Subscribed to channels');

  // Handle MCP status events
  client.onMCPStatus((event) => {
    console.log('\n--- MCP Status Update ---');
    console.log('Timestamp:', event.timestamp);
    console.log('Servers:', event.data.servers.length);

    event.data.servers.forEach((server: any) => {
      console.log(`  - ${server.name}: ${server.status} (${server.toolCount} tools)`);
    });
  });

  // Handle GPU metrics events
  client.onGPUMetrics((event) => {
    console.log('\n--- GPU Metrics Update ---');
    console.log('Timestamp:', event.timestamp);

    event.data.workers.forEach((worker: any) => {
      console.log(`  Worker ${worker.workerId}:`);
      console.log(`    GPU: ${worker.gpuUtilization.toFixed(1)}%`);
      console.log(`    Memory: ${(worker.memoryUsed / 1024).toFixed(1)}GB / ${(worker.memoryTotal / 1024).toFixed(1)}GB`);
      console.log(`    Temp: ${worker.temperature}°C`);
    });
  });

  // Handle agent coordination events
  client.onAgentCoordination((event) => {
    console.log('\n--- Agent Coordination ---');
    console.log('Action:', event.data.action);
    console.log('Agent:', event.data.agentType, event.data.agentId);
  });

  // Handle generic events
  client.onEvent((event) => {
    // All events pass through here
    console.log(`Event: ${event.type} from ${event.source}`);
  });

  // Keep alive with periodic ping
  setInterval(() => {
    if (client.isConnected()) {
      client.ping();
    }
  }, 30000);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    client.disconnect();
    process.exit(0);
  });

  // Query example
  setTimeout(async () => {
    console.log('\nQuerying active sessions...');
    await client.query('sessions:active');
  }, 5000);
}

main().catch(console.error);
