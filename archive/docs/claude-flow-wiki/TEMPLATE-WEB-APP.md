# CLAUDE.md Template - Web Application

Comprehensive template for React/Next.js web applications with Claude Flow integration.

## Template Metadata
- Type: Web Application
- Complexity: Advanced
- Team Size: Small to Large (2-15)
- Architecture: Frontend + Backend (possibly)
- Use Case: SPA, Dashboard, Full-stack application

## Template Content

```markdown
# Web Application Configuration - [App Name]

## Application Overview

### Project Details
- Application Name: [name]
- Purpose: [description]
- Production URL: [URL]
- Repository: [Git URL]
- Documentation: [Wiki/Docs URL]

### Technology Stack
- Frontend Framework: [React/Vue/Svelte]
- Backend: [Node/Python/None]
- Build Tool: [Vite/Webpack/Next.js]
- Package Manager: [npm/yarn/pnpm]
- TypeScript: [Yes/No], Strict mode: [Yes/No]
- UI Framework: [Material-UI/Tailwind/Chakra]
- State Management: [Redux/Zustand/Context]

## Development Workflow

### Local Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Linting and formatting
npm run lint
npm run format
```

### Development Standards
- Code style: ESLint + Prettier
- Commit hooks: Husky + lint-staged
- Branch protection: PR reviews required
- Semantic commits: feat:, fix:, docs:, etc.

## Component Architecture

### Component Organization
```
src/
├── components/
│   ├── common/       # Reusable components
│   ├── features/     # Feature-specific components
│   ├── layouts/      # Layout components
│   └── pages/        # Page-level components
├── hooks/            # Custom React hooks
├── services/         # API clients, utilities
├── state/            # State management
├── styles/           # Global styles
├── types/            # TypeScript types
└── utils/            # Helper functions
```

### Component Patterns
- Functional components with hooks
- Props validation: PropTypes or TypeScript
- Compound components for complex UIs
- Headless UI patterns for accessibility
- Composition over inheritance

## Styling Strategy

### CSS Approach
- Method: [CSS Modules/Tailwind/Styled Components]
- Dark mode: [Supported/Not supported]
- Responsive design: Mobile-first
- Design system: [link to guidelines]

### Theming
- Colors: Defined in theme config
- Typography: Standardized font scales
- Spacing: 8px base unit system
- Breakpoints: [mobile, tablet, desktop]

## State Management

### State Architecture
- Global state: [Redux/Zustand/Context]
- Local component state: useState
- Form state: [React Hook Form/Formik]
- API state: [React Query/SWR]
- URL state: React Router

### Example Redux Structure
```javascript
// Minimal Redux setup
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import appReducer from './slices/appSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    app: appReducer,
  },
});
```

## API Integration

### Backend Communication
- API Base URL: [configured by environment]
- Authentication: [JWT/cookies/OAuth]
- Request interceptors: Add auth headers, logging
- Response interceptors: Error handling, token refresh
- Error handling: User-friendly messages, retry logic

### API Client Setup
```javascript
// Example with fetch or axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Form Handling

### Form Libraries
- Library: [React Hook Form/Formik]
- Validation: [Zod/Yup]
- Field components: [Controlled/Uncontrolled]
- Async validation: Debounced API calls

### Form Example
```javascript
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function LoginForm() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      <input {...register('password')} type="password" />
      <button type="submit">Login</button>
    </form>
  );
}
```

## Performance Optimization

### Code Splitting
- Route-based code splitting with React.lazy
- Dynamic imports for heavy libraries
- Build analysis: `npm run build:analyze`

### Image Optimization
- Format: WebP with PNG fallback
- Sizing: Responsive images with srcset
- Lazy loading: IntersectionObserver or native
- CDN: [CloudFront/Imgix/etc]

### Bundle Optimization
- Tree-shaking: Enabled in production
- Minification: Automatic
- Asset compression: gzip/brotli
- Target bundle size: < 100KB (gzipped)

## Testing

### Unit Tests
- Framework: [Jest/Vitest]
- Coverage target: > 80%
- Snapshot testing: For components
- Mocking: MSW for API mocking
- Command: `npm run test`

### Component Tests
```javascript
import { render, screen } from '@testing-library/react';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  test('renders login form', () => {
    render(<LoginForm />);
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    const { user } = render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    // Assert submission behavior
  });
});
```

### E2E Tests
- Framework: [Cypress/Playwright]
- Scenarios: Critical user paths
- Environment: Staging + Production
- Command: `npm run test:e2e`

### Visual Regression Testing
- Tool: [Percy/Chromatic]
- Triggers: On PR
- Baseline updates: Manual approval

## Accessibility (a11y)

### WCAG Compliance
- Level: [A/AA/AAA]
- Keyboard navigation: Full support
- Screen reader: ARIA labels where needed
- Color contrast: [WCAG AA standards]
- Focus management: Clear visible focus

### Testing
```javascript
import { axe, toHaveNoViolations } from 'jest-axe';

test('has no a11y violations', async () => {
  const { container } = render(<YourComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Internationalization (i18n)

### Multi-language Support
- Library: [i18next/react-intl]
- Language files: [JSON/YAML]
- Translations: [language folder structure]
- Date/Time formatting: Locale-aware
- Currency: Locale-specific formatting

## Browser Support

### Target Browsers
- Chrome: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Edge: Latest 2 versions
- Mobile: iOS Safari 13+, Chrome for Android

### Polyfills
- Need polyfills for: [list]
- Bundling: Conditional loading

## Build & Deployment

### Build Configuration
```bash
# Development build
npm run build:dev    # With source maps

# Production build
npm run build:prod   # Optimized, minified

# Staging build
npm run build:staging
```

### Deployment Targets
- Hosting: [Vercel/Netlify/AWS/etc]
- CDN: [for static assets]
- Domain: [production domain]
- SSL/TLS: Automatic renewal

### Environment Variables
```
REACT_APP_API_URL=https://api.example.com
REACT_APP_ENVIRONMENT=production
REACT_APP_LOG_LEVEL=info
```

## Monitoring & Analytics

### Logging
- Format: JSON to console/service
- Levels: DEBUG, INFO, WARN, ERROR
- Include: timestamp, component, user ID, action

### Analytics
- Tool: [Google Analytics/Mixpanel/Segment]
- Events: Page views, user actions, errors
- Custom metrics: Business KPIs
- Privacy: Respect user preferences

### Error Tracking
- Tool: [Sentry/Rollbar]
- Configuration: Auto-capture unhandled errors
- Source maps: Uploaded to service
- Alerting: On high error rates

## Security

### Input Validation
- Sanitize all user inputs
- Validate on both client and server
- Prevent XSS: Use textContent over innerHTML
- CSRF protection: Token validation

### Dependencies
- Audit: `npm audit` regularly
- Updates: [weekly/monthly] security patching
- Dependency scanning: SonarQube, Snyk
- Lock file: Committed to git

### Authentication
- Tokens: Stored securely (not localStorage)
- Refresh tokens: HTTPOnly cookies
- Logout: Clear all session data
- Session timeout: [duration]

## SEO Optimization

### Meta Tags
- Title: Descriptive, under 60 characters
- Description: Under 160 characters
- OG tags: For social sharing
- Canonical URLs: Prevent duplicates

### Sitemap & Robots
- Sitemap: [generated/manual]
- Robots.txt: [indexed/excluded paths]
- Structured data: Schema.org markup

### Performance for SEO
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Mobile-friendly: Responsive design
- Page speed: Target < 3s load time

## Documentation

### Code Documentation
- README: Setup and contribution guide
- Storybook: Component catalog
- API docs: Endpoint documentation
- Contributing guide: For external contributors

## Troubleshooting

### Common Issues
- White screen: Check console errors, network tab
- State not updating: Check Redux devtools
- API calls failing: Verify CORS, auth tokens
- Performance slow: Use React DevTools profiler

### Debug Commands
```bash
# Debug build
npm run build:debug

# Generate bundle analysis
npm run build:analyze

# Check dependencies
npm ls [package-name]

# Clear cache
rm -rf node_modules package-lock.json && npm install
```

## Integration with Claude Flow V3

### Swarm for Development
- Spawn agents: For refactoring, testing, bug fixes
- Topology: Hierarchical for coordinated changes
- Memory: Store component patterns, tested patterns

### Auto-Testing with Hooks
- Post-commit: Run tests on changed files
- Post-edit: Generate tests for new components
- Pre-deployment: Full test suite

### Performance Optimization Agent
- Auto-suggest: Code splitting opportunities
- Monitor: Bundle size, load times
- Optimize: Image sizing, caching headers

---
**Template Version**: 1.0
**Last Updated**: 2026-01-22
**Maintained By**: [Your Team]
```

## When to Use This Template

- Building React/Next.js applications
- Creating dashboards and admin panels
- Developing SPAs with complex state
- Creating marketplace or B2B applications

## Customization Examples

**For E-commerce**: Add product catalog patterns, cart management, payment processing

**For Admin Dashboard**: Add RBAC implementation, bulk operations, data export features

**For Social Platform**: Add real-time updates, notification systems, user authentication

**For Data Visualization**: Add charting libraries, real-time data updates, export capabilities

