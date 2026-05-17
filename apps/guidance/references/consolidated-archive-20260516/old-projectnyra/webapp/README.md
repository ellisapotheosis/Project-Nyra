# Project Nyra Webapp Migration Target

`apps/projectnyra/webapp` is the intended final source path for `app.projectnyra.com`.

The active command-center source is still `apps/cockpit` in this transition pass because it is the current buildable package (`nyra-cockpit`). Move it here only with a coordinated package/deploy update.

Current Project Nyra app-local visual primitives:

- `apps/cockpit/src/components/chroma`
- `apps/cockpit/src/styles/chroma-ops.css`

Do not import RateHunter landing components into this app.
