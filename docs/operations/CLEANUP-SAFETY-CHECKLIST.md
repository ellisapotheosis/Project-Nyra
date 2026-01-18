# Docker Configuration Cleanup - Safety Checklist & Validation

**Document Version**: 1.0
**Date**: 2026-01-17
**Reviewed By**: Code Review Agent
**Status**: Ready for Review

---

## Executive Summary

This document provides a comprehensive safety checklist and validation procedures for the Docker configuration consolidation process described in `docs/architecture/INFRASTRUCTURE-CONSOLIDATION-PLAN.md`.

### Risk Assessment: LOW-MEDIUM

- **Archive-First Approach**: ✅ Files are archived before any deletion
- **No Automatic Deletion**: ✅ Manual removal required after verification
- **Rollback Capability**: ⚠️ Needs improvement (see recommendations)
- **Git History**: ⚠️ Needs `git mv` instead of `rm` for moved files

---

## 🔒 Security Review

### 1. Path Traversal Protection

**Status**: ✅ SAFE (with recommendations)

**Analysis**:
```bash
# Current implementation (consolidate-docker-configs.sh:72-77)
find . -name "docker-compose*.yml" -type f \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/_archive/*" \
    ! -path "*/_backup/*"
```

**Findings**:
- Uses `find` with explicit exclusions
- Processes paths within repository only
- No external input used in path construction
- File operations use relative paths from `$REPO_ROOT`

**Recommendations**:
1. Add validation to ensure all paths are within `$REPO_ROOT`
2. Sanitize file paths before processing
3. Add bounds checking for archive destination

**Validation**:
```bash
# Add to script before processing files
validate_path() {
    local path="$1"
    local canonical=$(realpath -m "$path")
    local repo_canonical=$(realpath -m "$REPO_ROOT")

    if [[ ! "$canonical" == "$repo_canonical"* ]]; then
        echo "ERROR: Path outside repository: $path"
        return 1
    fi
    return 0
}
```

---

### 2. Code Injection Prevention

**Status**: ✅ SAFE

**Analysis**:
- No `eval` or dynamic code execution
- No user input processed as commands
- File parsing uses safe grep/sed operations
- Service names extracted via regex, not executed

**Potential Risks**:
- Service names with special characters could cause grep/sed issues
- YAML parsing is text-based, not using proper YAML parser

**Recommendations**:
1. Use Python YAML parser for robust parsing (as planned)
2. Escape special characters in service names
3. Validate YAML structure before processing

---

### 3. Secret Exposure

**Status**: ⚠️ NEEDS ATTENTION

**Findings**:
- Docker Compose files may contain secrets in environment variables
- Archive directory not added to `.gitignore`
- No secret scanning before archiving

**Critical Issues**:
```yaml
# Example of secrets that might be in compose files:
environment:
  - DATABASE_PASSWORD=supersecret123
  - API_KEY=sk-abc123xyz
  - INFISICAL_CLIENT_SECRET=...
```

**MANDATORY ACTIONS**:
1. Add `_archive/` to `.gitignore` (currently missing)
2. Scan archived files for potential secrets
3. Redact secrets in archived files if they will be committed
4. Use Infisical for all secrets in consolidated compose

---

### 4. File Permissions & Ownership

**Status**: ✅ SAFE

**Analysis**:
- Archive maintains directory structure
- No permission changes during copy
- Original files remain untouched until manual deletion

**Recommendations**:
1. Document permission requirements for archived files
2. Ensure `.env` files maintain restrictive permissions (600)

---

## 📋 Pre-Execution Checklist

### Phase 1: Preparation (MANDATORY)

- [ ] **1.1 Git Status Clean**
  ```bash
  cd C:\Dev\Projects\Repos\Project-Nyra
  git status
  # Ensure: "working tree clean" or all changes committed
  ```

- [ ] **1.2 Create Git Snapshot**
  ```bash
  git tag -a cleanup-pre-consolidation-$(date +%Y%m%d) -m "Snapshot before docker consolidation"
  git push origin cleanup-pre-consolidation-$(date +%Y%m%d)
  ```

- [ ] **1.3 Backup Critical Files**
  ```bash
  mkdir -p _backup/critical-configs-$(date +%Y%m%d)
  cp bootstrap/docker/docker-compose.yml _backup/critical-configs-$(date +%Y%m%d)/
  cp infra/docker/docker-compose.yml _backup/critical-configs-$(date +%Y%m%d)/
  cp -r infra/configs/ _backup/critical-configs-$(date +%Y%m%d)/
  ```

- [ ] **1.4 Verify Docker Services Running**
  ```bash
  docker ps
  # Document all running containers before cleanup
  docker ps > _backup/running-containers-pre-cleanup.txt
  ```

- [ ] **1.5 Update .gitignore**
  ```bash
  echo "_archive/" >> .gitignore
  echo "_backup/" >> .gitignore
  git add .gitignore
  git commit -m "chore: add archive and backup to gitignore"
  ```

### Phase 2: Script Validation (MANDATORY)

- [ ] **2.1 Run Dry-Run Mode**
  ```powershell
  .\infra\scripts\consolidate-docker-configs.ps1 -DryRun
  ```

- [ ] **2.2 Review Script Permissions**
  ```bash
  ls -la infra/scripts/consolidate-docker-configs.sh
  # Ensure: -rwxr-xr-x (executable, not world-writable)
  ```

- [ ] **2.3 Verify Bash Availability**
  ```powershell
  # The PowerShell script checks this, but verify manually:
  where.exe bash
  # OR
  wsl --version
  ```

- [ ] **2.4 Test Archive Directory Creation**
  ```bash
  mkdir -p _archive/test-$(date +%Y%m%d)
  # Verify: no permission errors
  rm -rf _archive/test-*
  ```

### Phase 3: Execution Safety (MANDATORY)

- [ ] **3.1 Run Consolidation Script**
  ```powershell
  .\infra\scripts\consolidate-docker-configs.ps1
  ```

- [ ] **3.2 Verify Archive Integrity**
  ```bash
  # Check archive was created
  ls -la _archive/docker-configs-*/

  # Verify file count matches
  find . -name "docker-compose*.yml" -type f \
      ! -path "*/node_modules/*" \
      ! -path "*/.git/*" \
      ! -path "*/_archive/*" | wc -l

  find _archive/docker-configs-*/files -name "docker-compose*.yml" | wc -l
  # Both counts should match
  ```

- [ ] **3.3 Review Analysis Reports**
  ```bash
  cat infra/analysis/CONSOLIDATION-REPORT.md
  cat infra/analysis/missing-from-bootstrap.txt
  ```

- [ ] **3.4 Scan for Secrets in Archive**
  ```bash
  # Use trufflehog, gitleaks, or grep patterns
  grep -r "PASSWORD\|SECRET\|KEY\|TOKEN" _archive/docker-configs-*/ | tee _backup/potential-secrets.txt
  # Review and redact if necessary
  ```

---

## 🛡️ Critical File Protection

### Files That Must NEVER Be Deleted Without Backup

1. **Gold Standard Configurations**
   - `bootstrap/docker/docker-compose.yml` ✅ Archive before any changes
   - `bootstrap/docker/docker-compose.dev.yml`
   - `bootstrap/docker/docker-compose.prod.yml`
   - `bootstrap/docker/Makefile`

2. **Production Infrastructure**
   - `infra/docker/docker-compose.yml` ✅ Archive before merge
   - `infra/docker/docker-compose.monitoring.yml`
   - `infra/docker/docker-compose.services.yml`

3. **Secrets and Configurations**
   - `.env` files (all environments)
   - `infra/configs/infisical/` directory
   - `infra/configs/nginx/` directory
   - `infra/configs/nexus/` directory

4. **Database Volumes**
   - Docker volumes containing data (backup before cleanup)
   - `postgres_data`, `mongo_data`, `redis_data` volumes

### Verification Commands

```bash
# Ensure critical files exist before and after
critical_files=(
    "bootstrap/docker/docker-compose.yml"
    "bootstrap/docker/docker-compose.dev.yml"
    "bootstrap/docker/docker-compose.prod.yml"
    "infra/docker/docker-compose.yml"
)

for file in "${critical_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ CRITICAL: $file is missing!"
        exit 1
    fi
    echo "✓ $file exists"
done
```

---

## 🔄 Git History Preservation

### WRONG Approach (Loses History)

```bash
# ❌ DO NOT DO THIS - Loses git history
rm docker-compose.yml
rm -rf bootstrap-kit-pc1/
```

### CORRECT Approach (Preserves History)

```bash
# ✅ DO THIS - Preserves git history with 'git mv'

# For files moving to new locations:
git mv docker-compose.yml _archive/docker-configs-2026-01-17/root-docker-compose.yml
git commit -m "chore: archive root docker-compose.yml to consolidate configs"

# For deprecated directories:
git mv bootstrap-kit-pc1 _archive/bootstrap-kit-pc1
git commit -m "chore: archive PC-specific bootstrap configs"

# For true deletion (only after verification):
git rm docker-compose.memory.yml
git commit -m "chore: remove deprecated memory system config (replaced by graphiti/mem0)"
```

### Git Commit Strategy

```bash
# 1. Archive files first (preserves history)
git mv <old-path> _archive/<new-path>
git commit -m "chore: archive scattered docker configs for consolidation"

# 2. Create consolidated configs (new file)
# (manually create infra/docker-compose.yml)
git add infra/docker-compose.yml
git commit -m "feat: create consolidated docker-compose.yml with all services"

# 3. Update references (multiple files)
git add -A  # Add all updated script references
git commit -m "chore: update all scripts to reference consolidated infra/docker-compose.yml"

# 4. Remove truly deprecated files (only after testing)
git rm <deprecated-file>
git commit -m "chore: remove deprecated config (replaced by X)"
```

---

## 🔙 Rollback Procedures

### Scenario 1: Script Fails During Execution

**Action**: Rollback is automatic (original files untouched)

```bash
# Verify original files intact
ls -la bootstrap/docker/docker-compose.yml
ls -la infra/docker/docker-compose.yml

# Remove incomplete archive
rm -rf _archive/docker-configs-$(date +%Y-%m-%d)*
```

### Scenario 2: Consolidated Config Has Issues

**Action**: Restore from bootstrap gold standard

```bash
# Option A: Use bootstrap version directly
cd bootstrap/docker
docker-compose up -d

# Option B: Restore from backup
cp _backup/critical-configs-*/docker-compose.yml infra/docker/docker-compose.yml

# Option C: Revert git commit
git log --oneline | head -5  # Find commit hash
git revert <commit-hash>
```

### Scenario 3: Services Fail After Consolidation

**Action**: Complete rollback from Git snapshot

```bash
# 1. Stop all services
docker-compose down

# 2. Restore from Git tag
git checkout cleanup-pre-consolidation-$(date +%Y%m%d)

# 3. Restart services with old configs
cd bootstrap/docker
docker-compose up -d

# 4. Create new branch to investigate
git checkout -b investigate-consolidation-issues
```

### Scenario 4: Accidental File Deletion

**Action**: Restore from archive or Git

```bash
# From archive
cp _archive/docker-configs-*/files/<path>/<file> <original-path>/<file>

# From Git (if committed)
git checkout HEAD~1 -- <file-path>

# From backup
cp _backup/critical-configs-*/<file> <original-path>/<file>
```

---

## 🧪 Validation Script

**File**: `infra/scripts/validate-consolidation.sh`

```bash
#!/bin/bash
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

REPO_ROOT="C:/Dev/Projects/Repos/Project-Nyra"
ERRORS=0

log_error() {
    echo -e "${RED}✗${NC} $1"
    ((ERRORS++))
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo "=== Docker Consolidation Validation ==="
echo ""

# 1. Verify critical files exist
echo "1. Checking critical files..."
critical_files=(
    "bootstrap/docker/docker-compose.yml"
    "bootstrap/docker/docker-compose.dev.yml"
    "bootstrap/docker/docker-compose.prod.yml"
    "bootstrap/docker/Makefile"
)

for file in "${critical_files[@]}"; do
    if [ -f "$REPO_ROOT/$file" ]; then
        log_success "$file exists"
    else
        log_error "$file is MISSING!"
    fi
done

# 2. Verify archive integrity
echo ""
echo "2. Checking archive integrity..."
LATEST_ARCHIVE=$(ls -td _archive/docker-configs-* 2>/dev/null | head -1)
if [ -n "$LATEST_ARCHIVE" ]; then
    log_success "Archive found: $LATEST_ARCHIVE"

    if [ -f "$LATEST_ARCHIVE/file-list.txt" ]; then
        ARCHIVED_COUNT=$(wc -l < "$LATEST_ARCHIVE/file-list.txt")
        log_success "Archived $ARCHIVED_COUNT files"
    else
        log_error "Missing file-list.txt in archive"
    fi

    if [ -f "$LATEST_ARCHIVE/inventory.txt" ]; then
        log_success "Inventory file exists"
    else
        log_error "Missing inventory.txt in archive"
    fi
else
    log_warning "No archive found (may not have run yet)"
fi

# 3. Check for secrets in archives
echo ""
echo "3. Scanning for potential secrets..."
if [ -n "$LATEST_ARCHIVE" ]; then
    SECRET_PATTERNS="PASSWORD|SECRET|KEY|TOKEN|CREDENTIAL"
    SECRETS_FOUND=$(grep -r -E "$SECRET_PATTERNS" "$LATEST_ARCHIVE" | wc -l)

    if [ "$SECRETS_FOUND" -gt 0 ]; then
        log_warning "Found $SECRETS_FOUND potential secret references in archive"
        log_warning "Review: grep -r -E '$SECRET_PATTERNS' $LATEST_ARCHIVE"
    else
        log_success "No obvious secrets found in archive"
    fi
fi

# 4. Verify .gitignore updated
echo ""
echo "4. Checking .gitignore..."
if grep -q "_archive/" .gitignore; then
    log_success "_archive/ is in .gitignore"
else
    log_warning "_archive/ NOT in .gitignore - add it to prevent committing archives"
fi

if grep -q "_backup/" .gitignore; then
    log_success "_backup/ is in .gitignore"
else
    log_warning "_backup/ NOT in .gitignore - add it to prevent committing backups"
fi

# 5. Check Git status
echo ""
echo "5. Checking Git status..."
if git diff --quiet; then
    log_success "No uncommitted changes in tracked files"
else
    log_warning "You have uncommitted changes - review before proceeding"
fi

# 6. Verify Docker Compose syntax
echo ""
echo "6. Validating Docker Compose syntax..."
if [ -f "infra/docker-compose.yml" ]; then
    if docker-compose -f infra/docker-compose.yml config > /dev/null 2>&1; then
        log_success "infra/docker-compose.yml syntax is valid"
    else
        log_error "infra/docker-compose.yml has syntax errors!"
    fi
else
    log_warning "infra/docker-compose.yml not created yet"
fi

if [ -f "bootstrap/docker/docker-compose.yml" ]; then
    if docker-compose -f bootstrap/docker/docker-compose.yml config > /dev/null 2>&1; then
        log_success "bootstrap/docker/docker-compose.yml syntax is valid"
    else
        log_error "bootstrap/docker/docker-compose.yml has syntax errors!"
    fi
fi

# 7. Verify Docker daemon
echo ""
echo "7. Checking Docker daemon..."
if docker info > /dev/null 2>&1; then
    log_success "Docker daemon is running"
else
    log_error "Docker daemon is NOT running!"
fi

# 8. Check for broken symlinks
echo ""
echo "8. Checking for broken symlinks..."
BROKEN_LINKS=$(find . -type l ! -exec test -e {} \; -print 2>/dev/null | wc -l)
if [ "$BROKEN_LINKS" -eq 0 ]; then
    log_success "No broken symlinks found"
else
    log_warning "Found $BROKEN_LINKS broken symlinks"
fi

# Summary
echo ""
echo "=== Validation Summary ==="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All critical checks passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Found $ERRORS critical issues!${NC}"
    echo "Please address issues before proceeding with consolidation."
    exit 1
fi
```

---

## 📊 Breaking Changes Documentation

### Changes That Will Break Existing Workflows

#### 1. File Path Changes

**Before**:
```bash
docker-compose -f ./docker-compose.yml up -d
docker-compose -f bootstrap-kit-pc1/docker-compose.yml up -d
```

**After**:
```bash
docker-compose -f infra/docker-compose.yml up -d
docker-compose -f infra/docker-compose.yml --profile pc1 up -d
```

**Impact**: All scripts, CI/CD, and documentation referencing old paths will break

**Migration Required**:
- [ ] Update CI/CD workflows (.github/workflows/*)
- [ ] Update deployment scripts (scripts/*)
- [ ] Update documentation (docs/*)
- [ ] Update developer setup guides
- [ ] Update Makefile targets

#### 2. Service Name Changes

**Before**: `nyra-orchestrator`, `nyra-memory`, `nyra-chromadb`

**After**: `claude-flow`, `graphiti-mcp`, `mem0-mcp`

**Impact**: Service dependencies, inter-service communication

**Migration Required**:
- [ ] Update service discovery configurations
- [ ] Update health check endpoints
- [ ] Update monitoring dashboards
- [ ] Update log aggregation filters
- [ ] Update API client configurations

#### 3. Environment Variable Changes

**Before**: Scattered .env files in multiple directories

**After**: Single .env in infra/ with Infisical agent sidecars

**Impact**: Secret management, service configuration

**Migration Required**:
- [ ] Migrate secrets to Infisical
- [ ] Update .env.example files
- [ ] Update environment variable documentation
- [ ] Test secret injection in all services

#### 4. Volume Mount Changes

**Before**: Various volume paths in different compose files

**After**: Standardized volume paths in infra/docker-compose.yml

**Impact**: Data persistence, file sharing between containers

**Migration Required**:
- [ ] Backup all volume data
- [ ] Map old volumes to new volume names
- [ ] Test data migration
- [ ] Verify permissions on new volumes

---

## 🔐 Security Best Practices Checklist

### Pre-Consolidation

- [ ] Run security scan on existing compose files
  ```bash
  docker scan $(docker images -q)
  ```

- [ ] Audit existing secrets management
  ```bash
  grep -r "password\|secret\|key" docker-compose*.yml --exclude-dir=node_modules
  ```

- [ ] Review network exposure
  ```bash
  grep -r "ports:" docker-compose*.yml | grep -v "#"
  ```

### During Consolidation

- [ ] Use Infisical for all secrets (no hardcoded secrets)
- [ ] Implement least privilege for service accounts
- [ ] Use non-root users in containers
- [ ] Enable read-only root filesystems where possible
- [ ] Implement network segmentation
- [ ] Add health checks for all services

### Post-Consolidation

- [ ] Scan consolidated image for vulnerabilities
  ```bash
  docker scan infra:latest
  ```

- [ ] Verify no secrets in archived files before committing
  ```bash
  trufflehog git file://_archive/ --no-verification
  ```

- [ ] Test least privilege access
- [ ] Verify network isolation
- [ ] Enable Docker Content Trust
  ```bash
  export DOCKER_CONTENT_TRUST=1
  ```

---

## 📝 Compliance Checklist

### CLAUDE.md Guidelines Adherence

- [x] **File Organization**: Archives go to `_archive/`, not root ✅
- [x] **No Root Saves**: Scripts use proper subdirectories ✅
- [ ] **Git History**: Use `git mv` instead of `rm` ⚠️ (Needs documentation update)
- [x] **Documentation**: Changes documented in this checklist ✅
- [ ] **Breaking Changes**: All breaking changes documented above ✅
- [x] **Security**: Security review completed ✅
- [ ] **Rollback**: Rollback procedures documented ✅
- [ ] **Testing**: Validation script provided ✅

### Docker Best Practices

- [ ] **Multi-stage builds**: Ensure consolidated Dockerfiles use multi-stage builds
- [ ] **Image scanning**: Scan all images for vulnerabilities
- [ ] **Resource limits**: All services have CPU/memory limits
- [ ] **Health checks**: All services have health check endpoints
- [ ] **Logging**: Centralized logging configured
- [ ] **Monitoring**: Prometheus metrics exposed
- [ ] **Secrets**: No hardcoded secrets in compose files

---

## 🎯 Final Approval Checklist

Before proceeding with consolidation:

### Phase 1: Pre-Flight (MANDATORY)
- [ ] All items in "Pre-Execution Checklist" completed
- [ ] Git snapshot created
- [ ] Critical files backed up
- [ ] .gitignore updated
- [ ] Team notified of consolidation window

### Phase 2: Execution (MANDATORY)
- [ ] Validation script passes with 0 errors
- [ ] Archive created successfully
- [ ] Analysis reports reviewed
- [ ] No secrets in archive (or redacted)
- [ ] Docker Compose syntax validated

### Phase 3: Testing (MANDATORY)
- [ ] Consolidated compose file created
- [ ] `docker-compose config` passes
- [ ] Test services start successfully
- [ ] Health checks pass
- [ ] Inter-service communication works
- [ ] Volumes mounted correctly
- [ ] Secrets injected correctly

### Phase 4: Cutover (MANDATORY)
- [ ] Documentation updated
- [ ] Scripts updated with new paths
- [ ] CI/CD updated
- [ ] Breaking changes communicated
- [ ] Rollback plan ready
- [ ] Team trained on new structure

### Phase 5: Cleanup (Only after 7+ days of testing)
- [ ] Old files archived via `git mv`
- [ ] Deprecated directories archived
- [ ] No service disruptions observed
- [ ] Monitoring shows healthy metrics
- [ ] Team confirms no issues

---

## 🚨 Red Flags (STOP and Investigate)

If you encounter any of these, STOP and investigate before proceeding:

1. **Critical file missing** after archiving
2. **Git shows deleted files** without corresponding archive
3. **Secrets found** in unencrypted archive that will be committed
4. **Docker Compose validation fails** on consolidated config
5. **Service health checks fail** after consolidation
6. **Data loss** in Docker volumes
7. **Network connectivity issues** between services
8. **Permission errors** accessing volumes
9. **Build failures** for custom Dockerfiles
10. **Rollback procedure fails** during testing

---

## 📞 Escalation

If critical issues arise during consolidation:

1. **STOP all cleanup operations immediately**
2. **Restore from Git snapshot**:
   ```bash
   git checkout cleanup-pre-consolidation-$(date +%Y%m%d)
   ```
3. **Verify all services operational** with old config
4. **Document the issue** in GitHub issue
5. **Review this checklist** for missed steps
6. **Get approval** before retrying

---

## ✅ Sign-Off

### Code Review Approval

**Reviewed By**: Code Review Agent
**Date**: 2026-01-17
**Status**: ✅ Approved with Recommendations

**Key Findings**:
1. ✅ No critical files will be accidentally deleted (archive-first approach)
2. ✅ Git history can be preserved (if `git mv` is used)
3. ✅ Backup strategy is in place (archive + Git snapshot)
4. ✅ Rollback can be executed (multiple methods provided)
5. ⚠️ Ingestion pipeline is safe (no external input processing)
6. ⚠️ Security: Add `_archive/` to `.gitignore` BEFORE running
7. ⚠️ Git History: Update plan to use `git mv` instead of `rm`

**Recommendations**:
1. **CRITICAL**: Add `_archive/` and `_backup/` to `.gitignore` immediately
2. **CRITICAL**: Use `git mv` for all file moves to preserve Git history
3. **HIGH**: Run validation script before and after consolidation
4. **HIGH**: Create Git snapshot tag before starting
5. **MEDIUM**: Scan archives for secrets before committing
6. **MEDIUM**: Test rollback procedure in non-production first

**Approval Conditions**:
- [ ] `.gitignore` updated before running scripts
- [ ] Git snapshot created before execution
- [ ] Validation script passes before proceeding
- [ ] Team acknowledges breaking changes

---

**Document Integrity**: SHA-256: [To be generated after final review]
**Last Updated**: 2026-01-17
**Next Review**: After first consolidation execution
