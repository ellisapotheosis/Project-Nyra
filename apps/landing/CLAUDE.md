# Landing Pages Parent - Archon OS Configuration

> **Marketing and lead generation landing pages**
>
> **Inherits from**: `apps/CLAUDE.md`
> **Stack**: Next.js 15/Vite, React 18-19, TypeScript 5, Tailwind CSS 4
> **Port**: 3001 (ratehunter-landing), 3000 (others)
> **Type**: SSG/Landing Pages (public facing)

## Overview

Landing Pages contains marketing-focused, public-facing landing pages for Project Nyra. This is the parent configuration document for all landing page applications.

### Landing Page Applications

| App | Port | Purpose | Stack |
|-----|------|---------|-------|
| **ratehunter-landing** | 3001 | Mortgage rate discovery landing | Next.js 15 SSG |
| Other landing pages | 3000 | Additional marketing landing pages | Vite/React |

## Archon OS Integration

### Memory-Based Development

```bash
# Search for CTA and hero patterns
archon workflow run search-patterns "hero section CTA patterns"
```

### Task Coordination

```bash
# Run a specific workflow
archon workflow run [workflow-name] "task description"
```

## References

- **Project CLAUDE.md**: `CLAUDE.md` (root)
- **Apps CLAUDE.md**: `apps/CLAUDE.md`
- **Archon UI**: http://localhost:3737

---

**Last Updated**: 2026-04-08
