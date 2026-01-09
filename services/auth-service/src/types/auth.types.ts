import { Request } from 'express';

export interface IUser {
  _id: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  isMfaEnabled: boolean;
  mfaSecret?: string;
  roles: string[];
  permissions: string[];
  oauthProviders?: IOAuthProvider[];
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface IOAuthProvider {
  provider: 'google' | 'microsoft';
  providerId: string;
  email: string;
  displayName: string;
}

export interface IRole {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPermission {
  _id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
  createdAt: Date;
}

export interface ISession {
  _id: string;
  userId: string;
  token: string;
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export interface IApiKey {
  _id: string;
  userId: string;
  name: string;
  key: string;
  hashedKey: string;
  permissions: string[];
  isActive: boolean;
  expiresAt?: Date;
  lastUsed?: Date;
  createdAt: Date;
}

export interface IAuditLog {
  _id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  method: string;
  endpoint: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface ITokenPayload {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  type: 'access' | 'refresh';
}

export interface IAuthRequest extends Request {
  user?: IUser;
  token?: string;
}

export interface IRegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ILoginDto {
  email: string;
  password: string;
  mfaToken?: string;
}

export interface IPasswordResetDto {
  email: string;
}

export interface IPasswordResetConfirmDto {
  token: string;
  newPassword: string;
}

export interface IMfaSetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface IMfaVerifyDto {
  token: string;
}

export interface IApiKeyCreateDto {
  name: string;
  permissions: string[];
  expiresIn?: number;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface IPasswordResetToken {
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface IRateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
  GUEST = 'guest'
}

export enum Permission {
  // User permissions
  USER_READ = 'user:read',
  USER_WRITE = 'user:write',
  USER_DELETE = 'user:delete',

  // Role permissions
  ROLE_READ = 'role:read',
  ROLE_WRITE = 'role:write',
  ROLE_DELETE = 'role:delete',

  // Permission permissions
  PERMISSION_READ = 'permission:read',
  PERMISSION_WRITE = 'permission:write',

  // API Key permissions
  APIKEY_READ = 'apikey:read',
  APIKEY_WRITE = 'apikey:write',
  APIKEY_DELETE = 'apikey:delete',

  // Audit permissions
  AUDIT_READ = 'audit:read',

  // System permissions
  SYSTEM_CONFIG = 'system:config'
}
