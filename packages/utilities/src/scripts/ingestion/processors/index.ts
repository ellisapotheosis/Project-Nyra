/**
 * Processor registry and exports
 */

import { ProcessorRegistry } from './base';
import { MarkdownProcessor } from './markdown';
import { JsonProcessor } from './json';
import { PdfProcessor } from './pdf';
import { ImageProcessor } from './image';
import { ProcessorOptions } from '../types';

export * from './base';
export * from './markdown';
export * from './json';
export * from './pdf';
export * from './image';

/**
 * Create and initialize processor registry with all available processors
 */
export function createProcessorRegistry(options: ProcessorOptions): ProcessorRegistry {
  const registry = new ProcessorRegistry();

  // Register all processors
  registry.register(new MarkdownProcessor(options));
  registry.register(new JsonProcessor(options));
  registry.register(new PdfProcessor(options));
  registry.register(new ImageProcessor(options));

  return registry;
}
