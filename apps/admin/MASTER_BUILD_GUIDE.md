# Nyra Admin Dashboard - Master Build Guide

> **Consolidated from archived content, UI examples, and project requirements**

## 🎯 **MISSION STATEMENT**

Build the primary operational interface for Project Nyra mortgage operations, integrating with TwentyCRM, Nexus Router, Quote Engine, and compliance systems.

**Port**: 3008 (to avoid conflicts with landing:3001, webapp:3000)
**Stack**: Next.js 15 + shadcn/ui + magicUI + TypeScript + Tailwind

---

## 📋 **COMPLETE FEATURE SPECIFICATION**

### **Core Pages & Routes**

#### 1. **Dashboard** (`/`)
- **Lead metrics overview**
  - Daily/weekly/monthly lead counts
  - Conversion funnel visualization
  - Pipeline value tracking
- **Campaign performance**
  - Active campaigns status
  - Response rates and ROI
- **Quote activity**
  - Recent quotes generated
  - Rate change alerts
- **System health**
  - Service status indicators
  - Error rate monitoring

#### 2. **Lead Management** (`/leads`)
- **Lead grid** with filtering and sorting
  - Source tracking (ratehunter, referral, etc.)
  - Lead scoring visualization
  - Contact attempts history
  - Status progression timeline
- **Lead detail view** with full contact history
- **Bulk actions** (assign, tag, export)
- **TwentyCRM sync** status and manual refresh

#### 3. **Quote Desk** (`/quotes`)
- **Rate matrix** with live updates
- **Quote builder** with loan scenarios
  - Conventional, FHA, VA, USDA options
  - HELOC and refinance calculators
  - Compliance disclosure generation
- **Quote history** and comparison tools
- **Rate lock tracking** and expiration alerts

#### 4. **Campaign Builder** (`/campaigns`)
- **Visual workflow editor** (connects to n8n)
- **Email/SMS template management**
- **Drip campaign sequencing**
- **A/B test setup** and results
- **Compliance review** before deployment

#### 5. **Embedded Chat** (`/chat`)
- **Dify iframe integration** for live chat
- **Chat history** and lead assignment
- **Conversation transcripts** with compliance tags
- **AI response suggestions** based on context

#### 6. **Audit & Compliance** (`/audit`)
- **Full audit trail** of all operations
- **TILA/RESPA compliance** tracking
- **Document delivery logs**
- **Consent management** and opt-out handling
- **Regulatory reporting** export tools

---

## 🏗️ **TECHNICAL ARCHITECTURE**

### **Package.json (Complete)**
```json
{
  "name": "nyra-admin",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "next dev -p 3008",
    "build": "next build",
    "start": "next start -p 3008",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "next": "15.5.10",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "@tanstack/react-query": "^5.17.0",
    "@tanstack/react-table": "^8.11.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "3.23.8",
    "clsx": "2.1.1",
    "tailwind-merge": "2.5.2",
    "lucide-react": "0.427.0",
    "date-fns": "^3.0.0",
    "recharts": "^2.10.0",
    "@radix-ui/react-toast": "^1.1.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "20.14.10",
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "typescript": "5.5.4",
    "tailwindcss": "3.4.7",
    "postcss": "8.4.40",
    "autoprefixer": "10.4.19",
    "@types/jest": "^29.5.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0"
  }
}
```

### **File Structure (Complete)**
```
apps/admin/
├── app/
│   ├── layout.tsx                 # Root layout with navigation
│   ├── page.tsx                   # Dashboard overview
│   ├── leads/
│   │   ├── page.tsx               # Lead grid view
│   │   ├── [id]/
│   │   │   └── page.tsx           # Lead detail view
│   │   └── components/
│   │       ├── LeadGrid.tsx       # Data table with filtering
│   │       ├── LeadFilters.tsx    # Search and filter controls
│   │       ├── LeadDetail.tsx     # Full lead information
│   │       └── LeadActions.tsx    # Bulk action toolbar
│   ├── quotes/
│   │   ├── page.tsx               # Quote desk main view
│   │   ├── builder/
│   │   │   └── page.tsx           # Quote builder form
│   │   └── components/
│   │       ├── RateMatrix.tsx     # Live rates display
│   │       ├── QuoteForm.tsx      # Loan scenario builder
│   │       ├── ComplianceCheck.tsx # TILA/RESPA validation
│   │       └── QuoteHistory.tsx   # Historical quotes
│   ├── campaigns/
│   │   ├── page.tsx               # Campaign list view
│   │   ├── builder/
│   │   │   └── page.tsx           # Visual workflow editor
│   │   ├── [id]/
│   │   │   └── page.tsx           # Campaign detail/edit
│   │   └── components/
│   │       ├── CampaignGrid.tsx   # Campaign list with metrics
│   │       ├── WorkflowEditor.tsx # n8n integration interface
│   │       ├── TemplateEditor.tsx # Email/SMS templates
│   │       └── ABTestSetup.tsx    # A/B testing configuration
│   ├── chat/
│   │   ├── page.tsx               # Embedded Dify interface
│   │   └── components/
│   │       ├── ChatEmbed.tsx      # Dify iframe wrapper
│   │       ├── ChatHistory.tsx    # Conversation archives
│   │       └── ChatActions.tsx    # Lead assignment tools
│   ├── audit/
│   │   ├── page.tsx               # Audit log viewer
│   │   └── components/
│   │       ├── AuditLog.tsx       # Searchable activity log
│   │       ├── ComplianceReport.tsx # Regulatory reports
│   │       └── ConsentTracker.tsx # Consent management
│   └── api/
│       ├── leads/                 # Lead API endpoints
│       ├── quotes/                # Quote API endpoints
│       ├── campaigns/             # Campaign API endpoints
│       └── auth/                  # Authentication endpoints
├── components/
│   ├── ui/                        # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── form.tsx
│   │   ├── dialog.tsx
│   │   ├── toast.tsx
│   │   └── data-table.tsx         # Reusable data table
│   ├── layout/
│   │   ├── Sidebar.tsx            # Main navigation sidebar
│   │   ├── Header.tsx             # Top navigation bar
│   │   ├── Breadcrumbs.tsx        # Navigation breadcrumbs
│   │   └── UserMenu.tsx           # User profile dropdown
│   ├── charts/
│   │   ├── MetricsCard.tsx        # KPI display cards
│   │   ├── LeadFunnel.tsx         # Conversion funnel chart
│   │   ├── CampaignROI.tsx        # ROI visualization
│   │   └── RateChart.tsx          # Rate history charts
│   └── magicui/                   # Enhanced UI components
│       ├── glow.tsx               # Glow effects
│       ├── animated-counter.tsx   # Number animations
│       └── gradient-border.tsx    # Gradient borders
├── lib/
│   ├── utils.ts                   # Utility functions
│   ├── api.ts                     # API client configuration
│   ├── validations.ts             # Zod schemas
│   ├── constants.ts               # App constants
│   └── types.ts                   # TypeScript definitions
├── hooks/
│   ├── useLeads.ts                # Lead data management
│   ├── useQuotes.ts               # Quote operations
│   ├── useCampaigns.ts            # Campaign management
│   └── useAuth.ts                 # Authentication state
├── styles/
│   └── globals.css                # Global styles + Tailwind
├── public/
│   ├── icons/                     # App-specific icons
│   └── images/                    # Static images
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── jest.config.js
└── README.md
```

---

## 🎨 **UI COMPONENT SPECIFICATIONS**

### **Sidebar Navigation** (Primary Interface)
```tsx
// Navigation structure from archived content
const navigationItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Quotes', href: '/quotes', icon: Calculator },
  { name: 'Campaigns', href: '/campaigns', icon: Mail },
  { name: 'Chat', href: '/chat', icon: MessageCircle },
  { name: 'Audit', href: '/audit', icon: Shield }
];
```

### **Lead Grid Component** (Core Interface)
```tsx
// Based on archived nyra-admin structure
interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: 'ratehunter' | 'referral' | 'direct';
  status: 'new' | 'contacted' | 'qualified' | 'application' | 'closed';
  score: number;
  loanAmount: number;
  createdAt: Date;
  lastContact?: Date;
  assignedTo?: string;
}
```

### **Quote Builder Interface** (Revenue Center)
```tsx
// Integration with Quote Engine via Nexus Router
interface QuoteRequest {
  loanAmount: number;
  purchasePrice: number;
  creditScore: number;
  debtToIncome: number;
  downPayment: number;
  loanType: 'conventional' | 'fha' | 'va' | 'usda';
  term: 15 | 30;
  propertyType: 'primary' | 'secondary' | 'investment';
  zipCode: string;
}
```

---

## 🔌 **API INTEGRATION SPECIFICATIONS**

### **Nexus Router Endpoints**
```typescript
// All API calls go through Nexus Router (Port 6000)
const API_BASE = process.env.NEXT_PUBLIC_NEXUS_URL || 'http://localhost:6000';

// Core endpoints from archived configurations
const endpoints = {
  // TwentyCRM Integration
  leads: {
    list: '/api/twenty/leads',
    create: '/api/twenty/leads',
    update: '/api/twenty/leads/{id}',
    delete: '/api/twenty/leads/{id}'
  },

  // Quote Engine Integration
  quotes: {
    generate: '/api/quote-engine/generate',
    rates: '/api/quote-engine/rates',
    scenarios: '/api/quote-engine/scenarios'
  },

  // Campaign Engine Integration (n8n)
  campaigns: {
    list: '/api/campaigns',
    create: '/api/campaigns',
    deploy: '/api/campaigns/{id}/deploy',
    metrics: '/api/campaigns/{id}/metrics'
  },

  // Compliance & Audit
  audit: {
    logs: '/api/audit/logs',
    compliance: '/api/audit/compliance',
    consent: '/api/audit/consent'
  }
};
```

### **Authentication Flow**
```typescript
// Based on archived auth patterns
interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'loan_officer' | 'processor';
  permissions: string[];
}

// JWT-based authentication with Nexus Router
const authFlow = {
  login: 'POST /api/auth/login',
  refresh: 'POST /api/auth/refresh',
  logout: 'POST /api/auth/logout',
  profile: 'GET /api/auth/profile'
};
```

---

## 📊 **DASHBOARD METRICS (From Archived Specs)**

### **KPI Cards**
1. **Today's Leads**: Count + % change
2. **Active Quotes**: Count + avg loan amount
3. **Pipeline Value**: Total $ + conversion %
4. **Campaign ROI**: Revenue per $ spent

### **Charts & Visualizations**
1. **Lead Funnel**: Source → Contact → Quote → App → Close
2. **Quote Activity**: Hourly quote generation trends
3. **Campaign Performance**: Email open/click rates
4. **Rate Trends**: 30-day rate movement charts

---

## 🔒 **COMPLIANCE REQUIREMENTS**

### **TILA/RESPA Integration**
- [ ] Automated disclosure generation
- [ ] 3-day waiting period enforcement
- [ ] Fee transparency tracking
- [ ] APR calculation verification

### **Consent Management**
- [ ] Opt-in/opt-out tracking
- [ ] TCPA compliance for SMS
- [ ] Do Not Call registry checks
- [ ] Consent timestamp logging

### **Audit Trail Requirements**
- [ ] All user actions logged
- [ ] Data access tracking
- [ ] Lead assignment history
- [ ] Quote modification trails

---

## 🚀 **IMPLEMENTATION PHASES**

### **Phase 1: Foundation (Week 1)**
- [ ] Next.js project setup with proper structure
- [ ] Authentication system with role-based access
- [ ] Sidebar navigation and basic layout
- [ ] Nexus Router integration and health checks

### **Phase 2: Core Features (Week 2)**
- [ ] Lead grid with TwentyCRM integration
- [ ] Basic quote desk with rate display
- [ ] Dashboard metrics and KPI cards
- [ ] Real-time data updates via React Query

### **Phase 3: Advanced Features (Week 3)**
- [ ] Quote builder with full loan scenarios
- [ ] Campaign builder with n8n integration
- [ ] Dify chat embedding and management
- [ ] Bulk actions and data export tools

### **Phase 4: Compliance & Polish (Week 4)**
- [ ] Full audit logging implementation
- [ ] TILA/RESPA compliance workflows
- [ ] Advanced filtering and search
- [ ] Performance optimization and testing

---

## 🧪 **TESTING STRATEGY**

### **Unit Tests**
- [ ] Component rendering tests
- [ ] API integration tests
- [ ] Form validation tests
- [ ] Utility function tests

### **Integration Tests**
- [ ] End-to-end lead management workflow
- [ ] Quote generation and compliance
- [ ] Campaign deployment process
- [ ] Authentication and authorization

### **Performance Tests**
- [ ] Large dataset rendering (1000+ leads)
- [ ] Real-time update performance
- [ ] API response time monitoring
- [ ] Memory leak detection

---

## 📚 **REFERENCE IMPLEMENTATIONS**

### **Archived Code Examples**
- **Lead Grid**: `_archived/.../nyra-admin/app/leads/page.tsx`
- **Dashboard Cards**: `_archived/.../nyra-admin/app/page.tsx`
- **UI Components**: `_archived/.../nyra-admin/components/ui/`
- **MagicUI Effects**: `_archived/.../nyra-admin/components/magicui/`

### **Configuration Files**
- **Nexus Config**: `_archived/.../nexus/nexus-complete.toml`
- **Docker Setup**: `_archived/.../docker/build/apps/nyra-admin/`
- **Grafana Dashboards**: `_archived/.../dashboards/`

---

## 🔧 **DEVELOPMENT COMMANDS**

```bash
# Setup
cd apps/admin
npm install

# Development
npm run dev              # Start dev server on port 3008
npm run build           # Production build
npm run lint            # ESLint checking
npm run type-check      # TypeScript validation
npm run test            # Unit tests
npm run test:watch      # Watch mode testing

# Docker (from archived configs)
docker build -f ../../infra/docker/apps/nyra-admin.Dockerfile .
docker run -p 3008:3008 nyra-admin
```

---

**Last Updated**: 2026-03-10
**Status**: Ready for implementation
**Dependencies**: Nexus Router, TwentyCRM, Quote Engine

This master build guide consolidates all archived content, code examples, and requirements into a single comprehensive reference for building the Nyra Admin Dashboard.
