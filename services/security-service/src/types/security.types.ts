/**
 * Security Types for Claude Flow V3
 * ADR-010: Security Architecture
 */

export interface CVEEntry {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cvss: number;
  affectedComponents: string[];
  detection: string;
  remediation: string;
  status: 'open' | 'mitigated' | 'fixed' | 'wontfix';
  patchVersion?: string;
  discoveredAt?: Date;
  fixedAt?: Date;
}

export interface CVEFinding {
  cveId: string;
  file: string;
  line?: number;
  matches: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  remediation: string;
  context?: string;
}

export interface SecurityScanResult {
  timestamp: Date;
  totalFiles: number;
  filesScanned: number;
  vulnerabilities: CVEFinding[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendations: string[];
}

export interface Claim {
  type: string;
  value: string | string[] | Record<string, any>;
  issuer?: string;
  issuedAt?: Date;
  expiresAt?: Date;
}

export interface Principal {
  id: string;
  type: 'user' | 'service' | 'agent';
  claims: Claim[];
  metadata?: Record<string, any>;
}

export interface AuthorizationPolicy {
  id: string;
  description: string;
  resources: string[];
  actions: string[];
  conditions: PolicyCondition[];
  effect: 'allow' | 'deny';
  priority?: number;
}

export interface PolicyCondition {
  type: 'claim' | 'time' | 'ip' | 'custom';
  claim?: string;
  operator: 'equals' | 'contains' | 'matches' | 'between' | 'in';
  value: any;
}

export interface AuthorizationResult {
  allowed: boolean;
  reason: string;
  policy?: string;
  requiredClaims?: string[];
}

export interface ThreatAnalysis {
  threat: string;
  description: string;
  dreadScore: DREADScore;
  mitigation: string;
  implemented: boolean;
}

export interface DREADScore {
  damage: number;
  reproducibility: number;
  exploitability: number;
  affectedUsers: number;
  discoverability: number;
  totalRisk: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface STRIDEThreatModel {
  spoofing: ThreatAnalysis[];
  tampering: ThreatAnalysis[];
  repudiation: ThreatAnalysis[];
  informationDisclosure: ThreatAnalysis[];
  denialOfService: ThreatAnalysis[];
  elevationOfPrivilege: ThreatAnalysis[];
}

export interface ValidationSchema {
  name: string;
  schema: any; // Zod schema
  description?: string;
}

export interface SecurityConfig {
  rateLimiting: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
  };
  inputValidation: {
    enabled: boolean;
    strictMode: boolean;
  };
  pathTraversal: {
    enabled: boolean;
    allowedPaths: string[];
  };
  sqlInjection: {
    enabled: boolean;
    parameterized: boolean;
  };
  xss: {
    enabled: boolean;
    sanitize: boolean;
  };
  csrf: {
    enabled: boolean;
    tokenExpiry: number;
  };
}
