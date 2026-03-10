/**
 * TwentyCRM Entity Types
 */

export interface CRMEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Lead extends CRMEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  status: LeadStatus;
  source?: string;
  score?: number;
  ownerId?: string;
  customFields?: Record<string, any>;
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  UNQUALIFIED = 'unqualified',
  CONVERTED = 'converted'
}

export interface Contact extends CRMEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  title?: string;
  company?: string;
  companyId?: string;
  ownerId?: string;
  leadId?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface Deal extends CRMEntity {
  name: string;
  amount: number;
  currency: string;
  stage: string;
  probability?: number;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  contactId?: string;
  companyId?: string;
  ownerId?: string;
  pipelineId: string;
  status: DealStatus;
  customFields?: Record<string, any>;
}

export enum DealStatus {
  OPEN = 'open',
  WON = 'won',
  LOST = 'lost',
  ABANDONED = 'abandoned'
}

export interface Activity extends CRMEntity {
  type: ActivityType;
  subject: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  completed: boolean;
  contactId?: string;
  dealId?: string;
  leadId?: string;
  ownerId?: string;
  customFields?: Record<string, any>;
}

export enum ActivityType {
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
  TASK = 'task',
  NOTE = 'note',
  DEMO = 'demo'
}

export interface Pipeline extends CRMEntity {
  name: string;
  stages: PipelineStage[];
  isActive: boolean;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  probability: number;
}

export interface WebhookPayload {
  event: WebhookEvent;
  entityType: EntityType;
  entityId: string;
  data: any;
  timestamp: Date;
  signature: string;
}

export enum WebhookEvent {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted'
}

export enum EntityType {
  LEAD = 'lead',
  CONTACT = 'contact',
  DEAL = 'deal',
  ACTIVITY = 'activity',
  PIPELINE = 'pipeline'
}
