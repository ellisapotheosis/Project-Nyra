# Lead Lifecycle Smoke Evidence

This directory is for sanitized local and live lead-lifecycle smoke outputs.

Recommended commands:

```bash
pnpm smoke:lead-lifecycle -- --dry-run --report-dir tests/results/lead-lifecycle-smoke
pnpm smoke:lead-lifecycle -- --live --report-dir tests/results/lead-lifecycle-smoke
```

Generated JSON and log files are ignored. Commit only this README, the
directory `.gitignore`, and any future schema or fixture files that are known to
contain no borrower PII, credentials, provider payloads, or raw CRM records.
