# Git Workflow Guide - Claude-Flow

This guide explains the Git workflow for managing the forked Claude-Flow repository with upstream synchronization.

## Repository Structure

```
Fork:     https://github.com/ellisapotheosis/claude-flow.git
Upstream: https://github.com/ruvnet/claude-flow.git
```

## Branch Strategy

### Main Branches

- **`main`**: Production-ready code
- **`develop`**: Integration branch for features
- **`feature/*`**: Feature development branches
- **`hotfix/*`**: Emergency fixes for production

### Branch Naming Convention

```bash
feature/short-description
hotfix/issue-number-description
upstream-sync/YYYY-MM-DD
```

## Initial Setup

### 1. Clone Your Fork

```bash
git clone https://github.com/ellisapotheosis/claude-flow.git
cd claude-flow
```

### 2. Add Upstream Remote

```bash
git remote add upstream https://github.com/ruvnet/claude-flow.git
git fetch upstream
```

### 3. Configure Git

```bash
# Enable rebase by default
git config pull.rebase true

# Use diff3 for merge conflicts
git config merge.conflictstyle diff3

# Set up branch tracking
git branch --set-upstream-to=origin/main main
git checkout -b develop
git branch --set-upstream-to=origin/develop develop
```

## Daily Workflow

### Starting a New Feature

```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/my-new-feature

# Work on your feature
# ... make changes ...

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push to fork
git push origin feature/my-new-feature
```

### Creating a Pull Request

1. Push your feature branch to your fork
2. Go to GitHub and create a PR from `feature/my-new-feature` to `develop`
3. Request review from team members
4. Address review comments
5. Merge when approved

### Updating Your Feature Branch

```bash
# Fetch latest changes
git fetch origin

# Rebase on develop
git rebase origin/develop

# Resolve conflicts if any
# ... resolve conflicts ...
git add .
git rebase --continue

# Force push (only for feature branches!)
git push origin feature/my-new-feature --force-with-lease
```

## Upstream Synchronization

### Automated Sync (Recommended)

The repository has automated upstream sync via GitHub Actions:

- **Schedule**: Weekly on Mondays at 00:00 UTC
- **Manual Trigger**: Via GitHub Actions UI
- **Auto-merge**: Configurable for clean merges

### Manual Sync

#### Method 1: Using Script (Recommended)

```bash
./scripts/sync/sync-upstream.sh
```

This script will:
1. Create a backup branch
2. Fetch upstream changes
3. Show differences
4. Attempt merge
5. Handle conflicts
6. Run tests

#### Method 2: Manual Git Commands

```bash
# Fetch upstream
git fetch upstream

# Checkout main or develop
git checkout main

# Create backup
git branch backup-$(date +%Y%m%d-%H%M%S)

# Merge upstream
git merge upstream/main

# Resolve conflicts if needed
# ... resolve conflicts ...
git add .
git commit

# Push to fork
git push origin main
```

### Handling Merge Conflicts

When conflicts occur during upstream sync:

1. **Identify conflicted files**:
   ```bash
   git status
   ```

2. **Resolve conflicts**:
   - Open conflicted files
   - Look for conflict markers: `<<<<<<<`, `=======`, `>>>>>>>`
   - Choose the correct version or merge manually
   - Remove conflict markers

3. **Test resolution**:
   ```bash
   npm run test
   npm run lint
   ```

4. **Complete merge**:
   ```bash
   git add .
   git commit -m "chore: merge upstream changes"
   git push origin main
   ```

## Customization Preservation

### Keep Customizations Separate

Place custom code in dedicated directories:

```
customizations/
├── hooks/          # Custom lifecycle hooks
├── plugins/        # Custom plugins
└── middleware/     # Custom middleware
```

### Configuration Overlays

Use environment-specific configs:

```
config/
├── development/
│   └── config.json    # Override upstream config
├── production/
│   └── config.json    # Override upstream config
└── staging/
    └── config.json    # Override upstream config
```

### Never Modify Core Files

- Avoid editing upstream files directly
- Use extension points and hooks
- Document all customizations
- Keep a separate CUSTOMIZATIONS.md file

## Conflict Prevention

### 1. Regular Syncing

```bash
# Sync weekly
./scripts/sync/sync-upstream.sh
```

### 2. Feature Branches

Always work on feature branches, never directly on `main`:

```bash
git checkout -b feature/my-feature
# ... work ...
git push origin feature/my-feature
```

### 3. Rebase Before Merge

```bash
git fetch upstream
git rebase upstream/main
```

### 4. Review Upstream Changes

```bash
# View upstream changes before merging
git log HEAD..upstream/main --oneline
git diff HEAD..upstream/main
```

## Emergency Procedures

### Rollback Upstream Merge

```bash
# Find the merge commit
git log --oneline --merges

# Reset to before merge
git reset --hard HEAD~1

# Force push (BE CAREFUL!)
git push origin main --force-with-lease
```

### Restore from Backup

```bash
# List backup branches
git branch | grep backup

# Restore from backup
git checkout backup-YYYYMMDD-HHMMSS
git checkout -b main-restored
git push origin main-restored
```

## Best Practices

### Commit Messages

Follow Conventional Commits:

```bash
feat: add new feature
fix: resolve bug
docs: update documentation
chore: update dependencies
refactor: improve code structure
test: add tests
```

### Pull Request Guidelines

1. **Small, focused PRs**: One feature per PR
2. **Clear description**: What, why, and how
3. **Tests included**: Ensure code is tested
4. **Documentation updated**: Keep docs current
5. **Review ready**: Self-review before requesting review

### Code Review

1. **Review within 24 hours**: Keep PRs moving
2. **Constructive feedback**: Be kind and specific
3. **Test locally**: Don't just review code
4. **Approve or request changes**: Clear communication

## Troubleshooting

### Detached HEAD State

```bash
git checkout main
```

### Lost Commits

```bash
# Find lost commits
git reflog

# Restore commit
git checkout <commit-hash>
git checkout -b recovery-branch
```

### Merge Gone Wrong

```bash
# Abort merge
git merge --abort

# Or reset
git reset --hard origin/main
```

### Push Rejected

```bash
# Fetch latest
git fetch origin

# Rebase
git rebase origin/main

# Force push with lease (safer)
git push origin main --force-with-lease
```

## Automation

### Git Hooks

Installed automatically by setup script:

- **pre-commit**: Run linting and tests
- **commit-msg**: Validate commit message format
- **pre-push**: Run full test suite

### GitHub Actions

Automated workflows:

- **CI**: Lint, test, build on every push
- **Upstream Sync**: Weekly sync with upstream
- **Security Scan**: Dependency audits
- **Container Build**: Automated Docker builds

## Support

For Git-related issues:

1. Check this guide
2. Review GitHub Actions logs
3. Consult team members
4. Create an issue in the fork repository

## References

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Upstream Claude-Flow](https://github.com/ruvnet/claude-flow)
