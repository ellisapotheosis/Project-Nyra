/**
 * MCP Integration Module - Manages connections to MCP servers
 * 
 * Provides unified interface for interacting with desktop-commander, ruv-swarm,
 * flow-nexus, and other MCP servers with proper error handling and load balancing.
 */

const { EventEmitter } = require('events');

class MCPIntegration extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // MCP Server Configuration
            servers: {
                'desktop-commander': {
                    host: 'localhost',
                    port: 3000,
                    capabilities: [
                        'file-operations',
                        'process-management',
                        'system-commands',
                        'search-operations'
                    ],
                    priority: 10,
                    timeout: 30000,
                    retries: 3
                },
                'ruv-swarm': {
                    host: 'localhost',
                    port: 3001,
                    capabilities: [
                        'swarm-coordination',
                        'neural-patterns',
                        'memory-management',
                        'learning-adaptation'
                    ],
                    priority: 8,
                    timeout: 60000,
                    retries: 2
                },
                'flow-nexus': {
                    host: 'localhost',
                    port: 3002,
                    capabilities: [
                        'cloud-execution',
                        'template-management',
                        'real-time-monitoring',
                        'storage-operations'
                    ],
                    priority: 6,
                    timeout: 45000,
                    retries: 2
                },
                'claude-flow': {
                    host: 'localhost',
                    port: 3003,
                    capabilities: [
                        'agent-spawning',
                        'workflow-coordination',
                        'sparc-integration',
                        'task-orchestration'
                    ],
                    priority: 9,
                    timeout: 30000,
                    retries: 3
                }
            },
            
            // Load balancing and failover
            loadBalancing: {
                enabled: true,
                strategy: 'priority', // 'round-robin', 'priority', 'least-connections'
                healthCheckInterval: 30000 // 30 seconds
            },
            
            // Connection pooling
            connectionPooling: {
                enabled: true,
                maxConnections: 10,
                idleTimeout: 300000, // 5 minutes
                keepAlive: true
            },
            
            ...config
        };
        
        this.state = {
            connections: new Map(),
            connectionPools: new Map(),
            healthStatus: new Map(),
            metrics: new Map(),
            loadBalancer: {
                roundRobinIndex: 0,
                connectionCounts: new Map()
            }
        };
        
        this.logger = this._createLogger();
    }
    
    /**
     * Initialize MCP server connections
     */
    async initialize() {
        this.logger.info('🔌 Initializing MCP server connections...');
        
        try {
            // Initialize connection pools
            for (const [serverName, serverConfig] of Object.entries(this.config.servers)) {
                await this._initializeServerConnection(serverName, serverConfig);
            }
            
            // Start health checks
            if (this.config.loadBalancing.enabled) {
                this._startHealthChecks();
            }
            
            this.logger.info(`✅ MCP Integration initialized with ${this.state.connections.size} servers`);
            this.emit('initialized');
            
        } catch (error) {
            this.logger.error('❌ Failed to initialize MCP Integration:', error);
            throw error;
        }
    }
    
    /**
     * Initialize connection to a specific MCP server
     */
    async _initializeServerConnection(serverName, config) {
        try {
            // Create connection pool
            const pool = this._createConnectionPool(serverName, config);
            this.state.connectionPools.set(serverName, pool);
            
            // Create primary connection
            const connection = await this._createConnection(serverName, config);
            this.state.connections.set(serverName, connection);
            
            // Initialize metrics
            this.state.metrics.set(serverName, {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                averageResponseTime: 0,
                lastRequestTime: 0,
                connectionTime: Date.now()
            });
            
            // Set initial health status
            this.state.healthStatus.set(serverName, {
                status: 'healthy',
                lastCheck: Date.now(),
                consecutiveFailures: 0
            });
            
            this.logger.info(`✅ Connected to MCP server: ${serverName}`);
            
        } catch (error) {
            this.logger.error(`❌ Failed to connect to ${serverName}:`, error);
            
            // Set unhealthy status
            this.state.healthStatus.set(serverName, {
                status: 'unhealthy',
                lastCheck: Date.now(),
                consecutiveFailures: 1,
                error: error.message
            });
        }
    }
    
    /**
     * Create connection pool for a server
     */
    _createConnectionPool(serverName, config) {
        return {
            serverName,
            config,
            connections: [],
            activeConnections: 0,
            maxConnections: this.config.connectionPooling.maxConnections,
            created: Date.now()
        };
    }
    
    /**
     * Create connection to MCP server
     */
    async _createConnection(serverName, config) {
        // Mock connection - will be replaced with actual MCP client implementation
        return {
            serverName,
            config,
            status: 'connected',
            created: Date.now(),
            lastUsed: Date.now()
        };
    }
    
    /**
     * Execute a tool call on the best available MCP server
     */
    async executeToolCall(capability, toolName, parameters = {}, options = {}) {
        const serverName = this._selectServer(capability, options);
        if (!serverName) {
            throw new Error(`No available server found for capability: ${capability}`);
        }
        
        return await this._executeOnServer(serverName, toolName, parameters, options);
    }
    
    /**
     * Execute tool call on specific server
     */
    async _executeOnServer(serverName, toolName, parameters, options = {}) {
        const connection = this.state.connections.get(serverName);
        if (!connection) {
            throw new Error(`No connection to server: ${serverName}`);
        }
        
        const serverConfig = this.config.servers[serverName];
        const startTime = Date.now();
        
        try {
            // Update metrics
            const metrics = this.state.metrics.get(serverName);
            metrics.totalRequests++;
            metrics.lastRequestTime = startTime;
            
            // Execute the tool call (mock implementation)
            const result = await this._performToolCall(serverName, toolName, parameters, options);
            
            // Update success metrics
            const duration = Date.now() - startTime;
            metrics.successfulRequests++;
            metrics.averageResponseTime = 
                (metrics.averageResponseTime * (metrics.successfulRequests - 1) + duration) / 
                metrics.successfulRequests;
            
            // Update health status
            const health = this.state.healthStatus.get(serverName);
            health.status = 'healthy';
            health.consecutiveFailures = 0;
            
            this.logger.debug(`✅ Tool call ${toolName} completed on ${serverName} in ${duration}ms`);
            
            return result;
            
        } catch (error) {
            // Update failure metrics
            const metrics = this.state.metrics.get(serverName);
            metrics.failedRequests++;
            
            // Update health status
            const health = this.state.healthStatus.get(serverName);
            health.consecutiveFailures++;
            if (health.consecutiveFailures >= 3) {
                health.status = 'unhealthy';
            }
            
            this.logger.error(`❌ Tool call ${toolName} failed on ${serverName}:`, error);
            
            // Attempt failover if configured
            if (options.allowFailover !== false && health.consecutiveFailures >= 2) {
                return await this._attemptFailover(serverName, toolName, parameters, options);
            }
            
            throw error;
        }
    }
    
    /**
     * Perform the actual tool call (mock implementation)
     */
    async _performToolCall(serverName, toolName, parameters, options) {
        // This will be replaced with actual MCP client calls
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Tool call ${toolName} timed out on ${serverName}`));
            }, this.config.servers[serverName].timeout);
            
            // Mock execution time
            const executionTime = Math.random() * 2000 + 500;
            setTimeout(() => {
                clearTimeout(timeout);
                resolve({
                    server: serverName,
                    tool: toolName,
                    parameters,
                    result: `${toolName} executed successfully on ${serverName}`,
                    timestamp: Date.now(),
                    duration: executionTime
                });
            }, executionTime);
        });
    }
    
    /**
     * Attempt failover to another server
     */
    async _attemptFailover(failedServer, toolName, parameters, options) {
        this.logger.warn(`🔄 Attempting failover from ${failedServer}...`);
        
        const capability = this._getCapabilityForTool(toolName);
        const alternativeServers = this._getServersForCapability(capability)
            .filter(server => server !== failedServer);
        
        for (const serverName of alternativeServers) {
            try {
                this.logger.info(`🔄 Trying failover to ${serverName}...`);
                return await this._executeOnServer(serverName, toolName, parameters, {
                    ...options,
                    allowFailover: false // Prevent infinite failover loops
                });
            } catch (error) {
                this.logger.warn(`Failover to ${serverName} failed:`, error.message);
                continue;
            }
        }
        
        throw new Error(`All failover attempts failed for tool: ${toolName}`);
    }
    
    /**
     * Select the best server for a capability
     */
    _selectServer(capability, options = {}) {
        const availableServers = this._getServersForCapability(capability)
            .filter(serverName => {
                const health = this.state.healthStatus.get(serverName);
                return health && health.status === 'healthy';
            });
        
        if (availableServers.length === 0) {
            return null;
        }
        
        if (options.preferredServer && availableServers.includes(options.preferredServer)) {
            return options.preferredServer;
        }
        
        switch (this.config.loadBalancing.strategy) {
            case 'priority':
                return this._selectByPriority(availableServers);
            case 'round-robin':
                return this._selectByRoundRobin(availableServers);
            case 'least-connections':
                return this._selectByLeastConnections(availableServers);
            default:
                return availableServers[0];
        }
    }
    
    /**
     * Select server by priority
     */
    _selectByPriority(servers) {
        return servers.reduce((best, current) => {
            const bestPriority = this.config.servers[best].priority || 0;
            const currentPriority = this.config.servers[current].priority || 0;
            return currentPriority > bestPriority ? current : best;
        });
    }
    
    /**
     * Select server by round-robin
     */
    _selectByRoundRobin(servers) {
        const index = this.state.loadBalancer.roundRobinIndex % servers.length;
        this.state.loadBalancer.roundRobinIndex++;
        return servers[index];
    }
    
    /**
     * Select server by least connections
     */
    _selectByLeastConnections(servers) {
        return servers.reduce((best, current) => {
            const bestCount = this.state.loadBalancer.connectionCounts.get(best) || 0;
            const currentCount = this.state.loadBalancer.connectionCounts.get(current) || 0;
            return currentCount < bestCount ? current : best;
        });
    }
    
    /**
     * Get servers that support a specific capability
     */
    _getServersForCapability(capability) {
        return Object.entries(this.config.servers)
            .filter(([_, config]) => config.capabilities.includes(capability))
            .map(([serverName]) => serverName);
    }
    
    /**
     * Get capability for a specific tool (mock implementation)
     */
    _getCapabilityForTool(toolName) {
        // Map tool names to capabilities
        const toolCapabilityMap = {
            // Desktop Commander tools
            'read_file': 'file-operations',
            'write_file': 'file-operations',
            'list_directory': 'file-operations',
            'start_process': 'process-management',
            'interact_with_process': 'process-management',
            
            // Ruv Swarm tools
            'swarm_init': 'swarm-coordination',
            'agent_spawn': 'swarm-coordination',
            'neural_train': 'neural-patterns',
            'memory_usage': 'memory-management',
            
            // Flow Nexus tools
            'sandbox_create': 'cloud-execution',
            'template_deploy': 'template-management',
            'storage_upload': 'storage-operations',
            'execution_stream_subscribe': 'real-time-monitoring',
            
            // Claude Flow tools
            'task_orchestrate': 'task-orchestration',
            'workflow_create': 'workflow-coordination'
        };
        
        return toolCapabilityMap[toolName] || 'file-operations'; // Default fallback
    }
    
    /**
     * Start health check monitoring
     */
    _startHealthChecks() {
        setInterval(() => {
            this._performHealthChecks();
        }, this.config.loadBalancing.healthCheckInterval);
        
        this.logger.info('🏥 Health monitoring started');
    }
    
    /**
     * Perform health checks on all servers
     */
    async _performHealthChecks() {
        for (const [serverName] of this.state.connections) {
            try {
                // Simple ping to check server health
                await this._pingServer(serverName);
                
                const health = this.state.healthStatus.get(serverName);
                if (health.status === 'unhealthy' && health.consecutiveFailures < 3) {
                    health.status = 'healthy';
                    health.consecutiveFailures = 0;
                    this.logger.info(`💚 Server ${serverName} recovered`);
                }
                
                health.lastCheck = Date.now();
                
            } catch (error) {
                const health = this.state.healthStatus.get(serverName);
                health.consecutiveFailures++;
                health.lastCheck = Date.now();
                
                if (health.consecutiveFailures >= 3) {
                    health.status = 'unhealthy';
                    this.logger.warn(`💔 Server ${serverName} marked as unhealthy`);
                }
            }
        }
    }
    
    /**
     * Ping a server to check health
     */
    async _pingServer(serverName) {
        // Mock ping - will be replaced with actual health check
        return new Promise((resolve, reject) => {
            const health = this.state.healthStatus.get(serverName);
            // Simulate occasional failures for testing
            if (Math.random() < 0.1) {
                reject(new Error(`Health check failed for ${serverName}`));
            } else {
                resolve(true);
            }
        });
    }
    
    /**
     * Get system status
     */
    getStatus() {
        const servers = {};
        
        for (const [serverName] of this.state.connections) {
            const health = this.state.healthStatus.get(serverName);
            const metrics = this.state.metrics.get(serverName);
            
            servers[serverName] = {
                status: health.status,
                lastCheck: health.lastCheck,
                consecutiveFailures: health.consecutiveFailures,
                metrics: {
                    totalRequests: metrics.totalRequests,
                    successRate: metrics.totalRequests > 0 ? 
                        metrics.successfulRequests / metrics.totalRequests : 0,
                    averageResponseTime: metrics.averageResponseTime
                }
            };
        }
        
        return {
            totalServers: this.state.connections.size,
            healthyServers: Array.from(this.state.healthStatus.values())
                .filter(h => h.status === 'healthy').length,
            servers
        };
    }
    
    /**
     * Shutdown all connections
     */
    async shutdown() {
        this.logger.info('🛑 Shutting down MCP Integration...');
        
        try {
            // Close all connections
            for (const [serverName, connection] of this.state.connections) {
                await this._closeConnection(serverName, connection);
            }
            
            // Clear state
            this.state.connections.clear();
            this.state.connectionPools.clear();
            this.state.healthStatus.clear();
            
            this.logger.info('✅ MCP Integration shutdown complete');
            
        } catch (error) {
            this.logger.error('❌ Error during MCP Integration shutdown:', error);
        }
    }
    
    /**
     * Close connection to server
     */
    async _closeConnection(serverName, connection) {
        try {
            // Mock connection closure
            this.logger.info(`🔌 Disconnected from ${serverName}`);
        } catch (error) {
            this.logger.warn(`Failed to close connection to ${serverName}:`, error.message);
        }
    }
    
    /**
     * Create logger instance
     */
    _createLogger() {
        return {
            info: (message, ...args) => console.log(`[MCPIntegration] ${message}`, ...args),
            warn: (message, ...args) => console.warn(`[MCPIntegration] ${message}`, ...args),
            error: (message, ...args) => console.error(`[MCPIntegration] ${message}`, ...args),
            debug: (message, ...args) => console.debug(`[MCPIntegration] ${message}`, ...args)
        };
    }
}

module.exports = MCPIntegration;