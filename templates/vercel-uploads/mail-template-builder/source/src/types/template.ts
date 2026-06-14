/**
 * Email Template Types
 * Core type definitions for the email template builder
 */

export interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  subject: string;
  html: string;          // Raw HTML/MJML
  compiledHtml?: string; // Compiled with inlined CSS
  thumbnail?: string;    // Base64 or URL to preview image
  variables: string[];   // Array of merge tags like ['name', 'email', 'company']
  category?: string;     // Template category
  tags?: string[];       // Tags for filtering
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  subject: string;
  html?: string;
  category?: string;
  tags?: string[];
}

export interface UpdateTemplateInput {
  name?: string;
  description?: string;
  subject?: string;
  html?: string;
  compiledHtml?: string;
  thumbnail?: string;
  variables?: string[];
  category?: string;
  tags?: string[];
}

export interface TemplateVariable {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
}

export interface ExportOptions {
  format: 'html' | 'mjml' | 'text';
  inlineCss?: boolean;
  minify?: boolean;
}

export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export interface PreviewOptions {
  device: DeviceType;
  variables?: Record<string, string>;
}

export interface EditorConfig {
  height?: string;
  storageManager?: boolean;
  plugins?: string[];
  canvas?: {
    styles?: string[];
    scripts?: string[];
  };
}
