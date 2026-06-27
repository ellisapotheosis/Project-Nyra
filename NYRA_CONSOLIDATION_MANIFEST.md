# Project Nyra Consolidation Manifest

This manifest defines the scope of the consolidation plan for Project Nyra. Project Nyra is an AI ‑powered mortgage automation platform that separates control and compute planes【35†L5-L29】【37†L4-L8】. The goal of this consolidation is to produce a single source‑of‑truth for the current system, product surface specifications and infrastructure.

## Information Architecture

1. **Core Project Nyra repository** – Document the current repository structure, architecture overview, build/deploy surfaces and open issues. Highlight the control‑plane / compute‑plane separation【37†L4-L8】 and the monorepo layout including apps, services and packages【35†L29-L40】.
2. **RateHunter.net** – Provide standalone prompting, specifications and landing‑page work for RateHunter.net. The RateHunter landing page must capture leads, qualify them and provide instant responses【40†L5-L18】.
3. **ProjectNyra.com** – Document the broker/customer facing web application. Keep app and landing page surfaces separate from other products. This app handles secure conversational guidance and lead nurturing【47†L5-L24】.
4. **Project Nyra Landing Pages** – Maintain separate specifications for the non‑3D and 3D landing pages; do not mix the two workstreams.
5. **Development stack and orchestration** – Describe tooling (Wave Terminal / WaveAI, Zellij), container orchestrators (`vybestack/llxprt-jefe`, `vybestack/llxprt-code`), worker PCs and local LLMs (e.g., worker‑rtx5090, worker‑rtx3090ti, worker‑rtx3060) with memory and embedding notes【37†L16-L35】. Include Letta and memory orchestration.
6. **Secrets and environment management** – Compile a master `.env` register and environment variable inventory. Describe Infisical setup and free‑plan‑safe capabilities, including agent vault, local proxies, secret scanning and PAM. Record fallbacks and limits.

## Consolidation Deliverables

- A master manifest (this document).
- A source‑of‑truth architecture whitepaper summarizing the control‑plane / compute‑plane design, node roles and memory model【37†L4-L8】【37†L16-L35】.
- A specs pack split by product surface (RateHunter.net requirements【40†L10-L24】, Project Nyra webapp responsibilities【47†L5-L24】 and backend services).
- A stack/infrastructure reference detailing topology, deployment patterns, networking model and operations guidelines【35†L11-L29】【38†L16-L20】.
- A secrets and Infisical reference summarizing secure management practices.
- A delta list describing what remains to be implemented in the repository (missing services, incomplete landing pages, environment templates, etc.).