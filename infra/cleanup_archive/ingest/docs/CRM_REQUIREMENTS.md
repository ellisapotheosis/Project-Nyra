# Mortgage CRM Requirements

## Executive Summary
Custom CRM system for managing mortgage leads, borrower relationships, loan pipeline, and business intelligence for Ellis D Andersen LLC / West Capital Lending operations.

---

## Core Entities

### 1. Leads
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),

  -- Loan Details
  loan_type VARCHAR(50), -- purchase, refinance, heloc, commercial
  loan_amount DECIMAL(12,2),
  property_value DECIMAL(12,2),
  property_address TEXT,
  credit_score_range VARCHAR(20),
  down_payment DECIMAL(12,2),

  -- Source Attribution
  source_channel VARCHAR(50), -- web, phone, sms, email, referral, partner
  source_campaign VARCHAR(100),
  referral_source VARCHAR(255),

  -- Status & Scoring
  status VARCHAR(50), -- new, contacted, qualified, pre-approved, application, denied, dead, won
  lead_score INTEGER, -- 0-100
  lead_tier VARCHAR(20), -- hot, warm, cold, unqualified

  -- Assignment
  assigned_agent VARCHAR(100),
  assigned_processor VARCHAR(100),
  last_contact_date TIMESTAMP,
  next_follow_up TIMESTAMP,

  -- Compliance
  consent_tcpa BOOLEAN,
  consent_email BOOLEAN,
  consent_sms BOOLEAN,
  do_not_contact BOOLEAN,

  -- Metadata
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN ('new', 'contacted', 'qualified', 'pre-approved', 'application', 'denied', 'dead', 'won'))
);
```

### 2. Borrowers (Converted Leads)
```sql
CREATE TABLE borrowers (
  id UUID PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),

  -- Personal Info
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  ssn_encrypted VARCHAR(255), -- Encrypted
  date_of_birth DATE,
  marital_status VARCHAR(20),
  dependents INTEGER,

  -- Employment
  employer_name VARCHAR(255),
  job_title VARCHAR(100),
  employment_start_date DATE,
  employment_type VARCHAR(50), -- W2, self-employed, retired, unemployed
  gross_monthly_income DECIMAL(10,2),
  additional_income DECIMAL(10,2),

  -- Financial Profile
  credit_score INTEGER,
  credit_report_date DATE,
  total_monthly_debts DECIMAL(10,2),
  dti_ratio DECIMAL(5,2), -- Debt-to-income
  assets_total DECIMAL(12,2),
  liabilities_total DECIMAL(12,2),

  -- Residence
  current_address TEXT,
  residence_type VARCHAR(50), -- own, rent, other
  monthly_housing_payment DECIMAL(10,2),
  years_at_residence DECIMAL(4,1),

  -- Co-Borrower
  has_co_borrower BOOLEAN,
  co_borrower_id UUID REFERENCES borrowers(id),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Loans
```sql
CREATE TABLE loans (
  id UUID PRIMARY KEY,
  borrower_id UUID REFERENCES borrowers(id),
  lead_id UUID REFERENCES leads(id),
  los_loan_id VARCHAR(100), -- External LOS system ID

  -- Loan Details
  loan_number VARCHAR(50) UNIQUE,
  loan_purpose VARCHAR(50), -- purchase, refinance, cash-out-refi, heloc
  loan_type VARCHAR(50), -- conventional, FHA, VA, USDA, jumbo
  loan_amount DECIMAL(12,2),
  interest_rate DECIMAL(5,3),
  apr DECIMAL(5,3),
  loan_term INTEGER, -- months
  rate_lock_date DATE,
  rate_lock_expiration DATE,

  -- Property
  property_address TEXT,
  property_type VARCHAR(50), -- single-family, condo, townhouse, multi-family, commercial
  property_value DECIMAL(12,2),
  ltv_ratio DECIMAL(5,2), -- Loan-to-value
  occupancy VARCHAR(50), -- primary, secondary, investment

  -- Financial
  down_payment DECIMAL(12,2),
  closing_costs DECIMAL(10,2),
  estimated_monthly_payment DECIMAL(10,2),

  -- Status & Milestones
  status VARCHAR(50), -- application, processing, underwriting, approved, denied, closed, cancelled
  application_date DATE,
  pre_approval_date DATE,
  appraisal_ordered_date DATE,
  appraisal_completed_date DATE,
  clear_to_close_date DATE,
  closing_date DATE,
  funding_date DATE,

  -- Team
  loan_officer VARCHAR(100),
  processor VARCHAR(100),
  underwriter VARCHAR(100),

  -- Commission
  commission_amount DECIMAL(10,2),
  commission_paid BOOLEAN,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN ('application', 'processing', 'underwriting', 'approved', 'denied', 'closed', 'cancelled'))
);
```

---

## Key Features

### F-CRM-001: Lead Management Dashboard
**Priority**: CRITICAL

#### Dashboard Views
1. **Pipeline Overview**
   - Total leads this month
   - Conversion rate by stage
   - Average time in each stage
   - Hot leads requiring attention

2. **Lead Grid**
   - Sortable/filterable table
   - Columns: Name, Email, Phone, Loan Amount, Score, Tier, Status, Last Contact, Next Follow-Up
   - Bulk actions: Assign, Tag, Email, Export

3. **Lead Detail Page**
   - Contact information
   - Conversation timeline (Nyra interactions, emails, calls, notes)
   - Documents uploaded
   - Lead score breakdown
   - Related activities (tasks, appointments)

#### Acceptance Criteria
- [ ] Real-time updates (WebSocket or polling)
- [ ] Responsive design (mobile-friendly)
- [ ] Search by name, email, phone
- [ ] Advanced filters (status, date range, score, assigned agent)
- [ ] Export to CSV/Excel

---

### F-CRM-002: Automated Lead Assignment
**Priority**: HIGH

#### Assignment Rules
```typescript
interface AssignmentRule {
  id: string;
  name: string;
  priority: number;
  conditions: Condition[];
  assignTo: string; // Agent ID or round-robin group
  enabled: boolean;
}

// Example: Assign hot leads to Ellis immediately
const rule1: AssignmentRule = {
  id: 'rule_hot_leads',
  name: 'Hot Leads → Ellis',
  priority: 1,
  conditions: [
    { field: 'lead_tier', operator: 'equals', value: 'hot' }
  ],
  assignTo: 'ellis_andersen',
  enabled: true
};

// Example: Round-robin for warm leads
const rule2: AssignmentRule = {
  id: 'rule_warm_round_robin',
  name: 'Warm Leads → Round Robin',
  priority: 2,
  conditions: [
    { field: 'lead_tier', operator: 'equals', value: 'warm' }
  ],
  assignTo: 'group_loan_officers',
  enabled: true
};
```

#### Acceptance Criteria
- [ ] Rules engine with multiple conditions (AND/OR logic)
- [ ] Round-robin distribution with agent capacity limits
- [ ] Automatic re-assignment if no response in X hours
- [ ] Notification to assigned agent (email + CRM alert)
- [ ] Audit trail of assignment history

---

### F-CRM-003: Activity Timeline & Notes
**Priority**: HIGH

#### Activity Types
- **Nyra Conversation**: AI chat interactions
- **Email Sent/Received**: Marketing and transactional emails
- **SMS Sent/Received**: Two-way text messages
- **Phone Call**: Inbound/outbound calls with duration
- **Task Completed**: Checklist items
- **Document Uploaded**: Borrower document submissions
- **Status Change**: Lead/loan status updates
- **Note Added**: Manual notes from agent

#### Timeline UI
```
┌─────────────────────────────────────────────────────┐
│ Activity Timeline for John Doe                     │
├─────────────────────────────────────────────────────┤
│ 🤖 Nyra Conversation         Dec 31, 2025 10:30 AM │
│    "Requested pre-approval for $450K purchase"     │
│    [View Full Transcript]                          │
├─────────────────────────────────────────────────────┤
│ 📧 Email Sent                 Dec 31, 2025 10:32 AM │
│    Subject: "Your Pre-Approval Quote"              │
│    Opened: ✅ Yes | Clicked: ✅ Yes                 │
├─────────────────────────────────────────────────────┤
│ 📝 Note by Ellis              Dec 31, 2025 2:15 PM  │
│    "Spoke with John. Highly motivated buyer.        │
│     Pre-approved for $475K. Following up tomorrow." │
├─────────────────────────────────────────────────────┤
│ 📄 Document Uploaded          Dec 31, 2025 3:45 PM  │
│    "W-2_2023.pdf" (verified ✅)                     │
└─────────────────────────────────────────────────────┘
```

#### Acceptance Criteria
- [ ] Chronological display (newest first)
- [ ] Filter by activity type
- [ ] Search within timeline
- [ ] Rich media preview (document thumbnails, email subject lines)
- [ ] Quick actions (reply to email, call, add note)

---

### F-CRM-004: Task & Reminder System
**Priority**: MEDIUM

#### Task Types
- **Manual**: Created by agent
- **Automated**: Triggered by workflow rules
- **Recurring**: Daily/weekly/monthly tasks

#### Task Structure
```typescript
interface Task {
  id: string;
  relatedTo: {
    type: 'lead' | 'borrower' | 'loan';
    id: string;
  };
  title: string;
  description?: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  status: 'todo' | 'in-progress' | 'completed' | 'cancelled';
  completedAt?: Date;
  completedBy?: string;
  reminders: Reminder[];
}

interface Reminder {
  method: 'email' | 'sms' | 'push';
  timing: 'at-due-date' | '15min-before' | '1hr-before' | '1day-before';
  sent: boolean;
}
```

#### Automated Task Examples
- "Follow up with [Lead Name]" → 24 hours after first contact
- "Request missing documents from [Borrower Name]" → If docs not uploaded in 3 days
- "Rate lock expiring soon for [Loan #]" → 7 days before expiration
- "Schedule appraisal for [Property Address]" → After contract acceptance

#### Acceptance Criteria
- [ ] Calendar view of tasks
- [ ] Overdue task alerts (red indicator)
- [ ] Snooze/reschedule functionality
- [ ] Task templates for common actions
- [ ] Completion checklist for multi-step tasks

---

### F-CRM-005: Loan Pipeline Kanban Board
**Priority**: HIGH

#### Columns (Loan Stages)
```
┌───────────┬───────────┬───────────┬───────────┬───────────┐
│Application│Processing │Underwriting│  Clear   │  Closed  │
│   (12)    │   (18)    │    (9)    │to Close(5)│   (3)    │
├───────────┼───────────┼───────────┼───────────┼───────────┤
│ ┌───────┐ │ ┌───────┐ │ ┌───────┐ │ ┌───────┐ │ ┌───────┐ │
│ │Loan123│ │ │Loan456│ │ │Loan789│ │ │Loan101│ │ │Loan202│ │
│ │$450K  │ │ │$375K  │ │ │$625K  │ │ │$500K  │ │ │$400K  │
│ │J. Doe │ │ │S. Smith│ │ │M. Lee │ │ │A. Jones│ │ │B. Davis│
│ │Day 3  │ │ │Day 12 │ │ │Day 18 │ │ │Day 25 │ │ │Funded │
│ └───────┘ │ └───────┘ │ └───────┘ │ └───────┘ │ └───────┘ │
│  [+ New]  │           │           │           │           │
└───────────┴───────────┴───────────┴───────────┴───────────┘
```

#### Loan Card Details
- Loan number
- Borrower name
- Loan amount
- Days in current stage
- Assigned LO/Processor
- Status indicators (pending docs, rate lock expiring, etc.)

#### Acceptance Criteria
- [ ] Drag-and-drop to move loans between stages
- [ ] Color coding by urgency (green/yellow/red)
- [ ] Click card to view full loan details
- [ ] Filter by LO, processor, loan type
- [ ] Export pipeline report

---

## Reporting & Analytics

### R-001: Lead Source Performance
**Metrics**:
- Leads generated by source
- Cost per lead (if known)
- Conversion rate by source
- Average loan amount by source
- ROI by source

**Visualization**: Horizontal bar chart with conversion funnel overlay

---

### R-002: Agent Performance Dashboard
**Metrics**:
- Leads assigned vs contacted
- Average response time
- Qualified lead rate
- Loans closed this month
- Commission earned
- NPS score from clients

**Visualization**: Scorecard with trend indicators

---

### R-003: Loan Pipeline Forecast
**Metrics**:
- Loans in each stage
- Estimated close dates
- Projected commission (best/likely/worst case)
- Average days to close by loan type

**Visualization**: Gantt chart + pipeline value chart

---

## Integration Requirements

### INT-001: LOS Integration (Encompass/Calyx)
**Bi-Directional Sync**:
- **CRM → LOS**: Push qualified leads as new loan applications
- **LOS → CRM**: Pull loan status updates, document checklists

**Sync Frequency**: Real-time via webhooks + hourly batch for resilience

---

### INT-002: Nyra AI Assistant
**Data Sharing**:
- **CRM → Nyra**: Lead profile, conversation history
- **Nyra → CRM**: Conversation transcripts, extracted data, lead score

**API Endpoints**:
- `POST /api/v1/crm/leads` - Create/update lead from Nyra
- `GET /api/v1/crm/leads/:id/context` - Get lead context for Nyra

---

### INT-003: Email/SMS Platforms
**SendGrid/Twilio Integration**:
- Track email opens/clicks
- Log SMS conversations
- Store unsubscribe preferences

---

## Security & Compliance

### Data Protection
- **Encryption**: AES-256 for PII at rest
- **Access Control**: Role-based permissions (Admin, LO, Processor, Read-Only)
- **Audit Logs**: Track all data access and modifications
- **Data Retention**: 7 years for closed loans (regulatory requirement)

### Compliance Features
- **TCPA Opt-Out**: One-click unsubscribe from all communications
- **GDPR/CCPA**: Data export and deletion requests
- **Adverse Action Tracking**: Log all loan denials with reasons

---

## Technical Stack

### Database
- **Primary**: PostgreSQL 14+ with TimescaleDB for time-series data
- **Cache**: Redis for session management and real-time updates
- **Search**: Elasticsearch for full-text search

### Backend
- **API**: Node.js + Express or Python + FastAPI
- **ORM**: Prisma (Node) or SQLAlchemy (Python)
- **Queue**: RabbitMQ for async jobs (email sending, LOS sync)

### Frontend
- **Framework**: React + TypeScript or Vue.js 3
- **UI Library**: Material-UI or Ant Design
- **State Management**: Redux Toolkit or Pinia
- **Real-Time**: Socket.io for live updates

---

## Related Documentation
- `LEAD_DRIP_CAMPAIGNS.md` - Automated nurturing workflows
- `NYRA_ASSISTANT_FEATURES.md` - AI integration
- `MORTGAGE_BROKER_WORKFLOWS.md` - Manual processes

---

*Document Version*: 1.0
*Last Updated*: 2025-12-31
