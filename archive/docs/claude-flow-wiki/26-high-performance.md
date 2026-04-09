# CLAUDE.md Template: High-Performance Systems

**Specialization**: Performance Optimization
**Focus**: Speed & Efficiency
**Metrics**: Latency, Throughput, Resource Usage
**Goal**: Sub-100ms Response Times

## 🚨 AUTOMATIC SWARM ORCHESTRATION

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized

# Spawn performance-focused agents
npx @claude-flow/cli@latest agent spawn -t coder --name perf-engineer --capabilities "optimization,benchmarking"
```

## 🎯 Project Context

- **Project Name**: {{PROJECT_NAME}}
- **Current Latency**: {{CURRENT_LATENCY}}ms
- **Target Latency**: {{TARGET_LATENCY}}ms (typically <100ms)
- **Throughput Goal**: {{THROUGHPUT_GOAL}} requests/sec

## 🔧 Performance Optimization Areas

### Frontend Performance
```
- Code splitting
- Image optimization
- CSS/JS minification
- Lazy loading
- Service workers
- CDN caching
- Metrics: LCP, FID, CLS
```

### Backend Performance
```
- Query optimization
- Connection pooling
- Caching strategies
- Async processing
- Load balancing
- Compression
- Metrics: P95, P99 latency
```

### Database Performance
```
- Index optimization
- Query analysis
- Connection limits
- Query caching
- Read replicas
- Sharding strategy
```

## 🚀 Performance Monitoring

### Key Metrics
```javascript
// Frontend Web Vitals
- LCP (Largest Contentful Paint): <2.5s
- FID (First Input Delay): <100ms
- CLS (Cumulative Layout Shift): <0.1

// Backend Metrics
- P50 latency: <50ms
- P95 latency: <200ms
- P99 latency: <500ms
- Error rate: <0.1%

// Infrastructure
- CPU usage: <70%
- Memory: <80%
- Disk I/O: <75%
```

### Profiling Tools
```bash
# Node.js
node --prof app.js
node --prof-process isolate-*.log > profile.txt

# Python
python -m cProfile -o profile.prof app.py
snakeviz profile.prof

# Java
jprofile -agentpath=jprofiler.so app.jar
```

## 📊 Performance Targets

- Response time P95: <200ms
- Throughput: >1000 req/sec
- Cache hit rate: >80%
- Database connection time: <10ms

## 📋 High-Performance Checklist

- [ ] Baseline metrics established
- [ ] Profiling tools configured
- [ ] Query optimization done
- [ ] Caching strategy implemented
- [ ] CDN configured
- [ ] Compression enabled
- [ ] Load testing completed
- [ ] Continuous monitoring set up

---

**Generated from**: claude-flow CLAUDE.md High-Performance Template
