"""
RuVector Intelligence System - Configuration
==============================================================================
"""

import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """RuVector configuration settings."""

    # Service Configuration
    VERSION: str = "1.0.0"
    RUVECTOR_HOST: str = "0.0.0.0"
    RUVECTOR_PORT: int = 7000

    # Data Paths
    NEURAL_DATA_PATH: str = "/data/neural"
    AGENTDB_PATH: str = "/data/agentdb"
    CACHE_PATH: str = "/data/cache"

    # SONA Configuration
    SONA_ENABLED: bool = True
    SONA_ADAPTATION_TIME: float = 0.05  # ms
    SONA_LEARNING_RATE: float = 0.001
    SONA_MODE: str = "balanced"  # fast, balanced, quality

    # MoE Configuration
    MOE_ENABLED: bool = True
    MOE_EXPERT_COUNT: int = 12
    MOE_TOP_K: int = 3
    MOE_LOAD_BALANCING: bool = True
    MOE_SPECIALIZATION: str = "adaptive"

    # HNSW Configuration
    HNSW_ENABLED: bool = True
    HNSW_M: int = 32
    HNSW_EF: int = 400
    HNSW_EF_CONSTRUCTION: int = 400
    HNSW_SPACE: str = "cosine"  # cosine, l2, ip

    # EWC++ Configuration
    EWC_ENABLED: bool = True
    EWC_LAMBDA: float = 0.5
    EWC_CONSOLIDATION_INTERVAL: int = 100

    # Flash Attention Configuration
    FLASH_ATTENTION_ENABLED: bool = True
    FLASH_ATTENTION_BLOCK_SIZE: int = 64
    FLASH_ATTENTION_TARGET_SPEEDUP: float = 5.0

    # LoRA Configuration
    LORA_ENABLED: bool = True
    LORA_RANK: int = 8
    LORA_ALPHA: int = 16
    LORA_DROPOUT: float = 0.1

    # Embedding Configuration
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    EMBEDDING_DIMENSIONS: int = 384
    EMBEDDING_BATCH_SIZE: int = 32

    # Intelligence Pipeline
    TRAJECTORY_TRACKING: bool = True
    VERDICT_JUDGMENT: bool = True
    PATTERN_DISTILLATION: bool = True
    MEMORY_CONSOLIDATION: bool = True

    # Performance
    MAX_WORKERS: int = 4
    CACHE_SIZE: int = 10000

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
