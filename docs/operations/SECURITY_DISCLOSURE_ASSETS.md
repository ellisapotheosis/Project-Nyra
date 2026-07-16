# Security Disclosure Assets

Last verified: 2026-07-15.

Project Nyra and RateHunter use a split disclosure-file setup:

- `security.txt` is managed by Cloudflare Security Center at the zone layer.
- Public OpenPGP key files are stored in Cloudflare R2.
- R2 objects are served through the existing custom domain `cdn.projectnyra.com`.
- Oracle app routing and Cloudflare Access are not on the critical path for these files.

## Public URLs

Security TXT:

- `https://projectnyra.com/.well-known/security.txt`
- `https://ratehunter.net/.well-known/security.txt`

OpenPGP keys:

- `https://cdn.projectnyra.com/security/projectnyra-pgp-key.asc`
- `https://cdn.projectnyra.com/security/ratehunter-pgp-key.asc`

## Cloudflare Resources

- R2 bucket: `nyra-cdn-assets`
- R2 custom domain: `cdn.projectnyra.com`
- R2 object prefix: `security/`

The `Encryption:` fields in Cloudflare-managed `security.txt` should point to
the R2 URLs above, not to app-local `/.well-known/pgp-key.asc` paths.

## Repo Copies

Local copies remain in each app for fallback/static deploy parity:

- `apps/projectnyra/public/.well-known/security.txt`
- `apps/projectnyra/public/.well-known/pgp-key.asc`
- `apps/ratehunter/public/.well-known/security.txt`
- `apps/ratehunter/public/.well-known/pgp-key.asc`

The local `security.txt` files should mirror the production `Encryption:` URLs
served from R2. The local `pgp-key.asc` files are fallback copies only.

## Validation

Run:

```bash
curl -fsS https://projectnyra.com/.well-known/security.txt
curl -fsS https://ratehunter.net/.well-known/security.txt
curl -fsSI https://cdn.projectnyra.com/security/projectnyra-pgp-key.asc
curl -fsSI https://cdn.projectnyra.com/security/ratehunter-pgp-key.asc
```

Success criteria:

- Both `security.txt` requests return `200`.
- `projectnyra.com` contains
  `Encryption: https://cdn.projectnyra.com/security/projectnyra-pgp-key.asc`.
- `ratehunter.net` contains
  `Encryption: https://cdn.projectnyra.com/security/ratehunter-pgp-key.asc`.
- Both R2 key URLs return `200` with an OpenPGP key content type.

## Notes

Do not route these disclosure assets through the Oracle app unless there is a
specific reason to test app-local fallback behavior. The current production path
intentionally avoids Oracle compose rebuilds, app auth redirects, and Cloudflare
Access exceptions.

`https://app.projectnyra.com/.well-known/security.txt` is not a validation
target while `app.projectnyra.com` remains the primary Access-gated webapp.
The `projectnyra.com` Cloudflare Security TXT canonical list was updated on
2026-07-15 to contain only `https://projectnyra.com/.well-known/security.txt`.
