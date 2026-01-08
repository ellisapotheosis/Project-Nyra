#!/usr/bin/env node

/**
 * GitHub MCP Integration Test Script
 * Tests GitHub MCP coordinator functionality
 */

const { GitHubMcpCoordinator } = require('../src/coordination/github-mcp-coordinator');
const { GitHubMcpConfig } = require('../config/github-mcp-config');

class GitHubMcpTester {
  constructor() {
    this.coordinator = null;
    this.config = null;
    this.testResults = [];
  }

  async runAllTests() {
    console.log('🧪 Starting GitHub MCP Integration Tests...\n');

    try {
      // Initialize components
      await this.initializeComponents();

      // Run test suite
      await this.testConfigurationValidation();
      await this.testRepositoryAnalysis(); 
      await this.testWorkflowExecution();
      await this.testArchonIntegration();
      await this.testErrorHandling();

      // Display results
      this.displayTestResults();

    } catch (error) {
      console.error('💥 Test suite failed:', error.message);
      process.exit(1);
    }
  }

  async initializeComponents() {
    console.log('🚀 Initializing GitHub MCP components...');
    
    try {
      this.config = new GitHubMcpConfig();
      this.coordinator = new GitHubMcpCoordinator();
      
      await this.coordinator.initialize();
      
      this.addTestResult('Component Initialization', true, 'All components initialized successfully');
      console.log('  ✅ Components initialized\n');
    } catch (error) {
      this.addTestResult('Component Initialization', false, error.message);
      throw error;
    }
  }

  async testConfigurationValidation() {
    console.log('📋 Testing configuration validation...');
    
    try {
      // Test configuration validation
      const errors = this.config.validate();
      const isValid = errors.length === 0;
      
      this.addTestResult('Configuration Validation', isValid, 
        isValid ? 'Configuration is valid' : `Found ${errors.length} errors: ${errors.join(', ')}`
      );

      // Test repository configuration
      const repo = this.config.getRepository('project-nyra/nyra-core');
      const hasRepo = !!repo;
      
      this.addTestResult('Repository Configuration', hasRepo,
        hasRepo ? 'Primary repository configured correctly' : 'Primary repository not found'
      );

      // Test workflow configuration
      const workflow = this.config.getWorkflow('code_quality_check');
      const hasWorkflow = !!workflow && workflow.steps && workflow.steps.length > 0;
      
      this.addTestResult('Workflow Configuration', hasWorkflow,
        hasWorkflow ? `Workflow has ${workflow.steps.length} steps` : 'Workflow not properly configured'
      );

      console.log('  ✅ Configuration validation completed\n');
    } catch (error) {
      this.addTestResult('Configuration Validation', false, error.message);
      console.log('  ❌ Configuration validation failed\n');
    }
  }

  async testRepositoryAnalysis() {
    console.log('🔍 Testing repository analysis...');
    
    try {
      // Test code quality analysis
      console.log('  Testing code quality analysis...');
      const qualityAnalysis = await this.coordinator.analyzeRepository(
        'project-nyra/nyra-core', 
        'code_quality'
      );
      
      const qualitySuccess = qualityAnalysis && qualityAnalysis.analysisId;
      this.addTestResult('Code Quality Analysis', qualitySuccess,
        qualitySuccess ? `Analysis ID: ${qualityAnalysis.analysisId}` : 'Analysis failed'
      );

      // Test security analysis
      console.log('  Testing security analysis...');
      const securityAnalysis = await this.coordinator.analyzeRepository(
        'project-nyra/nyra-core',
        'security'
      );
      
      const securitySuccess = securityAnalysis && securityAnalysis.analysisId;
      this.addTestResult('Security Analysis', securitySuccess,
        securitySuccess ? `Analysis ID: ${securityAnalysis.analysisId}` : 'Analysis failed'
      );

      // Test performance analysis
      console.log('  Testing performance analysis...');
      const performanceAnalysis = await this.coordinator.analyzeRepository(
        'project-nyra/nyra-core',
        'performance'
      );
      
      const performanceSuccess = performanceAnalysis && performanceAnalysis.analysisId;
      this.addTestResult('Performance Analysis', performanceSuccess,
        performanceSuccess ? `Analysis ID: ${performanceAnalysis.analysisId}` : 'Analysis failed'
      );

      console.log('  ✅ Repository analysis tests completed\n');
    } catch (error) {
      this.addTestResult('Repository Analysis', false, error.message);
      console.log('  ❌ Repository analysis tests failed\n');
    }
  }

  async testWorkflowExecution() {
    console.log('⚙️ Testing workflow execution...');
    
    try {
      // Test code quality workflow
      console.log('  Testing code quality workflow...');
      const qualityWorkflow = await this.coordinator.executeWorkflow(
        'code_quality_check',
        'project-nyra/nyra-core',
        { branch: 'main', trigger: 'test' }
      );
      
      const qualitySuccess = qualityWorkflow && qualityWorkflow.status === 'completed';
      this.addTestResult('Code Quality Workflow', qualitySuccess,
        qualitySuccess ? `Workflow completed in ${qualityWorkflow.duration}ms` : 'Workflow failed'
      );

      // Test PR enhancement workflow
      console.log('  Testing PR enhancement workflow...');
      const prWorkflow = await this.coordinator.executeWorkflow(
        'pr_enhancement',
        'project-nyra/nyra-core',
        { pr_number: 123, author: 'test-user' }
      );
      
      const prSuccess = prWorkflow && prWorkflow.status === 'completed';
      this.addTestResult('PR Enhancement Workflow', prSuccess,
        prSuccess ? `Workflow completed with ${prWorkflow.steps.length} steps` : 'Workflow failed'
      );

      // Test issue triage workflow
      console.log('  Testing issue triage workflow...');
      const issueWorkflow = await this.coordinator.executeWorkflow(
        'issue_triage',
        'project-nyra/nyra-core',
        { issue_number: 456, issue_type: 'bug' }
      );
      
      const issueSuccess = issueWorkflow && issueWorkflow.status === 'completed';
      this.addTestResult('Issue Triage Workflow', issueSuccess,
        issueSuccess ? `Workflow completed successfully` : 'Workflow failed'
      );

      console.log('  ✅ Workflow execution tests completed\n');
    } catch (error) {
      this.addTestResult('Workflow Execution', false, error.message);
      console.log('  ❌ Workflow execution tests failed\n');
    }
  }

  async testArchonIntegration() {
    console.log('🔗 Testing Archon integration...');
    
    try {
      const archonWorkflowId = 'test-sparc-workflow-123';
      const githubOperations = [
        {
          type: 'analyze_repository',
          repository: 'project-nyra/nyra-core',
          analysis_type: 'code_quality'
        },
        {
          type: 'execute_workflow',
          workflow: 'code_quality_check',
          repository: 'project-nyra/nyra-core',
          context: { trigger: 'archon-integration-test' }
        },
        {
          type: 'create_issue',
          repository: 'project-nyra/nyra-core',
          issue_data: {
            title: 'Test Issue from Archon Integration',
            body: 'This is a test issue created during integration testing',
            labels: ['test', 'automation']
          }
        }
      ];

      const integrationResult = await this.coordinator.integrateWithArchon(
        archonWorkflowId,
        githubOperations
      );
      
      const integrationSuccess = integrationResult && 
        integrationResult.githubOperations.every(op => op.status === 'completed');
      
      this.addTestResult('Archon Integration', integrationSuccess,
        integrationSuccess ? 
          `Integrated ${integrationResult.githubOperations.length} GitHub operations` :
          'Integration failed'
      );

      console.log('  ✅ Archon integration tests completed\n');
    } catch (error) {
      this.addTestResult('Archon Integration', false, error.message);
      console.log('  ❌ Archon integration tests failed\n');
    }
  }

  async testErrorHandling() {
    console.log('🛡️ Testing error handling...');
    
    try {
      // Test invalid repository
      console.log('  Testing invalid repository handling...');
      try {
        await this.coordinator.analyzeRepository('invalid/repository', 'code_quality');
        this.addTestResult('Invalid Repository Handling', false, 'Should have thrown error');
      } catch (error) {
        this.addTestResult('Invalid Repository Handling', true, 'Correctly handled invalid repository');
      }

      // Test invalid workflow
      console.log('  Testing invalid workflow handling...');
      try {
        await this.coordinator.executeWorkflow('invalid_workflow', 'project-nyra/nyra-core');
        this.addTestResult('Invalid Workflow Handling', false, 'Should have thrown error');
      } catch (error) {
        this.addTestResult('Invalid Workflow Handling', true, 'Correctly handled invalid workflow');
      }

      // Test invalid analysis type
      console.log('  Testing invalid analysis type handling...');
      try {
        await this.coordinator.analyzeRepository('project-nyra/nyra-core', 'invalid_analysis');
        this.addTestResult('Invalid Analysis Type Handling', true, 'Handled gracefully');
      } catch (error) {
        this.addTestResult('Invalid Analysis Type Handling', true, 'Correctly handled invalid analysis type');
      }

      console.log('  ✅ Error handling tests completed\n');
    } catch (error) {
      this.addTestResult('Error Handling', false, error.message);
      console.log('  ❌ Error handling tests failed\n');
    }
  }

  addTestResult(testName, passed, message) {
    this.testResults.push({
      test: testName,
      passed: passed,
      message: message,
      timestamp: new Date().toISOString()
    });
  }

  displayTestResults() {
    console.log('📊 Test Results Summary:\n');
    
    const passedTests = this.testResults.filter(r => r.passed).length;
    const totalTests = this.testResults.length;
    const passRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    console.log(`  🎯 Overall: ${passedTests}/${totalTests} tests passed (${passRate}%)\n`);
    
    this.testResults.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      const status = result.passed ? 'PASS' : 'FAIL';
      console.log(`  ${icon} ${result.test}: ${status}`);
      console.log(`     ${result.message}`);
    });
    
    console.log('');
    
    // Display coordinator status
    if (this.coordinator) {
      console.log('📈 Final Coordinator Status:');
      const status = this.coordinator.getStatus();
      console.log(`  Active Analyses: ${status.active_analyses}`);
      console.log(`  Workflows Executed: ${status.metrics.workflows_executed}`);
      console.log(`  Issues Created: ${status.metrics.issues_created}`);
      console.log(`  Analyses Completed: ${status.metrics.analyses_completed}`);
    }
    
    if (passedTests === totalTests) {
      console.log('\n🎉 All tests passed! GitHub MCP Integration is working correctly.');
    } else {
      console.log(`\n⚠️ ${totalTests - passedTests} test(s) failed. Please review the results above.`);
    }
  }
}

// CLI argument parsing
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    help: args.includes('--help') || args.includes('-h'),
    verbose: args.includes('--verbose') || args.includes('-v')
  };
}

function showHelp() {
  console.log(`
GitHub MCP Integration Test Script

Usage: node github-mcp-test.js [options]

Options:
  -v, --verbose    Enable verbose output
  -h, --help       Show this help message

Examples:
  node github-mcp-test.js           # Run all tests
  node github-mcp-test.js --verbose # Run with detailed output
`);
}

// Main execution
async function main() {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    return;
  }

  const tester = new GitHubMcpTester();
  
  if (options.verbose) {
    console.log('Running in verbose mode...\n');
  }
  
  await tester.runAllTests();
}

// Execute if run directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { GitHubMcpTester };