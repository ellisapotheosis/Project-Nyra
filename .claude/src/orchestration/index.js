/**
 * Archon Orchestration Layer - Main Entry Point
 * 
 * Exports all orchestration components and provides a unified interface
 * for initializing and managing the multi-agent development stack.
 */

const ArchonOrchestrator = require('./archon-orchestrator');
const WorkflowCoordinator = require('./workflow-coordinator');
const MCPIntegration = require('./mcp-integration');
const TaskRouter = require('./task-router');

/**
 * Unified Orchestration Manager
 * 
 * Manages all orchestration components and provides a single interface
 * for the entire orchestration layer.
 */
class OrchestrationManager {
    constructor(config = {}) {
        this.config = {
            // Global configuration
            environment: process.env.NODE_ENV || 'development',
            logLevel: process.env.LOG_LEVEL || 'info',
            
            // Component-specific configurations
            archon: config.archon || {},
            workflow: config.workflow || {},
            mcp: config.mcp || {},
            router: config.router || {},
            
            // Integration settings
            autoInit: config.autoInit !== false,
            healthCheckInterval: config.healthCheckInterval || 30000,
            
            ...config
        };
        
        // Initialize components
        this.archon = null;
        this.workflow = null;
        this.mcp = null;
        this.router = null;
        
        this.state = {
            initialized: false,
            components: new Map(),
            status: 'idle'
        };
        
        this.logger = this._createLogger();
    }
    
    /**
     * Initialize the complete orchestration layer
     */
    async initialize() {
        if (this.state.initialized) {
            this.logger.warn('Orchestration layer already initialized');
            return;
        }
        
        this.logger.info('🚀 Initializing Archon Orchestration Layer...');
        this.state.status = 'initializing';
        
        try {
            // Initialize MCP Integration first (required by other components)
            this.logger.info('🔌 Initializing MCP Integration...');
            this.mcp = new MCPIntegration(this.config.mcp);
            await this.mcp.initialize();
            this.state.components.set('mcp', this.mcp);
            
            // Initialize Archon Orchestrator
            this.logger.info('🤖 Initializing Archon Orchestrator...');
            this.archon = new ArchonOrchestrator(this.config.archon);
            await this.archon.initialize();
            this.state.components.set('archon', this.archon);
            
            // Initialize Task Router
            this.logger.info('📍 Initializing Task Router...');
            this.router = new TaskRouter(this.archon, this.mcp, this.config.router);
            this.state.components.set('router', this.router);
            
            // Initialize Workflow Coordinator
            this.logger.info('🎯 Initializing Workflow Coordinator...');
            this.workflow = new WorkflowCoordinator(this.archon, this.config.workflow);
            this.state.components.set('workflow', this.workflow);
            
            // Setup component event forwarding
            this._setupEventForwarding();
            
            // Setup health monitoring
            this._setupHealthMonitoring();
            
            this.state.initialized = true;
            this.state.status = 'ready';
            
            this.logger.info('✅ Archon Orchestration Layer initialized successfully');
            this.logger.info('🎉 Ready for multi-agent development workflows!');
            
        } catch (error) {
            this.state.status = 'failed';
            this.logger.error('❌ Failed to initialize Orchestration Layer:', error);
            throw error;
        }
    }
    
    /**
     * Setup event forwarding between components
     */
    _setupEventForwarding() {
        // Forward important events from components
        if (this.archon) {
            this.archon.on('error', (error) => this.emit('archon:error', error));
            this.archon.on('metrics', (metrics) => this.emit('archon:metrics', metrics));
        }
        
        if (this.workflow) {
            this.workflow.on('workflow:started', (data) => this.emit('workflow:started', data));
            this.workflow.on('workflow:completed', (data) => this.emit('workflow:completed', data));
            this.workflow.on('workflow:failed', (data) => this.emit('workflow:failed', data));
        }
        
        if (this.mcp) {
            this.mcp.on('error', (error) => this.emit('mcp:error', error));
            this.mcp.on('initialized', () => this.emit('mcp:ready'));
        }
        
        if (this.router) {
            this.router.on('task:routed', (data) => this.emit('task:routed', data));
            this.router.on('task:routing:failed', (data) => this.emit('task:routing:failed', data));
        }
    }
    
    /**
     * Setup health monitoring for all components
     */
    _setupHealthMonitoring() {
        setInterval(() => {
            this._performHealthCheck();
        }, this.config.healthCheckInterval);
        
        this.logger.info('🏥 Health monitoring started');
    }
    
    /**
     * Perform health check on all components
     */
    _performHealthCheck() {
        const health = {
            timestamp: Date.now(),
            overall: 'healthy',
            components: {}
        };
        
        for (const [name, component] of this.state.components) {
            try {
                const componentHealth = component.getStatus ? component.getStatus() : { status: 'unknown' };
                health.components[name] = componentHealth;
                
                if (componentHealth.status === 'unhealthy' || componentHealth.status === 'failed') {
                    health.overall = 'degraded';
                }
            } catch (error) {
                health.components[name] = { status: 'error', error: error.message };
                health.overall = 'degraded';
            }
        }
        
        this.emit('health:check', health);
        
        if (health.overall !== 'healthy') {
            this.logger.warn('⚠️ System health check detected issues:', health);
        }
    }
    
    /**
     * Create and execute a SPARC workflow
     */
    async createSPARCWorkflow(templateName, taskDefinition, options = {}) {
        this._ensureInitialized();
        
        try {
            const workflowId = await this.workflow.createWorkflow(templateName, taskDefinition, options);
            this.logger.info(`📋 Created SPARC workflow: ${workflowId}`);
            
            // Execute workflow if auto-execute is enabled
            if (options.autoExecute !== false) {
                this.logger.info(`🚀 Executing workflow: ${workflowId}`);
                const results = await this.workflow.executeWorkflow(workflowId);
                return { workflowId, results };
            }
            
            return { workflowId };
            
        } catch (error) {
            this.logger.error('❌ Failed to create SPARC workflow:', error);
            throw error;
        }
    }
    
    /**
     * Queue a task for intelligent routing
     */
    async queueTask(taskType, payload, options = {}) {
        this._ensureInitialized();
        
        const task = {
            id: this._generateTaskId(),
            type: taskType,
            payload,
            priority: options.priority || 'medium',
            timeout: options.timeout || 300000,
            createdAt: Date.now(),
            ...options
        };
        
        try {
            const routedTask = await this.router.routeTask(task);
            const taskId = this.archon.queueTask(routedTask.assignedAgent, routedTask, options);
            
            this.logger.info(`📋 Queued task ${task.id} -> Agent: ${routedTask.assignedAgent}`);
            return taskId;
            
        } catch (error) {
            this.logger.error(`❌ Failed to queue task ${task.id}:`, error);
            throw error;
        }
    }
    
    /**
     * Execute MCP tool call with automatic server selection
     */
    async executeMCPTool(capability, toolName, parameters = {}, options = {}) {
        this._ensureInitialized();
        
        try {
            return await this.mcp.executeToolCall(capability, toolName, parameters, options);
        } catch (error) {
            this.logger.error(`❌ MCP tool call failed (${toolName}):`, error);
            throw error;
        }
    }
    
    /**
     * Get comprehensive system status
     */
    getSystemStatus() {
        this._ensureInitialized();
        
        const status = {
            initialized: this.state.initialized,
            status: this.state.status,
            timestamp: Date.now(),
            components: {}
        };
        
        for (const [name, component] of this.state.components) {
            try {
                status.components[name] = component.getStatus ? component.getStatus() : { status: 'unknown' };
            } catch (error) {
                status.components[name] = { status: 'error', error: error.message };
            }
        }
        
        return status;
    }
    
    /**
     * Get system metrics
     */
    getSystemMetrics() {
        this._ensureInitialized();
        
        const metrics = {
            timestamp: Date.now(),
            orchestration: {},
            workflow: {},
            routing: {},
            mcp: {}
        };
        
        try {
            if (this.archon && this.archon.getStatus) {
                metrics.orchestration = this.archon.getStatus().metrics || {};
            }
            
            if (this.workflow && this.workflow.getMetrics) {
                metrics.workflow = this.workflow.getMetrics();
            }
            
            if (this.router && this.router.getRoutingStatistics) {
                metrics.routing = this.router.getRoutingStatistics();
            }
            
            if (this.mcp && this.mcp.getStatus) {
                metrics.mcp = this.mcp.getStatus();
            }
        } catch (error) {
            this.logger.error('Error gathering metrics:', error);
        }
        
        return metrics;
    }
    
    /**
     * List active workflows
     */
    listActiveWorkflows() {
        this._ensureInitialized();
        return this.workflow.listWorkflows({ includeArchived: false });
    }
    
    /**
     * Get workflow status
     */
    getWorkflowStatus(workflowId) {
        this._ensureInitialized();
        return this.workflow.getWorkflowStatus(workflowId);
    }
    
    /**
     * Get routing history
     */
    getRoutingHistory(limit = 50) {
        this._ensureInitialized();
        return this.router.getRoutingHistory(limit);
    }
    
    /**
     * Graceful shutdown of all components
     */
    async shutdown() {
        if (!this.state.initialized) {
            this.logger.warn('Orchestration layer not initialized');
            return;
        }
        
        this.logger.info('🛑 Shutting down Archon Orchestration Layer...');
        this.state.status = 'shutting-down';
        
        try {
            // Shutdown in reverse order of initialization
            if (this.workflow) {
                await this.workflow.shutdown?.();
            }
            
            if (this.router) {
                await this.router.shutdown?.();
            }
            
            if (this.archon) {
                await this.archon.shutdown();
            }
            
            if (this.mcp) {
                await this.mcp.shutdown();
            }
            
            this.state.components.clear();
            this.state.initialized = false;
            this.state.status = 'shutdown';
            
            this.logger.info('✅ Archon Orchestration Layer shutdown complete');
            
        } catch (error) {
            this.logger.error('❌ Error during shutdown:', error);
            throw error;
        }
    }
    
    /**
     * Ensure the orchestration layer is initialized
     */
    _ensureInitialized() {
        if (!this.state.initialized) {
            throw new Error('Orchestration layer not initialized. Call initialize() first.');
        }
    }
    
    /**
     * Generate unique task ID
     */
    _generateTaskId() {
        return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Create logger instance
     */
    _createLogger() {
        const logLevel = this.config.logLevel.toLowerCase();
        const shouldLog = {
            debug: ['debug'].includes(logLevel),
            info: ['debug', 'info'].includes(logLevel),
            warn: ['debug', 'info', 'warn'].includes(logLevel),
            error: true
        };
        
        return {
            info: (message, ...args) => shouldLog.info && console.log(`[OrchestrationManager] ${message}`, ...args),
            warn: (message, ...args) => shouldLog.warn && console.warn(`[OrchestrationManager] ${message}`, ...args),
            error: (message, ...args) => shouldLog.error && console.error(`[OrchestrationManager] ${message}`, ...args),
            debug: (message, ...args) => shouldLog.debug && console.debug(`[OrchestrationManager] ${message}`, ...args)
        };
    }
}

// Export individual components
module.exports = {
    // Main orchestration manager
    OrchestrationManager,
    
    // Individual components
    ArchonOrchestrator,
    WorkflowCoordinator,
    MCPIntegration,
    TaskRouter,
    
    // Convenience factory function
    createOrchestrationLayer: (config = {}) => new OrchestrationManager(config)
};