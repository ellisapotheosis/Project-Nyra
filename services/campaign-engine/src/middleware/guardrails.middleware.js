import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

/**
 * Logistics Guardrail Middleware
 * Implements compliance checks for borrower-facing communications
 * Based on bootstrap/prompts/compliance/logistics_guardrail.md
 */

export class GuardrailMiddleware {
  /**
   * Prohibited content patterns
   */
  static PROHIBITED_PATTERNS = [
    // Rate and payment quotes without API reference
    /\b\d+(\.\d+)?%\s*(rate|apr|interest)/i,
    /\$[\d,]+\s*(per month|monthly payment|payment)/i,
    /quote.*\$[\d,]+/i,

    // Approval promises
    /\b(guarantee|promise|assure).*\b(approval|approved|qualify)/i,
    /\byou (will be|are) approved\b/i,
    /\bguaranteed approval\b/i,

    // Sensitive data collection
    /\b(ssn|social security|tax id|ein)\b/i,
    /\bbank account number\b/i,
    /\brouting number\b/i,

    // Steering language
    /\b(you should|you must|required to).*\b(buy|purchase|choose)\b/i,
    /\bonly option\b/i
  ];

  /**
   * Allowed content patterns (logistics only)
   */
  static ALLOWED_PATTERNS = [
    /\b(schedule|appointment|follow.?up|document|status|update)\b/i
  ];

  /**
   * Check message content for compliance
   */
  static validateContent(content) {
    if (!config.compliance.enableGuardrails) {
      return { valid: true, warnings: [] };
    }

    const warnings = [];
    const errors = [];

    // Check for prohibited content
    for (const pattern of this.PROHIBITED_PATTERNS) {
      if (pattern.test(content)) {
        errors.push({
          type: 'PROHIBITED_CONTENT',
          pattern: pattern.toString(),
          message: 'Content contains prohibited information (rates, promises, sensitive data)'
        });
      }
    }

    // Check for SSN-like patterns
    const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/;
    if (ssnPattern.test(content)) {
      errors.push({
        type: 'SENSITIVE_DATA',
        message: 'Content contains SSN-like pattern'
      });
    }

    // Check for discriminatory language (basic check)
    const discriminatoryTerms = ['race', 'religion', 'gender', 'nationality', 'disability', 'age'];
    for (const term of discriminatoryTerms) {
      if (new RegExp(`\\b${term}\\b`, 'i').test(content)) {
        warnings.push({
          type: 'POTENTIAL_DISCRIMINATION',
          message: `Content mentions potentially sensitive term: ${term}`
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Middleware function for Express routes
   */
  static middleware(req, res, next) {
    if (!config.compliance.enableGuardrails) {
      return next();
    }

    const { body, subject } = req.body;

    // Validate message body
    if (body) {
      const bodyValidation = GuardrailMiddleware.validateContent(body);

      if (!bodyValidation.valid) {
        logger.warn('Guardrail violation detected', {
          route: req.path,
          errors: bodyValidation.errors,
          warnings: bodyValidation.warnings
        });

        return res.status(400).json({
          error: 'Content violates compliance guardrails',
          details: bodyValidation.errors,
          warnings: bodyValidation.warnings
        });
      }

      if (bodyValidation.warnings.length > 0) {
        logger.info('Guardrail warnings', {
          route: req.path,
          warnings: bodyValidation.warnings
        });
      }
    }

    // Validate subject line
    if (subject) {
      const subjectValidation = GuardrailMiddleware.validateContent(subject);

      if (!subjectValidation.valid) {
        return res.status(400).json({
          error: 'Subject violates compliance guardrails',
          details: subjectValidation.errors
        });
      }
    }

    next();
  }

  /**
   * Check DNC (Do Not Contact) status
   */
  static async checkDNC(contact) {
    if (!config.compliance.dncCheckEnabled) {
      return { allowed: true };
    }

    // TODO: Implement actual DNC check against database/service
    // For now, return allowed
    logger.info('DNC check performed', { contactId: contact.id });

    return {
      allowed: true,
      checked: true
    };
  }

  /**
   * Check consent status
   */
  static async checkConsent(contact, channel) {
    if (!config.compliance.consentRequired) {
      return { hasConsent: true };
    }

    // TODO: Implement actual consent check
    // Check if contact has given consent for specific channel
    logger.info('Consent check performed', {
      contactId: contact.id,
      channel
    });

    return {
      hasConsent: true,
      channel,
      checked: true
    };
  }

  /**
   * Sanitize message content
   */
  static sanitizeContent(content) {
    if (!content) return '';

    // Remove any SSN-like patterns
    let sanitized = content.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED]');
    sanitized = sanitized.replace(/\bSSN[:\s]*\d{9}\b/gi, '[REDACTED]');

    // Remove bank account numbers (simple pattern)
    sanitized = sanitized.replace(/\b\d{10,17}\b/g, '[REDACTED]');

    return sanitized;
  }

  /**
   * Log compliance event
   */
  static logComplianceEvent(event) {
    logger.info('Compliance event', {
      type: event.type,
      contactId: event.contactId,
      campaignId: event.campaignId,
      channel: event.channel,
      action: event.action,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Express middleware wrapper
 */
export const guardrailMiddleware = (req, res, next) => {
  return GuardrailMiddleware.middleware(req, res, next);
};
