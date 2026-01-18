/**
 * Archon Configuration - Main configuration file for the orchestration layer
 * 
 * Defines configuration for all orchestration and coordination components
 */

const path = require('path');

/**
 * Get environment-specific configuration
 */
function getEnvironmentConfig() {
    const env = process.env.NODE_ENV || 'development';
    
    const configs = {
        development: {
            logLevel: 'info',
            enableDebugMode: true,
            enableMetrics: true,
            enableHealthChecks: true,
            mcpConnectionTimeout: 10000, // 10 seconds
            taskTimeout: 300000, // 5 minutes
            maxConcurrentTasks: 6
        },
        production: {
            logLevel: 'warn',
            enableDebugMode: false,
            enableMetrics: true,
            enableHealthChecks: true,
            mcpConnectionTimeout: 30000, // 30 seconds
            taskTimeout: 600000, // 10 minutes
            maxConcurrentTasks: 12
        },
        test: {
            logLevel: 'error',
            enableDebugMode: false,
            enableMetrics: false,
            enableHealthChecks: false,
            mcpConnectionTimeout: 5000, // 5 seconds
            taskTimeout: 60000, // 1 minute
            maxConcurrentTasks: 2
        }
    };
    
    return configs[env] || configs.development;
}

/**
 * Main Archon configuration
 */
const archonConfig = {
    // Environment configuration
    environment: getEnvironmentConfig(),
    
    // Orchestration Layer Configuration
    orchestration: {
        // Archon Orchestrator settings
        archon: {
            maxConcurrentAgents: process.env.ARCHON_MAX_AGENTS || 8,
            taskTimeout: process.env.ARCHON_TASK_TIMEOUT || 300000,
            retryAttempts: process.env.ARCHON_RETRY_ATTEMPTS || 3,
            enableCoordinationHooks: process.env.ARCHON_ENABLE_HOOKS !== 'false',
            
            // Agent pool configuration
            agentTypes: {
                // Core Development Agents
                'coder': { concurrency: 4, priority: 'high', timeout: 300000 },
                'reviewer': { concurrency: 2, priority: 'medium', timeout: 180000 },
                'tester': { concurrency: 3, priority: 'high', timeout: 240000 },
                'planner': { concurrency: 1, priority: 'critical', timeout: 360000 },
                'researcher': { concurrency: 2, priority: 'medium', timeout: 300000 },
                
                // SPARC Methodology Agents
                'specification': { concurrency: 2, priority: 'high', timeout: 600000 },
                'pseudocode': { concurrency: 2, priority: 'high', timeout: 480000 },
                'architecture': { concurrency: 1, priority: 'critical', timeout: 900000 },
                'refinement': { concurrency: 3, priority: 'high', timeout: 720000 },
                
                // Specialized Development Agents
                'backend-dev': { concurrency: 2, priority: 'medium', timeout: 600000 },
                'frontend-dev': { concurrency: 2, priority: 'medium', timeout: 480000 },
                'devops': { concurrency: 1, priority: 'medium', timeout: 720000 },
                'security': { concurrency: 1, priority: 'low', timeout: 600000 }
            }
        },
        
        // MCP Integration settings
        mcp: {
            connectionPooling: {
                enabled: true,
                maxConnections: 10,
                idleTimeout: 300000,
                keepAlive: true
            },
            loadBalancing: {
                enabled: true,
                strategy: 'priority', // 'round-robin', 'priority', 'least-connections'
                healthCheckInterval: 30000
            },
            servers: {
                'desktop-commander': {
                    enabled: process.env.MCP_DESKTOP_COMMANDER_ENABLED !== 'false',
                    host: process.env.MCP_DESKTOP_COMMANDER_HOST || 'localhost',
                    port: process.env.MCP_DESKTOP_COMMANDER_PORT || 3000,
                    priority: 10,
                    timeout: 30000,
                    retries: 3,
                    capabilities: [
                        'file-operations',
                        'process-management',
                        'system-commands',
                        'search-operations'
                    ]
                },
                'ruv-swarm': {
                    enabled: process.env.MCP_RUV_SWARM_ENABLED !== 'false',
                    host: process.env.MCP_RUV_SWARM_HOST || 'localhost',
                    port: process.env.MCP_RUV_SWARM_PORT || 3001,
                    priority: 8,
                    timeout: 60000,
                    retries: 2,
                    capabilities: [
                        'swarm-coordination',
                        'neural-patterns',
                        'memory-management',
                        'learning-adaptation'
                    ]
                },
                'flow-nexus': {
                    enabled: process.env.MCP_FLOW_NEXUS_ENABLED !== 'false',
                    host: process.env.MCP_FLOW_NEXUS_HOST || 'localhost',
                    port: process.env.MCP_FLOW_NEXUS_PORT || 3002,
                    priority: 6,
                    timeout: 45000,
                    retries: 2,
                    capabilities: [
                        'cloud-execution',
                        'template-management',
                        'real-time-monitoring',
                        'storage-operations'
                    ]
                },
                'claude-flow': {
                    enabled: true,
                    host: process.env.MCP_CLAUDE_FLOW_HOST || 'localhost',
                    port: process.env.MCP_CLAUDE_FLOW_PORT || 3003,
                    priority: 9,
                    timeout: 30000,
                    retries: 3,
                    capabilities: [
                        'agent-spawning',
                        'workflow-coordination',
                        'sparc-integration',
                        'task-orchestration'
                    ]
                }
            }
        },
        
        // Task Router settings
        router: {
            strategy: process.env.ARCHON_ROUTING_STRATEGY || 'adaptive',
            maxRetries: 3,
            timeoutMs: 300000,
            queueSize: 1000,
            
            // Priority configuration
            priorities: {
                'critical': { weight: 100, timeout: 180000 },
                'high': { weight: 75, timeout: 300000 },
                'medium': { weight: 50, timeout: 600000 },
                'low': { weight: 25, timeout: 1200000 }
            }
        },
        
        // Workflow Coordinator settings
        workflow: {
            maxConcurrency: 6,
            timeoutMs: 1800000, // 30 minutes
            retryAttempts: 2,
            
            // SPARC workflow templates
            sparcTemplates: {
                'full-tdd': {
                    enabled: true,
                    maxDuration: 3600000, // 1 hour
                    qualityGatesEnabled: true
                },
                'rapid-prototype': {
                    enabled: true,
                    maxDuration: 1800000, // 30 minutes
                    qualityGatesEnabled: false
                },
                'full-stack-app': {
                    enabled: true,
                    maxDuration: 7200000, // 2 hours
                    qualityGatesEnabled: true
                }
            }
        }
    },
    
    // Coordination Layer Configuration
    coordination: {
        // SPARC Integrator settings
        sparc: {
            enableHooks: process.env.SPARC_ENABLE_HOOKS !== 'false',
            enableQualityGates: process.env.SPARC_ENABLE_QUALITY_GATES !== 'false',
            strictMode: process.env.SPARC_STRICT_MODE === 'true',
            sessionPrefix: 'sparc',
            memoryNamespace: 'sparc-workflow',
            
            // Phase timeouts
            phaseTimeouts: {
                specification: 600000,  // 10 minutes
                pseudocode: 480000,     // 8 minutes
                architecture: 900000,   // 15 minutes
                refinement: 1200000,    // 20 minutes
                completion: 1800000     // 30 minutes
            },
            
            // Quality gate thresholds
            qualityGates: {
                specification: {
                    minimumRequirements: process.env.SPARC_MIN_REQUIREMENTS || 5,
                    completenessThreshold: 0.8
                },
                refinement: {
                    testCoverageThreshold: process.env.SPARC_TEST_COVERAGE || 0.8,
                    codeQualityLevel: 'high'
                },
                completion: {
                    allTestsMustPass: true,
                    documentationRequired: true,
                    deploymentReady: true
                }
            }
        },
        
        // Web App Scaffolder settings
        webScaffolding: {
            enableTesting: process.env.WEB_SCAFFOLD_ENABLE_TESTING !== 'false',
            enableDocumentation: process.env.WEB_SCAFFOLD_ENABLE_DOCS !== 'false',
            enableDeployment: process.env.WEB_SCAFFOLD_ENABLE_DEPLOY !== 'false',
            parallelTasks: process.env.WEB_SCAFFOLD_PARALLEL_TASKS !== 'false',
            qualityGates: process.env.WEB_SCAFFOLD_QUALITY_GATES !== 'false',
            
            // File organization
            fileOrganization: {
                src: process.env.WEB_SCAFFOLD_SRC_DIR || 'src',
                tests: process.env.WEB_SCAFFOLD_TESTS_DIR || 'tests',
                docs: process.env.WEB_SCAFFOLD_DOCS_DIR || 'docs',
                config: process.env.WEB_SCAFFOLD_CONFIG_DIR || 'config',
                scripts: process.env.WEB_SCAFFOLD_SCRIPTS_DIR || 'scripts'
            },
            
            // Template configuration
            templates: {
                'react-express-fullstack': {
                    enabled: true,
                    estimatedTime: 1800000,
                    agents: ['frontend-dev', 'backend-dev', 'devops', 'tester']
                },
                'nextjs-fullstack': {
                    enabled: true,
                    estimatedTime: 1200000,
                    agents: ['frontend-dev', 'backend-dev', 'devops']
                },
                'vue-node-api': {
                    enabled: true,
                    estimatedTime: 1500000,
                    agents: ['frontend-dev', 'backend-dev', 'tester', 'devops']
                }
            }
        }
    },
    
    // File Organization Settings
    fileOrganization: {
        baseDir: process.env.ARCHON_BASE_DIR || process.cwd(),
        directories: {
            src: 'src',
            tests: 'tests',
            docs: 'docs',
            config: 'config',
            scripts: 'scripts',
            examples: 'examples',
            logs: 'logs',
            temp: '.temp'
        },
        
        // File naming conventions
        namingConventions: {
            components: 'kebab-case',
            files: 'kebab-case',
            directories: 'kebab-case',
            constants: 'SCREAMING_SNAKE_CASE'
        }
    },
    
    // Monitoring and Metrics
    monitoring: {
        enabled: process.env.ARCHON_MONITORING_ENABLED !== 'false',
        metricsInterval: process.env.ARCHON_METRICS_INTERVAL || 30000,
        healthCheckInterval: process.env.ARCHON_HEALTH_CHECK_INTERVAL || 30000,
        
        // Metric collection settings
        metrics: {
            performance: true,
            errors: true,
            usage: true,
            quality: true
        },
        
        // Alert thresholds
        alerts: {
            errorRateThreshold: 0.1, // 10%
            responseTimeThreshold: 30000, // 30 seconds
            queueSizeThreshold: 100,
            memoryUsageThreshold: 0.8 // 80%
        }
    },
    
    // Security Settings
    security: {
        enableValidation: true,
        sanitizeInputs: true,
        enableRateLimiting: true,
        
        // Rate limiting
        rateLimiting: {
            maxRequestsPerMinute: 100,
            maxConcurrentRequests: 10,
            enableBurst: true
        },
        
        // Input validation
        validation: {
            maxPayloadSize: 10 * 1024 * 1024, // 10MB
            allowedFileTypes: ['.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.yml', '.yaml'],
            maxFilenameLength: 255
        }
    }
};

/**
 * Get configuration for specific environment
 */
function getConfig(environment = null) {
    const env = environment || process.env.NODE_ENV || 'development';
    
    // Merge environment-specific overrides
    const envConfig = archonConfig.environment;
    
    return {
        ...archonConfig,
        environment: env,
        ...envConfig
    };
}

/**
 * Validate configuration
 */
function validateConfig(config) {
    const errors = [];
    
    // Validate required settings
    if (!config.orchestration) {
        errors.push('Missing orchestration configuration');
    }
    
    if (!config.coordination) {
        errors.push('Missing coordination configuration');
    }
    
    // Validate MCP server configuration
    if (config.orchestration?.mcp?.servers) {
        const servers = config.orchestration.mcp.servers;
        Object.keys(servers).forEach(serverName => {
            const server = servers[serverName];
            if (server.enabled && (!server.host || !server.port)) {
                errors.push(`Invalid configuration for MCP server: ${serverName}`);
            }
        });
    }
    
    // Validate agent configuration
    if (config.orchestration?.archon?.agentTypes) {
        const agents = config.orchestration.archon.agentTypes;
        Object.keys(agents).forEach(agentType => {
            const agent = agents[agentType];
            if (!agent.concurrency || !agent.priority) {
                errors.push(`Invalid configuration for agent type: ${agentType}`);
            }
        });
    }
    
    if (errors.length > 0) {
        throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }
    
    return true;
}

/**
 * Create configuration from environment variables and defaults
 */
function createConfig(overrides = {}) {
    const baseConfig = getConfig();
    const config = {
        ...baseConfig,
        ...overrides
    };
    
    validateConfig(config);
    return config;
}

module.exports = {
    archonConfig,
    getConfig,
    validateConfig,
    createConfig,
    getEnvironmentConfig
};