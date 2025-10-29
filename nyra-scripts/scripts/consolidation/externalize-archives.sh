#!/bin/bash
# scripts/consolidation/externalize-archives.sh
# Externalizes archive and cleanup materials to separate compressed files

set -e

ARCHIVE_DIR="archive/2025-10-13-original-structure"
CLEANUP_DIR="Cleaning-Setup"
OUTPUT_DIR="../../nyra-archives"
DATE=$(date +%Y%m%d-%H%M%S)

echo "🗄️  Externalizing NYRA Archives"
echo "================================"
echo "Date: $DATE"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Archive old structure
if [ -d "$ARCHIVE_DIR" ]; then
  echo "📦 Archiving: $ARCHIVE_DIR"
  tar -czf "$OUTPUT_DIR/nyra-archive-$DATE.tar.gz" "$ARCHIVE_DIR"
  ARCHIVE_SIZE=$(du -sh "$OUTPUT_DIR/nyra-archive-$DATE.tar.gz" | cut -f1)
  echo "✅ Created: nyra-archive-$DATE.tar.gz ($ARCHIVE_SIZE)"
else
  echo "⚠️  Archive directory not found: $ARCHIVE_DIR"
fi

# Archive cleanup materials
if [ -d "$CLEANUP_DIR" ]; then
  echo "📦 Archiving: $CLEANUP_DIR"
  tar -czf "$OUTPUT_DIR/nyra-cleanup-$DATE.tar.gz" "$CLEANUP_DIR"
  CLEANUP_SIZE=$(du -sh "$OUTPUT_DIR/nyra-cleanup-$DATE.tar.gz" | cut -f1)
  echo "✅ Created: nyra-cleanup-$DATE.tar.gz ($CLEANUP_SIZE)"
else
  echo "⚠️  Cleanup directory not found: $CLEANUP_DIR"
fi

echo ""
echo "✅ Archives created in: $OUTPUT_DIR"
echo ""
echo "📌 Next steps:"
echo "  1. Verify archives can be extracted:"
echo "     tar -tzf $OUTPUT_DIR/nyra-archive-$DATE.tar.gz | head -20"
echo "  2. Upload archives to GitHub Releases"
echo "  3. Verify downloads work from GitHub"
echo "  4. Run: git rm -r $ARCHIVE_DIR $CLEANUP_DIR"
echo "  5. Commit: git commit -m 'refactor: externalize archives to GitHub Releases'"
