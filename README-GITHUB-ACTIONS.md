# 🚀 NYRA GitHub Actions Setup

This document describes the comprehensive GitHub Actions workflows set up for the NYRA project.

## 🎯 Overview

We've implemented a modern, comprehensive CI/CD pipeline with the following features:

### 📋 Workflows Implemented

1. **🚀 CI/CD Pipeline** (`ci-cd.yml`)
   - Multi-platform testing (Ubuntu, Windows, macOS)
   - Python 3.11 & 3.12 matrix builds
   - Comprehensive code quality checks
   - MCP server testing with Qdrant
   - Security scanning
   - Automated deployments

2. **🔄 Dependency Management** (`dependency-management.yml`)
   - Daily security scans
   - Automated dependency updates
   - Smart PR creation with security status
   - Vulnerability reporting

3. **🏷️ Release & Versioning** (`release.yml`)
   - Semantic versioning based on conventional commits
   - Automated changelog generation
   - PyPI publishing
   - GitHub releases with assets

4. **🔧 Development Workflow** (`dev-workflow.yml`)
   - Auto-labeling of PRs and issues
   - PR title validation (conventional commits)
   - Auto-assignment of reviewers
   - Slash commands for issue management
   - Welcome messages for new contributors

5. **📚 Documentation** (`docs.yml`)
   - API documentation generation with Sphinx
   - README badge updates
   - Project statistics
   - GitHub Pages deployment

## 🔧 Setup Instructions

### 1. Repository Settings

Enable the following in your repository settings:

#### Actions
- Go to **Settings** → **Actions** → **General**
- Set "Actions permissions" to "Allow all actions and reusable workflows"
- Set "Workflow permissions" to "Read and write permissions"
- Check "Allow GitHub Actions to create and approve pull requests"

#### Pages
- Go to **Settings** → **Pages**
- Set source to "GitHub Actions"

#### Environments
Create these environments in **Settings** → **Environments**:

- **staging**: For staging deployments
- **production**: For production deployments (add protection rules)
- **pypi**: For PyPI publishing (add secrets)

### 2. Required Secrets

Add these secrets in **Settings** → **Secrets and variables** → **Actions**:

#### Required for all workflows:
- `GITHUB_TOKEN` (automatically provided)

#### For PyPI publishing:
- `PYPI_API_TOKEN`: Your PyPI API token

#### For CodeCov (optional):
- `CODECOV_TOKEN`: Your Codecov token

#### For deployments (customize as needed):
- `STAGING_API_KEY`: Staging environment API key
- `STAGING_URL`: Staging deployment URL
- `PRODUCTION_API_KEY`: Production environment API key
- `PRODUCTION_URL`: Production deployment URL

#### For notifications (optional):
- `TWITTER_BEARER_TOKEN`: For release announcements

### 3. Branch Protection Rules

Set up branch protection in **Settings** → **Branches**:

#### For `main` branch:
- Require a pull request before merging
- Require status checks to pass before merging:
  - `🔍 Code Quality`
  - `🧪 Tests (Python 3.11, ubuntu-latest)`
  - `🔌 MCP Server Tests`
- Require conversation resolution before merging
- Include administrators

#### For `develop` branch:
- Require a pull request before merging
- Require status checks to pass before merging
- Allow force pushes (for development)

## 🎨 Features Breakdown

### 🚀 CI/CD Pipeline Features

- **Multi-OS Testing**: Tests run on Ubuntu, Windows, and macOS
- **Python Version Matrix**: Tests Python 3.11 and 3.12
- **Smart Caching**: UV cache for faster builds
- **Comprehensive Testing**:
  - Unit tests with pytest
  - Code coverage with codecov
  - MCP server integration tests
  - Security scanning with bandit and safety

### 🔄 Dependency Management

- **Daily Security Scans**: Automated vulnerability detection
- **Smart Updates**: Patch/minor/major update options
- **PR Automation**: Creates PRs with update summaries
- **Security Alerts**: Auto-creates issues for vulnerabilities

### 🏷️ Semantic Releases

- **Conventional Commits**: Enforced PR title format
- **Automatic Versioning**: Based on commit types
- **Changelog Generation**: Automated from commit messages
- **Multi-format Releases**: GitHub releases + PyPI publishing

### 🔧 Development Automation

- **Smart Labeling**: Auto-labels based on file changes
- **Reviewer Assignment**: Based on CODEOWNERS and file patterns
- **Issue Triage**: Auto-categorizes new issues
- **Slash Commands**: `/label`, `/assign`, `/close`, `/help`

### 📚 Documentation Automation

- **API Docs**: Sphinx-generated documentation
- **Badge Updates**: Automatic README badge maintenance
- **GitHub Pages**: Auto-deployed documentation site
- **Usage Examples**: Generated code examples

## 🎯 Workflow Triggers

### Push Events
- `main`, `develop`, `feature/*` branches
- Excludes markdown and documentation changes for CI/CD

### Pull Request Events
- Targets `main` and `develop` branches
- Triggers all quality checks and tests

### Scheduled Events
- **Daily at 2 AM UTC**: Dependency security scans
- **Weekly**: Dependency health reports

### Manual Triggers
- All workflows support manual dispatch
- Customizable parameters for different scenarios

## 🏅 Quality Gates

### For Merging to Main
1. ✅ Code quality checks pass (ruff, mypy)
2. ✅ All tests pass on multiple platforms
3. ✅ MCP servers tests pass
4. ✅ Security scans pass
5. ✅ PR title follows conventional commits
6. ✅ Required reviewers approve

### For Releases
1. ✅ All CI/CD checks pass
2. ✅ Conventional commit analysis
3. ✅ Build artifacts created
4. ✅ Documentation updated
5. ✅ Security verification

## 🎮 Usage Examples

### Creating a Feature
```bash
# Create feature branch
git checkout -b feature/add-new-mcp-server

# Make changes with conventional commits
git commit -m "feat(mcp): add qdrant vector database integration"

# Push and create PR
git push origin feature/add-new-mcp-server
```

### Managing Issues
```
# In issue/PR comments, use slash commands:
/label bug, mcp
/assign @ellisapotheosis
/help
```

### Manual Dependency Update
- Go to **Actions** → **🔄 Dependency Management**
- Click "Run workflow"
- Choose update type (patch/minor/major)
- Select whether to create PR

### Manual Release
- Go to **Actions** → **🏷️ Release & Version**  
- Click "Run workflow"
- Choose version type or let it auto-detect

## 📊 Monitoring & Reports

### Workflow Status
- Check **Actions** tab for workflow runs
- View detailed logs and summaries
- Download artifacts (test reports, builds, etc.)

### Documentation
- Auto-deployed to GitHub Pages
- Updated badges in README
- API documentation with examples

### Security
- Daily vulnerability scans
- Automated security issue creation
- Dependency health reports

## 🔧 Customization

### Adding New Workflows
1. Create `.github/workflows/your-workflow.yml`
2. Follow the established patterns
3. Use the same permissions and structure

### Modifying Existing Workflows
1. Edit the workflow files
2. Test with manual triggers first
3. Update this documentation

### Adding Secrets
1. Add to repository secrets
2. Reference in workflow files
3. Document in this README

## 🎉 Benefits

✨ **For Developers:**
- Automated code quality enforcement
- Fast feedback on changes
- Simplified release process
- Comprehensive testing

🚀 **For Project Management:**
- Automated issue triage
- Release automation
- Security monitoring
- Documentation maintenance

🛡️ **For Security:**
- Daily vulnerability scans
- Automated dependency updates
- Security-first development workflow

📈 **For Growth:**
- Welcoming to new contributors
- Comprehensive documentation
- Automated release announcements
- Professional development process

## 🆘 Troubleshooting

### Common Issues

**Workflow fails on Windows:**
- Check file paths (use forward slashes)
- Verify PowerShell vs bash commands

**Secrets not found:**
- Verify secret names match exactly
- Check environment restrictions

**Tests timeout:**
- Increase timeout in workflow
- Optimize test performance

**Deploy fails:**
- Check environment protection rules
- Verify deployment secrets

### Getting Help

1. Check workflow logs in Actions tab
2. Review this documentation
3. Create an issue with the `github-actions` label
4. Use `/help` command in issues for available commands

---

## 🙏 Contributing

This GitHub Actions setup is designed to make contributing to NYRA as smooth as possible. The workflows will guide you through the process and ensure high quality standards are maintained.

**Happy coding!** 🚀