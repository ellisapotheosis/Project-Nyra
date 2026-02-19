#!/bin/bash
# infra/scripts/verify-memory.sh

echo "🧠 Memory Systems Verification"
echo "═══════════════════════════════════════════════════════════════"

# Test Graphiti
echo -e "\n📊 GRAPHITI (Knowledge Graph)"
echo "─────────────────────────────────────────"
graphiti_health=$(curl -s http://localhost:8100/health | jq -r '.status // empty' 2>/dev/null)
if [ "$graphiti_health" == "healthy" ]; then
    echo "  ✅ Health: OK"
else
    echo "  ❌ Health: FAILED"
fi

# Test entity creation
graphiti_entity=$(curl -s -X POST http://localhost:8100/api/v1/entities \
    -H "Content-Type: application/json" \
    -d '{"name": "test_verification", "type": "SYSTEM_TEST", "properties": {"verified": true}}' \
    | jq -r '.id // empty' 2>/dev/null)

if [ -n "$graphiti_entity" ]; then
    echo "  ✅ Entity Creation: OK (ID: $graphiti_entity)"
else
    echo "  ❌ Entity Creation: FAILED"
fi

# Test FalkorDB
echo -e "\n🔴 FALKORDB (Graph Database)"
echo "─────────────────────────────────────────"
falkor_ping=$(redis-cli -p 6380 ping 2>/dev/null)
if [ "$falkor_ping" == "PONG" ]; then
    echo "  ✅ Redis Module: PONG"
else
    echo "  ❌ Redis Module: NO RESPONSE"
fi

# Test graph query
falkor_query=$(redis-cli -p 6380 GRAPH.QUERY nyra_graph "RETURN 1 as test" 2>/dev/null)
if echo "$falkor_query" | grep -q "test"; then
    echo "  ✅ Graph Query: OK"
else
    echo "  ⚠️  Graph Query: Graph may not exist yet"
fi

# Test RuVector
echo -e "\n🔢 RUVECTOR (Vector Search)"
echo "─────────────────────────────────────────"
ruvector_health=$(curl -s http://localhost:8200/health | jq -r '.status // empty' 2>/dev/null)
if [ "$ruvector_health" == "healthy" ]; then
    echo "  ✅ Health: OK"
else
    echo "  ❌ Health: FAILED"
fi

# Test embedding generation
ruvector_embed=$(curl -s -X POST http://localhost:8200/api/v1/embed \
    -H "Content-Type: application/json" \
    -d '{"text": "Test mortgage lead refinance California"}' \
    | jq -r '.embedding[0] // empty' 2>/dev/null)

if [ -n "$ruvector_embed" ]; then
    echo "  ✅ Embedding Generation: OK"
else
    echo "  ❌ Embedding Generation: FAILED"
fi

# Test Letta AI
echo -e "\n🤖 LETTA AI (Memory Management)"
echo "─────────────────────────────────────────"
letta_health=$(curl -s http://localhost:8283/health | jq -r '.status // empty' 2>/dev/null)
if [ "$letta_health" == "healthy" ]; then
    echo "  ✅ Health: OK"
else
    echo "  ❌ Health: FAILED"
fi

# List agents
letta_agents=$(curl -s http://localhost:8283/api/v1/agents | jq -r 'length // 0' 2>/dev/null)
echo "  📋 Active Agents: $letta_agents"

# Test AgentDB
echo -e "\n💾 AGENTDB (State Store)"
echo "─────────────────────────────────────────"
agentdb_health=$(curl -s http://localhost:8300/health | jq -r '.status // empty' 2>/dev/null)
if [ "$agentdb_health" == "healthy" ]; then
    echo "  ✅ Health: OK"
else
    echo "  ❌ Health: FAILED"
fi

# Test state storage
agentdb_state=$(curl -s -X POST http://localhost:8300/api/v1/state \
    -H "Content-Type: application/json" \
    -d '{"agent_id": "verification_test", "state": {"status": "verified", "timestamp": "'$(date -Iseconds)'"}}' \
    | jq -r '.success // empty' 2>/dev/null)

if [ "$agentdb_state" == "true" ]; then
    echo "  ✅ State Storage: OK"
else
    echo "  ❌ State Storage: FAILED"
fi

echo -e "\n═══════════════════════════════════════════════════════════════"
echo "✨ Memory verification complete!"
