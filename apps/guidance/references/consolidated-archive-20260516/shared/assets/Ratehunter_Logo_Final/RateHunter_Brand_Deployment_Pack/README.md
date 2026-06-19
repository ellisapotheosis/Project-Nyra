# RateHunter Brand Deployment Pack

This pack contains both RateHunter logo systems, organized for practical deployment.

## Folder map

- `01_Source_Logo_Packages/`
  - Original separated source packages for the top and bottom logos.
- `02_Deployment_Assets/`
  - Ready-sized PNG assets for desktop/mobile landing pages, CRM usage, and web app usage.
- `03_Business_Card_Assets/`
  - Business-card-ready PNG canvases for both logos.

## Design assumptions

- Transparent assets are centered with conservative padding for safer use in nav bars, headers, hero areas, and login screens.
- Dark background variants use black backgrounds because the supplied logo art is optimized for dark presentation.
- Business card files are exported in two sizes:
  - No bleed: `1050x600` (3.5in x 2in at 300 DPI)
  - With bleed: `1125x675` (3.75in x 2.25in at 300 DPI)

## Recommended usage

### Desktop
- Landing page hero/logo: use `hero_logo_*`
- Site nav/logo: use `navbar_logo_*`
- CRM and WebApp header/logo: use `header_logo_*`, `app_header_*`, or `dashboard_logo_*`

### Mobile
- Landing page hero: `hero_mobile_*`
- Mobile header/nav: `*_header_mobile_*` or `navbar_mobile_*`
- Splash/login screens: `*_splash_*` or `*_login_banner_*`

### Business cards
- Use `front_*` for front-side logo placement.
- Use `back_*` for a more minimal reverse-side logo placement.

## Notes

- All core vector sources are kept in each logo package and duplicated under each deployment logo folder in `SVG_Source/` for quick access.
- If you lock a final slogan later, the full system can be regenerated to keep every export in sync.
