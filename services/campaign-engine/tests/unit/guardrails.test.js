import { GuardrailMiddleware } from '../../src/middleware/guardrails.middleware.js';

describe('GuardrailMiddleware', () => {
  describe('validateContent', () => {
    it('should pass valid logistics content', () => {
      const content = 'Let me schedule an appointment for you. What time works best?';
      const result = GuardrailMiddleware.validateContent(content);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject rate quotes without API reference', () => {
      const content = 'I can offer you a 3.5% interest rate on your loan';
      const result = GuardrailMiddleware.validateContent(content);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'PROHIBITED_CONTENT')).toBe(true);
    });

    it('should reject payment quotes', () => {
      const content = 'Your monthly payment will be $2,500 per month';
      const result = GuardrailMiddleware.validateContent(content);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'PROHIBITED_CONTENT')).toBe(true);
    });

    it('should reject approval promises', () => {
      const content = 'I guarantee you will be approved for this loan';
      const result = GuardrailMiddleware.validateContent(content);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'PROHIBITED_CONTENT')).toBe(true);
    });

    it('should reject SSN collection', () => {
      const content = 'Please provide your SSN: 123-45-6789';
      const result = GuardrailMiddleware.validateContent(content);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'SENSITIVE_DATA')).toBe(true);
    });

    it('should reject bank account numbers', () => {
      const content = 'Send your bank account number for processing';
      const result = GuardrailMiddleware.validateContent(content);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.type === 'PROHIBITED_CONTENT')).toBe(true);
    });

    it('should warn on potentially discriminatory terms', () => {
      const content = 'This loan is based on age requirements';
      const result = GuardrailMiddleware.validateContent(content);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.type === 'POTENTIAL_DISCRIMINATION')).toBe(true);
    });

    it('should allow document collection', () => {
      const content = 'Please upload your paystubs and W2s for verification';
      const result = GuardrailMiddleware.validateContent(content);

      expect(result.valid).toBe(true);
    });

    it('should allow scheduling', () => {
      const content = 'Would you like to schedule a call to discuss your options?';
      const result = GuardrailMiddleware.validateContent(content);

      expect(result.valid).toBe(true);
    });

    it('should allow status updates', () => {
      const content = 'Your application is currently under review. I will update you tomorrow.';
      const result = GuardrailMiddleware.validateContent(content);

      expect(result.valid).toBe(true);
    });
  });

  describe('sanitizeContent', () => {
    it('should redact SSN patterns', () => {
      const content = 'My SSN is 123-45-6789';
      const sanitized = GuardrailMiddleware.sanitizeContent(content);

      expect(sanitized).not.toContain('123-45-6789');
      expect(sanitized).toContain('[REDACTED]');
    });

    it('should redact long numbers (potential account numbers)', () => {
      const content = 'Account: 1234567890123';
      const sanitized = GuardrailMiddleware.sanitizeContent(content);

      expect(sanitized).toContain('[REDACTED]');
    });

    it('should not modify safe content', () => {
      const content = 'Please schedule your appointment';
      const sanitized = GuardrailMiddleware.sanitizeContent(content);

      expect(sanitized).toBe(content);
    });
  });

  describe('checkDNC', () => {
    it('should check DNC status', async () => {
      const contact = { id: 'test123' };
      const result = await GuardrailMiddleware.checkDNC(contact);

      expect(result).toHaveProperty('allowed');
      expect(result).toHaveProperty('checked');
    });
  });

  describe('checkConsent', () => {
    it('should check consent status', async () => {
      const contact = { id: 'test123' };
      const result = await GuardrailMiddleware.checkConsent(contact, 'sms');

      expect(result).toHaveProperty('hasConsent');
      expect(result).toHaveProperty('channel');
    });
  });
});
