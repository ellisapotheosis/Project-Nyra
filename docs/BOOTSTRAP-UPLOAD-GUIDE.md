# Bootstrap File Upload Guide (Browser + Local)

## Goal

Get new bootstrap files from browser uploads into the correct repo locations safely.

## Option 1 — GitHub browser upload (small batches)

1. Open repository in GitHub.
2. Navigate to `bootstrap/incoming/`.
3. Click **Add file → Upload files**.
4. Drop files and commit to feature branch.
5. Pull branch locally and run:

```bash
./infra/scripts/bootstrap-import.sh bootstrap/incoming dry-run
```

## Option 2 — Browser IDE / Codespaces (large batches)

1. Open Codespaces for this repo.
2. Drag files into `bootstrap/incoming/`.
3. Fill mapping file `bootstrap/file-map.csv`.
4. Validate mapping:

```bash
./infra/scripts/bootstrap-import.sh bootstrap/incoming dry-run
```

5. Apply mapping:

```bash
./infra/scripts/bootstrap-import.sh bootstrap/incoming apply
```

6. Rebuild inventories:

```bash
./infra/scripts/inventory-stack-assets.sh
```

## Recommended mapping workflow

- Keep all uploads in `bootstrap/incoming/` first.
- Map each file in `bootstrap/file-map.csv` to final destination.
- Use dry-run first to avoid accidental overwrite.
- Commit both applied files and updated map for traceability.

## Example file-map.csv

```csv
# source_path,destination_path
nexus.toml,infra/configs/nexus/nexus.toml
litellm-config.yaml,infra/configs/litellm/config.yaml
health-check.sh,infra/scripts/runtime/health-check.sh
```
