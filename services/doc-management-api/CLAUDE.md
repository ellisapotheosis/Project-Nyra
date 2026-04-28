# Document Management API

> **AI-Powered Document Processing with OCR, Versioning & Search**
>
> Comprehensive document management system for mortgage document workflows

## 🏠 PROJECT CONTEXT

**Service**: Document Management API
**Purpose**: Process, extract, version, and search mortgage-related documents with OCR and eSignature support
**Tech Stack**: Express.js, TypeScript, PostgreSQL (Sequelize), AWS S3, Tesseract OCR, ElasticSearch, DocuSign
**Port**: 3002
**Domain**: Part of Project Nyra 4-PC mortgage automation platform

## 🤖 INTELLIGENT 3-TIER MODEL ROUTING (ADR-026)

**The routing system has 3 tiers for optimal cost/performance:**

| Tier | Handler | Latency | Cost | Use Cases |
|------|---------|---------|------|-----------|
| **1** | Local Small (Qwen 32B) | <1ms | $0 | Simple transforms |
| **2** | Local Large (DeepSeek R1) | ~500ms | $0.0002 | Bug fixes, validation |
| **3** | Sonnet/Opus | 2-5s | $0.003-$0.015 | OCR logic, complex design |

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
services/doc-management-api/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── types/
│   └── utils/
├── tests/
├── config/
├── docs/
└── migrations/
```

---

## 🚀 Deployment & CI/CD

Environment Variables Required:
- `PORT=3002`
- `DATABASE_URL` - PostgreSQL connection
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` - S3 credentials
- `JWT_SECRET` - Token signing

---

## Support & Resources

- **Project Nyra**: `CLAUDE.md` in root

---

*Last Updated: 2026-04-08*
*Type: API Service Configuration*
