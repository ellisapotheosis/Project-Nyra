# Home Assistant UI Surface Policy

Home Assistant should use `infra/service-registry.yaml` as the URL source. Sensitive surfaces are link-first. Iframes are allowed only for registry entries marked `iframe-ok` after CSP and authentication validation.
