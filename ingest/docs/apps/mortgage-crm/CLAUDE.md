# CLAUDE.md - Mortgage CRM

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**ABSOLUTE RULES**:
1. ALL operations MUST be concurrent/parallel in a single message
2. **NEVER save working files to the root folder**
3. ALWAYS organize files in appropriate subdirectories
4. **USE CLAUDE CODE'S TASK TOOL** for spawning agents concurrently

### ⚡ GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"

**MANDATORY PATTERNS:**
- **TodoWrite**: ALWAYS batch ALL todos in ONE call (5-10+ todos minimum)
- **Task tool**: ALWAYS spawn ALL agents in ONE message with full instructions
- **File operations**: ALWAYS batch ALL reads/writes/edits in ONE message
- **Bash commands**: ALWAYS batch ALL terminal operations in ONE message
- **Memory operations**: ALWAYS batch ALL memory store/retrieve in ONE message

---

## 🎯 PROJECT CONTEXT

### Application Overview
**Mortgage CRM** is a comprehensive customer relationship management system for mortgage lenders, featuring lead management, borrower tracking, loan pipeline visualization, and LOS integration.

**Primary Purpose:**
- Centralized lead and borrower management
- Loan pipeline tracking with Kanban views
- Automated task and follow-up management
- Integration with LOS systems (Encompass, Calyx Point)
- Team collaboration and assignment
- Reporting and analytics dashboards

**Target Users:**
- Loan officers (primary users)
- Loan processors (support staff)
- Sales managers (pipeline oversight)
- Compliance officers (audit access)
- Executive team (reporting)

### Technology Stack

**Frontend:**
- **React 18** (with TypeScript)
- **Vite** (build tool)
- **React Router v6** (routing)
- **TanStack Query** (server state)
- **Zustand** (client state)
- **Tailwind CSS** (styling)
- **Shadcn/ui** (components)
- **React DnD** (drag-and-drop Kanban)
- **Recharts** (data visualization)

**Backend:**
- **Node.js 20** (LTS)
- **Express** (REST API)
- **Prisma ORM** (database client)
- **PostgreSQL** (primary database)
- **Redis** (caching, sessions)
- **Bull** (job queues)

**Integrations:**
- **Encompass LOS** (Ellie Mae API)
- **Calyx Point LOS** (SOAP API)
- **Nyra Assistant API** (AI lead qualification)
- **RateHunter Landing** (lead source)
- **Twilio** (SMS communications)
- **SendGrid** (email communications)

**Infrastructure:**
- **Docker + Docker Compose** (containerization)
- **PostgreSQL** (shared database server)
- **Redis** (shared cache server)
- **Infisical** (secrets management)
- **Tailscale** (private networking)

**Monitoring:**
- **Winston** (structured logging)
- **LogTail** (log aggregation)
- **Prometheus** (metrics)
- **Grafana** (dashboards)
- **Sentry** (error tracking)

### Architecture Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                      Mortgage CRM                                │
│             (React + Node.js + PostgreSQL)                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
     ┌───────────────┼────────────────────────────────────┐
     │               │                                    │
┌────▼─────┐   ┌────▼─────┐   ┌─────▼─────┐      ┌─────▼─────┐
│  Lead    │   │ Borrower │   │   Loan    │      │   Task    │
│Management│   │Management│   │  Pipeline │      │Management │
└────┬─────┘   └────┬─────┘   └─────┬─────┘      └─────┬─────┘
     │               │               │                   │
     └───────────────┴───────────────┴───────────────────┘
                     │
     ┌───────────────┼────────────────────────────┐
     │               │                            │
┌────▼──────┐  ┌────▼──────┐              ┌─────▼──────┐
│PostgreSQL │  │   Redis   │              │    LOS     │
│ Database  │  │   Cache   │              │Integration │
└───────────┘  └───────────┘              │(Encompass) │
                                          └────────────┘
```

### Project Structure

```
apps/mortgage-crm/
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── leads/          # Lead management
│   │   │   │   ├── LeadList.tsx
│   │   │   │   ├── LeadDetails.tsx
│   │   │   │   ├── LeadForm.tsx
│   │   │   │   └── LeadFilters.tsx
│   │   │   ├── borrowers/      # Borrower management
│   │   │   │   ├── BorrowerList.tsx
│   │   │   │   ├── BorrowerProfile.tsx
│   │   │   │   └── BorrowerDocuments.tsx
│   │   │   ├── loans/          # Loan pipeline
│   │   │   │   ├── LoanKanban.tsx
│   │   │   │   ├── LoanCard.tsx
│   │   │   │   ├── LoanDetails.tsx
│   │   │   │   └── LoanTimeline.tsx
│   │   │   ├── tasks/          # Task management
│   │   │   │   ├── TaskList.tsx
│   │   │   │   ├── TaskCard.tsx
│   │   │   │   └── TaskForm.tsx
│   │   │   ├── dashboard/      # Dashboard views
│   │   │   │   ├── Overview.tsx
│   │   │   │   ├── PipelineMetrics.tsx
│   │   │   │   └── ActivityFeed.tsx
│   │   │   └── ui/             # UI primitives
│   │   ├── features/           # Feature modules
│   │   │   ├── auth/
│   │   │   ├── leads/
│   │   │   ├── borrowers/
│   │   │   ├── loans/
│   │   │   └── tasks/
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useLeads.ts
│   │   │   ├── useBorrowers.ts
│   │   │   ├── useLoans.ts
│   │   │   └── useTasks.ts
│   │   ├── lib/                # Utilities
│   │   │   ├── api.ts
│   │   │   └── utils.ts
│   │   ├── stores/             # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   ├── leadStore.ts
│   │   │   └── loanStore.ts
│   │   ├── types/              # TypeScript types
│   │   │   ├── lead.ts
│   │   │   ├── borrower.ts
│   │   │   ├── loan.ts
│   │   │   └── task.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── router.tsx
│   ├── public/
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                    # Node.js backend
│   ├── src/
│   │   ├── api/                # REST API routes
│   │   │   ├── leads.ts
│   │   │   ├── borrowers.ts
│   │   │   ├── loans.ts
│   │   │   ├── tasks.ts
│   │   │   └── users.ts
│   │   ├── services/           # Business logic
│   │   │   ├── lead-service.ts
│   │   │   ├── borrower-service.ts
│   │   │   ├── loan-service.ts
│   │   │   ├── task-service.ts
│   │   │   └── assignment-service.ts
│   │   ├── integrations/       # External integrations
│   │   │   ├── encompass-client.ts
│   │   │   ├── calyx-client.ts
│   │   │   ├── nyra-client.ts
│   │   │   ├── twilio-client.ts
│   │   │   └── sendgrid-client.ts
│   │   ├── jobs/               # Background jobs
│   │   │   ├── los-sync.ts
│   │   │   ├── task-reminders.ts
│   │   │   └── pipeline-updates.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── validation.ts
│   │   │   └── error-handler.ts
│   │   ├── lib/
│   │   │   ├── prisma.ts
│   │   │   ├── redis.ts
│   │   │   ├── logger.ts
│   │   │   └── queue.ts
│   │   ├── types/
│   │   ├── config/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── tests/
│   ├── tsconfig.json
│   └── package.json
│
├── docs/
│   ├── architecture.md
│   ├── los-integration.md
│   ├── api.md
│   └── deployment.md
│
├── scripts/
│   ├── build.sh
│   ├── deploy.sh
│   └── seed-db.sh
│
├── docker-compose.yml
├── Dockerfile.frontend
├── Dockerfile.backend
└── README.md
```

---

## 🔧 DEVELOPMENT PATTERNS

### Lead Management

**Lead List Component:**
```typescript
// frontend/src/components/leads/LeadList.tsx
import { useQuery } from '@tanstack/react-query';
import { LeadCard } from './LeadCard';
import { LeadFilters } from './LeadFilters';
import { useLeadStore } from '@/stores/leadStore';

export function LeadList() {
  const { filters } = useLeadStore();

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads', filters],
    queryFn: () => fetchLeads(filters),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <LeadFilters />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leads?.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}
```

**Lead API Service:**
```typescript
// backend/src/services/lead-service.ts
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { nyraClient } from '../integrations/nyra-client';

export class LeadService {
  async createLead(data: CreateLeadDto) {
    // Create lead in database
    const lead = await prisma.lead.create({
      data: {
        ...data,
        status: 'new',
        source: data.source || 'crm',
      },
    });

    // Trigger Nyra qualification
    await nyraClient.qualifyLead(lead.id);

    // Auto-assign to loan officer
    const assignment = await this.autoAssignLead(lead);

    // Cache lead
    await redis.setex(`lead:${lead.id}`, 3600, JSON.stringify(lead));

    return { ...lead, assignment };
  }

  async autoAssignLead(lead: Lead) {
    // Round-robin or rule-based assignment logic
    const loanOfficers = await prisma.user.findMany({
      where: {
        role: 'LOAN_OFFICER',
        isActive: true,
      },
      include: {
        _count: {
          select: { assignedLeads: true },
        },
      },
      orderBy: {
        assignedLeads: {
          _count: 'asc',
        },
      },
    });

    if (loanOfficers.length === 0) {
      throw new Error('No loan officers available');
    }

    // Assign to loan officer with least leads
    const assignedTo = loanOfficers[0];

    const assignment = await prisma.leadAssignment.create({
      data: {
        leadId: lead.id,
        userId: assignedTo.id,
        assignedAt: new Date(),
      },
    });

    return assignment;
  }

  async getLeads(filters: LeadFilters) {
    const cacheKey = `leads:${JSON.stringify(filters)}`;

    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // Query database
    const leads = await prisma.lead.findMany({
      where: {
        status: filters.status,
        source: filters.source,
        assignedTo: filters.assignedTo,
        createdAt: {
          gte: filters.dateFrom,
          lte: filters.dateTo,
        },
      },
      include: {
        borrower: true,
        assignment: {
          include: { user: true },
        },
        qualification: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Cache results
    await redis.setex(cacheKey, 300, JSON.stringify(leads));

    return leads;
  }
}
```

### Loan Pipeline Kanban

**Kanban Board Component:**
```typescript
// frontend/src/components/loans/LoanKanban.tsx
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoanCard } from './LoanCard';
import { KanbanColumn } from './KanbanColumn';

const PIPELINE_STAGES = [
  'Lead',
  'Application',
  'Processing',
  'Underwriting',
  'Clear to Close',
  'Funded',
] as const;

export function LoanKanban() {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);

  const { data: loans } = useQuery({
    queryKey: ['loans'],
    queryFn: fetchLoans,
  });

  const moveLoanMutation = useMutation({
    mutationFn: ({ loanId, newStage }: { loanId: string; newStage: string }) =>
      updateLoanStage(loanId, newStage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const loanId = active.id as string;
    const newStage = over.id as string;

    moveLoanMutation.mutate({ loanId, newStage });
    setActiveId(null);
  };

  const loansByStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = loans?.filter((loan) => loan.stage === stage) || [];
    return acc;
  }, {} as Record<string, Loan[]>);

  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={(e) => setActiveId(e.active.id as string)}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            id={stage}
            title={stage}
            loans={loansByStage[stage]}
          />
        ))}
      </div>

      <DragOverlay>
        {activeId ? (
          <LoanCard loan={loans?.find((l) => l.id === activeId)!} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
```

### LOS Integration (Encompass)

**Encompass API Client:**
```typescript
// backend/src/integrations/encompass-client.ts
import axios, { AxiosInstance } from 'axios';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

export class EncompassClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.ENCOMPASS_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async authenticate() {
    const response = await this.client.post('/oauth2/v1/token', {
      grant_type: 'password',
      username: process.env.ENCOMPASS_USERNAME,
      password: process.env.ENCOMPASS_PASSWORD,
      client_id: process.env.ENCOMPASS_CLIENT_ID,
      client_secret: process.env.ENCOMPASS_CLIENT_SECRET,
    });

    this.accessToken = response.data.access_token;
    this.client.defaults.headers['Authorization'] = `Bearer ${this.accessToken}`;
  }

  async createLoan(loanData: LoanData) {
    if (!this.accessToken) await this.authenticate();

    try {
      const response = await this.client.post('/encompass/v3/loans', {
        applications: [{
          borrower: {
            firstName: loanData.borrower.firstName,
            lastName: loanData.borrower.lastName,
            email: loanData.borrower.email,
            ssn: loanData.borrower.ssn,
          },
          employment: loanData.employment,
          property: {
            street: loanData.property.address,
            city: loanData.property.city,
            state: loanData.property.state,
            zip: loanData.property.zip,
          },
        }],
        loanAmount: loanData.loanAmount,
        propertyValue: loanData.propertyValue,
        loanPurpose: loanData.loanPurpose,
      });

      const encompassLoanId = response.data.id;

      // Store mapping in CRM
      await prisma.losIntegration.create({
        data: {
          loanId: loanData.id,
          losSystem: 'ENCOMPASS',
          losLoanId: encompassLoanId,
          syncedAt: new Date(),
        },
      });

      logger.info(`Loan ${loanData.id} created in Encompass as ${encompassLoanId}`);

      return encompassLoanId;

    } catch (error) {
      logger.error('Encompass loan creation failed:', error);
      throw error;
    }
  }

  async syncLoanStatus(loanId: string) {
    if (!this.accessToken) await this.authenticate();

    const integration = await prisma.losIntegration.findFirst({
      where: { loanId, losSystem: 'ENCOMPASS' },
    });

    if (!integration) {
      throw new Error('Loan not synced with Encompass');
    }

    const response = await this.client.get(`/encompass/v3/loans/${integration.losLoanId}`);
    const encompassLoan = response.data;

    // Update CRM loan status
    await prisma.loan.update({
      where: { id: loanId },
      data: {
        stage: this.mapEncompassMilestone(encompassLoan.milestone),
        status: encompassLoan.status,
        lastSyncedAt: new Date(),
      },
    });

    return encompassLoan;
  }

  private mapEncompassMilestone(milestone: string): string {
    const mapping: Record<string, string> = {
      'Started': 'Application',
      'Processing': 'Processing',
      'Submitted to Underwriting': 'Underwriting',
      'Approved': 'Clear to Close',
      'Docs Signed': 'Clear to Close',
      'Funded': 'Funded',
    };

    return mapping[milestone] || 'Application';
  }
}
```

**Background Job for LOS Sync:**
```typescript
// backend/src/jobs/los-sync.ts
import { Queue, Worker } from 'bullmq';
import { redis } from '../lib/redis';
import { EncompassClient } from '../integrations/encompass-client';
import { prisma } from '../lib/prisma';

const losSyncQueue = new Queue('los-sync', {
  connection: redis,
});

const worker = new Worker('los-sync', async (job) => {
  const { loanId } = job.data;

  const encompass = new EncompassClient();
  await encompass.syncLoanStatus(loanId);

}, {
  connection: redis,
});

export async function scheduleLosSync() {
  // Get all loans with LOS integration
  const loans = await prisma.loan.findMany({
    where: {
      losIntegration: {
        isNot: null,
      },
      status: {
        notIn: ['Funded', 'Denied', 'Withdrawn'],
      },
    },
  });

  // Schedule sync jobs
  for (const loan of loans) {
    await losSyncQueue.add('sync', { loanId: loan.id }, {
      delay: Math.random() * 60000, // Stagger syncs
    });
  }
}
```

### Automated Task Management

**Task Service:**
```typescript
// backend/src/services/task-service.ts
import { prisma } from '../lib/prisma';
import { sendgridClient } from '../integrations/sendgrid-client';
import { twilioClient } from '../integrations/twilio-client';

export class TaskService {
  async createTask(data: CreateTaskDto) {
    const task = await prisma.task.create({
      data: {
        ...data,
        status: 'pending',
        createdAt: new Date(),
      },
    });

    // Send notification to assignee
    await this.notifyAssignee(task);

    return task;
  }

  async autoGenerateTasks(loanId: string, stage: string) {
    // Auto-generate tasks based on loan stage
    const taskTemplates = await prisma.taskTemplate.findMany({
      where: { stage },
    });

    for (const template of taskTemplates) {
      await this.createTask({
        loanId,
        title: template.title,
        description: template.description,
        assignedTo: template.defaultAssignee,
        dueDate: this.calculateDueDate(template.dueDays),
      });
    }
  }

  private async notifyAssignee(task: Task) {
    const user = await prisma.user.findUnique({
      where: { id: task.assignedTo },
    });

    if (!user) return;

    // Send email notification
    await sendgridClient.send({
      to: user.email,
      subject: `New Task Assigned: ${task.title}`,
      text: `You have been assigned a new task: ${task.title}\n\nDue: ${task.dueDate}`,
    });

    // Send SMS if urgent
    if (task.priority === 'urgent') {
      await twilioClient.messages.create({
        to: user.phone,
        body: `Urgent task assigned: ${task.title}`,
      });
    }
  }

  private calculateDueDate(dueDays: number): Date {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueDays);
    return dueDate;
  }
}
```

---

## 🐝 SWARM ORCHESTRATION

### Agent Roles for Mortgage CRM

**1. Lead Management Agent**
- **Responsibilities**: CRUD operations, filtering, assignment
- **Tools**: Prisma, PostgreSQL

**2. Loan Pipeline Agent**
- **Responsibilities**: Stage tracking, milestone updates, task generation
- **Tools**: Prisma, Bull queues

**3. LOS Integration Agent**
- **Responsibilities**: Sync with Encompass/Calyx, bidirectional data flow
- **Tools**: Encompass API, Calyx API

**4. Task Automation Agent**
- **Responsibilities**: Auto-generate tasks, send reminders, track completion
- **Tools**: Bull queues, SendGrid, Twilio

**5. Reporting Agent**
- **Responsibilities**: Generate dashboards, export reports, analytics
- **Tools**: PostgreSQL aggregations, Chart.js

**6. Database Agent**
- **Responsibilities**: Data integrity, audit logging, backups
- **Tools**: Prisma, PostgreSQL

---

## 🧠 MEMORY MANAGEMENT

**Store Lead Assignment:**
```bash
npx archon-os@alpha memory store \
  --key "crm/leads/{leadId}/assignment" \
  --namespace "coordination" \
  --value '{
    "assignedTo": "user-123",
    "assignedBy": "auto-assignment",
    "assignedAt": "2025-01-01T00:00:00Z"
  }'
```

**Store Loan Stage:**
```bash
npx archon-os@alpha memory store \
  --key "crm/loans/{loanId}/stage" \
  --namespace "pipeline" \
  --value '{
    "currentStage": "Underwriting",
    "previousStage": "Processing",
    "changedAt": "2025-01-01T00:00:00Z"
  }'
```

---

## 🚀 DEPLOYMENT & CI/CD

**Docker Compose:**
```yaml
# apps/mortgage-crm/docker-compose.yml
version: '3.9'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3002:80"
    environment:
      - VITE_API_URL=http://backend:3003
    depends_on:
      - backend

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3003:3003"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/mortgage_crm
      - REDIS_URL=redis://redis:6379
      - ENCOMPASS_API_URL=${ENCOMPASS_API_URL}
      - ENCOMPASS_USERNAME=${ENCOMPASS_USERNAME}
      - ENCOMPASS_PASSWORD=${ENCOMPASS_PASSWORD}
    depends_on:
      - db
      - redis

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=mortgage_crm
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## 📊 MONITORING & ANALYTICS

**Pipeline Metrics Dashboard:**
```typescript
// frontend/src/components/dashboard/PipelineMetrics.tsx
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function PipelineMetrics() {
  const { data: metrics } = useQuery({
    queryKey: ['pipeline-metrics'],
    queryFn: fetchPipelineMetrics,
  });

  return (
    <div className="space-y-4">
      <h2>Pipeline Metrics</h2>
      <BarChart width={600} height={300} data={metrics}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="stage" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#8884d8" />
      </BarChart>
    </div>
  );
}
```

---

## 🔒 SECURITY & COMPLIANCE

**Role-Based Access Control:**
```typescript
// backend/src/middleware/rbac.ts
import { Request, Response, NextFunction } from 'express';

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Usage in routes
app.get('/api/admin/reports', authenticateJWT, requireRole(['ADMIN', 'MANAGER']), getReports);
```

---

## 🔗 DEPENDENCIES & INTEGRATIONS

**Integration with Nyra Assistant:**
```typescript
// backend/src/integrations/nyra-client.ts
export const nyraClient = {
  qualifyLead: async (leadId: string) => {
    const response = await fetch(`${process.env.NYRA_API_URL}/api/leads/qualify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NYRA_API_KEY}`,
      },
      body: JSON.stringify({ leadId }),
    });
    return response.json();
  },
};
```

---

**Remember**: Mortgage CRM is the operational backbone of Project-Nyra. Focus on data integrity, LOS integration reliability, and pipeline visibility. Always batch operations and maintain audit trails for compliance.
