# Prompt: Backup + Inventory Agent

You are responsible for backup and inventory only.

## Mission

Before any merge or refactor work, create safe copies of all relevant app folders and produce a machine-readable inventory of what currently exists.

## Constraints

- Do not delete anything
- Do not modify `/home/ellisapotheosis/repos/webapp-merge`
- Do not modify `apps/twenty`
- Keep all backups inside `/home/ellisapotheosis/repos/webapp-merge`
- Preserve file structure and metadata as much as practical

## Source Folders To Back Up

- `/home/ellisapotheosis/repos/project-nyra/apps/ratehunter`
- `/home/ellisapotheosis/repos/project-nyra/apps/projectnyra`
- `/home/ellisapotheosis/repos/project-nyra/apps/admin`
- `/home/ellisapotheosis/repos/project-nyra/apps/mortgage-crm`
- `/home/ellisapotheosis/repos/project-nyra/apps/twenty`
- `/home/ellisapotheosis/repos/project-nyra/apps/twenty-crm`

## Backup Destination

Create a dated backup root such as:

- `/home/ellisapotheosis/repos/webapp-merge/project-nyra-apps-backup-2026-04-24/`

## Additional Context

Reference materials already copied into repo:

- [guidance snapshot](/home/ellisapotheosis/repos/project-nyra/apps/guidance/references/webapp-merge-snapshot)

## Deliverables

1. Backups completed
2. Inventory file listing:
   - app name
   - purpose
   - current package manager
   - dev script
   - known external dependencies
   - merge target recommendation
3. Zero functional changes to apps
