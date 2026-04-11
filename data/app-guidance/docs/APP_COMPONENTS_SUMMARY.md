# Project Nyra - App & Webapp Components Inventory

**Research Date**: 2026-01-18
**Researcher**: Claude Sonnet 4.5

## Executive Summary

Project Nyra contains **6 complete frontend applications**, **4 backend API services**, **1 tool application**, **2 duplicate/scattered components**, and **8 incomplete placeholder directories**.

## Complete Applications

### 1. Mortgage Assistant
- **Path**: `C:\Dev\Projects\Repos\Project-Nyra\apps\mortgage-assistant`
- **Type**: Frontend (Next.js 14, React 18, TypeScript)
- **Description**: Loan Officer Dashboard for mortgage management
- **Status**: ✅ Complete
- **Key Features**: Document management, calendar, recharts visualization

### 2. Nexus Dashboard
- **Path**: `C:\Dev\Projects\Repos\Project-Nyra\apps\nexus-dashboard`
- **Type**: Frontend (Next.js 15, React 19, TypeScript)
- **Port**: 3005
- **Description**: AI Orchestration Platform Monitoring Interface
- **Status**: ✅ Complete
- **Key Features**: Terminal integration (xterm), Tailwind v4 with OKLCH colors

### 3. Nyra Admin
- **Path**: `C:\Dev\Projects\Repos\Project-Nyra\apps\nyra-admin`
- **Type**: Frontend (Vite, React 19, TypeScript)
- **Port**: 3101
- **Description**: Internal operations dashboard
- **Status**: ✅ Complete
- **Tech**: React Router, TanStack Query, Axios

### 4. RateHunter
- **Path**: `C:\Dev\Projects\Repos\Project-Nyra\apps\ratehunter`
- **Type**: Frontend (Next.js 15, React 19, TypeScript)
- **Port**: 3100
- **Description**: Public mortgage rate comparison platform
- **Status**: ✅ Complete
- **Tech**: TanStack Query, React Hook Form, Zod

### 5. RateHunter Landing
- **Path**: `C:\Dev\Projects\Repos\Project-Nyra\apps\ratehunter-landing`
- **Type**: Frontend (Next.js 14, React 18, TypeScript)
- **Description**: Marketing landing page
- **Status**: ✅ Complete
- **Tech**: Simple Next.js setup with Zod validation

### 6. Webapp (Monorepo)
- **Path**: `C:\Dev\Projects\Repos\Project-Nyra\apps\webapp`
- **Type**: Fullstack Workspace (pnpm workspaces)
- **Description**: Mortgage Services and UI umbrella
- **Status**: ✅ Complete
- **Sub-apps**:
  - `mortgage-ui` - Next.js 15, shadcn/ui
  - `mortgage-services` - Next.js 15

## Backend API Services

### 1. Auth Service
- **Path**: `C:\Dev\Projects\Repos\Project-Nyra\services\auth-service`
- **Tech**: Express, TypeScript, MongoDB, Redis
- **Features**: JWT, OAuth (Google, Microsoft), 2FA, rate limiting
- **Status**: ✅ Complete

### 2. Nexus Router
- **Path**: `C:\Dev\Projects\Repos\Project-Nyra\services\nexus-router`
- **Tech**: Express, TypeScript, WebSocket
- **Port**: 8000
- **Features**: LLM request routing, local GPU to cloud fallback
- **Status**: ✅ Complete

### 3. RateHunter API
- **Path**: `C:\Dev\Projects\Repos\Project-Nyra\services\ratehunter-api`
- **Tech**: Express, TypeScript, Prisma, PostgreSQL
- **Features**: Rate quotes, lead capture, Swagger docs
- **Status**: ✅ Complete

### 4. Mortgage Assistant API
- **Path**: `C:\Dev\Projects\Repos\Project-Nyra\services\mortgage-assistant-api`
- **Tech**: Express, TypeScript, Prisma
- **Features**: Loan management, Twilio integration, document handling
- **Status**: ✅ Complete

## Tools

### Archon UI
- **Path**: `C:\Dev\Projects\Repos\Project-Nyra\tools\archon\archon-ui-main`
- **Type**: Knowledge Management System
- **Tech**: Vite, React 18, TanStack Query, TypeScript
- **Port**: 3737
- **Features**: RAG search, document processing, MCP integration
- **Status**: ✅ Complete and actively maintained

## Scattered/Duplicate Components

### 1. RateHunter Web (Duplicate)
- **Path**: `C:\Dev\Projects\Repos\Project-Nyra\assets\new-uploads-ingestion-input\project-nyra\apps\ratehunter-web`
- **Status**: ⚠️ Older version (Next.js 14, React 18)
- **Relationship**: Older duplicate of `apps/ratehunter`
- **Action**: Archive or remove

### 2. RateHunter API (Alternative)
- **Path**: `C:\Dev\Projects\Repos\Project-Nyra\assets\new-uploads-ingestion-input\project-nyra\apps\ratehunter-api`
- **Status**: ⚠️ Different implementation (NestJS + TypeORM vs Express + Prisma)
- **Relationship**: Alternative implementation of `services/ratehunter-api`
- **Action**: Consolidate or archive

## Incomplete/Placeholder Directories

The following directories exist but lack implementation:

1. **apps/crm** - Only .env and CLAUDE.md
2. **apps/crm-dashboard** - Only CLAUDE.md and .claude-flow
3. **apps/landing** - Only .env.local
4. **apps/shadcn-tweakcn** - CSS/SVG files only
5. **apps/docs** - Empty
6. **apps/data** - Empty
7. **apps/assets** - Empty
8. **apps/ingestion** - Transient (created during research)

**Recommendation**: Remove or complete these directories

## Tech Stack Analysis

### Frontend Frameworks
- **Next.js 14**: mortgage-assistant, ratehunter-landing
- **Next.js 15**: nexus-dashboard, ratehunter, webapp (mortgage-ui, mortgage-services)
- **Vite + React**: nyra-admin, archon-ui-main

### React Versions
- **React 18**: mortgage-assistant, ratehunter-landing, archon-ui-main
- **React 19**: nexus-dashboard, nyra-admin, ratehunter

### Backend Frameworks
- **Express**: auth-service, nexus-router, ratehunter-api, mortgage-assistant-api
- **NestJS**: ratehunter-api (duplicate/alternative)

### State Management
- **Zustand**: mortgage-assistant, nexus-dashboard
- **TanStack Query**: nexus-dashboard, nyra-admin, ratehunter, archon-ui-main

## Consolidation Recommendations

1. **Archive Duplicates**: Move `assets/new-uploads-ingestion-input/project-nyra/apps/*` to `_archive/`
2. **Clean Placeholders**: Remove or complete incomplete directories in `apps/`
3. **Standardize Versions**: Consider upgrading all to Next.js 15 and React 19
4. **Monorepo Strategy**: Evaluate extending webapp workspace to include other apps
5. **API Consolidation**: Consider unified services/ structure with consistent patterns

## File Locations

- **Full JSON Inventory**: `C:\Dev\Projects\Repos\Project-Nyra\apps\ingestion\docs\APP_COMPONENTS_INVENTORY.json`
- **This Summary**: `C:\Dev\Projects\Repos\Project-Nyra\apps\ingestion\docs\APP_COMPONENTS_SUMMARY.md`
