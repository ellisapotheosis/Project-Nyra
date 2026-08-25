FROM python:3.11-slim

WORKDIR /app

# Install dependencies
RUN pip install --no-cache-dir flask flask-cors

# Copy audit service
COPY audit_service.py /app/

# Create audit directory with correct permissions
RUN mkdir -p /app/audit && chmod 755 /app/audit

# Expose port
EXPOSE 9090

# Health check
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:9090/health').read()"

# Run service (read-only enforcement at HTTP layer)
CMD ["python", "/app/audit_service.py"]
