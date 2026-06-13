# Component Brief: TweakCN/shadCN Theme Migration

Desired theme source:

- [next-app globals.css](/home/ellisapotheosis/repos/project-nyra/apps/guidance/references/webapp-merge-snapshot/next-app/app/globals.css)
- [next-app components.json](/home/ellisapotheosis/repos/project-nyra/apps/guidance/references/webapp-merge-snapshot/next-app/components.json)
- [original exported index.css](/home/ellisapotheosis/repos/project-nyra/apps/guidance/references/webapp-merge-snapshot/ellisapotheosis-apotheosis-mortgage-lead-campaign/index.css)

Why colors are missing in current live apps:

- current apps are not importing these token definitions
- current apps have their own globals and utility styles
- current component implementations are not all wired to the same token set

Migration requirements:

- unify token file strategy
- make all target apps import the theme CSS
- align button/card/input/tabs/etc. to one shadcn token contract
- resolve collisions between old Tailwind utility styles and new CSS variable-driven theme

Non-goal:

- copying `index.css` alone without component and import integration
