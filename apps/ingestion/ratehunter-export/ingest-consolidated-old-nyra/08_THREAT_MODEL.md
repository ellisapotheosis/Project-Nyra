# Threat Model and Risk Assessment

This document outlines potential security risks associated with the Nyra
AI‑enhanced CRM and describes high‑level mitigations.  It serves as a living
security record to guide development and operations.

## Assets

* **Customer data** – Personal information, loan details and communications
  stored in TwentyCRM (`twenty` database) and referenced by the AI service.
* **Semantic memory** – Embeddings and pattern metadata stored in `nyra_ai` via
  RuVector.  Contains distilled knowledge derived from user interactions and
  emails.
* **API keys and credentials** – Secrets for LLM providers (Anthropic,
  OpenAI, DeepSeek), lead vendor APIs, Cloudflare and Tailscale.  Managed via
  Infisical.
* **Source code and configuration** – Repository and Docker configuration
  stored on the orchestrator and workers, including AI prompts and memory
  templates.
* **Operational logs and audit trails** – Detailed logs of AI actions, lead
  ingestion events, and user interactions used for compliance and debugging.

## Threats

1. **Data breach of stored records** – Attackers could exploit vulnerabilities
   in the web UI, network or dependencies to access the `twenty` or `nyra_ai`
   databases.
2. **Prompt injection** – Malicious input (from leads, emails or chat users)
   could manipulate AI responses to leak sensitive data or perform unintended
   actions.  Because the AI model is a black box, adversaries may craft
   prompts to override system instructions.
3. **Unauthorized network access** – Misconfigured ports, open Docker
   endpoints, or poor Cloudflare/Tailscale configuration may expose services
   directly to the internet.
4. **Supply chain compromise** – Third‑party libraries or Docker images could
   contain vulnerabilities or be tampered with, granting attackers a foothold.
5. **Denial of Service (DoS)** – High volume of lead ingestion or AI requests
   could overwhelm Postgres, Redis or the LLM APIs, causing service disruption.
6. **Insider threat** – Authorized users could misuse data or AI to violate
   policies.

## Mitigations

* **Access control** – Enforce authentication and authorization for all
  services.  The AI service must call CRM APIs using the user’s permissions.
  Use JWT or session tokens when interacting with TwentyCRM and n8n flows.
* **Network segmentation** – Expose services only through Cloudflare tunnels
  with Access policies requiring SSO/MFA.  Use Tailscale for private
  administration and inter‑machine communication.  Avoid exposing Docker
  ports on public interfaces.
* **Secret management** – Store API keys in Infisical.  Inject secrets at
  runtime via `infisical run ...`.  Never commit secrets to version control.
* **Prompt sanitization** – Implement a `PromptSanitizer` that strips
  sensitive data from user inputs and context before sending to the LLM.
  Maintain a whitelist of allowed domains for external web queries.
* **Input validation** – Validate incoming lead data and email contents
  against expected schemas.  Reject or quarantine malformed or suspicious
  payloads.  Use prepared statements and ORM to guard against SQL injection.
* **Logging and auditing** – Maintain an `ai_audit_log` table capturing each
  AI request, its inputs and outputs.  Log all modifications to sensitive
  data and configuration.  Use audit trails to detect misuse or anomalies.
* **Regular updates and patching** – Track upstream vulnerability advisories
  for Node/NestJS, React, Postgres, Redis, RuVector and container images.
  Apply updates promptly and rebuild containers.  Use automated tools
  (`npm audit`, `yarn audit`, `docker scan`) to detect known CVEs.
* **Backup and recovery** – Perform regular backups of the `twenty` and
  `nyra_ai` databases and verify restoration procedures.  Use versioned
  backups stored offsite.
* **Rate limiting and quotas** – Use rate limiting on inbound lead ingestion
  and on AI requests to the LLM gateway.  Configure timeout and retry logic
  to avoid runaway loops.  Use autoscaling policies for LLM calls where
  possible.
* **Dependency auditing** – Vet all open‑source libraries and container
  images.  Pin versions in package.json and Dockerfiles.  Avoid pulling
  images from untrusted registries.

## Residual risks and future work

Despite mitigations, some residual risks remain:

* **Prompt injection zero‑days** – New prompt injection techniques may
  circumvent sanitization.  Continued research and model provider updates
  are needed.  Implement continuous monitoring of AI outputs for anomalies.
* **Advanced persistent threats** – Determined adversaries could compromise
  endpoints or social‑engineer staff.  Conduct periodic penetration tests
  and security training.
* **Privacy regulations** – Comply with evolving laws (GDPR, CCPA).  Provide
  mechanisms for data subject access requests (DSAR) and removal of
  customer data from memory stores.  Revisit retention policies regularly.

This threat model should be revisited whenever new integrations or features
are introduced.