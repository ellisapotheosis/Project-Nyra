# Twenty Customization Strategy

- Upstream Twenty source remains isolated under `apps/twenty`.
- Nyra-specific logic lives in wrappers/adapters:
  - `packages/clients/twenty`
  - service-level integration code (quote/campaign mapping)
- Avoid direct edits in upstream files unless patch-point is documented.
- Keep environment overlays and compose wiring in `infra/oracle`.
