# Nyra UI Theme Contract

Single design system source is `packages/ui`.

- Base components: shadcn
- Token/tweak layer: tweakcn
- Marketing/interaction accents: Magic UI

## Rules
1. Apps consume primitives from `packages/ui` first.
2. App-local components are wrappers/compositions only.
3. Tokens stay centralized (`packages/ui/tokens/*`).
4. No parallel Tailwind token systems per app.
