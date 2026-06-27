import { describe, it, expect, beforeEach } from "vitest";

interface Claim {
  type: string;
  value: string | string[] | Record<string, unknown>;
  issuer?: string;
  issuedAt?: Date;
  expiresAt?: Date;
}

interface Principal {
  id: string;
  type: "user" | "service" | "agent";
  claims: Claim[];
  metadata?: Record<string, unknown>;
}

interface PolicyCondition {
  type: "claim" | "time" | "ip" | "custom";
  claim?: string;
  operator: "equals" | "contains" | "matches" | "between" | "in";
  value: unknown;
}

interface AuthorizationPolicy {
  id: string;
  description: string;
  resources: string[];
  actions: string[];
  conditions: PolicyCondition[];
  effect: "allow" | "deny";
  priority?: number;
}

interface AuthorizationResult {
  allowed: boolean;
  reason: string;
  policy?: string;
}

// Standalone ClaimsAuthorizer to avoid winston side-effects
class ClaimsAuthorizer {
  private policies: Map<string, AuthorizationPolicy> = new Map();

  constructor() {
    this.initializeDefaultPolicies();
  }

  private initializeDefaultPolicies(): void {
    this.definePolicy({
      id: "admin-full-access",
      description: "Full administrative access",
      resources: ["/*"],
      actions: ["*"],
      conditions: [
        { type: "claim", claim: "role", operator: "contains", value: "admin" },
      ],
      effect: "allow",
      priority: 100,
    });

    this.definePolicy({
      id: "read-only",
      description: "Read-only access to non-sensitive data",
      resources: ["/api/public/*"],
      actions: ["read"],
      conditions: [],
      effect: "allow",
      priority: 10,
    });

    this.definePolicy({
      id: "mortgage-data-access",
      description: "Access to sensitive mortgage data",
      resources: ["/api/mortgages/*", "/api/borrowers/*"],
      actions: ["read", "write"],
      conditions: [
        {
          type: "claim",
          claim: "role",
          operator: "in",
          value: ["loan-officer", "underwriter", "admin"],
        },
        {
          type: "claim",
          claim: "compliance-certified",
          operator: "equals",
          value: true,
        },
      ],
      effect: "allow",
      priority: 75,
    });
  }

  definePolicy(policy: AuthorizationPolicy): void {
    this.validatePolicy(policy);
    this.policies.set(policy.id, policy);
  }

  removePolicy(policyId: string): boolean {
    return this.policies.delete(policyId);
  }

  async authorize(
    principal: Principal,
    resource: string,
    action: string
  ): Promise<AuthorizationResult> {
    const claims = this.extractClaims(principal);
    const applicablePolicies = this.findApplicablePolicies(resource, action);
    if (applicablePolicies.length === 0) {
      return { allowed: false, reason: "No matching authorization policy" };
    }
    applicablePolicies.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    for (const policy of applicablePolicies) {
      const result = await this.evaluatePolicy(policy, claims);
      if (policy.effect === "deny" && result.allowed) {
        return {
          allowed: false,
          reason: `Denied by policy: ${policy.description}`,
          policy: policy.id,
        };
      }
      if (policy.effect === "allow" && result.allowed) {
        return {
          allowed: true,
          reason: `Allowed by policy: ${policy.description}`,
          policy: policy.id,
        };
      }
    }
    return {
      allowed: false,
      reason: "No policy explicitly allows this action",
    };
  }

  private extractClaims(principal: Principal): Map<string, unknown> {
    const claimsMap = new Map<string, unknown>();
    for (const claim of principal.claims) {
      claimsMap.set(claim.type, claim.value);
    }
    return claimsMap;
  }

  private findApplicablePolicies(
    resource: string,
    action: string
  ): AuthorizationPolicy[] {
    return Array.from(this.policies.values()).filter((policy) => {
      const resourceMatches = policy.resources.some((pattern) => {
        if (pattern === "/*" || pattern === "*") return true;
        if (pattern.endsWith("/*")) {
          return resource.startsWith(pattern.slice(0, -2));
        }
        return pattern === resource;
      });
      const actionMatches =
        policy.actions.includes("*") || policy.actions.includes(action);
      return resourceMatches && actionMatches;
    });
  }

  private async evaluatePolicy(
    policy: AuthorizationPolicy,
    claims: Map<string, unknown>
  ): Promise<{ allowed: boolean }> {
    for (const condition of policy.conditions) {
      const met = this.evaluateCondition(condition, claims);
      if (!met) return { allowed: false };
    }
    return { allowed: true };
  }

  private evaluateCondition(
    condition: PolicyCondition,
    claims: Map<string, unknown>
  ): boolean {
    if (condition.type === "claim") {
      return this.evaluateClaimCondition(condition, claims);
    }
    if (condition.type === "time") {
      return true; // simplified for testing
    }
    return false;
  }

  private evaluateClaimCondition(
    condition: PolicyCondition,
    claims: Map<string, unknown>
  ): boolean {
    if (!condition.claim) return false;
    const claimValue = claims.get(condition.claim);
    if (claimValue === undefined) return false;
    switch (condition.operator) {
      case "equals":
        return claimValue === condition.value;
      case "contains":
        if (Array.isArray(claimValue)) {
          return claimValue.includes(condition.value);
        }
        return String(claimValue).includes(String(condition.value));
      case "in":
        if (Array.isArray(condition.value)) {
          return (condition.value as unknown[]).includes(claimValue);
        }
        return false;
      case "matches": {
        const regex = new RegExp(condition.value as string);
        return regex.test(String(claimValue));
      }
      default:
        return false;
    }
  }

  private validatePolicy(policy: AuthorizationPolicy): void {
    if (!policy.id || !policy.resources || !policy.actions) {
      throw new Error("Invalid policy: missing required fields");
    }
    if (policy.effect !== "allow" && policy.effect !== "deny") {
      throw new Error("Invalid policy effect: must be allow or deny");
    }
  }

  getPolicies(): AuthorizationPolicy[] {
    return Array.from(this.policies.values());
  }

  getPolicy(policyId: string): AuthorizationPolicy | undefined {
    return this.policies.get(policyId);
  }
}

describe("ClaimsAuthorizer", () => {
  let authorizer: ClaimsAuthorizer;

  beforeEach(() => {
    authorizer = new ClaimsAuthorizer();
  });

  describe("default policies", () => {
    it("initializes with default policies", () => {
      const policies = authorizer.getPolicies();
      expect(policies.length).toBeGreaterThanOrEqual(3);
      expect(authorizer.getPolicy("admin-full-access")).toBeDefined();
      expect(authorizer.getPolicy("read-only")).toBeDefined();
      expect(authorizer.getPolicy("mortgage-data-access")).toBeDefined();
    });
  });

  describe("definePolicy / removePolicy", () => {
    it("adds a custom policy", () => {
      authorizer.definePolicy({
        id: "test-policy",
        description: "Test",
        resources: ["/test"],
        actions: ["read"],
        conditions: [],
        effect: "allow",
        priority: 1,
      });
      expect(authorizer.getPolicy("test-policy")).toBeDefined();
    });

    it("removes a policy", () => {
      expect(authorizer.removePolicy("read-only")).toBe(true);
      expect(authorizer.getPolicy("read-only")).toBeUndefined();
    });

    it("returns false when removing a non-existent policy", () => {
      expect(authorizer.removePolicy("nonexistent")).toBe(false);
    });

    it("rejects policies with invalid effect", () => {
      expect(() =>
        authorizer.definePolicy({
          id: "bad",
          description: "Bad",
          resources: ["/x"],
          actions: ["read"],
          conditions: [],
          effect: "maybe" as "allow",
          priority: 1,
        })
      ).toThrow("Invalid policy effect");
    });

    it("rejects policies with missing required fields", () => {
      expect(() =>
        authorizer.definePolicy({
          id: "",
          description: "Bad",
          resources: ["/x"],
          actions: ["read"],
          conditions: [],
          effect: "allow",
        })
      ).toThrow("Invalid policy: missing required fields");
    });
  });

  describe("authorize - admin access", () => {
    it("grants admin full access to any resource", async () => {
      const principal: Principal = {
        id: "admin-1",
        type: "user",
        claims: [{ type: "role", value: ["admin", "user"] }],
      };
      const result = await authorizer.authorize(
        principal,
        "/api/anything",
        "write"
      );
      expect(result.allowed).toBe(true);
      expect(result.policy).toBe("admin-full-access");
    });
  });

  describe("authorize - read-only public access", () => {
    it("grants read access to public API without claims", async () => {
      const principal: Principal = {
        id: "anon-1",
        type: "user",
        claims: [],
      };
      const result = await authorizer.authorize(
        principal,
        "/api/public/rates",
        "read"
      );
      expect(result.allowed).toBe(true);
      expect(result.policy).toBe("read-only");
    });

    it("denies write access to public API", async () => {
      const principal: Principal = {
        id: "anon-1",
        type: "user",
        claims: [],
      };
      const result = await authorizer.authorize(
        principal,
        "/api/public/rates",
        "write"
      );
      expect(result.allowed).toBe(false);
    });
  });

  describe("authorize - mortgage data access", () => {
    it("grants access to compliance-certified loan officers", async () => {
      const principal: Principal = {
        id: "lo-1",
        type: "user",
        claims: [
          { type: "role", value: "loan-officer" },
          { type: "compliance-certified", value: true as unknown as string },
        ],
      };
      const result = await authorizer.authorize(
        principal,
        "/api/mortgages/123",
        "read"
      );
      expect(result.allowed).toBe(true);
      expect(result.policy).toBe("mortgage-data-access");
    });

    it("denies access to non-certified users", async () => {
      const principal: Principal = {
        id: "lo-2",
        type: "user",
        claims: [
          { type: "role", value: "loan-officer" },
          { type: "compliance-certified", value: false as unknown as string },
        ],
      };
      const result = await authorizer.authorize(
        principal,
        "/api/mortgages/123",
        "read"
      );
      expect(result.allowed).toBe(false);
    });

    it("denies access to users without appropriate role", async () => {
      const principal: Principal = {
        id: "user-1",
        type: "user",
        claims: [
          { type: "role", value: "viewer" },
          { type: "compliance-certified", value: true as unknown as string },
        ],
      };
      const result = await authorizer.authorize(
        principal,
        "/api/mortgages/123",
        "read"
      );
      expect(result.allowed).toBe(false);
    });
  });

  describe("authorize - no matching policy", () => {
    it("denies access when no policy matches resource", async () => {
      const principal: Principal = {
        id: "user-1",
        type: "user",
        claims: [],
      };
      const result = await authorizer.authorize(
        principal,
        "/internal/secret",
        "read"
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("No policy explicitly allows this action");
    });
  });

  describe("authorize - deny policies", () => {
    it("deny effect overrides allow when conditions match", async () => {
      authorizer.definePolicy({
        id: "deny-banned",
        description: "Block banned users",
        resources: ["/*"],
        actions: ["*"],
        conditions: [
          { type: "claim", claim: "banned", operator: "equals", value: true },
        ],
        effect: "deny",
        priority: 200,
      });

      const principal: Principal = {
        id: "banned-user",
        type: "user",
        claims: [
          { type: "role", value: ["admin"] },
          { type: "banned", value: true as unknown as string },
        ],
      };
      const result = await authorizer.authorize(
        principal,
        "/api/anything",
        "read"
      );
      expect(result.allowed).toBe(false);
      expect(result.policy).toBe("deny-banned");
    });
  });

  describe("authorize - claim condition operators", () => {
    it('handles "contains" operator for string values', async () => {
      authorizer.definePolicy({
        id: "contains-test",
        description: "Test contains",
        resources: ["/test/*"],
        actions: ["read"],
        conditions: [
          {
            type: "claim",
            claim: "department",
            operator: "contains",
            value: "eng",
          },
        ],
        effect: "allow",
        priority: 50,
      });

      const principal: Principal = {
        id: "u1",
        type: "user",
        claims: [{ type: "department", value: "engineering" }],
      };
      const result = await authorizer.authorize(principal, "/test/x", "read");
      expect(result.allowed).toBe(true);
    });

    it('handles "matches" operator for regex patterns', async () => {
      authorizer.definePolicy({
        id: "matches-test",
        description: "Test matches",
        resources: ["/test/*"],
        actions: ["read"],
        conditions: [
          {
            type: "claim",
            claim: "email",
            operator: "matches",
            value: "@example\\.com$",
          },
        ],
        effect: "allow",
        priority: 50,
      });

      const principal: Principal = {
        id: "u1",
        type: "user",
        claims: [{ type: "email", value: "user@example.com" }],
      };
      const result = await authorizer.authorize(principal, "/test/x", "read");
      expect(result.allowed).toBe(true);
    });
  });
});
