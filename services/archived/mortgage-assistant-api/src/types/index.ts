import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface JWTPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SMSOptions {
  to: string;
  body: string;
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

export interface FileUploadData {
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

export interface LoanApplicationData {
  loanType: string;
  requestedAmount: number;
  propertyAddress?: string;
  propertyValue?: number;
  downPayment?: number;
  termMonths?: number;
}

export interface AppointmentData {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  meetingLink?: string;
}

export interface TaskData {
  title: string;
  description?: string;
  priority: string;
  dueDate?: Date;
  assignedToId?: string;
}
