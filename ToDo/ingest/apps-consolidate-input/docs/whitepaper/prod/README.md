# Production containerization (vendor forks)

Goal: build pinned images from your forks for production deployment.

Strategy:
- clone forks into `vendor/`
- build images from local source (no network required in CI)
- tag with git sha

Images:
- nyra/claude-flow:<sha>
- nyra/archon:<sha>
