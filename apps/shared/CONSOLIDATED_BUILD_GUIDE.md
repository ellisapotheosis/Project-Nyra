# Shared Components & Utilities - Consolidated Build Guide

> **Cross-application design system and reusable components**
> **Consolidated from archived UI examples and component libraries**

## 🎯 **MISSION STATEMENT**

Create a unified design system, component library, and utility collection that ensures consistency across all Nyra applications while providing mortgage-specific components and business logic.

**Usage**: Imported by admin, webapp, landing, archon-ui, and all other apps
**Stack**: React 19 + TypeScript + shadcn/ui + magicUI + Tailwind CSS
**Distribution**: npm workspaces + local packages

---

## 📦 **PACKAGE STRUCTURE**

### **Monorepo Organization**
```
apps/shared/
├── packages/
│   ├── ui/                        # Base UI component library
│   ├── mortgage/                  # Mortgage-specific components
│   ├── forms/                     # Form components and validation
│   ├── charts/                    # Data visualization components
│   ├── utils/                     # Shared utilities and helpers
│   ├── icons/                     # Custom icon library
│   ├── hooks/                     # Reusable React hooks
│   └── constants/                 # Shared constants and types
├── templates/                     # Page and layout templates
├── assets/                       # Shared assets (images, fonts)
├── docs/                         # Component documentation
└── tools/                        # Build and development tools
```

### **Package.json Configuration**
```json
{
  "name": "@nyra/shared",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "devDependencies": {
    "@storybook/react": "^7.6.0",
    "@storybook/addon-docs": "^7.6.0",
    "turbo": "^1.11.0",
    "typescript": "5.5.4",
    "tailwindcss": "3.4.7"
  }
}
```

---

## 🎨 **UI COMPONENT LIBRARY (`packages/ui`)**

### **Base Components (shadcn/ui Extended)**
```typescript
// Core UI components with Nyra customizations
export const Button = {
  variants: {
    default: "bg-cyan-500 text-slate-900 hover:bg-cyan-400",
    secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700",
    outline: "border-cyan-400 text-cyan-300 hover:bg-cyan-400/10",
    ghost: "hover:bg-slate-800 text-slate-300",
    destructive: "bg-red-500 text-white hover:bg-red-400"
  },
  sizes: {
    sm: "h-8 px-3 text-sm",
    default: "h-10 px-4",
    lg: "h-12 px-6 text-lg",
    xl: "h-14 px-8 text-xl"
  }
};

export const Card = {
  variants: {
    default: "bg-slate-900/80 border-slate-800 backdrop-blur",
    glass: "bg-slate-900/60 border-slate-700/50 backdrop-blur-md",
    solid: "bg-slate-900 border-slate-800",
    gradient: "bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800"
  }
};
```

### **Enhanced Data Table**
```typescript
// Advanced data table from archived admin examples
interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  searchable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  pagination?: {
    pageSize: number;
    showPageInfo: boolean;
    showPageSizeSelector: boolean;
  };
  selection?: {
    enabled: boolean;
    onSelectionChange?: (selectedRows: TData[]) => void;
    bulkActions?: BulkAction<TData>[];
  };
  realTime?: {
    enabled: boolean;
    updateInterval: number;
    optimisticUpdates: boolean;
  };
}

interface BulkAction<TData> {
  label: string;
  icon: LucideIcon;
  action: (selectedRows: TData[]) => Promise<void>;
  confirmationRequired?: boolean;
  confirmationMessage?: string;
}
```

### **Form Components with Mortgage Validation**
```typescript
// Specialized form fields for mortgage applications
export const SSNInput = ({ value, onChange, ...props }) => {
  const [masked, setMasked] = useState(true);

  return (
    <div className="relative">
      <Input
        type={masked ? "password" : "text"}
        value={value}
        onChange={onChange}
        placeholder="XXX-XX-XXXX"
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-2 top-1/2 transform -translate-y-1/2"
        onClick={() => setMasked(!masked)}
      >
        {masked ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export const CurrencyInput = ({ value, onChange, ...props }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Input
      type="text"
      value={formatCurrency(value)}
      onChange={(e) => {
        const numericValue = parseFloat(e.target.value.replace(/[^0-9.-]+/g, ''));
        onChange(isNaN(numericValue) ? 0 : numericValue);
      }}
      {...props}
    />
  );
};
```

---

## 🏠 **MORTGAGE-SPECIFIC COMPONENTS (`packages/mortgage`)**

### **Loan Calculator Component**
```typescript
// From archived ratehunter and calculator components
interface LoanCalculatorProps {
  loanAmount: number;
  interestRate: number;
  termYears: number;
  downPayment?: number;
  propertyTax?: number;
  insurance?: number;
  pmi?: number;
  hoaFees?: number;
  onCalculationChange?: (calculation: LoanCalculation) => void;
}

interface LoanCalculation {
  monthlyPayment: number;
  principalAndInterest: number;
  totalInterest: number;
  totalPayment: number;
  escrowPayment: number;
  pmiPayment: number;
  apr: number;
  payoffDate: Date;
  amortizationSchedule: AmortizationEntry[];
}

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({
  loanAmount,
  interestRate,
  termYears,
  ...props
}) => {
  const calculation = useMortgageCalculation({
    loanAmount,
    interestRate,
    termYears,
    ...props
  });

  return (
    <Card className="p-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Input Controls */}
        <div className="space-y-4">
          <LoanAmountSlider value={loanAmount} onChange={props.onLoanAmountChange} />
          <RateSlider value={interestRate} onChange={props.onRateChange} />
          <TermSelector value={termYears} onChange={props.onTermChange} />
        </div>

        {/* Payment Breakdown */}
        <div className="space-y-4">
          <PaymentBreakdownChart calculation={calculation} />
          <AmortizationTable schedule={calculation.amortizationSchedule} />
        </div>
      </div>
    </Card>
  );
};
```

### **Rate Display Components**
```typescript
// Real-time rate display with WebSocket updates
interface RateDisplayProps {
  loanType: 'conventional' | 'fha' | 'va' | 'usda';
  term: 15 | 30;
  points: number;
  showTrend?: boolean;
  showHistory?: boolean;
  updateInterval?: number;
}

export const RateDisplay: React.FC<RateDisplayProps> = ({
  loanType,
  term,
  points,
  showTrend = true,
  showHistory = false
}) => {
  const { currentRate, rateHistory, trend } = useRealTimeRates({
    loanType,
    term,
    points
  });

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>{loanType.toUpperCase()} {term}-Year Fixed</span>
          {showTrend && <TrendIndicator trend={trend} />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-cyan-300 mb-2">
          {currentRate.toFixed(3)}%
        </div>
        <div className="text-sm text-slate-400">
          APR: {currentRate + 0.15}% | Points: {points}
        </div>
        {showHistory && (
          <div className="mt-4">
            <RateHistoryChart data={rateHistory} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

### **Application Progress Tracker**
```typescript
// Multi-step application progress visualization
interface ApplicationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'current' | 'completed' | 'error';
  estimatedTime?: string;
  requirements?: string[];
}

const mortgageApplicationSteps: ApplicationStep[] = [
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Basic contact and identification',
    status: 'completed',
    estimatedTime: '5 minutes'
  },
  {
    id: 'employment',
    title: 'Employment & Income',
    description: 'Employment history and income verification',
    status: 'current',
    estimatedTime: '10 minutes'
  },
  {
    id: 'assets',
    title: 'Assets & Liabilities',
    description: 'Bank accounts, investments, and debts',
    status: 'pending',
    estimatedTime: '15 minutes'
  },
  {
    id: 'property',
    title: 'Property Details',
    description: 'Property information and intended use',
    status: 'pending',
    estimatedTime: '8 minutes'
  },
  {
    id: 'documents',
    title: 'Document Upload',
    description: 'Supporting documentation',
    status: 'pending',
    estimatedTime: '20 minutes'
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Final review and submission',
    status: 'pending',
    estimatedTime: '5 minutes'
  }
];

export const ApplicationProgressTracker: React.FC<{
  currentStep: string;
  completedSteps: string[];
}> = ({ currentStep, completedSteps }) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {mortgageApplicationSteps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <StepIndicator
              step={step}
              isActive={step.id === currentStep}
              isCompleted={completedSteps.includes(step.id)}
            />
            {index < mortgageApplicationSteps.length - 1 && (
              <StepConnector
                isCompleted={completedSteps.includes(step.id)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 📊 **CHARTS & VISUALIZATIONS (`packages/charts`)**

### **Mortgage-Specific Charts**
```typescript
// Specialized charts for mortgage data visualization
export const PaymentBreakdownChart: React.FC<{
  principalAndInterest: number;
  propertyTax: number;
  insurance: number;
  pmi: number;
  hoaFees: number;
}> = ({ principalAndInterest, propertyTax, insurance, pmi, hoaFees }) => {
  const data = [
    { name: 'Principal & Interest', value: principalAndInterest, fill: '#06b6d4' },
    { name: 'Property Tax', value: propertyTax, fill: '#8b5cf6' },
    { name: 'Insurance', value: insurance, fill: '#10b981' },
    { name: 'PMI', value: pmi, fill: '#f59e0b' },
    { name: 'HOA Fees', value: hoaFees, fill: '#ef4444' }
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: $${value}`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const RateTrendChart: React.FC<{
  data: RateHistoryPoint[];
  timeRange: '1D' | '1W' | '1M' | '3M' | '1Y';
}> = ({ data, timeRange }) => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <XAxis
          dataKey="date"
          tickFormatter={(date) => format(new Date(date), 'MM/dd')}
        />
        <YAxis
          domain={['dataMin - 0.1', 'dataMax + 0.1']}
          tickFormatter={(rate) => `${rate}%`}
        />
        <Tooltip
          formatter={(rate) => [`${rate}%`, 'Rate']}
          labelFormatter={(date) => format(new Date(date), 'PPP')}
        />
        <Line
          type="monotone"
          dataKey="rate"
          stroke="#06b6d4"
          strokeWidth={2}
          dot={{ fill: '#06b6d4', strokeWidth: 0, r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

### **Pipeline Visualization**
```typescript
// Loan pipeline funnel chart
export const LoanPipelineFunnel: React.FC<{
  stages: PipelineStage[];
  totalValue: number;
}> = ({ stages, totalValue }) => {
  const calculateStageMetrics = (stage: PipelineStage) => ({
    ...stage,
    conversionRate: stage.count / stages[0].count,
    dropOffRate: 1 - (stage.count / (stages[stages.indexOf(stage) - 1]?.count || stage.count)),
    averageDays: stage.averageDaysInStage
  });

  return (
    <div className="space-y-4">
      {stages.map((stage, index) => {
        const metrics = calculateStageMetrics(stage);
        const widthPercentage = (stage.count / stages[0].count) * 100;

        return (
          <div key={stage.name} className="relative">
            <div
              className="bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg p-4 transition-all"
              style={{ width: `${widthPercentage}%`, minWidth: '200px' }}
            >
              <div className="flex justify-between items-center text-white">
                <div>
                  <div className="font-semibold">{stage.name}</div>
                  <div className="text-sm opacity-90">
                    {stage.count} loans • ${(stage.value / 1000000).toFixed(1)}M
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{(metrics.conversionRate * 100).toFixed(1)}%</div>
                  <div className="text-sm opacity-90">{metrics.averageDays}d avg</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
```

---

## 🔧 **UTILITIES & HOOKS (`packages/utils`, `packages/hooks`)**

### **Mortgage Calculation Utilities**
```typescript
// Comprehensive mortgage calculation library
export class MortgageCalculator {
  static calculateMonthlyPayment(
    principal: number,
    annualRate: number,
    termYears: number
  ): number {
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = termYears * 12;

    if (monthlyRate === 0) {
      return principal / numPayments;
    }

    return (
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1)
    );
  }

  static generateAmortizationSchedule(
    principal: number,
    annualRate: number,
    termYears: number
  ): AmortizationEntry[] {
    const monthlyPayment = this.calculateMonthlyPayment(principal, annualRate, termYears);
    const monthlyRate = annualRate / 100 / 12;
    let remainingBalance = principal;
    const schedule: AmortizationEntry[] = [];

    for (let month = 1; month <= termYears * 12; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;

      schedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, remainingBalance),
        cumulativeInterest: schedule.reduce((sum, entry) => sum + entry.interest, interestPayment)
      });
    }

    return schedule;
  }

  static calculateAPR(
    loanAmount: number,
    interestRate: number,
    termYears: number,
    closingCosts: number,
    points: number
  ): number {
    // Simplified APR calculation - in production use exact TILA APR calculation
    const totalFinanced = loanAmount - (loanAmount * points / 100) + closingCosts;
    const monthlyPayment = this.calculateMonthlyPayment(loanAmount, interestRate, termYears);

    // Use iterative method to solve for APR
    let apr = interestRate;
    for (let i = 0; i < 100; i++) {
      const calculatedPayment = this.calculateMonthlyPayment(totalFinanced, apr, termYears);
      if (Math.abs(calculatedPayment - monthlyPayment) < 0.01) break;
      apr += (monthlyPayment > calculatedPayment) ? 0.001 : -0.001;
    }

    return apr;
  }
}
```

### **Real-Time Data Hooks**
```typescript
// WebSocket hooks for real-time mortgage data
export const useRealTimeRates = (params: {
  loanType: string;
  term: number;
  points: number;
}) => {
  const [rates, setRates] = useState<RateData | null>(null);
  const [history, setHistory] = useState<RateHistoryPoint[]>([]);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/rates`);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        action: 'subscribe',
        loanType: params.loanType,
        term: params.term,
        points: params.points
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'rate_update') {
        setRates(data.rates);
        setHistory(prev => [...prev, data.rates].slice(-100)); // Keep last 100 points

        // Calculate trend
        if (history.length > 1) {
          const lastRate = history[history.length - 1].rate;
          const previousRate = history[history.length - 2].rate;
          const diff = lastRate - previousRate;
          setTrend(diff > 0.01 ? 'up' : diff < -0.01 ? 'down' : 'stable');
        }
      }
    };

    return () => ws.close();
  }, [params]);

  return { currentRate: rates?.rate || 0, rateHistory: history, trend };
};

// Application state management
export const useApplicationForm = () => {
  const [formData, setFormData] = useState<Partial<UniformApplication>>({});
  const [currentStep, setCurrentStep] = useState('personal');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const saveStep = async (stepId: string, data: any) => {
    const updatedData = { ...formData, [stepId]: data };
    setFormData(updatedData);

    // Auto-save to backend
    try {
      await fetch('/api/application/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId, data: updatedData })
      });

      if (!completedSteps.includes(stepId)) {
        setCompletedSteps(prev => [...prev, stepId]);
      }
    } catch (error) {
      console.error('Failed to save application data:', error);
    }
  };

  const validateStep = (stepId: string): boolean => {
    const stepSchema = getValidationSchema(stepId);
    try {
      stepSchema.parse(formData[stepId]);
      setValidationErrors(prev => ({ ...prev, [stepId]: [] }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationErrors(prev => ({
          ...prev,
          [stepId]: error.errors.map(e => e.message)
        }));
      }
      return false;
    }
  };

  return {
    formData,
    currentStep,
    completedSteps,
    validationErrors,
    setCurrentStep,
    saveStep,
    validateStep,
    isStepComplete: (stepId: string) => completedSteps.includes(stepId),
    canProceedToNext: (stepId: string) => validationErrors[stepId]?.length === 0
  };
};
```

---

## 🚀 **IMPLEMENTATION PHASES**

### **Phase 1: Foundation (Week 1)**
- [ ] Monorepo setup with workspace configuration
- [ ] Base UI component library (shadcn/ui integration)
- [ ] Tailwind configuration and design tokens
- [ ] TypeScript configuration and build system

### **Phase 2: Core Components (Week 2)**
- [ ] Form components with mortgage-specific validation
- [ ] Data table with advanced filtering and export
- [ ] Chart components for financial visualization
- [ ] Mortgage calculator and rate display components

### **Phase 3: Advanced Features (Week 3)**
- [ ] Real-time data hooks and WebSocket integration
- [ ] Application state management utilities
- [ ] Document upload and processing components
- [ ] Compliance and audit trail utilities

### **Phase 4: Documentation & Testing (Week 4)**
- [ ] Storybook setup with component documentation
- [ ] Unit tests for all shared components
- [ ] Integration testing with consuming applications
- [ ] Performance optimization and bundle analysis

---

## 🧪 **TESTING & DOCUMENTATION**

### **Storybook Configuration**
```typescript
// .storybook/main.ts
module.exports = {
  stories: ['../packages/*/src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-actions',
    '@storybook/addon-a11y'
  ],
  framework: '@storybook/react',
  features: {
    buildStoriesJson: true
  }
};

// Example story
export default {
  title: 'Mortgage/LoanCalculator',
  component: LoanCalculator,
  argTypes: {
    loanAmount: { control: { type: 'range', min: 50000, max: 2000000, step: 1000 } },
    interestRate: { control: { type: 'range', min: 2, max: 10, step: 0.125 } },
    termYears: { control: { type: 'select', options: [15, 20, 25, 30] } }
  }
};
```

### **Component Testing**
```typescript
// Testing utilities for shared components
import { render, screen, userEvent } from '@testing-library/react';
import { LoanCalculator } from '../LoanCalculator';

describe('LoanCalculator', () => {
  it('calculates monthly payment correctly', () => {
    render(
      <LoanCalculator
        loanAmount={300000}
        interestRate={5.5}
        termYears={30}
      />
    );

    // Should display correct monthly payment
    expect(screen.getByText('$1,703.21')).toBeInTheDocument();
  });

  it('updates calculation when inputs change', async () => {
    const user = userEvent.setup();
    render(<LoanCalculator />);

    const loanAmountSlider = screen.getByLabelText('Loan Amount');
    await user.click(loanAmountSlider);

    // Verify recalculation
    expect(screen.getByTestId('monthly-payment')).toHaveTextContent('$');
  });
});
```

---

## 📚 **USAGE EXAMPLES**

### **Importing in Admin Dashboard**
```typescript
// apps/admin/app/leads/components/LeadGrid.tsx
import { DataTable, Button, Card } from '@nyra/shared/ui';
import { CurrencyInput, PhoneInput } from '@nyra/shared/forms';
import { LeadFunnelChart } from '@nyra/shared/charts';
import { usePagination, useRealTimeUpdates } from '@nyra/shared/hooks';

export const LeadGrid = () => {
  const { data, pagination } = usePagination('/api/leads');

  return (
    <Card>
      <DataTable
        data={data}
        columns={leadColumns}
        pagination={pagination}
        searchable
        exportable
        selection={{
          enabled: true,
          bulkActions: [
            {
              label: 'Assign to LO',
              action: assignLeadsToLO,
              icon: UserPlus
            }
          ]
        }}
      />
    </Card>
  );
};
```

### **Importing in Web Application**
```typescript
// apps/webapp/app/apply/personal/page.tsx
import { ApplicationProgressTracker } from '@nyra/shared/mortgage';
import { FormField, SSNInput, AddressInput } from '@nyra/shared/forms';
import { useApplicationForm } from '@nyra/shared/hooks';

export default function PersonalInfoPage() {
  const { formData, saveStep, currentStep, completedSteps } = useApplicationForm();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ApplicationProgressTracker
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      <Card className="mt-8">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              <FormField label="Social Security Number" required>
                <SSNInput
                  value={formData.personal?.ssn}
                  onChange={(value) => updateField('ssn', value)}
                />
              </FormField>

              <FormField label="Current Address" required>
                <AddressInput
                  value={formData.personal?.address}
                  onChange={(value) => updateField('address', value)}
                />
              </FormField>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 🔧 **DEVELOPMENT COMMANDS**

```bash
# Shared components development
cd apps/shared
npm install

# Development with Storybook
npm run storybook         # Start component development
npm run build-storybook   # Build static documentation

# Build all packages
npm run build            # Build all shared packages
npm run dev              # Development mode with hot reload

# Testing
npm run test             # Run component tests
npm run test:coverage    # Generate coverage report
npm run lint             # Lint all packages

# Package management
npx turbo run build --filter=@nyra/ui
npx turbo run test --filter=@nyra/mortgage
```

---

**Last Updated**: 2026-03-10
**Status**: Ready for implementation
**Dependencies**: React 19, TypeScript 5.5, Tailwind CSS, shadcn/ui

This consolidated build guide brings together all shared component requirements, mortgage-specific utilities, and cross-app consistency patterns into a comprehensive shared library specification.
