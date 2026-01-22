# CRM Dashboard - CLAUDE.md

**Profile**: react-typescript
**Generated**: 2026-01-09

## 🎯 Project Overview

Analytics and reporting dashboard for CRM data

## 🏗️ Architecture

**Tech Stack**: React 18, TypeScript, Recharts, Tailwind CSS
**Port**: 3004
**Type**: React Dashboard

## 📋 Development Commands

```bash
# Development
pnpm dev

# Build
pnpm build

# Test
pnpm test

# Lint
pnpm lint
```

## 🧠 Claude Flow V3 Integration

### 3-Tier Model Routing

```bash
npx @claude-flow/cli@latest hooks pre-task \
  --description "CRM dashboard data visualization development"
```

### Available Agents

- **coder**: Dashboard component implementation
- **reviewer**: Code review and optimization
- **data-analyst**: Metrics and analytics design
- **frontend-specialist**: UI/UX and charting
- **performance-engineer**: Dashboard optimization

### Recommended Workflows

**1. New Dashboard Widget**
```bash
# Initialize swarm
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 4 --strategy specialized

# Store dashboard context
npx @claude-flow/cli@latest memory store \
  --namespace dashboard \
  --key "widgets/[name]" \
  --value "Widget requirements and data sources"
```

**2. Data Visualization**
```bash
# Search for chart patterns
npx @claude-flow/cli@latest memory search \
  --query "recharts visualization mortgage metrics" \
  --namespace patterns
```

**3. Real-Time Metrics**
```bash
# Check WebSocket patterns
npx @claude-flow/cli@latest memory retrieve \
  --namespace patterns \
  --key "websocket-realtime-updates"
```

### Auto-Learning Protocol

**Before Development**:
```bash
npx @claude-flow/cli@latest memory search \
  --query "dashboard metrics visualization" \
  --namespace patterns
```

**After Successful Implementation**:
```bash
npx @claude-flow/cli@latest memory store \
  --namespace patterns \
  --key "dashboard-success-$(date +%Y%m%d)" \
  --value "Implemented [widget/feature] successfully"

npx @claude-flow/cli@latest hooks post-task \
  --task-id "dashboard-feat-001" \
  --success true \
  --store-results true
```

---

## 🛠️ Tech Stack Specific Guidelines

## React + TypeScript Development Guidelines

### Project Structure
```
src/
├── components/       # Reusable UI components
├── features/        # Feature-specific modules
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
├── api/             # API client and services
└── App.tsx          # Root component
```

### Component Patterns
```typescript
// Functional Components with Props
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  variant = 'primary'
}) => {
  return <button onClick={onClick} className={variant}>{children}</button>;
};
```

### State Management
- Use React Context for global state
- Custom hooks for shared logic
- Consider Zustand for complex state
- useReducer for complex component state

### Custom Hooks
```typescript
export function useApi<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  return { data, loading, error };
}
```

### Type Safety
- Define prop interfaces explicitly
- Use discriminated unions for variants
- Leverage TypeScript generics
- Strict null checks enabled

### Performance Optimization
- React.memo for expensive components
- useMemo for expensive calculations
- useCallback for stable function references
- Code splitting with React.lazy

### Testing
- Jest + React Testing Library
- Test component behavior, not implementation
- Mock external dependencies
- Test custom hooks with renderHook

### Best Practices
- Single Responsibility Principle
- Composition over inheritance
- Keep components pure when possible
- Use TypeScript strict mode
- Follow React hooks rules


---

## 📊 Dashboard-Specific Features

### Key Metrics Tracked
- Lead conversion rates by source
- Pipeline velocity and bottlenecks
- Loan officer performance metrics
- Campaign effectiveness
- Revenue forecasting

### Data Sources
- **TwentyCRM (3000)**: Lead and pipeline data
- **Quote Engine (8001)**: Rate and quote metrics
- **Campaign Engine (8002)**: Campaign performance
- **Mem0 (4321)**: Interaction analytics

### Real-Time Updates
- WebSocket for live metric updates
- Auto-refresh every 30 seconds for dashboard
- Polling fallback if WebSocket unavailable

## 📚 Related Documentation

- **Root CLAUDE.md**: V3 orchestration patterns
- **apps/web/CLAUDE.md**: Web ecosystem overview
- **apps/web/crm/CLAUDE.md**: Source CRM application

## 📝 Notes

- Real-time analytics dashboard for mortgage operations
- Recharts for data visualization
- React 18 with TypeScript
- Responsive design for mobile and desktop
- Claude Flow V3 integrated for development
- Performance optimized for fast dashboard loads
