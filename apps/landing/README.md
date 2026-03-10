# Landing Apps

Canonical RateHunter landing path:

- `apps/landing/ratehunter-landing`

Legacy mirror path retained for compatibility with older references:

- `apps/landing/app`

For Cloudflare Pages builds, use:

```bash
cd apps/landing/ratehunter-landing
npm install
npm run build:cf
```

Expected build output directory:

- `apps/landing/ratehunter-landing/.open-next`
