# UI_STYLE_GUIDE.md

## Design Language
Project Nyra utilizes a professional, modern, and high-performance design language powered by **TweakCN**, **ShadCN/UI**, and **Magic UI**.

## Core Preferences
- **Theme**: Dark Mode ONLY (Black/Deep Grays). No light mode support required.
- **Palette**:
    - **Primary**: Indigo / Deep Purple.
    - **Accents**: Seafoam / Turquoise (Success/Active states).
    - **Highlights**: Bright / Neon Pink (Alerts/Special Call-to-actions).
- **Compatibility**: All components must use CSS variables compatible with ShadCN tokens (`--primary`, `--accent`, `--background`, etc.).

## Layout Rules
- **Density**: Professional density (don't waste space, but maintain clear grouping).
- **Responsiveness**: Mobile-responsive is required, but Desktop-First for the Broker Cockpit.
- **Feedback**: Use Magic UI for subtle animations (glows, borders) to make the app feel "alive."

## Components
- Use standard ShadCN components from the local `@nyra/ui` or `apps/shared` package.
- **Charts**: Use Turquoise/Seafoam for positive trends and Neon Pink for risk/warnings.
- **Assistant Chat**: Should be a docked or floating component utilizing the OpenClaw chat experience.

## Integration Links
The WebApp must provide visibility into the AI Fleet:
- Links/Status for all **OpenClaw** instances (Orchestrator, 5090, 3090 Ti, 3060).
- Links/Status for all **Nerve UI** cockpits.
