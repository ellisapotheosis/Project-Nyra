/**
 * Claims-Based Authorization
 * Fine-grained access control with policies
 */

import {
  Principal,
  Claim,
  AuthorizationPolicy,
  PolicyCondition,
  AuthorizationResult,
} from '../types/security.types';
import { createLogger } from '../utils/logger';

const logger = createLogger('ClaimsAuthorizer');

export class ClaimsAuthorizer {
  private policies: Map<string, AuthorizationPolicy> = new Map();

  constructor() {
    this.initializeDefaultPolicies();
  }

  private initializeDefaultPolicies(): void {
    // Admin access policy
    this.definePolicy({
      id: 'admin-full-access',
      description: 'Full administrative access',
      resources: ['/*'],
      actions: ['*'],
      conditions: [
        {
          type: 'claim',
          claim: 'role',
          operator: 'contains',
          value: 'admin',
        },
      ],
      effect: 'allow',
      priority: 100,
    });

    // API access policy
    this.definePolicy({
      id: 'api-access',
      description: 'Access to API endpoints',
      resources: ['/api/*'],
      actions: ['read', 'write'],
      conditions: [
        {
          type: 'claim',
          claim: 'role',
          operator: 'contains',
          value: 'api-user',
        },
        {
          type: 'time',
          operator: 'between',
          value: { start: '00:00', end: '23:59' },
        },
      ],
      effect: 'allow',
      priority: 50,
    });

    // Mortgage data access (PII protection)
    this.definePolicy({
      id: 'mortgage-data-access',
      description: 'Access to sensitive mortgage data',
      resources: ['/api/mortgages/*', '/api/borrowers/*'],
      actions: ['read', 'write'],
      conditions: [
        {
          type: 'claim',
          claim: 'role',
          operator: 'in',
          value: ['loan-officer', 'underwriter', 'admin'],
        },
        {
          type: 'claim',
          claim: 'compliance-certified',
          operator: 'equals',
          value: true,
        },
      ],
      effect: 'allow',
      priority: 75,
    });

    // Read-only access
    this.definePolicy({
      id: 'read-only',
      description: 'Read-only access to non-sensitive data',
      resources: ['/api/public/*'],
      actions: ['read'],
      conditions: [],
      effect: 'allow',
      priority: 10,
    });
  }

  definePolicy(policy: AuthorizationPolicy): void {
    this.validatePolicy(policy);
    this.policies.set(policy.id, policy);
    logger.info('Policy defined', { policyId: policy.id, effect: policy.effect });
  }

  removePolicy(policyId: string): boolean {
    const removed = this.policies.delete(policyId);
    if (removed) {
      logger.info('Policy removed', { policyId });
    }
    return removed;
  }

  async authorize(principal: Principal, resource: string, action: string): Promise<AuthorizationResult> {
    logger.debug('Authorization check', {
      principalId: principal.id,
      resource,
      action,
    });

    // Extract claims from principal
    const claims = this.extractClaims(principal);

    // Find applicable policies
    const applicablePolicies = this.findApplicablePolicies(resource, action);

    if (applicablePolicies.length === 0) {
      logger.warn('No applicable policies found', { resource, action });
      return {
        allowed: false,
        reason: 'No matching authorization policy',
      };
    }

    // Sort by priority (higher first)
    applicablePolicies.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Evaluate each policy
    for (const policy of applicablePolicies) {
      const result = await this.evaluatePolicy(policy, claims, resource, action);

      // Deny overrides allow (fail-secure)
      if (policy.effect === 'deny' && result.allowed) {
        logger.info('Access denied by policy', {
          policyId: policy.id,
          principalId: principal.id,
          resource,
          action,
        });
        return {
          allowed: false,
          reason: `Denied by policy: ${policy.description}`,
          policy: policy.id,
        };
      }

      if (policy.effect === 'allow' && result.allowed) {
        logger.info('Access granted by policy', {
          policyId: policy.id,
          principalId: principal.id,
          resource,
          action,
        });
        return {
          allowed: true,
          reason: `Allowed by policy: ${policy.description}`,
          policy: policy.id,
        };
      }
    }

    // Default deny if no explicit allow
    logger.warn('Access denied (default)', { principalId: principal.id, resource, action });
    return {
      allowed: false,
      reason: 'No policy explicitly allows this action',
    };
  }

  private extractClaims(principal: Principal): Map<string, any> {
    const claimsMap = new Map<string, any>();

    for (const claim of principal.claims) {
      claimsMap.set(claim.type, claim.value);
    }

    return claimsMap;
  }

  private findApplicablePolicies(resource: string, action: string): AuthorizationPolicy[] {
    return Array.from(this.policies.values()).filter((policy) => {
      // Check if resource matches
      const resourceMatches = policy.resources.some((pattern) => {
        if (pattern === '/*' || pattern === '*') return true;
        if (pattern.endsWith('/*')) {
          const prefix = pattern.slice(0, -2);
          return resource.startsWith(prefix);
        }
        return pattern === resource;
      });

      // Check if action matches
      const actionMatches = policy.actions.includes('*') || policy.actions.includes(action);

      return resourceMatches && actionMatches;
    });
  }

  private async evaluatePolicy(
    policy: AuthorizationPolicy,
    claims: Map<string, any>,
    resource: string,
    action: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Evaluate all conditions
    for (const condition of policy.conditions) {
      const conditionMet = await this.evaluateCondition(condition, claims);

      if (!conditionMet) {
        return {
          allowed: false,
          reason: `Condition not met: ${condition.type}`,
        };
      }
    }

    return { allowed: true };
  }

  private async evaluateCondition(condition: PolicyCondition, claims: Map<string, any>): Promise<boolean> {
    switch (condition.type) {
      case 'claim':
        return this.evaluateClaimCondition(condition, claims);

      case 'time':
        return this.evaluateTimeCondition(condition);

      case 'ip':
        return this.evaluateIpCondition(condition);

      default:
        logger.warn('Unknown condition type', { type: condition.type });
        return false;
    }
  }

  private evaluateClaimCondition(condition: PolicyCondition, claims: Map<string, any>): boolean {
    if (!condition.claim) return false;

    const claimValue = claims.get(condition.claim);
    if (claimValue === undefined) return false;

    switch (condition.operator) {
      case 'equals':
        return claimValue === condition.value;

      case 'contains':
        if (Array.isArray(claimValue)) {
          return claimValue.includes(condition.value);
        }
        return String(claimValue).includes(String(condition.value));

      case 'in':
        if (Array.isArray(condition.value)) {
          return condition.value.includes(claimValue);
        }
        return false;

      case 'matches':
        const regex = new RegExp(condition.value);
        return regex.test(String(claimValue));

      default:
        return false;
    }
  }

  private evaluateTimeCondition(condition: PolicyCondition): boolean {
    if (condition.operator !== 'between') return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = condition.value.start.split(':').map(Number);
    const [endHour, endMin] = condition.value.end.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    return currentTime >= startTime && currentTime <= endTime;
  }

  private evaluateIpCondition(condition: PolicyCondition): boolean {
    // IP condition evaluation would require request context
    // This is a placeholder implementation
    logger.warn('IP condition evaluation not fully implemented');
    return true;
  }

  private validatePolicy(policy: AuthorizationPolicy): void {
    if (!policy.id || !policy.resources || !policy.actions) {
      throw new Error('Invalid policy: missing required fields');
    }

    if (policy.effect !== 'allow' && policy.effect !== 'deny') {
      throw new Error('Invalid policy effect: must be allow or deny');
    }
  }

  getPolicies(): AuthorizationPolicy[] {
    return Array.from(this.policies.values());
  }

  getPolicy(policyId: string): AuthorizationPolicy | undefined {
    return this.policies.get(policyId);
  }
}
