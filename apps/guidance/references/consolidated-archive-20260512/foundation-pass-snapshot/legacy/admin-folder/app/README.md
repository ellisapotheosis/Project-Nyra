# Nyra Admin Dashboard

> **Advanced Administrative Interface for Mortgage Operations**

## 🎯 Overview

The Nyra Admin Dashboard is a production-ready administrative interface for mortgage operations featuring real-time data, comprehensive authentication, and advanced quote management capabilities. Built with Next.js 15, TypeScript, and modern UI components.

## ✨ Features Completed

### Phase 1 - Foundation ✅ COMPLETED
- ✅ **Authentication-ready layout** with sidebar navigation
- ✅ **Dashboard overview** with key metrics and activity
- ✅ **Lead management** interface with scoring and filtering
- ✅ **Quote desk** with real-time rates and management
- ✅ **Responsive design** with mobile support
- ✅ **Dark theme** consistent with Nyra branding

### Phase 2 - Advanced Features ✅ COMPLETED
- ✅ **JWT Authentication System** with role-based permissions
- ✅ **Real-time WebSocket Integration** for live rate updates
- ✅ **Advanced Quote Generator** with mortgage calculations
- ✅ **Enhanced UI Components** (forms, tabs, selects, inputs)
- ✅ **User Profile Management** with role-based access control
- ✅ **Real-time Notifications** system

## 🎛️ Core Features

### Authentication & Security
- **JWT-based Authentication** with refresh token rotation
- **Role-based Access Control** (Admin, Loan Officer, Processor, Underwriter)
- **Permission-based Feature Gates** for secure operations
- **Session Management** with automatic token refresh
- **Demo Credentials** for testing

### Real-time Data
- **Live Rate Updates** via WebSocket connections
- **Real-time Notifications** for system events
- **Connection Status Monitoring** with automatic reconnection
- **Rate Change Alerts** with visual indicators

### Quote Management
- **Interactive Quote Generator** with multi-step forms
- **Mortgage Payment Calculations** with accurate formulas
- **Real-time Rate Integration** from live data feeds
- **Quote Status Tracking** (Active, Locked, Expired)
- **Advanced Search & Filtering** capabilities

### User Experience
- **Responsive Design** optimized for desktop and mobile
- **Dark Theme** with Nyra brand colors (cyan/violet gradients)
- **Loading States** and error handling
- **Accessibility Features** with ARIA labels and keyboard navigation

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# View at http://localhost:3008
```

## 🔐 Demo Authentication

The dashboard includes demo authentication with the following test accounts:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | `admin@nyra.com` | `admin123` | Full system access |
| **Loan Officer** | `lo@nyra.com` | `lo123` | Lead & quote management |
| **Processor** | `processor@nyra.com` | `processor123` | Limited processing access |

## 📱 Core Pages

### Dashboard (`/`)
- **Real-time Metrics** - Leads, quotes, pipeline value, conversion rates
- **Activity Feed** - Recent system activity and notifications
- **System Alerts** - Important warnings and status updates
- **Quick Actions** - Rapid access to common tasks

### Leads Management (`/leads`)
- **Lead Scoring** with A/B/C/D grading system
- **Advanced Filtering** by status, source, score, location
- **Contact Management** with click-to-call/email functionality
- **TwentyCRM Integration** (API endpoints ready)

### Quote Desk (`/quotes`)
- **Live Rate Display** with real-time updates via WebSocket
- **Interactive Quote Generator** with mortgage calculations
- **Quote Status Management** (Active, Locked, Expired)
- **Rate Lock Tracking** with expiration alerts
- **Export Capabilities** for quote data

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router & React 19
- **Language**: TypeScript 5.5 with strict configuration
- **Styling**: Tailwind CSS 3.4 + shadcn/ui components
- **State Management**: React Query (TanStack) + Context API
- **UI Components**: Radix UI primitives with custom styling
- **Icons**: Lucide React with mortgage-specific iconography
- **WebSockets**: Socket.io-client for real-time communications

### API Integration
- **Authentication API** - JWT-based auth with role permissions
- **Real-time WebSocket** - Live data updates and notifications
- **Nexus Router Integration** - API gateway for microservices (ready)
- **TwentyCRM Integration** - Lead management API (endpoints ready)

### Security Features
- **JWT Token Management** with automatic refresh
- **Role-based Permissions** system with fine-grained controls
- **Input Validation** with Zod schema validation
- **XSS Protection** with secure headers and content policies
- **CSRF Protection** with token validation

## 🏗️ Architecture & File Structure

### Project Structure
```
src/
├── app/                         # Next.js 15 App Router
│   ├── api/auth/               # Authentication API endpoints
│   │   ├── login/route.ts      # JWT login with role permissions
│   │   ├── logout/route.ts     # Session termination
│   │   ├── refresh/route.ts    # Token refresh mechanism  
│   │   └── me/route.ts         # Current user profile
│   ├── layout.tsx              # Root layout with auth provider
│   ├── page.tsx                # Dashboard with real-time metrics
│   ├── leads/page.tsx          # Advanced lead management
│   ├── quotes/page.tsx         # Real-time quote desk
│   └── globals.css             # Global styles & CSS variables
├── components/
│   ├── auth/                   # Authentication components
│   │   └── LoginForm.tsx       # Secure login with validation
│   ├── layout/                 # Layout & navigation
│   │   ├── ClientWrapper.tsx   # Auth-aware layout wrapper
│   │   ├── Header.tsx          # Enhanced header with user menu
│   │   └── Sidebar.tsx         # Navigation with role-based items
│   └── ui/                     # shadcn/ui components
│       ├── button.tsx          # Custom button variants
│       ├── card.tsx            # Card component with variants
│       ├── input.tsx           # Form input component
│       ├── label.tsx           # Accessible form labels
│       ├── select.tsx          # Advanced select component
│       └── tabs.tsx            # Tabbed interface component
├── contexts/
│   └── AuthContext.tsx         # Authentication state management
├── hooks/
│   └── useWebSocket.ts         # Real-time WebSocket connections
└── lib/
    └── auth.ts                 # JWT service & role management
```

### Key Integration Points
- **Nexus Router** (Port 6000) - API gateway for microservices
- **TwentyCRM** (Port 3020) - Lead and contact management (ready)
- **WebSocket Hub** (WS Port 6000) - Real-time data streams
- **Quote Engine** - Live mortgage rate calculations
- **Authentication Service** - JWT with role-based permissions

## 🎨 Design System

### Color Palette (Nyra Brand)
```css
/* Primary Colors */
--cyan-500: #06b6d4       /* Primary actions, links */
--violet-500: #8b5cf6     /* Secondary highlights */

/* Background Colors */
--slate-950: #020617      /* Primary background */
--slate-900: #0f172a      /* Card backgrounds */
--slate-800: #1e293b      /* Border colors */

/* Text Colors */
--slate-100: #f1f5f9      /* Primary text */
--slate-400: #94a3b8      /* Secondary text */
```

### Component Variants
- **Buttons**: Primary (cyan), Secondary (slate), Ghost, Outline, Gradient
- **Cards**: Default, Glass (translucent), Gradient, Solid
- **Status Badges**: Color-coded by status/grade (A/B/C/D leads)

## 📊 Data Flow

### API Integration (via Nexus Router)
```typescript
// All API calls proxy through Nexus Router
const API_BASE = 'http://localhost:6000'

// Core endpoints
/api/twenty/leads          // TwentyCRM lead management
/api/quotes/generate       // Quote engine
/api/campaigns/list        // n8n campaign management
/api/audit/logs           // Compliance tracking
```

### Real-time Updates
```typescript
// WebSocket connection for live data
const WS_URL = 'ws://localhost:6000/ws'

// Subscriptions
- Rate updates every 30 seconds
- Lead notifications in real-time
- Campaign metrics live updates
- System alerts and notifications
```

## 🔧 Development

### Commands
```bash
npm run dev              # Development server (port 3008)
npm run build           # Production build
npm run start           # Production server
npm run lint            # ESLint checking
npm run type-check      # TypeScript validation
```

### Environment Variables
```bash
# .env.local
NEXUS_ROUTER_URL=http://localhost:6000
TWENTY_CRM_URL=http://localhost:3020
WEBSOCKET_URL=ws://localhost:6000/ws
```

### Adding New Features
1. Create page components in `src/app/[feature]/page.tsx`
2. Add navigation items to `src/components/layout/Sidebar.tsx`
3. Update TypeScript types in `src/lib/utils.ts`
4. Follow the existing component patterns and styling

## 🧪 Testing Strategy

### Planned Testing
- **Unit Tests**: Component behavior and utility functions
- **Integration Tests**: API integration and data flow
- **E2E Tests**: Complete user workflows (lead → quote → application)
- **Accessibility Tests**: WCAG 2.1 AA compliance

## 📈 Performance Targets

### Metrics Goals
- **First Contentful Paint**: < 1.2s
- **Largest Contentful Paint**: < 2.0s
- **Time to Interactive**: < 2.5s
- **Bundle Size**: < 500KB (gzipped)

### Optimization Strategies
- Server-side rendering for initial pages
- Code splitting by route
- Image optimization with Next.js
- WebSocket connection pooling
- Efficient re-rendering with React Query

## 🔐 Security Considerations

### Authentication (TODO)
- JWT-based authentication with refresh tokens
- Role-based access control (Admin, LO, Processor)
- Session management and timeout handling

### Data Protection
- Client-side input validation with Zod
- HTTPS-only in production
- Secure WebSocket connections (WSS)
- Rate limiting on API endpoints

## 🚀 Deployment

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Docker Support (Planned)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --only=production
COPY . .
RUN npm run build
EXPOSE 3008
CMD ["npm", "start"]
```

## 📋 Next Phase (Phase 2)

### Immediate Priorities
1. **Campaign Builder** - Visual n8n workflow editor
2. **Authentication System** - JWT + role-based access
3. **Real-time Data** - WebSocket integration
4. **Dify Chat Integration** - Embedded AI assistant
5. **Advanced Filtering** - Lead and quote filtering systems

### Integration Tasks
1. Connect to actual TwentyCRM API
2. Implement WebSocket rate updates
3. Add authentication middleware
4. Create data table components with sorting/pagination
5. Implement bulk actions for lead management

## 🤝 Contributing

### Code Style
- Use TypeScript for all new code
- Follow existing component patterns
- Maintain consistent styling with Tailwind classes
- Use semantic HTML and ARIA labels for accessibility

### Component Guidelines
- Keep components small and focused
- Use server components where possible
- Implement proper loading and error states
- Follow the established design system

---

**Status**: Phase 1 Complete ✅
**Next Milestone**: Phase 2 - Advanced Features & Integrations
**Last Updated**: 2026-03-10
