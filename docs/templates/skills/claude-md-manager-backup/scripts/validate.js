#!/usr/bin/env node

/**
 * CLAUDE.md Validation Script
 * Validates CLAUDE.md files against V3 standards and compliance requirements
 */

const fs = require('fs');
const path = require('path');

// Required sections for all CLAUDE.md files
const REQUIRED_SECTIONS = [
  '# ',  // Title
  'Overview',
  'AUTOMATIC SWARM ORCHESTRATION',
  '🚨',
];

// V3-specific sections
const V3_SECTIONS = [
  'INTELLIGENT 3-TIER MODEL ROUTING',
  'Task Complexity Detection',
  'Memory Integration',
  'File Organization',
];

// Mortgage-specific sections (for services handling mortgages)
const MORTGAGE_SECTIONS = [
  'TILA/RESPA',
  'Anti-steering',
  'Fair lending',
  'compliance',
];

// Warnings for deprecated patterns
const DEPRECATED_PATTERNS = [
  { pattern: /V2.*agent/i, message: 'V2 agent references - update to V3' },
  { pattern: /old.*swarm.*pattern/i, message: 'Old swarm patterns detected' },
  { pattern: /TODO.*compliance/i, message: 'Unresolved compliance TODO' },
];

class CLAUDEValidator {
  constructor(filePath) {
    this.filePath = filePath;
    this.fileName = path.basename(filePath);
    this.content = fs.readFileSync(filePath, 'utf-8');
    this.lines = this.content.split('\n');
    this.errors = [];
    this.warnings = [];
    this.info = [];
  }

  validate() {
    this.checkRequired();
    this.checkV3Compliance();
    this.checkMortgageCompliance();
    this.checkDeprecatedPatterns();
    this.checkMarkdownSyntax();
    this.checkVariableSubstitution();

    return {
      file: this.filePath,
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      info: this.info,
    };
  }

  checkRequired() {
    for (const section of REQUIRED_SECTIONS) {
      if (!this.content.includes(section)) {
        this.errors.push(`Missing required section: "${section}"`);
      }
    }
  }

  checkV3Compliance() {
    let found = 0;
    for (const section of V3_SECTIONS) {
      if (this.content.includes(section)) {
        found++;
      }
    }

    if (found < V3_SECTIONS.length / 2) {
      this.warnings.push(
        `Low V3 compliance: Only ${found}/${V3_SECTIONS.length} V3 sections found`
      );
    }

    // Check for V3-specific patterns
    if (!this.content.includes('npx @claude-flow/cli@latest')) {
      this.warnings.push('No Claude Flow CLI commands found - update to V3 patterns');
    }
  }

  checkMortgageCompliance() {
    // Only check if file appears to handle mortgage functionality
    if (
      this.content.includes('mortgage') ||
      this.content.includes('loan') ||
      this.content.includes('quote') ||
      this.fileName.includes('mortgage') ||
      this.fileName.includes('quote')
    ) {
      let found = 0;
      for (const section of MORTGAGE_SECTIONS) {
        if (this.content.toLowerCase().includes(section.toLowerCase())) {
          found++;
        }
      }

      if (found === 0) {
        this.errors.push(
          'Mortgage service missing compliance documentation (TILA/RESPA/Anti-steering)'
        );
      } else if (found < 2) {
        this.warnings.push(
          `Mortgage service incomplete compliance: ${found}/${MORTGAGE_SECTIONS.length} sections`
        );
      }
    }
  }

  checkDeprecatedPatterns() {
    for (const { pattern, message } of DEPRECATED_PATTERNS) {
      if (pattern.test(this.content)) {
        this.warnings.push(message);
      }
    }
  }

  checkMarkdownSyntax() {
    // Check for common markdown issues
    let headingCount = (this.content.match(/^#+\s/gm) || []).length;
    if (headingCount === 0) {
      this.errors.push('No markdown headings found');
    }

    // Check for unclosed code blocks
    const backticks = (this.content.match(/```/g) || []).length;
    if (backticks % 2 !== 0) {
      this.errors.push('Unclosed code blocks detected (odd number of ``` markers)');
    }

    // Check for proper code block formatting
    const codeBlocks = this.content.match(/```[\s\S]*?```/g) || [];
    for (const block of codeBlocks) {
      if (!block.split('\n')[0].includes('bash') &&
          !block.split('\n')[0].includes('javascript') &&
          !block.split('\n')[0].includes('typescript') &&
          !block.split('\n')[0].includes('python') &&
          !block.split('\n')[0].includes('yaml') &&
          !block.split('\n')[0].includes('json')) {
        this.warnings.push('Code block missing language identifier');
        break;
      }
    }
  }

  checkVariableSubstitution() {
    const variables = this.content.match(/\{\{[A-Z_]+\}\}/g) || [];

    if (variables.length > 0) {
      this.info.push(
        `Found ${variables.length} template variables: ${[...new Set(variables)].join(', ')}`
      );
    }
  }

  report() {
    const result = this.validate();
    const status = result.valid ? '✓ VALID' : '✗ INVALID';

    console.log(`\n${'='.repeat(60)}`);
    console.log(`${status} - ${result.file}`);
    console.log('='.repeat(60));

    if (result.errors.length > 0) {
      console.log('\nERRORS:');
      result.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }

    if (result.warnings.length > 0) {
      console.log('\nWARNINGS:');
      result.warnings.forEach((warning, i) => {
        console.log(`  ${i + 1}. ${warning}`);
      });
    }

    if (result.info.length > 0) {
      console.log('\nINFO:');
      result.info.forEach((info) => {
        console.log(`  • ${info}`);
      });
    }

    console.log(`\nStatus: ${result.valid ? 'PASSED' : 'FAILED'}`);
    console.log('='.repeat(60) + '\n');

    return result;
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node validate.js <path-to-claude-md>');
    process.exit(1);
  }

  const targetPath = args[0];

  // Support directory path - find all CLAUDE.md files
  if (fs.statSync(targetPath).isDirectory()) {
    const claudeMdFiles = [];

    function findCLAUDEFiles(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          findCLAUDEFiles(filePath);
        } else if (file === 'CLAUDE.md') {
          claudeMdFiles.push(filePath);
        }
      }
    }

    findCLAUDEFiles(targetPath);

    if (claudeMdFiles.length === 0) {
      console.error(`No CLAUDE.md files found in ${targetPath}`);
      process.exit(1);
    }

    console.log(`Found ${claudeMdFiles.length} CLAUDE.md files\n`);

    let validCount = 0;
    for (const file of claudeMdFiles) {
      const validator = new CLAUDEValidator(file);
      const result = validator.report();
      if (result.valid) {
        validCount++;
      }
    }

    console.log(`\nSUMMARY: ${validCount}/${claudeMdFiles.length} files valid`);
    process.exit(validCount === claudeMdFiles.length ? 0 : 1);
  } else {
    // Single file validation
    const validator = new CLAUDEValidator(targetPath);
    const result = validator.report();
    process.exit(result.valid ? 0 : 1);
  }
}

// Export for programmatic use
module.exports = CLAUDEValidator;

// Run if called directly
if (require.main === module) {
  main();
}
