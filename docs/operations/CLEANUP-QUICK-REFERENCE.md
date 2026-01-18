# Docker Consolidation - Quick Reference

**Last Updated**: 2026-01-17
**Related Docs**:
- Full Checklist: [CLEANUP-SAFETY-CHECKLIST.md](./CLEANUP-SAFETY-CHECKLIST.md)
- Consolidation Plan: [../architecture/INFRASTRUCTURE-CONSOLIDATION-PLAN.md](../architecture/INFRASTRUCTURE-CONSOLIDATION-PLAN.md)

---

## Quick Start

### 1. Pre-Flight Check (5 minutes)

```bash
# Ensure git is clean
git status

# Run validation
bash infra/scripts/validate-consolidation.sh
# OR on Windows:
.\infra\scripts\validate-consolidation.ps1

# Create snapshot
git tag -a cleanup-pre-consolidation-$(date +%Y%m%d) -m "Pre-consolidation snapshot"
```

### 2. Run Consolidation (10 minutes)

```bash
# Linux/WSL/Git Bash
bash infra/scripts/consolidate-docker-configs.sh

# Windows PowerShell
.\infra\scripts\consolidate-docker-configs.ps1
```

### 3. Review Results (15 minutes)

```bash
# Check analysis report
cat infra/analysis/CONSOLIDATION-REPORT.md

# Review missing services
cat infra/analysis/missing-from-bootstrap.txt

# Scan for secrets
grep -r "PASSWORD\|SECRET\|KEY" _archive/docker-configs-*/ | less
```

### 4. Post-Validation (5 minutes)

```bash
# Re-run validation to ensure nothing broke
bash infra/scripts/validate-consolidation.sh
```

---

## Critical Commands

### Emergency Rollback

```bash
# Option 1: Restore from Git tag
git checkout cleanup-pre-consolidation-$(date +%Y%m%d)

# Option 2: Restore from archive
cp _archive/docker-configs-*/files/<path>/<file> <original-location>

# Option 3: Use bootstrap directly
cd bootstrap/docker
docker-compose up -d
```

### Safety Checks

```bash
# Verify critical files exist
ls -la bootstrap/docker/docker-compose.yml
ls -la infra/docker/docker-compose.yml

# Check Docker Compose syntax
docker-compose -f infra/docker-compose.yml config

# Verify no secrets in archive
grep -r "password=" _archive/ --exclude-dir=node_modules
```

---

## Decision Tree

```
START
  │
  ├─ Has consolidation been run?
  │   ├─ NO  → Run validation → Fix issues → Run consolidation
  │   └─ YES → Skip to "Review Results"
  │
  ├─ Are there validation errors?
  │   ├─ YES → Fix errors → Re-run validation
  │   └─ NO  → Proceed
  │
  ├─ Does archive contain secrets?
  │   ├─ YES → Redact secrets → Update .gitignore
  │   └─ NO  → Proceed
  │
  ├─ Are all services accounted for?
  │   ├─ NO  → Add missing services → Update compose
  │   └─ YES → Proceed
  │
  ├─ Does consolidated compose work?
  │   ├─ NO  → Rollback → Debug → Retry
  │   └─ YES → Monitor for 7 days
  │
  └─ Ready for cleanup?
      ├─ YES → git mv old files → Test again → Done
      └─ NO  → Keep monitoring
```

---

## File Locations

| File | Purpose |
|------|---------|
| `infra/scripts/consolidate-docker-configs.sh` | Main consolidation script (bash) |
| `infra/scripts/consolidate-docker-configs.ps1` | PowerShell wrapper |
| `infra/scripts/validate-consolidation.sh` | Validation script (bash) |
| `infra/scripts/validate-consolidation.ps1` | Validation wrapper (PowerShell) |
| `docs/operations/CLEANUP-SAFETY-CHECKLIST.md` | Full safety checklist |
| `docs/architecture/INFRASTRUCTURE-CONSOLIDATION-PLAN.md` | Consolidation plan |
| `_archive/docker-configs-*/` | Archived compose files |
| `_backup/critical-configs-*/` | Critical file backups |
| `infra/analysis/` | Analysis reports |

---

## Red Flags

**STOP and investigate if you see:**

1. ❌ Validation script shows errors
2. ❌ Critical files missing after archiving
3. ❌ Secrets in unencrypted archive
4. ❌ Docker Compose syntax errors
5. ❌ Services fail to start
6. ❌ Data loss in volumes
7. ❌ Rollback fails

---

## Common Issues

### Issue: "Bash not found" on Windows

**Solution**:
```powershell
# Install Git for Windows (includes Git Bash)
# Download from: https://git-scm.com/download/win

# OR enable WSL
wsl --install
```

### Issue: Archive contains secrets

**Solution**:
```bash
# Ensure .gitignore updated (should already be done)
cat .gitignore | grep _archive

# If not present:
echo "_archive/" >> .gitignore
git add .gitignore
git commit -m "chore: add _archive to gitignore"

# Redact secrets in archive if needed
# (Use tool like gitleaks or manual review)
```

### Issue: File count mismatch

**Solution**:
```bash
# Count original files
find . -name "docker-compose*.yml" ! -path "*/_archive/*" | wc -l

# Count archived files
find _archive/docker-configs-*/files -name "docker-compose*.yml" | wc -l

# If mismatch, check file-list.txt for details
cat _archive/docker-configs-*/file-list.txt
```

### Issue: Docker Compose validation fails

**Solution**:
```bash
# Check syntax errors
docker-compose -f infra/docker-compose.yml config

# Common issues:
# - Missing environment variables (check .env)
# - Invalid YAML syntax (check indentation)
# - Duplicate service names
# - Missing volume definitions
```

---

## Validation Exit Codes

| Exit Code | Meaning | Action |
|-----------|---------|--------|
| 0 | All checks passed | Proceed with consolidation |
| 1 | Critical errors | Fix errors, re-run validation |

---

## Timeline

| Phase | Duration | Key Activities |
|-------|----------|----------------|
| **Preparation** | 5-10 min | Git snapshot, backup, .gitignore update |
| **Validation** | 2-5 min | Run validation script, fix issues |
| **Consolidation** | 10-15 min | Run consolidation, review archives |
| **Analysis** | 15-30 min | Review reports, identify missing services |
| **Integration** | 2-4 hours | Create consolidated compose, add Infisical agents |
| **Testing** | 1-2 days | Test services, health checks, inter-service communication |
| **Monitoring** | 7 days | Monitor for issues, ready for cleanup |
| **Cleanup** | 1-2 hours | git mv old files, remove deprecated configs |

**Total**: ~1-2 weeks from start to final cleanup

---

## Success Criteria

Before marking consolidation complete:

- [ ] Validation passes with 0 errors
- [ ] All 155+ files archived
- [ ] All unique services identified
- [ ] Consolidated compose created
- [ ] All services start successfully
- [ ] Health checks pass
- [ ] No secrets in committed archives
- [ ] Documentation updated
- [ ] Scripts reference new paths
- [ ] Monitored for 7+ days
- [ ] No rollbacks needed

---

## Contact & Escalation

If critical issues arise:

1. **STOP** all operations immediately
2. **Rollback** using Git snapshot or archive
3. **Document** the issue in GitHub
4. **Review** safety checklist for missed steps
5. **Get approval** before retrying

---

## Additional Resources

- Docker Compose Documentation: https://docs.docker.com/compose/
- Git History Preservation: https://git-scm.com/docs/git-mv
- Infisical Agent Setup: https://infisical.com/docs/agent
- Project Nyra Documentation: [../../README.md](../../README.md)

---

**Document Version**: 1.0
**Maintained By**: Infrastructure Team
**Review Frequency**: After each consolidation run
