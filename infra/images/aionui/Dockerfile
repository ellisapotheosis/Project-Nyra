FROM node:20-alpine

WORKDIR /app

RUN npm install -g http-server

COPY index.html /app/
COPY style.css /app/

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["http-server", "-p", "3000", "-c-1"]
