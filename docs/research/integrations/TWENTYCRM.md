# TWENTYCRM.md

## Role

System of Record for all Project Nyra entities.

## Configuration

- **API URL**: `TWENTY_API_URL`
- **Auth**: `TWENTY_API_KEY` (Bearer Token)
- **Webhooks**: `TWENTY_WEBHOOK_SECRET`

## Supported Entities

- Leads
- People
- Companies
- Opportunities
- Custom Mortgage Objects (Scenarios, Quotes)

## Usage

Use the `ITwentyClient` adapter. Avoid direct DB access to ensure CRM consistency.
