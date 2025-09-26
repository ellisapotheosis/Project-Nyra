/**
 * SPARC Integrator - Bridges Archon orchestration with SPARC methodology
 * 
 * Provides specialized coordination for SPARC workflows:
 * - Specification phase coordination
 * - Pseudocode generation orchestration
 * - Architecture design coordination
 * - Refinement and implementation coordination
 * - Completion and validation coordination
 */

const { EventEmitter } = require('events');

class SPARCIntegrator extends EventEmitter {
    constructor(orchestrationManager, config = {}) {
        super();
        
        this.orchestration = orchestrationManager;
        this.config = {
            // SPARC Phase Configuration
            phases: {
                specification: {
                    agents: ['specification', 'planner', 'researcher'],
                    timeout: 600000, // 10 minutes
                    requiredOutputs: ['requirements', 'use-cases', 'constraints'],
                    validationRequired: true
                },
                pseudocode: {
                    agents: ['pseudocode', 'architecture'],
                    timeout: 480000, // 8 minutes
                    requiredOutputs: ['algorithms', 'data-structures', 'flow-diagrams'],
                    validationRequired: true,
                    dependencies: ['specification']
                },
                architecture: {
                    agents: ['architecture', 'backend-dev', 'frontend-dev'],
                    timeout: 900000, // 15 minutes
                    requiredOutputs: ['system-design', 'technology-stack', 'api-contracts'],
                    validationRequired: true,
                    dependencies: ['specification', 'pseudocode']
                },
                refinement: {
                    agents: ['refinement', 'coder', 'tester'],
                    timeout: 1200000, // 20 minutes
                    requiredOutputs: ['test-cases', 'implementation-plan', 'quality-metrics'],
                    validationRequired: true,
                    dependencies: ['architecture']
                },
                completion: {
                    agents: ['coder', 'tester', 'reviewer', 'devops'],
                    timeout: 1800000, // 30 minutes
                    requiredOutputs: ['implementation', 'tests', 'documentation', 'deployment'],
                    validationRequired: true,
                    dependencies: ['refinement']
                }
            },
            
            // Coordination Hooks
            hooks: {
                enabled: true,
                sessionPrefix: 'sparc',
                memoryNamespace: 'sparc-workflow',
                notificationChannels: ['claude-flow', 'desktop-commander']
            },
            
            // Quality Gates
            qualityGates: {
                specification: {
                    minimumRequirements: 5,
                    stakeholderApproval: false,
                    completenessCheck: true
                },
                pseudocode: {
                    algorithmValidation: true,
                    complexityAnalysis: true,
                    logicVerification: true
                },
                architecture: {
                    designPatterns: true,
                    scalabilityAssessment: true,
                    technologyCompatibility: true
                },
                refinement: {
                    testCoverage: 0.8,
                    codeQuality: 'high',
                    performanceRequirements: true
                },
                completion: {
                    allTestsPassing: true,
                    documentationComplete: true,
                    deploymentReady: true
                }
            },
            
            ...config
        };
        
        this.state = {
            activeSPARCWorkflows: new Map(),
            phaseMetrics: new Map(),
            coordinationHistory: []
        };
        
        // Initialize phase metrics
        this._initializePhaseMetrics();
        
        this.logger = this._createLogger();
    }
    
    /**
     * Initialize metrics tracking for all SPARC phases
     */
    _initializePhaseMetrics() {
        for (const [phaseName, phaseConfig] of Object.entries(this.config.phases)) {
            this.state.phaseMetrics.set(phaseName, {
                totalExecutions: 0,
                successfulExecutions: 0,
                averageDuration: phaseConfig.timeout / 2, // Start with half timeout as estimate
                qualityGateFailures: 0,
                commonIssues: []
            });
        }
    }
    
    /**
     * Execute a complete SPARC workflow with coordination
     */
    async executeSPARCWorkflow(projectDefinition, options = {}) {
        const workflowId = this._generateWorkflowId();
        
        const workflow = {
            id: workflowId,
            projectDefinition,
            options: {
                strictMode: options.strictMode !== false, // Default to strict
                enableHooks: options.enableHooks !== false,
                qualityGatesEnabled: options.qualityGatesEnabled !== false,
                concurrentPhases: options.concurrentPhases || false,
                ...options
            },
            state: {
                currentPhase: null,
                completedPhases: [],
                phaseResults: new Map(),
                qualityGateResults: new Map(),
                errors: [],
                warnings: [],
                startTime: Date.now(),
                endTime: null,
                status: 'running'
            }
        };
        
        this.state.activeSPARCWorkflows.set(workflowId, workflow);
        
        try {
            this.logger.info(`🎯 Starting SPARC workflow ${workflowId}: ${projectDefinition.name}`);
            
            // Execute coordination hooks
            if (workflow.options.enableHooks) {
                await this._executePreWorkflowHooks(workflow);
            }
            
            // Execute SPARC phases
            if (workflow.options.concurrentPhases) {
                await this._executePhasesParallel(workflow);
            } else {
                await this._executePhasesSequential(workflow);
            }
            
            // Final validation and completion
            await this._completeWorkflow(workflow);
            
            workflow.state.status = 'completed';
            workflow.state.endTime = Date.now();
            
            this.logger.info(`✅ SPARC workflow ${workflowId} completed successfully`);
            this.emit('sparc:workflow:completed', { workflowId, workflow });
            
            return {
                workflowId,
                results: Object.fromEntries(workflow.state.phaseResults),
                duration: workflow.state.endTime - workflow.state.startTime,
                qualityGates: Object.fromEntries(workflow.state.qualityGateResults)
            };
            
        } catch (error) {
            workflow.state.status = 'failed';
            workflow.state.endTime = Date.now();
            workflow.state.errors.push(error.message);
            
            this.logger.error(`❌ SPARC workflow ${workflowId} failed:`, error);
            this.emit('sparc:workflow:failed', { workflowId, workflow, error });
            
            throw error;
        } finally {
            // Execute post-workflow hooks
            if (workflow.options.enableHooks) {
                await this._executePostWorkflowHooks(workflow);
            }
            
            // Archive workflow after some time
            setTimeout(() => {
                this.state.activeSPARCWorkflows.delete(workflowId);
            }, 3600000); // 1 hour
        }
    }
    
    /**
     * Execute SPARC phases sequentially
     */
    async _executePhasesSequential(workflow) {
        const phases = ['specification', 'pseudocode', 'architecture', 'refinement', 'completion'];
        
        for (const phaseName of phases) {
            await this._executePhase(workflow, phaseName);
        }
    }
    
    /**
     * Execute SPARC phases with intelligent parallelization
     */
    async _executePhasesParallel(workflow) {
        // Build dependency graph
        const dependencyGraph = this._buildPhaseDependencyGraph();
        
        // Execute phases in dependency order with parallelization
        const executed = new Set();
        const phases = Object.keys(this.config.phases);
        
        while (executed.size < phases.length) {
            // Find phases ready to execute
            const readyPhases = phases.filter(phase => 
                !executed.has(phase) && 
                (this.config.phases[phase].dependencies || []).every(dep => executed.has(dep))
            );
            
            if (readyPhases.length === 0) {
                throw new Error('Circular dependency detected in SPARC phases');
            }
            
            // Execute ready phases in parallel
            await Promise.all(readyPhases.map(phase => this._executePhase(workflow, phase)));
            
            // Mark as executed
            readyPhases.forEach(phase => executed.add(phase));
        }
    }
    
    /**
     * Execute a single SPARC phase
     */
    async _executePhase(workflow, phaseName) {
        const phaseConfig = this.config.phases[phaseName];
        if (!phaseConfig) {
            throw new Error(`Unknown SPARC phase: ${phaseName}`);
        }
        
        this.logger.info(`🔄 Executing SPARC phase: ${phaseName}`);
        workflow.state.currentPhase = phaseName;
        
        const phaseStartTime = Date.now();
        
        try {
            // Execute pre-phase hooks
            if (workflow.options.enableHooks) {
                await this._executePrePhaseHooks(workflow, phaseName);
            }
            
            // Create phase tasks
            const phaseTasks = await this._createPhaseTasks(workflow, phaseName, phaseConfig);
            
            // Execute tasks with coordination
            const phaseResults = await this._executePhaseTasks(workflow, phaseName, phaseTasks);
            
            // Store phase results
            workflow.state.phaseResults.set(phaseName, phaseResults);
            
            // Execute quality gates
            if (workflow.options.qualityGatesEnabled) {
                await this._executeQualityGate(workflow, phaseName, phaseResults);
            }
            
            // Execute post-phase hooks
            if (workflow.options.enableHooks) {
                await this._executePostPhaseHooks(workflow, phaseName, phaseResults);
            }
            
            // Update metrics
            const phaseDuration = Date.now() - phaseStartTime;
            this._updatePhaseMetrics(phaseName, true, phaseDuration);
            
            workflow.state.completedPhases.push(phaseName);
            
            this.logger.info(`✅ SPARC phase ${phaseName} completed in ${phaseDuration}ms`);
            this.emit('sparc:phase:completed', { 
                workflowId: workflow.id, 
                phaseName, 
                results: phaseResults,
                duration: phaseDuration
            });
            
        } catch (error) {
            const phaseDuration = Date.now() - phaseStartTime;
            this._updatePhaseMetrics(phaseName, false, phaseDuration);
            
            workflow.state.errors.push(`Phase ${phaseName}: ${error.message}`);
            
            this.logger.error(`❌ SPARC phase ${phaseName} failed:`, error);
            this.emit('sparc:phase:failed', { 
                workflowId: workflow.id, 
                phaseName, 
                error,
                duration: phaseDuration
            });
            
            if (workflow.options.strictMode) {
                throw error;
            } else {
                // Continue with warnings in non-strict mode
                workflow.state.warnings.push(`Phase ${phaseName} failed but continuing: ${error.message}`);
            }
        } finally {
            workflow.state.currentPhase = null;
        }
    }
    
    /**
     * Create tasks for a specific SPARC phase
     */
    async _createPhaseTasks(workflow, phaseName, phaseConfig) {
        const tasks = [];
        const phaseContext = this._buildPhaseContext(workflow, phaseName);
        
        for (const agentType of phaseConfig.agents) {
            const task = {
                id: `${workflow.id}-${phaseName}-${agentType}`,
                phase: phaseName,
                agentType,
                payload: {
                    workflowId: workflow.id,
                    phase: phaseName,
                    projectDefinition: workflow.projectDefinition,
                    context: phaseContext,
                    requiredOutputs: phaseConfig.requiredOutputs,
                    previousResults: Object.fromEntries(workflow.state.phaseResults)
                },
                priority: 'high',
                timeout: phaseConfig.timeout,
                options: {
                    enableCoordination: true,
                    sessionId: `sparc-${workflow.id}`,
                    memoryNamespace: `${this.config.hooks.memoryNamespace}/${workflow.id}`
                }
            };
            
            tasks.push(task);
        }
        
        return tasks;
    }
    
    /**
     * Execute tasks for a SPARC phase with coordination
     */
    async _executePhaseTasks(workflow, phaseName, tasks) {
        const taskPromises = [];
        const results = {};
        
        // Queue all tasks concurrently
        for (const task of tasks) {
            const taskPromise = this._executePhaseTask(task)
                .then(result => {
                    results[task.agentType] = result;
                })
                .catch(error => {
                    results[task.agentType] = { 
                        status: 'failed', 
                        error: error.message 
                    };
                    throw error;
                });
            
            taskPromises.push(taskPromise);
        }
        
        // Wait for all tasks to complete
        await Promise.allSettled(taskPromises);
        
        // Validate that we have required results
        const successfulResults = Object.values(results).filter(r => r.status !== 'failed');
        if (successfulResults.length === 0) {
            throw new Error(`All agents failed in phase ${phaseName}`);
        }
        
        return results;
    }
    
    /**
     * Execute a single phase task with coordination
     */
    async _executePhaseTask(task) {
        try {
            // Queue task through orchestration layer
            const taskId = await this.orchestration.queueTask(
                task.agentType,
                task.payload,
                task.options
            );
            
            // Wait for task completion (mock for now)
            return await this._waitForTaskCompletion(taskId, task.timeout);
            
        } catch (error) {
            this.logger.error(`Task execution failed (${task.id}):`, error);
            throw error;
        }
    }
    
    /**
     * Wait for task completion (mock implementation)
     */
    async _waitForTaskCompletion(taskId, timeout) {
        return new Promise((resolve, reject) => {
            const timeoutHandle = setTimeout(() => {
                reject(new Error(`Task ${taskId} timed out after ${timeout}ms`));
            }, timeout);
            
            // Mock completion
            const completionTime = Math.random() * timeout * 0.7 + timeout * 0.1; // 10-80% of timeout
            setTimeout(() => {
                clearTimeout(timeoutHandle);
                resolve({
                    taskId,
                    status: 'completed',
                    output: `Task ${taskId} completed successfully`,
                    artifacts: ['file1.js', 'file2.md'],
                    duration: completionTime,
                    timestamp: Date.now()
                });
            }, completionTime);
        });
    }
    
    /**
     * Execute quality gate for a phase
     */
    async _executeQualityGate(workflow, phaseName, phaseResults) {
        const qualityGate = this.config.qualityGates[phaseName];
        if (!qualityGate) {
            return;
        }
        
        this.logger.info(`🛡️ Executing quality gate for ${phaseName}`);
        
        const gateResults = {
            phase: phaseName,
            passed: true,
            checks: {},
            timestamp: Date.now()
        };
        
        // Execute quality checks based on phase
        switch (phaseName) {
            case 'specification':
                gateResults.checks = await this._executeSpecificationQualityGate(qualityGate, phaseResults);
                break;
            case 'pseudocode':
                gateResults.checks = await this._executePseudocodeQualityGate(qualityGate, phaseResults);
                break;
            case 'architecture':
                gateResults.checks = await this._executeArchitectureQualityGate(qualityGate, phaseResults);
                break;
            case 'refinement':
                gateResults.checks = await this._executeRefinementQualityGate(qualityGate, phaseResults);
                break;
            case 'completion':
                gateResults.checks = await this._executeCompletionQualityGate(qualityGate, phaseResults);
                break;
        }
        
        // Determine if gate passed
        gateResults.passed = Object.values(gateResults.checks).every(check => check.passed);
        
        workflow.state.qualityGateResults.set(phaseName, gateResults);
        
        if (!gateResults.passed) {
            const failedChecks = Object.entries(gateResults.checks)
                .filter(([_, check]) => !check.passed)
                .map(([name, check]) => `${name}: ${check.message}`)
                .join(', ');
            
            this._updatePhaseMetrics(phaseName, false, 0, 'quality-gate-failure');
            
            if (workflow.options.strictMode) {
                throw new Error(`Quality gate failed for ${phaseName}: ${failedChecks}`);
            } else {
                workflow.state.warnings.push(`Quality gate failed for ${phaseName}: ${failedChecks}`);
            }
        } else {
            this.logger.info(`✅ Quality gate passed for ${phaseName}`);
        }
    }
    
    /**
     * Execute specification quality gate checks
     */
    async _executeSpecificationQualityGate(gate, results) {
        const checks = {};
        
        // Check minimum requirements
        checks.minimumRequirements = {
            passed: this._countRequirements(results) >= gate.minimumRequirements,
            message: `Found ${this._countRequirements(results)} requirements, minimum ${gate.minimumRequirements}`
        };
        
        // Check completeness
        if (gate.completenessCheck) {
            checks.completeness = {
                passed: this._checkSpecificationCompleteness(results),
                message: 'Specification completeness validation'
            };
        }
        
        return checks;
    }
    
    /**
     * Execute pseudocode quality gate checks
     */
    async _executePseudocodeQualityGate(gate, results) {
        const checks = {};
        
        if (gate.algorithmValidation) {
            checks.algorithmValidation = {
                passed: this._validateAlgorithms(results),
                message: 'Algorithm structure and logic validation'
            };
        }
        
        if (gate.logicVerification) {
            checks.logicVerification = {
                passed: this._verifyLogic(results),
                message: 'Logic flow and consistency verification'
            };
        }
        
        return checks;
    }
    
    /**
     * Execute architecture quality gate checks
     */
    async _executeArchitectureQualityGate(gate, results) {
        const checks = {};
        
        if (gate.designPatterns) {
            checks.designPatterns = {
                passed: this._validateDesignPatterns(results),
                message: 'Design patterns and architectural principles validation'
            };
        }
        
        if (gate.scalabilityAssessment) {
            checks.scalability = {
                passed: this._assessScalability(results),
                message: 'Scalability and performance assessment'
            };
        }
        
        return checks;
    }
    
    /**
     * Execute refinement quality gate checks
     */
    async _executeRefinementQualityGate(gate, results) {
        const checks = {};
        
        if (gate.testCoverage) {
            const coverage = this._calculateTestCoverage(results);
            checks.testCoverage = {
                passed: coverage >= gate.testCoverage,
                message: `Test coverage ${coverage}, required ${gate.testCoverage}`
            };
        }
        
        if (gate.codeQuality) {
            checks.codeQuality = {
                passed: this._assessCodeQuality(results) >= gate.codeQuality,
                message: 'Code quality assessment'
            };
        }
        
        return checks;
    }
    
    /**
     * Execute completion quality gate checks
     */
    async _executeCompletionQualityGate(gate, results) {
        const checks = {};
        
        if (gate.allTestsPassing) {
            checks.testsPass = {
                passed: this._checkAllTestsPass(results),
                message: 'All tests must be passing'
            };
        }
        
        if (gate.documentationComplete) {
            checks.documentation = {
                passed: this._checkDocumentationComplete(results),
                message: 'Documentation completeness check'
            };
        }
        
        if (gate.deploymentReady) {
            checks.deploymentReady = {
                passed: this._checkDeploymentReady(results),
                message: 'Deployment readiness check'
            };
        }
        
        return checks;
    }
    
    // Quality gate helper methods (mock implementations)
    _countRequirements(results) { return Math.floor(Math.random() * 10) + 5; }
    _checkSpecificationCompleteness(results) { return Math.random() > 0.2; }
    _validateAlgorithms(results) { return Math.random() > 0.1; }
    _verifyLogic(results) { return Math.random() > 0.15; }
    _validateDesignPatterns(results) { return Math.random() > 0.1; }
    _assessScalability(results) { return Math.random() > 0.2; }
    _calculateTestCoverage(results) { return Math.random() * 0.4 + 0.6; }
    _assessCodeQuality(results) { return Math.random() > 0.15 ? 'high' : 'medium'; }
    _checkAllTestsPass(results) { return Math.random() > 0.1; }
    _checkDocumentationComplete(results) { return Math.random() > 0.2; }
    _checkDeploymentReady(results) { return Math.random() > 0.15; }
    
    /**
     * Execute pre-workflow coordination hooks
     */
    async _executePreWorkflowHooks(workflow) {
        const hookData = {
            workflowId: workflow.id,
            projectName: workflow.projectDefinition.name,
            sessionId: `sparc-${workflow.id}`
        };
        
        // Execute coordination hooks via MCP
        await this._executeCoordinationHook('pre-workflow', hookData);
    }
    
    /**
     * Execute post-workflow coordination hooks
     */
    async _executePostWorkflowHooks(workflow) {
        const hookData = {
            workflowId: workflow.id,
            status: workflow.state.status,
            duration: workflow.state.endTime - workflow.state.startTime,
            sessionId: `sparc-${workflow.id}`
        };
        
        await this._executeCoordinationHook('post-workflow', hookData);
    }
    
    /**
     * Execute pre-phase coordination hooks
     */
    async _executePrePhaseHooks(workflow, phaseName) {
        const hookData = {
            workflowId: workflow.id,
            phase: phaseName,
            sessionId: `sparc-${workflow.id}`,
            description: `Starting SPARC ${phaseName} phase`
        };
        
        await this._executeCoordinationHook('pre-phase', hookData);
    }
    
    /**
     * Execute post-phase coordination hooks
     */
    async _executePostPhaseHooks(workflow, phaseName, results) {
        const hookData = {
            workflowId: workflow.id,
            phase: phaseName,
            results,
            sessionId: `sparc-${workflow.id}`
        };
        
        await this._executeCoordinationHook('post-phase', hookData);
    }
    
    /**
     * Execute coordination hook via MCP
     */
    async _executeCoordinationHook(hookType, data) {
        try {
            // Execute hooks through MCP integration
            for (const channel of this.config.hooks.notificationChannels) {
                await this.orchestration.executeMCPTool(
                    'workflow-coordination',
                    `hooks_${hookType.replace('-', '_')}`,
                    data,
                    { preferredServer: channel }
                );
            }
        } catch (error) {
            this.logger.warn(`Hook execution failed (${hookType}):`, error.message);
            // Don't fail the workflow for hook failures
        }
    }
    
    /**
     * Build phase context for agents
     */
    _buildPhaseContext(workflow, phaseName) {
        return {
            workflowId: workflow.id,
            projectName: workflow.projectDefinition.name,
            currentPhase: phaseName,
            completedPhases: workflow.state.completedPhases,
            previousResults: Object.fromEntries(workflow.state.phaseResults),
            sparc: {
                methodology: 'SPARC',
                phase: phaseName,
                qualityGatesEnabled: workflow.options.qualityGatesEnabled,
                strictMode: workflow.options.strictMode
            }
        };
    }
    
    /**
     * Complete workflow with final validation
     */
    async _completeWorkflow(workflow) {
        // Validate all phases completed
        const requiredPhases = Object.keys(this.config.phases);
        const missingPhases = requiredPhases.filter(phase => !workflow.state.completedPhases.includes(phase));
        
        if (missingPhases.length > 0) {
            throw new Error(`Missing required phases: ${missingPhases.join(', ')}`);
        }
        
        // Generate final artifacts
        const finalArtifacts = this._generateFinalArtifacts(workflow);
        workflow.state.finalArtifacts = finalArtifacts;
        
        this.logger.info(`📦 Generated ${finalArtifacts.length} final artifacts`);
    }
    
    /**
     * Generate final artifacts from all phases
     */
    _generateFinalArtifacts(workflow) {
        const artifacts = [];
        
        for (const [phase, results] of workflow.state.phaseResults) {
            if (results && typeof results === 'object') {
                Object.entries(results).forEach(([agent, result]) => {
                    if (result.artifacts) {
                        artifacts.push(...result.artifacts.map(artifact => ({
                            phase,
                            agent,
                            artifact,
                            timestamp: result.timestamp
                        })));
                    }
                });
            }
        }
        
        return artifacts;
    }
    
    /**
     * Update phase metrics
     */
    _updatePhaseMetrics(phaseName, success, duration, issueType = null) {
        const metrics = this.state.phaseMetrics.get(phaseName);
        if (!metrics) return;
        
        metrics.totalExecutions++;
        
        if (success) {
            metrics.successfulExecutions++;
            metrics.averageDuration = (metrics.averageDuration * (metrics.successfulExecutions - 1) + duration) / metrics.successfulExecutions;
        } else {
            if (issueType === 'quality-gate-failure') {
                metrics.qualityGateFailures++;
            }
            
            if (issueType && !metrics.commonIssues.includes(issueType)) {
                metrics.commonIssues.push(issueType);
            }
        }
    }
    
    /**
     * Get SPARC workflow status
     */
    getSPARCWorkflowStatus(workflowId) {
        const workflow = this.state.activeSPARCWorkflows.get(workflowId);
        if (!workflow) {
            return null;
        }
        
        return {
            id: workflow.id,
            projectName: workflow.projectDefinition.name,
            status: workflow.state.status,
            currentPhase: workflow.state.currentPhase,
            completedPhases: workflow.state.completedPhases,
            progress: workflow.state.completedPhases.length / Object.keys(this.config.phases).length,
            duration: (workflow.state.endTime || Date.now()) - workflow.state.startTime,
            errors: workflow.state.errors,
            warnings: workflow.state.warnings
        };
    }
    
    /**
     * Get SPARC metrics
     */
    getSPARCMetrics() {
        return {
            activeWorkflows: this.state.activeSPARCWorkflows.size,
            phaseMetrics: Object.fromEntries(this.state.phaseMetrics),
            totalWorkflows: this.state.coordinationHistory.length
        };
    }
    
    /**
     * Build phase dependency graph
     */
    _buildPhaseDependencyGraph() {
        const graph = {};
        
        for (const [phaseName, phaseConfig] of Object.entries(this.config.phases)) {
            graph[phaseName] = phaseConfig.dependencies || [];
        }
        
        return graph;
    }
    
    /**
     * Generate unique workflow ID
     */
    _generateWorkflowId() {
        return `sparc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Create logger instance
     */
    _createLogger() {
        return {
            info: (message, ...args) => console.log(`[SPARCIntegrator] ${message}`, ...args),
            warn: (message, ...args) => console.warn(`[SPARCIntegrator] ${message}`, ...args),
            error: (message, ...args) => console.error(`[SPARCIntegrator] ${message}`, ...args),
            debug: (message, ...args) => console.debug(`[SPARCIntegrator] ${message}`, ...args)
        };
    }
}

module.exports = SPARCIntegrator;