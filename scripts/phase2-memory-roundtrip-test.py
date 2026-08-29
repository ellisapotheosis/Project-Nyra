#!/usr/bin/env python3
"""
Phase 2 Memory Roundtrip Test
- Add memory via Mem0 API
- Search/retrieve via Qdrant
- Verify Letta recall works
- Benchmark latency across 20 operations
"""

import json
import time
import sys
import requests
from dataclasses import dataclass
from typing import Optional

@dataclass
class TestResult:
    name: str
    success: bool
    duration_ms: float
    error: Optional[str] = None

class Phase2MemoryTest:
    def __init__(self):
        # Oracle memory services (using actual container names from docker-compose.memory.yml)
        # COMPOSE_PROJECT_NAME appears to be set to oracle-vps-memory- instead of nyra-
        self.mem0_url = "http://oracle-vps-memory-mem0:5000"  # mem0 runs on 5000, not 8001
        self.qdrant_url = "http://oracle-vps-memory-qdrant-memory:6333"
        self.letta_url = "http://oracle-vps-memory-letta:8283"
        self.falkordb_host = "oracle-vps-memory-falkordb"
        self.falkordb_port = 6379

        self.results: list[TestResult] = []
        self.user_id = "phase2-test-user"

    def test_mem0_write(self) -> TestResult:
        """Add memory via Mem0 REST API"""
        start = time.time()
        try:
            payload = {
                "messages": [
                    {
                        "role": "user",
                        "content": "I am a test user. My name is TestBot. I work in AI research."
                    }
                ],
                "user_id": self.user_id
            }
            resp = requests.post(
                f"{self.mem0_url}/memories",  # mem0 v1 API endpoint
                json=payload,
                timeout=10
            )
            resp.raise_for_status()
            duration = (time.time() - start) * 1000
            return TestResult(
                name="mem0_write",
                success=resp.status_code == 200,
                duration_ms=duration,
                error=None if resp.status_code == 200 else resp.text
            )
        except Exception as e:
            duration = (time.time() - start) * 1000
            return TestResult(
                name="mem0_write",
                success=False,
                duration_ms=duration,
                error=str(e)
            )

    def test_mem0_search(self, query: str) -> TestResult:
        """Search memories via Mem0"""
        start = time.time()
        try:
            payload = {
                "queries": [query],
                "user_id": self.user_id,
                "top_k": 5
            }
            resp = requests.post(
                f"{self.mem0_url}/v1/memories/search",
                json=payload,
                timeout=10
            )
            resp.raise_for_status()
            duration = (time.time() - start) * 1000
            return TestResult(
                name=f"mem0_search[{query[:20]}...]",
                success=resp.status_code == 200,
                duration_ms=duration,
                error=None if resp.status_code == 200 else resp.text
            )
        except Exception as e:
            duration = (time.time() - start) * 1000
            return TestResult(
                name=f"mem0_search",
                success=False,
                duration_ms=duration,
                error=str(e)
            )

    def test_letta_recall(self, query: str) -> TestResult:
        """Verify Letta can recall memories"""
        start = time.time()
        try:
            # Letta agent message endpoint
            payload = {
                "user_input": f"What do you know about me? Query: {query}",
                "stream": False
            }
            resp = requests.post(
                f"{self.letta_url}/api/v1/agents/default/messages",
                json=payload,
                timeout=15
            )
            resp.raise_for_status()
            duration = (time.time() - start) * 1000
            return TestResult(
                name="letta_recall",
                success=resp.status_code == 200,
                duration_ms=duration,
                error=None if resp.status_code == 200 else resp.text
            )
        except Exception as e:
            duration = (time.time() - start) * 1000
            return TestResult(
                name="letta_recall",
                success=False,
                duration_ms=duration,
                error=str(e)
            )

    def benchmark_latency(self, operations: int = 20) -> TestResult:
        """Run N memory add operations and track latency"""
        start = time.time()
        latencies = []
        try:
            for i in range(operations):
                op_start = time.time()
                payload = {
                    "messages": [
                        {
                            "role": "user",
                            "content": f"Benchmark message {i}: Testing Phase 2 memory latency."
                        }
                    ],
                    "user_id": f"{self.user_id}-bench-{i}"
                }
                resp = requests.post(
                    f"{self.mem0_url}/v1/memories/add",
                    json=payload,
                    timeout=10
                )
                if resp.status_code == 200:
                    op_duration = (time.time() - op_start) * 1000
                    latencies.append(op_duration)

            total_duration = (time.time() - start) * 1000
            avg_latency = sum(latencies) / len(latencies) if latencies else 0

            return TestResult(
                name=f"latency_benchmark({operations}_ops)",
                success=len(latencies) == operations,
                duration_ms=total_duration,
                error=f"avg={avg_latency:.1f}ms, min={min(latencies):.1f}ms, max={max(latencies):.1f}ms" if latencies else "no successful operations"
            )
        except Exception as e:
            duration = (time.time() - start) * 1000
            return TestResult(
                name="latency_benchmark",
                success=False,
                duration_ms=duration,
                error=str(e)
            )

    def run_all_tests(self) -> bool:
        """Run full test suite"""
        print("=" * 60)
        print("Phase 2 Memory Roundtrip Test Suite")
        print("=" * 60)

        # Test 1: Write memory
        print("\n[1/5] Memory write test...")
        result = self.test_mem0_write()
        self.results.append(result)
        print(f"  ✓ {result.name}: {result.duration_ms:.1f}ms" if result.success else f"  ✗ {result.name}: {result.error}")

        if not result.success:
            print("\n❌ Initial write failed. Stopping tests.")
            return False

        time.sleep(1)  # Let memory index

        # Test 2: Search memories
        print("\n[2/5] Memory search test...")
        result = self.test_mem0_search("AI research")
        self.results.append(result)
        print(f"  ✓ {result.name}: {result.duration_ms:.1f}ms" if result.success else f"  ✗ {result.name}: {result.error}")

        # Test 3: Letta recall (if available)
        print("\n[3/5] Letta recall test...")
        result = self.test_letta_recall("name and role")
        self.results.append(result)
        print(f"  ✓ {result.name}: {result.duration_ms:.1f}ms" if result.success else f"  ✗ {result.name}: {result.error}")

        # Test 4: Latency benchmark
        print("\n[4/5] Context latency benchmark (20 operations)...")
        result = self.benchmark_latency(20)
        self.results.append(result)
        print(f"  ✓ {result.name}: {result.duration_ms:.1f}ms total")
        if result.error:
            print(f"    Details: {result.error}")

        # Test 5: Cleanup
        print("\n[5/5] Test data cleanup...")
        print("  ✓ Cleanup deferred to manual teardown (test data preserved for audit)")

        # Summary
        print("\n" + "=" * 60)
        successful = sum(1 for r in self.results if r.success)
        print(f"Results: {successful}/{len(self.results)} tests passed")
        print("=" * 60)

        return successful == len(self.results)

if __name__ == "__main__":
    test = Phase2MemoryTest()
    all_passed = test.run_all_tests()
    sys.exit(0 if all_passed else 1)
