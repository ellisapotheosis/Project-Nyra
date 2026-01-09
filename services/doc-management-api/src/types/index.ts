import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export enum PermissionType {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  SHARE = 'share',
  SIGN = 'sign',
}

export enum DocumentStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export interface DocumentMetadata {
  title: string;
  description?: string;
  author?: string;
  keywords?: string[];
  customFields?: Record<string, any>;
}

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  pageCount?: number;
}

export interface SearchQuery {
  query?: string;
  tags?: string[];
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  author?: string;
  status?: DocumentStatus;
  page?: number;
  limit?: number;
}

export interface S3UploadResult {
  key: string;
  bucket: string;
  location: string;
  etag: string;
}

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface SigningRequest {
  documentId: string;
  signers: SignerInfo[];
  emailSubject?: string;
  emailBody?: string;
  redirectUrl?: string;
}

export interface SignerInfo {
  email: string;
  name: string;
  order?: number;
  role?: string;
}

export interface VersionComparisonResult {
  added: string[];
  removed: string[];
  modified: string[];
  similarity: number;
}
