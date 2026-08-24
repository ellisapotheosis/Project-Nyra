# Cloudflare Access Rollback Artifact

Generated after successful mutation and read-back validation.

## Affected Policies

- Nyra Agents — `f71b5cd9-a959-41cb-8f29-34de766e4aa6`
- Nyra Family — `3fd257e7-5c03-4e83-9d82-b4ef09dc94e8`
- Nyra Personal — `868c3693-203c-4479-94d3-7f7e2a375a5d`

## Changes Made

- Nyra Agents: verified unchanged; kept Service Auth with 3 service tokens
- Nyra Family: removed login-method include; retained email-domain `monitapu.com` and email `andersenj949@gmail.com`; preserved approval/prompt settings
- Nyra Personal: removed login-method includes and Require email; replaced with Include email `edaneandersen@gmail.com`

## Validation

Live GET read-back matched desired state for all three policies.

## Restore Path

To rollback, re-PUT the `.before.json` snapshots for each policy using the Cloudflare API update endpoint.
