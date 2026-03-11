# Project Nyra - Database Schemas

Complete PostgreSQL database schemas for all Project Nyra services.

## Structure

- **migrations/** - Numbered migration files
  - `001_initial_schema.sql` - Core tables (borrowers, quotes, campaigns, messages)
  - `002_audit_tables.sql` - Audit logging and compliance tracking
  
- **schema.sql** - Combined schema for quick deployment
- **seed_data.sql** - Sample data for development/testing

## Tables

### Core Tables
- **borrowers** - Lead/borrower information
- **quotes** - Mortgage quotes generated
- **campaigns** - Drip campaigns
- **messages** - SMS/Email/Voice messages
- **message_templates** - Reusable message templates
- **user_preferences** - User-specific preferences

### Audit & Compliance
- **audit_logs** - Complete audit trail of all actions
- **compliance_events** - Compliance violations/warnings
- **human_escalations** - Cases requiring human review
- **consent_records** - TCPA consent tracking

## Setup Instructions

### Initial Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE nyra;
\c nyra

# Run migrations
\i schema.sql

# (Optional) Load seed data
\i seed_data.sql
```

### Docker Setup

Already configured in `docker-compose.dev.yml`:

```yaml
postgres:
  image: postgres:15
  environment:
    POSTGRES_DB: nyra
    POSTGRES_USER: nyra_user
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  volumes:
    - ./infra/database:/docker-entrypoint-initdb.d
```

Migrations auto-run on container startup.

### Migration Management

For production, use a migration tool like:
- **Flyway** (recommended)
- **Liquibase**
- **Alembic** (Python)
- **goose** (Go)

## Entity Relationships

```
borrowers (1) ──< (∞) quotes
borrowers (1) ──< (∞) campaigns
borrowers (1) ──< (∞) messages
borrowers (1) ──< (∞) user_preferences
borrowers (1) ──< (∞) consent_records
campaigns (1) ──< (∞) messages

audit_logs (1) ──< (1) compliance_events
audit_logs (1) ──< (1) human_escalations
compliance_events (1) ──< (1) human_escalations
```

## Indexes

All tables have indexes on:
- Primary keys (automatic)
- Foreign keys
- Commonly queried fields (status, created_at, email, etc.)
- JSONB fields (GIN indexes for metadata)

## Security

- UUID primary keys (not sequential integers)
- Email uniqueness enforced
- Check constraints on enums
- ON DELETE CASCADE for dependent records
- ON DELETE SET NULL for audit trails
- Timestamps on all records

## Compliance

The audit schema supports:
- **RESPA** - Real Estate Settlement Procedures Act
- **TILA** - Truth in Lending Act
- **TCPA** - Telephone Consumer Protection Act
- **GDPR** - Right to deletion (ON DELETE CASCADE)

## Backup & Restore

```bash
# Backup
pg_dump -U nyra_user -h localhost nyra > backup.sql

# Restore
psql -U nyra_user -h localhost nyra < backup.sql
```

## Performance Tuning

Key indexes for high-traffic queries:
- `idx_messages_scheduled_at` - Campaign scheduling
- `idx_audit_logs_created_at` - Audit queries
- `idx_campaigns_next_action_at` - Campaign execution
- `idx_quotes_borrower_id` - Borrower quote history
