/**
 * Markdown file processor
 */

import path from 'path';
import { BaseProcessor } from './base';
import { FileType, ProcessingResult, FileMetadata } from '../types';
import { readFileContent, copyFile } from '../utils/file-operations';

/**
 * Extract frontmatter from markdown content
 */
function extractFrontmatter(content: string): { frontmatter: Record<string, any>; body: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const [, frontmatterText, body] = match;
  const frontmatter: Record<string, any> = {};

  // Simple YAML parsing (key: value pairs)
  const lines = frontmatterText.split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      frontmatter[key] = value.replace(/^["']|["']$/g, ''); // Remove quotes
    }
  }

  return { frontmatter, body };
}

/**
 * Markdown processor
 */
export class MarkdownProcessor extends BaseProcessor {
  getSupportedTypes(): FileType[] {
    return ['markdown'];
  }

  async process(file: FileMetadata): Promise<ProcessingResult> {
    this.logStart(file);

    try {
      // Validate file
      const validation = await this.validateFile(file);
      if (!validation.valid) {
        file.status = 'error';
        file.error = validation.errors.join(', ');
        return {
          success: false,
          file,
          message: file.error
        };
      }

      // Read and parse markdown
      const content = await readFileContent(file.sourcePath);
      const { frontmatter, body } = extractFrontmatter(content);

      // Extract metadata
      file.metadata = {
        title: frontmatter.title || path.basename(file.sourcePath, '.md'),
        description: frontmatter.description,
        author: frontmatter.author,
        date: frontmatter.date,
        tags: frontmatter.tags ? frontmatter.tags.split(',').map((t: string) => t.trim()) : [],
        wordCount: body.split(/\s+/).length,
        headings: this.extractHeadings(body)
      };

      // Copy file to target (in dry-run, we skip the actual copy)
      if (!this.options.config.dryRun) {
        await copyFile(file.sourcePath, file.targetPath, this.options.logger);
      }

      file.status = 'success';
      this.logSuccess(file);

      return {
        success: true,
        file,
        message: 'Markdown file processed successfully'
      };
    } catch (error) {
      file.status = 'error';
      file.error = error instanceof Error ? error.message : 'Unknown error';
      this.logError(file, error as Error);

      return {
        success: false,
        file,
        message: file.error
      };
    }
  }

  /**
   * Extract markdown headings
   */
  private extractHeadings(content: string): string[] {
    const headingRegex = /^#{1,6}\s+(.+)$/gm;
    const headings: string[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      headings.push(match[1].trim());
    }

    return headings;
  }
}
