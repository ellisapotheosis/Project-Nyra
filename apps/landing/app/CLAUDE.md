# RateHunter Landing Page - Archon OS Configuration

> **Public-facing mortgage rates landing and lead capture engine**
>
> **Inherits from**: `apps/landing/CLAUDE.md`
> **Stack**: Next.js 15, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui
> **Port**: 3001
> **Type**: SSG/SSR Landing Page (public facing)
> **Users**: Prospective borrowers, rate shoppers, marketing leads

---

## APPLICATION CONTEXT

### Purpose
RateHunter Landing is the public-facing entry point for the mortgage platform. It showcases competitive rates, educates borrowers, and captures high-quality leads through optimized conversion funnels.

---

## INTEGRATION POINTS

### Quote Engine API
- **Endpoint**: `http://localhost:8001/rates`
- **Updates**: Real-time via WebSocket

### Memory System
- **Rate Trends**: RuVector for rate history search
- **Lead Scoring**: Letta for lead quality assessment

---

## RELATED DOCUMENTATION

- **Parent CLAUDE.md**: `apps/landing/CLAUDE.md`
- **Apps CLAUDE.md**: `apps/CLAUDE.md`
- **Root CLAUDE.md**: `/CLAUDE.md`

---

## ARCHON OS INTEGRATION

### Key Agents for This App
- **frontend-specialist**: Next.js page and component development
- **performance-optimizer**: Core Web Vitals optimization
- **seo-specialist**: Meta tags, structured data, sitemap

### Recommended Swarm Configuration
```bash
archon workflow run frontend-dev "Implement new landing page section"
```

---

**Profile**: ratehunter-landing
**Generated**: 2026-04-08
