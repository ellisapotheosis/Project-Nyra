# Content Ingestion Pipeline

A robust TypeScript-based content ingestion pipeline for the Nyra webapp. Scans source directories, processes files based on type, validates content, and organizes them into the webapp structure.

## Features

- **Multi-format Support**: Markdown, JSON, PDF, and image files
- **Intelligent Processing**: Type-specific processors with metadata extraction
- **Validation**: Content structure validation and security checks
- **Manifest Generation**: Automatic manifest creation with file metadata
- **Dry-run Mode**: Test ingestion without copying files
- **Extensible**: Easy to add new processors and validators

## Installation

```bash
cd scripts/ingestion
pnpm install
```

## Usage

### Basic Usage

```bash
# Ingest from a single directory
node --loader ts-node/esm ingest-content.ts --source ./content

# Ingest from multiple directories
node --loader ts-node/esm ingest-content.ts \
  --source ./docs \
  --source ./assets \
  --source ./data
```

### With Options

```bash
# Dry run (no files copied)
node --loader ts-node/esm ingest-content.ts \
  --source ./content \
  --dry-run

# Custom target directory
node --loader ts-node/esm ingest-content.ts \
  --source ./content \
  --target ./apps/projectnyra/public/custom

# Overwrite existing files
node --loader ts-node/esm ingest-content.ts \
  --source ./content \
  --overwrite

# Skip manifest generation
node --loader ts-node/esm ingest-content.ts \
  --source ./content \
  --no-manifest

# Adjust logging
node --loader ts-node/esm ingest-content.ts \
  --source ./content \
  --log-level debug
```

### Using NPM Scripts

```bash
# Run ingestion
pnpm ingest -- --source ./content

# Dry run
pnpm ingest:dry-run -- --source ./content
```

## File Processing

### Supported File Types

| Type     | Extensions                              | Processor         | Features                                             |
| -------- | --------------------------------------- | ----------------- | ---------------------------------------------------- |
| Markdown | `.md`, `.markdown`                      | MarkdownProcessor | Frontmatter extraction, heading analysis, word count |
| JSON     | `.json`                                 | JsonProcessor     | Schema detection, depth calculation, validation      |
| PDF      | `.pdf`                                  | PdfProcessor      | Basic metadata (extensible with pdf-parse)           |
| Images   | `.jpg`, `.png`, `.webp`, `.svg`, `.gif` | ImageProcessor    | Basic metadata (extensible with sharp)               |

### Target Directory Structure

Files are automatically organized by type:

```
apps/projectnyra/public/content/
├── docs/           # Markdown files
├── data/           # JSON files
├── documents/      # PDF files
├── images/         # Image files
└── manifest.json   # Generated manifest
```

## Configuration

### Default Configuration

```typescript
{
  targetDir: './apps/projectnyra/public/content',
  includePatterns: [
    '**/*.md',
    '**/*.json',
    '**/*.pdf',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.png',
    '**/*.webp',
    '**/*.svg'
  ],
  excludePatterns: [
    '**/node_modules/**',
    '**/.git/**',
    '**/.next/**',
    '**/dist/**',
    '**/build/**',
    '**/__tests__/**'
  ],
  maxFileSize: 10485760, // 10MB
  generateManifest: true,
  logLevel: 'info'
}
```

### File Size Limits by Type

- Markdown: 5MB
- JSON: 2MB
- PDF: 20MB
- Images: 10MB

## Manifest Format

The generated manifest provides a complete inventory of ingested content:

```json
{
  "version": "1.0.0",
  "generatedAt": "2026-01-17T12:00:00.000Z",
  "totalFiles": 42,
  "totalSize": 15728640,
  "entries": [
    {
      "path": "docs/guide.md",
      "type": "markdown",
      "size": 12345,
      "hash": "sha256-hash",
      "ingestedAt": "2026-01-17T12:00:00.000Z",
      "source": "/path/to/source/guide.md",
      "metadata": {
        "title": "User Guide",
        "author": "John Doe",
        "wordCount": 1234
      }
    }
  ]
}
```

## Validation

The pipeline includes comprehensive validation:

### Security Checks

- Path traversal prevention
- File size limits
- Extension validation

### Content Checks

- JSON syntax validation
- Markdown structure analysis
- File naming conventions

### Warnings

- Large file sizes
- Special characters in filenames
- Missing metadata

## Extending the Pipeline

### Adding a New Processor

Create a new processor in `processors/`:

```typescript
import { BaseProcessor } from "./base";
import { FileType, ProcessingResult, FileMetadata } from "../types";

export class CustomProcessor extends BaseProcessor {
  getSupportedTypes(): FileType[] {
    return ["custom"];
  }

  async process(file: FileMetadata): Promise<ProcessingResult> {
    // Your processing logic
    return {
      success: true,
      file,
      message: "Processed successfully",
    };
  }
}
```

Register it in `processors/index.ts`:

```typescript
import { CustomProcessor } from "./custom";

export function createProcessorRegistry(options: ProcessorOptions) {
  const registry = new ProcessorRegistry();
  // ... existing processors
  registry.register(new CustomProcessor(options));
  return registry;
}
```

### Adding a New Validator

Create a new validator in `validators/`:

```typescript
import { BaseValidator } from "./base";
import { ValidationResult, FileMetadata } from "../types";

export class CustomValidator extends BaseValidator {
  getName(): string {
    return "CustomValidator";
  }

  async validate(file: FileMetadata): Promise<ValidationResult> {
    // Your validation logic
    return this.success();
  }
}
```

## Enhanced Features (Optional Dependencies)

### PDF Text Extraction

Install `pdf-parse` for full PDF processing:

```bash
pnpm add pdf-parse
```

Uncomment the `EnhancedPdfProcessor` in `processors/pdf.ts`.

### Image Metadata and Optimization

Install `sharp` for image processing:

```bash
pnpm add sharp
```

Uncomment the `EnhancedImageProcessor` in `processors/image.ts`.

## Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Type checking
pnpm typecheck
```

## Error Handling

The pipeline provides detailed error messages:

- File not found errors
- Validation failures with specific issues
- Processing errors with stack traces
- Warning messages for potential issues

All errors are logged with timestamps and context.

## Performance

- Async/await for efficient I/O operations
- Batch processing of multiple files
- Incremental manifest updates
- Memory-efficient file streaming

## Security

- Path traversal prevention
- File size limits enforcement
- Extension whitelist validation
- Safe filename sanitization
- No arbitrary code execution

## CLI Options Reference

| Option                   | Description                   | Default                             |
| ------------------------ | ----------------------------- | ----------------------------------- |
| `-s, --source <dirs...>` | Source directories (required) | -                                   |
| `-t, --target <dir>`     | Target directory              | `./apps/projectnyra/public/content` |
| `-d, --dry-run`          | Run without copying files     | `false`                             |
| `--no-manifest`          | Skip manifest generation      | `false`                             |
| `--overwrite`            | Overwrite existing files      | `false`                             |
| `--max-size <bytes>`     | Maximum file size             | `10485760`                          |
| `--log-level <level>`    | Logging level                 | `info`                              |

## Examples

### Migrate Documentation

```bash
node --loader ts-node/esm ingest-content.ts \
  --source ./old-docs \
  --target ./apps/projectnyra/public/content/docs \
  --dry-run
```

### Import Media Assets

```bash
node --loader ts-node/esm ingest-content.ts \
  --source ./media/images \
  --source ./media/pdfs \
  --overwrite
```

### Debug Mode

```bash
node --loader ts-node/esm ingest-content.ts \
  --source ./content \
  --log-level debug
```

## Troubleshooting

### "No processor found for file type"

The file extension is not recognized. Check `config.ts` `FILE_TYPE_MAP` and add the extension if needed.

### "File size exceeds maximum"

Adjust the `--max-size` option or modify `VALIDATION_RULES` in `config.ts`.

### "Target path is outside allowed directory"

Security check triggered. Ensure your target path doesn't contain `..` or absolute paths outside the webapp.

## Architecture

```
scripts/ingestion/
├── types.ts                 # Core type definitions
├── config.ts                # Configuration and rules
├── ingest-content.ts        # Main CLI script
├── processors/
│   ├── base.ts             # Base processor class
│   ├── markdown.ts         # Markdown processor
│   ├── json.ts             # JSON processor
│   ├── pdf.ts              # PDF processor
│   ├── image.ts            # Image processor
│   └── index.ts            # Processor registry
├── validators/
│   ├── base.ts             # Base validator class
│   ├── content-validator.ts # Content validator
│   └── index.ts            # Validator registry
└── utils/
    ├── logger.ts           # Logging utility
    ├── file-operations.ts  # File system utilities
    └── manifest.ts         # Manifest generation
```

## License

Private - Project Nyra
