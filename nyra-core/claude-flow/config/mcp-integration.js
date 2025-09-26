/**
 * MCP Integration Configuration and Utilities
 * Provides centralized MCP server management and integration patterns
 */

const fs = require('fs');
const path = require('path');

class MCPIntegration {
  constructor() {
    this.configPath = path.join(__dirname, 'mcp-servers.json');
    this.config = this.loadConfig();
    this.serverStatus = new Map();
    this.retryAttempts = new Map();
  }

  loadConfig() {
    try {
      const configData = fs.readFileSync(this.configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      console.error('Failed to load MCP configuration:', error.message);
      return { servers: {}, integration_patterns: {} };
    }
  }

  /**
   * Get server by capability
   */
  getServerByCapability(capability) {
    const routing = this.config.integration_patterns?.capability_routing;
    if (!routing) return null;

    const serverName = routing[capability];
    return serverName ? this.config.servers[serverName] : null;
  }

  /**
   * Get servers in priority order
   */
  getServersByPriority() {
    const servers = Object.entries(this.config.servers);
    return servers
      .filter(([_, server]) => server.status === 'connected')
      .sort(([_, a], [__, b]) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .map(([name, server]) => ({ name, ...server }));
  }

  /**
   * Get fallback server for a given server
   */
  getFallbackServer(serverName) {
    const server = this.config.servers[serverName];
    if (!server?.fallback) return null;

    const fallbackServer = this.config.servers[server.fallback];
    return fallbackServer?.status === 'connected' ? fallbackServer : null;
  }

  /**
   * Execute MCP operation with automatic fallback
   */
  async executeWithFallback(operation, serverName = null) {
    let servers = serverName 
      ? [this.config.servers[serverName]]
      : this.getServersByPriority();

    const errorHandling = this.config.integration_patterns?.error_handling || {};
    const maxRetries = errorHandling.retry_attempts || 3;

    for (const server of servers) {
      if (!server || server.status !== 'connected') continue;

      let attempts = 0;
      while (attempts < maxRetries) {
        try {
          const result = await this.executeOperation(operation, server);
          this.retryAttempts.delete(server.name);
          return { success: true, result, server: server.name };
        } catch (error) {
          attempts++;
          console.warn(`MCP operation failed on ${server.name} (attempt ${attempts}):`, error.message);
          
          if (attempts < maxRetries) {
            await this.delay(errorHandling.retry_delay || 1000);
          }
        }
      }

      // Try fallback server
      if (errorHandling.fallback_enabled) {
        const fallback = this.getFallbackServer(server.name);
        if (fallback) {
          try {
            const result = await this.executeOperation(operation, fallback);
            return { success: true, result, server: fallback.name, fallback: true };
          } catch (fallbackError) {
            console.warn(`Fallback server ${fallback.name} also failed:`, fallbackError.message);
          }
        }
      }
    }

    return { success: false, error: 'All MCP servers failed' };
  }

  /**
   * Execute operation on specific server
   */
  async executeOperation(operation, server) {
    // This would integrate with actual MCP client implementation
    // For now, this is a placeholder for the integration pattern
    throw new Error('MCP client implementation required');
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update server status
   */
  updateServerStatus(serverName, status) {
    if (this.config.servers[serverName]) {
      this.config.servers[serverName].status = status;
      this.serverStatus.set(serverName, {
        status,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Get server health report
   */
  getHealthReport() {
    const servers = Object.entries(this.config.servers).map(([name, server]) => ({
      name,
      status: server.status,
      priority: server.priority,
      capabilities: server.capabilities?.length || 0,
      lastCheck: this.serverStatus.get(name)?.timestamp || null
    }));

    const connected = servers.filter(s => s.status === 'connected').length;
    const total = servers.length;

    return {
      overall: `${connected}/${total} servers connected`,
      servers,
      healthy: connected >= Math.ceil(total * 0.5) // At least 50% connected
    };
  }
}

// Export singleton instance
module.exports = new MCPIntegration();