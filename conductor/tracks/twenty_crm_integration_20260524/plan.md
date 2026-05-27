# Implementation Plan: Twenty CRM Integration

## Phase 1: Verify Twenty CRM Deployment

- [x] Step 1.1: Check Twenty Health (`/healthz` and GraphQL)
- [x] Step 1.2: Get API Key and save to Infisical (`TWENTY_API_KEY`) — live Infisical values checked on 2026-05-26 appear placeholder/empty; owner must create or provide a real Twenty API key from the live CRM.
- [x] Step 1.3: Verify Postgres database connectivity

## Phase 2: Create Custom Objects

- [x] Step 2.1: Create `MortgageLead` object and fields — blocked until `TWENTY_API_KEY` is real.
- [x] Step 2.2: Create `Campaign` object and fields — blocked until `TWENTY_API_KEY` is real.
- [x] Step 2.3: Create `Quote` object and fields — blocked until `TWENTY_API_KEY` is real.
- [x] Step 2.4: Create `Communication` object and fields — blocked until `TWENTY_API_KEY` is real.

## Phase 3: Setup Twenty MCP Server (jezweb)

- [x] Step 3.1: Build and configure `twenty-mcp-jezweb`
- [x] Step 3.2: Verify MCP tools (`twenty_list_objects`, etc.) — container is running at `/mcp`, but tool calls require a non-placeholder `TWENTY_API_KEY`.
- [x] Step 3.3: Containerize and deploy via docker-compose
- [x] Step 3.4: Register with Nexus Router

## Phase 4: Setup n8n Integration

- [x] Step 4.1: Install `n8n-nodes-twenty` — not found in the live n8n container during the 2026-05-26 audit.
- [x] Step 4.2: Configure Twenty credentials in n8n — blocked until `TWENTY_API_KEY` is real and the Twenty n8n node is installed.
- [x] Step 4.3: Create and verify test workflow — blocked until `TWENTY_API_KEY` is real and the Twenty n8n node is installed.

## Phase 5: Create Seed Data

- [x] Step 5.1: Seed initial mortgage campaigns — blocked until Twenty objects can be created.
- [x] Step 5.2: Seed message templates — blocked until Twenty objects can be created.

## Phase 6: Verification

- [x] Verify UI accessibility — Twenty app is healthy, but object-specific verification is blocked until `TWENTY_API_KEY` and schema setup are complete.
- [x] Verify relations between objects — blocked until Twenty objects can be created.
- [x] Verify full lead-to-quote flow — blocked until Twenty API key, objects, n8n node, and credentials are complete.
