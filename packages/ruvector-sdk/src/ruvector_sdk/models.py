from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class DistanceMetric(str, Enum):
    """Distance metric for vector similarity"""
    COSINE = "cosine"
    EUCLIDEAN = "euclidean"
    DOT_PRODUCT = "dot_product"
    MANHATTAN = "manhattan"


class IndexType(str, Enum):
    """Index type for vector storage"""
    HNSW = "hnsw"  # Hierarchical Navigable Small World
    FLAT = "flat"  # Brute force


class Vector(BaseModel):
    """Vector data model"""
    id: str
    vector: List[float]
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        frozen = False


class SearchResult(BaseModel):
    """Vector search result"""
    id: str
    score: float
    vector: Optional[List[float]] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class Collection(BaseModel):
    """Collection metadata"""
    name: str
    dimension: int
    distance_metric: DistanceMetric
    index_type: IndexType
    vector_count: int = 0
    created_at: Optional[str] = None


class IndexConfig(BaseModel):
    """Index configuration for HNSW"""
    m: int = Field(default=16, description="Max connections per node")
    ef_construction: int = Field(default=200, description="Size of dynamic candidate list for construction")
    ef_search: int = Field(default=50, description="Size of dynamic candidate list for search")


class UpsertRequest(BaseModel):
    """Batch upsert request"""
    vectors: List[Vector]


class SearchRequest(BaseModel):
    """Vector search request"""
    vector: List[float]
    top_k: int = Field(default=10, ge=1, le=1000)
    filter: Optional[Dict[str, Any]] = None
    include_vectors: bool = False


class ClusterStatus(BaseModel):
    """Ruvector cluster status"""
    leader: str
    followers: List[str]
    healthy: bool
    total_vectors: int
    total_collections: int
