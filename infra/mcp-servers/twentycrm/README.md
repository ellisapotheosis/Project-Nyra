# TwentyCRM MCP Server

Provides TwentyCRM operations as MCP tools for CRM integration.

## Features

- **create_contact** - Create new contact
- **update_contact** - Update existing contact
- **search_leads** - Search for leads
- **create_deal** - Create new deal/opportunity
- **update_deal** - Update deal status
- **create_task** - Create task for contact
- **list_contacts** - List all contacts
- **get_contact_by_id** - Get specific contact details

## Configuration

Required environment variables:
- `TWENTY_API_URL` - TwentyCRM GraphQL API URL
- `TWENTY_API_KEY` - TwentyCRM API key
- `TWENTY_WORKSPACE_ID` - Workspace identifier

## Docker Build

```bash
docker build -t nyra-twentycrm-mcp:latest .
```

## Docker Run (Standalone)

```bash
docker run -d \
  --name nyra-twentycrm-mcp \
  -p 8082:8082 \
  -e TWENTY_API_URL=http://twentycrm:3000/graphql \
  -e TWENTY_API_KEY=your-api-key \
  -e TWENTY_WORKSPACE_ID=default \
  nyra-twentycrm-mcp:latest
```

## Docker Compose

Already integrated in `docker-compose.nexus-mcp.yml`:

```yaml
twentycrm-mcp:
  build:
    context: ./mcp-servers/twentycrm
  environment:
    - TWENTY_API_URL=http://twentycrm:3000/graphql
    - TWENTY_API_KEY=${TWENTY_API_KEY}
  depends_on:
    - twentycrm
```

## Usage via Nexus Router

The TwentyCRM MCP server is accessible through Nexus Router with fuzzy matching:
- Keywords: CRM, contact, lead, deal, customer, borrower
- Aliases: client, prospect, opportunity, account

## Integration with Project Nyra

This MCP server allows AI agents to:
1. Manage borrower contacts in TwentyCRM
2. Track deal pipeline
3. Create follow-up tasks
4. Search and filter leads
5. Update contact information

All CRM operations are compliance-validated through Nyra Orchestrator.
