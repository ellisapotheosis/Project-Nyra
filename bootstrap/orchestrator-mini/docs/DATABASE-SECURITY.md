# Database Security - Project Nyra Orchestrator

## Security Overview

This document outlines the security measures, best practices, and configuration for database services on the Project Nyra orchestrator.

## Table of Contents

- [Authentication](#authentication)
- [Authorization](#authorization)
- [Network Security](#network-security)
- [Encryption](#encryption)
- [Secrets Management](#secrets-management)
- [Audit Logging](#audit-logging)
- [Backup Security](#backup-security)
- [Compliance](#compliance)
- [Security Checklist](#security-checklist)

## Authentication

### PostgreSQL

**Configuration**: SCRAM-SHA-256 authentication (more secure than MD5)

**Users and Access**:
```sql
-- Superuser (admin only)
postgres: SCRAM-SHA-256, localhost + Docker network

-- Service users
nyra_app_user: SCRAM-SHA-256, read/write on nyra_main
nyra_auth_user: SCRAM-SHA-256, read/write on nyra_auth
nyra_analytics_user: SCRAM-SHA-256, read/write on nyra_analytics
nyra_readonly_user: SCRAM-SHA-256, read-only on all databases
infisical_user: SCRAM-SHA-256, full access on infisical database
```

**Password Requirements**:
- Minimum 32 characters
- Alphanumeric + symbols
- No dictionary words
- Unique per service and environment

**pg_hba.conf** (Host-Based Authentication):
```conf
# Local connections (Docker only)
local   all             postgres                                peer

# Docker network connections (internal only)
host    all             all             172.16.0.0/12           scram-sha-256
host    all             all             10.0.0.0/8              scram-sha-256
host    all             all             192.168.0.0/16          scram-sha-256

# Localhost
host    all             all             127.0.0.1/32            scram-sha-256

# Reject all others
host    all             all             0.0.0.0/0               reject
```

### Redis

**Configuration**: requirepass authentication

**Password Requirements**:
- Minimum 32 characters
- High entropy (random generation recommended)
- No spaces or special shell characters

**ACL Configuration** (Redis 6+):
```redis
# Application user (full access)
ACL SETUSER nyra_app on >PASSWORD ~* +@all

# Read-only user (analytics)
ACL SETUSER nyra_readonly on >PASSWORD ~* +@read +@connection

# Pub/sub user
ACL SETUSER nyra_pubsub on >PASSWORD &* +@pubsub +@connection
```

### MongoDB

**Configuration**: SCRAM-SHA-256 authentication with RBAC

**Users**:
```javascript
// Root user (admin only)
admin: { roles: ["root"] }

// Application user
nyra_app_user: {
  roles: [
    { role: "readWrite", db: "nyra" },
    { role: "readWrite", db: "nyra_logs" }
  ]
}

// Read-only user
nyra_readonly_user: {
  roles: [
    { role: "read", db: "nyra" },
    { role: "read", db: "nyra_logs" }
  ]
}

// Backup user
nyra_backup_user: {
  roles: [
    { role: "backup", db: "admin" },
    { role: "restore", db: "admin" }
  ]
}
```

### AgentDB (Qdrant)

**Configuration**: Optional API key authentication

**API Key Requirements**:
- Minimum 32 characters
- Random generation recommended
- Rotate every 90 days

**Usage**:
```bash
# With API key
curl -H "api-key: YOUR_API_KEY" http://localhost:6333/collections

# Without API key (internal network only)
curl http://localhost:6333/collections
```

## Authorization

### Principle of Least Privilege

Each service has its own database user with minimum required permissions:

**PostgreSQL Permissions**:
```sql
-- Application user (read/write on specific database)
GRANT CONNECT ON DATABASE nyra_main TO nyra_app_user;
GRANT USAGE, CREATE ON SCHEMA public TO nyra_app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO nyra_app_user;

-- Read-only user (read on multiple databases)
GRANT CONNECT ON DATABASE nyra_main TO nyra_readonly_user;
GRANT USAGE ON SCHEMA public TO nyra_readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO nyra_readonly_user;

-- Future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO nyra_readonly_user;
```

**MongoDB Roles**:
- `read`: Query data only
- `readWrite`: Query and modify data
- `dbAdmin`: Database administration (not data access)
- `userAdmin`: User management
- `backup`: Backup operations
- `restore`: Restore operations

### Role-Based Access Control (RBAC)

**Service Roles**:
| Service | PostgreSQL | Redis | MongoDB | AgentDB |
|---------|-----------|-------|---------|---------|
| API Services | readWrite | full | readWrite | - |
| Auth Service | readWrite (auth DB) | full | - | - |
| Analytics | readOnly | read | read | - |
| AI Agents | - | full | readWrite | full |
| Backup Jobs | - | - | backup | - |
| Monitoring | readOnly | read | read | read |

## Network Security

### Docker Network Isolation

**Networks**:
- `databases`: Internal database network (no external access)
- `nyra-network`: Application network (connects to databases network)
- `monitoring`: Monitoring network (read-only database access)

**Firewall Rules** (host level):
```bash
# Block direct database access from external networks
iptables -A INPUT -p tcp --dport 5432 -s 172.16.0.0/12 -j ACCEPT
iptables -A INPUT -p tcp --dport 5432 -j DROP

iptables -A INPUT -p tcp --dport 6379 -s 172.16.0.0/12 -j ACCEPT
iptables -A INPUT -p tcp --dport 6379 -j DROP

iptables -A INPUT -p tcp --dport 27017 -s 172.16.0.0/12 -j ACCEPT
iptables -A INPUT -p tcp --dport 27017 -j DROP
```

### Cloudflare Tunnel (Zero Trust)

**Configuration**:
- Databases accessible only via Cloudflare tunnel with authentication
- No direct public IP exposure
- Zero Trust access policies enforced
- Multi-factor authentication required
- Session monitoring and logging

**Access Control**:
```yaml
# Cloudflare Zero Trust policy
rules:
  - name: Database Admin Access
    conditions:
      - email_domain: nyra.com
      - require_mfa: true
      - location: corporate_network
    allow_protocols:
      - PostgreSQL (5432)
      - MongoDB (27017)
    deny_protocols:
      - Redis (6379)  # Never expose Redis externally
```

## Encryption

### Data at Rest

**PostgreSQL**:
- Volume encryption (LUKS on Linux, BitLocker on Windows)
- Transparent Data Encryption (TDE) for enterprise PostgreSQL
- pgcrypto extension for column-level encryption

**Redis**:
- Volume encryption (LUKS/BitLocker)
- Application-level encryption for sensitive data

**MongoDB**:
- WiredTiger encryption at rest
- Volume encryption (LUKS/BitLocker)

**AgentDB**:
- Volume encryption (LUKS/BitLocker)
- No built-in encryption (rely on volume encryption)

**Configuration** (MongoDB example):
```yaml
security:
  encryption:
    mode: requireSSL
    keyFile: /etc/mongodb/keyfile
```

### Data in Transit

**PostgreSQL** (SSL/TLS):
```conf
# postgresql.conf
ssl = on
ssl_cert_file = '/etc/postgresql/server.crt'
ssl_key_file = '/etc/postgresql/server.key'
ssl_ca_file = '/etc/postgresql/root.crt'
ssl_min_protocol_version = 'TLSv1.2'
```

**Redis** (TLS):
```conf
# redis.conf
tls-port 6380
port 0
tls-cert-file /etc/redis/server.crt
tls-key-file /etc/redis/server.key
tls-ca-cert-file /etc/redis/ca.crt
tls-protocols "TLSv1.2 TLSv1.3"
```

**MongoDB** (TLS):
```yaml
net:
  tls:
    mode: requireTLS
    certificateKeyFile: /etc/mongodb/mongodb.pem
    CAFile: /etc/mongodb/ca.pem
```

## Secrets Management

### Infisical Integration

**Architecture**:
```
Services → Infisical SDK → Infisical API → PostgreSQL (secrets DB)
```

**Secret Structure**:
```yaml
/nyra/orchestrator/databases/
  ├── postgres/
  │   ├── POSTGRES_ROOT_PASSWORD
  │   ├── NYRA_APP_PASSWORD
  │   └── ...
  ├── redis/
  │   └── REDIS_PASSWORD
  ├── mongodb/
  │   ├── MONGO_ROOT_PASSWORD
  │   └── ...
  └── agentdb/
      └── QDRANT_API_KEY
```

**Service Identity**:
```bash
# Each service gets its own machine identity
infisical login --machine-identity

# Fetch secrets
infisical secrets --env=production --path=/nyra/orchestrator/databases/postgres
```

### Secret Rotation

**Rotation Schedule**:
- Database passwords: Every 90 days
- API keys: Every 90 days
- Certificates: Every 365 days
- Root passwords: Every 180 days (with notification)

**Rotation Process**:
1. Generate new secret in Infisical
2. Update database with new credential (keep old active)
3. Update application services (rolling deployment)
4. Verify all services using new credential
5. Remove old credential from database
6. Audit rotation event

**Automated Rotation** (example):
```bash
#!/bin/bash
# Rotate PostgreSQL password
NEW_PASSWORD=$(openssl rand -base64 32)
infisical secrets set POSTGRES_ROOT_PASSWORD "$NEW_PASSWORD" --env=production
docker exec orchestrator-postgres psql -U postgres -c "ALTER USER postgres PASSWORD '$NEW_PASSWORD';"
# Restart services with new password
docker-compose restart
```

## Audit Logging

### PostgreSQL

**pg_audit Extension**:
```sql
-- Enable pg_audit
CREATE EXTENSION pgaudit;

-- Configure audit logging
ALTER SYSTEM SET pgaudit.log = 'all';
ALTER SYSTEM SET pgaudit.log_catalog = off;
ALTER SYSTEM SET pgaudit.log_parameter = on;

-- Reload configuration
SELECT pg_reload_conf();
```

**Log All DDL**:
```conf
# postgresql.conf
log_statement = 'ddl'
log_connections = on
log_disconnections = on
```

### MongoDB

**Audit Configuration**:
```yaml
# mongod.conf
auditLog:
  destination: file
  format: JSON
  path: /var/log/mongodb/audit.json
  filter: '{ atype: { $in: [ "authenticate", "authCheck", "createUser", "dropUser" ] } }'
```

### Redis

**Slow Log**:
```redis
# Log queries slower than 10ms
CONFIG SET slowlog-log-slower-than 10000
CONFIG SET slowlog-max-len 128
```

### Centralized Logging

**Ship logs to central location**:
```yaml
# docker-compose.yml logging config
logging:
  driver: "json-file"
  options:
    max-size: "20m"
    max-file: "5"
    labels: "service,database"
```

**Log Aggregation** (via Filebeat/Fluentd):
```
Database Logs → Filebeat → Elasticsearch → Kibana
                         ↓
                    Grafana Loki
```

## Backup Security

### Encrypted Backups

**PostgreSQL**:
```bash
# Backup with encryption
pg_dump -U postgres nyra_main | \
  gpg --encrypt --recipient admin@nyra.com > \
  nyra_main_$(date +%Y%m%d).sql.gpg
```

**MongoDB**:
```bash
# Backup with encryption
mongodump --uri="mongodb://localhost:27017" --out=- | \
  gpg --encrypt --recipient admin@nyra.com > \
  mongodb_$(date +%Y%m%d).archive.gpg
```

### Backup Storage

**Requirements**:
- Separate physical location
- Encrypted at rest
- Access controls (IAM roles)
- Immutable backups (WORM)
- Regular restore testing

**S3 Example**:
```bash
# Upload encrypted backup to S3
aws s3 cp nyra_main_$(date +%Y%m%d).sql.gpg \
  s3://nyra-backups/databases/postgres/ \
  --sse AES256 \
  --storage-class STANDARD_IA
```

### Backup Verification

**Automated Testing**:
```bash
#!/bin/bash
# Restore backup to test database
# Verify data integrity
# Compare record counts
# Run smoke tests
# Clean up test database
```

## Compliance

### GDPR Compliance

- **Right to be forgotten**: Cascade delete on user deletion
- **Data portability**: Export user data in JSON format
- **Consent tracking**: Store consent records in audit logs
- **Data minimization**: Only store necessary data

### PCI DSS (if storing payment data)

- **Network segmentation**: Separate network for payment data
- **Encryption**: TDE for card data
- **Access controls**: Multi-factor auth for card data access
- **Logging**: Audit all access to payment data

### HIPAA (if storing health data)

- **Encryption**: At rest and in transit
- **Access controls**: Role-based with audit trails
- **BAA**: Business Associate Agreement with vendors
- **Data retention**: Comply with retention policies

## Security Checklist

### Initial Setup
- [ ] Change all default passwords
- [ ] Generate strong passwords (min 32 chars)
- [ ] Configure pg_hba.conf to restrict access
- [ ] Enable SSL/TLS for all databases
- [ ] Set up Infisical for secret management
- [ ] Configure network isolation
- [ ] Enable audit logging
- [ ] Set up encrypted backups
- [ ] Test backup restore process
- [ ] Configure monitoring and alerting

### Ongoing Security
- [ ] Rotate secrets every 90 days
- [ ] Review access logs monthly
- [ ] Update security patches weekly
- [ ] Audit user permissions quarterly
- [ ] Test disaster recovery annually
- [ ] Review firewall rules quarterly
- [ ] Scan for vulnerabilities monthly
- [ ] Review compliance annually

### Incident Response
- [ ] Maintain incident response plan
- [ ] Document security contacts
- [ ] Practice incident response drills
- [ ] Maintain communication templates
- [ ] Document lessons learned

## Security Monitoring

### Metrics to Monitor
- Failed authentication attempts
- Privilege escalation attempts
- Unusual query patterns
- Connection spikes
- Data exfiltration attempts
- Configuration changes
- User creation/deletion
- Backup failures

### Alerting Rules
```yaml
alerts:
  - name: "Failed Auth Spike"
    condition: failed_auth_count > 10 in 5 minutes
    severity: high
    action: notify_security_team

  - name: "Unauthorized Access"
    condition: access_denied_log contains "FATAL"
    severity: critical
    action: lock_account, notify_security_team

  - name: "Suspicious Query"
    condition: query contains "pg_shadow" OR query contains "information_schema.user_privileges"
    severity: high
    action: log, notify_dba
```

## References

- [OWASP Database Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html)
- [PostgreSQL Security Best Practices](https://www.postgresql.org/docs/current/auth-pg-hba-conf.html)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [Redis Security](https://redis.io/topics/security)
- [Qdrant Security](https://qdrant.tech/documentation/security/)
