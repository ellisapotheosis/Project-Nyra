import { Lead } from './workflows/lead-assignment';

export class ExternalIntegrations {
  static generateNyraContext(lead: Lead) {
    // Generate context payload to sync back to Nyra AI Assistant
    return {
      metadata: {
        source: 'crm_sync',
        timestamp: new Date().toISOString()
      },
      identity: {
        crm_id: lead.id,
        name: `${lead.first_name} ${lead.last_name}`,
        email: lead.email
      },
      variables: {
        loan_amount: lead.loan_amount,
        lead_tier: lead.lead_tier,
        status: lead.status
      }
    };
  }
}
