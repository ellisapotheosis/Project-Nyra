# Specification: Twenty CRM Integration

## Goal

Establish Twenty CRM as the system-of-record for Project Nyra.

## Key Components

1. **Twenty CRM**: Self-hosted CRM (http://localhost:3020).
2. **Custom Objects**:
   - `mortgageLead`: Core lead data, FICO, loan purpose, etc.
   - `campaign`: Drip sequence metadata.
   - `quote`: Deterministic loan options and approval state.
   - `communication`: Audit log of SMS/Email/Calls.
3. **MCP Server**: `twenty-mcp-jezweb` (Node.js) for tool-based interaction.
4. **Automation**: n8n nodes for CRM operations.

## Data Model Requirements

- Mortgage leads must capture TCPA consent.
- Compliance flags (DNC, Quiet Hours) must be respected.
- All communications must be logged with provider responses (Twilio/SendGrid).

## Success Criteria

- [x] Custom objects defined and created.
- [x] MCP server registered with Nexus Router.
- [x] n8n workflows can read/write to Twenty CRM.
- [x] Seed data (campaigns, templates) loaded.
