/**
 * GitHub MCP Integration Configuration
 * Integrates GitHub repository management with Flow Nexus MCP tools
 */

const path = require('path');

class GitHubMcpConfig {
  constructor() {
    this.repositories = this.initializeRepositories();
    this.workflows = this.setupWorkflows();
    this.integrationPatterns = this.defineIntegrationPatterns();
    this.analysisTypes = this.setupAnalysisTypes();
  }

  initializeRepositories() {
    return {
      'project-nyra/nyra-core': {
        name: 'Nyra Core',
        description: 'Core orchestration and multi-agent development stack',
        path: '../nyra-core',
        primary: true,
        components: {
          'claude-flow': 'Claude Flow orchestration layer',
          'nyra-orchestration/archon': 'Archon MCP orchestration system',
          'repo-agent': 'Repository management agent'
        },
        mcp_tools: {
          analysis: 'mcp__flow-nexus__github_repo_analyze',
          pr_management: 'flow-nexus GitHub integration',
          issue_tracking: 'flow-nexus issue management'
        },
        automation_enabled: true
      },
      'project-nyra/webapp': {
        name: 'Nyra Web Application',
        description: 'Main web application frontend and backend',
        path: '../webapp',
        primary: false,
        components: {
          'frontend': 'React/Next.js frontend',
          'backend': 'Node.js/Express backend', 
          'api': 'REST API endpoints'
        },
        mcp_tools: {
          analysis: 'mcp__flow-nexus__github_repo_analyze',
          deployment: 'flow-nexus deployment tools'
        },
        automation_enabled: true
      },
      'project-nyra/docs': {
        name: 'Project Documentation',
        description: 'Comprehensive project documentation',
        path: '../docs',
        primary: false,
        components: {
          'api-docs': 'API documentation',
          'user-guides': 'User guides and tutorials',
          'technical': 'Technical documentation'
        },
        mcp_tools: {
          analysis: 'documentation analysis'
        },
        automation_enabled: false
      }
    };
  }

  setupWorkflows() {
    return {
      // Code Quality Workflow
      code_quality_check: {
        name: 'Automated Code Quality Analysis',
        trigger: 'on_push',
        repositories: ['project-nyra/nyra-core', 'project-nyra/webapp'],
        steps: [
          {
            name: 'Repository Analysis',
            mcp_tool: 'mcp__flow-nexus__github_repo_analyze',
            parameters: { analysis_type: 'code_quality' },
            on_success: 'continue',
            on_failure: 'create_issue'
          },
          {
            name: 'Security Scan',
            mcp_tool: 'mcp__flow-nexus__github_repo_analyze', 
            parameters: { analysis_type: 'security' },
            on_success: 'continue',
            on_failure: 'create_pr_comment'
          },
          {
            name: 'Performance Analysis',
            mcp_tool: 'mcp__flow-nexus__github_repo_analyze',
            parameters: { analysis_type: 'performance' },
            on_success: 'create_report',
            on_failure: 'log_warning'
          }
        ]
      },

      // Pull Request Enhancement Workflow
      pr_enhancement: {
        name: 'PR Analysis and Enhancement',
        trigger: 'on_pr_open',
        repositories: ['project-nyra/nyra-core', 'project-nyra/webapp'],
        steps: [
          {
            name: 'Code Review',
            action: 'analyze_pr_changes',
            mcp_integration: 'flow-nexus code analysis',
            automation: 'auto_comment'
          },
          {
            name: 'Test Coverage Check',
            action: 'verify_test_coverage',
            threshold: 80,
            automation: 'status_check'
          },
          {
            name: 'Documentation Update Check',
            action: 'check_docs_updates',
            automation: 'suggest_improvements'
          }
        ]
      },

      // Issue Triage Workflow
      issue_triage: {
        name: 'Automated Issue Triage',
        trigger: 'on_issue_create',
        repositories: ['project-nyra/nyra-core', 'project-nyra/webapp'],
        steps: [
          {
            name: 'Issue Classification',
            action: 'classify_issue',
            categories: ['bug', 'feature', 'enhancement', 'documentation'],
            automation: 'auto_label'
          },
          {
            name: 'Priority Assessment',
            action: 'assess_priority',
            levels: ['low', 'medium', 'high', 'critical'],
            automation: 'auto_assign'
          },
          {
            name: 'Team Assignment',
            action: 'assign_to_team',
            routing_rules: {
              'backend': ['api', 'database', 'server'],
              'frontend': ['ui', 'ux', 'components'],
              'devops': ['deployment', 'infrastructure', 'ci/cd'],
              'documentation': ['docs', 'readme', 'guides']
            }
          }
        ]
      }
    };
  }

  defineIntegrationPatterns() {
    return {
      // Archon Integration Pattern
      archon_github_integration: {
        name: 'Archon-GitHub Coordination',
        description: 'Integrate GitHub operations with Archon orchestration',
        coordination_points: {
          'repository_analysis': {
            trigger: 'archon_sparc_workflow',
            action: 'analyze_repo_before_development',
            mcp_tool: 'mcp__flow-nexus__github_repo_analyze'
          },
          'pr_creation': {
            trigger: 'archon_completion_phase', 
            action: 'create_pr_with_analysis',
            automation: 'include_sparc_summary'
          },
          'issue_management': {
            trigger: 'archon_planning_phase',
            action: 'create_issues_from_tasks',
            automation: 'link_to_workflow'
          }
        }
      },

      // Multi-Agent GitHub Pattern
      multi_agent_github: {
        name: 'Multi-Agent GitHub Operations',
        description: 'Coordinate multiple agents for GitHub operations',
        agent_assignments: {
          'coder': {
            responsibilities: ['code_commits', 'branch_management', 'merge_conflicts'],
            github_actions: ['push_code', 'create_branch', 'resolve_conflicts']
          },
          'reviewer': {
            responsibilities: ['pr_reviews', 'code_analysis', 'security_checks'],
            github_actions: ['review_pr', 'add_comments', 'approve_reject']
          },
          'tester': {
            responsibilities: ['test_validation', 'coverage_reports', 'ci_status'],
            github_actions: ['run_tests', 'update_coverage', 'status_checks']
          },
          'documenter': {
            responsibilities: ['readme_updates', 'changelog', 'api_docs'],
            github_actions: ['update_docs', 'generate_changelog', 'sync_api_docs']
          },
          'devops': {
            responsibilities: ['deployment', 'releases', 'infrastructure'],
            github_actions: ['deploy_to_staging', 'create_release', 'manage_environments']
          }
        }
      },

      // SPARC-GitHub Integration Pattern
      sparc_github_integration: {
        name: 'SPARC Methodology GitHub Integration',
        description: 'Map SPARC phases to GitHub operations',
        phase_mappings: {
          'specification': {
            github_actions: ['create_issues', 'milestone_planning', 'requirements_documentation'],
            automation: 'auto_create_project_board'
          },
          'pseudocode': {
            github_actions: ['create_algorithm_branches', 'draft_implementation_plan'],
            automation: 'link_issues_to_pseudocode'
          },
          'architecture': {
            github_actions: ['create_architecture_docs', 'system_design_prs'],
            automation: 'generate_architecture_diagrams'
          },
          'refinement': {
            github_actions: ['implementation_prs', 'code_reviews', 'testing'],
            automation: 'continuous_integration'
          },
          'completion': {
            github_actions: ['merge_to_main', 'create_release', 'deployment'],
            automation: 'automated_deployment'
          }
        }
      }
    };
  }

  setupAnalysisTypes() {
    return {
      'code_quality': {
        description: 'Analyze code quality metrics, maintainability, and best practices',
        metrics: ['complexity', 'duplication', 'maintainability', 'technical_debt'],
        thresholds: {
          complexity: 10,
          duplication: 5,
          maintainability: 'B',
          technical_debt_ratio: 10
        },
        automation: 'create_quality_report'
      },
      'security': {
        description: 'Security vulnerability analysis and dependency scanning',
        checks: ['vulnerabilities', 'secrets', 'dependencies', 'permissions'],
        severity_levels: ['low', 'medium', 'high', 'critical'],
        automation: 'create_security_issues'
      },
      'performance': {
        description: 'Performance analysis and optimization recommendations',
        metrics: ['load_time', 'memory_usage', 'cpu_utilization', 'database_queries'],
        benchmarks: {
          load_time: 2000, // ms
          memory_usage: 500, // MB
          cpu_utilization: 80, // %
        },
        automation: 'performance_suggestions'
      }
    };
  }

  // Get repository configuration
  getRepository(repoName) {
    return this.repositories[repoName];
  }

  // Get workflow configuration
  getWorkflow(workflowName) {
    return this.workflows[workflowName];
  }

  // Get integration pattern
  getIntegrationPattern(patternName) {
    return this.integrationPatterns[patternName];
  }

  // Get analysis configuration
  getAnalysisType(analysisType) {
    return this.analysisTypes[analysisType];
  }

  // Generate MCP tool call for GitHub operation
  generateMcpCall(operation, repository, parameters = {}) {
    const repo = this.getRepository(repository);
    if (!repo) {
      throw new Error(`Repository ${repository} not found`);
    }

    switch (operation) {
      case 'analyze':
        return {
          tool: 'mcp__flow-nexus__github_repo_analyze',
          parameters: {
            repo: repository,
            analysis_type: parameters.analysis_type || 'code_quality',
            ...parameters
          }
        };
      
      case 'create_issue':
        return {
          tool: 'flow-nexus-github-create-issue',
          parameters: {
            repo: repository,
            title: parameters.title,
            body: parameters.body,
            labels: parameters.labels || [],
            assignees: parameters.assignees || []
          }
        };
      
      case 'create_pr':
        return {
          tool: 'flow-nexus-github-create-pr',
          parameters: {
            repo: repository,
            title: parameters.title,
            body: parameters.body,
            head: parameters.head,
            base: parameters.base || 'main',
            draft: parameters.draft || false
          }
        };
      
      default:
        throw new Error(`Unknown GitHub operation: ${operation}`);
    }
  }

  // Validate configuration
  validate() {
    const errors = [];
    
    // Validate repositories
    Object.entries(this.repositories).forEach(([name, config]) => {
      if (!config.name || !config.description) {
        errors.push(`Repository ${name} missing required fields`);
      }
      
      if (!config.mcp_tools) {
        errors.push(`Repository ${name} missing MCP tools configuration`);
      }
    });

    // Validate workflows
    Object.entries(this.workflows).forEach(([name, workflow]) => {
      if (!workflow.steps || workflow.steps.length === 0) {
        errors.push(`Workflow ${name} has no steps defined`);
      }
    });

    return errors;
  }

  // Get configuration summary
  getSummary() {
    return {
      repositories: Object.keys(this.repositories).length,
      workflows: Object.keys(this.workflows).length,
      integration_patterns: Object.keys(this.integrationPatterns).length,
      analysis_types: Object.keys(this.analysisTypes).length,
      primary_repository: Object.entries(this.repositories).find(([_, config]) => config.primary)?.[0]
    };
  }
}

module.exports = { GitHubMcpConfig };