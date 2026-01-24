# Deprecated Setup Folders - Archive

**Date Archived**: 2026-01-22
**Reason**: Consolidation into single canonical location
**New Location**: `docs/setup/`

---

## Overview

This archive contains setup and configuration documentation that has been **consolidated into a single canonical location** at `docs/setup/`.

### What Happened?

7 legacy folders with setup documentation were merged into one:
1. `docs/guides/` → archived
2. `docs/manual-tasks/` → kept (for other manual tasks)
3. `docs/manual-tasks/setup/` → archived
4. `docs/manual-tasks/user-setup/` → archived
5. `docs/setup-guides/` → archived
6. `docs/user/` → archived (was empty)
7. `docs/user-setup-guidance/` → archived

### Why?

- **Reduce duplication** - Many duplicate files across folders
- **Improve discoverability** - Single location easier to find
- **Better organization** - Organized by topic and phase
- **Easier maintenance** - One source of truth

---

## Contents

This archive contains the following deprecated folders:

### `guides/` (38 files)
Various setup guides previously in `docs/guides/`

### `setup-guides/` (7 files)
Master setup guides previously in `docs/setup-guides/`

### `manual-tasks-setup/` (28 files)
Setup-specific guides from `docs/manual-tasks/setup/`

### `manual-tasks-user-setup/` (3 files)
User setup guides from `docs/manual-tasks/user-setup/`

### `manual-tasks-troubleshooting/` (1 file)
Troubleshooting guides from `docs/manual-tasks/troubleshooting/`

### `user-setup-guidance/` (3 files)
Setup guidance from `docs/user-setup-guidance/`

---

## Where to Find Documentation Now

### For Setup & Configuration
**Go to**: `docs/setup/`

**Start with**:
- `README.md` - Main entry point
- `INDEX.md` - Complete navigation index
- `00-MASTER-SETUP-GUIDE.md` - Comprehensive guide

### Navigation Guides
- `docs/setup/INDEX.md` - Complete guide listing
- `docs/setup/DIRECTORY-STRUCTURE.md` - Organization explanation
- `docs/setup/README.md` - Main entry point

### Find Specific Topics
- Search `docs/setup/` for topic name
- Or check `docs/setup/INDEX.md` for complete listing

---

## How to Access Archived Content

If you need to reference an old guide:

```bash
# Browse archived folders
ls docs/archive/deprecated-setup-folders/

# View specific folder
ls docs/archive/deprecated-setup-folders/guides/

# Read a specific guide
cat docs/archive/deprecated-setup-folders/guides/SETUP-GUIDE.md
```

---

## Consolidation Details

### Files Consolidated
- **Total Unique Files**: 38
- **Duplicate Files Merged**: Multiple versions consolidated
- **New Navigation Guides**: INDEX.md, DIRECTORY-STRUCTURE.md, README.md

### Organization
Files are now organized by:
1. **Phase** (Foundation, Memory, Applications, Advanced)
2. **Topic** (Environment, Docker, Claude Flow, etc.)
3. **Type** (Quick Start, Reference, Guide, etc.)

### New Structure
```
docs/setup/
├── INDEX.md                          # Navigation hub
├── README.md                         # Main entry point
├── DIRECTORY-STRUCTURE.md            # Organization guide
│
├── 00-MASTER-SETUP-GUIDE.md         # Main comprehensive guide
├── 01-PREREQUISITES-CHECKLIST.md    # Requirements
│
├── QUICK-START*.md                  # Various quick starts
├── *-SETUP.md                       # Setup guides by topic
├── *-GUIDE.md                       # Reference guides
│
├── TROUBLESHOOTING.md               # Consolidated troubleshooting
└── ... 35+ other guides
```

---

## Benefits of Consolidation

✅ **Single Source of Truth** - One canonical location
✅ **Reduced Duplication** - No duplicate guides
✅ **Better Organization** - Logical grouping by topic/phase
✅ **Improved Navigation** - INDEX.md and README.md help users find content
✅ **Easier Maintenance** - One folder to update instead of 7
✅ **Cross-referencing** - All guides can easily link to each other

---

## Migration Guide

If you had bookmarks to old locations:

| Old Location | New Location |
|--------------|--------------|
| `docs/guides/SETUP-GUIDE.md` | `docs/setup/SETUP-GUIDE.md` |
| `docs/setup-guides/00-MASTER-SETUP-GUIDE.md` | `docs/setup/00-MASTER-SETUP-GUIDE.md` |
| `docs/manual-tasks/setup/QUICK-START.md` | `docs/setup/QUICK-START.md` |
| `docs/user-setup-guidance/QUICK-REFERENCE.md` | `docs/setup/QUICK-REFERENCE.md` |

**All files are available in `docs/setup/` with same name.**

---

## Accessing Archived Content

### To Review Old Structure
```bash
ls -la docs/archive/deprecated-setup-folders/
```

### To Read Archived File
```bash
cat docs/archive/deprecated-setup-folders/guides/SETUP-GUIDE.md
```

### To Compare Old vs New
```bash
# Compare old and new versions
diff docs/archive/deprecated-setup-folders/guides/SETUP-GUIDE.md \
     docs/setup/SETUP-GUIDE.md
```

---

## Archive Retention

This archive is kept for:
1. **Reference** - In case you need to review old organization
2. **Recovery** - If consolidation causes issues
3. **History** - Document how setup has evolved

### Archive Maintenance
- **Do NOT delete** without permission
- **Do NOT edit** - Keep as historical reference
- **Can review** - Read-only access is fine

---

## Questions?

- **Where do I find X guide?** → Check `docs/setup/INDEX.md`
- **How is documentation organized?** → See `docs/setup/DIRECTORY-STRUCTURE.md`
- **How do I get started?** → Read `docs/setup/README.md`
- **I need help troubleshooting** → Check `docs/setup/TROUBLESHOOTING.md`

---

## Timeline

**2026-01-22**: Setup documentation consolidated from 7 folders into single `docs/setup/` location.

---

**Status**: Archive Complete
**Retention**: Indefinite - historical reference
**Last Updated**: 2026-01-22
**Reason**: Consolidation for improved organization and maintainability

---

**For Current Setup Documentation, See**: `docs/setup/README.md`
