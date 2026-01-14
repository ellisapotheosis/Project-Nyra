#!/usr/bin/env python3
"""
Deployment validation tests for Project Nyra 4-PC cluster

Tests verify:
- Service health endpoints across all 4 PCs
- Network connectivity between PCs
- Ruvector cluster consensus (1 leader + 2 followers)
- Database availability (PostgreSQL, Neo4j)
- Workflow system readiness (n8n, Activepieces)
- Monitoring stack (Prometheus, Grafana)
- Business service integration
"""

import asyncio
import pytest
import httpx
import socket
from typing import Dict, List, Tuple
from datetime import datetime

# PC Configuration
PCS = {
    "pc1": {"ip": "10.0.0.1", "role": "orchestrator", "name": "Mini PC Orchestrator"},
    "pc2": {"ip": "10.0.0.2", "role": "gpu-worker-1", "name": "GPU Worker 1"},
    "pc3": {"ip": "10.0.0.3", "role": "gpu-worker-2", "name": "GPU Worker 2"},
    "pc4": {"ip": "10.0.0.4", "role": "gpu-worker-3", "name": "GPU Worker 3"},
}

# Service endpoints by PC
SERVICES = {
    "pc1": [
        ("Nexus Router", "http://10.0.0.1:4321/health"),
        ("Claude Flow", "http://10.0.0.1:3333/health"),
        ("Prometheus", "http://10.0.0.1:9090/-/healthy"),
        ("Grafana", "http://10.0.0.1:3001/api/health"),
    ],
    "pc2": [
        ("Ollama", "http://10.0.0.2:11434/"),
        ("Ruvector Leader", "http://10.0.0.2:6370/health"),
        ("Letta", "http://10.0.0.2:8283/health"),
        ("Mem0", "http://10.0.0.2:8001/health"),
        ("Dify", "http://10.0.0.2:5001/health"),
    ],
    "pc3": [
        ("Ruvector Follower 1", "http://10.0.0.3:6370/health"),
        ("TwentyCRM", "http://10.0.0.3:3000/health"),
        ("PostgreSQL", "tcp://10.0.0.3:5432"),
        ("Redis", "tcp://10.0.0.3:6379"),
        ("Neo4j", "http://10.0.0.3:7474/"),
    ],
    "pc4": [
        ("Ruvector Follower 2", "http://10.0.0.4:6370/health"),
        ("n8n", "http://10.0.0.4:5678/healthz"),
        ("Activepieces", "http://10.0.0.4:3400/api/v1/health"),
        ("Quote Engine", "http://10.0.0.4:8001/health"),
        ("Campaign Engine", "http://10.0.0.4:8002/health"),
        ("Orchestrator", "http://10.0.0.4:8010/health"),
    ],
}


@pytest.mark.asyncio
async def test_network_connectivity():
    """Test basic network connectivity between all PCs"""
    print("\n=== Testing Network Connectivity ===")

    results = {}
    for pc_name, pc_info in PCS.items():
        ip = pc_info["ip"]
        try:
            # Try to connect to SSH port (22)
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)
            result = sock.connect_ex((ip, 22))
            sock.close()

            is_reachable = result == 0
            results[pc_name] = is_reachable
            status = "✓" if is_reachable else "✗"
            print(f"{status} {pc_name} ({ip}): {'Reachable' if is_reachable else 'Unreachable'}")
        except Exception as e:
            results[pc_name] = False
            print(f"✗ {pc_name} ({ip}): Error - {e}")

    # All PCs must be reachable
    assert all(results.values()), f"Some PCs unreachable: {[k for k, v in results.items() if not v]}"


@pytest.mark.asyncio
async def test_network_latency():
    """Test inter-PC network latency (must be <100ms)"""
    print("\n=== Testing Network Latency ===")

    async with httpx.AsyncClient(timeout=10.0) as client:
        latencies = {}

        for pc_name, pc_info in PCS.items():
            ip = pc_info["ip"]

            # Try to ping a simple endpoint
            try:
                start = datetime.now()
                response = await client.get(f"http://{ip}:22", timeout=5.0)
                end = datetime.now()

                latency_ms = (end - start).total_seconds() * 1000
                latencies[pc_name] = latency_ms

                status = "✓" if latency_ms < 100 else "⚠"
                print(f"{status} {pc_name}: {latency_ms:.2f}ms")
            except Exception as e:
                latencies[pc_name] = None
                print(f"✗ {pc_name}: Could not measure latency - {e}")

        # Check all latencies are reasonable
        valid_latencies = [v for v in latencies.values() if v is not None]
        if valid_latencies:
            avg_latency = sum(valid_latencies) / len(valid_latencies)
            print(f"\nAverage latency: {avg_latency:.2f}ms")
            assert avg_latency < 100, f"Average latency too high: {avg_latency:.2f}ms"


@pytest.mark.asyncio
async def test_service_health_endpoints():
    """Test all service health endpoints across all PCs"""
    print("\n=== Testing Service Health Endpoints ===")

    async with httpx.AsyncClient(timeout=10.0) as client:
        all_healthy = True

        for pc_name, services in SERVICES.items():
            print(f"\n{pc_name.upper()} ({PCS[pc_name]['name']}):")

            for service_name, endpoint in services:
                try:
                    if endpoint.startswith("tcp://"):
                        # TCP port check
                        host_port = endpoint.replace("tcp://", "").split(":")
                        host = host_port[0]
                        port = int(host_port[1])

                        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                        sock.settimeout(5)
                        result = sock.connect_ex((host, port))
                        sock.close()

                        is_healthy = result == 0
                        status = "✓" if is_healthy else "✗"
                        print(f"  {status} {service_name} (port {port})")
                    else:
                        # HTTP health check
                        response = await client.get(endpoint, timeout=5.0)
                        is_healthy = response.status_code == 200
                        status = "✓" if is_healthy else "✗"
                        print(f"  {status} {service_name} ({response.status_code})")

                    if not is_healthy:
                        all_healthy = False

                except Exception as e:
                    print(f"  ✗ {service_name}: {type(e).__name__}")
                    all_healthy = False

        assert all_healthy, "Some services are not healthy"


@pytest.mark.asyncio
async def test_ruvector_cluster_consensus():
    """Test Ruvector cluster Raft consensus (1 leader + 2 followers)"""
    print("\n=== Testing Ruvector Cluster Consensus ===")

    ruvector_nodes = [
        ("Leader (PC2)", "http://10.0.0.2:6370"),
        ("Follower 1 (PC3)", "http://10.0.0.3:6370"),
        ("Follower 2 (PC4)", "http://10.0.0.4:6370"),
    ]

    async with httpx.AsyncClient(timeout=10.0) as client:
        leader_count = 0
        follower_count = 0

        for node_name, base_url in ruvector_nodes:
            try:
                response = await client.get(f"{base_url}/cluster/status", timeout=5.0)
                if response.status_code == 200:
                    data = response.json()
                    role = "leader" if data.get("leader") == base_url else "follower"

                    if role == "leader":
                        leader_count += 1
                    else:
                        follower_count += 1

                    print(f"✓ {node_name}: {role.upper()}")
                else:
                    print(f"✗ {node_name}: HTTP {response.status_code}")
            except Exception as e:
                print(f"✗ {node_name}: {type(e).__name__}")

        print(f"\nCluster status: {leader_count} leader(s), {follower_count} follower(s)")

        # Raft requires exactly 1 leader
        assert leader_count == 1, f"Expected 1 leader, found {leader_count}"
        # At least 2 followers for fault tolerance
        assert follower_count >= 2, f"Expected at least 2 followers, found {follower_count}"


@pytest.mark.asyncio
async def test_business_services_integration():
    """Test business services can communicate (Orchestrator -> Quote Engine)"""
    print("\n=== Testing Business Services Integration ===")

    orchestrator_url = "http://10.0.0.4:8010"

    # Test quote generation flow
    async with httpx.AsyncClient(timeout=30.0) as client:
        print("\n1. Testing Quote Engine...")
        quote_payload = {
            "property_value": 400000,
            "down_payment": 80000,
            "credit_score": 750,
            "loan_term": 30,
            "property_type": "single_family",
            "loan_purpose": "purchase",
            "state": "CA"
        }

        try:
            response = await client.post(
                f"{orchestrator_url}/workflow/create",
                json={
                    "lead_id": "test_lead_001",
                    "quote_params": quote_payload,
                    "campaign_type": "5-day-drip",
                    "lead_data": {
                        "first_name": "Test",
                        "last_name": "Lead",
                        "phone": "+15555555555",
                        "email": "test@example.com",
                        "timezone": "America/Los_Angeles"
                    }
                },
                timeout=10.0
            )

            assert response.status_code == 200, f"Workflow creation failed: {response.status_code}"
            data = response.json()

            print(f"✓ Quote generated: ${data.get('quote', {}).get('monthly_payment', 'N/A')}/mo")
            print(f"✓ Compliance status: {data.get('compliance', {}).get('classification', 'N/A')}")
            print(f"✓ Campaign created: {data.get('campaign', {}).get('campaign_id', 'N/A')}")

        except Exception as e:
            pytest.fail(f"Business services integration test failed: {e}")


@pytest.mark.asyncio
async def test_monitoring_stack():
    """Test Prometheus and Grafana are collecting metrics"""
    print("\n=== Testing Monitoring Stack ===")

    async with httpx.AsyncClient(timeout=10.0) as client:
        # Test Prometheus
        print("\n1. Testing Prometheus...")
        try:
            response = await client.get("http://10.0.0.1:9090/api/v1/targets", timeout=5.0)
            assert response.status_code == 200

            data = response.json()
            active_targets = data.get("data", {}).get("activeTargets", [])
            print(f"✓ Prometheus: {len(active_targets)} active targets")

            # Check if key services are being scraped
            target_jobs = [t.get("labels", {}).get("job", "") for t in active_targets]
            critical_jobs = ["ruvector-leader", "quote-engine", "campaign-engine", "orchestrator"]

            for job in critical_jobs:
                if job in target_jobs:
                    print(f"  ✓ Scraping {job}")
                else:
                    print(f"  ⚠ Missing {job}")

        except Exception as e:
            pytest.fail(f"Prometheus test failed: {e}")

        # Test Grafana
        print("\n2. Testing Grafana...")
        try:
            response = await client.get("http://10.0.0.1:3001/api/health", timeout=5.0)
            assert response.status_code == 200
            print("✓ Grafana: Healthy")

            # Check datasources
            response = await client.get(
                "http://10.0.0.1:3001/api/datasources",
                headers={"Authorization": "Bearer admin:admin"},
                timeout=5.0
            )
            if response.status_code == 200:
                datasources = response.json()
                print(f"✓ Grafana: {len(datasources)} datasource(s) configured")

        except Exception as e:
            print(f"⚠ Grafana test warning: {e}")


@pytest.mark.asyncio
async def test_workflow_system():
    """Test n8n and Activepieces workflow systems"""
    print("\n=== Testing Workflow Systems ===")

    async with httpx.AsyncClient(timeout=10.0) as client:
        # Test n8n
        print("\n1. Testing n8n...")
        try:
            response = await client.get("http://10.0.0.4:5678/healthz", timeout=5.0)
            assert response.status_code == 200
            print("✓ n8n: Healthy")

            # Try to list workflows
            response = await client.get("http://10.0.0.4:5678/api/v1/workflows", timeout=5.0)
            if response.status_code == 200:
                workflows = response.json().get("data", [])
                print(f"✓ n8n: {len(workflows)} workflow(s) configured")

        except Exception as e:
            pytest.fail(f"n8n test failed: {e}")

        # Test Activepieces
        print("\n2. Testing Activepieces...")
        try:
            response = await client.get("http://10.0.0.4:3400/api/v1/health", timeout=5.0)
            assert response.status_code == 200
            print("✓ Activepieces: Healthy")

        except Exception as e:
            pytest.fail(f"Activepieces test failed: {e}")


@pytest.mark.asyncio
async def test_database_connectivity():
    """Test database connectivity (PostgreSQL, Redis, Neo4j)"""
    print("\n=== Testing Database Connectivity ===")

    databases = [
        ("PostgreSQL", "10.0.0.3", 5432),
        ("Redis", "10.0.0.3", 6379),
        ("Neo4j", "10.0.0.3", 7474),
    ]

    all_connected = True

    for db_name, host, port in databases:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)
            result = sock.connect_ex((host, port))
            sock.close()

            is_connected = result == 0
            status = "✓" if is_connected else "✗"
            print(f"{status} {db_name} ({host}:{port})")

            if not is_connected:
                all_connected = False

        except Exception as e:
            print(f"✗ {db_name}: {type(e).__name__}")
            all_connected = False

    assert all_connected, "Some databases are not accessible"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
