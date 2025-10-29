#!/bin/bash
# Verify duplicates with checksums before deletion

echo "=== DUPLICATE VERIFICATION REPORT ==="
echo ""

# Check Claude-Code-Development-Kit directories
echo "1. Claude-Code-Development-Kit Directories:"
find . -type d -name "Claude-Code-Development-Kit" 2>/dev/null | while read dir; do
    if [ -d "$dir" ]; then
        file_count=$(find "$dir" -type f 2>/dev/null | wc -l)
        size=$(du -sh "$dir" 2>/dev/null | cut -f1)
        echo "  - $dir ($file_count files, $size)"
    fi
done
echo ""

# Check CLAUDE.md files with checksums
echo "2. CLAUDE.md Files (with checksums):"
find . -name "CLAUDE.md" -type f ! -path "*/node_modules/*" ! -path "*/archive/*" ! -path "*/Cleaning-Setup/*" 2>/dev/null | while read file; do
    checksum=$(md5sum "$file" 2>/dev/null | cut -d' ' -f1)
    size=$(wc -l "$file" 2>/dev/null | cut -d' ' -f1)
    echo "  - $file (md5: ${checksum:0:8}..., $size lines)"
done
echo ""

# Group by checksum to identify true duplicates
echo "3. CLAUDE.md Checksum Groups:"
find . -name "CLAUDE.md" -type f ! -path "*/node_modules/*" ! -path "*/archive/*" ! -path "*/Cleaning-Setup/*" 2>/dev/null | xargs md5sum 2>/dev/null | sort | awk '{print $1}' | uniq -c | sort -rn
echo ""

echo "=== VERIFICATION COMPLETE ==="
