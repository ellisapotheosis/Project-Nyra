export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  loan_amount?: number;
  lead_tier: 'hot' | 'warm' | 'cold' | 'unqualified';
  status: string;
  contact_count: number;
  documents_uploaded: number;
  rate_lock_expiration?: string;
  last_contact_date?: number;
}

export interface AssignmentResult {
  assignedTo: string;
  method: 'priority_routing' | 'round_robin' | 'default';
}

export class LeadAssignmentWorkflow {
  private static topProducers = ['ellis_andersen', 'senior_lo_1'];
  private static generalGroup = ['group_loan_officers:1', 'group_loan_officers:2'];
  private static roundRobinIndex = 0;

  static async processRule(lead: Lead): Promise<AssignmentResult> {
    // Top Priority: Hot leads assigned immediately to top producers
    if (lead.lead_tier === 'hot') {
      return {
        assignedTo: this.topProducers[0],
        method: 'priority_routing'
      };
    }

    // Warm leads -> round robin distribution
    if (lead.lead_tier === 'warm') {
      const assignee = this.generalGroup[this.roundRobinIndex % this.generalGroup.length];
      this.roundRobinIndex++;
      return {
        assignedTo: assignee,
        method: 'round_robin'
      };
    }

    // Default catch-all
    return {
      assignedTo: 'group_loan_officers:general',
      method: 'default'
    };
  }
}
