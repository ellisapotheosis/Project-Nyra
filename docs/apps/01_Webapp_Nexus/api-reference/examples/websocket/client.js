/**
 * Project Nyra - WebSocket Client Example
 *
 * This example demonstrates how to connect to the WebSocket API
 * and subscribe to real-time events.
 */

const WebSocket = require('ws');

// Configuration
const WS_URL = process.env.NYRA_WS_URL || 'ws://localhost:3001';
const TOKEN = process.env.NYRA_API_TOKEN;

if (!TOKEN) {
  console.error('Error: NYRA_API_TOKEN environment variable is not set');
  console.error('Usage: export NYRA_API_TOKEN="your-jwt-token"');
  process.exit(1);
}

class ProjectNyraWebSocketClient {
  constructor(url, token) {
    this.url = url;
    this.token = token;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.subscriptions = new Set();
  }

  connect() {
    console.log(`🔌 Connecting to ${this.url}...`);

    this.ws = new WebSocket(`${this.url}?token=${this.token}`);

    this.ws.on('open', () => {
      console.log('✅ Connected successfully');
      this.reconnectAttempts = 0;

      // Resubscribe to channels after reconnection
      this.subscriptions.forEach(channel => {
        this.subscribe(channel);
      });
    });

    this.ws.on('message', (data) => {
      this.handleMessage(JSON.parse(data.toString()));
    });

    this.ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error.message);
    });

    this.ws.on('close', (code, reason) => {
      console.log(`🔌 Connection closed: ${code} - ${reason}`);
      this.attemptReconnect();
    });

    // Heartbeat
    this.startHeartbeat();
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
      process.exit(1);
    }
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30000);
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  subscribe(channel) {
    this.subscriptions.add(channel);
    this.send({
      type: 'subscribe',
      payload: { channel }
    });
    console.log(`📡 Subscribed to: ${channel}`);
  }

  unsubscribe(channel) {
    this.subscriptions.delete(channel);
    this.send({
      type: 'unsubscribe',
      payload: { channel }
    });
    console.log(`📡 Unsubscribed from: ${channel}`);
  }

  handleMessage(message) {
    switch (message.type) {
      case 'connection':
        console.log('🎉 Connection acknowledged:', message.payload);
        break;

      case 'event':
        this.handleEvent(message.payload);
        break;

      case 'response':
        console.log('📨 Response:', message.payload);
        break;

      case 'error':
        console.error('❌ Error:', message.payload.message);
        break;

      case 'pong':
        // Heartbeat response
        break;

      default:
        console.log('📩 Unknown message type:', message.type);
    }
  }

  handleEvent(event) {
    console.log('\n📢 Event Received:');
    console.log(`  Type: ${event.type}`);
    console.log(`  Source: ${event.source}`);
    console.log(`  Timestamp: ${event.timestamp}`);

    switch (event.type) {
      case 'mcp_status':
        console.log('  MCP Server Status:');
        console.log(`    Server: ${event.data.name}`);
        console.log(`    Status: ${event.data.status}`);
        console.log(`    Tools: ${event.data.toolCount}`);
        console.log(`    Latency: ${event.data.latency}ms`);
        break;

      case 'gpu_metrics':
        console.log('  GPU Metrics:');
        console.log(`    Worker: ${event.data.workerId}`);
        console.log(`    GPU Utilization: ${event.data.gpuUtilization}%`);
        console.log(`    Memory: ${event.data.memoryUsed}/${event.data.memoryTotal} MB`);
        console.log(`    Temperature: ${event.data.temperature}°C`);
        console.log(`    Active Models: ${event.data.activeModels.join(', ')}`);
        break;

      case 'tool_discovery':
        console.log('  New Tools Discovered:');
        event.data.tools.forEach(tool => {
          console.log(`    - ${tool.name}: ${tool.description}`);
        });
        break;

      case 'agent_coordination':
        console.log('  Agent Coordination:');
        console.log(`    Agent: ${event.data.agentId} (${event.data.agentType})`);
        console.log(`    Action: ${event.data.action}`);
        if (event.data.swarmId) {
          console.log(`    Swarm: ${event.data.swarmId}`);
        }
        break;

      case 'swarm_update':
        console.log('  Swarm Update:');
        console.log(`    Swarm: ${event.data.swarmId}`);
        console.log(`    Topology: ${event.data.topology}`);
        console.log(`    Agents: ${event.data.agents}`);
        console.log(`    Active Tasks: ${event.data.activeTasks}`);
        console.log(`    Status: ${event.data.status}`);
        break;

      default:
        console.log('  Data:', JSON.stringify(event.data, null, 2));
    }
  }

  disconnect() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
    }
  }
}

// Main execution
console.log('🚀 Project Nyra WebSocket Client Example\n');

const client = new ProjectNyraWebSocketClient(WS_URL, TOKEN);
client.connect();

// Subscribe to channels after a short delay
setTimeout(() => {
  console.log('\n📡 Subscribing to channels...\n');

  // Subscribe to MCP status updates
  client.subscribe('mcp:status');

  // Subscribe to GPU metrics
  client.subscribe('gpu:metrics');

  // Subscribe to agent coordination
  client.subscribe('agent:coordination');

  // Subscribe to swarm updates
  client.subscribe('swarm:update');
}, 1000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down gracefully...');
  client.disconnect();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Shutting down gracefully...');
  client.disconnect();
  process.exit(0);
});

// Keep the process running
console.log('\n💡 Press Ctrl+C to exit\n');
