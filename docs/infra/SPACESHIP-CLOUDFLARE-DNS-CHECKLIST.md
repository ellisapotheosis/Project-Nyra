# Spaceship to Cloudflare DNS Checklist

These steps require owner dashboard login and cannot be completed locally by the agent.

1. In Cloudflare, add `ratehunter.net` and `projectnyra.com` as separate zones.
2. Record Cloudflare-assigned nameservers for each zone.
3. In Spaceship, inspect each domain for DNSSEC. If enabled, disable DNSSEC before changing nameservers.
4. Replace authoritative nameservers with the Cloudflare-assigned nameservers.
5. Wait for Cloudflare zone status `Active`.
6. Attach `ratehunter.net` and `ratehunter.net` to the RateHunter Cloudflare Pages project.
7. Do not create Nyra tunnel routes on `ratehunter.net`.
8. Verify:

```bash
dig ns ratehunter.net @1.1.1.1
dig ns projectnyra.com @1.1.1.1
dig +trace ratehunter.net
dig +trace projectnyra.com
```
