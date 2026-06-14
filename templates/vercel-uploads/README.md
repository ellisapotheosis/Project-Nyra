# Vercel Uploaded Templates

These packs came from the zip files supplied from `G:\Shared drives\GDrive_Shared\Vercel_Templates`.

## Template Packs

| ID | Display Name | Source Zip | Guide | Preview | Screenshots |
| --- | --- | --- | --- | --- | --- |
| `frosted-authentication-page` | Frosted Authentication Page | `frosted-authentication-page.zip` | [README](./frosted-authentication-page/README.md) | [Preview](./frosted-authentication-page/preview) | [Screenshots](./frosted-authentication-page/screenshots) |
| `frosted-glass-ui-crm-dashboard` | Frosted Glass CRM Dashboard | `frosted-glass-ui-crm-dashboard-ui-design.zip` | [README](./frosted-glass-ui-crm-dashboard/README.md) | [Preview](./frosted-glass-ui-crm-dashboard/preview) | [Screenshots](./frosted-glass-ui-crm-dashboard/screenshots) |
| `mail-template-builder` | Mail Template Builder | `mail-template-builder-1.0.0.zip` | [README](./mail-template-builder/README.md) | [Preview](./mail-template-builder/preview) | [Screenshots](./mail-template-builder/screenshots) |
| `sales-ops-dashboard` | Sales Ops Dashboard | `sales-ops-dashboard.zip` | [README](./sales-ops-dashboard/README.md) | [Preview](./sales-ops-dashboard/preview) | [Screenshots](./sales-ops-dashboard/screenshots) |
| `v0-sales-crm-design` | v0 Sales CRM Design | `v0-sales-crm-design-main.zip` | [README](./v0-sales-crm-design/README.md) | [Preview](./v0-sales-crm-design/preview) | [Screenshots](./v0-sales-crm-design/screenshots) |

## Runtime Status

| ID | Screenshot | Preview | Current blocker |
| --- | --- | --- | --- |
| `frosted-authentication-page` | ready | ready | none |
| `frosted-glass-ui-crm-dashboard` | ready | ready | none |
| `mail-template-builder` | ready | ready | none |
| `sales-ops-dashboard` | ready | ready | none |
| `v0-sales-crm-design` | pending | blocked | missing `react-is` from `recharts` |

## Regeneration

```bash
VERCEL_TEMPLATE_ZIP_DIR=.tmp/vercel-template-zips node scripts/templates/import-vercel-upload-zips.mjs
```
