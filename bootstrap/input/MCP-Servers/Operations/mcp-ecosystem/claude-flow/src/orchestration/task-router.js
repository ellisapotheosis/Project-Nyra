/**
 * Task Router - Intelligent task routing and delegation system
 * 
 * Routes tasks to appropriate agents based on capabilities, load, priority,
 * and availability. Integrates with MCP servers and workflow coordination.
 */

const { EventEmitter } = require('events');

class TaskRouter extends EventEmitter {
    constructor(archonOrchestrator, mcpIntegration, config = {}) {
        super();
        
        this.archon = archonOrchestrator;
        this.mcp = mcpIntegration;
        
        this.config = {
            // Routing configuration
            routing: {
                strategy: 'adaptive', // 'simple', 'priority', 'load-balanced', 'adaptive'
                maxRetries: 3,
                timeoutMs: 300000, // 5 minutes
                queueSize: 1000
            },
            
            // Agent capabilities mapping
            agentCapabilities: {
                // Core Development Agents
                'coder': {
                    capabilities: ['code-generation', 'bug-fixing', 'refactoring', 'api-development'],
                    complexity: 'high',
                    estimatedTime: 120, // seconds
                    concurrency: 4,
                    mcpTools: ['file-operations', 'process-management']
                },
                'reviewer': {
                    capabilities: ['code-review', 'security-analysis', 'quality-assurance'],
                    complexity: 'medium',
                    estimatedTime: 90,
                    concurrency: 2,
                    mcpTools: ['file-operations']
                },
                'tester': {
                    capabilities: ['unit-testing', 'integration-testing', 'test-automation'],
                    complexity: 'medium',
                    estimatedTime: 150,
                    concurrency: 3,
                    mcpTools: ['process-management', 'file-operations']
                },
                'planner': {
                    capabilities: ['project-planning', 'task-breakdown', 'resource-allocation'],
                    complexity: 'high',
                    estimatedTime: 180,
                    concurrency: 1,
                    mcpTools: ['workflow-coordination']
                },
                'researcher': {
                    capabilities: ['requirements-analysis', 'technology-research', 'documentation'],
                    complexity: 'medium',
                    estimatedTime: 200,
                    concurrency: 2,
                    mcpTools: ['search-operations', 'file-operations']
                },
                
                // SPARC Methodology Agents
                'specification': {
                    capabilities: ['requirements-specification', 'use-case-analysis'],
                    complexity: 'high',
                    estimatedTime: 240,
                    concurrency: 2,
                    mcpTools: ['file-operations', 'workflow-coordination']
                },
                'pseudocode': {
                    capabilities: ['algorithm-design', 'pseudocode-generation'],
                    complexity: 'high',
                    estimatedTime: 180,
                    concurrency: 2,
                    mcpTools: ['file-operations']
                },
                'architecture': {
                    capabilities: ['system-architecture', 'design-patterns', 'technology-selection'],
                    complexity: 'high',
                    estimatedTime: 300,
                    concurrency: 1,
                    mcpTools: ['file-operations', 'workflow-coordination']
                },
                'refinement': {
                    capabilities: ['code-refinement', 'optimization', 'performance-tuning'],
                    complexity: 'high',
                    estimatedTime: 200,
                    concurrency: 3,
                    mcpTools: ['file-operations', 'process-management']
                },
                
                // Specialized Agents
                'backend-dev': {
                    capabilities: ['api-development', 'database-design', 'server-configuration'],
                    complexity: 'high',
                    estimatedTime: 250,
                    concurrency: 2,
                    mcpTools: ['process-management', 'cloud-execution']
                },
                'frontend-dev': {
                    capabilities: ['ui-development', 'user-experience', 'responsive-design'],
                    complexity: 'medium',
                    estimatedTime: 200,
                    concurrency: 2,
                    mcpTools: ['file-operations', 'template-management']
                },
                'devops': {
                    capabilities: ['deployment', 'ci-cd', 'infrastructure', 'monitoring'],
                    complexity: 'high',
                    estimatedTime: 300,
                    concurrency: 1,
                    mcpTools: ['cloud-execution', 'process-management']
                },
                'security': {
                    capabilities: ['security-audit', 'vulnerability-assessment', 'compliance'],
                    complexity: 'high',
                    estimatedTime: 240,
                    concurrency: 1,
                    mcpTools: ['file-operations', 'security-scanning']
                }
            },
            
            // Task priority levels
            priorities: {
                'critical': { weight: 100, timeout: 180000 }, // 3 minutes
                'high': { weight: 75, timeout: 300000 }, // 5 minutes
                'medium': { weight: 50, timeout: 600000 }, // 10 minutes
                'low': { weight: 25, timeout: 1200000 } // 20 minutes
            },
            
            ...config
        };
        
        this.state = {
            taskQueue: [],
            routingDecisions: new Map(),
            agentLoadTracker: new Map(),
            performanceMetrics: new Map(),
            routingHistory: []
        };
        
        // Initialize agent load tracking
        this._initializeLoadTracking();
        
        this.logger = this._createLogger();
    }
    
    /**
     * Initialize load tracking for all agents
     */
    _initializeLoadTracking() {
        for (const [agentType, capabilities] of Object.entries(this.config.agentCapabilities)) {
            this.state.agentLoadTracker.set(agentType, {
                activeeTasks: 0,
                queuedTasks: 0,
                completedTasks: 0,
                averageCompletionTime: capabilities.estimatedTime * 1000, // Convert to ms
                lastUpdate: Date.now(),
                efficiency: 1.0 // Performance multiplier
            });
            
            this.state.performanceMetrics.set(agentType, {
                successRate: 1.0,
                averageResponseTime: capabilities.estimatedTime * 1000,
                totalTasks: 0,
                failedTasks: 0,
                timeouts: 0
            });
        }
    }
    
    /**
     * Route a task to the most appropriate agent
     */
    async routeTask(task) {
        const routingStart = Date.now();
        
        try {
            // Validate task
            this._validateTask(task);
            
            // Analyze task requirements
            const requirements = this._analyzeTaskRequirements(task);
            
            // Find suitable agents
            const suitableAgents = this._findSuitableAgents(requirements);
            
            if (suitableAgents.length === 0) {
                throw new Error(`No suitable agents found for task: ${task.type || 'unknown'}`);
            }
            
            // Select best agent using routing strategy
            const selectedAgent = this._selectBestAgent(suitableAgents, requirements, task);
            
            // Create routing decision
            const routingDecision = {
                taskId: task.id,
                selectedAgent,
                suitableAgents,
                requirements,
                strategy: this.config.routing.strategy,
                routingTime: Date.now() - routingStart,
                timestamp: Date.now()
            };
            
            this.state.routingDecisions.set(task.id, routingDecision);
            
            // Update load tracking
            this._updateAgentLoad(selectedAgent, 'queued');
            
            // Queue the task
            const routedTask = {
                ...task,
                assignedAgent: selectedAgent,
                routingDecision,
                queuedAt: Date.now()
            };
            
            this.logger.info(`📍 Routed task ${task.id} to ${selectedAgent} (${routingDecision.routingTime}ms)`);
            
            this.emit('task:routed', { task: routedTask, decision: routingDecision });
            
            return routedTask;
            
        } catch (error) {
            this.logger.error(`❌ Task routing failed for ${task.id}:`, error);
            this.emit('task:routing:failed', { task, error });
            throw error;
        }
    }
    
    /**
     * Validate task structure and requirements
     */
    _validateTask(task) {
        if (!task.id) {
            throw new Error('Task must have an ID');
        }
        
        if (!task.payload) {
            throw new Error('Task must have a payload');
        }
        
        // Set defaults
        task.priority = task.priority || 'medium';
        task.timeout = task.timeout || this.config.priorities[task.priority].timeout;
        task.createdAt = task.createdAt || Date.now();
    }
    
    /**
     * Analyze task requirements to determine agent needs
     */
    _analyzeTaskRequirements(task) {
        const requirements = {
            capabilities: [],
            complexity: 'medium',
            estimatedTime: 120000, // 2 minutes default
            priority: task.priority || 'medium',
            mcpTools: [],
            specialRequirements: []
        };
        
        // Analyze task type and content
        if (task.type) {
            switch (task.type) {
                case 'code-generation':
                case 'implementation':
                    requirements.capabilities = ['code-generation', 'api-development'];
                    requirements.complexity = 'high';
                    requirements.estimatedTime = 180000;
                    requirements.mcpTools = ['file-operations', 'process-management'];
                    break;
                    
                case 'code-review':
                case 'review':
                    requirements.capabilities = ['code-review', 'quality-assurance'];
                    requirements.complexity = 'medium';
                    requirements.estimatedTime = 120000;
                    requirements.mcpTools = ['file-operations'];
                    break;
                    
                case 'testing':
                case 'test-creation':
                    requirements.capabilities = ['unit-testing', 'test-automation'];
                    requirements.complexity = 'medium';
                    requirements.estimatedTime = 150000;
                    requirements.mcpTools = ['process-management', 'file-operations'];
                    break;
                    
                case 'architecture':
                case 'system-design':
                    requirements.capabilities = ['system-architecture', 'design-patterns'];
                    requirements.complexity = 'high';
                    requirements.estimatedTime = 300000;
                    requirements.mcpTools = ['workflow-coordination'];
                    break;
                    
                case 'research':
                case 'analysis':
                    requirements.capabilities = ['requirements-analysis', 'technology-research'];
                    requirements.complexity = 'medium';
                    requirements.estimatedTime = 200000;
                    requirements.mcpTools = ['search-operations', 'file-operations'];
                    break;
                    
                default:
                    // Try to infer from payload content
                    this._inferRequirementsFromPayload(task.payload, requirements);
            }
        } else {
            // Infer requirements from payload
            this._inferRequirementsFromPayload(task.payload, requirements);
        }
        
        // Analyze payload for additional context
        if (task.payload.description) {
            this._analyzeDescriptionForRequirements(task.payload.description, requirements);
        }
        
        return requirements;
    }
    
    /**
     * Infer requirements from task payload
     */
    _inferRequirementsFromPayload(payload, requirements) {
        const content = JSON.stringify(payload).toLowerCase();
        
        // Look for keywords to infer capabilities
        if (content.includes('test') || content.includes('spec')) {
            requirements.capabilities.push('unit-testing');
            requirements.mcpTools.push('process-management');
        }
        
        if (content.includes('api') || content.includes('endpoint')) {
            requirements.capabilities.push('api-development');
            requirements.mcpTools.push('process-management');
        }
        
        if (content.includes('ui') || content.includes('frontend')) {
            requirements.capabilities.push('ui-development');
            requirements.mcpTools.push('template-management');
        }
        
        if (content.includes('database') || content.includes('backend')) {
            requirements.capabilities.push('database-design');
            requirements.mcpTools.push('cloud-execution');
        }
        
        if (content.includes('deploy') || content.includes('ci/cd')) {
            requirements.capabilities.push('deployment');
            requirements.mcpTools.push('cloud-execution');
        }
    }
    
    /**
     * Analyze description text for additional requirements
     */
    _analyzeDescriptionForRequirements(description, requirements) {
        const text = description.toLowerCase();
        
        // Complexity analysis
        if (text.includes('complex') || text.includes('advanced')) {
            requirements.complexity = 'high';
            requirements.estimatedTime *= 1.5;
        } else if (text.includes('simple') || text.includes('basic')) {
            requirements.complexity = 'low';
            requirements.estimatedTime *= 0.7;
        }
        
        // Priority analysis
        if (text.includes('urgent') || text.includes('critical')) {
            requirements.priority = 'high';
        }
    }
    
    /**
     * Find agents suitable for the task requirements
     */
    _findSuitableAgents(requirements) {
        const suitableAgents = [];
        
        for (const [agentType, capabilities] of Object.entries(this.config.agentCapabilities)) {
            const suitabilityScore = this._calculateSuitabilityScore(agentType, capabilities, requirements);
            
            if (suitabilityScore > 0) {
                suitableAgents.push({
                    agentType,
                    capabilities,
                    suitabilityScore,
                    load: this.state.agentLoadTracker.get(agentType),
                    performance: this.state.performanceMetrics.get(agentType)
                });
            }
        }
        
        // Sort by suitability score (descending)
        return suitableAgents.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
    }
    
    /**
     * Calculate suitability score for an agent
     */
    _calculateSuitabilityScore(agentType, capabilities, requirements) {
        let score = 0;
        
        // Check capability matches
        const capabilityMatches = requirements.capabilities.filter(req => 
            capabilities.capabilities.includes(req)
        ).length;
        
        if (capabilityMatches === 0) {
            return 0; // Not suitable at all
        }
        
        // Base score from capability matches
        score += capabilityMatches * 20;
        
        // Complexity match bonus
        if (capabilities.complexity === requirements.complexity) {
            score += 15;
        } else if (capabilities.complexity === 'high' && requirements.complexity === 'medium') {
            score += 10; // High complexity agents can handle medium tasks
        }
        
        // MCP tools compatibility
        const toolMatches = requirements.mcpTools.filter(tool => 
            capabilities.mcpTools.includes(tool)
        ).length;
        score += toolMatches * 5;
        
        // Performance-based adjustments
        const performance = this.state.performanceMetrics.get(agentType);
        if (performance) {
            score *= performance.successRate; // Reduce score based on failure rate
            score *= performance.efficiency || 1.0;
        }
        
        // Load-based adjustments
        const load = this.state.agentLoadTracker.get(agentType);
        if (load) {
            const loadFactor = Math.max(0.1, 1 - (load.activeeTasks / capabilities.concurrency));
            score *= loadFactor;
        }
        
        return Math.round(score);
    }
    
    /**
     * Select the best agent using the configured routing strategy
     */
    _selectBestAgent(suitableAgents, requirements, task) {
        switch (this.config.routing.strategy) {
            case 'simple':
                return this._selectSimple(suitableAgents);
            case 'priority':
                return this._selectByPriority(suitableAgents, task.priority);
            case 'load-balanced':
                return this._selectByLoadBalance(suitableAgents);
            case 'adaptive':
                return this._selectAdaptive(suitableAgents, requirements, task);
            default:
                return suitableAgents[0].agentType;
        }
    }
    
    /**
     * Simple selection - highest suitability score
     */
    _selectSimple(suitableAgents) {
        return suitableAgents[0].agentType;
    }
    
    /**
     * Priority-based selection
     */
    _selectByPriority(suitableAgents, priority) {
        // For high priority tasks, prefer agents with lower current load
        if (priority === 'critical' || priority === 'high') {
            return suitableAgents.reduce((best, current) => {
                const bestLoad = best.load.activeeTasks / best.capabilities.concurrency;
                const currentLoad = current.load.activeeTasks / current.capabilities.concurrency;
                return currentLoad < bestLoad ? current : best;
            }).agentType;
        }
        
        return this._selectSimple(suitableAgents);
    }
    
    /**
     * Load-balanced selection
     */
    _selectByLoadBalance(suitableAgents) {
        return suitableAgents.reduce((best, current) => {
            const bestLoadRatio = best.load.activeeTasks / best.capabilities.concurrency;
            const currentLoadRatio = current.load.activeeTasks / current.capabilities.concurrency;
            
            // Prefer agent with lower load ratio, but factor in suitability
            const bestScore = best.suitabilityScore * (1 - bestLoadRatio);
            const currentScore = current.suitabilityScore * (1 - currentLoadRatio);
            
            return currentScore > bestScore ? current : best;
        }).agentType;
    }
    
    /**
     * Adaptive selection - considers multiple factors
     */
    _selectAdaptive(suitableAgents, requirements, task) {
        return suitableAgents.reduce((best, current) => {
            const bestScore = this._calculateAdaptiveScore(best, requirements, task);
            const currentScore = this._calculateAdaptiveScore(current, requirements, task);
            return currentScore > bestScore ? current : best;
        }).agentType;
    }
    
    /**
     * Calculate adaptive score considering multiple factors
     */
    _calculateAdaptiveScore(agent, requirements, task) {
        let score = agent.suitabilityScore;
        
        // Load factor (prefer less loaded agents)
        const loadRatio = agent.load.activeeTasks / agent.capabilities.concurrency;
        score *= (1 - loadRatio * 0.5);
        
        // Performance factor
        score *= agent.performance.successRate;
        
        // Response time factor (prefer faster agents for urgent tasks)
        if (task.priority === 'critical' || task.priority === 'high') {
            const avgTime = agent.performance.averageResponseTime;
            const timeNormalized = Math.max(0.1, 1 - (avgTime / 600000)); // Normalize against 10 minutes
            score *= (0.8 + timeNormalized * 0.2);
        }
        
        // Specialization bonus (prefer specialized agents for their domain)
        if (this._isSpecializedForTask(agent.agentType, requirements)) {
            score *= 1.2;
        }
        
        return score;
    }
    
    /**
     * Check if agent is specialized for specific task requirements
     */
    _isSpecializedForTask(agentType, requirements) {
        const specializations = {
            'backend-dev': ['api-development', 'database-design'],
            'frontend-dev': ['ui-development', 'user-experience'],
            'devops': ['deployment', 'ci-cd', 'infrastructure'],
            'security': ['security-audit', 'vulnerability-assessment'],
            'tester': ['unit-testing', 'integration-testing'],
            'architecture': ['system-architecture', 'design-patterns']
        };
        
        const agentSpecializations = specializations[agentType] || [];
        return requirements.capabilities.some(cap => agentSpecializations.includes(cap));
    }
    
    /**
     * Update agent load tracking
     */
    _updateAgentLoad(agentType, action, duration = null) {
        const load = this.state.agentLoadTracker.get(agentType);
        if (!load) return;
        
        switch (action) {
            case 'queued':
                load.queuedTasks++;
                break;
            case 'started':
                load.queuedTasks--;
                load.activeeTasks++;
                break;
            case 'completed':
                load.activeeTasks--;
                load.completedTasks++;
                if (duration) {
                    load.averageCompletionTime = 
                        (load.averageCompletionTime * (load.completedTasks - 1) + duration) / 
                        load.completedTasks;
                }
                break;
            case 'failed':
                load.activeeTasks--;
                break;
        }
        
        load.lastUpdate = Date.now();
    }
    
    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(agentType, success, responseTime, error = null) {
        const metrics = this.state.performanceMetrics.get(agentType);
        if (!metrics) return;
        
        metrics.totalTasks++;
        
        if (success) {
            metrics.averageResponseTime = 
                (metrics.averageResponseTime * (metrics.totalTasks - 1) + responseTime) / 
                metrics.totalTasks;
        } else {
            metrics.failedTasks++;
            if (error && error.message && error.message.includes('timeout')) {
                metrics.timeouts++;
            }
        }
        
        metrics.successRate = (metrics.totalTasks - metrics.failedTasks) / metrics.totalTasks;
        
        // Update efficiency based on performance trend
        const expectedTime = this.config.agentCapabilities[agentType]?.estimatedTime * 1000 || 120000;
        metrics.efficiency = Math.max(0.1, Math.min(2.0, expectedTime / metrics.averageResponseTime));
        
        this._updateAgentLoad(agentType, success ? 'completed' : 'failed', responseTime);
    }
    
    /**
     * Get routing statistics
     */
    getRoutingStatistics() {
        const agentStats = {};
        
        for (const [agentType, load] of this.state.agentLoadTracker) {
            const performance = this.state.performanceMetrics.get(agentType);
            const capabilities = this.config.agentCapabilities[agentType];
            
            agentStats[agentType] = {
                load: {
                    active: load.activeeTasks,
                    queued: load.queuedTasks,
                    completed: load.completedTasks,
                    utilization: load.activeeTasks / capabilities.concurrency
                },
                performance: {
                    successRate: performance.successRate,
                    averageResponseTime: performance.averageResponseTime,
                    efficiency: performance.efficiency || 1.0,
                    totalTasks: performance.totalTasks
                }
            };
        }
        
        return {
            totalDecisions: this.state.routingDecisions.size,
            agentStatistics: agentStats,
            strategyUsed: this.config.routing.strategy,
            queueSize: this.state.taskQueue.length
        };
    }
    
    /**
     * Get task routing history
     */
    getRoutingHistory(limit = 100) {
        return Array.from(this.state.routingDecisions.values())
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }
    
    /**
     * Clear routing history and reset metrics
     */
    resetMetrics() {
        this.state.routingDecisions.clear();
        this.state.routingHistory = [];
        this._initializeLoadTracking();
        this.logger.info('📊 Routing metrics reset');
    }
    
    /**
     * Create logger instance
     */
    _createLogger() {
        return {
            info: (message, ...args) => console.log(`[TaskRouter] ${message}`, ...args),
            warn: (message, ...args) => console.warn(`[TaskRouter] ${message}`, ...args),
            error: (message, ...args) => console.error(`[TaskRouter] ${message}`, ...args),
            debug: (message, ...args) => console.debug(`[TaskRouter] ${message}`, ...args)
        };
    }
}

module.exports = TaskRouter;