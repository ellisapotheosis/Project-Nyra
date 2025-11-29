# NYRA Distributed Memory & Knowledge Management System

A sophisticated distributed memory architecture designed for multi-agent AI systems across a network of GPU-enabled PCs with cloud integration.

## 🚀 Quick Start

### Prerequisites

- **Hardware**: 4 PCs (1 orchestrator + 3 workers with GPUs)
- **OS**: Windows 11 on all nodes
- **Node.js**: 24+ with Volta package manager
- **Database**: PostgreSQL 15+ with pgvector extension
- **Python**: 3.11+ for ML components
- **Network**: Gigabit Ethernet recommended

### Installation

1. **Clone and Setup**
```bash
git clone <repository-url>
cd project-nyra
```

2. **Install Dependencies**
```powershell
.\scripts\setup-distributed-memory.ps1 -InstallDependencies
```

3. **Initialize Database**
```powershell
.\scripts\setup-distributed-memory.ps1 -InitDatabase
```

4. **Setup Cluster**
```powershell
.\scripts\setup-distributed-memory.ps1 -SetupCluster -NodeType orchestrator
```

5. **Start Services**
```powershell
.\scripts\setup-distributed-memory.ps1 -StartServices
```

### Configuration

Update the generated `.env.development` file with your specific values:

```env
# Node Configuration
NODE_ID=orchestrator
NODE_TYPE=orchestrator

# Database
POSTGRES_HOST=localhost
POSTGRES_PASSWORD=your_secure_password

# Worker Endpoints
WORKER1_ENDPOINT=http://worker1.nyra.local:8080
WORKER2_ENDPOINT=http://worker2.nyra.local:8080
WORKER3_ENDPOINT=http://worker3.nyra.local:8080

# GPU Configuration
GPU_ENABLED=true
```

## 📊 Architecture Overview

### System Components

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   Orchestrator  │───│    Worker 1     │───│    Worker 2     │
│   (Coordinator) │   │  (RTX 3060)     │   │  (RTX 5090)     │
└─────────────────┘   └─────────────────┘   └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐   ┌─────────────────┐
                    │    Worker 3     │───│   Cloud (VPS)   │
                    │  (RTX 3090Ti)   │   │   (Backup)      │
                    └─────────────────┘   └─────────────────┘
```

### Core Features

- **🧠 Distributed Knowledge Graph**: Vector embeddings across multiple nodes
- **💬 Cross-Device Sessions**: Seamless conversation persistence
- **🤖 Adaptive Learning**: AI-powered performance optimization
- **💾 Intelligent Storage**: Multi-tier caching with prefetching
- **🔄 CRDT Synchronization**: Conflict-free data replication
- **📊 Performance Monitoring**: Real-time system health tracking
- **🔍 RAG System**: Advanced retrieval-augmented generation

## 🏗️ System Architecture

### 1. Knowledge Graph Layer

**Features:**
- Vector similarity search with 384-dimensional embeddings
- Distributed embedding generation across GPU nodes
- CRDT-based conflict resolution
- Real-time synchronization

**Key Files:**
- `src/memory/knowledge-graph/distributed-knowledge-graph.ts`
- `src/memory/knowledge-graph/rag-implementation.ts`

### 2. Session Management

**Features:**
- Cross-device conversation persistence
- Smart context window management
- Agent state synchronization
- Memory anchor system

**Key Files:**
- `src/memory/session-management/cross-device-session-manager.ts`

### 3. Learning Systems

**Features:**
- Pattern recognition and adaptation
- Anomaly detection
- Performance prediction
- Knowledge evolution

**Key Files:**
- `src/memory/learning-systems/adaptive-learning-engine.ts`

### 4. Storage Architecture

**Features:**
- Distributed data partitioning
- Intelligent caching strategies
- Automatic failover
- Multi-consistency models

**Key Files:**
- `src/memory/storage/distributed-storage-architecture.ts`
- `src/database/caching/intelligent-cache-manager.ts`

## 🛠️ Development Guide

### Project Structure

```
project-nyra/
├── src/
│   ├── memory/
│   │   ├── knowledge-graph/       # Vector DB & RAG
│   │   ├── session-management/    # Cross-device sessions
│   │   ├── learning-systems/      # Adaptive AI
│   │   └── storage/              # Distributed storage
│   ├── database/
│   │   ├── schemas/              # PostgreSQL schemas
│   │   ├── sync-algorithms/      # CRDT sync
│   │   └── caching/             # Cache management
│   └── monitoring/              # Performance monitoring
├── config/
│   └── memory/                  # Configuration files
├── scripts/                     # Setup and deployment
├── docs/
│   └── architecture/           # Technical documentation
└── tests/                      # Test suites
```

### Key Technologies

- **TypeScript**: Type-safe development
- **PostgreSQL + pgvector**: Vector database
- **Node.js**: Runtime environment
- **Python**: ML components
- **Docker**: Containerization (optional)
- **Cloudflared**: Secure tunneling

### Development Workflow

1. **Local Development**
```bash
npm run dev:orchestrator    # Start orchestrator
npm run dev:worker         # Start worker (on worker nodes)
npm run test              # Run test suite
```

2. **Database Management**
```bash
npm run db:migrate        # Apply schema changes
npm run db:seed          # Load test data
npm run db:backup        # Create backup
```

3. **Cluster Management**
```bash
npm run cluster:status   # Check cluster health
npm run cluster:sync     # Force synchronization
npm run cluster:rebalance # Rebalance data
```

## 🔧 Configuration Reference

### Memory Configuration (`config/memory/distributed-memory-config.yaml`)

**Key Sections:**
- `knowledge_graph`: Vector DB and embedding settings
- `session_management`: Cross-device session config
- `learning_systems`: AI learning parameters
- `storage`: Distributed storage settings
- `monitoring`: Performance tracking config

### Environment Variables

**Required:**
- `NODE_ID`: Unique node identifier
- `NODE_TYPE`: orchestrator, worker1, worker2, worker3, cloud
- `POSTGRES_PASSWORD`: Database password

**Optional:**
- `GPU_ENABLED`: Enable GPU acceleration
- `DEBUG_ENABLED`: Enable debug mode
- `LOG_LEVEL`: Logging verbosity

## 📈 Performance Tuning

### Hardware Optimization

**Orchestrator Node:**
- Prioritize CPU and RAM for coordination
- Fast SSD for session storage
- Stable network connection

**Worker Nodes:**
- GPU with 8GB+ VRAM for embeddings
- NVMe SSD for model caching
- High-bandwidth network

### Software Optimization

**Database Tuning:**
```sql
-- Optimize for vector operations
SET shared_preload_libraries = 'pg_stat_statements,pgvector';
SET max_connections = 200;
SET shared_buffers = '4GB';
SET work_mem = '256MB';
```

**Cache Configuration:**
```yaml
caching:
  hot_data:
    max_size: 1GB
    algorithm: adaptive_lru
  session_cache:
    max_size: 512MB
    algorithm: lru
```

## 🔒 Security Features

### Data Protection
- **AES-256 encryption** at rest
- **TLS 1.3** for data in transit
- **JWT authentication** for APIs
- **RBAC** access control

### Network Security
- **Cloudflared tunnels** for external access
- **VPN support** for site-to-site connections
- **Firewall integration**
- **Intrusion detection**

### Privacy Controls
- **Data retention policies**
- **User privacy settings**
- **PII anonymization**
- **Audit logging**

## 📊 Monitoring & Alerting

### Key Metrics

**System Metrics:**
- CPU, Memory, Disk, Network utilization
- GPU usage and temperature
- Database performance

**Application Metrics:**
- Query response times
- Cache hit rates
- Synchronization lag
- Error rates

### Alert Configuration

```yaml
thresholds:
  cpu_utilization:
    warning: 70%
    critical: 90%
  memory_utilization:
    warning: 80%
    critical: 95%
  response_time:
    warning: 2s
    critical: 5s
```

### Dashboards

Access monitoring dashboards at:
- **System Overview**: `http://localhost:3000/dashboard/system`
- **Application Performance**: `http://localhost:3000/dashboard/app`
- **Cluster Health**: `http://localhost:3000/dashboard/cluster`

## 🧪 Testing

### Test Categories

**Unit Tests:**
```bash
npm run test:unit          # Individual component tests
npm run test:integration   # Multi-component tests
npm run test:performance   # Performance benchmarks
```

**System Tests:**
```bash
npm run test:cluster       # Distributed system tests
npm run test:failover      # Disaster recovery tests
npm run test:load          # Load testing
```

### Test Data

```bash
npm run test:generate-data # Generate synthetic test data
npm run test:load-data     # Load test datasets
npm run test:benchmark     # Run performance benchmarks
```

## 🐛 Troubleshooting

### Common Issues

**Database Connection Errors:**
```bash
# Check PostgreSQL status
pg_isready -h localhost -p 5432

# Test connection
npm run test:db
```

**Synchronization Issues:**
```bash
# Check cluster connectivity
npm run cluster:ping

# Force resynchronization
npm run cluster:force-sync
```

**Performance Problems:**
```bash
# Check system resources
npm run system:status

# Analyze bottlenecks
npm run perf:analyze
```

### Log Analysis

```bash
# View real-time logs
npm run logs:follow

# Search logs
npm run logs:search "error"

# Export logs
npm run logs:export --since="1h"
```

## 📚 API Reference

### REST API Endpoints

**Knowledge Graph:**
- `GET /api/knowledge/search` - Vector similarity search
- `POST /api/knowledge/add` - Add knowledge node
- `PUT /api/knowledge/update` - Update node
- `DELETE /api/knowledge/delete` - Remove node

**Sessions:**
- `GET /api/sessions/:id` - Get session data
- `POST /api/sessions` - Create session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - End session

**Learning:**
- `GET /api/learning/patterns` - Get learning patterns
- `POST /api/learning/feedback` - Provide feedback
- `GET /api/learning/models` - List ML models

### WebSocket Events

**Real-time Updates:**
- `knowledge.updated` - Knowledge graph changes
- `session.updated` - Session state changes
- `cluster.status` - Cluster health updates
- `alert.triggered` - Performance alerts

## 🤝 Contributing

### Development Setup

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Install dependencies**: `npm install`
4. **Run tests**: `npm test`
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Create Pull Request**

### Code Standards

- **TypeScript**: Strict type checking
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **JSDoc**: Documentation comments

## 📋 Roadmap

### Current Version (v1.0)
- ✅ Distributed knowledge graph
- ✅ Cross-device sessions
- ✅ Adaptive learning
- ✅ Intelligent caching
- ✅ Performance monitoring

### Upcoming Features (v1.1)
- 🔲 Multi-modal RAG (images, audio)
- 🔲 Federated learning
- 🔲 Edge device integration
- 🔲 Advanced NLP models

### Future Vision (v2.0)
- 🔲 Quantum computing support
- 🔲 Neuromorphic processing
- 🔲 Autonomous agent swarms
- 🔲 Blockchain consensus

## 📞 Support

### Documentation
- **Architecture Guide**: `docs/architecture/distributed-memory-architecture.md`
- **API Documentation**: `docs/api/`
- **Deployment Guide**: `docs/deployment/`

### Community
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Wiki**: Community-maintained documentation

### Commercial Support
- **Enterprise**: Contact for enterprise support
- **Training**: Professional services available
- **Consulting**: Architecture and optimization help

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **PostgreSQL Team** for pgvector extension
- **Hugging Face** for transformer models
- **Cloudflare** for secure tunneling
- **OpenAI** for LLM capabilities
- **Community Contributors** for ongoing improvements

---

**NYRA Distributed Memory System** - Intelligent, scalable, and secure distributed AI infrastructure for the future of human-AI collaboration.