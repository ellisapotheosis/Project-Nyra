FROM node:20-alpine

WORKDIR /app

RUN npm install -g http-server

COPY index.html /app/index.html
COPY style.css /app/style.css

EXPOSE 5000

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["http-server", "-p", "5000", "-c-1"]
