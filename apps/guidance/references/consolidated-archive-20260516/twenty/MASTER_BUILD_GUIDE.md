# TwentyCRM Integration - Master Build Guide

> **System of record for leads, contacts, and mortgage pipeline**
> **Consolidated from archived TwentyCRM configurations and workflows**

## 🎯 **MISSION STATEMENT**

Integrate TwentyCRM as the central system of record for all customer data, lead management, and mortgage pipeline tracking with full customization for mortgage industry workflows.

**Port**: 3020 (TwentyCRM default)
**Stack**: TwentyCRM + Custom Objects + API Integration + Webhooks
**Integration Points**: Nexus Router, n8n, Admin Dashboard, Landing Page

---

## 📋 **TWENTY CRM CUSTOMIZATION SPEC**

### **Custom Objects & Fields**

#### 1. **Lead Object Enhancements**
```typescript
interface MortgageLead extends TwentyLead {
  // Mortgage-specific fields
  loanPurpose: 'purchase' | 'refinance' | 'cash_out' | 'heloc';
  loanAmount: number;
  estimatedValue: number;
  downPayment: number;
  creditScoreRange: '300-579' | '580-669' | '670-739' | '740-799' | '800+';

  // Lead source tracking
  source: 'ratehunter' | 'referral' | 'direct_mail' | 'social_media' | 'google_ads';
  sourceDetails: string;
  utmParams: Record<string, string>;

  // Contact preferences
  preferredContact: 'email' | 'phone' | 'text' | 'mail';
  contactTimePreference: string;
  timeZone: string;

  // Compliance tracking
  tcpaConsent: boolean;
  tcpaConsentDate: Date;
  privacyPolicyAccepted: boolean;
  doNotCall: boolean;
  optOutDate?: Date;

  // Lead scoring
  leadScore: number;
  leadGrade: 'A' | 'B' | 'C' | 'D';
  lastScoreUpdate: Date;
  scoringFactors: string[];
}
```

#### 2. **Opportunity (Loan Application) Object**
```typescript
interface LoanOpportunity extends TwentyOpportunity {
  // Loan details
  loanType: 'conventional' | 'fha' | 'va' | 'usda' | 'jumbo';
  loanProgram: string;
  term: 15 | 20 | 25 | 30;
  interestRate: number;
  apr: number;

  // Property information
  propertyAddress: Address;
  propertyType: 'primary' | 'secondary' | 'investment';
  propertyValue: number;

  // Financial details
  totalLoanAmount: number;
  downPaymentAmount: number;
  downPaymentPercentage: number;
  monthlyPayment: number;

  // Process tracking
  applicationDate: Date;
  lockExpirationDate?: Date;
  estimatedClosingDate: Date;
  actualClosingDate?: Date;

  // Document status
  documentsReceived: number;
  documentsRequired: number;
  documentCompletionPercentage: number;

  // Compliance milestones
  disclosuresDelivered: boolean;
  disclosureDeliveryDate?: Date;
  borrowerAcknowledgment?: Date;
  complianceStatus: 'pending' | 'in_review' | 'approved' | 'issue';
}
```

#### 3. **Contact Enhancements**
```typescript
interface MortgageContact extends TwentyContact {
  // Financial profile
  employmentStatus: 'employed' | 'self_employed' | 'unemployed' | 'retired';
  monthlyIncome: number;
  assets: number;
  debts: number;
  debtToIncomeRatio: number;

  // Mortgage history
  currentMortgage: boolean;
  currentMortgageBalance?: number;
  currentMortgagePayment?: number;
  previousMortgages: MortgageHistory[];

  // Communication history
  lastContactDate: Date;
  lastContactType: 'call' | 'email' | 'text' | 'meeting';
  nextFollowUpDate?: Date;
  communicationPreferences: ContactPreferences;

  // Relationships
  coBorrower?: string; // Contact ID
  realtor?: string; // Contact ID
  attorney?: string; // Contact ID
  insurance?: string; // Contact ID
}
```

#### 4. **Campaign Tracking Object**
```typescript
interface MortgageCampaign extends TwentyCampaign {
  // Campaign specifics
  campaignType: 'drip' | 'nurture' | 'refi_alert' | 'rate_drop' | 'seasonal';
  targetAudience: 'first_time_buyers' | 'refinance_prospects' | 'existing_customers';
  loanProducts: string[];

  // Performance metrics
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  textsSent: number;
  textsReplied: number;
  callsMade: number;
  callsAnswered: number;

  // Conversion tracking
  leadsGenerated: number;
  applicationsStarted: number;
  applicationsCompleted: number;
  loansApproved: number;
  totalLoanVolume: number;

  // ROI calculation
  campaignCost: number;
  revenueGenerated: number;
  roi: number;
  costPerLead: number;
  costPerApplication: number;
}
```

---

## 🔄 **API INTEGRATION PATTERNS**

### **Webhook Configuration**
```typescript
// TwentyCRM webhook endpoints for real-time sync
const webhookEndpoints = {
  // Lead events
  'lead.created': 'POST /api/webhooks/twenty/lead-created',
  'lead.updated': 'POST /api/webhooks/twenty/lead-updated',
  'lead.status_changed': 'POST /api/webhooks/twenty/lead-status-changed',

  // Opportunity events
  'opportunity.created': 'POST /api/webhooks/twenty/opportunity-created',
  'opportunity.stage_changed': 'POST /api/webhooks/twenty/opportunity-stage-changed',
  'opportunity.closed': 'POST /api/webhooks/twenty/opportunity-closed',

  // Contact events
  'contact.updated': 'POST /api/webhooks/twenty/contact-updated',
  'contact.communication': 'POST /api/webhooks/twenty/contact-communication',

  // Campaign events
  'campaign.interaction': 'POST /api/webhooks/twenty/campaign-interaction',
  'campaign.conversion': 'POST /api/webhooks/twenty/campaign-conversion'
};
```

### **Nexus Router Integration**
```typescript
// GraphQL queries through Nexus Router
const twentyGraphQLQueries = {
  // Lead management
  getLeads: `
    query GetLeads($filter: LeadFilterInput, $pagination: PaginationInput) {
      leads(filter: $filter, pagination: $pagination) {
        id
        name
        email
        phone
        source
        loanAmount
        creditScoreRange
        leadScore
        status
        createdAt
        updatedAt
      }
    }
  `,

  createLead: `
    mutation CreateLead($input: CreateLeadInput!) {
      createLead(input: $input) {
        id
        name
        email
        phone
        source
        loanAmount
        status
        createdAt
      }
    }
  `,

  updateLeadScore: `
    mutation UpdateLeadScore($id: ID!, $score: Int!, $grade: String!) {
      updateLead(id: $id, input: {
        leadScore: $score
        leadGrade: $grade
        lastScoreUpdate: $now
      }) {
        id
        leadScore
        leadGrade
      }
    }
  `,

  // Pipeline management
  getPipeline: `
    query GetLoanPipeline($stage: String, $dateRange: DateRangeInput) {
      opportunities(filter: {
        stage: $stage
        createdAt: $dateRange
        type: "mortgage_loan"
      }) {
        id
        name
        stage
        loanAmount
        estimatedClosingDate
        contact {
          name
          email
          phone
        }
        customFields {
          loanType
          interestRate
          lockExpirationDate
        }
      }
    }
  `
};
```

### **Lead Scoring Integration**
```typescript
// Automated lead scoring algorithm
interface LeadScoringCriteria {
  // Demographic scoring
  creditScore: { weight: 0.25, scores: { '740+': 25, '670-739': 20, '580-669': 15, '<580': 5 } };
  income: { weight: 0.20, scores: { '>$100k': 20, '$75k-$100k': 15, '$50k-$75k': 10, '<$50k': 5 } };
  downPayment: { weight: 0.15, scores: { '>20%': 15, '10-20%': 12, '5-10%': 8, '<5%': 3 } };

  // Behavioral scoring
  engagement: { weight: 0.15, scores: { 'high': 15, 'medium': 10, 'low': 5, 'none': 0 } };
  timeOnSite: { weight: 0.10, scores: { '>5min': 10, '2-5min': 7, '1-2min': 4, '<1min': 1 } };

  // Urgency scoring
  timeline: { weight: 0.10, scores: { '<30days': 10, '1-3months': 8, '3-6months': 5, '>6months': 2 } };

  // Source quality
  source: { weight: 0.05, scores: { 'referral': 5, 'direct': 4, 'organic': 3, 'paid': 2 } };
}

async function calculateLeadScore(lead: MortgageLead): Promise<number> {
  let totalScore = 0;
  const criteria = LeadScoringCriteria;

  // Calculate weighted score for each criterion
  for (const [criterion, config] of Object.entries(criteria)) {
    const leadValue = lead[criterion as keyof MortgageLead];
    const score = config.scores[leadValue as string] || 0;
    totalScore += score * config.weight * 100; // Scale to 100
  }

  return Math.round(totalScore);
}
```

---

## 📊 **PIPELINE CONFIGURATION**

### **Mortgage-Specific Pipeline Stages**
```typescript
const mortgagePipeline = {
  stages: [
    {
      id: 'lead',
      name: 'Lead',
      description: 'Initial contact and qualification',
      automations: ['lead_scoring', 'auto_assign', 'welcome_email'],
      sla: { response: '1 hour', followUp: '24 hours' }
    },
    {
      id: 'pre_qualified',
      name: 'Pre-Qualified',
      description: 'Basic financial qualification completed',
      requirements: ['credit_check', 'income_verification', 'debt_analysis'],
      automations: ['send_pre_qual_letter', 'realtor_notification']
    },
    {
      id: 'application',
      name: 'Application',
      description: 'Formal loan application submitted',
      requirements: ['1003_form', 'initial_documents', 'property_details'],
      automations: ['document_checklist', 'disclosure_delivery', 'processor_assignment']
    },
    {
      id: 'processing',
      name: 'Processing',
      description: 'Application in underwriting review',
      requirements: ['all_documents', 'appraisal', 'title_work', 'insurance'],
      automations: ['status_updates', 'condition_tracking', 'timeline_alerts']
    },
    {
      id: 'underwriting',
      name: 'Underwriting',
      description: 'Final underwriting approval',
      requirements: ['underwriter_review', 'conditions_cleared', 'final_approval'],
      automations: ['approval_notification', 'closing_coordination']
    },
    {
      id: 'clear_to_close',
      name: 'Clear to Close',
      description: 'Approved and ready for closing',
      requirements: ['final_conditions', 'closing_disclosure', 'funding_approved'],
      automations: ['closing_coordination', 'final_walkthrough_scheduling']
    },
    {
      id: 'closed',
      name: 'Closed',
      description: 'Loan funded and closed',
      automations: ['welcome_package', 'survey_request', 'referral_program'],
      followUp: ['30_day_checkin', '6_month_review', 'annual_review']
    }
  ],

  // Stage transition rules
  transitions: {
    'lead -> pre_qualified': {
      required: ['credit_score', 'income_amount', 'debt_ratio'],
      automated: true
    },
    'pre_qualified -> application': {
      required: ['property_selected', '1003_started'],
      automated: false
    },
    'application -> processing': {
      required: ['1003_complete', 'initial_docs_received'],
      automated: true
    }
  }
};
```

### **Custom Dashboards & Reports**
```typescript
// TwentyCRM dashboard configuration for mortgage operations
const mortgageDashboards = {
  // Executive dashboard
  executive: {
    widgets: [
      { type: 'metric', title: 'Monthly Loan Volume', query: 'sum(closed_loans.amount)' },
      { type: 'metric', title: 'Conversion Rate', query: 'leads_to_applications_rate' },
      { type: 'chart', title: 'Pipeline Value', query: 'pipeline_by_stage' },
      { type: 'chart', title: 'Lead Sources ROI', query: 'roi_by_source' }
    ]
  },

  // Loan officer dashboard
  loanOfficer: {
    widgets: [
      { type: 'table', title: 'My Active Loans', query: 'assigned_opportunities' },
      { type: 'metric', title: 'This Month Closings', query: 'monthly_closings' },
      { type: 'calendar', title: 'Upcoming Deadlines', query: 'deadline_calendar' },
      { type: 'chart', title: 'Lead Response Time', query: 'response_time_trend' }
    ]
  },

  // Processor dashboard
  processor: {
    widgets: [
      { type: 'table', title: 'Processing Queue', query: 'processing_loans' },
      { type: 'metric', title: 'Avg Processing Time', query: 'avg_processing_days' },
      { type: 'list', title: 'Outstanding Conditions', query: 'pending_conditions' },
      { type: 'chart', title: 'Document Completion Rate', query: 'doc_completion_trend' }
    ]
  }
};
```

---

## 🔄 **WORKFLOW AUTOMATIONS**

### **n8n Integration Workflows**
```typescript
// Automated workflows triggered by TwentyCRM events
const automationWorkflows = {
  // Lead nurturing
  leadNurturing: {
    trigger: 'webhook: lead.created',
    actions: [
      { type: 'wait', duration: '5 minutes' },
      { type: 'email', template: 'welcome_series_1' },
      { type: 'wait', duration: '2 days' },
      { type: 'email', template: 'welcome_series_2' },
      { type: 'condition', check: 'lead.engagement > 0.3' },
      { type: 'assign', to: 'best_available_lo' }
    ]
  },

  // Application processing
  applicationWorkflow: {
    trigger: 'webhook: opportunity.created',
    actions: [
      { type: 'create_checklist', template: 'document_requirements' },
      { type: 'send_disclosures', compliance: 'tila_respa' },
      { type: 'assign_processor', criteria: 'loan_type_expertise' },
      { type: 'schedule_followup', days: 3 }
    ]
  },

  // Rate drop alerts
  rateDropAlert: {
    trigger: 'schedule: daily 9am',
    actions: [
      { type: 'check_rate_changes', threshold: '0.125%' },
      { type: 'query_customers', filter: 'refinance_eligible' },
      { type: 'send_campaign', template: 'rate_drop_notification' },
      { type: 'create_opportunities', source: 'rate_alert' }
    ]
  }
};
```

### **Lead Assignment Rules**
```typescript
interface LeadAssignmentRule {
  criteria: {
    loanAmount?: { min?: number; max?: number };
    loanType?: string[];
    creditScore?: { min?: number };
    geography?: string[];
    source?: string[];
  };
  assignment: {
    type: 'round_robin' | 'weighted' | 'specialty' | 'geographic';
    agents: string[];
    weights?: Record<string, number>;
  };
  priority: number;
}

const assignmentRules: LeadAssignmentRule[] = [
  {
    criteria: { loanAmount: { min: 1000000 } }, // Jumbo loans
    assignment: { type: 'specialty', agents: ['jumbo_specialist_1', 'jumbo_specialist_2'] },
    priority: 1
  },
  {
    criteria: { loanType: ['va'] },
    assignment: { type: 'specialty', agents: ['va_specialist_1'] },
    priority: 2
  },
  {
    criteria: { geography: ['CA', 'NY'] },
    assignment: { type: 'geographic', agents: ['west_coast_team', 'east_coast_team'] },
    priority: 3
  },
  {
    criteria: {}, // Default rule
    assignment: {
      type: 'weighted',
      agents: ['lo_1', 'lo_2', 'lo_3'],
      weights: { 'lo_1': 0.4, 'lo_2': 0.35, 'lo_3': 0.25 }
    },
    priority: 10
  }
];
```

---

## 📈 **REPORTING & ANALYTICS**

### **Key Performance Indicators (KPIs)**
```typescript
const mortgageKPIs = {
  // Lead metrics
  leadMetrics: {
    'lead_volume': 'COUNT(leads) WHERE created_date = current_month',
    'lead_quality': 'AVG(lead_score) WHERE created_date = current_month',
    'lead_response_time': 'AVG(first_contact_time - created_time)',
    'lead_to_application_rate': 'COUNT(applications) / COUNT(leads) * 100'
  },

  // Pipeline metrics
  pipelineMetrics: {
    'pipeline_value': 'SUM(loan_amount) WHERE stage != "closed" AND stage != "dead"',
    'weighted_pipeline': 'SUM(loan_amount * stage_probability)',
    'avg_days_in_pipeline': 'AVG(current_date - application_date) WHERE stage != "closed"',
    'conversion_by_stage': 'COUNT(next_stage) / COUNT(current_stage) * 100'
  },

  // Production metrics
  productionMetrics: {
    'monthly_volume': 'SUM(loan_amount) WHERE close_date = current_month',
    'monthly_units': 'COUNT(loans) WHERE close_date = current_month',
    'avg_loan_size': 'AVG(loan_amount) WHERE close_date = current_month',
    'pull_through_rate': 'COUNT(closed_loans) / COUNT(applications) * 100'
  },

  // Quality metrics
  qualityMetrics: {
    'document_turnaround': 'AVG(doc_received_date - doc_requested_date)',
    'processing_time': 'AVG(clear_to_close_date - application_date)',
    'customer_satisfaction': 'AVG(survey_rating) WHERE survey_date = current_quarter',
    'compliance_score': 'COUNT(compliant_loans) / COUNT(total_loans) * 100'
  }
};
```

### **Custom Report Templates**
```typescript
const reportTemplates = {
  // Daily pipeline report
  dailyPipeline: {
    schedule: 'daily 8am',
    recipients: ['management', 'loan_officers'],
    sections: [
      { type: 'summary', metrics: ['new_leads', 'new_applications', 'closings_today'] },
      { type: 'table', data: 'loans_closing_this_week' },
      { type: 'chart', data: 'pipeline_by_stage' }
    ]
  },

  // Monthly performance report
  monthlyPerformance: {
    schedule: 'monthly 1st 9am',
    recipients: ['executives', 'managers'],
    sections: [
      { type: 'executive_summary', period: 'month' },
      { type: 'kpi_dashboard', metrics: 'all' },
      { type: 'trends', comparison: 'year_over_year' },
      { type: 'action_items', source: 'performance_analysis' }
    ]
  }
};
```

---

## 🚀 **IMPLEMENTATION PHASES**

### **Phase 1: Core Setup (Week 1)**
- [ ] TwentyCRM deployment and configuration
- [ ] Custom object creation (Lead, Opportunity, Contact enhancements)
- [ ] Basic pipeline configuration
- [ ] API authentication with Nexus Router

### **Phase 2: Data Integration (Week 2)**
- [ ] Lead import from existing sources
- [ ] Webhook configuration for real-time sync
- [ ] GraphQL schema implementation
- [ ] Lead scoring algorithm deployment

### **Phase 3: Workflow Automation (Week 3)**
- [ ] n8n workflow integration
- [ ] Lead assignment rules configuration
- [ ] Email template creation
- [ ] Compliance workflow setup

### **Phase 4: Reporting & Analytics (Week 4)**
- [ ] Custom dashboard creation
- [ ] KPI tracking implementation
- [ ] Report automation setup
- [ ] User training and documentation

---

## 🔧 **CONFIGURATION FILES**

### **TwentyCRM Environment Setup**
```env
# TwentyCRM Configuration
TWENTY_DATABASE_URL=postgresql://user:pass@localhost:5432/twenty
TWENTY_FRONTEND_BASE_URL=http://localhost:3020
TWENTY_SERVER_BASE_URL=http://localhost:3020/api

# Integration Settings
NEXUS_ROUTER_URL=http://localhost:6000
N8N_WEBHOOK_BASE_URL=http://localhost:5678/webhook
WEBHOOK_SECRET=your_webhook_secret_here

# Email Configuration
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=noreply@nyra.com
EMAIL_SMTP_PASSWORD=your_app_password

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

### **Custom Object Schema (SQL)**
```sql
-- Lead enhancements
ALTER TABLE leads ADD COLUMN loan_purpose VARCHAR(50);
ALTER TABLE leads ADD COLUMN loan_amount DECIMAL(12,2);
ALTER TABLE leads ADD COLUMN credit_score_range VARCHAR(20);
ALTER TABLE leads ADD COLUMN lead_score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN lead_grade VARCHAR(1);
ALTER TABLE leads ADD COLUMN tcpa_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN tcpa_consent_date TIMESTAMP;

-- Opportunity enhancements
ALTER TABLE opportunities ADD COLUMN loan_type VARCHAR(50);
ALTER TABLE opportunities ADD COLUMN interest_rate DECIMAL(6,3);
ALTER TABLE opportunities ADD COLUMN apr DECIMAL(6,3);
ALTER TABLE opportunities ADD COLUMN property_value DECIMAL(12,2);
ALTER TABLE opportunities ADD COLUMN lock_expiration_date DATE;
ALTER TABLE opportunities ADD COLUMN documents_received INTEGER DEFAULT 0;
ALTER TABLE opportunities ADD COLUMN documents_required INTEGER DEFAULT 0;

-- Contact enhancements
ALTER TABLE contacts ADD COLUMN monthly_income DECIMAL(12,2);
ALTER TABLE contacts ADD COLUMN debt_to_income_ratio DECIMAL(5,2);
ALTER TABLE contacts ADD COLUMN employment_status VARCHAR(50);
ALTER TABLE contacts ADD COLUMN current_mortgage_balance DECIMAL(12,2);
```

---

## 📚 **REFERENCE DOCUMENTATION**

### **TwentyCRM API Documentation**
- **GraphQL Playground**: `http://localhost:3020/graphql`
- **REST API**: `http://localhost:3020/api/rest`
- **Webhook Configuration**: `/admin/settings/webhooks`
- **Custom Objects**: `/admin/settings/objects`

### **Integration Examples**
```typescript
// Example: Creating a lead from landing page
async function createLeadFromForm(formData: LeadFormData) {
  const leadInput = {
    name: `${formData.firstName} ${formData.lastName}`,
    email: formData.email,
    phone: formData.phone,
    source: formData.source,
    loanAmount: formData.loanAmount,
    loanPurpose: formData.loanPurpose,
    creditScoreRange: formData.creditScore,
    tcpaConsent: formData.consentToContact,
    tcpaConsentDate: new Date(),
    customFields: {
      propertyState: formData.propertyState,
      timeframe: formData.timeframe,
      isFirstTimeBuyer: formData.firstTimeBuyer
    }
  };

  const response = await fetch('/api/twenty/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leadInput)
  });

  if (response.ok) {
    const lead = await response.json();
    await triggerLeadScoringWorkflow(lead.id);
    return lead;
  }
}
```

---

## 🔧 **DEVELOPMENT COMMANDS**

```bash
# TwentyCRM Setup
git clone https://github.com/twentyhq/twenty.git apps/twenty/twenty-core
cd apps/twenty/twenty-core
npm install
npm run setup:db
npm run start

# Custom Configuration
npm run migrate:custom-objects
npm run seed:mortgage-data
npm run setup:webhooks

# Integration Testing
npm run test:api-integration
npm run test:webhook-delivery
npm run test:lead-scoring
```

---

**Last Updated**: 2026-03-10
**Status**: Ready for implementation
**Dependencies**: PostgreSQL, Nexus Router, n8n, Email Service

This master build guide consolidates all TwentyCRM customization requirements, integration patterns, and mortgage-specific workflows into a comprehensive CRM implementation specification.
