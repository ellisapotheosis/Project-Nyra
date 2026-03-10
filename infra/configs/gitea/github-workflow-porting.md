# GitHub -> Gitea Workflow Porting Pass

This pass reviewed `.github/workflows` and reused portable patterns in `.gitea/workflows`.

## Reused patterns

- Dependency bootstrap with Node 20 + pnpm 10.27.0
- Monorepo install/build/test flow
- Explicit private npm token handling (`NPM_TOKEN`)
- Deploy gate via secret switch (`NYRA_DEPLOY_ENABLED`)

## Workflows intentionally kept GitHub-only

- `codeql.yml` and SARIF upload jobs
- `deploy-pages` workflows (GitHub Pages specific)
- Dependabot and GH metadata workflows
- `mirror-to-gitea` (direction is GitHub -> Gitea only)

## Native Gitea replacement delivered

- `.gitea/workflows/ci-cd.yml`

This workflow provides:

1. CI on push/PR: install, build, test
2. CD on `main` using self-hosted runner with orchestrator bootstrap script
