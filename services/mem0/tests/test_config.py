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
        
        # Verify FalkorDB configs
        assert cfg["graph_store"]["provider"] == "falkordb"
        assert cfg["graph_store"]["config"]["url"] == "redis://test-falkor:6379"

def test_build_config_no_falkordb():
    """Verify that graph_store config is omitted when FALKORDB_URL is not set."""
    with patch.dict(os.environ, {}, clear=True):
        cfg = _build_config()
        assert "graph_store" not in cfg
