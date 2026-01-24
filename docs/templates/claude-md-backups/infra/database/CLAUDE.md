# Database Infrastructure - PostgreSQL + Redis + Neo4j

## 🎯 INFRASTRUCTURE CONTEXT

**Purpose**: Multi-database infrastructure for Project Nyra providing relational data (PostgreSQL), caching/sessions (Redis), and knowledge graphs (Neo4j).

**Ports**:
- PostgreSQL: 5432
- Redis: 6379
- Neo4j: 7474 (HTTP), 7687 (Bolt)

**Technology**: PostgreSQL 15, Redis 7, Neo4j 5
**Template**: Docker Compose infrastructure

## 🚨 CRITICAL DEVELOPMENT RULES

### Database-First Pattern
**MANDATORY**: All database changes must maintain data integrity and backup coverage:

```yaml
# ✅ CORRECT: Batch database configs in ONE message
[Single Message]:
  - Write("postgres/init.sql", schemaCreation)
  - Write("postgres/migrations/001_add_borrowers.sql", migration1)
  - Write("redis/redis.conf", redisConfig)
  - Write("neo4j/init.cypher", graphSchema)
```

## 📊 DATABASE ARCHITECTURE

### Data Storage Strategy
```
PostgreSQL (Relational Data):
- Borrowers, loan applications, quotes
- Campaign history, document metadata
- User accounts, permissions, audit logs

Redis (Caching + Sessions):
- Session storage (JWT refresh tokens)
- Campaign opt-out lists (fast lookup)
- Rate limiting counters
- Quote cache (15 min TTL)

Neo4j (Knowledge Graphs):
- Loan evolution timeline
- Borrower relationships
- Compliance dependency graphs
- Lender comparison networks
```

## 🐝 DATABASE SWARM

### Agent Configuration
```yaml
topology: mesh  # Independent databases
maxAgents: 4
strategy: specialized
framework: docker-compose

agents:
  postgres_engineer:
    role: PostgreSQL Management
    focus: [schema-design, migrations, query-optimization]
    concurrent_tasks: [multiple-migrations, parallel-indexing]

  redis_specialist:
    role: Redis Configuration
    focus: [caching-strategies, session-management, pub-sub]
    concurrent_tasks: [multiple-caches, parallel-operations]

  graph_architect:
    role: Neo4j Graph Design
    focus: [node-schemas, relationship-types, cypher-queries]
    concurrent_tasks: [multiple-graphs, parallel-queries]

  backup_manager:
    role: Backup & Recovery
    focus: [pg-dump, redis-persistence, neo4j-snapshots]
    concurrent_tasks: [multiple-backups, parallel-replication]
```

## 🔧 POSTGRESQL PATTERNS

### Schema Design
```sql
-- Borrowers table
CREATE TABLE borrowers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    credit_score INT,
    tcpa_consent_given_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Loan applications
CREATE TABLE loan_applications (
    id SERIAL PRIMARY KEY,
    borrower_id INT REFERENCES borrowers(id),
    loan_amount DECIMAL(12,2) NOT NULL,
    property_value DECIMAL(12,2) NOT NULL,
    loan_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'submitted',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Quotes
CREATE TABLE quotes (
    id SERIAL PRIMARY KEY,
    loan_application_id INT REFERENCES loan_applications(id),
    interest_rate DECIMAL(5,3) NOT NULL,
    apr DECIMAL(5,3) NOT NULL,
    monthly_payment DECIMAL(10,2) NOT NULL,
    generated_at TIMESTAMP DEFAULT NOW()
);
```

## 📈 PERFORMANCE TARGETS

- PostgreSQL query latency: < 50ms p95
- Redis operation latency: < 5ms p95
- Neo4j graph traversal: < 100ms
- Database uptime: > 99.9%
- Backup frequency: Every 6 hours

---

**This database infrastructure stores all critical mortgage data with redundancy, encryption, and comprehensive backup strategies. Data integrity and availability are paramount for mortgage operations.**
