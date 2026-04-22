# NYRA Consolidation Quick Start

**IMPORTANT**: This is a simplified guide. See `consolidation-plan.md` for full details.

## ⚡ Quick Facts

- **Current State**: 1165+ modified files, 441MB in archives
- **Target**: 60% size reduction, clean module structure
- **Timeline**: 10 days recommended
- **Risk Level**: LOW (with proper backups)

## 🚀 Execute Consolidation

### Step 1: Backup (5 minutes)
```bash
# Create local backup
cd ..
tar -czf Project-Nyra-backup-$(date +%Y%m%d).tar.gz Project-Nyra/

# Tag in git
cd Project-Nyra
git tag -a v0.1.0-pre-consolidation -m "Pre-consolidation state"
git push origin v0.1.0-pre-consolidation
```

### Step 2: Externalize Archives (30 minutes)
```bash
# Run externalization script
bash scripts/consolidation/externalize-archives.sh

# Upload to GitHub Releases
# 1. Go to: https://github.com/YOUR_ORG/Project-Nyra/releases/new
# 2. Tag: v0.1.0-pre-consolidation
# 3. Upload: ../../nyra-archives/*.tar.gz
# 4. Publish release

# Remove from repo ONLY after upload verified
git rm -r archive/2025-10-13-original-structure/
git rm -r Cleaning-Setup/
git commit -m "refactor: externalize archives to GitHub Releases"
```

### Step 3: Validate (10 minutes)
```bash
# Run validation script
bash scripts/consolidation/validate-consolidation.sh

# Expected results:
# ✅ Repository size reduced by ~50%+
# ✅ No build artifacts tracked
# ⚠️  Hooks need repair (expected - see Phase 5)
```

### Step 4: Fix Hooks (15 minutes)
```bash
# Fix archon-os hook integration
cd nyra-orchestration/Claude/archon-os/
npm rebuild better-sqlite3
npm install

# Test
npx @archon-os/cli@latest hooks session-restore --session-id "test"
```

### Step 5: Push Changes
```bash
git push origin main
```

## 📊 Before/After Metrics

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Repo Size | ~1GB | ~400MB | -60% |
| File Count | 5000+ | ~2000 | -60% |
| Archive Size | 441MB | 0MB | -100% |
| Modified Files | 1165 | 0 | Clean |

## ⚠️ Common Issues

### Issue 1: Archive script fails
**Solution**: Run manually:
```bash
tar -czf ../nyra-archive.tar.gz archive/
tar -czf ../nyra-cleanup.tar.gz Cleaning-Setup/
```

### Issue 2: Git rm fails
**Solution**: Files already removed. Check with `git status`

### Issue 3: Hooks still broken
**Solution**: Clear npm cache:
```bash
npm cache clean --force
cd nyra-orchestration/Claude/archon-os/
rm -rf node_modules package-lock.json
npm install
```

## 🎯 Success Checklist

- [ ] Backup created and verified
- [ ] Archives uploaded to GitHub Releases
- [ ] Archive directories removed from repo
- [ ] Validation script passing
- [ ] Hooks working correctly
- [ ] Changes pushed to remote

## 📞 Need Help?

1. Check full plan: `docs/consolidation-plan.md`
2. Review scripts: `scripts/consolidation/`
3. Create GitHub issue with `consolidation` label

## 🚨 Rollback Procedure

If something goes wrong:

```bash
# Restore from local backup
cd ..
rm -rf Project-Nyra/
tar -xzf Project-Nyra-backup-YYYYMMDD.tar.gz

# Or revert git commits
cd Project-Nyra
git reset --hard v0.1.0-pre-consolidation
```

---

**Remember**: Always backup before making changes!
