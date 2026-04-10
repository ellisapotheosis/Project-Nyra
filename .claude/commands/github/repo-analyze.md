# repo-analyze

Deep analysis of GitHub repository with AI insights.

## Usage
```bash
npx archon-os github repo-analyze [options]
```

## Options
- `--repository <owner/repo>` - Repository to analyze
- `--deep` - Enable deep analysis
- `--include <areas>` - Include specific areas (issues, prs, code, commits)

## Examples
```bash
# Basic analysis
npx archon-os github repo-analyze --repository myorg/myrepo

# Deep analysis
npx archon-os github repo-analyze --repository myorg/myrepo --deep

# Specific areas
npx archon-os github repo-analyze --repository myorg/myrepo --include issues,prs
```
