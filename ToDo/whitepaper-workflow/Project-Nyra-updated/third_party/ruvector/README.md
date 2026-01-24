# Nyra: RuVector + TwentyCRM + Lead Ingestion + RAM Budget (Starter Pack)

Copy these files into your Project-Nyra repo to bootstrap:
- RuVector-Postgres hosting for both TwentyCRM + Nyra AI (separate DBs)
- Lead ingestion source coverage (email + API + leadmailbox + forms)
- A practical 16GB orchestrator RAM profile

Contents:
- docs/NYRA-RUVECTOR-TWENTYCRM-INTEGRATION.md
- docs/NYRA-LEAD-INGESTION-SOURCES.md
- docs/NYRA-RAM-BUDGET-16GB.md
- infra/docker/overlays/compose.ruvector-postgres.yml
- infra/docker/init/00-create-dbs.sql
- scripts/init-ruvector.ps1
- scripts/init-ruvector.sh
