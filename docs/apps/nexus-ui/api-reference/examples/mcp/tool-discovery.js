/**
 * Project Nyra - MCP Tool Discovery Example
 *
 * This example demonstrates how to discover and call MCP tools
 * through the Nexus Router aggregator.
 */

const axios = require("axios");

// Configuration
const BASE_URL = process.env.NYRA_API_URL || "https://api.project-nyra.io";
const TOKEN = process.env.NYRA_API_TOKEN;

if (!TOKEN) {
  console.error("Error: NYRA_API_TOKEN environment variable is not set");
  console.error('Usage: export NYRA_API_TOKEN="your-jwt-token"');
  process.exit(1);
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  },
});

async function listMCPServers() {
  console.log("🔍 Listing MCP Servers...\n");

  try {
    const response = await api.get("/mcp/servers");
    const { servers, total, enabled } = response.data;

    console.log(`📊 Total Servers: ${total} (${enabled} enabled)\n`);

    servers.forEach((server) => {
      console.log(`  🖥️  ${server.name} (${server.id})`);
      console.log(`      URL: ${server.url}`);
      console.log(
        `      Status: ${server.enabled ? "✅ Enabled" : "❌ Disabled"}`
      );
      console.log(`      Priority: ${server.priority}`);
      console.log(`      Tools: ${server.toolCount}`);
      console.log(
        `      Last Sync: ${new Date(server.lastSync).toLocaleString()}`
      );
      console.log("");
    });

    return servers;
  } catch (error) {
    console.error(
      "❌ Error listing servers:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function listAllTools() {
  console.log("🔍 Listing All MCP Tools...\n");

  try {
    const response = await api.get("/mcp/tools");
    const { tools, total } = response.data;

    console.log(`📊 Total Tools: ${total}\n`);

    // Group tools by server
    const toolsByServer = {};
    tools.forEach((tool) => {
      if (!toolsByServer[tool.server]) {
        toolsByServer[tool.server] = [];
      }
      toolsByServer[tool.server].push(tool);
    });

    Object.entries(toolsByServer).forEach(([server, serverTools]) => {
      console.log(`  🖥️  ${server} (${serverTools.length} tools)`);
      serverTools.forEach((tool) => {
        console.log(`      - ${tool.name}: ${tool.description}`);
      });
      console.log("");
    });

    return tools;
  } catch (error) {
    console.error(
      "❌ Error listing tools:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function searchTools(query) {
  console.log(`🔍 Searching for: "${query}"\n`);

  try {
    const response = await api.get("/mcp/tools/search", {
      params: { q: query, limit: 10 },
    });

    const { results, total } = response.data;

    console.log(`📊 Found ${total} results:\n`);

    results.forEach((result, index) => {
      const { tool, score, matches } = result;
      console.log(`  ${index + 1}. ${tool.name} (Score: ${score.toFixed(2)})`);
      console.log(`     Server: ${tool.server}`);
      console.log(`     Description: ${tool.description}`);
      console.log(`     Matches: ${matches.join(", ")}`);
      console.log("");
    });

    return results;
  } catch (error) {
    console.error(
      "❌ Error searching tools:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function callTool(toolName, params) {
  console.log(`🔧 Calling tool: ${toolName}\n`);
  console.log("Parameters:", JSON.stringify(params, null, 2), "\n");

  try {
    const response = await api.post("/mcp/tools/call", {
      tool: toolName,
      params,
    });

    const { tool, result, timestamp } = response.data;

    console.log("✅ Tool execution successful!\n");
    console.log(`Tool: ${tool}`);
    console.log(`Timestamp: ${timestamp}`);
    console.log("Result:", JSON.stringify(result, null, 2));
    console.log("");

    return result;
  } catch (error) {
    console.error(
      "❌ Error calling tool:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function demonstrateSwarmWorkflow() {
  console.log("🎯 Demonstrating Swarm Workflow\n");
  console.log("=".repeat(50) + "\n");

  try {
    // Step 1: Initialize a swarm
    console.log("Step 1: Initialize Swarm\n");
    const swarmResult = await callTool("swarm_init", {
      topology: "mesh",
      maxAgents: 5,
      strategy: "balanced",
    });

    const swarmId = swarmResult.swarmId;
    console.log(`✨ Swarm created: ${swarmId}\n`);

    // Wait a moment
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 2: Spawn an agent
    console.log("Step 2: Spawn Agent\n");
    const agentResult = await callTool("agent_spawn", {
      type: "coder",
      capabilities: ["typescript", "react", "testing"],
      name: "example-coder-agent",
    });

    console.log(`✨ Agent spawned: ${JSON.stringify(agentResult)}\n`);

    // Wait a moment
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 3: Check swarm status
    console.log("Step 3: Check Swarm Status\n");
    const statusResult = await callTool("swarm_status", {
      verbose: true,
    });

    console.log("📊 Swarm Status:", JSON.stringify(statusResult, null, 2));
    console.log("");
  } catch (error) {
    console.error("❌ Workflow error:", error.message);
  }
}

async function getMCPMetrics() {
  console.log("📊 Getting MCP Metrics...\n");

  try {
    const response = await api.get("/mcp/metrics");
    const { mcp, timestamp } = response.data;

    console.log(`Timestamp: ${timestamp}\n`);
    console.log("Metrics:", JSON.stringify(mcp, null, 2));
    console.log("");

    return mcp;
  } catch (error) {
    console.error(
      "❌ Error getting metrics:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// Main execution
async function main() {
  console.log("🚀 Project Nyra MCP Tool Discovery Example\n");
  console.log("=".repeat(50) + "\n");

  try {
    // List all MCP servers
    await listMCPServers();

    console.log("=".repeat(50) + "\n");

    // List all available tools
    await listAllTools();

    console.log("=".repeat(50) + "\n");

    // Search for swarm-related tools
    await searchTools("swarm");

    console.log("=".repeat(50) + "\n");

    // Search for agent tools
    await searchTools("agent");

    console.log("=".repeat(50) + "\n");

    // Demonstrate a complete workflow
    await demonstrateSwarmWorkflow();

    console.log("=".repeat(50) + "\n");

    // Get MCP metrics
    await getMCPMetrics();

    console.log("✅ All examples completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Example failed:", error.message);
    process.exit(1);
  }
}

// Run the example
main();
