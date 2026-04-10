# Nyra Web Application - Claude Flow V3 Configuration

## 🚨 AUTOMATIC SWARM ORCHESTRATION

**When starting work on complex tasks, Claude Code MUST automatically:**

1. **Initialize the swarm** using CLI tools via Bash
2. **Spawn concurrent agents** using Claude Code's Task tool
3. **Coordinate via hooks** and memory

**CLI coordinates, Task tool agents do the actual work!**

---

## 🤖 INTELLIGENT 3-TIER MODEL ROUTING (ADR-026)

| Tier | Handler | Latency | Cost | Use Cases |
|------|---------|---------|------|-----------|
| **1** | Agent Booster | <1ms | $0 | Simple transforms |
| **2** | Haiku | ~500ms | $0.0002 | Simple tasks, bug fixes |
| **3** | Sonnet/Opus | 2-5s | $0.003-$0.015 | Complex reasoning |

---

## 🛡️ ANTI-DRIFT CONFIG (PREFERRED)

```bash
npx @archon-os/cli@latest swarm init --topology hierarchical --max-agents 5 --strategy specialized
```

---

## 🔄 AUTO-START SWARM PROTOCOL

Spawn agents in background and WAIT.

---

## ⏸️ CRITICAL: Spawn and Wait Pattern

1. **TELL USER** - List concurrent tasks
2. **STOP** - No more tool calls
3. **WAIT** - Let agents work
4. **RESPOND** - Synthesize results

---

## 🧠 AUTO-LEARNING PROTOCOL

### Before Task
```bash
npx @archon-os/cli@latest memory search --query '[keywords]' --namespace patterns
```

### After Task
```bash
npx @archon-os/cli@latest memory store --namespace patterns --key '[pattern]' --value '[result]'
npx @archon-os/cli@latest hooks post-task --task-id '[id]' --success true --store-results true
```

---

## 🚀 V3 CLI Commands (26 Commands, 140+ Subcommands)

```bash
npx @archon-os/cli@latest swarm init --topology hierarchical --max-agents 5
npx @archon-os/cli@latest memory store --key "pattern" --value "content"
npx @archon-os/cli@latest memory search --query "search term"
npx @archon-os/cli@latest hooks pre-task --description "[task]"
npx @archon-os/cli@latest hooks post-task --task-id "[id]" --success true
```

---

## 🚀 Available Agents (60+ Types)

- `coder`: Webapp feature implementation
- `reviewer`: Code quality and security review
- `tester`: E2E and component testing
- `frontend-specialist`: React/Vite optimization
- `ux-designer`: Borrower experience design
- `performance-engineer`: Speed optimization

---

## 🪝 V3 Hooks System (27 Hooks + 12 Workers)

```bash
npx @archon-os/cli@latest hooks pre-task --description "borrower portal feature"
npx @archon-os/cli@latest hooks post-edit --file "webapp.tsx" --train-neural true
```

---

## 📝 Memory Commands Reference

```bash
npx @archon-os/cli@latest memory store --key "webapp-pattern" --value "content" --namespace patterns
npx @archon-os/cli@latest memory search --query "borrower portal features" --namespace patterns
npx @archon-os/cli@latest memory retrieve --key "pattern" --namespace patterns
```

---

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"**

---

**Profile**: react-typescript
**Generated**: 2026-01-09

## 🎯 Project Overview

Main web application for mortgage customers

## 🏗️ Architecture

**Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS
**Port**: 3002
**Type**: React SPA

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
npx @archon-os/cli@latest hooks pre-task \
  --description "Borrower portal feature development"
```

### Available Agents

- **coder**: Webapp feature implementation
- **reviewer**: Code quality and security review
- **tester**: E2E and component testing
- **frontend-specialist**: React/Vite optimization
- **ux-designer**: Borrower experience design

### Recommended Workflows

**1. Borrower Feature Development**
```bash
# Initialize swarm for borrower features
npx @archon-os/cli@latest swarm init --topology hierarchical --max-agents 5 --strategy specialized

# Store borrower context
npx @archon-os/cli@latest memory store \
  --namespace webapp \
  --key "features/borrower-portal" \
  --value "Self-service borrower features and workflows"
```

**2. User Flow Optimization**
```bash
# Search for UX patterns
npx @archon-os/cli@latest memory search \
  --query "borrower self-service mortgage application" \
  --namespace patterns

# Store successful flow
npx @archon-os/cli@latest hooks post-task \
  --task-id "ux-opt-001" \
  --success true \
  --store-results true
```

**3. Performance Optimization**
```bash
# Run performance benchmarks
npx @archon-os/cli@latest performance benchmark --suite webapp

# Analyze and optimize
npx @archon-os/cli@latest hooks worker dispatch --trigger optimize
```

**4. Accessibility Improvements**
```bash
# Check accessibility patterns
npx @archon-os/cli@latest memory search \
  --query "wcag accessibility borrower portal" \
  --namespace patterns
```

### Auto-Learning Protocol

**Before Development**:
```bash
npx @archon-os/cli@latest memory search \
  --query "borrower portal features mortgage" \
  --namespace patterns
```

**After Successful Implementation**:
```bash
npx @archon-os/cli@latest memory store \
  --namespace patterns \
  --key "webapp-success-$(date +%Y%m%d)" \
  --value "Implemented borrower [feature] successfully"

npx @archon-os/cli@latest neural train \
  --pattern-type borrower-workflows \
  --epochs 10
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

## 🎯 Borrower Portal Features

### Core Functionality
- **Application Status**: Real-time loan application tracking
- **Document Upload**: Secure document submission with progress
- **Secure Messaging**: Direct communication with loan officer
- **Rate Lock**: View and manage rate lock status
- **Milestone Tracking**: Visualize loan process progress
- **Profile Management**: Update contact info and preferences

### User Experience Priorities
- **Mobile-First**: 70% of borrowers use mobile devices
- **Simplicity**: Clear, jargon-free language
- **Progress Indicators**: Always show where borrower is in process
- **Help & Support**: Contextual help and FAQ access
- **Notifications**: Email/SMS for important updates

### Security & Privacy
- **Authentication**: Secure login with MFA option
- **Data Encryption**: All PII encrypted at rest and in transit
- **Session Management**: Auto-logout after inactivity
- **Document Security**: Encrypted document storage
- **Privacy Controls**: GDPR/CCPA compliant data management

## 🔄 Integration Points

### Quote Engine (8001)
- Loan application data
- Rate information retrieval
- Pre-qualification calculations

### TwentyCRM (3000)
- Borrower profile and contact info
- Loan officer assignment
- Application status updates

### Campaign Engine (8002)
- Notification preferences
- Drip campaign opt-in/out

### Mem0 (4321)
- Conversation history with loan officer
- Document upload history
- Activity timeline

## 📈 Performance & Accessibility

### Performance Targets
- **First Load**: < 2s
- **Page Transitions**: < 500ms
- **Document Upload**: Progress indicators for all uploads
- **API Response**: < 1s for data fetching

### Accessibility Requirements
- **WCAG 2.1 Level AA**: Full compliance
- **Screen Readers**: Semantic HTML and ARIA labels
- **Keyboard Navigation**: Complete keyboard accessibility
- **Color Contrast**: 4.5:1 minimum ratio
- **Focus Indicators**: Clear focus states

## 📚 Related Documentation

- **Root CLAUDE.md**: V3 orchestration patterns
- **apps/web/CLAUDE.md**: Web ecosystem overview
- **apps/web/crm/CLAUDE.md**: Loan officer CRM interface
- **services/quote-engine/**: Backend loan processing

## 📝 Notes

- Self-service borrower portal for active mortgage applicants
- React 18 + Vite for fast SPA performance
- Tailwind CSS for responsive design
- Focus on mobile experience (70% mobile users)
- Claude Flow V3 integrated development
- Security and privacy are paramount
- Accessibility compliant (WCAG 2.1 AA)
