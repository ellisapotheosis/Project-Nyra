import { EntityType } from '../types/crm-types';
import { TransformationMapping } from '../types/sync-types';

/**
 * CRM-specific configuration and field mappings
 */

export const CRM_ENDPOINTS = {
  [EntityType.LEAD]: '/leads',
  [EntityType.CONTACT]: '/contacts',
  [EntityType.DEAL]: '/deals',
  [EntityType.ACTIVITY]: '/activities',
  [EntityType.PIPELINE]: '/pipelines'
};

export const FIELD_MAPPINGS: Record<EntityType, TransformationMapping[]> = {
  [EntityType.LEAD]: [
    { sourceField: 'first_name', targetField: 'firstName', required: true },
    { sourceField: 'last_name', targetField: 'lastName', required: true },
    { sourceField: 'email_address', targetField: 'email', required: true },
    { sourceField: 'phone_number', targetField: 'phone' },
    { sourceField: 'company_name', targetField: 'company' },
    { sourceField: 'lead_status', targetField: 'status', required: true },
    { sourceField: 'lead_source', targetField: 'source' },
    { sourceField: 'lead_score', targetField: 'score', transform: (val) => parseInt(val, 10) },
    { sourceField: 'owner_id', targetField: 'ownerId' }
  ],
  [EntityType.CONTACT]: [
    { sourceField: 'first_name', targetField: 'firstName', required: true },
    { sourceField: 'last_name', targetField: 'lastName', required: true },
    { sourceField: 'email_address', targetField: 'email', required: true },
    { sourceField: 'phone_number', targetField: 'phone' },
    { sourceField: 'mobile_number', targetField: 'mobile' },
    { sourceField: 'job_title', targetField: 'title' },
    { sourceField: 'company_name', targetField: 'company' },
    { sourceField: 'company_id', targetField: 'companyId' },
    { sourceField: 'owner_id', targetField: 'ownerId' },
    { sourceField: 'lead_id', targetField: 'leadId' },
    { sourceField: 'contact_tags', targetField: 'tags', transform: (val) => Array.isArray(val) ? val : [] }
  ],
  [EntityType.DEAL]: [
    { sourceField: 'deal_name', targetField: 'name', required: true },
    { sourceField: 'deal_amount', targetField: 'amount', required: true, transform: (val) => parseFloat(val) },
    { sourceField: 'currency_code', targetField: 'currency', defaultValue: 'USD' },
    { sourceField: 'deal_stage', targetField: 'stage', required: true },
    { sourceField: 'win_probability', targetField: 'probability', transform: (val) => parseFloat(val) },
    { sourceField: 'expected_close_date', targetField: 'expectedCloseDate', transform: (val) => new Date(val) },
    { sourceField: 'actual_close_date', targetField: 'actualCloseDate', transform: (val) => val ? new Date(val) : undefined },
    { sourceField: 'contact_id', targetField: 'contactId' },
    { sourceField: 'company_id', targetField: 'companyId' },
    { sourceField: 'owner_id', targetField: 'ownerId' },
    { sourceField: 'pipeline_id', targetField: 'pipelineId', required: true },
    { sourceField: 'deal_status', targetField: 'status', required: true }
  ],
  [EntityType.ACTIVITY]: [
    { sourceField: 'activity_type', targetField: 'type', required: true },
    { sourceField: 'activity_subject', targetField: 'subject', required: true },
    { sourceField: 'activity_description', targetField: 'description' },
    { sourceField: 'start_date', targetField: 'startDate', required: true, transform: (val) => new Date(val) },
    { sourceField: 'end_date', targetField: 'endDate', transform: (val) => val ? new Date(val) : undefined },
    { sourceField: 'is_completed', targetField: 'completed', transform: (val) => Boolean(val) },
    { sourceField: 'contact_id', targetField: 'contactId' },
    { sourceField: 'deal_id', targetField: 'dealId' },
    { sourceField: 'lead_id', targetField: 'leadId' },
    { sourceField: 'owner_id', targetField: 'ownerId' }
  ],
  [EntityType.PIPELINE]: [
    { sourceField: 'pipeline_name', targetField: 'name', required: true },
    { sourceField: 'pipeline_stages', targetField: 'stages', required: true },
    { sourceField: 'is_active', targetField: 'isActive', transform: (val) => Boolean(val) }
  ]
};

export const WEBHOOK_EVENTS = {
  LEAD_CREATED: 'lead.created',
  LEAD_UPDATED: 'lead.updated',
  LEAD_DELETED: 'lead.deleted',
  CONTACT_CREATED: 'contact.created',
  CONTACT_UPDATED: 'contact.updated',
  CONTACT_DELETED: 'contact.deleted',
  DEAL_CREATED: 'deal.created',
  DEAL_UPDATED: 'deal.updated',
  DEAL_DELETED: 'deal.deleted',
  ACTIVITY_CREATED: 'activity.created',
  ACTIVITY_UPDATED: 'activity.updated',
  ACTIVITY_DELETED: 'activity.deleted'
};

export const RATE_LIMITS = {
  requestsPerMinute: 60,
  requestsPerHour: 1000,
  burstLimit: 10
};
