import { EntityType } from '../types/crm-types';
import { TransformationMapping } from '../types/sync-types';
import { FIELD_MAPPINGS } from '../config/crm-config';
import { logger } from '../utils/logger.util';

/**
 * Data Transformation Layer
 * Handles mapping between internal and CRM data formats
 */

export class DataTransformer {
  /**
   * Transform data from source format to target format
   */
  static transform(
    data: any,
    entityType: EntityType,
    direction: 'toInternal' | 'toCRM' = 'toInternal'
  ): any {
    const mappings = FIELD_MAPPINGS[entityType];
    if (!mappings) {
      logger.error(`No field mappings found for entity type: ${entityType}`);
      return data;
    }

    const transformed: any = {};

    for (const mapping of mappings) {
      const sourceField = direction === 'toInternal' ? mapping.sourceField : mapping.targetField;
      const targetField = direction === 'toInternal' ? mapping.targetField : mapping.sourceField;

      let value = data[sourceField];

      // Handle missing required fields
      if (mapping.required && (value === undefined || value === null)) {
        if (mapping.defaultValue !== undefined) {
          value = mapping.defaultValue;
        } else {
          logger.warn(`Required field ${sourceField} is missing for ${entityType}`);
          continue;
        }
      }

      // Apply transformation function if provided
      if (value !== undefined && value !== null && mapping.transform) {
        try {
          value = mapping.transform(value);
        } catch (error) {
          logger.error(`Transformation failed for field ${sourceField}`, { error });
          continue;
        }
      }

      if (value !== undefined) {
        transformed[targetField] = value;
      }
    }

    // Preserve standard fields
    if (data.id) transformed.id = data.id;
    if (data.createdAt) transformed.createdAt = new Date(data.createdAt);
    if (data.updatedAt) transformed.updatedAt = new Date(data.updatedAt);
    if (data.deletedAt) transformed.deletedAt = new Date(data.deletedAt);

    // Preserve custom fields
    if (data.customFields) {
      transformed.customFields = { ...data.customFields };
    }

    return transformed;
  }

  /**
   * Transform array of entities
   */
  static transformBatch(
    dataArray: any[],
    entityType: EntityType,
    direction: 'toInternal' | 'toCRM' = 'toInternal'
  ): any[] {
    return dataArray.map(data => this.transform(data, entityType, direction));
  }

  /**
   * Validate transformed data
   */
  static validate(data: any, entityType: EntityType): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const mappings = FIELD_MAPPINGS[entityType];

    if (!mappings) {
      errors.push(`Unknown entity type: ${entityType}`);
      return { valid: false, errors };
    }

    for (const mapping of mappings) {
      if (mapping.required) {
        const value = data[mapping.targetField];
        if (value === undefined || value === null) {
          errors.push(`Required field ${mapping.targetField} is missing`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Create custom transformation mapping
   */
  static createMapping(
    sourceField: string,
    targetField: string,
    options: {
      required?: boolean;
      defaultValue?: any;
      transform?: (value: any) => any;
    } = {}
  ): TransformationMapping {
    return {
      sourceField,
      targetField,
      required: options.required,
      defaultValue: options.defaultValue,
      transform: options.transform
    };
  }
}

export default DataTransformer;
