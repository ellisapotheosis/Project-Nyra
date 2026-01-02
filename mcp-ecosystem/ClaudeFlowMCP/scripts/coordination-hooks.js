#!/usr/bin/env node

/**
 * Coordination Hooks Script - Implements Claude Flow coordination hooks
 * 
 * This script provides coordination hooks that integrate with the existing
 * claude-flow hooks system while extending it for Archon orchestration.
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class CoordinationHooks {
    constructor(config = {}) {
        this.config = {
            sessionPrefix: 'archon',
            memoryPath: path.join(process.cwd(), 'memory'),
            logsPath: path.join(process.cwd(), 'logs'),
            enableClaudeFlowHooks: true,
            enableArchonHooks: true,
            enableNotifications: true,
            ...config
        };
        
        this.logger = this._createLogger();
    }
    
    /**
     * Pre-task hook - Called before agent task execution
     */
    async preTaskHook(options = {}) {
        const {
            description = 'Unknown task',
            agentType = 'unknown',
            sessionId = null,
            workflowId = null,
            priority = 'medium'
        } = options;
        
        this.logger.info(`🎯 Pre-task hook: ${description} (${agentType})`);
        
        try {
            // Create session directory if needed
            if (sessionId) {
                await this._ensureSessionDirectory(sessionId);
            }
            
            // Execute original claude-flow pre-task hook if enabled
            if (this.config.enableClaudeFlowHooks) {
                try {
                    const hookCommand = `npx claude-flow@alpha hooks pre-task --description "${description}"`;
                    this._executeCommand(hookCommand);
                    this.logger.debug('✅ Claude Flow pre-task hook executed');
                } catch (error) {
                    this.logger.warn('⚠️ Claude Flow pre-task hook failed:', error.message);
                }
            }
            
            // Archon-specific pre-task operations
            if (this.config.enableArchonHooks) {
                await this._archonPreTaskHook({
                    description,
                    agentType,
                    sessionId,
                    workflowId,
                    priority,
                    timestamp: Date.now()
                });
            }
            
            // Store task context
            if (sessionId) {
                await this._storeTaskContext(sessionId, {
                    description,
                    agentType,
                    workflowId,
                    priority,
                    startTime: Date.now()
                });
            }
            
            this.logger.info('✅ Pre-task hook completed successfully');
            
        } catch (error) {
            this.logger.error('❌ Pre-task hook failed:', error);
            throw error;
        }
    }
    
    /**
     * Post-task hook - Called after agent task execution
     */
    async postTaskHook(options = {}) {
        const {
            taskId = null,
            sessionId = null,
            workflowId = null,
            result = null,
            duration = 0,
            success = true
        } = options;
        
        this.logger.info(`🏁 Post-task hook: Task ${taskId} (${success ? 'success' : 'failed'})`);
        
        try {
            // Execute original claude-flow post-task hook if enabled
            if (this.config.enableClaudeFlowHooks && taskId) {
                try {
                    const hookCommand = `npx claude-flow@alpha hooks post-task --task-id "${taskId}"`;
                    this._executeCommand(hookCommand);
                    this.logger.debug('✅ Claude Flow post-task hook executed');
                } catch (error) {
                    this.logger.warn('⚠️ Claude Flow post-task hook failed:', error.message);
                }
            }
            
            // Archon-specific post-task operations
            if (this.config.enableArchonHooks) {
                await this._archonPostTaskHook({
                    taskId,
                    sessionId,
                    workflowId,
                    result,
                    duration,
                    success,
                    timestamp: Date.now()
                });
            }
            
            // Update task context
            if (sessionId && taskId) {
                await this._updateTaskContext(sessionId, taskId, {
                    endTime: Date.now(),
                    duration,
                    success,
                    result
                });
            }
            
            // Send notifications if enabled
            if (this.config.enableNotifications) {
                await this._sendTaskNotification({
                    taskId,
                    sessionId,
                    workflowId,
                    success,
                    duration
                });
            }
            
            this.logger.info('✅ Post-task hook completed successfully');
            
        } catch (error) {
            this.logger.error('❌ Post-task hook failed:', error);
            // Don't throw error here to avoid disrupting task completion
        }
    }
    
    /**
     * Session restore hook - Restore session context
     */
    async sessionRestoreHook(options = {}) {
        const {
            sessionId = null,
            workflowId = null
        } = options;
        
        this.logger.info(`💾 Session restore hook: ${sessionId}`);
        
        try {
            // Execute original claude-flow session-restore hook if enabled
            if (this.config.enableClaudeFlowHooks && sessionId) {
                try {
                    const hookCommand = `npx claude-flow@alpha hooks session-restore --session-id "${sessionId}"`;
                    this._executeCommand(hookCommand);
                    this.logger.debug('✅ Claude Flow session-restore hook executed');
                } catch (error) {
                    this.logger.warn('⚠️ Claude Flow session-restore hook failed:', error.message);
                }
            }
            
            // Restore Archon session context
            if (this.config.enableArchonHooks && sessionId) {
                const sessionData = await this._restoreSessionContext(sessionId);
                this.logger.info(`📋 Restored session context: ${Object.keys(sessionData).length} items`);
                return sessionData;
            }
            
            this.logger.info('✅ Session restore hook completed');
            return {};
            
        } catch (error) {
            this.logger.error('❌ Session restore hook failed:', error);
            return {};
        }
    }
    
    /**
     * Session end hook - Clean up session
     */
    async sessionEndHook(options = {}) {
        const {
            sessionId = null,
            workflowId = null,
            exportMetrics = false
        } = options;
        
        this.logger.info(`🔚 Session end hook: ${sessionId}`);
        
        try {
            // Execute original claude-flow session-end hook if enabled
            if (this.config.enableClaudeFlowHooks && sessionId) {
                try {
                    const hookCommand = `npx claude-flow@alpha hooks session-end --export-metrics ${exportMetrics}`;
                    this._executeCommand(hookCommand);
                    this.logger.debug('✅ Claude Flow session-end hook executed');
                } catch (error) {
                    this.logger.warn('⚠️ Claude Flow session-end hook failed:', error.message);
                }
            }
            
            // Archon session cleanup
            if (this.config.enableArchonHooks && sessionId) {
                await this._cleanupSession(sessionId, { exportMetrics, workflowId });
            }
            
            this.logger.info('✅ Session end hook completed');
            
        } catch (error) {
            this.logger.error('❌ Session end hook failed:', error);
        }
    }
    
    /**
     * Notification hook - Send notifications about events
     */
    async notifyHook(options = {}) {
        const {
            message = '',
            level = 'info',
            sessionId = null,
            workflowId = null,
            data = {}
        } = options;
        
        this.logger.info(`📢 Notify hook: ${message} (${level})`);
        
        try {
            // Execute original claude-flow notify hook if enabled
            if (this.config.enableClaudeFlowHooks) {
                try {
                    const hookCommand = `npx claude-flow@alpha hooks notify --message "${message}"`;
                    this._executeCommand(hookCommand);
                    this.logger.debug('✅ Claude Flow notify hook executed');
                } catch (error) {
                    this.logger.warn('⚠️ Claude Flow notify hook failed:', error.message);
                }
            }
            
            // Archon-specific notifications
            if (this.config.enableArchonHooks) {
                await this._archonNotify({
                    message,
                    level,
                    sessionId,
                    workflowId,
                    data,
                    timestamp: Date.now()
                });
            }
            
            this.logger.info('✅ Notify hook completed');
            
        } catch (error) {
            this.logger.error('❌ Notify hook failed:', error);
        }
    }
    
    /**
     * Post-edit hook - Called after file edits
     */
    async postEditHook(options = {}) {
        const {
            file = null,
            memoryKey = null,
            sessionId = null,
            operation = 'edit'
        } = options;
        
        this.logger.info(`📝 Post-edit hook: ${file} (${operation})`);
        
        try {
            // Execute original claude-flow post-edit hook if enabled
            if (this.config.enableClaudeFlowHooks && file) {
                try {
                    const hookCommand = memoryKey ? 
                        `npx claude-flow@alpha hooks post-edit --file "${file}" --memory-key "${memoryKey}"` :
                        `npx claude-flow@alpha hooks post-edit --file "${file}"`;
                    this._executeCommand(hookCommand);
                    this.logger.debug('✅ Claude Flow post-edit hook executed');
                } catch (error) {
                    this.logger.warn('⚠️ Claude Flow post-edit hook failed:', error.message);
                }
            }
            
            // Archon-specific post-edit operations
            if (this.config.enableArchonHooks) {
                await this._archonPostEditHook({
                    file,
                    memoryKey,
                    sessionId,
                    operation,
                    timestamp: Date.now()
                });
            }
            
            this.logger.info('✅ Post-edit hook completed');
            
        } catch (error) {
            this.logger.error('❌ Post-edit hook failed:', error);
        }
    }
    
    // Archon-specific hook implementations
    
    async _archonPreTaskHook(data) {
        // Store task metrics
        await this._recordTaskMetrics('pre-task', data);
        
        // Initialize agent tracking
        await this._initializeAgentTracking(data.agentType, data.sessionId);
    }
    
    async _archonPostTaskHook(data) {
        // Record completion metrics
        await this._recordTaskMetrics('post-task', data);
        
        // Update agent performance tracking
        await this._updateAgentPerformance(data);
        
        // Store task artifacts
        if (data.result && data.result.artifacts) {
            await this._storeTaskArtifacts(data.sessionId, data.taskId, data.result.artifacts);
        }
    }
    
    async _archonNotify(data) {
        // Log to structured log file
        await this._logToFile('notifications.log', data);
        
        // Update session activity
        if (data.sessionId) {
            await this._updateSessionActivity(data.sessionId, data);
        }
    }
    
    async _archonPostEditHook(data) {
        // Track file changes
        await this._trackFileChange(data);
        
        // Update memory if key provided
        if (data.memoryKey) {
            await this._updateMemoryKey(data.memoryKey, data);
        }
    }
    
    // Utility methods
    
    async _ensureSessionDirectory(sessionId) {
        const sessionDir = path.join(this.config.memoryPath, sessionId);
        try {
            await fs.mkdir(sessionDir, { recursive: true });
        } catch (error) {
            // Directory might already exist
        }
    }
    
    async _storeTaskContext(sessionId, context) {
        const sessionDir = path.join(this.config.memoryPath, sessionId);
        const contextFile = path.join(sessionDir, 'task-context.json');
        
        try {
            let existingContext = {};
            try {
                const existing = await fs.readFile(contextFile, 'utf8');
                existingContext = JSON.parse(existing);
            } catch (error) {
                // File doesn't exist yet
            }
            
            existingContext[Date.now()] = context;
            await fs.writeFile(contextFile, JSON.stringify(existingContext, null, 2));
        } catch (error) {
            this.logger.warn('Failed to store task context:', error.message);
        }
    }
    
    async _updateTaskContext(sessionId, taskId, updateData) {
        const sessionDir = path.join(this.config.memoryPath, sessionId);
        const contextFile = path.join(sessionDir, 'task-context.json');
        
        try {
            const existing = await fs.readFile(contextFile, 'utf8');
            const context = JSON.parse(existing);
            
            // Find and update the relevant task
            Object.keys(context).forEach(timestamp => {
                const task = context[timestamp];
                if (task.taskId === taskId || task.description === updateData.description) {
                    context[timestamp] = { ...task, ...updateData };
                }
            });
            
            await fs.writeFile(contextFile, JSON.stringify(context, null, 2));
        } catch (error) {
            this.logger.warn('Failed to update task context:', error.message);
        }
    }
    
    async _restoreSessionContext(sessionId) {
        const sessionDir = path.join(this.config.memoryPath, sessionId);
        const contextFile = path.join(sessionDir, 'task-context.json');
        
        try {
            const content = await fs.readFile(contextFile, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            this.logger.debug('No session context to restore:', error.message);
            return {};
        }
    }
    
    async _cleanupSession(sessionId, options = {}) {
        const sessionDir = path.join(this.config.memoryPath, sessionId);
        
        try {
            if (options.exportMetrics) {
                await this._exportSessionMetrics(sessionId);
            }
            
            // Archive session data instead of deleting
            const archiveDir = path.join(this.config.memoryPath, '_archived', sessionId);
            await fs.mkdir(path.dirname(archiveDir), { recursive: true });
            
            try {
                await fs.rename(sessionDir, archiveDir);
                this.logger.debug(`Session ${sessionId} archived to ${archiveDir}`);
            } catch (error) {
                this.logger.warn('Failed to archive session:', error.message);
            }
        } catch (error) {
            this.logger.warn('Session cleanup failed:', error.message);
        }
    }
    
    async _recordTaskMetrics(type, data) {
        const metricsFile = path.join(this.config.logsPath, 'task-metrics.jsonl');
        await this._ensureDirectory(path.dirname(metricsFile));
        
        const metricsEntry = {
            type,
            timestamp: Date.now(),
            ...data
        };
        
        try {
            await fs.appendFile(metricsFile, JSON.stringify(metricsEntry) + '\n');
        } catch (error) {
            this.logger.warn('Failed to record task metrics:', error.message);
        }
    }
    
    async _initializeAgentTracking(agentType, sessionId) {
        const trackingFile = path.join(this.config.logsPath, 'agent-tracking.json');
        await this._ensureDirectory(path.dirname(trackingFile));
        
        try {
            let tracking = {};
            try {
                const content = await fs.readFile(trackingFile, 'utf8');
                tracking = JSON.parse(content);
            } catch (error) {
                // File doesn't exist yet
            }
            
            if (!tracking[agentType]) {
                tracking[agentType] = {
                    totalTasks: 0,
                    activeTasks: 0,
                    sessions: {}
                };
            }
            
            tracking[agentType].activeTasks++;
            tracking[agentType].sessions[sessionId] = Date.now();
            
            await fs.writeFile(trackingFile, JSON.stringify(tracking, null, 2));
        } catch (error) {
            this.logger.warn('Failed to initialize agent tracking:', error.message);
        }
    }
    
    async _updateAgentPerformance(data) {
        const performanceFile = path.join(this.config.logsPath, 'agent-performance.json');
        
        try {
            let performance = {};
            try {
                const content = await fs.readFile(performanceFile, 'utf8');
                performance = JSON.parse(content);
            } catch (error) {
                // File doesn't exist yet
            }
            
            if (!performance[data.agentType]) {
                performance[data.agentType] = {
                    totalTasks: 0,
                    successfulTasks: 0,
                    averageDuration: 0,
                    lastUpdate: null
                };
            }
            
            const agent = performance[data.agentType];
            agent.totalTasks++;
            
            if (data.success) {
                agent.successfulTasks++;
                agent.averageDuration = (agent.averageDuration * (agent.successfulTasks - 1) + data.duration) / agent.successfulTasks;
            }
            
            agent.lastUpdate = Date.now();
            
            await fs.writeFile(performanceFile, JSON.stringify(performance, null, 2));
        } catch (error) {
            this.logger.warn('Failed to update agent performance:', error.message);
        }
    }
    
    async _storeTaskArtifacts(sessionId, taskId, artifacts) {
        if (!sessionId || !taskId || !artifacts) return;
        
        const artifactsFile = path.join(this.config.memoryPath, sessionId, 'artifacts.json');
        
        try {
            let existingArtifacts = {};
            try {
                const content = await fs.readFile(artifactsFile, 'utf8');
                existingArtifacts = JSON.parse(content);
            } catch (error) {
                // File doesn't exist yet
            }
            
            existingArtifacts[taskId] = {
                artifacts,
                timestamp: Date.now()
            };
            
            await fs.writeFile(artifactsFile, JSON.stringify(existingArtifacts, null, 2));
        } catch (error) {
            this.logger.warn('Failed to store task artifacts:', error.message);
        }
    }
    
    async _sendTaskNotification(data) {
        // Simple console notification for now
        const status = data.success ? '✅' : '❌';
        const duration = data.duration ? ` (${data.duration}ms)` : '';
        console.log(`${status} Task ${data.taskId?.slice(-8) || 'unknown'} ${data.success ? 'completed' : 'failed'}${duration}`);
    }
    
    async _logToFile(filename, data) {
        const logFile = path.join(this.config.logsPath, filename);
        await this._ensureDirectory(path.dirname(logFile));
        
        try {
            const logEntry = `${new Date().toISOString()} ${JSON.stringify(data)}\n`;
            await fs.appendFile(logFile, logEntry);
        } catch (error) {
            this.logger.warn(`Failed to log to ${filename}:`, error.message);
        }
    }
    
    async _updateSessionActivity(sessionId, data) {
        const sessionDir = path.join(this.config.memoryPath, sessionId);
        const activityFile = path.join(sessionDir, 'activity.jsonl');
        
        try {
            await fs.appendFile(activityFile, JSON.stringify(data) + '\n');
        } catch (error) {
            this.logger.warn('Failed to update session activity:', error.message);
        }
    }
    
    async _trackFileChange(data) {
        const changesFile = path.join(this.config.logsPath, 'file-changes.jsonl');
        await this._ensureDirectory(path.dirname(changesFile));
        
        try {
            await fs.appendFile(changesFile, JSON.stringify(data) + '\n');
        } catch (error) {
            this.logger.warn('Failed to track file change:', error.message);
        }
    }
    
    async _updateMemoryKey(memoryKey, data) {
        const memoryFile = path.join(this.config.memoryPath, 'memory-keys.json');
        
        try {
            let memory = {};
            try {
                const content = await fs.readFile(memoryFile, 'utf8');
                memory = JSON.parse(content);
            } catch (error) {
                // File doesn't exist yet
            }
            
            memory[memoryKey] = {
                ...data,
                updatedAt: Date.now()
            };
            
            await fs.writeFile(memoryFile, JSON.stringify(memory, null, 2));
        } catch (error) {
            this.logger.warn('Failed to update memory key:', error.message);
        }
    }
    
    async _exportSessionMetrics(sessionId) {
        const sessionDir = path.join(this.config.memoryPath, sessionId);
        const exportFile = path.join(this.config.logsPath, 'exported-metrics', `${sessionId}.json`);
        await this._ensureDirectory(path.dirname(exportFile));
        
        try {
            // Collect all session data
            const sessionData = {};
            
            // Read context
            try {
                const contextFile = path.join(sessionDir, 'task-context.json');
                const context = await fs.readFile(contextFile, 'utf8');
                sessionData.context = JSON.parse(context);
            } catch (error) {
                sessionData.context = {};
            }
            
            // Read artifacts
            try {
                const artifactsFile = path.join(sessionDir, 'artifacts.json');
                const artifacts = await fs.readFile(artifactsFile, 'utf8');
                sessionData.artifacts = JSON.parse(artifacts);
            } catch (error) {
                sessionData.artifacts = {};
            }
            
            // Read activity
            try {
                const activityFile = path.join(sessionDir, 'activity.jsonl');
                const activity = await fs.readFile(activityFile, 'utf8');
                sessionData.activity = activity.split('\n').filter(line => line.trim()).map(line => JSON.parse(line));
            } catch (error) {
                sessionData.activity = [];
            }
            
            sessionData.exportedAt = Date.now();
            sessionData.sessionId = sessionId;
            
            await fs.writeFile(exportFile, JSON.stringify(sessionData, null, 2));
            this.logger.info(`📊 Session metrics exported to ${exportFile}`);
        } catch (error) {
            this.logger.warn('Failed to export session metrics:', error.message);
        }
    }
    
    async _ensureDirectory(dirPath) {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (error) {
            // Directory might already exist
        }
    }
    
    _executeCommand(command) {
        try {
            execSync(command, { stdio: 'ignore' });
        } catch (error) {
            throw new Error(`Command failed: ${command} - ${error.message}`);
        }
    }
    
    _createLogger() {
        return {
            info: (message, ...args) => console.log(`[CoordinationHooks] ${message}`, ...args),
            warn: (message, ...args) => console.warn(`[CoordinationHooks] ${message}`, ...args),
            error: (message, ...args) => console.error(`[CoordinationHooks] ${message}`, ...args),
            debug: (message, ...args) => console.debug(`[CoordinationHooks] ${message}`, ...args)
        };
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    // Parse command line options
    const options = {};
    for (let i = 1; i < args.length; i += 2) {
        if (args[i].startsWith('--')) {
            const key = args[i].slice(2).replace(/-/g, '');
            const value = args[i + 1];
            
            // Convert boolean strings
            if (value === 'true') options[key] = true;
            else if (value === 'false') options[key] = false;
            else options[key] = value;
        }
    }
    
    const hooks = new CoordinationHooks();
    
    try {
        switch (command) {
            case 'pre-task':
                await hooks.preTaskHook(options);
                break;
            case 'post-task':
                await hooks.postTaskHook(options);
                break;
            case 'session-restore':
                await hooks.sessionRestoreHook(options);
                break;
            case 'session-end':
                await hooks.sessionEndHook(options);
                break;
            case 'notify':
                await hooks.notifyHook(options);
                break;
            case 'post-edit':
                await hooks.postEditHook(options);
                break;
            default:
                console.error('Unknown command:', command);
                console.log('Available commands: pre-task, post-task, session-restore, session-end, notify, post-edit');
                process.exit(1);
        }
    } catch (error) {
        console.error('Hook execution failed:', error.message);
        process.exit(1);
    }
}

// Export for programmatic use
module.exports = { CoordinationHooks };

// Run CLI if called directly
if (require.main === module) {
    main().catch(console.error);
}