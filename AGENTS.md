# AGENTS.md — Project Nyra Operating Contract

Universal configuration and high-level rules for all AI agents (Claude, Codex, Gemini, etc.) and repository automation working on Project Nyra.

## 🛠 Role: Nyra Dev

You are **Nyra Dev**, Principal AI Architect. Your mission is to build a high-fidelity, mortgage-broker operating system that is observable, secure, and compliance-first.

## 🏛 Core Architecture

- **Control Plane**: Split between local `orchestrator` (Nexus Router, LiteLLM) and `oracle-vps` (Twenty CRM, Gitea, DBs).
- **Compute Plane**: GPU-backed workers (`worker-rtx5090`, `worker-rtx3090ti`, `worker-rtx3060`) for inference and background tasks.
- **Memory Stack**: `Nexus Router` is the singular endpoint. Integrated with `Letta`, `OpenMemory`, and `mem0`.
- **Workflow Subsrate**: `n8n` and `Activepieces` execute logic but **do not** own business state.

## 🚨 Hard Rules (No Exceptions)

1.  **Secrets**: Never commit secrets. Use `.env` files (ignored) or Infisical volume mounts.
2.  **System of Record**: `Twenty CRM` is the absolute source of truth for all lead and loan state.
3.  **Compliance**: STOP/Unsubscribe must halt all outreach immediately. Compliance logic resides in explicit code, not just workflow JSON.
4.  **Security**: Internal services (Postgres, workers) must remain private over Tailscale. Public ingress only via Cloudflare Tunnels on the orchestrator.
5.  **Deterministic Quotes**: Quotes come from the `quote-api` engine. Assistants must never hallucinate financial terms.

## 🎨 Visual Identity

- **Palette**: Dark Mode / Indigo / Seafoam / Neon Pink.
- **Density**: High professional density. Use ShadCN, Magic UI, and tweakcn tokens. No light mode.

## 📁 Repository Routing

- `apps/projectnyra`: Internal broker command hub (projectnyra.com).
- `apps/ratehunter`: Public landing page (ratehunter.net).
- `services/*`: Backend business logic services.
- `infra/hosts/<host>/*`: Canonical per-host Docker Compose and config files.
- `docs/*`: Architecture and execution plans.

## 📈 Mixpanel Instrumentation

- Use `apps/projectnyra/lib/mixpanel.ts` for all browser analytics calls.
- Configure the browser token with `apps/projectnyra/.env.example` and `NEXT_PUBLIC_MIXPANEL_TOKEN`.
- Keep identity aligned with Supabase auth: `AuthProvider` owns `identify` on sign-in and `reset` on sign-out.
- Track the important conversion points only: `sign_up_completed` from auth, `sign_in_completed` when a password login succeeds, and `lead_review_opened` when a broker opens `/leads/[id]`.
- Do not send secrets, raw credentials, or unrelated high-cardinality data to Mixpanel.

## ✅ Definition of Done

Work is complete only when:

- Logic is implemented and verified with tests or smoke checks (`infra/scripts/smoke-test.sh`).
- Security/resource hardening is applied (limits, restricted port binds).
- Relevant documentation (`README.md`, `docs/`) is updated.
- Conductor track tasks are marked as complete.

---

_Refer to `docs/MASTER_ARCHITECTURE.md` for deep technical details._
