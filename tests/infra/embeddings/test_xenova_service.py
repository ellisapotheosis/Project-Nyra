"""
Test suite for Xenova/Transformers Embedding Service
TDD approach: Define expected behavior before implementation
"""
import pytest
import requests
import time
from typing import List


# Test configuration
XENOVA_SERVICE_URL = "http://localhost:8002"


class TestXenovaServiceHealth:
    """Test Xenova service health and availability"""

    def test_service_is_running(self):
        """Service should respond to health check"""
        response = requests.get(f"{XENOVA_SERVICE_URL}/health")
        assert response.status_code == 200

    def test_health_response_structure(self):
        """Health check should return expected structure"""
        response = requests.get(f"{XENOVA_SERVICE_URL}/health")
        data = response.json()

        assert "status" in data
        assert "model" in data
        assert "pipeline_ready" in data
        assert "wasm_simd" in data
        assert data["status"] == "healthy"

    def test_pipeline_is_ready(self):
        """Embedding pipeline should be initialized"""
        response = requests.get(f"{XENOVA_SERVICE_URL}/health")
        data = response.json()

        assert data["pipeline_ready"] is True


class TestXenovaEmbeddings:
    """Test embedding generation functionality"""

    def test_single_text_embedding(self):
        """Service should generate embedding for single text"""
        request_data = {
            "texts": ["Hello, world!"],
            "normalize": True
        }

        response = requests.post(f"{XENOVA_SERVICE_URL}/embed", json=request_data)
        assert response.status_code == 200

        data = response.json()
        assert "embeddings" in data
        assert "dimensions" in data
        assert "count" in data
        assert "latency_ms" in data

        assert len(data["embeddings"]) == 1
        assert data["count"] == 1
        assert data["dimensions"] == 384  # all-MiniLM-L6-v2 produces 384-dim

    def test_batch_embeddings(self):
        """Service should generate embeddings for multiple texts"""
        texts = [
            "First document",
            "Second document",
            "Third document",
            "Fourth document",
            "Fifth document"
        ]

        request_data = {
            "texts": texts,
            "normalize": True
        }

        response = requests.post(f"{XENOVA_SERVICE_URL}/embed", json=request_data)
        assert response.status_code == 200

        data = response.json()
        assert len(data["embeddings"]) == len(texts)
        assert data["count"] == len(texts)

    def test_embedding_dimensions(self):
        """Embeddings should have correct dimensions"""
        request_data = {
            "texts": ["Test document"],
            "normalize": True
        }

        response = requests.post(f"{XENOVA_SERVICE_URL}/embed", json=request_data)
        data = response.json()

        embedding = data["embeddings"][0]
        assert len(embedding) == 384
        assert data["dimensions"] == 384

    def test_normalized_embeddings(self):
        """Normalized embeddings should have unit length"""
        request_data = {
            "texts": ["Test document"],
            "normalize": True
        }

        response = requests.post(f"{XENOVA_SERVICE_URL}/embed", json=request_data)
        data = response.json()

        embedding = data["embeddings"][0]
        # Calculate L2 norm
        norm = sum(x**2 for x in embedding) ** 0.5
        # Should be approximately 1.0 (allow small floating point error)
        assert abs(norm - 1.0) < 0.01

    def test_non_normalized_embeddings(self):
        """Non-normalized embeddings should work"""
        request_data = {
            "texts": ["Test document"],
            "normalize": False
        }

        response = requests.post(f"{XENOVA_SERVICE_URL}/embed", json=request_data)
        assert response.status_code == 200

        data = response.json()
        assert len(data["embeddings"]) == 1


class TestXenovaModels:
    """Test model information and listing"""

    def test_list_available_models(self):
        """Service should list available models"""
        response = requests.get(f"{XENOVA_SERVICE_URL}/models")
        assert response.status_code == 200

        data = response.json()
        assert "available_models" in data
        assert "current_model" in data

        models = data["available_models"]
        assert "all-MiniLM-L6-v2" in models
        assert "multilingual-e5-small" in models
        assert "bge-small-en-v1.5" in models

    def test_model_info(self):
        """Service should provide current model info"""
        response = requests.get(f"{XENOVA_SERVICE_URL}/model/info")
        assert response.status_code == 200

        data = response.json()
        assert "model_name" in data
        assert "pipeline_ready" in data
        assert data["pipeline_ready"] is True


class TestXenovaPerformance:
    """Test performance requirements"""

    def test_single_embedding_latency(self):
        """Single embedding should complete quickly"""
        request_data = {
            "texts": ["Test document"],
            "normalize": True
        }

        response = requests.post(f"{XENOVA_SERVICE_URL}/embed", json=request_data)
        data = response.json()

        # Should complete in less than 500ms for single text
        assert data["latency_ms"] < 500

    def test_batch_embedding_latency(self):
        """Batch embeddings should be efficient"""
        texts = ["Document " + str(i) for i in range(10)]

        request_data = {
            "texts": texts,
            "normalize": True
        }

        response = requests.post(f"{XENOVA_SERVICE_URL}/embed", json=request_data)
        data = response.json()

        # Batch should complete in less than 2 seconds
        assert data["latency_ms"] < 2000

    def test_large_batch_handling(self):
        """Service should handle large batches"""
        texts = ["Document " + str(i) for i in range(50)]

        request_data = {
            "texts": texts,
            "normalize": True
        }

        response = requests.post(f"{XENOVA_SERVICE_URL}/embed", json=request_data)
        assert response.status_code == 200

        data = response.json()
        assert len(data["embeddings"]) == 50


class TestXenovaErrorHandling:
    """Test error handling"""

    def test_empty_text_array(self):
        """Service should reject empty text arrays"""
        request_data = {
            "texts": [],
            "normalize": True
        }

        response = requests.post(f"{XENOVA_SERVICE_URL}/embed", json=request_data)
        assert response.status_code == 400

    def test_invalid_request_format(self):
        """Service should reject invalid request format"""
        request_data = {
            "invalid_field": "test"
        }

        response = requests.post(f"{XENOVA_SERVICE_URL}/embed", json=request_data)
        assert response.status_code == 400

    def test_non_array_texts(self):
        """Service should reject non-array texts"""
        request_data = {
            "texts": "This should be an array",
            "normalize": True
        }

        response = requests.post(f"{XENOVA_SERVICE_URL}/embed", json=request_data)
        assert response.status_code == 400


class TestXenovaIntegration:
    """Test integration scenarios"""

    def test_semantic_similarity(self):
        """Similar texts should have similar embeddings"""
        texts = [
            "The quick brown fox jumps over the lazy dog",
            "A fast brown fox leaps over a sleepy dog",
            "Completely unrelated text about space exploration"
        ]

        request_data = {
            "texts": texts,
            "normalize": True
        }

        response = requests.post(f"{XENOVA_SERVICE_URL}/embed", json=request_data)
        data = response.json()

        embeddings = data["embeddings"]

        # Calculate cosine similarity
        def cosine_similarity(a, b):
            return sum(x * y for x, y in zip(a, b))

        sim_0_1 = cosine_similarity(embeddings[0], embeddings[1])
        sim_0_2 = cosine_similarity(embeddings[0], embeddings[2])

        # Similar texts should have higher similarity
        assert sim_0_1 > sim_0_2


class TestXenovaBatchEndpoint:
    """Test batch endpoint alias"""

    def test_batch_endpoint_works(self):
        """Batch endpoint should work as alias"""
        request_data = {
            "texts": ["Test 1", "Test 2"],
            "normalize": True
        }

        response = requests.post(f"{XENOVA_SERVICE_URL}/embed/batch", json=request_data)
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
