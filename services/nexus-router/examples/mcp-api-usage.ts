/**
 * MCP Server Aggregation API Usage Examples
 *
 * This file demonstrates how to interact with the Nexus Router MCP API
 * across all three supported protocols: STDIO, SSE, and HTTP.
 */

import axios from 'axios';

const NEXUS_ROUTER_URL = process.env.NEXUS_ROUTER_URL || 'http://localhost:3000';
const API_BASE = `${NEXUS_ROUTER_URL}/api/mcp`;

// Type definitions
interface MCPServer {
  id: string;
  name: string;
  protocol: 'stdio' | 'sse' | 'http';
  config: {
    command?: string;
    args?: string[];
    workingDir?: string;
    env?: Record<string, string>;
    url?: string;
    baseURL?: string;
  };
  auth?: {
    type: 'bearer' | 'basic' | 'none';
    token?: string;
    username?: string;
    password?: string;
    headers?: Record<string, string>;
  };
  enabled: boolean;
  priority: number;
}

// Example 1: List all MCP servers
async function listMCPServers() {
  console.log('\n=== Listing All MCP Servers ===');

  try {
    const response = await axios.get(`${API_BASE}/servers`);
    console.log('Total servers:', response.data.total);
    console.log('Enabled servers:', response.data.enabled);

    response.data.servers.forEach((server: any) => {
      console.log(`\n- ${server.name} (${server.id})`);
      console.log(`  Protocol: ${server.protocol}`);
      console.log(`  Status: ${server.status}`);
      console.log(`  Tools: ${server.toolCount}`);
      console.log(`  Priority: ${server.priority}`);
    });
  } catch (error) {
    console.error('Error listing servers:', error);
  }
}

// Example 2: Add an HTTP MCP server
async function addHttpMCPServer() {
  console.log('\n=== Adding HTTP MCP Server ===');

  const newServer: MCPServer = {
    id: 'weather-mcp',
    name: 'Weather MCP Server',
    protocol: 'http',
    config: {
      url: 'http://localhost:8080/mcp',
    },
    auth: {
      type: 'bearer',
      token: 'your-api-token-here',
    },
    enabled: true,
    priority: 5,
  };

  try {
    const response = await axios.post(`${API_BASE}/servers`, newServer);
    console.log('Success:', response.data.message);
    console.log('Server status:', response.data.server.status);
  } catch (error: any) {
    if (error.response?.status === 409) {
      console.log('Server already exists');
    } else {
      console.error('Error adding server:', error.response?.data || error.message);
    }
  }
}

// Example 3: Add a STDIO MCP server
async function addStdioMCPServer() {
  console.log('\n=== Adding STDIO MCP Server ===');

  const stdioServer: MCPServer = {
    id: 'memory-mcp',
    name: 'Memory MCP (STDIO)',
    protocol: 'stdio',
    config: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-memory'],
      workingDir: process.cwd(),
      env: {
        NODE_ENV: 'production',
      },
    },
    enabled: true,
    priority: 3,
  };

  try {
    const response = await axios.post(`${API_BASE}/servers`, stdioServer);
    console.log('Success:', response.data.message);
    console.log('Process spawned successfully');
  } catch (error: any) {
    console.error('Error adding STDIO server:', error.response?.data || error.message);
  }
}

// Example 4: Add an SSE MCP server
async function addSseMCPServer() {
  console.log('\n=== Adding SSE MCP Server ===');

  const sseServer: MCPServer = {
    id: 'realtime-mcp',
    name: 'Real-time MCP (SSE)',
    protocol: 'sse',
    config: {
      url: 'http://localhost:9090/events',
    },
    auth: {
      type: 'none',
    },
    enabled: true,
    priority: 7,
  };

  try {
    const response = await axios.post(`${API_BASE}/servers`, sseServer);
    console.log('Success:', response.data.message);
    console.log('SSE connection established');
  } catch (error: any) {
    console.error('Error adding SSE server:', error.response?.data || error.message);
  }
}

// Example 5: Update an MCP server
async function updateMCPServer(serverId: string) {
  console.log(`\n=== Updating MCP Server: ${serverId} ===`);

  const updates = {
    enabled: false,
    priority: 10,
  };

  try {
    const response = await axios.patch(`${API_BASE}/servers/${serverId}`, updates);
    console.log('Success:', response.data.message);
    console.log('New priority:', response.data.server.priority);
    console.log('Enabled:', response.data.server.enabled);
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log(`Server '${serverId}' not found`);
    } else {
      console.error('Error updating server:', error.response?.data || error.message);
    }
  }
}

// Example 6: Test MCP server connection
async function testMCPConnection(serverId: string) {
  console.log(`\n=== Testing Connection: ${serverId} ===`);

  try {
    const response = await axios.post(`${API_BASE}/servers/${serverId}/test`);

    if (response.data.success) {
      console.log('✓ Connection healthy');
      if (response.data.latency) {
        console.log(`  Latency: ${response.data.latency}ms`);
      }
    } else {
      console.log('✗ Connection failed');
      console.log(`  Message: ${response.data.message}`);
    }
  } catch (error: any) {
    console.error('Error testing connection:', error.response?.data || error.message);
  }
}

// Example 7: Remove an MCP server
async function removeMCPServer(serverId: string) {
  console.log(`\n=== Removing MCP Server: ${serverId} ===`);

  try {
    const response = await axios.delete(`${API_BASE}/servers/${serverId}`);
    console.log('Success:', response.data.message);
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log(`Server '${serverId}' not found`);
    } else {
      console.error('Error removing server:', error.response?.data || error.message);
    }
  }
}

// Example 8: List all aggregated tools
async function listAllTools() {
  console.log('\n=== Listing All Aggregated Tools ===');

  try {
    const response = await axios.get(`${API_BASE}/tools`);
    console.log('Total tools:', response.data.total);

    response.data.tools.slice(0, 10).forEach((tool: any) => {
      console.log(`\n- ${tool.name} (from ${tool.server})`);
      console.log(`  ${tool.description}`);
    });

    if (response.data.tools.length > 10) {
      console.log(`\n... and ${response.data.tools.length - 10} more tools`);
    }
  } catch (error) {
    console.error('Error listing tools:', error);
  }
}

// Example 9: Search tools with fuzzy matching
async function searchTools(query: string) {
  console.log(`\n=== Searching Tools: "${query}" ===`);

  try {
    const response = await axios.get(`${API_BASE}/tools/search`, {
      params: { q: query, limit: 5 },
    });

    console.log(`Found ${response.data.total} results:`);

    response.data.results.forEach((result: any, index: number) => {
      console.log(`\n${index + 1}. ${result.tool.name} (score: ${result.score.toFixed(2)})`);
      console.log(`   Server: ${result.tool.server}`);
      console.log(`   ${result.tool.description}`);
    });
  } catch (error: any) {
    console.error('Error searching tools:', error.response?.data || error.message);
  }
}

// Example 10: Call an MCP tool
async function callMCPTool() {
  console.log('\n=== Calling MCP Tool: memory_store ===');

  try {
    const response = await axios.post(`${API_BASE}/tools/call`, {
      tool: 'memory_store',
      params: {
        key: 'user-preference',
        value: JSON.stringify({ theme: 'dark', language: 'en' }),
      },
    });

    console.log('Tool executed successfully');
    console.log('Result:', JSON.stringify(response.data.result, null, 2));
  } catch (error: any) {
    console.error('Error calling tool:', error.response?.data || error.message);
  }
}

// Example 11: Proxy raw MCP request
async function proxyRawRequest(serverId: string) {
  console.log(`\n=== Proxying Raw Request to: ${serverId} ===`);

  try {
    const response = await axios.post(`${API_BASE}/proxy/${serverId}`, {
      method: 'tools/list',
      params: {},
      id: Date.now(),
    });

    console.log('Proxy successful');
    console.log('Available tools:', response.data.result?.tools?.length || 0);
  } catch (error: any) {
    console.error('Error proxying request:', error.response?.data || error.message);
  }
}

// Example 12: Get MCP metrics
async function getMCPMetrics() {
  console.log('\n=== Getting MCP Metrics ===');

  try {
    const response = await axios.get(`${API_BASE}/metrics`);
    const metrics = response.data.mcp;

    console.log(`Total servers: ${metrics.totalServers}`);
    console.log(`Enabled servers: ${metrics.enabledServers}`);
    console.log(`Total tools: ${metrics.totalTools}`);
    console.log('\nServer request counts:');

    Object.entries(metrics.serverMetrics).forEach(([server, count]) => {
      console.log(`  ${server}: ${count} requests`);
    });
  } catch (error) {
    console.error('Error getting metrics:', error);
  }
}

// Main execution
async function main() {
  console.log('MCP Server Aggregation API Examples');
  console.log('====================================');

  // Run examples
  await listMCPServers();

  // Add servers with different protocols
  await addHttpMCPServer();
  await addStdioMCPServer();
  await addSseMCPServer();

  // Test connections
  await testMCPConnection('github');
  await testMCPConnection('weather-mcp');

  // Update server
  await updateMCPServer('weather-mcp');

  // List and search tools
  await listAllTools();
  await searchTools('github');

  // Call a tool
  // await callMCPTool();

  // Proxy request
  await proxyRawRequest('github');

  // Get metrics
  await getMCPMetrics();

  // Clean up - remove test servers
  await removeMCPServer('weather-mcp');
  await removeMCPServer('memory-mcp');
  await removeMCPServer('realtime-mcp');

  console.log('\n=== Examples Complete ===\n');
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

// Export for use in other modules
export {
  listMCPServers,
  addHttpMCPServer,
  addStdioMCPServer,
  addSseMCPServer,
  updateMCPServer,
  testMCPConnection,
  removeMCPServer,
  listAllTools,
  searchTools,
  callMCPTool,
  proxyRawRequest,
  getMCPMetrics,
};
