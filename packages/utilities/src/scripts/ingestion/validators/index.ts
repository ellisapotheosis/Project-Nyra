/**
 * Validator registry and exports
 */

import { ValidatorRegistry } from './base';
import { ContentValidator } from './content-validator';

export * from './base';
export * from './content-validator';

/**
 * Create and initialize validator registry with all available validators
 */
export function createValidatorRegistry(): ValidatorRegistry {
  const registry = new ValidatorRegistry();

  // Register all validators
  registry.register(new ContentValidator());

  return registry;
}
