# Secret Scanning

Project Nyra uses **Infisical CLI** for automated secret detection across git history and working tree.

## Quick Start

### Install Infisical CLI

```bash
npm install -g @infisical/cli
# or
brew install infisical/get-cli/infisical
```

### Scan Before Commit

```bash
bash scripts/security/scan-secrets.sh
```

Reports:
- `.reports/security/infisical-full.sarif` — full git history + working tree
- `.reports/security/infisical-working-tree.json` — staging only

### Install Pre-Commit Hook

```bash
bash infra/security/secret-scanning/install-git-hooks.sh
```

Now `git commit` auto-scans before each commit. Bypass with `git commit --no-verify` if needed (emergency only).

## GitHub Actions

Workflow: `.github/workflows/secret-scan.yml`

Runs on:
- Pull requests
- Push to main/master

Uploads SARIF report to GitHub Security tab.

## Configuration

### .infisical-scan.toml (optional)

Custom scanning config. Example:

```toml
[scanning]
# Patterns to ignore
ignore_patterns = [
  "docs/archive/**",
  "node_modules/**",
]

# Entropy threshold
entropy_min = 3.5
```

Place in repo root or scan with `--config-path`.

## Interpreted Patterns

Infisical scans for:

- AWS keys
- Azure credentials
- GitHub tokens
- Private RSA/DSA keys
- Database passwords
- API keys (generic)
- Generic secrets (high entropy strings)
- And 100+ more patterns

See: [Infisical Detection Rules](https://infisical.com/docs/cli/secret-scanning)

## Handling False Positives

If scan flags a false positive (test fixture, example, documentation):

1. Verify it's actually safe (not a real key)
2. Add to `.gitignore` or `.infisical-scan.toml`
3. Or rename to break the pattern (e.g., `EXAMPLE_API_KEY`)

## Remediation Workflow

If a real secret is detected:

1. **Stop commit** — do not push to main
2. **Rotate credential** — revoke in service immediately
3. **Fix in code** — remove or redact
4. **Purge git history** (if committed):
   ```bash
   git reset --hard <commit-before-leak>
   # or
   git filter-branch --force --tree-filter \
     'find . -name "*.env" -o -name "*secret*" | xargs rm -f' \
     HEAD
   ```
5. **Inform security** — if production credential leaked
6. **Commit fix** — with redacted detail
7. **Scan confirms** — run scan again before re-pushing

## CI/CD Integration

GitHub Actions (see `.github/workflows/secret-scan.yml`):

- Runs on every PR
- Runs on every push to main
- Uploads SARIF to GitHub Security tab
- Fails job if critical secrets found

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `infisical: command not found` | Install CLI: `npm install -g @infisical/cli` |
| Scan hangs on large repo | Limit depth: `infisical scan --source . --max-depth 5` |
| False positives in docs | Ignore paths: `infisical scan --source . --ignore-paths "docs/**"` |
| Pre-commit hook not running | Reinstall: `bash infra/security/secret-scanning/install-git-hooks.sh` |
| SARIF upload fails in GHA | Check job permissions: `security-events: write` in workflow |

## References

- [Infisical Secret Scanning Docs](https://infisical.com/docs/cli/secret-scanning)
- [Infisical Detection Rules](https://infisical.com/docs/cli/secret-scanning#detection-rules)
- [SARIF Format](https://sarifweb.azurewebsites.net/)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
