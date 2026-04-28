# Rate Comparison Engine

> **Automated Mortgage Rate Scraping, Caching & Comparison**
>
> Real-time mortgage rate collection, caching, and comparison with alerts

## 🏠 PROJECT CONTEXT

**Service**: Mortgage Rate Comparison Engine
**Purpose**: Continuously scrape mortgage rates from lenders, maintain cached rates, enable comparison, and alert on rate changes
**Tech Stack**: Express.js (JavaScript), PostgreSQL, Redis, Web Scraping (Axios, Cheerio), Node-Cron, Bull Queue
**Port**: 3003
**Domain**: Part of Project Nyra 4-PC mortgage automation platform

## 🤖 INTELLIGENT 3-TIER MODEL ROUTING (ADR-026)

**The routing system has 3 tiers for optimal cost/performance:**

| Tier | Handler | Latency | Cost | Use Cases |
|------|---------|---------|------|-----------|
| **1** | Local Small (Qwen 32B) | <1ms | $0 | Simple transforms |
| **2** | Local Large (DeepSeek R1) | ~500ms | $0.0002 | Scraper tweaks |
| **3** | Sonnet/Opus | 2-5s | $0.003-$0.015 | Scraper design, algorithm optimization |

---

## 🧠 AUTO-LEARNING PROTOCOL

### Before Starting Any Task
- Search memory for relevant patterns in Letta.

### After Completing Any Task Successfully
- Store successful patterns in Letta.
- Record completion metrics in structured service logs.

---

## 📁 File Organization Rules

```
services/rate-comparison-engine/
├── src/
│   ├── services/
│   │   ├── scraper/
│   │   ├── comparison/
│   │   └── alert/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── utils/
│   └── server.js
├── migrations/
├── tests/
├── docs/
└── config/
```

---

## 🚀 Deployment & CI/CD

Environment Variables Required:
- `PORT=3003`
- `DB_HOST`, `DB_PORT`, `DB_NAME` - PostgreSQL
- `REDIS_HOST`, `REDIS_PORT` - Redis cache

---

## Support & Resources

- **Project Nyra**: `CLAUDE.md` in root

---

*Last Updated: 2026-04-08*
*Type: API Service Configuration*
