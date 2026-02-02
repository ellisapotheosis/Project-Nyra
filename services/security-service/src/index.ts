/**
 * Claude Flow V3 Security Service
 * ADR-010: Security Architecture Implementation
 *
 * Exports:
 * - CVETracker: CVE vulnerability scanning and tracking
 * - InputValidator: Zod-based input validation
 * - PathValidator: Path traversal protection
 * - SQLValidator: SQL injection prevention
 * - ClaimsAuthorizer: Claims-based authorization
 * - RateLimiter: Rate limiting middleware
 */

export { CVETracker } from './cve/cve-tracker';
export { InputValidator } from './validation/input-validator';
export { PathValidator } from './validation/path-validator';
export { SQLValidator } from './sql/sql-validator';
export { ClaimsAuthorizer } from './authorization/claims-authorizer';
export { RateLimiter } from './middleware/rate-limiter';

export * from './types/security.types';

// Re-export logger for convenience
export { createLogger } from './utils/logger';
