# Mortgage Assistant API - Archon OS Configuration

> **AI-Powered Mortgage Assistance Core Application Backend**
>
> Central mortgage processing engine for lead qualification, quote generation, and borrower communication

## 🏠 PROJECT CONTEXT

**Service**: Mortgage Assistant API (Core Backend)
**Purpose**: Central mortgage processing engine handling lead qualification, loan calculation, document collection, and borrower communication
**Tech Stack**: Express.js, TypeScript, Prisma ORM, PostgreSQL, Redis, Nodemailer, Twilio
**Port**: 3001 (configured in docker-compose)
**Domain**: Part of Project Nyra 4-PC mortgage automation platform

## 🚨 AUTOMATIC ORCHESTRATION

**When starting work on complex tasks, Claude Code MUST automatically:**

1. **Use Archon workflows** via CLI or UI
2. **Coordinate via memory**

**Archon OS handles the heavy lifting of task execution!**

---

## 🤖 INTELLIGENT 3-TIER MODEL ROUTING (ADR-026)

**The routing system has 3 tiers for optimal cost/performance:**

| Tier | Handler | Latency | Cost | Use Cases |
|------|---------|---------|------|-----------|
| **1** | Local Small (Qwen 32B) | <1ms | $0 | Simple transforms |
| **2** | Local Large (DeepSeek R1) | ~500ms | $0.0002 | Bug fixes, validation |
| **3** | Sonnet/Opus | 2-5s | $0.003-$0.015 | Loan algorithms, compliance |

---

## 🧠 AUTO-LEARNING PROTOCOL

### Before Starting Any Task
- Search memory for relevant patterns in Letta.

### After Completing Any Task Successfully
- Store successful patterns in Letta.
- Record completion metrics in Archon.

---

## 🚀 Archon OS CLI Commands

```bash
archon workflow list
archon workflow run [name] "[task]"
archon status
```

---

## 📁 File Organization Rules

```
services/mortgage-assistant-api/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   ├── types/
│   ├── utils/
│   ├── routes/
│   └── index.ts
├── prisma/
├── tests/
├── docs/
└── config/
```

---

## 🚀 Deployment & CI/CD

Environment Variables Required:
- `PORT=3001`
- `DATABASE_URL` - PostgreSQL with Prisma format
- `REDIS_HOST`, `REDIS_PORT` - Redis cache
- `JWT_SECRET` - Token signing

---

## Support & Resources

- **Project Nyra**: `CLAUDE.md` in root
- **Archon UI**: http://localhost:3737

---

*Last Updated: 2026-04-08*
*Type: API Service Configuration*
