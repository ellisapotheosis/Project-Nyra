# /home/ellisapotheosis/projects/twenty-mcp-jezweb/Dockerfile
FROM oven/bun:latest
WORKDIR /app
COPY . .
RUN bun install
RUN bun build src/http-server.ts --target bun --outdir dist
EXPOSE 8400
CMD ["bun", "dist/http-server.js"]
