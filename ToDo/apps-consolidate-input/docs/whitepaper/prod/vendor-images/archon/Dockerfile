# Placeholder: build Archon OS from local vendor/archon
# This assumes Archon is a Node/Python mixed repo; adjust once you confirm its runtime.
FROM node:20-alpine
WORKDIR /app
COPY vendor/archon/ /app/
RUN test -f package.json && npm ci || true
CMD ["sh","-lc","echo 'Archon image placeholder. Update Dockerfile after confirming archon runtime.' && sleep 3600"]
