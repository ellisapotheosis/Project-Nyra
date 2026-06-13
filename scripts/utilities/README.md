# Utility Scripts

Maintenance and utility scripts for Project Nyra.

## Directory Structure

```
scripts/utilities/
└── extraction/  # Archive extraction and preparation scripts
```

## Extraction Scripts (`extraction/`)

Scripts for extracting and processing archived files:

| Script                            | Platform | Purpose                   | Order |
| --------------------------------- | -------- | ------------------------- | ----- |
| `1_extract_archives.ps1`          | Windows  | Extract archive files     | 1st   |
| `2_scan_extracted.ps1`            | Windows  | Scan extracted content    | 2nd   |
| `3_prepare_for_consolidation.ps1` | Windows  | Prepare for consolidation | 3rd   |

### Usage Examples

```powershell
# Step 1: Extract archives
.\scripts\utilities\extraction\1_extract_archives.ps1 -ArchivePath "path\to\archives"

# Step 2: Scan extracted content
.\scripts\utilities\extraction\2_scan_extracted.ps1 -SourcePath "path\to\extracted"

# Step 3: Prepare for consolidation
.\scripts\utilities\extraction\3_prepare_for_consolidation.ps1 -SourcePath "path\to\extracted" -TargetPath "path\to\target"

# Run all steps
.\scripts\utilities\extraction\1_extract_archives.ps1 -ArchivePath "archives"
.\scripts\utilities\extraction\2_scan_extracted.ps1 -SourcePath "extracted"
.\scripts\utilities\extraction\3_prepare_for_consolidation.ps1 -SourcePath "extracted" -TargetPath "consolidated"
```

### Extraction Workflow

1. **Extract Archives** - Extracts zip, tar, 7z files
2. **Scan Extracted** - Analyzes extracted content structure
3. **Prepare Consolidation** - Organizes files for consolidation

## Prerequisites

- **Windows**: PowerShell 5.1+ or PowerShell Core 7+
- **7-Zip**: For archive extraction (if not using PowerShell Expand-Archive)

## Notes

- Scripts include progress indicators
- Error handling and rollback on failure
- Supports common archive formats: `.zip`, `.tar`, `.tar.gz`, `.7z`
- Dry-run mode available with `-WhatIf` parameter

## Migration Notice

These scripts were consolidated from `nyra-scripts/docs/extraction_scripts/` on 2026-01-16.
See `scripts/CONSOLIDATION-LOG.md` for details.
