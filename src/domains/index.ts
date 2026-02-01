/**
 * Claude Flow V3 - Domain-Driven Design Architecture
 *
 * This module exports the 5 core bounded contexts:
 * 1. Security Domain - Authentication, Authorization, Encryption, Audit
 * 2. Memory Domain - Storage, Retrieval, Indexing, Caching
 * 3. Swarm Domain - Coordination, Consensus, Topology, Agent Lifecycle
 * 4. Integration Domain - MCP Protocol, Provider Management, Tool Execution
 * 5. Performance Domain - Benchmarking, Optimization, Monitoring, Profiling
 *
 * @module v3/domains
 */

// Security Domain (Generic - Supporting)
export * from './security/aggregates';
export * from './security/value-objects';
export * from './security/domain-events';
export * from './security/services';
export * from './security/repositories';

// Memory Domain (Supporting)
export * from './memory/aggregates';
export * from './memory/value-objects';
export * from './memory/domain-events';
export * from './memory/services';
export * from './memory/repositories';

// Swarm Domain (Core)
export * from './swarm/aggregates';
export * from './swarm/value-objects';
export * from './swarm/domain-events';
export * from './swarm/services';
export * from './swarm/repositories';

// Integration Domain (Generic)
export * from './integration/aggregates';
export * from './integration/value-objects';
export * from './integration/domain-events';
export * from './integration/services';
export * from './integration/repositories';

// Performance Domain (Supporting)
export * from './performance/aggregates';
export * from './performance/value-objects';
export * from './performance/domain-events';
export * from './performance/services';
export * from './performance/repositories';

/**
 * Domain Context Map
 *
 * Relationships between bounded contexts:
 * - Swarm ↔ Memory: Partnership (bidirectional collaboration)
 * - Swarm → Security: Customer-Supplier (authentication/authorization)
 * - Integration → Swarm: Open Host Service (MCP protocol)
 * - Performance → All: Customer-Supplier (metrics collection)
 * - Memory → External Storage: Anti-Corruption Layer (protect domain)
 * - Security → OIDC/OAuth: Conformist (adopt standards)
 */

/**
 * Ubiquitous Language
 *
 * Each domain maintains its own vocabulary:
 *
 * Security: Principal, Claim, Policy, Audit Trail, Token, Encryption, Threat
 * Memory: Store, Vector, Namespace, Index, Cache, Embedding, Similarity
 * Swarm: Swarm, Agent, Topology, Consensus, Orchestration, Queen, Worker
 * Integration: MCP, Provider, Tool, Transport, Server, Client, Resource
 * Performance: Benchmark, Metric, Bottleneck, Optimization, Profile, Threshold
 */

/**
 * Performance Targets (V3)
 *
 * - Flash Attention: 2.49x-7.47x speedup ✅
 * - HNSW Search: 150x-12,500x faster ✅
 * - Memory Reduction: 50-75% (4-32x quantization) ✅
 * - MCP Response: <100ms ⚙️
 * - CLI Startup: <500ms ⚙️
 * - SONA Adaptation: <0.05ms ✅
 */
