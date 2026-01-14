# CI/CD Troubleshooting Guide

Comprehensive troubleshooting guide for common CI/CD pipeline issues.

## Quick Diagnostics

### Workflow Status Check

```bash
# List recent workflow runs
gh run list --limit 10

# View specific run details
gh run view <run-id>

# Download run logs
gh run download <run-id>

# Watch run in real-time
gh run watch <run-id>
```

### Common Commands

```bash
# Restart failed workflow
gh run rerun <run-id>

# Restart only failed jobs
gh run rerun <run-id> --failed

# Cancel running workflow
gh run cancel <run-id>

# Trigger workflow manually
gh workflow run <workflow-name>
```

## CI Workflow Issues

### Tests Failing in CI But Pass Locally

**Symptoms**:
- Tests pass on local machine
- Same tests fail in GitHub Actions
- Error: "Cannot find module" or timeout errors

**Diagnosis**:
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check environment differences
env | grep NODE
```

**Solutions**:

1. **Version Mismatch**:
   ```yaml
   # Ensure matching Node version
   - uses: actions/setup-node@v4
     with:
       node-version: '20'  # Match your local version
   ```

2. **Missing Dependencies**:
   ```yaml
   # Ensure clean install
   - run: npm ci  # Not npm install
   ```

3. **Environment Variables**:
   ```yaml
   # Add missing env vars
   env:
     NODE_ENV: test
     CI: true
   ```

4. **Timing Issues**:
   ```javascript
   // Increase test timeouts
   jest.setTimeout(30000);  // 30 seconds

   // Use waitFor in tests
   await waitFor(() => expect(element).toBeVisible(), {
     timeout: 5000
   });
   ```

### Workflow Not Triggering

**Symptoms**:
- Push to branch doesn't trigger workflow
- No workflow runs appear

**Diagnosis**:
```bash
# Check workflow syntax
actionlint .github/workflows/*.yml

# Validate YAML
yamllint .github/workflows/*.yml
```

**Solutions**:

1. **Path Filters**:
   ```yaml
   # Check if paths are too restrictive
   on:
     push:
       paths:
         - '**'  # Temporarily allow all paths
   ```

2. **Branch Protection**:
   ```bash
   # Verify branch name matches
   git branch --show-current
   ```

3. **Workflow File Location**:
   ```bash
   # Must be in .github/workflows/
   ls -la .github/workflows/
   ```

4. **YAML Syntax Error**:
   ```bash
   # Use online validator
   # Or install actionlint
   brew install actionlint
   actionlint
   ```

### Cache Issues

**Symptoms**:
- Build takes too long
- "Failed to restore cache" errors
- Outdated dependencies

**Solutions**:

1. **Clear Cache**:
   ```bash
   # Via GitHub UI: Actions → Caches → Delete

   # Or update cache key
   - uses: actions/cache@v4
     with:
       key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}-v2
   ```

2. **Cache Not Found**:
   ```yaml
   # Add restore-keys fallback
   restore-keys: |
     ${{ runner.os }}-node-
   ```

3. **Cache Corruption**:
   ```bash
   # Force fresh install
   npm ci --cache-clean
   ```

## Deployment Issues

### Staging Deployment Fails

**Symptoms**:
- Docker image builds but deployment fails
- Health checks timeout
- Service not accessible

**Diagnosis**:
```bash
# Check container status
docker ps -a

# View container logs
docker logs <container-name>

# Check health
curl -v http://localhost:3000/health

# Inspect container
docker inspect <container-name>
```

**Solutions**:

1. **Container Not Starting**:
   ```bash
   # Check logs for errors
   docker logs orchestrator-staging --tail 100

   # Try running interactively
   docker run -it --entrypoint /bin/sh <image>
   ```

2. **Port Conflicts**:
   ```bash
   # Check if port is already in use
   netstat -tlnp | grep 3000

   # Stop conflicting service
   docker stop <conflicting-container>
   ```

3. **Environment Variables Missing**:
   ```bash
   # Verify .env file
   cat .env.staging

   # Check container env
   docker exec <container> env
   ```

4. **Health Check Timeout**:
   ```yaml
   # Increase timeout in workflow
   - name: Wait for health
     run: |
       timeout 300s bash -c 'until curl -f http://localhost:3000/health; do sleep 5; done'
   ```

5. **Database Connection Failed**:
   ```bash
   # Test database connectivity
   docker exec <container> psql $DATABASE_URL -c "SELECT 1;"

   # Check database is running
   docker ps | grep postgres
   ```

### Production Deployment Rollback

**Symptoms**:
- Deployment succeeded but application is broken
- Need to rollback to previous version

**Manual Rollback**:

```bash
# 1. Switch load balancer back to green
# Edit nginx/load balancer config

# 2. Stop blue containers
docker stop orchestrator-blue

# 3. Restart green (previous version)
docker start orchestrator-green

# 4. Verify health
curl https://production.example.com/health

# 5. Create incident issue
gh issue create --title "Production Rollback - $(date)" --body "Rolled back deployment due to: [reason]"
```

**Automated Rollback via Workflow**:

```bash
gh workflow run cd-production.yml -f rollback_version=v1.2.3
```

### Blue-Green Deployment Issues

**Symptoms**:
- Traffic switch fails
- Both environments running
- Load balancer not updating

**Solutions**:

1. **Check Load Balancer Config**:
   ```bash
   # Verify nginx config
   nginx -t

   # Reload configuration
   nginx -s reload
   ```

2. **Manual Traffic Switch**:
   ```bash
   # Update upstream in nginx.conf
   upstream backend {
       server localhost:3001;  # Blue port
   }

   # Reload
   nginx -s reload
   ```

3. **Both Environments Receiving Traffic**:
   ```bash
   # Stop old environment
   docker stop orchestrator-green

   # Verify only blue is running
   docker ps | grep orchestrator
   ```

## Docker Issues

### Docker Build Timeout

**Symptoms**:
- Build hangs or times out
- "context deadline exceeded" errors

**Solutions**:

1. **Increase Timeout**:
   ```yaml
   timeout-minutes: 60  # Increase from default 360
   ```

2. **Optimize Dockerfile**:
   ```dockerfile
   # Use smaller base image
   FROM node:20-alpine

   # Copy package files first
   COPY package*.json ./
   RUN npm ci --only=production

   # Then copy source
   COPY . .
   ```

3. **Enable BuildKit**:
   ```yaml
   env:
     DOCKER_BUILDKIT: 1
   ```

4. **Use Cache Effectively**:
   ```yaml
   - uses: docker/build-push-action@v5
     with:
       cache-from: type=gha
       cache-to: type=gha,mode=max
   ```

### Multi-Arch Build Failures

**Symptoms**:
- amd64 builds succeed, arm64 fails
- "exec format error"

**Solutions**:

1. **Install QEMU**:
   ```yaml
   - name: Set up QEMU
     uses: docker/setup-qemu-action@v3
   ```

2. **Platform-Specific Issues**:
   ```dockerfile
   # Use compatible packages
   RUN apk add --no-cache \
       --platform=$BUILDPLATFORM \
       build-base
   ```

3. **Skip arm64 Temporarily**:
   ```yaml
   platforms: linux/amd64  # Remove arm64
   ```

### Image Push Failed

**Symptoms**:
- Build succeeds but push fails
- Authentication errors

**Solutions**:

1. **Check Registry Login**:
   ```yaml
   - uses: docker/login-action@v3
     with:
       registry: ghcr.io
       username: ${{ github.actor }}
       password: ${{ secrets.GITHUB_TOKEN }}
   ```

2. **Verify Token Permissions**:
   ```yaml
   permissions:
     contents: read
     packages: write
   ```

3. **Check Registry Status**:
   ```bash
   # Test authentication
   echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin

   # Check registry
   curl -H "Authorization: Bearer $TOKEN" https://ghcr.io/v2/
   ```

## Security Scan Issues

### Vulnerability Scan Failures

**Symptoms**:
- Trivy or Grype reports critical vulnerabilities
- Build fails due to security threshold

**Solutions**:

1. **Review Vulnerabilities**:
   ```bash
   # Run locally
   docker run --rm -v $(pwd):/repo aquasec/trivy:latest fs /repo

   # Check specific image
   trivy image <image-name>
   ```

2. **Update Dependencies**:
   ```bash
   # Update to patch versions
   npm update

   # Check for outdated packages
   npm outdated
   ```

3. **Suppress False Positives**:
   ```yaml
   # .trivyignore
   CVE-2021-1234  # Not applicable - reason
   ```

4. **Adjust Severity Threshold**:
   ```yaml
   severity: 'CRITICAL'  # Only fail on critical
   ```

### Secret Detection Alerts

**Symptoms**:
- Gitleaks or TruffleHog finds secrets
- Workflow blocked

**Solutions**:

1. **Remove Secret from History**:
   ```bash
   # Use git-filter-repo
   pip install git-filter-repo
   git filter-repo --path-glob '**/secrets.yaml' --invert-paths

   # Force push (BE CAREFUL)
   git push --force
   ```

2. **Rotate Compromised Secret**:
   ```bash
   # Generate new secret
   NEW_SECRET=$(openssl rand -base64 32)

   # Update in Infisical
   infisical secrets set API_KEY "$NEW_SECRET" --env=production

   # Revoke old secret
   ```

3. **Add to Allowlist**:
   ```yaml
   # .gitleaks.toml
   [allowlist]
   paths = [
       '''go\.sum$''',
       '''(.*?)(jpg|gif|doc)$'''
   ]
   ```

## E2E Test Issues

### Playwright Tests Failing

**Symptoms**:
- Tests fail with timeout errors
- Screenshots show incomplete page loads
- "Element not found" errors

**Solutions**:

1. **Increase Timeouts**:
   ```javascript
   // playwright.config.js
   export default {
     timeout: 60000,  // 60 seconds
     expect: {
       timeout: 10000  // 10 seconds
     }
   };
   ```

2. **Wait for Network Idle**:
   ```javascript
   await page.goto('https://example.com', {
     waitUntil: 'networkidle'
   });
   ```

3. **Explicit Waits**:
   ```javascript
   await page.waitForSelector('#element', { state: 'visible' });
   ```

4. **Enable Retries**:
   ```javascript
   test.describe.configure({ retries: 2 });
   ```

### Visual Regression Failures

**Symptoms**:
- Screenshot diffs showing differences
- Tests failing due to minor visual changes

**Solutions**:

1. **Update Baselines**:
   ```bash
   # Update screenshots locally
   npm run test:visual -- --update-snapshots

   # Commit new baselines
   git add test-results/**/*.png
   git commit -m "Update visual baselines"
   ```

2. **Adjust Threshold**:
   ```javascript
   await expect(page).toHaveScreenshot({
     maxDiffPixels: 100  // Allow minor differences
   });
   ```

3. **Mask Dynamic Content**:
   ```javascript
   await expect(page).toHaveScreenshot({
     mask: [page.locator('.timestamp')]
   });
   ```

### Browser-Specific Failures

**Symptoms**:
- Tests pass in Chrome, fail in Firefox
- WebKit-specific issues

**Solutions**:

1. **Skip Problematic Browser**:
   ```javascript
   test.skip(({ browserName }) => browserName === 'webkit', 'Skipping WebKit');
   ```

2. **Browser-Specific Selectors**:
   ```javascript
   const selector = browserName === 'firefox'
     ? '#firefox-selector'
     : '#chrome-selector';
   ```

3. **Debug Locally**:
   ```bash
   # Run specific browser
   npx playwright test --project=firefox --headed

   # Debug mode
   npx playwright test --debug
   ```

## Performance Issues

### Slow Workflow Execution

**Symptoms**:
- Workflows taking too long
- Jobs queuing for extended periods

**Solutions**:

1. **Optimize Dependency Installation**:
   ```yaml
   # Use npm ci instead of npm install
   - run: npm ci --prefer-offline
   ```

2. **Parallel Jobs**:
   ```yaml
   strategy:
     matrix:
       node: [18, 20]
     max-parallel: 4  # Run in parallel
   ```

3. **Cancel Redundant Runs**:
   ```yaml
   concurrency:
     group: ${{ github.workflow }}-${{ github.ref }}
     cancel-in-progress: true
   ```

4. **Skip Unnecessary Steps**:
   ```yaml
   - name: Run tests
     if: github.event_name != 'workflow_dispatch'
     run: npm test
   ```

### Runner Out of Disk Space

**Symptoms**:
- "No space left on device" errors
- Build artifacts too large

**Solutions**:

1. **Clean Docker**:
   ```yaml
   - name: Clean Docker
     run: docker system prune -af
   ```

2. **Reduce Artifact Size**:
   ```yaml
   - uses: actions/upload-artifact@v4
     with:
       name: results
       path: |
         test-results/**/*.json
         !test-results/**/*.png  # Exclude large files
   ```

3. **Use Larger Runner**:
   ```yaml
   runs-on: ubuntu-latest-4-cores  # Larger runner
   ```

## Access and Permission Issues

### Secret Not Found

**Symptoms**:
- "Secret {name} not found"
- Variables undefined in workflow

**Solutions**:

1. **Verify Secret Name**:
   ```bash
   # List secrets
   gh secret list

   # Secret names are case-sensitive
   ${{ secrets.API_KEY }}  # Not api_key
   ```

2. **Check Environment**:
   ```yaml
   environment:
     name: production  # Must match secret environment
   ```

3. **Verify Permissions**:
   ```yaml
   permissions:
     contents: read
     secrets: read  # If needed
   ```

### Environment Protection Rules

**Symptoms**:
- Deployment job waiting for approval
- "Required reviewers" blocking deployment

**Solutions**:

1. **Check Protection Rules**:
   - Go to Settings → Environments → production
   - Review required reviewers
   - Approve deployment

2. **Bypass for Testing**:
   ```yaml
   environment:
     name: staging  # Use different environment
   ```

### Token Permission Denied

**Symptoms**:
- "Resource not accessible by token"
- "Permission denied" errors

**Solutions**:

1. **Add Permissions**:
   ```yaml
   permissions:
     contents: write
     packages: write
     pull-requests: write
   ```

2. **Use PAT Instead**:
   ```yaml
   - uses: actions/checkout@v4
     with:
       token: ${{ secrets.PAT_TOKEN }}
   ```

## Debugging Techniques

### Enable Debug Logging

```bash
# Set repository secrets
gh secret set ACTIONS_RUNNER_DEBUG -b"true"
gh secret set ACTIONS_STEP_DEBUG -b"true"
```

### Add Debug Steps

```yaml
- name: Debug info
  run: |
    echo "Runner OS: ${{ runner.os }}"
    echo "Event: ${{ github.event_name }}"
    echo "Ref: ${{ github.ref }}"
    echo "SHA: ${{ github.sha }}"
    env | sort
```

### Use step-summary

```yaml
- name: Generate report
  run: |
    echo "### Test Results" >> $GITHUB_STEP_SUMMARY
    echo "- Tests passed: 42" >> $GITHUB_STEP_SUMMARY
    echo "- Tests failed: 3" >> $GITHUB_STEP_SUMMARY
```

### Interactive Debugging

```yaml
- name: Setup tmate session
  if: failure()
  uses: mxschmitt/action-tmate@v3
  timeout-minutes: 30
```

## Getting Help

### Workflow Logs

```bash
# View logs
gh run view <run-id> --log

# Download logs
gh run download <run-id>

# Watch in real-time
gh run watch
```

### Documentation

- [GitHub Actions Docs](https://docs.github.com/actions)
- [Workflow Syntax](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions)
- [Common Issues](https://docs.github.com/actions/monitoring-and-troubleshooting-workflows)

### Support Channels

- GitHub Community Forum
- Stack Overflow (tag: github-actions)
- Internal DevOps team
- Create issue in this repository

---

**Last Updated**: 2025-12-31
**Maintainer**: DevOps Team
