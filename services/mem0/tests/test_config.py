import sys
from unittest.mock import MagicMock

# Mock the entire mem0 module's Memory class to prevent import-time side effects (like connecting to Qdrant)
mock_memory_class = MagicMock()
sys.modules["mem0"] = MagicMock()
sys.modules["mem0"].Memory = mock_memory_class

import os
from unittest.mock import patch
from main import _build_config

def test_build_config_standard():
    """Verify that _build_config correctly extracts environment variables for Qdrant and FalkorDB."""
    with patch.dict(os.environ, {
        "OPENAI_API_KEY": "test-openai-key",
        "QDRANT_HOST": "test-qdrant-host",
        "QDRANT_PORT": "1234",
        "FALKORDB_URL": "redis://test-falkor:6379"
    }):
        cfg = _build_config()
        
        # Verify Qdrant configs
        assert cfg["vector_store"]["provider"] == "qdrant"
        assert cfg["vector_store"]["config"]["host"] == "test-qdrant-host"
        assert cfg["vector_store"]["config"]["port"] == 1234
        
        # Verify LLM & Embedder configs
        assert cfg["llm"]["config"]["api_key"] == "test-openai-key"
        assert cfg["embedder"]["config"]["api_key"] == "test-openai-key"
        
        # FalkorDB is handled by the explicit compatibility adapter, not an
        # unsupported Mem0 graph_store provider.
        assert "graph_store" not in cfg

def test_build_config_no_falkordb():
    """Verify that graph_store config is omitted when FALKORDB_URL is not set."""
    with patch.dict(os.environ, {}, clear=True):
        cfg = _build_config()
        assert "graph_store" not in cfg


def test_build_config_local_worker_route_and_dimensions():
    """The canonical memory route must be configurable for the 3060 Ollama host."""
    with patch.dict(os.environ, {
        "MEM0_LLM_API_KEY": "not-needed",
        "MEM0_LLM_BASE_URL": "http://100.64.0.12:11435/v1",
        "MEM0_LLM_MODEL": "llama3.2:3b",
        "MEM0_EMBEDDER_API_KEY": "not-needed",
        "MEM0_EMBEDDER_BASE_URL": "http://100.64.0.12:11435/v1",
        "MEM0_EMBEDDER_MODEL": "nomic-embed-text",
        "MEM0_EMBEDDING_DIMS": "768",
    }, clear=True):
        cfg = _build_config()

    assert cfg["llm"]["config"]["model"] == "llama3.2:3b"
    assert cfg["llm"]["config"]["openai_base_url"] == "http://100.64.0.12:11435/v1"
    assert cfg["embedder"]["config"]["model"] == "nomic-embed-text"
    assert cfg["embedder"]["config"]["embedding_dims"] == 768
    assert cfg["embedder"]["config"]["openai_base_url"] == "http://100.64.0.12:11435/v1"
    assert cfg["vector_store"]["config"]["embedding_model_dims"] == 768
