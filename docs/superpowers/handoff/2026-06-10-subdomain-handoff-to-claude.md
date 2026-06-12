# Subdomain Exposure & Tailscale Remediation: Handoff Prompt for Claude Code

**File Location**: `docs/superpowers/handoff/2026-06-10-subdomain-handoff-to-claude.md`  
**Instructions for Claude Code**: Copy the full text below and paste it directly into a new Claude Code session.

---

````markdown
# TASK: Complete Project Nyra Subdomain and Access Policy Exposure Remediation

We need to finalize the subdomain updates and Cloudflare Access Applications configuration across the Project Nyra network. The design, architecture, and task plan have already been thoroughly completed and pre-written.

### Reference Documents:

1. Master Design Specification: `docs/superpowers/specs/2026-06-10-subdomain-remediation-design.md`
2. Master Implementation Plan: `docs/superpowers/plans/2026-06-10-subdomain-remediation-plan.md`

### Completed So Far:

- [x] Refined `infra/cloudflare/desired-state/exposure-matrix.yml` with public/private Tailscale splits.
- [x] Pre-wrote `infra/cloudflare/generated-remote/oracle-tunnel.config.payload.json` with correct public ingress rules, including mapping `composio.projectnyra.com` to `http://localhost:2700`.
- [x] Pre-wrote `infra/cloudflare/generated-remote/orchestrator-tunnel.config.payload.json` with Linkwarden-only ingress.
- [x] Pre-wrote `infra/cloudflare/generated-remote/dns-records.desired.json` with CNAME proxy mapping and 17 private Tailscale subdomains grey-clouded pointing to `100.64.x.y` IPs.
- [x] Overwrote `infra/cloudflare/apply-access-apps.sh` to leverage the correct Cloudflare Access Group IDs (Group 1: `6290c676-cb4b-4482-a87e-fe048d4cab8a`, Group 2: `04f027b4-5377-4a95-821c-fc76ed97e177`, Group 3: `0e6f3dd6-61ac-4bc1-aa94-044d21215128`) instead of hardcoded emails.
- [x] Ran `apply-cloudflare-desired-state.sh` successfully, fully updating all 26 DNS records and applying active tunnel config payloads (verified 100% success).

---

### YOUR TASKS:

1. **Apply Cloudflare Access Applications Configuration**:
   - Run the updated Access application script to create or update the public self-hosted access rules mapping exactly to your three Access Group IDs:
     ```bash
     bash infra/cloudflare/apply-access-apps.sh
     ```
   - Verify that the terminal logs show 100% successes and 0 failures for the upsert operation.

2. **Verify Configuration Files**:
   - Review `git status` and make sure all changes match the pre-written files exactly as documented in `docs/superpowers/specs/2026-06-10-subdomain-remediation-design.md`.

3. **Status Verification**:
   - Run a `git diff` to make sure there are no syntax errors or invalid formatting inside any of the modified JSON, YAML, or Bash files.
   - Run `git status` to confirm everything is consistent.

4. **Commit Changes**:
   - After confirming everything is clean and all scripts run successfully, commit the modifications using a structured commit message following project conventions:
     ```bash
     git add docs/superpowers/specs/2026-06-10-subdomain-remediation-design.md \
             docs/superpowers/plans/2026-06-10-subdomain-remediation-plan.md \
             infra/cloudflare/desired-state/exposure-matrix.yml \
             infra/cloudflare/generated-remote/oracle-tunnel.config.payload.json \
             infra/cloudflare/generated-remote/orchestrator-tunnel.config.payload.json \
             infra/cloudflare/generated-remote/dns-records.desired.json \
             infra/cloudflare/generated-remote/access-apps.desired.json \
             infra/cloudflare/apply-access-apps.sh
     git commit -m "infra: complete subdomain exposure and Tailscale Access group remediation"
     ```
````
