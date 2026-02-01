# CRM Dashboard - Claude Flow V3 Configuration

> **Lead management and customer relationship management system**
>
> **Inherits from**: `apps/web/CLAUDE.md`
> **Stack**: Next.js 15, React 19, TypeScript 5, Tailwind CSS 4, TanStack Query, Prisma
> **Port**: 3003
> **Type**: Full-Stack Admin Application (authenticated)
> **Users**: Loan officers, sales team, managers

---

## APPLICATION CONTEXT

### Purpose
The CRM Dashboard is the operational nerve center for mortgage loan officers and sales teams. It provides lead management, pipeline tracking, activity logging, and customer communication tools integrated with TwentyCRM backend.

### Key Features
- Lead intake and assignment
- Pipeline management (qualification → approval → closing)
- Activity tracking (calls, emails, meetings)
- Document management and e-signature
- Drip campaign management
- Real-time notifications
- Performance dashboards
- Rate quote generation
- Compliance tracking

### Architecture
```
Next.js App Router (SSR)
    ├── Dashboard (real-time metrics)
    ├── Leads (search, filter, assign)
    ├── Pipelines (kanban board)
    ├── Communications (emails, calls)
    ├── Documents (upload, e-sign)
    └── Settings (team, integrations)
         ↓
TwentyCRM API ← Lead source
Quote Engine ← Rate calculations
Campaign Engine ← Drip sequences
PostgreSQL ← Activity, documents, messages
```

---

## TECH STACK SPECIFICS

### Next.js 15 Architecture
- **App Router** with layout hierarchy
- **Server Components** for data fetching
- **Route Handlers** for API endpoints
- **Middleware** for authentication/authorization
- **ISR** for dashboard caching

### Database (Prisma + PostgreSQL)
```prisma
// prisma/schema.prisma
model Lead {
  id String @id @default(cuid())
  email String @unique
  phone String
  name String
  status LeadStatus
  assignedTo User?
  activities Activity[]
  documents Document[]
  createdAt DateTime @default(now())
}

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  PROPOSAL_SENT
  APPROVED
  CLOSED
  LOST
}

model Activity {
  id String @id @default(cuid())
  type ActivityType
  lead Lead
  createdBy User
  notes String
  timestamp DateTime @default(now())
}

enum ActivityType {
  CALL
  EMAIL
  MEETING
  NOTE
  DOCUMENT_SENT
  RATE_OFFERED
}
```

### Real-Time Features
- **Socket.io**: Live notifications, lead updates
- **Webhooks**: TwentyCRM events
- **Server-Sent Events**: Fallback for notifications

### State Management (Zustand + React Query)
```typescript
// Global state for current lead
import { create } from 'zustand';

interface CRMStore {
  currentLead: Lead | null;
  setCurrentLead: (lead: Lead) => void;
  selectedPipeline: string | null;
  setSelectedPipeline: (id: string) => void;
}

export const useCRMStore = create<CRMStore>((set) => ({
  currentLead: null,
  setCurrentLead: (lead) => set({ currentLead: lead }),
  selectedPipeline: null,
  setSelectedPipeline: (id) => set({ selectedPipeline: id }),
}));
```

---

## ROUTE STRUCTURE

### Authenticated Routes
```
/dashboard - Overview (metrics, today's calls, upcoming tasks)
/leads - Lead list with advanced filters
/leads/new - Create new lead
/leads/[id] - Specific lead detail view
/leads/[id]/activities - Activity timeline
/leads/[id]/documents - Document management
/leads/[id]/communication - Messages and calls
/pipelines - Kanban board (drag-drop)
/pipelines/[id] - Pipeline details
/tasks - Task management and calendar
/documents - Document center with e-signature
/rates - Quote generation tool
/campaigns - Drip campaign management
/team - Team management and roles
/settings - App settings and integrations
/reports - Analytics and performance dashboards
```

### Admin-Only Routes
```
/admin/users - User management
/admin/roles - Role management
/admin/audit - Audit logs
/admin/compliance - Compliance tracking
```

---

## COMPONENT ARCHITECTURE

### Feature-Based Organization
```
components/
├── shared/
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── BreadcrumbNav.tsx
│   └── ErrorBoundary.tsx
├── leads/
│   ├── LeadList.tsx
│   ├── LeadCard.tsx
│   ├── LeadFilters.tsx
│   ├── LeadForm.tsx
│   ├── LeadDetail.tsx
│   └── ActivityTimeline.tsx
├── pipeline/
│   ├── PipelineBoard.tsx
│   ├── PipelineCard.tsx
│   ├── StageColumn.tsx
│   └── DragDropContext.tsx
├── communication/
│   ├── EmailComposer.tsx
│   ├── CallLogger.tsx
│   ├── MessageThread.tsx
│   └── NotificationBell.tsx
├── documents/
│   ├── DocumentUpload.tsx
│   ├── DocumentViewer.tsx
│   ├── DocumentSignature.tsx
│   └── DocumentList.tsx
└── dashboard/
    ├── MetricsCard.tsx
    ├── PerformanceChart.tsx
    ├── RecentActivity.tsx
    └── UpcomingTasks.tsx
```

### Kanban Pipeline View
```typescript
// components/pipeline/PipelineBoard.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { DndContext, closestCorners } from '@dnd-kit/core';
import { StageColumn } from './StageColumn';

export function PipelineBoard() {
  const { data: leads } = useQuery({
    queryKey: ['leads', 'pipeline'],
    queryFn: async () => {
      const response = await fetch('/api/leads?view=pipeline');
      return response.json();
    },
  });

  const stages = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'APPROVED', 'CLOSED'];

  return (
    <DndContext collisionDetection={closestCorners}>
      <div className="flex gap-4 overflow-x-auto">
        {stages.map((stage) => (
          <StageColumn
            key={stage}
            stage={stage}
            leads={leads?.filter((l) => l.status === stage) || []}
          />
        ))}
      </div>
    </DndContext>
  );
}
```

---

## DATA FETCHING PATTERNS

### Server-Side Lead Fetching
```typescript
// app/leads/page.tsx
async function LeadsPage(props: { searchParams: SearchParams }) {
  const session = await auth();
  const filters = parseSearchParams(props.searchParams);

  // Fetch from database with filters
  const leads = await db.lead.findMany({
    where: {
      assignedTo: { id: session.user.id },
      status: filters.status,
      email: { contains: filters.search },
    },
    include: {
      activities: { take: 3, orderBy: { timestamp: 'desc' } },
      documents: { take: 2 },
    },
    take: 50,
  });

  return <LeadList initialLeads={leads} />;
}
```

### Client-Side Real-Time Updates
```typescript
// hooks/useLeadUpdates.ts
export function useLeadUpdates(leadId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL);

    socket.on(`lead:${leadId}:updated`, (updatedLead) => {
      queryClient.setQueryData(['lead', leadId], updatedLead);
    });

    return () => socket.disconnect();
  }, [leadId, queryClient]);
}
```

### Mutation with Optimistic Updates
```typescript
// hooks/useUpdateLead.ts
export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Lead) => updateLeadAPI(data),
    onMutate: async (newLead) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['lead', newLead.id] });

      // Snapshot old data
      const previousLead = queryClient.getQueryData(['lead', newLead.id]);

      // Optimistically update UI
      queryClient.setQueryData(['lead', newLead.id], newLead);

      return { previousLead };
    },
    onError: (err, newLead, context) => {
      queryClient.setQueryData(['lead', newLead.id], context?.previousLead);
    },
  });
}
```

---

## API ROUTES (Server-Side)

### Lead CRUD Endpoints
```typescript
// app/api/leads/route.ts
export async function GET(request: Request) {
  const session = await auth();
  const { searchParams } = new URL(request.url);

  const leads = await db.lead.findMany({
    where: { assignedTo: { id: session.user.id } },
    include: { activities: true },
  });

  return Response.json(leads);
}

export async function POST(request: Request) {
  const session = await auth();
  const body = await request.json();

  const lead = await db.lead.create({
    data: {
      ...body,
      assignedTo: { connect: { id: session.user.id } },
    },
  });

  // Trigger compliance check
  await triggerComplianceValidation(lead);

  return Response.json(lead, { status: 201 });
}

// app/api/leads/[id]/route.ts
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();

  const lead = await db.lead.update({
    where: { id: params.id },
    data: body,
  });

  // Broadcast update to connected clients
  io.emit(`lead:${lead.id}:updated`, lead);

  return Response.json(lead);
}
```

### Activity Logging
```typescript
// app/api/activities/route.ts
export async function POST(request: Request) {
  const session = await auth();
  const { leadId, type, notes } = await request.json();

  const activity = await db.activity.create({
    data: {
      type,
      notes,
      lead: { connect: { id: leadId } },
      createdBy: { connect: { id: session.user.id } },
    },
  });

  return Response.json(activity);
}
```

---

## TESTING STRATEGY (TDD)

### Unit Tests
```typescript
// __tests__/utils/leadScoring.test.ts
import { calculateLeadScore } from '@/lib/leadScoring';

describe('calculateLeadScore', () => {
  it('calculates score based on income and credit', () => {
    const score = calculateLeadScore({
      income: 100000,
      creditScore: 750,
      loanAmount: 300000,
    });

    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
```

### Integration Tests
```typescript
// __tests__/integration/lead-flow.test.ts
describe('Lead Management Flow', () => {
  it('creates lead and logs activity', async () => {
    // Create lead
    const lead = await createLead({
      email: 'test@example.com',
      name: 'Test User',
    });

    // Log activity
    const activity = await logActivity({
      leadId: lead.id,
      type: 'CALL',
      notes: 'Initial contact',
    });

    expect(activity.leadId).toBe(lead.id);
  });
});
```

### E2E Tests
```typescript
// e2e/crm-flow.spec.ts
test('Create lead and move through pipeline', async ({ page }) => {
  await page.goto('http://localhost:3003/dashboard');

  // Create new lead
  await page.click('button:has-text("New Lead")');
  await page.fill('input[name="email"]', 'lead@example.com');
  await page.click('button:has-text("Create")');

  // Move to qualified
  await page.dragAndDrop('[data-lead-id]', '[data-stage="QUALIFIED"]');

  // Verify update
  await expect(page.locator('text=Lead qualified')).toBeVisible();
});
```

---

## COMPLIANCE & AUDIT

### Audit Trail
```typescript
// lib/audit.ts
export async function logAudit(action: AuditAction) {
  await db.auditLog.create({
    data: {
      action: action.type,
      userId: action.userId,
      leadId: action.leadId,
      changes: action.changes,
      timestamp: new Date(),
      ipAddress: action.ipAddress,
    },
  });
}
```

### Compliance Checks
```typescript
// app/api/leads/[id]/validate-compliance/route.ts
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const lead = await db.lead.findUnique({ where: { id: params.id } });

  // TILA/RESPA disclosure validation
  const validation = await validateTILACompliance(lead);

  // Anti-steering check
  const antiSteering = await checkAntiSteeringPolicy(lead);

  // Fair lending check
  const fairLending = await validateFairLending(lead);

  return Response.json({
    compliant: validation.ok && antiSteering.ok && fairLending.ok,
    issues: [...validation.issues, ...antiSteering.issues, ...fairLending.issues],
  });
}
```

---

## DEPLOYMENT

### Environment Variables
```bash
# Development
DATABASE_URL=postgresql://crm_dev:pass@localhost:5432/nyra_crm
NEXTAUTH_URL=http://localhost:3003
NEXTAUTH_SECRET=dev-secret
TWENTYCRM_API_URL=http://localhost:3000
TWENTYCRM_API_KEY=dev-key
REDIS_URL=redis://localhost:6379

# Production
DATABASE_URL=postgresql://crm_prod@prod.db:5432/nyra_crm
NEXTAUTH_URL=https://crm.nyra.com
TWENTYCRM_API_URL=https://twentycrm.nyra.com
```

### Docker
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next .next
COPY --from=builder /app/node_modules node_modules
COPY package.json ./
EXPOSE 3003
CMD ["npm", "start"]
```

---

## DEVELOPMENT COMMANDS

```bash
# Development
pnpm dev

# Build
pnpm build

# Production start
pnpm start

# Database
pnpm db:migrate
pnpm db:seed
pnpm db:reset

# Testing
pnpm test
pnpm test:watch
pnpm test:coverage

# E2E tests
pnpm e2e
pnpm e2e:debug

# Linting
pnpm lint
pnpm format
```

---

## INTEGRATION POINTS

- **TwentyCRM**: Lead source and CRM backend
- **Quote Engine**: Rate calculations for quotes
- **Campaign Engine**: Drip campaign workflows
- **PostgreSQL**: Lead data, activities, documents
- **Redis**: Session cache, real-time notifications

---

## RELATED DOCUMENTATION

- **Parent CLAUDE.md**: `apps/web/CLAUDE.md`
- **Apps CLAUDE.md**: `apps/CLAUDE.md`
- **Root CLAUDE.md**: `/CLAUDE.md`

---

**Profile**: crm-dashboard
**Generated**: 2026-01-26
**Target Users**: Loan officers, sales teams, managers
**Port**: 3003
