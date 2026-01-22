# Mortgage Assistant - Loan Officer Dashboard

## 🎯 APPLICATION CONTEXT

**Purpose**: Next.js 14 loan officer workspace providing document management, client communication, loan tracking, and task automation for mortgage professionals.

**Port**: 3006
**Language**: TypeScript + React + Next.js 14
**UI Components**: Custom React components + Tailwind CSS
**Data Layer**: React Query + REST APIs

## 🚨 CRITICAL DEVELOPMENT RULES

### Parallel Component Development Pattern
**MANDATORY**: All features and pages MUST be developed in parallel:

```typescript
// ✅ CORRECT: Batch loan officer features in ONE message
[Single Message]:
  // Dashboard pages (Next.js App Router)
  - Write("app/page.tsx", dashboardHomepage)
  - Write("app/loans/page.tsx", loanListPage)
  - Write("app/loans/[id]/page.tsx", loanDetailPage)
  - Write("app/clients/page.tsx", clientListPage)
  - Write("app/documents/page.tsx", documentManagementPage)
  - Write("app/calendar/page.tsx", calendarPage)

  // Feature components
  - Write("components/features/loan-pipeline.tsx", pipelineComponent)
  - Write("components/features/document-uploader.tsx", uploaderComponent)
  - Write("components/features/task-manager.tsx", taskComponent)
  - Write("components/features/client-communication.tsx", communicationComponent)

  // API route handlers
  - Write("app/api/loans/route.ts", loansAPIRoute)
  - Write("app/api/documents/upload/route.ts", uploadAPIRoute)
  - Write("app/api/tasks/route.ts", tasksAPIRoute)

  // Utilities
  - Write("lib/loan-calculations.ts", loanUtils)
  - Write("lib/document-processing.ts", docUtils)

  // Tests
  - Write("__tests__/loan-pipeline.test.tsx", pipelineTests)
  - Write("__tests__/document-uploader.test.tsx", uploaderTests)

// ❌ WRONG: Sequential feature development
[Message 1]: Build loan list page
[Message 2]: Build loan detail page
[Message 3]: Build document manager
```

### Loan Officer Workflow First
**CRITICAL**: Design around actual loan officer workflows:

1. **Daily Dashboard**: Quick access to active loans, pending tasks, upcoming deadlines
2. **Loan Pipeline**: Visualize loans by stage (application, processing, underwriting, closing)
3. **Document Hub**: Organize required docs by loan type with completion tracking
4. **Client Communication**: Track all interactions (calls, emails, texts)
5. **Task Automation**: Auto-generate checklists based on loan type and stage

### Compliance & Security
**MANDATORY**: Every loan-related feature must include:

- **Data Encryption**: Encrypt PII at rest and in transit
- **Audit Trail**: Log all document access and changes
- **Role Permissions**: Restrict features by user role
- **Document Retention**: Comply with 3-year mortgage record keeping
- **E-Signature**: Support compliant electronic signatures

## 📊 MORTGAGE ASSISTANT ARCHITECTURE

### Page Structure (Next.js App Router)
```
app/
├── page.tsx                          # Dashboard home (metrics, recent activity)
├── loans/
│   ├── page.tsx                      # Loan list with filters
│   ├── [id]/
│   │   ├── page.tsx                  # Loan detail view
│   │   ├── documents/page.tsx        # Document management
│   │   ├── timeline/page.tsx         # Loan timeline/history
│   │   └── notes/page.tsx            # Internal notes
│   └── new/page.tsx                  # Create new loan application
├── clients/
│   ├── page.tsx                      # Client list
│   └── [id]/page.tsx                 # Client profile
├── documents/
│   └── page.tsx                      # Document library across all loans
├── calendar/
│   └── page.tsx                      # Calendar with deadlines and appointments
├── tasks/
│   └── page.tsx                      # Task manager
├── reports/
│   └── page.tsx                      # Loan officer reports
├── settings/
│   └── page.tsx                      # User settings
├── layout.tsx                        # Root layout (sidebar navigation)
└── api/
    ├── loans/route.ts                # Loan CRUD operations
    ├── documents/
    │   ├── upload/route.ts           # Document upload
    │   └── [id]/route.ts             # Document operations
    ├── tasks/route.ts                # Task management
    └── clients/route.ts              # Client operations
```

### Component Hierarchy
```
components/
├── ui/                               # Base UI components
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── dropdown.tsx
├── features/                         # Business logic components
│   ├── loan-pipeline.tsx             # Kanban-style loan pipeline
│   ├── document-uploader.tsx         # Drag-and-drop file uploader
│   ├── document-viewer.tsx           # PDF/image viewer
│   ├── task-manager.tsx              # Task list with deadlines
│   ├── client-communication.tsx      # Communication log
│   ├── loan-progress-bar.tsx         # Visual loan stage progress
│   ├── deadline-tracker.tsx          # Upcoming deadline alerts
│   └── quick-actions.tsx             # Common action shortcuts
├── layout/                           # Layout components
│   ├── sidebar.tsx                   # Main navigation sidebar
│   ├── header.tsx                    # Top header with user menu
│   └── notifications.tsx             # Real-time notifications
└── shared/                           # Shared components
    ├── data-table.tsx                # Sortable/filterable table
    ├── empty-state.tsx               # Empty state placeholders
    └── loading-skeleton.tsx          # Loading skeletons
```

## 🐝 MORTGAGE ASSISTANT SWARM

### Agent Configuration
```yaml
topology: hierarchical
maxAgents: 6
strategy: specialized
language: typescript
framework: nextjs

agents:
  loan_officer_specialist:
    role: Loan officer workflow expert
    focus: [loan-pipeline, document-management, client-tracking]
    responsibilities:
      - Design loan officer workflows
      - Implement pipeline visualization
      - Build document management features
      - Create task automation

  compliance_architect:
    role: Mortgage compliance expert
    focus: [audit-logging, data-security, regulatory-requirements]
    responsibilities:
      - Ensure TILA/RESPA compliance
      - Implement audit trails
      - Design secure document handling
      - Enforce retention policies

  document_specialist:
    role: Document processing expert
    focus: [file-upload, pdf-generation, document-classification]
    responsibilities:
      - Build document upload/download
      - Implement PDF generation
      - Create document templates
      - Auto-classify document types

  ui_designer:
    role: Dashboard UX designer
    focus: [responsive-design, accessibility, user-flows]
    responsibilities:
      - Design intuitive layouts
      - Implement responsive designs
      - Ensure accessibility (WCAG 2.1 AA)
      - Optimize user workflows

  api_integrator:
    role: Backend integration specialist
    focus: [rest-apis, data-fetching, error-handling]
    responsibilities:
      - Integrate with backend services
      - Implement React Query hooks
      - Handle API errors gracefully
      - Optimize data caching

  testing_specialist:
    role: Component and E2E testing
    focus: [unit-tests, integration-tests, e2e-tests]
    responsibilities:
      - Write component tests
      - Create E2E test scenarios
      - Test file upload flows
      - Validate compliance features
```

## 🔧 NEXT.JS 14 PATTERNS

### Server Component Example (Loan List)
```tsx
// app/loans/page.tsx - Server Component fetches data
import { Suspense } from 'react'
import { LoanList } from '@/components/features/loan-list'
import { LoanListSkeleton } from '@/components/features/loan-list-skeleton'

export const metadata = {
  title: 'My Loans | Mortgage Assistant',
  description: 'View and manage your active mortgage loans',
}

async function getLoans() {
  // Server-side data fetching
  const res = await fetch('http://quote-engine:8001/api/v1/loans', {
    cache: 'no-store', // Always fresh data for loan officer
    headers: {
      'Authorization': `Bearer ${process.env.API_TOKEN}`
    }
  })

  if (!res.ok) {
    throw new Error('Failed to fetch loans')
  }

  return res.json()
}

export default async function LoansPage() {
  const loans = await getLoans()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Loans</h1>
        <a
          href="/loans/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          New Application
        </a>
      </div>

      <Suspense fallback={<LoanListSkeleton />}>
        <LoanList loans={loans} />
      </Suspense>
    </div>
  )
}
```

### Client Component Example (Document Uploader)
```tsx
// components/features/document-uploader.tsx
'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const documentSchema = z.object({
  type: z.enum(['paystub', 'w2', 'tax-return', 'bank-statement', 'id', 'other']),
  file: z.instanceof(File),
  description: z.string().optional(),
})

interface DocumentUploaderProps {
  loanId: string
  onUploadComplete: (documentId: string) => void
}

export function DocumentUploader({ loanId, onUploadComplete }: DocumentUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('paystub')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)

    try {
      for (const file of acceptedFiles) {
        // Validate file
        const document = documentSchema.parse({
          type: selectedType,
          file,
        })

        // Upload to API
        const formData = new FormData()
        formData.append('file', document.file)
        formData.append('type', document.type)
        formData.append('loanId', loanId)

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const result = await response.json()
        onUploadComplete(result.documentId)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload document. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [loanId, selectedType, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Document Type Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Document Type
            </label>
            <select
              className="w-full px-3 py-2 border rounded"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="paystub">Paystub</option>
              <option value="w2">W-2 Form</option>
              <option value="tax-return">Tax Return</option>
              <option value="bank-statement">Bank Statement</option>
              <option value="id">ID Document</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            `}
          >
            <input {...getInputProps()} />
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {isDragActive ? (
                <p className="text-blue-600 font-medium">Drop files here...</p>
              ) : (
                <>
                  <p className="text-gray-700">
                    Drag and drop files here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Accepts PDF, JPG, PNG (max 10MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Upload Button */}
          <Button
            type="button"
            disabled={uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

## 📈 PERFORMANCE TARGETS

- **Page Load**: < 2s for dashboard
- **Document Upload**: Support up to 10MB files
- **Real-Time Updates**: WebSocket for loan status changes
- **Offline Support**: Service worker for basic functionality

## 🧪 TESTING REQUIREMENTS

### Critical Test Scenarios
- Loan creation and editing
- Document upload and download
- Task completion workflows
- Client communication logging
- Pipeline drag-and-drop
- Deadline notifications

### Test Coverage
- **Unit Tests**: 85%+ coverage for business logic
- **Integration Tests**: API route handlers
- **E2E Tests**: Complete loan workflow (create → document → close)
- **Accessibility Tests**: WCAG 2.1 AA compliance

## 🔒 SECURITY & COMPLIANCE

### Data Protection
- Encrypt all PII (SSN, income, assets)
- Secure document storage with access logging
- Role-based access control (admin, loan officer, processor)
- Session timeout after 30 minutes of inactivity

### Audit Requirements
- Log all document views, downloads, uploads
- Track loan status changes with timestamps
- Record user actions for compliance audits
- Retain logs for 3+ years (mortgage regulation)

## 📚 RELATED DOCUMENTATION

- **Root CLAUDE.md**: V3 orchestration patterns
- **apps/web/CLAUDE.md**: Web app ecosystem overview
- **services/quote-engine/**: Loan calculation backend
- **services/campaign-engine/**: Borrower communication

---

**Mortgage Assistant is the daily workspace for loan officers. Every feature must streamline their workflow, reduce manual tasks, and ensure regulatory compliance. Usability and reliability are paramount.**
