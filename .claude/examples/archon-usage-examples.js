/**
 * Archon Usage Examples - Demonstrates how to use the orchestration layer
 * 
 * Examples for setting up and using Archon for multi-agent development workflows
 */

const { OrchestrationManager } = require('../src/orchestration');
const { CoordinationManager } = require('../src/coordination');
const { createConfig } = require('../config/archon-config');

/**
 * Example 1: Basic Orchestration Setup
 */
async function basicOrchestrationExample() {
    console.log('\n🚀 Basic Orchestration Example');
    console.log('================================');
    
    try {
        // Create configuration
        const config = createConfig({
            environment: 'development',
            orchestration: {
                archon: {
                    maxConcurrentAgents: 4
                }
            }
        });
        
        // Initialize orchestration manager
        const orchestrator = new OrchestrationManager(config.orchestration);
        await orchestrator.initialize();
        
        // Get system status
        const status = orchestrator.getSystemStatus();
        console.log('📊 System Status:', JSON.stringify(status, null, 2));
        
        // Queue a simple task
        const taskId = await orchestrator.queueTask(
            'code-generation',
            {
                description: 'Generate a simple REST API endpoint',
                requirements: ['Express.js', 'async/await', 'error handling']
            },
            { priority: 'high' }
        );
        
        console.log(`✅ Task queued with ID: ${taskId}`);
        
        // Shutdown
        await orchestrator.shutdown();
        console.log('✅ Basic orchestration example completed');
        
    } catch (error) {
        console.error('❌ Basic orchestration example failed:', error);
    }
}

/**
 * Example 2: SPARC Workflow Execution
 */
async function sparcWorkflowExample() {
    console.log('\n🎯 SPARC Workflow Example');
    console.log('==========================');
    
    try {
        // Setup orchestration and coordination
        const config = createConfig();
        const orchestrator = new OrchestrationManager(config.orchestration);
        await orchestrator.initialize();
        
        const coordinator = new CoordinationManager(orchestrator, config.coordination);
        await coordinator.initialize();
        
        // Define project for SPARC workflow
        const projectDefinition = {
            name: 'task-manager-api',
            description: 'A RESTful API for task management with user authentication',
            requirements: [
                'User registration and authentication',
                'CRUD operations for tasks',
                'Task categories and priorities',
                'Due date management',
                'REST API with JSON responses'
            ],
            technology: {
                backend: 'Node.js with Express',
                database: 'PostgreSQL',
                authentication: 'JWT tokens'
            }
        };
        
        // Execute SPARC workflow
        console.log('🔄 Starting SPARC workflow...');
        const sparcResult = await coordinator.executeSPARCWorkflow(
            projectDefinition,
            {
                strictMode: true,
                enableHooks: true,
                qualityGatesEnabled: true
            }
        );
        
        console.log('✅ SPARC Workflow Results:');
        console.log(`   - Duration: ${sparcResult.duration}ms`);
        console.log(`   - Phases completed: ${Object.keys(sparcResult.results).length}`);
        console.log(`   - Quality gates passed: ${JSON.stringify(sparcResult.qualityGates, null, 2)}`);
        
        // Shutdown
        await orchestrator.shutdown();
        console.log('✅ SPARC workflow example completed');
        
    } catch (error) {
        console.error('❌ SPARC workflow example failed:', error);
    }
}

/**
 * Example 3: Web Application Scaffolding
 */
async function webAppScaffoldingExample() {
    console.log('\n🏗️ Web App Scaffolding Example');
    console.log('===============================');
    
    try {
        // Setup orchestration and coordination
        const config = createConfig();
        const orchestrator = new OrchestrationManager(config.orchestration);
        await orchestrator.initialize();
        
        const coordinator = new CoordinationManager(orchestrator, config.coordination);
        await coordinator.initialize();
        
        // Get available templates
        const templates = coordinator.getWebAppTemplates();
        console.log('📋 Available Templates:');
        templates.forEach(template => {
            console.log(`   - ${template.name}: ${template.description}`);
        });
        
        // Define project configuration
        const projectConfig = {
            name: 'my-fullstack-app',
            description: 'A full-stack application with React and Express',
            directory: './projects/my-fullstack-app',
            features: ['authentication', 'real-time-updates', 'responsive-design'],
            database: {
                type: 'postgresql',
                host: 'localhost',
                port: 5432
            }
        };
        
        // Scaffold application
        console.log('🔄 Starting web app scaffolding...');
        const scaffoldResult = await coordinator.scaffoldWebApp(
            'react-express-fullstack',
            projectConfig,
            {
                enableTesting: true,
                enableDocumentation: true,
                enableDeployment: true,
                dryRun: false // Set to true to see what would be generated
            }
        );
        
        console.log('✅ Scaffolding Results:');
        console.log(`   - Project Path: ${scaffoldResult.projectPath}`);
        console.log(`   - Files Generated: ${scaffoldResult.generatedFiles.length}`);
        console.log(`   - Duration: ${scaffoldResult.duration}ms`);
        console.log('📁 Generated Files:');
        scaffoldResult.generatedFiles.slice(0, 10).forEach(file => {
            console.log(`     - ${file}`);
        });
        if (scaffoldResult.generatedFiles.length > 10) {
            console.log(`     ... and ${scaffoldResult.generatedFiles.length - 10} more files`);
        }
        
        // Shutdown
        await orchestrator.shutdown();
        console.log('✅ Web app scaffolding example completed');
        
    } catch (error) {
        console.error('❌ Web app scaffolding example failed:', error);
    }
}

/**
 * Example 4: Multi-Agent Development Workflow
 */
async function multiAgentWorkflowExample() {
    console.log('\n🤖 Multi-Agent Development Workflow Example');
    console.log('=============================================');
    
    try {
        // Setup orchestration
        const config = createConfig({
            orchestration: {
                archon: {
                    maxConcurrentAgents: 6
                },
                router: {
                    strategy: 'adaptive'
                }
            }
        });
        
        const orchestrator = new OrchestrationManager(config.orchestration);
        await orchestrator.initialize();
        
        // Queue multiple related tasks
        console.log('🔄 Queuing multiple development tasks...');
        
        const tasks = [
            {
                type: 'architecture',
                payload: {
                    description: 'Design microservices architecture',
                    requirements: ['API Gateway', 'Service Discovery', 'Load Balancing']
                },
                priority: 'critical'
            },
            {
                type: 'code-generation',
                payload: {
                    description: 'Implement user service',
                    requirements: ['RESTful API', 'Database integration', 'Validation']
                },
                priority: 'high'
            },
            {
                type: 'code-generation',
                payload: {
                    description: 'Implement task service',
                    requirements: ['CRUD operations', 'Business logic', 'Data persistence']
                },
                priority: 'high'
            },
            {
                type: 'testing',
                payload: {
                    description: 'Create comprehensive test suite',
                    requirements: ['Unit tests', 'Integration tests', 'API tests']
                },
                priority: 'medium'
            },
            {
                type: 'review',
                payload: {
                    description: 'Code review and quality analysis',
                    requirements: ['Code quality', 'Security analysis', 'Performance review']
                },
                priority: 'medium'
            }
        ];
        
        // Queue all tasks
        const taskIds = [];
        for (const task of tasks) {
            const taskId = await orchestrator.queueTask(task.type, task.payload, { priority: task.priority });
            taskIds.push(taskId);
            console.log(`   ✅ Queued ${task.type} task: ${taskId}`);
        }
        
        // Monitor system status
        console.log('\n📊 System Status After Queuing:');
        const status = orchestrator.getSystemStatus();
        console.log(`   - Active Workflows: ${status.components.orchestration?.activeWorkflows || 0}`);
        console.log(`   - Queue Length: ${status.components.orchestration?.queueLength || 0}`);
        console.log(`   - Connected MCP Servers: ${Object.keys(status.components.orchestration?.mcpServers || {}).length}`);
        
        // Get routing statistics
        const routingStats = orchestrator.getRoutingHistory(10);
        console.log('\n📍 Recent Task Routing:');
        routingStats.slice(0, 5).forEach(decision => {
            console.log(`   - Task ${decision.taskId.slice(-8)}: routed to ${decision.selectedAgent} (${decision.routingTime}ms)`);
        });
        
        // Simulate some time passing
        console.log('\n⏳ Simulating task execution...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Get metrics
        const metrics = orchestrator.getSystemMetrics();
        console.log('\n📈 System Metrics:');
        console.log(`   - Routing Success Rate: ${((metrics.routing?.agentStatistics?.coder?.performance?.successRate || 0) * 100).toFixed(1)}%`);
        console.log(`   - Average Response Time: ${metrics.routing?.agentStatistics?.coder?.performance?.averageResponseTime || 0}ms`);
        
        // Shutdown
        await orchestrator.shutdown();
        console.log('✅ Multi-agent workflow example completed');
        
    } catch (error) {
        console.error('❌ Multi-agent workflow example failed:', error);
    }
}

/**
 * Example 5: MCP Server Integration
 */
async function mcpIntegrationExample() {
    console.log('\n🔌 MCP Server Integration Example');
    console.log('==================================');
    
    try {
        // Setup with MCP configuration
        const config = createConfig({
            orchestration: {
                mcp: {
                    servers: {
                        'desktop-commander': {
                            enabled: true,
                            host: 'localhost',
                            port: 3000,
                            priority: 10
                        },
                        'ruv-swarm': {
                            enabled: true,
                            host: 'localhost',
                            port: 3001,
                            priority: 8
                        }
                    }
                }
            }
        });
        
        const orchestrator = new OrchestrationManager(config.orchestration);
        await orchestrator.initialize();
        
        // Test MCP tool calls
        console.log('🔄 Testing MCP tool calls...');
        
        try {
            // File operations through desktop-commander
            const fileResult = await orchestrator.executeMCPTool(
                'file-operations',
                'read_file',
                { path: './package.json' },
                { preferredServer: 'desktop-commander' }
            );
            console.log('✅ File operation successful:', fileResult.result);
        } catch (error) {
            console.log('⚠️ File operation failed (expected in demo):', error.message);
        }
        
        try {
            // Swarm coordination through ruv-swarm
            const swarmResult = await orchestrator.executeMCPTool(
                'swarm-coordination',
                'swarm_init',
                { topology: 'mesh', maxAgents: 5 },
                { preferredServer: 'ruv-swarm' }
            );
            console.log('✅ Swarm coordination successful:', swarmResult.result);
        } catch (error) {
            console.log('⚠️ Swarm coordination failed (expected in demo):', error.message);
        }
        
        // Get MCP server status
        const mcpStatus = orchestrator.getSystemStatus().components.mcp;
        console.log('📊 MCP Server Status:');
        Object.entries(mcpStatus.servers || {}).forEach(([name, status]) => {
            console.log(`   - ${name}: ${status.status} (${status.metrics?.successRate || 0}% success rate)`);
        });
        
        // Shutdown
        await orchestrator.shutdown();
        console.log('✅ MCP integration example completed');
        
    } catch (error) {
        console.error('❌ MCP integration example failed:', error);
    }
}

/**
 * Example 6: Error Handling and Recovery
 */
async function errorHandlingExample() {
    console.log('\n🛡️ Error Handling and Recovery Example');
    console.log('=======================================');
    
    try {
        const config = createConfig();
        const orchestrator = new OrchestrationManager(config.orchestration);
        await orchestrator.initialize();
        
        // Test various error scenarios
        console.log('🔄 Testing error scenarios...');
        
        // Invalid agent type
        try {
            await orchestrator.queueTask('invalid-agent', { task: 'test' });
        } catch (error) {
            console.log('✅ Caught invalid agent error:', error.message);
        }
        
        // Invalid MCP tool call
        try {
            await orchestrator.executeMCPTool('invalid-capability', 'invalid-tool');
        } catch (error) {
            console.log('✅ Caught invalid MCP tool error:', error.message);
        }
        
        // Test graceful shutdown under load
        console.log('🔄 Testing graceful shutdown...');
        
        // Queue some tasks
        await orchestrator.queueTask('coder', { description: 'Test task 1' });
        await orchestrator.queueTask('tester', { description: 'Test task 2' });
        
        // Immediate shutdown (should wait for active tasks)
        await orchestrator.shutdown();
        console.log('✅ Graceful shutdown completed');
        
        console.log('✅ Error handling example completed');
        
    } catch (error) {
        console.error('❌ Error handling example failed:', error);
    }
}

/**
 * Run all examples
 */
async function runAllExamples() {
    console.log('🎉 Archon Orchestration Layer Examples');
    console.log('======================================');
    
    const examples = [
        { name: 'Basic Orchestration', fn: basicOrchestrationExample },
        { name: 'SPARC Workflow', fn: sparcWorkflowExample },
        { name: 'Web App Scaffolding', fn: webAppScaffoldingExample },
        { name: 'Multi-Agent Workflow', fn: multiAgentWorkflowExample },
        { name: 'MCP Integration', fn: mcpIntegrationExample },
        { name: 'Error Handling', fn: errorHandlingExample }
    ];
    
    for (const example of examples) {
        try {
            console.log(`\n🚀 Running ${example.name} Example...`);
            await example.fn();
        } catch (error) {
            console.error(`❌ ${example.name} example failed:`, error);
        }
        
        // Brief pause between examples
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎉 All examples completed!');
    console.log('\n📚 Next Steps:');
    console.log('   1. Explore the src/orchestration directory for implementation details');
    console.log('   2. Customize configuration in config/archon-config.js');
    console.log('   3. Integrate with your existing MCP servers');
    console.log('   4. Create custom workflows and templates');
    console.log('   5. Monitor metrics and performance');
}

// Export functions for individual use
module.exports = {
    basicOrchestrationExample,
    sparcWorkflowExample,
    webAppScaffoldingExample,
    multiAgentWorkflowExample,
    mcpIntegrationExample,
    errorHandlingExample,
    runAllExamples
};

// Run all examples if this file is executed directly
if (require.main === module) {
    runAllExamples().catch(console.error);
}