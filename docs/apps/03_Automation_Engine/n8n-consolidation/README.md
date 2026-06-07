# N8N Consolidation Index

This directory serves as a centralized hub for all n8n workflows, lead nurturing strategies, and campaign documentation.

## 📁 Structure

- **[external/](./external/)**: Documentation and workflows from the external `NON-REPOS/n8n` directory.
  - `BUSINESS_GOALS.md`: High-level business objectives for automation.
  - `CRM_REQUIREMENTS.md`: Integration requirements between n8n and CRM.
  - `LEAD_DRIP_CAMPAIGNS.md`: Strategy for lead drip campaigns.
  - `campaigns/`: Markdown and JSON files for specific campaign steps.
  - `workflows/`: Extensive set of JSON workflows (Day 1-30).
- **[internal-workflows/](./internal-workflows/)**: JSON workflow files currently used or defined within the project.
  - Includes `WF_LEAD_INGEST`, `WF_CAMPAIGN_EXECUTE`, `WF_RESPONSE_HANDLER`, etc.
- **[specs/](./specs/)**: Technical specifications and architecture docs for n8n.

## 🚀 Key Workflows
- `WF_LEAD_INGEST`: Entry point for all leads.
- `WF_CAMPAIGN_EXECUTE`: Main engine for multi-channel outreach.
- `WF_RESPONSE_HANDLER`: Compliance and response processing.

## 📈 Goals
- 45-60 day multi-channel drip (SMS, Email, Voice).
- 100% TCPA/CAN-SPAM compliance.
- CRM as the system of record.
