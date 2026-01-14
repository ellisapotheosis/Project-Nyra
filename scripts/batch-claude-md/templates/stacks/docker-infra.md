## Docker Infrastructure Guidelines

### Docker Compose Organization
```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    networks:
      - nyra-network
    depends_on:
      - database
```

### Multi-Stage Builds
- Separate build and runtime stages
- Minimize final image size
- Use specific base image versions
- Cache dependencies effectively

### Container Best Practices
- One process per container
- Use .dockerignore
- Don't run as root
- Health checks for services
- Proper logging to stdout/stderr

### Networking
- Use custom networks for service isolation
- Define explicit dependencies
- Use service names for internal communication
- Expose only necessary ports

### Volume Management
- Named volumes for persistence
- Bind mounts for development
- Backup strategies for data volumes
- Proper permissions handling

### Environment Configuration
- Use .env files for configuration
- Secrets management (Docker secrets or vault)
- Environment-specific compose files
- Don't commit sensitive data

### Resource Limits
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
    reservations:
      cpus: '1.0'
      memory: 1G
```

### Monitoring & Logging
- Centralized logging (ELK, Loki)
- Container metrics (cAdvisor, Prometheus)
- Health check endpoints
- Proper log rotation

### Security
- Scan images for vulnerabilities
- Use minimal base images
- Regular image updates
- Network segmentation
- Secrets rotation
