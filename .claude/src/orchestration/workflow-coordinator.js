/**
 * Workflow Coordinator - Manages complex multi-agent workflows for SPARC methodology
 * 
 * Coordinates workflows across multiple agents with proper sequencing, dependencies,
 * and error handling. Integrates with Archon orchestrator for agent pool management.
 */

const { EventEmitter } = require('events');

class WorkflowCoordinator extends EventEmitter {
    constructor(archonOrchestrator, config = {}) {
        super();
        
        this.archon = archonOrchestrator;
        this.config = {
            // Workflow defaults
            maxConcurrency: 6,
            timeoutMs: 300000, // 5 minutes
            retryAttempts: 2,
            
            // SPARC workflow templates
            sparcTemplates: {
                'full-tdd': {
                    name: 'Full TDD with SPARC',
                    phases: [
                        { name: 'specification', agents: ['specification'], dependencies: [] },
                        { name: 'pseudocode', agents: ['pseudocode'], dependencies: ['specification'] },
                        { name: 'architecture', agents: ['architecture'], dependencies: ['specification', 'pseudocode'] },
                        { name: 'refinement', agents: ['refinement', 'tester'], dependencies: ['architecture'] },
                        { name: 'implementation', agents: ['coder', 'reviewer'], dependencies: ['refinement'] },
                        { name: 'integration', agents: ['tester', 'reviewer'], dependencies: ['implementation'] }
                    ]
                },
                'rapid-prototype': {
                    name: 'Rapid Prototyping',
                    phases: [
                        { name: 'research', agents: ['researcher'], dependencies: [] },
                        { name: 'design', agents: ['architecture'], dependencies: ['research'] },
                        { name: 'implement', agents: ['coder', 'frontend-dev'], dependencies: ['design'] },
                        { name: 'validate', agents: ['tester'], dependencies: ['implement'] }
                    ]
                },
                'full-stack-app': {
                    name: 'Full Stack Application',
                    phases: [
                        { name: 'requirements', agents: ['planner', 'researcher'], dependencies: [] },
                        { name: 'architecture', agents: ['architecture'], dependencies: ['requirements'] },
                        { name: 'backend', agents: ['backend-dev'], dependencies: ['architecture'] },
                        { name: 'frontend', agents: ['frontend-dev'], dependencies: ['architecture'] },
                        { name: 'integration', agents: ['tester', 'devops'], dependencies: ['backend', 'frontend'] },
                        { name: 'security', agents: ['security', 'reviewer'], dependencies: ['integration'] }
                    ]
                }
            },
            
            ...config
        };
        
        this.state = {
            activeWorkflows: new Map(),
            workflowHistory: [],
            metrics: {
                totalWorkflows: 0,
                successfulWorkflows: 0,
                averageDuration: 0
            }
        };
        
        this.logger = this._createLogger();
    }
    
    /**
     * Create a new workflow from a template or custom definition
     */
    async createWorkflow(templateName, taskDefinition, options = {}) {
        const workflowId = this._generateWorkflowId();
        
        let workflowDef;
        if (this.config.sparcTemplates[templateName]) {
            workflowDef = this._createWorkflowFromTemplate(templateName, taskDefinition);
        } else {
            throw new Error(`Unknown workflow template: ${templateName}`);
        }
        
        const workflow = {
            id: workflowId,
            name: workflowDef.name,
            task: taskDefinition,
            phases: workflowDef.phases,
            options: {
                maxConcurrency: options.maxConcurrency || this.config.maxConcurrency,
                timeout: options.timeout || this.config.timeoutMs,
                retries: options.retries || this.config.retryAttempts,
                ...options
            },
            state: {
                status: 'created',
                currentPhase: null,
                completedPhases: [],
                failedPhases: [],
                activeAgents: new Map(),
                results: new Map(),
                errors: [],
                startTime: null,
                endTime: null
            }
        };
        
        this.state.activeWorkflows.set(workflowId, workflow);
        this.logger.info(`📋 Created workflow ${workflowId}: ${workflow.name}`);
        
        return workflowId;
    }
    
    /**
     * Execute a workflow with proper coordination and error handling
     */
    async executeWorkflow(workflowId) {
        const workflow = this.state.activeWorkflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Workflow ${workflowId} not found`);
        }
        
        this.logger.info(`🚀 Starting workflow ${workflowId}: ${workflow.name}`);
        
        try {
            workflow.state.status = 'running';
            workflow.state.startTime = Date.now();
            
            this.emit('workflow:started', { workflowId, workflow });
            
            // Execute phases in dependency order
            const phaseOrder = this._calculatePhaseExecutionOrder(workflow.phases);
            
            for (const phaseName of phaseOrder) {
                await this._executePhase(workflow, phaseName);
            }
            
            // Mark workflow as completed
            workflow.state.status = 'completed';
            workflow.state.endTime = Date.now();
            
            this.logger.info(`✅ Workflow ${workflowId} completed successfully`);
            this.emit('workflow:completed', { workflowId, workflow });
            
            // Move to history
            this._archiveWorkflow(workflowId);
            
            return workflow.state.results;
            
        } catch (error) {
            workflow.state.status = 'failed';
            workflow.state.endTime = Date.now();
            workflow.state.errors.push(error.message);
            
            this.logger.error(`❌ Workflow ${workflowId} failed:`, error);
            this.emit('workflow:failed', { workflowId, workflow, error });
            
            throw error;
        }
    }
    
    /**
     * Execute a single phase of the workflow
     */
    async _executePhase(workflow, phaseName) {
        const phase = workflow.phases.find(p => p.name === phaseName);
        if (!phase) {
            throw new Error(`Phase ${phaseName} not found in workflow`);
        }
        
        this.logger.info(`🎯 Executing phase: ${phaseName}`);
        workflow.state.currentPhase = phaseName;
        
        // Check dependencies
        for (const dependency of phase.dependencies) {
            if (!workflow.state.completedPhases.includes(dependency)) {
                throw new Error(`Phase ${phaseName} dependency ${dependency} not completed`);
            }
        }
        
        try {
            // Execute agents for this phase
            const phaseResults = await this._executePhaseAgents(workflow, phase);
            
            // Store results
            workflow.state.results.set(phaseName, phaseResults);
            workflow.state.completedPhases.push(phaseName);
            
            this.logger.info(`✅ Phase ${phaseName} completed`);
            this.emit('workflow:phase:completed', { 
                workflowId: workflow.id, 
                phaseName, 
                results: phaseResults 
            });
            
        } catch (error) {
            workflow.state.failedPhases.push(phaseName);
            this.logger.error(`❌ Phase ${phaseName} failed:`, error);
            
            this.emit('workflow:phase:failed', { 
                workflowId: workflow.id, 
                phaseName, 
                error 
            });
            
            throw error;
        } finally {
            workflow.state.currentPhase = null;
        }
    }
    
    /**
     * Execute all agents for a specific phase
     */
    async _executePhaseAgents(workflow, phase) {
        const agentTasks = [];
        const phaseResults = {};
        
        // Create tasks for each agent in the phase
        for (const agentType of phase.agents) {
            const taskPayload = {
                workflowId: workflow.id,
                phase: phase.name,
                task: workflow.task,
                context: this._buildAgentContext(workflow, phase, agentType),
                options: workflow.options
            };
            
            // Queue the task
            const taskId = this.archon.queueTask(agentType, taskPayload);
            agentTasks.push({
                agentType,
                taskId,
                promise: this._waitForTaskCompletion(taskId)
            });
            
            workflow.state.activeAgents.set(agentType, taskId);
        }
        
        // Wait for all agent tasks to complete
        const results = await Promise.allSettled(agentTasks.map(task => task.promise));
        
        // Process results
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const agentTask = agentTasks[i];
            
            workflow.state.activeAgents.delete(agentTask.agentType);
            
            if (result.status === 'fulfilled') {
                phaseResults[agentTask.agentType] = result.value;
            } else {
                this.logger.error(`Agent ${agentTask.agentType} failed:`, result.reason);
                phaseResults[agentTask.agentType] = {
                    status: 'failed',
                    error: result.reason.message
                };
            }
        }
        
        return phaseResults;
    }
    
    /**
     * Build context for agent execution
     */
    _buildAgentContext(workflow, phase, agentType) {
        const context = {
            workflowId: workflow.id,
            workflowName: workflow.name,
            currentPhase: phase.name,
            taskDefinition: workflow.task,
            completedPhases: workflow.state.completedPhases,
            previousResults: Object.fromEntries(workflow.state.results),
            agentType,
            timestamp: Date.now()
        };
        
        // Add coordination hooks if enabled
        if (workflow.options.coordinationHooks) {
            context.hooks = {
                preTask: `npx claude-flow@alpha hooks pre-task --description "${phase.name}: ${agentType}"`,
                postTask: `npx claude-flow@alpha hooks post-task --task-id "${workflow.id}-${phase.name}"`,
                sessionRestore: `npx claude-flow@alpha hooks session-restore --session-id "workflow-${workflow.id}"`
            };
        }
        
        return context;
    }
    
    /**
     * Wait for a task to complete
     */
    async _waitForTaskCompletion(taskId) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Task ${taskId} timed out`));
            }, this.config.timeoutMs);
            
            // Mock task completion - will be replaced with actual task tracking
            const completionTime = Math.random() * 5000 + 2000; // 2-7 seconds
            setTimeout(() => {
                clearTimeout(timeout);
                resolve({
                    taskId,
                    status: 'completed',
                    output: `Task ${taskId} completed successfully`,
                    duration: completionTime,
                    timestamp: Date.now()
                });
            }, completionTime);
        });
    }
    
    /**
     * Calculate the execution order of phases based on dependencies
     */
    _calculatePhaseExecutionOrder(phases) {
        const order = [];
        const completed = new Set();
        const remaining = [...phases];
        
        while (remaining.length > 0) {
            const readyPhases = remaining.filter(phase => 
                phase.dependencies.every(dep => completed.has(dep))
            );
            
            if (readyPhases.length === 0) {
                throw new Error('Circular dependency detected in workflow phases');
            }
            
            // Add ready phases to order
            for (const phase of readyPhases) {
                order.push(phase.name);
                completed.add(phase.name);
                const index = remaining.indexOf(phase);
                remaining.splice(index, 1);
            }
        }
        
        return order;
    }
    
    /**
     * Create workflow from template
     */
    _createWorkflowFromTemplate(templateName, taskDefinition) {
        const template = this.config.sparcTemplates[templateName];
        if (!template) {
            throw new Error(`Template ${templateName} not found`);
        }
        
        return {
            name: `${template.name}: ${taskDefinition.name || 'Unnamed Task'}`,
            phases: template.phases.map(phase => ({
                ...phase,
                taskContext: taskDefinition
            }))
        };
    }
    
    /**
     * Archive completed workflow
     */
    _archiveWorkflow(workflowId) {
        const workflow = this.state.activeWorkflows.get(workflowId);
        if (workflow) {
            this.state.workflowHistory.push({
                ...workflow,
                archivedAt: Date.now()
            });
            
            // Update metrics
            this.state.metrics.totalWorkflows++;
            if (workflow.state.status === 'completed') {
                this.state.metrics.successfulWorkflows++;
            }
            
            const duration = workflow.state.endTime - workflow.state.startTime;
            this.state.metrics.averageDuration = 
                (this.state.metrics.averageDuration * (this.state.metrics.totalWorkflows - 1) + duration) / 
                this.state.metrics.totalWorkflows;
            
            this.state.activeWorkflows.delete(workflowId);
        }
    }
    
    /**
     * Get workflow status
     */
    getWorkflowStatus(workflowId) {
        const workflow = this.state.activeWorkflows.get(workflowId);
        if (!workflow) {
            // Check history
            const archived = this.state.workflowHistory.find(w => w.id === workflowId);
            return archived ? { ...archived, archived: true } : null;
        }
        
        return {
            id: workflow.id,
            name: workflow.name,
            status: workflow.state.status,
            currentPhase: workflow.state.currentPhase,
            completedPhases: workflow.state.completedPhases,
            progress: workflow.state.completedPhases.length / workflow.phases.length,
            activeAgents: Array.from(workflow.state.activeAgents.keys()),
            duration: workflow.state.endTime ? 
                workflow.state.endTime - workflow.state.startTime : 
                Date.now() - workflow.state.startTime
        };
    }
    
    /**
     * List all workflows (active and archived)
     */
    listWorkflows(options = {}) {
        const activeWorkflows = Array.from(this.state.activeWorkflows.values()).map(w => ({
            id: w.id,
            name: w.name,
            status: w.state.status,
            progress: w.state.completedPhases.length / w.phases.length,
            active: true
        }));
        
        const archivedWorkflows = options.includeArchived ? 
            this.state.workflowHistory.map(w => ({
                id: w.id,
                name: w.name,
                status: w.state.status,
                duration: w.state.endTime - w.state.startTime,
                active: false
            })) : [];
        
        return [...activeWorkflows, ...archivedWorkflows];
    }
    
    /**
     * Get system metrics
     */
    getMetrics() {
        return {
            ...this.state.metrics,
            activeWorkflows: this.state.activeWorkflows.size,
            archivedWorkflows: this.state.workflowHistory.length,
            successRate: this.state.metrics.totalWorkflows > 0 ? 
                this.state.metrics.successfulWorkflows / this.state.metrics.totalWorkflows : 0
        };
    }
    
    /**
     * Generate unique workflow ID
     */
    _generateWorkflowId() {
        return `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Create logger instance
     */
    _createLogger() {
        return {
            info: (message, ...args) => console.log(`[WorkflowCoordinator] ${message}`, ...args),
            warn: (message, ...args) => console.warn(`[WorkflowCoordinator] ${message}`, ...args),
            error: (message, ...args) => console.error(`[WorkflowCoordinator] ${message}`, ...args),
            debug: (message, ...args) => console.debug(`[WorkflowCoordinator] ${message}`, ...args)
        };
    }
}

module.exports = WorkflowCoordinator;