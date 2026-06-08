# UI / Theme Work Is Separate — Do Not Execute During Non-UI Runs

Project Nyra UI prompting is intentionally quarantined until a dedicated UI/theme pass. The current non-UI agents must not edit:

- shadcn components
- tweakcn tokens
- Magic UI components
- Aceternity components
- landing page visuals
- dashboard layout
- 3D/sacred geometry
- animation effects
- app shell navigation

Keep these references for later only:

- RateHunter landing DESIGN.md
- ProjectNyra.com landing DESIGN.md
- Nyra Webapp DESIGN.md
- Theme-first safe slice: landing default `apotheosis`, webapp default `mint-midnight`
- Magic UI / Aceternity component matrix
- Figma/Claude Design/Stitch artifacts

Immediate UI next step, when explicitly assigned:

1. Restore dependency validation.
2. Implement theme registry/provider/switcher only.
3. Then landing polish.
4. Then webapp shell.

Until then: backend/infra/integration agents must leave UI alone.
