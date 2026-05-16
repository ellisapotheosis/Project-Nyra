# Nyra Web Application - Master Build Guide

> **Borrower-facing mortgage application platform**
> **Consolidated from archived ratehunter and mortgage-ui content**

## 🎯 **MISSION STATEMENT**

Build the primary borrower-facing application for mortgage applications, document management, real-time quotes, and loan processing workflows with full compliance integration.

**Port**: 3000 (main borrower interface)
**Stack**: Next.js 15 + React 19 + shadcn/ui + TypeScript + Tailwind
**Target Users**: Mortgage borrowers, applicants, existing customers

---

## 📋 **COMPLETE FEATURE SPECIFICATION**

### **Core Application Flow**

#### 1. **Application Portal** (`/apply`)
- **Loan application wizard** with progressive disclosure
- **1003 form integration** with auto-save and validation
- **Real-time eligibility** checking and pre-qualification
- **Loan program selection** (Conventional, FHA, VA, USDA)
- **Rate lock interface** with expiration countdown
- **Application status tracking** with visual timeline

#### 2. **Document Center** (`/documents`)
- **Document upload interface** with drag-and-drop
- **OCR processing** for automatic data extraction
- **Document verification** status and requirements
- **Secure document viewing** with watermarking
- **E-signature integration** for disclosures and forms
- **Compliance document** delivery and acknowledgment

#### 3. **Quote Center** (`/quotes`)
- **Interactive rate calculator** with loan scenarios
- **Real-time rate updates** via WebSocket
- **Loan comparison tools** with side-by-side analysis
- **Payment calculator** with taxes, insurance, PMI
- **Rate history charts** and trend analysis
- **Quote sharing** via email and PDF export

#### 4. **Dashboard** (`/dashboard`)
- **Application progress** overview with next steps
- **Document checklist** with completion status
- **Communication history** with loan team
- **Important dates** and deadline tracking
- **Rate alert notifications** and market updates
- **Loan timeline** with milestone tracking

#### 5. **Communication Hub** (`/messages`)
- **Secure messaging** with loan officers
- **Video call scheduling** and integration
- **Document sharing** within conversations
- **Automated notifications** and reminders
- **FAQ chatbot** with mortgage-specific knowledge
- **Escalation workflows** for urgent requests

#### 6. **Account Management** (`/account`)
- **Personal information** management
- **Contact preferences** and communication settings
- **Document access history** and audit trail
- **Privacy settings** and consent management
- **Account security** with 2FA options
- **Data export** and deletion requests (CCPA)

---

## 🏗️ **TECHNICAL ARCHITECTURE**

### **Package.json (From Archived Structures)**
```json
{
  "name": "nyra-webapp",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "15.5.10",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "@tanstack/react-query": "^5.17.0",
    "@tanstack/react-table": "^8.11.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "react-dropzone": "^14.2.0",
    "react-pdf": "^7.6.0",
    "socket.io-client": "^4.7.0",
    "zod": "3.23.8",
    "clsx": "2.1.1",
    "tailwind-merge": "2.5.2",
    "lucide-react": "0.427.0",
    "date-fns": "^3.0.0",
    "recharts": "^2.10.0",
    "framer-motion": "^11.0.0",
    "@radix-ui/react-progress": "^1.0.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "react-signature-canvas": "^1.0.0",
    "html2canvas": "^1.4.0",
    "jspdf": "^2.5.0"
  },
  "devDependencies": {
    "@types/node": "20.14.10",
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "typescript": "5.5.4",
    "tailwindcss": "3.4.7",
    "postcss": "8.4.40",
    "autoprefixer": "10.4.19",
    "@playwright/test": "^1.40.0",
    "jest": "^29.7.0"
  }
}
```

### **File Structure (Complete)**
```
apps/webapp/
├── app/
│   ├── layout.tsx                 # Root layout with auth
│   ├── page.tsx                   # Public homepage
│   ├── auth/
│   │   ├── login/page.tsx         # Borrower authentication
│   │   ├── register/page.tsx      # Account creation
│   │   └── verify/page.tsx        # Email/phone verification
│   ├── dashboard/
│   │   ├── page.tsx               # Borrower dashboard
│   │   └── components/
│   │       ├── ProgressTracker.tsx # Application progress
│   │       ├── DeadlineAlerts.tsx  # Important dates
│   │       ├── QuickActions.tsx    # Common tasks
│   │       └── RecentActivity.tsx  # Activity timeline
│   ├── apply/
│   │   ├── page.tsx               # Application wizard start
│   │   ├── personal/page.tsx      # Personal information
│   │   ├── employment/page.tsx    # Employment details
│   │   ├── assets/page.tsx        # Assets and income
│   │   ├── property/page.tsx      # Property information
│   │   ├── review/page.tsx        # Application review
│   │   └── components/
│   │       ├── ApplicationWizard.tsx # Multi-step form
│   │       ├── FormSection.tsx     # Reusable form sections
│   │       ├── ProgressBar.tsx     # Wizard progress
│   │       ├── AutoSave.tsx        # Auto-save functionality
│   │       └── ValidationSummary.tsx # Error display
│   ├── documents/
│   │   ├── page.tsx               # Document center main
│   │   ├── upload/page.tsx        # Document upload interface
│   │   ├── [docId]/page.tsx       # Document viewer
│   │   └── components/
│   │       ├── DocumentGrid.tsx    # Document list/grid
│   │       ├── UploadZone.tsx      # Drag-and-drop upload
│   │       ├── DocumentViewer.tsx  # PDF/image viewer
│   │       ├── OCRProcessor.tsx    # Auto data extraction
│   │       ├── ESignature.tsx      # Electronic signatures
│   │       └── ComplianceCheck.tsx # Document validation
│   ├── quotes/
│   │   ├── page.tsx               # Quote center main
│   │   ├── calculator/page.tsx    # Interactive calculator
│   │   ├── comparison/page.tsx    # Loan comparison tool
│   │   └── components/
│   │       ├── RateCalculator.tsx  # Loan calculator
│   │       ├── RateChart.tsx       # Rate history visualization
│   │       ├── LoanComparison.tsx  # Side-by-side comparison
│   │       ├── PaymentBreakdown.tsx # Payment details
│   │       ├── RateLock.tsx        # Rate locking interface
│   │       └── QuoteExport.tsx     # PDF quote generation
│   ├── messages/
│   │   ├── page.tsx               # Message center
│   │   ├── [conversationId]/page.tsx # Conversation view
│   │   └── components/
│   │       ├── MessageList.tsx     # Conversation list
│   │       ├── ChatInterface.tsx   # Real-time chat
│   │       ├── VideoCall.tsx       # Video integration
│   │       ├── FileSharing.tsx     # Document sharing
│   │       └── ChatBot.tsx         # AI assistant
│   ├── account/
│   │   ├── page.tsx               # Account overview
│   │   ├── profile/page.tsx       # Personal information
│   │   ├── security/page.tsx      # Security settings
│   │   ├── privacy/page.tsx       # Privacy preferences
│   │   └── components/
│   │       ├── ProfileForm.tsx     # Profile editing
│   │       ├── SecuritySettings.tsx # 2FA and passwords
│   │       ├── ConsentManager.tsx  # Privacy controls
│   │       └── DataExport.tsx      # CCPA compliance
│   └── api/
│       ├── auth/                  # Authentication endpoints
│       ├── application/           # Application APIs
│       ├── documents/             # Document management
│       ├── quotes/                # Quote generation
│       ├── messages/              # Communication APIs
│       └── account/               # Account management
├── components/
│   ├── ui/                        # shadcn/ui base components
│   ├── forms/
│   │   ├── FormField.tsx          # Reusable form fields
│   │   ├── AddressInput.tsx       # Address autocomplete
│   │   ├── PhoneInput.tsx         # Phone number formatting
│   │   ├── SSNInput.tsx           # Secure SSN input
│   │   ├── IncomeInput.tsx        # Income formatting
│   │   └── DatePicker.tsx         # Date selection
│   ├── layout/
│   │   ├── Header.tsx             # Main navigation
│   │   ├── Footer.tsx             # Footer with links
│   │   ├── Sidebar.tsx            # Mobile navigation
│   │   └── BreadcrumbNav.tsx      # Navigation breadcrumbs
│   ├── mortgage/
│   │   ├── LoanProductCard.tsx    # Loan product display
│   │   ├── ComplianceDisclosure.tsx # Legal disclosures
│   │   ├── RateDisplay.tsx        # Rate formatting
│   │   ├── PaymentCalculator.tsx  # Payment computation
│   │   └── ProgressTimeline.tsx   # Process visualization
│   └── security/
│       ├── PrivateRoute.tsx       # Auth protection
│       ├── TwoFactorAuth.tsx      # 2FA implementation
│       ├── SecureUpload.tsx       # Encrypted file upload
│       └── DataEncryption.tsx     # Client-side encryption
├── lib/
│   ├── api/
│   │   ├── client.ts              # API client configuration
│   │   ├── auth.ts                # Authentication helpers
│   │   ├── quotes.ts              # Quote API integration
│   │   └── documents.ts           # Document management
│   ├── validations/
│   │   ├── application.ts         # 1003 form validation
│   │   ├── documents.ts           # Document validation
│   │   ├── personal.ts            # Personal info validation
│   │   └── financial.ts           # Financial data validation
│   ├── utils/
│   │   ├── formatting.ts          # Data formatting utilities
│   │   ├── calculations.ts        # Mortgage calculations
│   │   ├── encryption.ts          # Data encryption
│   │   └── compliance.ts          # Compliance checking
│   └── types/
│       ├── application.ts         # Application data types
│       ├── documents.ts           # Document types
│       ├── quotes.ts              # Quote and rate types
│       └── user.ts                # User account types
├── hooks/
│   ├── useApplication.ts          # Application state management
│   ├── useQuotes.ts              # Real-time quote updates
│   ├── useDocuments.ts           # Document management
│   ├── useMessages.ts            # Communication hooks
│   └── useAuth.ts                # Authentication state
├── styles/
│   └── globals.css               # Global styles + Tailwind
├── public/
│   ├── icons/                    # Mortgage-specific icons
│   ├── documents/                # Document templates
│   └── compliance/               # Legal document templates
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── playwright.config.ts
└── README.md
```

---

## 🏠 **MORTGAGE-SPECIFIC FEATURES**

### **1003 Form Integration (Core Application)**
```typescript
// Based on archived mortgage-ui content
interface UniformApplication {
  // Section I: Type of Mortgage and Terms
  mortgageType: 'purchase' | 'refinance' | 'construction' | 'other';
  amortizationType: 'fixed' | 'arm' | 'other';
  loanAmount: number;
  interestRate: number;
  numberOfMonths: number;

  // Section II: Property Information
  propertyAddress: Address;
  legalDescription: string;
  purposeOfLoan: 'purchase' | 'refinance' | 'construction' | 'other';
  propertyType: 'primary' | 'secondary' | 'investment';
  propertyValue: number;

  // Section III: Borrower Information
  borrower: BorrowerInfo;
  coBorrower?: BorrowerInfo;

  // Section IV: Employment Information
  employment: EmploymentInfo[];

  // Section V: Monthly Income and Combined Housing Expense
  income: IncomeInfo;
  housingExpense: HousingExpenseInfo;

  // Section VI: Assets and Liabilities
  assets: AssetInfo[];
  liabilities: LiabilityInfo[];

  // Section VIII: Declarations
  declarations: DeclarationInfo;
}
```

### **Real-Time Quote Engine Integration**
```typescript
// WebSocket connection for live rate updates
interface RateUpdate {
  loanType: 'conventional' | 'fha' | 'va' | 'usda';
  term: 15 | 30;
  rate: number;
  apr: number;
  points: number;
  fees: number;
  timestamp: Date;
  rateLockExpiration?: Date;
}

interface QuoteRequest {
  loanAmount: number;
  purchasePrice: number;
  downPayment: number;
  creditScore: number;
  debtToIncomeRatio: number;
  propertyType: string;
  occupancy: string;
  loanPurpose: string;
  zipCode: string;
}
```

### **Document Requirements Engine**
```typescript
// Automated document requirement generation
interface DocumentRequirement {
  id: string;
  category: 'income' | 'assets' | 'property' | 'insurance' | 'other';
  name: string;
  description: string;
  required: boolean;
  status: 'pending' | 'uploaded' | 'reviewed' | 'approved' | 'rejected';
  dueDate?: Date;
  conditions: string[];
  alternatives: string[];
}

const documentMatrix = {
  // Income verification
  income: ['paystubs', 'w2', 'tax_returns', 'employment_letter'],

  // Asset verification
  assets: ['bank_statements', 'investment_statements', 'retirement_accounts'],

  // Property documentation
  property: ['purchase_contract', 'appraisal', 'homeowners_insurance', 'title_work'],

  // Government loan specific
  fha: ['fha_case_number', 'upfront_mip_receipt'],
  va: ['coe', 'va_appraisal'],
  usda: ['usda_eligibility', 'income_certification']
};
```

---

## 🔒 **COMPLIANCE & SECURITY**

### **TILA/RESPA Implementation**
```typescript
// Compliance disclosure management
interface ComplianceDisclosure {
  type: 'loan_estimate' | 'closing_disclosure' | 'privacy_notice' | 'ecoa_notice';
  version: string;
  deliveryMethod: 'email' | 'mail' | 'pickup';
  deliveredAt?: Date;
  acknowledgedAt?: Date;
  requiredBy: Date;
  status: 'pending' | 'delivered' | 'acknowledged' | 'expired';
}

const complianceRules = {
  loanEstimate: {
    deliveryDeadline: 3, // business days after application
    revisionTriggers: ['loan_amount', 'product_change', 'apr_change'],
    acknowledgmentRequired: false
  },

  closingDisclosure: {
    deliveryDeadline: 3, // business days before closing
    waitingPeriod: 3, // days after delivery before closing
    revisionRules: ['apr_tolerance', 'finance_charge_tolerance'],
    acknowledgmentRequired: true
  }
};
```

### **Data Security & Privacy**
```typescript
// Client-side encryption for sensitive data
interface EncryptedField {
  value: string; // Encrypted value
  algorithm: 'AES-256-GCM';
  iv: string;
  tag: string;
}

const sensitiveFields = [
  'ssn',
  'account_numbers',
  'routing_numbers',
  'employment_income',
  'asset_values'
];

// CCPA compliance
interface PrivacyRequest {
  type: 'access' | 'deletion' | 'portability' | 'opt_out';
  requestedBy: string;
  requestedAt: Date;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  fulfillmentDeadline: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'denied';
}
```

---

## 💾 **DATA PERSISTENCE & STATE**

### **Application Auto-Save**
```typescript
// Progressive auto-save functionality
interface ApplicationDraft {
  id: string;
  userId: string;
  sectionId: string;
  data: Partial<UniformApplication>;
  lastSaved: Date;
  version: number;
  validationErrors?: ValidationError[];
}

const autoSaveConfig = {
  interval: 30000, // 30 seconds
  triggerOnChange: true,
  versioning: true,
  compression: true,
  encryption: true
};
```

### **Document Metadata Management**
```typescript
interface DocumentMetadata {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  checksum: string;
  category: DocumentCategory;
  uploadedAt: Date;
  uploadedBy: string;
  ocrText?: string;
  extractedData?: Record<string, any>;
  complianceFlags: string[];
  retention: {
    required: boolean;
    period: number; // years
    reason: string;
  };
}
```

---

## 📱 **RESPONSIVE DESIGN**

### **Mobile-First Application Flow**
```typescript
// Progressive enhancement for mobile borrowers
const responsiveFeatures = {
  mobile: {
    // Core features optimized for mobile
    features: ['apply', 'documents', 'messages', 'quotes'],
    layout: 'single-column',
    navigation: 'bottom-tabs',
    gestures: ['swipe', 'pull-to-refresh', 'pinch-to-zoom']
  },

  tablet: {
    // Enhanced features for tablet
    features: ['all-mobile', 'dashboard', 'comparison'],
    layout: 'adaptive-grid',
    navigation: 'side-drawer',
    multitasking: true
  },

  desktop: {
    // Full feature set for desktop
    features: ['all'],
    layout: 'multi-column',
    navigation: 'top-nav + sidebar',
    shortcuts: true,
    multipleWindows: true
  }
};
```

### **Accessibility Compliance (WCAG 2.1 AA)**
```typescript
// Accessibility features for mortgage applications
const a11yFeatures = {
  screenReader: {
    landmarks: true,
    headingStructure: true,
    formLabels: true,
    errorMessages: true
  },

  keyboard: {
    navigation: true,
    shortcuts: true,
    focusManagement: true,
    skipLinks: true
  },

  visual: {
    colorContrast: 'AA',
    textScaling: '200%',
    motionPreference: 'respect-reduced-motion',
    darkMode: true
  },

  cognitive: {
    progressIndicators: true,
    timeoutWarnings: true,
    autoComplete: true,
    plainLanguage: true
  }
};
```

---

## 🚀 **IMPLEMENTATION PHASES**

### **Phase 1: Foundation (Week 1-2)**
- [ ] Next.js setup with authentication system
- [ ] Basic application wizard with form validation
- [ ] Document upload functionality
- [ ] Real-time quote integration
- [ ] Responsive layout implementation

### **Phase 2: Core Features (Week 3-4)**
- [ ] Complete 1003 form implementation
- [ ] Document center with OCR processing
- [ ] Rate calculator with live updates
- [ ] Borrower dashboard with progress tracking
- [ ] Secure messaging system

### **Phase 3: Advanced Features (Week 5-6)**
- [ ] E-signature integration
- [ ] Compliance disclosure management
- [ ] Application status automation
- [ ] Advanced document requirements engine
- [ ] Rate lock and expiration management

### **Phase 4: Polish & Compliance (Week 7-8)**
- [ ] TILA/RESPA compliance implementation
- [ ] CCPA privacy controls
- [ ] Accessibility compliance testing
- [ ] Performance optimization
- [ ] Security audit and penetration testing

---

## 🧪 **TESTING STRATEGY**

### **End-to-End Testing (Playwright)**
```typescript
// Critical user journeys
const testScenarios = [
  'complete-purchase-application',
  'refinance-application-with-cash-out',
  'document-upload-and-verification',
  'rate-quote-and-comparison',
  'secure-messaging-workflow',
  'compliance-disclosure-delivery'
];
```

### **Security Testing**
- [ ] Input validation and sanitization
- [ ] Authentication and authorization
- [ ] Data encryption verification
- [ ] OWASP Top 10 vulnerability scanning
- [ ] Penetration testing for sensitive data

### **Compliance Testing**
- [ ] TILA/RESPA disclosure timing
- [ ] CCPA privacy request workflows
- [ ] Document retention compliance
- [ ] Audit trail completeness
- [ ] Consent management validation

---

## 📚 **REFERENCE IMPLEMENTATIONS**

### **Archived Code Examples**
- **Application Forms**: `_archived/.../ratehunter-web/src/components/forms/`
- **Document Upload**: `_archived/.../mortgage-ui/src/components/documents/`
- **Rate Calculator**: `_archived/.../ratehunter/components/calculator/`
- **UI Components**: `_archived/.../ratehunter-web/src/components/ui/`

### **Integration Endpoints**
```typescript
// API integration with Nexus Router
const endpoints = {
  quotes: 'http://localhost:6000/api/quotes',
  application: 'http://localhost:6000/api/application',
  documents: 'http://localhost:6000/api/documents',
  compliance: 'http://localhost:6000/api/compliance',
  websocket: 'ws://localhost:6000/ws/rates'
};
```

---

## 🔧 **DEVELOPMENT COMMANDS**

```bash
# Setup
cd apps/webapp
npm install

# Development
npm run dev              # Start on port 3000
npm run build           # Production build
npm run test            # Unit tests
npm run test:e2e        # End-to-end tests
npm run type-check      # TypeScript validation

# Security
npm audit               # Security vulnerability check
npm run test:security   # Security-focused tests
```

---

**Last Updated**: 2026-03-10
**Status**: Ready for implementation
**Dependencies**: Nexus Router, Quote Engine, Document Processing, TwentyCRM

This master build guide consolidates all archived mortgage application content, ratehunter components, and compliance requirements into a comprehensive borrower-facing web application specification.
