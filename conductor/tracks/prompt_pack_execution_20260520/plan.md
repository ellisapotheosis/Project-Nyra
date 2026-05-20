# Prompt Pack Execution Plan

## P0 - Conductor Intake

- [x] Import Z-drive prompt pack into conductor.
- [x] Preserve original 5090 DLS prompt files.
- [x] Add conductor navigation and execution track.
- [x] Build initial inventory, risk register, validation matrix, and owner-action tracker.

## P1 - Repo Truth And Prompt Canonicalization

- [x] Reconcile prompt-pack path/domain assumptions with current architecture.
- [x] Quarantine stale prompt claims without deleting source snapshots.
- [ ] Update docs to state `apps/projectnyra` and `apps/ratehunter` as canonical current app roots.
- [ ] Keep `projectnyra.com` as the platform domain and `ratehunter.net` as the isolated public landing domain.

## P2 - Backend Contract Hardening

- [ ] Finish and validate CRM API write-plan/audit boundaries.
- [ ] Finish and validate lead-ingestion normalization and dedupe behavior.
- [ ] Harden campaign/compliance/communication/quote service contracts around STOP, approval, and audit invariants.

## P3 - App Surface Execution

- [ ] Validate `apps/ratehunter` against public landing prompt requirements.
- [ ] Validate `apps/projectnyra` against internal command hub prompt requirements.
- [ ] Merge only useful legacy `apps/admin` and `apps/mortgage-crm` patterns into canonical routes when backed by services or explicit TODOs.

## P4 - Assistant, Memory, And Workflow Boundaries

- [ ] Ensure assistant-service action routing cannot directly mutate CRM/databases.
- [ ] Document OpenClaw gateway/tool approval contract.
- [ ] Confirm n8n workflow docs/contracts keep n8n execution-only.
- [ ] Confirm memory docs use Mem0/OpenMemory/Letta/FalkorDB only within approved boundaries and do not revive Graphiti/RuVector.

## P5 - Infra, Observability, Security, Release

- [ ] Validate host-scoped compose source files under `infra/hosts/`.
- [ ] Update health check and observability docs where prompt requirements are missing.
- [ ] Run secret/PII scans and document findings.
- [ ] Create or update smoke/release/rollback checklist.

## P6 - Final Verification

- [ ] Run targeted service tests.
- [ ] Run workspace smoke tests where feasible.
- [ ] Run lint/build for touched apps where feasible.
- [ ] Record blockers instead of marking unavailable external services complete.

## Prompt Queue

1. `00_conductor_master_finish_line.md`
2. `01_backup_inventory.md`
3. `02_repo_truth_cleanup.md`
4. `03_landing_ratehunter.md`
5. `04_webapp_shell_theme.md`
6. `05_admin_mortgage_crm_merge.md`
7. `06_supabase_auth_backend.md`
8. `07_twenty_crm_adapter.md`
9. `08_lead_ingestion.md`
10. `09_campaign_builder_service.md`
11. `10_compliance_service.md`
12. `11_communications_twilio_sendgrid_outlook.md`
13. `12_quote_desk_lenderprice.md`
14. `13_pipeline_applications_crm.md`
15. `14_openclaw_assistant_service.md`
16. `15_memory_stack.md`
17. `16_n8n_internal_execution.md`
18. `17_infra_orchestrator_workers.md`
19. `18_observability_health.md`
20. `19_security_secrets_pii.md`
21. `20_qa_smoke_release.md`
22. `21_docs_handoff_owner_actions.md`
23. `22_integrations_research_discovery.md`
