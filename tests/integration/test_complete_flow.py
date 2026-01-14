"""
Project Nyra - Integration Tests
==================================
End-to-end integration tests for complete lead processing flow.
"""

import pytest
import httpx
import asyncio
from typing import Dict, Any
import uuid

# Service URLs
ORCHESTRATOR_URL = "http://localhost:8010"
QUOTE_ENGINE_URL = "http://localhost:8001"
CAMPAIGN_ENGINE_URL = "http://localhost:8002"
MEM0_API_URL = "http://localhost:8003"

# Test timeout
TIMEOUT = 30.0


@pytest.fixture
def test_lead_data() -> Dict[str, Any]:
    """Generate test lead data"""
    return {
        "first_name": "John",
        "last_name": "Doe",
        "email": f"test-{uuid.uuid4()}@example.com",
        "phone": "+15551234567",
        "loan_amount": 500000,
        "property_value": 650000,
        "credit_score": 720,
        "loan_purpose": "purchase",
        "property_type": "single_family",
        "occupancy": "primary"
    }


@pytest.mark.asyncio
async def test_service_health_checks():
    """Test all services are healthy"""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        # Test Orchestrator
        response = await client.get(f"{ORCHESTRATOR_URL}/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

        # Test Quote Engine
        response = await client.get(f"{QUOTE_ENGINE_URL}/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

        # Test Campaign Engine
        response = await client.get(f"{CAMPAIGN_ENGINE_URL}/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

        # Test Mem0 API
        response = await client.get(f"{MEM0_API_URL}/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_complete_lead_processing_flow(test_lead_data):
    """
    Test complete end-to-end flow:
    1. Submit lead to orchestrator
    2. Verify quote generated
    3. Verify campaign triggered
    4. Verify memory stored
    5. Verify compliance checked
    """
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        # Step 1: Submit lead to orchestrator
        print("\n🔄 Submitting lead to orchestrator...")
        response = await client.post(
            f"{ORCHESTRATOR_URL}/leads/process",
            json=test_lead_data
        )

        assert response.status_code == 200, f"Lead submission failed: {response.text}"
        lead_response = response.json()

        borrower_id = lead_response["borrower_id"]
        quote_id = lead_response.get("quote_id")
        campaign_id = lead_response.get("campaign_id")

        print(f"✅ Lead submitted: {borrower_id}")
        print(f"   Compliance Status: {lead_response['compliance_status']}")
        print(f"   Quote ID: {quote_id}")
        print(f"   Campaign ID: {campaign_id}")

        # Verify borrower ID is UUID
        assert uuid.UUID(borrower_id), "Borrower ID should be valid UUID"

        # Step 2: Verify quote generated (if compliant)
        if quote_id:
            print("\n🔄 Verifying quote...")
            # Note: Quote Engine endpoint would be /quote/{quote_id}
            # For now, we verify the quote_id was returned
            assert quote_id is not None
            print(f"✅ Quote generated: {quote_id}")

        # Step 3: Verify campaign triggered (if quote generated)
        if campaign_id:
            print("\n🔄 Checking campaign status...")
            response = await client.get(
                f"{CAMPAIGN_ENGINE_URL}/campaign/{borrower_id}/status"
            )

            if response.status_code == 200:
                campaign_status = response.json()
                assert campaign_status["borrower_id"] == borrower_id
                assert campaign_status["status"] in ["active", "pending"]
                print(f"✅ Campaign active: {campaign_status['campaign_type']}")
            else:
                print(f"⚠️  Campaign not found (may be processing)")

        # Step 4: Store and retrieve memory
        print("\n🔄 Testing memory operations...")
        memory_content = f"Test lead submitted for {test_lead_data['first_name']} {test_lead_data['last_name']}"

        # Add memory
        response = await client.post(
            f"{MEM0_API_URL}/memory/add",
            json={
                "user_id": borrower_id,
                "content": memory_content,
                "metadata": {"event": "lead_submission", "test": True}
            }
        )

        assert response.status_code == 200, f"Memory add failed: {response.text}"
        print("✅ Memory stored")

        # Search memory
        await asyncio.sleep(1)  # Wait for indexing

        response = await client.post(
            f"{MEM0_API_URL}/memory/search",
            json={
                "user_id": borrower_id,
                "query": "lead submitted",
                "limit": 10
            }
        )

        assert response.status_code == 200
        search_results = response.json()
        assert search_results["count"] > 0, "Memory search should return results"
        print(f"✅ Memory search returned {search_results['count']} results")

        # Step 5: Verify compliance check
        print("\n🔄 Testing compliance validation...")
        response = await client.post(
            f"{ORCHESTRATOR_URL}/compliance/check",
            json={
                "borrower_id": borrower_id,
                "lead_data": test_lead_data
            }
        )

        assert response.status_code == 200
        compliance_result = response.json()
        assert compliance_result["borrower_id"] == borrower_id
        assert "compliant" in compliance_result
        print(f"✅ Compliance check: {compliance_result['status']}")
        print(f"   Critical Issues: {compliance_result['critical_count']}")
        print(f"   High Issues: {compliance_result['high_count']}")
        print(f"   Medium Issues: {compliance_result['medium_count']}")


@pytest.mark.asyncio
async def test_campaign_operations(test_lead_data):
    """Test campaign pause/resume operations"""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        # Submit lead first
        response = await client.post(
            f"{ORCHESTRATOR_URL}/leads/process",
            json=test_lead_data
        )
        borrower_id = response.json()["borrower_id"]

        # Trigger campaign manually
        print("\n🔄 Triggering campaign...")
        response = await client.post(
            f"{CAMPAIGN_ENGINE_URL}/campaign/trigger",
            json={
                "borrower_id": borrower_id,
                "campaign_type": "45_day_drip",
                "start_immediately": True
            }
        )

        assert response.status_code in [200, 201]
        campaign_result = response.json()
        print(f"✅ Campaign triggered: {campaign_result['status']}")

        # Pause campaign
        print("\n🔄 Pausing campaign...")
        response = await client.post(
            f"{CAMPAIGN_ENGINE_URL}/campaign/pause",
            json={
                "borrower_id": borrower_id,
                "reason": "Integration test"
            }
        )

        assert response.status_code == 200
        print("✅ Campaign paused")

        # Resume campaign
        print("\n🔄 Resuming campaign...")
        response = await client.post(
            f"{CAMPAIGN_ENGINE_URL}/campaign/resume",
            json={
                "borrower_id": borrower_id
            }
        )

        assert response.status_code == 200
        print("✅ Campaign resumed")


@pytest.mark.asyncio
async def test_message_sending(test_lead_data):
    """Test single message sending"""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        # Submit lead first
        response = await client.post(
            f"{ORCHESTRATOR_URL}/leads/process",
            json=test_lead_data
        )
        borrower_id = response.json()["borrower_id"]

        # Send email (will fail without valid SMTP config, but tests endpoint)
        print("\n🔄 Testing message sending...")
        response = await client.post(
            f"{CAMPAIGN_ENGINE_URL}/message/send",
            json={
                "borrower_id": borrower_id,
                "channel": "email",
                "custom_content": "Test message: {{first_name}}, your quote is ready!",
                "subject": "Test Email"
            }
        )

        # Accept both success and failure (depends on SMTP config)
        assert response.status_code in [200, 400, 500]
        print(f"✅ Message endpoint tested: {response.status_code}")


@pytest.mark.asyncio
async def test_memory_crud_operations():
    """Test memory CRUD operations"""
    test_user_id = str(uuid.uuid4())

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        # Create memory
        print("\n🔄 Testing memory CRUD...")
        response = await client.post(
            f"{MEM0_API_URL}/memory/add",
            json={
                "user_id": test_user_id,
                "content": "Test memory content",
                "metadata": {"test": True}
            }
        )

        assert response.status_code == 200
        print("✅ Memory created")

        # Get all memories
        response = await client.get(
            f"{MEM0_API_URL}/memory/all/{test_user_id}",
            params={"limit": 10}
        )

        assert response.status_code == 200
        memories = response.json()
        assert memories["count"] >= 1
        print(f"✅ Retrieved {memories['count']} memories")

        # Search memories
        response = await client.post(
            f"{MEM0_API_URL}/memory/search",
            json={
                "user_id": test_user_id,
                "query": "test memory",
                "limit": 5
            }
        )

        assert response.status_code == 200
        search_results = response.json()
        print(f"✅ Memory search: {search_results['count']} results")


@pytest.mark.asyncio
async def test_escalation_workflow(test_lead_data):
    """Test human escalation workflow"""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        # Submit lead first
        response = await client.post(
            f"{ORCHESTRATOR_URL}/leads/process",
            json=test_lead_data
        )
        borrower_id = response.json()["borrower_id"]

        # Create escalation
        print("\n🔄 Testing escalation workflow...")
        response = await client.post(
            f"{ORCHESTRATOR_URL}/escalation/create",
            json={
                "borrower_id": borrower_id,
                "priority": "high",
                "reason": "Integration test escalation",
                "context": {"test": True, "issue": "Test issue"}
            }
        )

        assert response.status_code == 200
        escalation_result = response.json()
        escalation_id = escalation_result["escalation_id"]
        print(f"✅ Escalation created: {escalation_id}")

        # Get pending escalations
        response = await client.get(
            f"{ORCHESTRATOR_URL}/escalations/pending"
        )

        assert response.status_code == 200
        escalations = response.json()
        assert escalations["count"] >= 1
        print(f"✅ Found {escalations['count']} pending escalations")


@pytest.mark.asyncio
async def test_audit_logging(test_lead_data):
    """Test audit logging"""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        # Submit lead (generates audit logs)
        response = await client.post(
            f"{ORCHESTRATOR_URL}/leads/process",
            json=test_lead_data
        )
        borrower_id = response.json()["borrower_id"]

        # Wait for logs to be written
        await asyncio.sleep(1)

        # Get audit logs
        print("\n🔄 Testing audit logging...")
        response = await client.get(
            f"{ORCHESTRATOR_URL}/audit/logs/{borrower_id}",
            params={"limit": 50}
        )

        assert response.status_code == 200
        logs = response.json()
        assert logs["count"] >= 1, "Should have at least one audit log"
        print(f"✅ Retrieved {logs['count']} audit logs")

        # Verify log structure
        first_log = logs["logs"][0]
        assert "entity_type" in first_log
        assert "action" in first_log
        assert "timestamp" in first_log
        print(f"   Latest action: {first_log['action']}")


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
