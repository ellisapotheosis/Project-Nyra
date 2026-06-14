# Twenty CRM App Boundary

`apps/twentycrm` is the workspace-level home for the Twenty CRM runtime boundary.
It exists so app routing stays clear without moving CRM state into the Project
Nyra webapp.

## Source Of Truth

Twenty CRM is the system of record for lead and loan state. The database is the
`twenty-db` Postgres service and its Docker volume in
`infra/hosts/oracle-vps/docker-compose.yml`.

Project Nyra pages such as `apps/projectnyra/src/app/(broker)/crm/page.tsx`
should read through service boundaries and link to Twenty where needed. They
must not become the CRM database or mutate Twenty directly.

## Related Code

| Path                                        | Purpose                                                         |
| :------------------------------------------ | :-------------------------------------------------------------- |
| `infra/hosts/oracle-vps/docker-compose.yml` | Twenty, Twenty worker, Twenty Postgres, and Twenty MCP runtime. |
| `services/crm-api`                          | Project Nyra CRM API boundary for app-facing CRM data.          |
| `services/twentycrm-integration`            | Twenty integration service code.                                |
| `services/twenty-crm-mcp-server`            | Twenty CRM MCP server.                                          |
| `services/twenty-mcp-jezweb`                | Jezweb Twenty MCP server fork.                                  |
| `packages/clients/twenty`                   | Shared Twenty client package.                                   |
| `packages/twenty-custom-objects`            | Twenty custom object definitions.                               |

## Local Commands

Run from the repo root:

```bash
pnpm twenty:setup
pnpm twenty:down
pnpm twenty:dev
```

`pnpm twenty:dev` delegates to this workspace and starts the Oracle compose
services for Twenty CRM. Required secrets must come from ignored `.env` files or
Infisical-backed volumes.

The workspace script supplies local placeholder values only for unrelated
compose services that are required during Docker Compose interpolation. It does
not supply Twenty CRM secrets.
