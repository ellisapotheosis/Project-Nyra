# Claude Code Configuration - Graphiti Knowledge Service

## Service Overview

**Graphiti Knowledge** is a knowledge graph and memory system that manages entity relationships, context enrichment, and intelligent memory hierarchies. It enables the Project Nyra ecosystem to understand and recall complex relationships between concepts, users, and past interactions with semantic meaning.

**Role**: Knowledge graph and entity relationship engine
**Port**: 7000
**Architecture**: Neo4j-based graph database with semantic layer
**Status**: Critical infrastructure service

## Core Responsibilities

1. **Entity Management**
   - Entity creation and lifecycle management
   - Entity classification and tagging
   - Entity embedding and semantic representation
   - Entity merging and conflict resolution

2. **Relationship Tracking**
   - Entity-to-entity relationships with properties
   - Temporal relationship tracking
   - Relationship strength and confidence scoring
   - Bidirectional relationship management

3. **Context Enrichment**
   - Retrieve relevant context for queries
   - Path-based reasoning (entity chains)
   - Multi-hop relationship traversal
   - Contextual embedding generation

4. **Memory Management**
   - Short-term memory (recent interactions)
   - Long-term memory (persistent knowledge)
   - Memory consolidation and archival
   - Memory decay and relevance scoring

5. **Query Processing**
   - Cypher query execution
   - Natural language entity queries
   - Semantic similarity matching
   - Graph pattern matching

## Configuration

### Environment Variables

```bash
# Core Service
GRAPHITI_PORT=7000
GRAPHITI_HOST=0.0.0.0
GRAPHITI_ENV=production

# Neo4j Configuration
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=${NEO4J_PASSWORD}
NEO4J_AUTH_BASIC=true

# Graph Configuration
GRAPHITI_MAX_ENTITIES=1000000
GRAPHITI_MAX_RELATIONSHIPS=10000000
GRAPHITI_ENTITY_EMBEDDING_DIM=768

# Memory Management
GRAPHITI_MEMORY_TYPE=hierarchical      # short_term, long_term, hierarchical
GRAPHITI_SHORT_TERM_TTL=86400         # 24 hours
GRAPHITI_CONSOLIDATION_INTERVAL=3600  # 1 hour
GRAPHITI_MEMORY_DECAY_FACTOR=0.95

# Entity Linking
GRAPHITI_AUTO_ENTITY_LINKING=true
GRAPHITI_ENTITY_LINK_THRESHOLD=0.7
GRAPHITI_ENTITY_LINK_BATCH_SIZE=100

# Caching
GRAPHITI_ENABLE_CACHE=true
GRAPHITI_CACHE_TYPE=redis
GRAPHITI_CACHE_TTL=3600
REDIS_URL=redis://redis:6379

# Vector Search Integration
RUVECTOR_URL=http://ruvector-search:9200
RUVECTOR_INDEX_ENTITIES=knowledge_graph

# Performance
GRAPHITI_NUM_THREADS=8
GRAPHITI_BATCH_SIZE=500
GRAPHITI_QUERY_TIMEOUT=30000

# Persistence
GRAPHITI_BACKUP_ENABLED=true
GRAPHITI_BACKUP_INTERVAL=86400
GRAPHITI_BACKUP_PATH=/data/graphiti/backups

# Monitoring
GRAPHITI_LOG_LEVEL=info
GRAPHITI_METRICS_ENABLED=true
```

### Entity Schema

```cypher
// Entity node structure
CREATE (e:Entity {
  id: STRING PRIMARY KEY,
  type: STRING,               // person, concept, document, etc.
  name: STRING,
  description: STRING,
  embedding: VECTOR(768),
  created_at: DATETIME,
  updated_at: DATETIME,
  access_count: INTEGER,
  last_accessed: DATETIME,
  memory_type: STRING,        // short_term, long_term
  confidence: FLOAT,
  metadata: MAP
})

// Relationship structure
CREATE (source:Entity)-[r:RELATED_TO {
  strength: FLOAT,            // 0-1 confidence
  type: STRING,               // knows, references, contains, etc.
  context: STRING,
  created_at: DATETIME,
  frequency: INTEGER,
  last_updated: DATETIME,
  evidence_count: INTEGER,
  properties: MAP
}]->(target:Entity)
```

### Relationship Types

```yaml
relationship_types:
  KNOWS:
    description: "Person knows another person"
    bidirectional: true
    properties: {duration, confidence}

  REFERENCES:
    description: "Entity references another entity"
    bidirectional: false
    properties: {context, citation_count}

  CONTAINS:
    description: "Document contains concept/entity"
    bidirectional: false
    properties: {section, relevance}

  SIMILAR_TO:
    description: "Semantic similarity relationship"
    bidirectional: true
    properties: {similarity_score, reasoning}

  RESOLVES:
    description: "Previous interaction resolves entity"
    bidirectional: false
    properties: {resolution_type, confidence}

  MENTIONS:
    description: "Entity mentioned in context"
    bidirectional: false
    properties: {frequency, context_id}

  RELATED_TO:
    description: "General relationship"
    bidirectional: true
    properties: {relationship_strength}
```

## API Endpoints

### Entity Operations

```bash
# Create entity
POST /v1/entities
{
  "type": "person",
  "name": "Alice",
  "description": "Engineer at Company X",
  "metadata": {
    "email": "alice@example.com",
    "department": "engineering"
  }
}
# Returns: { id, created_at, embedding }

# Get entity
GET /v1/entities/{entity_id}

# Search entities
POST /v1/entities/search
{
  "query": "engineers at company",
  "limit": 10,
  "type_filter": "person"
}

# Update entity
PUT /v1/entities/{entity_id}
{
  "description": "Senior Engineer at Company X",
  "metadata": { ... }
}

# Delete entity
DELETE /v1/entities/{entity_id}
```

### Relationship Operations

```bash
# Create relationship
POST /v1/relationships
{
  "source_id": "entity-1",
  "target_id": "entity-2",
  "type": "KNOWS",
  "strength": 0.85,
  "context": "Worked together on project X"
}

# Get relationships
GET /v1/entities/{entity_id}/relationships

# Query relationships
POST /v1/relationships/query
{
  "start_entity": "entity-1",
  "relationship_type": "KNOWS",
  "depth": 2,        # Multi-hop depth
  "limit": 50
}

# Get relationship path
POST /v1/relationships/path
{
  "source": "entity-1",
  "target": "entity-2",
  "max_length": 5
}
# Returns: paths between entities
```

### Context Enrichment

```bash
# Get entity context
POST /v1/context/entity
{
  "entity_id": "entity-1",
  "depth": 2,
  "include_embeddings": true
}
# Returns: entity + related entities + relationships

# Get contextual embedding
POST /v1/context/embedding
{
  "entity_id": "entity-1",
  "query": "engineering projects"
}
# Returns: context-aware embedding vector

# Entity linking (text → entities)
POST /v1/entity-linking
{
  "text": "Alice from Company X worked with Bob"
}
# Returns: [
#   { text: "Alice", entity_id: "...", confidence: 0.95 },
#   { text: "Company X", entity_id: "...", confidence: 0.88 },
#   { text: "Bob", entity_id: "...", confidence: 0.92 }
# ]
```

### Memory Operations

```bash
# Record interaction (creates/updates memory)
POST /v1/memory/record
{
  "entity_id": "user-123",
  "interaction_type": "conversation",
  "content": "User asked about authentication patterns",
  "timestamp": "2026-01-22T12:00:00Z",
  "metadata": { ... }
}

# Get memory (ranked by recency/relevance)
GET /v1/memory/entity/{entity_id}?limit=20

# Consolidate memory (merge similar entries)
POST /v1/memory/consolidate
{
  "entity_id": "user-123",
  "min_similarity": 0.8
}

# Retrieve relevant memories
POST /v1/memory/recall
{
  "entity_id": "user-123",
  "query": "past authentication issues",
  "limit": 5
}
```

### Graph Queries

```bash
# Execute Cypher query
POST /v1/query
{
  "cypher": "MATCH (e:Entity)-[r:KNOWS]->(other) RETURN e, r, other LIMIT 10"
}

# Natural language query (converted to Cypher)
POST /v1/query/natural
{
  "query": "Who are the people Alice knows?",
  "entity_context": "alice"
}

# Pattern matching
POST /v1/patterns/match
{
  "pattern": "(a:Entity)-[r:KNOWS]->(b:Entity)-[r2:KNOWS]->(c:Entity)",
  "constraints": {
    "a.type": "person",
    "c.type": "person"
  }
}
```

### Health & Monitoring

```bash
GET /health
GET /status
GET /stats                # Graph statistics
GET /metrics              # Prometheus metrics
```

## Architecture

### Knowledge Graph Structure

```
Entity Types:
  ├─ PERSON (users, agents, collaborators)
  ├─ CONCEPT (ideas, patterns, techniques)
  ├─ DOCUMENT (articles, code, interactions)
  ├─ ORGANIZATION (companies, teams)
  └─ INTERACTION (conversations, events)

Relationship Types:
  ├─ KNOWS (entity relationships)
  ├─ REFERENCES (citation/mention)
  ├─ CONTAINS (hierarchical)
  ├─ SIMILAR_TO (semantic)
  ├─ RESOLVES (resolution)
  └─ RELATED_TO (general)
```

### Query Processing Pipeline

```
Natural Language Query
    ↓
[Entity Linking] - Identify entities in query
    ↓
[Query Understanding] - Extract intent
    ↓
[Cypher Generation] - Convert to graph query
    ↓
[Query Optimization] - Plan execution
    ↓
[Execute on Neo4j] - Run optimized query
    ↓
[Retrieve Relationships] - Fetch context
    ↓
[Enrich with Embeddings] - Add vector data
    ↓
[Format Response] - Package results
    ↓
Client Response
```

### Memory Hierarchy

```
Short-Term Memory (24 hour TTL)
  └─ Recent interactions
  └─ Current context
  └─ Immediate recall

Long-Term Memory (persistent)
  └─ Consolidated patterns
  └─ Historical knowledge
  └─ Archival information

Consolidation Process:
  1. Periodically scan short-term memory
  2. Identify duplicate/similar entries
  3. Merge and create long-term summary
  4. Archive to long-term storage
  5. Remove from short-term (decay)
```

## Deployment

### Docker Compose

```yaml
graphiti-knowledge:
  image: project-nyra/graphiti-knowledge:latest
  ports:
    - "7000:7000"
  environment:
    - GRAPHITI_PORT=7000
    - NEO4J_URI=bolt://neo4j:7687
    - NEO4J_USER=neo4j
    - NEO4J_PASSWORD=${NEO4J_PASSWORD}
    - REDIS_URL=redis://redis:6379
    - RUVECTOR_URL=http://ruvector-search:9200
  depends_on:
    - neo4j
    - redis
    - ruvector-search
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:7000/health"]
    interval: 30s
    timeout: 10s
    retries: 3
  networks:
    - nyra-network

neo4j:
  image: neo4j:5.13
  ports:
    - "7687:7687"
    - "7474:7474"
  environment:
    - NEO4J_AUTH=neo4j/${NEO4J_PASSWORD}
    - NEO4J_ACCEPT_LICENSE_AGREEMENT=yes
  volumes:
    - neo4j-data:/data
  networks:
    - nyra-network

volumes:
  neo4j-data:
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: graphiti-knowledge
spec:
  replicas: 3
  selector:
    matchLabels:
      app: graphiti-knowledge
  template:
    metadata:
      labels:
        app: graphiti-knowledge
    spec:
      containers:
        - name: graphiti
          image: project-nyra/graphiti-knowledge:latest
          ports:
            - containerPort: 7000
          env:
            - name: GRAPHITI_PORT
              value: "7000"
            - name: NEO4J_URI
              value: "bolt://neo4j:7687"
            - name: NEO4J_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: neo4j-secret
                  key: password
          resources:
            requests:
              cpu: 1000m
              memory: 2Gi
            limits:
              cpu: 2000m
              memory: 4Gi
          livenessProbe:
            httpGet:
              path: /health
              port: 7000
            initialDelaySeconds: 30
            periodSeconds: 10

---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: neo4j
spec:
  serviceName: neo4j
  replicas: 1
  selector:
    matchLabels:
      app: neo4j
  template:
    metadata:
      labels:
        app: neo4j
    spec:
      containers:
        - name: neo4j
          image: neo4j:5.13
          ports:
            - containerPort: 7687
            - containerPort: 7474
          env:
            - name: NEO4J_AUTH
              value: "neo4j/$(NEO4J_PASSWORD)"
          resources:
            requests:
              cpu: 2000m
              memory: 4Gi
          volumeMounts:
            - name: neo4j-data
              mountPath: /data
  volumeClaimTemplates:
    - metadata:
        name: neo4j-data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 100Gi
```

## Monitoring

### Key Metrics

```
graphiti_entities_total                 # Total entities in graph
graphiti_relationships_total            # Total relationships
graphiti_query_latency_seconds          # Query execution time
graphiti_entity_linking_accuracy        # Entity linking F1 score
graphiti_memory_consolidations_total    # Memory consolidations
graphiti_cache_hit_ratio                # Cache hit %
graphiti_neo4j_connections              # Active DB connections
```

### Health Checks

```bash
# Neo4j connectivity
GET /health/neo4j

# Cache connectivity
GET /health/cache

# Vector search connectivity
GET /health/vector-search

# Graph statistics
GET /stats
```

## Performance Targets

| Metric | Target |
|--------|--------|
| Entity Query Latency | <100ms |
| Multi-hop Query (depth 2) | <500ms |
| Entity Linking | <50ms per entity |
| Memory Recall | <200ms |
| Graph Size | 1M+ entities, 10M+ relationships |
| Cache Hit Rate | >60% |

## Integration Points

### With RuVector Search
- Entity embeddings stored in RuVector
- Semantic similarity queries
- Contextual embedding generation

### With LiteLLM Proxy
- Context enrichment for LLM queries
- Entity-aware response generation
- Knowledge graph integration in prompts

### With Nexus Router
- Receives knowledge queries
- Returns structured entity data
- Metrics reported to gateway

## Development Workflow

### Running Locally

```bash
# Install dependencies
npm install

# Start Neo4j (via Docker)
docker run --rm -d \
  -p 7687:7687 \
  -p 7474:7474 \
  -e NEO4J_AUTH=neo4j/password \
  --name neo4j \
  neo4j:5.13

# Start service
npm run dev

# Run tests
npm run test
```

### Testing

```bash
# Unit tests
npm run test:unit

# Integration tests (requires Neo4j)
npm run test:integration

# Entity linking tests
npm run test:entity-linking

# Graph query tests
npm run test:graph-queries
```

## Security

### Access Control

```bash
# API key authentication
Authorization: Bearer {api-key}

# Neo4j authentication
bolt+s://neo4j:password@neo4j:7687
```

### Data Protection

- Sensitive entities encrypted at rest
- Query audit logging
- Rate limiting per API key
- PII detection and masking

## Related Services

- **RuVector Search** - Entity embeddings
- **LiteLLM Proxy** - LLM context enrichment
- **Nexus Router** - Request routing
- **Redis** - Caching layer
- **Neo4j** - Graph database backend

## Resources

- Documentation: `./docs/`
- Neo4j Documentation: https://neo4j.com/docs/
- Configuration: `./config/`
- Schema: `./scripts/schema.cypher`
- Examples: `./examples/`

---

**Status**: Critical infrastructure service
**Last Updated**: 2026-01-22
**Database**: Neo4j 5.13+
**Graph Model**: Entity-Relationship with semantic enrichment
