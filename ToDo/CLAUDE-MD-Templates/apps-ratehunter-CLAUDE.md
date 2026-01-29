# RateHunter - Public Mortgage Rate Comparison Site

## 🎯 APPLICATION CONTEXT

**Purpose**: Next.js 14 public-facing website providing real-time mortgage rate comparisons, interactive calculators, and lead capture for Project Nyra.

**Port**: 3100  
**Language**: TypeScript + React + Next.js 14 + Tailwind CSS  
**UI Components**: shadcn/ui + Radix UI primitives  
**Templates**: CLAUDE-MD-TypeScript.md + CLAUDE-MD-React.md (star + mesh topology)

## 🚨 CRITICAL DEVELOPMENT RULES

### Parallel Component Development Pattern
**MANDATORY**: All pages, components, and features MUST be developed in parallel:

```typescript
// ✅ CORRECT: Batch frontend development in ONE message
[Single Message]:
  // Page components (Next.js App Router)
  - Write("app/page.tsx", homepage)
  - Write("app/rates/page.tsx", ratePage)
  - Write("app/calculator/page.tsx", calculatorPage)
  - Write("app/apply/page.tsx", leadCapturePage)
  - Write("app/layout.tsx", rootLayout)
  
  // Shared components
  - Write("components/features/rate-table.tsx", rateTableComponent)
  - Write("components/features/calculator-widget.tsx", calculatorWidget)
  - Write("components/features/lead-form.tsx", leadFormComponent)
  - Write("components/shared/navigation.tsx", navigationComponent)
  
  // API route handlers
  - Write("app/api/rates/route.ts", ratesAPIRoute)
  - Write("app/api/calculate/route.ts", calculatorAPIRoute)
  - Write("app/api/leads/route.ts", leadSubmissionRoute)
  
  // Utility functions
  - Write("lib/mortgage-calculations.ts", mortgageUtils)
  - Write("lib/api-client.ts", quoteEngineClient)
  
  // Tests (Jest + React Testing Library)
  - Write("__tests__/rate-table.test.tsx", rateTableTests)
  - Write("__tests__/calculator.test.tsx", calculatorTests)
  - Write("__tests__/lead-form.test.tsx", leadFormTests)
  
  // Run all tests in parallel
  - Bash("npm test -- --maxWorkers=4")

// ❌ WRONG: Sequential page development
[Message 1]: Write homepage
[Message 2]: Write rates page
[Message 3]: Write calculator page
```

### SEO & Performance First
**CRITICAL**: This is a lead generation site - SEO and speed are non-negotiable:

- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Lighthouse Score**: 95+ on all metrics (Performance, Accessibility, Best Practices, SEO)
- **Mobile-First**: All designs must be fully responsive
- **Server Components**: Use Next.js Server Components by default for better performance
- **Metadata**: Comprehensive meta tags for mortgage keywords (rates, calculator, refinance, etc.)
- **Schema.org**: Structured data for mortgage services, local business, FAQs
- **Images**: Next.js Image component with optimization, lazy loading
- **Fonts**: Local font hosting with next/font for zero layout shift

### Compliance in Public Content
**CRITICAL**: All public-facing content must comply with:

- **Equal Housing Opportunity**: Display EHO logo on all pages
- **NMLS Disclosure**: Display company NMLS number prominently
- **Rate Disclaimers**: "Rates subject to change. APR includes fees. This is not a commitment to lend."
- **Privacy Policy**: Link in footer, compliant with CCPA/GDPR
- **Accessibility**: WCAG 2.1 Level AA compliance
- **Fair Lending**: No discriminatory language or imagery
- **Truth in Advertising**: No misleading claims about rates or approval

## 📊 RATEHUNTER ARCHITECTURE

### Page Structure (Next.js App Router)
```
app/
├── page.tsx                    # Homepage (hero, features, CTA, testimonials)
├── rates/
│   └── page.tsx               # Live rate table by loan type
├── calculator/
│   └── page.tsx               # Interactive mortgage calculator
├── apply/
│   └── page.tsx               # Lead capture form
├── about/
│   └── page.tsx               # About the company
├── contact/
│   └── page.tsx               # Contact information
├── blog/
│   ├── page.tsx               # Blog listing
│   └── [slug]/page.tsx        # Individual blog posts
├── layout.tsx                  # Root layout (navigation, footer)
├── not-found.tsx              # 404 page
└── api/
    ├── rates/route.ts          # Proxy to Quote Engine API
    ├── calculate/route.ts      # Calculation endpoint
    └── leads/route.ts          # Lead submission to TwentyCRM
```

### Component Hierarchy
```
components/
├── ui/                         # shadcn/ui primitives
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── table.tsx
│   ├── card.tsx
│   └── form.tsx
├── features/                   # Business logic components
│   ├── rate-table.tsx          # Sortable/filterable rate comparison
│   ├── calculator-widget.tsx  # Mortgage payment calculator
│   ├── lead-form.tsx           # Multi-step lead capture
│   ├── loan-product-cards.tsx # Loan type selection
│   └── testimonials.tsx        # Customer reviews
└── shared/                     # Reusable UI components
    ├── navigation.tsx          # Header navigation
    ├── footer.tsx              # Footer with links
    ├── hero-section.tsx        # Hero sections
    └── cta-section.tsx         # Call-to-action sections
```

## 🐝 RATEHUNTER SWARM

### Agent Configuration
```yaml
topology: star + mesh  # Star for type propagation, mesh for components
maxAgents: 6
strategy: parallel
language: typescript
framework: nextjs

agents:
  type_architect:
    role: TypeScript Type System Design
    focus: [type-definitions, interfaces, zod-schemas]
    responsibilities:
      - Design comprehensive type system
      - Create Zod validation schemas
      - Ensure type safety across app
      - Generate types from API responses
    concurrent_tasks: [multiple-types, parallel-validation]

  component_developer:
    role: React Component Implementation
    focus: [server-components, client-components, hooks]
    responsibilities:
      - Build Next.js 14 Server Components
      - Create interactive Client Components
      - Implement custom hooks
      - Optimize component rendering
    concurrent_tasks: [multiple-components, parallel-pages]

  ui_designer:
    role: Visual Design & UX
    focus: [tailwind-styling, responsive-design, accessibility]
    responsibilities:
      - Implement pixel-perfect designs
      - Ensure mobile-first responsiveness
      - Apply Tailwind utility classes
      - Maintain design system consistency
    concurrent_tasks: [multiple-styles, parallel-variants]

  performance_engineer:
    role: Web Performance Optimization
    focus: [core-web-vitals, bundle-size, lazy-loading]
    responsibilities:
      - Achieve LCP < 2.5s
      - Minimize JavaScript bundle
      - Implement lazy loading strategies
      - Optimize images and fonts
    concurrent_tasks: [multiple-optimizations, parallel-metrics]

  seo_specialist:
    role: SEO & Metadata Optimization
    focus: [meta-tags, structured-data, sitemaps]
    responsibilities:
      - Implement comprehensive metadata
      - Add Schema.org structured data
      - Generate sitemaps
      - Optimize for mortgage keywords
    concurrent_tasks: [multiple-pages, parallel-metadata]

  testing_specialist:
    role: Component Testing & E2E
    focus: [jest, react-testing-library, playwright]
    responsibilities:
      - Write unit tests for all components
      - Create integration tests
      - Implement E2E test scenarios
      - Ensure accessibility testing
    concurrent_tasks: [multiple-test-suites, parallel-execution]
```

## 🔧 NEXT.JS 14 PATTERNS

### Server Component Example (Rate Table)
```tsx
// app/rates/page.tsx - Server Component fetches data
import { Suspense } from 'react'
import { RateTable } from '@/components/features/rate-table'
import { RateTableSkeleton } from '@/components/features/rate-table-skeleton'

export const metadata = {
  title: 'Current Mortgage Rates | Compare Rates from 1000+ Lenders',
  description: 'View real-time mortgage rates for conventional, FHA, VA, and jumbo loans. Compare rates from over 1,000 lenders to find your best rate.',
  keywords: 'mortgage rates, home loan rates, refinance rates, FHA rates, VA loan rates',
  openGraph: {
    title: 'Current Mortgage Rates',
    description: 'Compare real-time rates from 1000+ lenders',
    type: 'website',
    url: 'https://ratehunter.example.com/rates',
  }
}

async function getRates() {
  // Server-side data fetching - no client bundle impact
  const res = await fetch('http://quote-engine:8001/api/v1/rates/current', {
    cache: 'no-store', // Always fresh data
    next: { revalidate: 60 } // Or use ISR with 60-second revalidation
  })
  
  if (!res.ok) {
    throw new Error('Failed to fetch rates')
  }
  
  return res.json()
}

export default async function RatesPage() {
  const rates = await getRates()
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Current Mortgage Rates
      </h1>
      
      <p className="text-lg text-gray-600 mb-8">
        Compare real-time rates from over 1,000 lenders. Rates updated daily.
      </p>
      
      <Suspense fallback={<RateTableSkeleton />}>
        <RateTable data={rates} />
      </Suspense>
      
      <div className="mt-8 text-sm text-gray-500">
        * Rates shown are samples and subject to change. APR includes lender fees. 
        This is not a commitment to lend. All loans subject to credit approval.
      </div>
    </div>
  )
}
```

### Client Component Example (Calculator)
```tsx
// components/features/calculator-widget.tsx - Client Component for interactivity
'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { calculateMonthlyPayment, calculateAPR } from '@/lib/mortgage-calculations'

// Zod schema for type-safe form validation
const calculatorSchema = z.object({
  homePrice: z.number().min(50000).max(100000000),
  downPayment: z.number().min(0),
  interestRate: z.number().min(0.01).max(20),
  loanTerm: z.enum(['10', '15', '20', '25', '30']),
  propertyTax: z.number().min(0).optional(),
  homeInsurance: z.number().min(0).optional(),
  hoa: z.number().min(0).optional(),
})

type CalculatorFormData = z.infer<typeof calculatorSchema>

export function CalculatorWidget() {
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0)
  const [totalMonthly, setTotalMonthly] = useState<number>(0)
  const [loanAmount, setLoanAmount] = useState<number>(0)
  const [ltv, setLtv] = useState<number>(0)
  const [pmi, setPmi] = useState<number>(0)
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue
  } = useForm<CalculatorFormData>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      homePrice: 400000,
      downPayment: 80000,
      interestRate: 6.5,
      loanTerm: '30',
      propertyTax: 400,
      homeInsurance: 150,
      hoa: 0,
    }
  })
  
  // Watch form values for real-time calculation
  const watchedValues = watch()
  
  // Recalculate whenever inputs change
  useEffect(() => {
    const calculate = () => {
      const {
        homePrice,
        downPayment,
        interestRate,
        loanTerm,
        propertyTax = 0,
        homeInsurance = 0,
        hoa = 0
      } = watchedValues
      
      // Calculate loan amount and LTV
      const loanAmt = homePrice - downPayment
      const ltvRatio = (loanAmt / homePrice) * 100
      
      // Calculate monthly P&I payment
      const monthlyPI = calculateMonthlyPayment(
        loanAmt,
        interestRate,
        parseInt(loanTerm)
      )
      
      // Calculate PMI if LTV > 80%
      let monthlyPMI = 0
      if (ltvRatio > 80) {
        // PMI rate varies by LTV and credit score
        // Using average 0.5% annually for this example
        const pmiRate = 0.005
        monthlyPMI = (loanAmt * pmiRate) / 12
      }
      
      // Total monthly payment
      const totalMo = monthlyPI + monthlyPMI + propertyTax + homeInsurance + hoa
      
      setLoanAmount(loanAmt)
      setLtv(ltvRatio)
      setMonthlyPayment(monthlyPI)
      setPmi(monthlyPMI)
      setTotalMonthly(totalMo)
    }
    
    calculate()
  }, [watchedValues])
  
  const onSubmit = async (data: CalculatorFormData) => {
    // Could save calculation or navigate to application
    console.log('Calculator submission:', data)
  }
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Mortgage Payment Calculator</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Home Price */}
            <div className="space-y-2">
              <Label htmlFor="homePrice">Home Price</Label>
              <Input
                id="homePrice"
                type="number"
                placeholder="$400,000"
                {...register('homePrice', { valueAsNumber: true })}
                className={errors.homePrice ? 'border-red-500' : ''}
              />
              {errors.homePrice && (
                <p className="text-sm text-red-500">{errors.homePrice.message}</p>
              )}
            </div>
            
            {/* Down Payment */}
            <div className="space-y-2">
              <Label htmlFor="downPayment">Down Payment</Label>
              <Input
                id="downPayment"
                type="number"
                placeholder="$80,000"
                {...register('downPayment', { valueAsNumber: true })}
                className={errors.downPayment ? 'border-red-500' : ''}
              />
              {errors.downPayment && (
                <p className="text-sm text-red-500">{errors.downPayment.message}</p>
              )}
              <p className="text-sm text-gray-500">
                {((watchedValues.downPayment / watchedValues.homePrice) * 100).toFixed(1)}% down
              </p>
            </div>
            
            {/* Interest Rate */}
            <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.125"
                placeholder="6.5"
                {...register('interestRate', { valueAsNumber: true })}
                className={errors.interestRate ? 'border-red-500' : ''}
              />
              {errors.interestRate && (
                <p className="text-sm text-red-500">{errors.interestRate.message}</p>
              )}
            </div>
            
            {/* Loan Term */}
            <div className="space-y-2">
              <Label htmlFor="loanTerm">Loan Term</Label>
              <Select
                defaultValue="30"
                onValueChange={(value) => setValue('loanTerm', value as any)}
              >
                <SelectTrigger id="loanTerm">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 years</SelectItem>
                  <SelectItem value="15">15 years</SelectItem>
                  <SelectItem value="20">20 years</SelectItem>
                  <SelectItem value="25">25 years</SelectItem>
                  <SelectItem value="30">30 years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Property Tax */}
            <div className="space-y-2">
              <Label htmlFor="propertyTax">Monthly Property Tax</Label>
              <Input
                id="propertyTax"
                type="number"
                placeholder="$400"
                {...register('propertyTax', { valueAsNumber: true })}
              />
            </div>
            
            {/* Home Insurance */}
            <div className="space-y-2">
              <Label htmlFor="homeInsurance">Monthly Home Insurance</Label>
              <Input
                id="homeInsurance"
                type="number"
                placeholder="$150"
                {...register('homeInsurance', { valueAsNumber: true })}
              />
            </div>
            
            {/* HOA */}
            <div className="space-y-2">
              <Label htmlFor="hoa">Monthly HOA</Label>
              <Input
                id="hoa"
                type="number"
                placeholder="$0"
                {...register('hoa', { valueAsNumber: true })}
              />
            </div>
          </div>
          
          {/* Results Summary */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Your Monthly Payment</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span>Principal & Interest:</span>
                <span className="font-semibold">
                  ${monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              
              {pmi > 0 && (
                <div className="flex justify-between text-lg text-orange-600">
                  <span>PMI (LTV {ltv.toFixed(1)}%):</span>
                  <span className="font-semibold">
                    ${pmi.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Property Tax:</span>
                <span>${(watchedValues.propertyTax || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Home Insurance:</span>
                <span>${(watchedValues.homeInsurance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              {(watchedValues.hoa || 0) > 0 && (
                <div className="flex justify-between">
                  <span>HOA:</span>
                  <span>${watchedValues.hoa!.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              
              <div className="pt-3 border-t-2 border-blue-200">
                <div className="flex justify-between text-2xl font-bold text-blue-600">
                  <span>Total Monthly:</span>
                  <span>${totalMonthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mt-4">
                Loan Amount: ${loanAmount.toLocaleString('en-US')} • LTV: {ltv.toFixed(1)}%
              </div>
            </div>
          </div>
          
          <Button type="submit" size="lg" className="w-full">
            Get Pre-Approved
          </Button>
        </form>
        
        <div className="mt-6 text-sm text-gray-500">
          * This calculator provides estimates only. Your actual payment may vary based on 
          your credit profile, property details, and current market conditions. This is not 
          a commitment to lend.
        </div>
      </CardContent>
    </Card>
  )
}
```

### API Route Example
```typescript
// app/api/leads/route.ts - API route handler
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const leadSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().regex(/^\d{10}$/),
  loanPurpose: z.enum(['purchase', 'refinance']),
  propertyZip: z.string().regex(/^\d{5}$/),
  estimatedCreditScore: z.enum(['excellent', 'good', 'fair', 'poor']),
  consentSMS: z.boolean(),
  consentEmail: z.boolean(),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const lead = leadSchema.parse(body)
    
    // Submit to TwentyCRM via API
    const response = await fetch('http://twenty-crm:3000/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TWENTY_CRM_API_KEY}`
      },
      body: JSON.stringify({
        ...lead,
        source: 'ratehunter_website',
        timestamp: new Date().toISOString(),
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to create lead in CRM')
    }
    
    const crmLead = await response.json()
    
    // If consent given, start drip campaign
    if (lead.consentSMS || lead.consentEmail) {
      await fetch('http://campaign-engine:8002/api/v1/campaigns/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: crmLead.id,
          campaign_type: 'new_lead',
        })
      })
    }
    
    return NextResponse.json({
      success: true,
      lead_id: crmLead.id,
      message: 'Thank you! We will contact you shortly.'
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Lead submission error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## 🔒 SECURITY PATTERNS

### Environment Variables
```typescript
// lib/config.ts - Type-safe environment variables
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  QUOTE_ENGINE_URL: z.string().url(),
  CAMPAIGN_ENGINE_URL: z.string().url(),
  TWENTY_CRM_API_KEY: z.string().min(1),
  GOOGLE_ANALYTICS_ID: z.string().optional(),
})

export const env = envSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  QUOTE_ENGINE_URL: process.env.QUOTE_ENGINE_URL,
  CAMPAIGN_ENGINE_URL: process.env.CAMPAIGN_ENGINE_URL,
  TWENTY_CRM_API_KEY: process.env.TWENTY_CRM_API_KEY,
  GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
})
```

## 📈 PERFORMANCE TARGETS

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Lighthouse Scores
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

### Bundle Size
- Initial JavaScript: < 200KB
- Total JavaScript: < 500KB
- CSS: < 50KB

## 🧪 TESTING REQUIREMENTS

### Component Testing
```typescript
// __tests__/calculator.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CalculatorWidget } from '@/components/features/calculator-widget'

describe('CalculatorWidget', () => {
  it('calculates monthly payment correctly', async () => {
    render(<CalculatorWidget />)
    
    // Fill in form
    const homePriceInput = screen.getByLabelText(/home price/i)
    fireEvent.change(homePriceInput, { target: { value: '400000' } })
    
    const downPaymentInput = screen.getByLabelText(/down payment/i)
    fireEvent.change(downPaymentInput, { target: { value: '80000' } })
    
    const rateInput = screen.getByLabelText(/interest rate/i)
    fireEvent.change(rateInput, { target: { value: '6.5' } })
    
    // Wait for calculation
    await waitFor(() => {
      const totalPayment = screen.getByText(/\$2,023.25/)
      expect(totalPayment).toBeInTheDocument()
    })
  })
  
  it('shows PMI when LTV > 80%', async () => {
    render(<CalculatorWidget />)
    
    // Set high LTV scenario (95%)
    fireEvent.change(screen.getByLabelText(/home price/i), { 
      target: { value: '400000' } 
    })
    fireEvent.change(screen.getByLabelText(/down payment/i), { 
      target: { value: '20000' } 
    })
    
    await waitFor(() => {
      expect(screen.getByText(/PMI/i)).toBeInTheDocument()
    })
  })
})
```

---

**This is the primary lead generation tool for Project Nyra. Every component must be optimized for conversion, performance, and SEO. Mobile responsiveness is mandatory - 60% of mortgage searches happen on mobile devices.**
