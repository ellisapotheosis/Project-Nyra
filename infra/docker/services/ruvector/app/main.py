"""
RuVector Intelligence System - Main MCP Server
==============================================================================

High-performance neural pattern matching with:
- SONA: Self-Optimizing Neural Architecture (<0.05ms adaptation)
- MoE: Mixture of Experts (12 experts, top-3 routing)
- HNSW: 150x-12,500x faster pattern search
- EWC++: Elastic Weight Consolidation (prevent forgetting)
- Flash Attention: 2.49x-7.47x speedup
- LoRA: Low-rank adaptation for fine-tuning

4-step Intelligence Pipeline:
1. RETRIEVE: HNSW pattern search
2. JUDGE: Verdict evaluation
3. DISTILL: LoRA key learnings
4. CONSOLIDATE: EWC++ prevent forgetting

Port: 7000 (MCP Server)
Endpoints:
- GET /health - Health check
- POST /retrieve - Pattern retrieval
- POST /judge - Verdict judgment
- POST /distill - Knowledge distillation
- POST /consolidate - Memory consolidation
- POST /search - Vector search
- POST /embed - Generate embeddings
- GET /metrics - Prometheus metrics
"""

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from typing import Dict, Any, List

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import structlog
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response

from .intelligence import RuVectorIntelligence
from .config import settings

# Configure structured logging
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ]
)
logger = structlog.get_logger()

# Prometheus metrics
REQUESTS_TOTAL = Counter('ruvector_requests_total', 'Total requests', ['endpoint'])
REQUEST_DURATION = Histogram('ruvector_request_duration_seconds', 'Request duration', ['endpoint'])
PATTERNS_STORED = Counter('ruvector_patterns_stored_total', 'Total patterns stored')
PATTERNS_RETRIEVED = Counter('ruvector_patterns_retrieved_total', 'Total patterns retrieved')
VERDICT_JUDGMENTS = Counter('ruvector_verdict_judgments_total', 'Total verdict judgments', ['verdict'])
MEMORY_CONSOLIDATIONS = Counter('ruvector_memory_consolidations_total', 'Total memory consolidations')
ACTIVE_EXPERTS = Gauge('ruvector_active_experts', 'Number of active experts')
SONA_ADAPTATION_TIME = Histogram('ruvector_sona_adaptation_seconds', 'SONA adaptation time')
HNSW_SEARCH_TIME = Histogram('ruvector_hnsw_search_seconds', 'HNSW search time')

# Initialize intelligence system
intelligence: RuVectorIntelligence = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle management for RuVector Intelligence System."""
    global intelligence

    logger.info("starting_ruvector", version=settings.VERSION)

    # Initialize intelligence system
    intelligence = RuVectorIntelligence(
        neural_data_path=settings.NEURAL_DATA_PATH,
        agentdb_path=settings.AGENTDB_PATH,
        expert_count=settings.MOE_EXPERT_COUNT,
        top_k_experts=settings.MOE_TOP_K,
        hnsw_m=settings.HNSW_M,
        hnsw_ef=settings.HNSW_EF
    )

    await intelligence.initialize()

    logger.info("ruvector_started",
                experts=settings.MOE_EXPERT_COUNT,
                hnsw_enabled=settings.HNSW_ENABLED,
                flash_attention=settings.FLASH_ATTENTION_ENABLED)

    yield

    # Cleanup
    await intelligence.shutdown()
    logger.info("ruvector_stopped")


app = FastAPI(
    title="RuVector Intelligence System",
    description="High-performance neural pattern matching with SONA, MoE, HNSW, EWC++, Flash Attention",
    version=settings.VERSION,
    lifespan=lifespan
)


# ==============================================================================
# Request/Response Models
# ==============================================================================

class HealthResponse(BaseModel):
    status: str
    version: str
    components: Dict[str, bool]


class RetrieveRequest(BaseModel):
    query: str = Field(..., description="Query text for pattern retrieval")
    k: int = Field(5, ge=1, le=100, description="Number of patterns to retrieve")
    min_similarity: float = Field(0.7, ge=0.0, le=1.0, description="Minimum similarity threshold")


class RetrieveResponse(BaseModel):
    patterns: List[Dict[str, Any]]
    retrieval_time_ms: float
    expert_activations: Dict[str, float]


class JudgeRequest(BaseModel):
    trajectory_id: str = Field(..., description="Trajectory identifier")
    task: str = Field(..., description="Task description")
    output: str = Field(..., description="Task output")
    success: bool = Field(..., description="Success flag")
    reward: float = Field(..., ge=0.0, le=1.0, description="Reward score")


class JudgeResponse(BaseModel):
    verdict: str
    confidence: float
    critique: str
    judgment_time_ms: float


class DistillRequest(BaseModel):
    patterns: List[Dict[str, Any]] = Field(..., description="Patterns to distill")
    epochs: int = Field(5, ge=1, le=100, description="Training epochs")


class DistillResponse(BaseModel):
    distilled_patterns: int
    loss: float
    distillation_time_ms: float


class ConsolidateRequest(BaseModel):
    consolidation_type: str = Field("ewc", description="Consolidation method: ewc, lora, both")


class ConsolidateResponse(BaseModel):
    consolidated: bool
    method: str
    consolidation_time_ms: float


class SearchRequest(BaseModel):
    query_embedding: List[float] = Field(..., description="Query embedding vector")
    k: int = Field(10, ge=1, le=1000, description="Number of results")


class SearchResponse(BaseModel):
    results: List[Dict[str, Any]]
    search_time_ms: float
    speedup_factor: float


class EmbedRequest(BaseModel):
    texts: List[str] = Field(..., description="Texts to embed")
    normalize: bool = Field(True, description="Normalize embeddings")


class EmbedResponse(BaseModel):
    embeddings: List[List[float]]
    dimensions: int
    embedding_time_ms: float


# ==============================================================================
# Health & Monitoring Endpoints
# ==============================================================================

@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint."""
    REQUESTS_TOTAL.labels(endpoint='/health').inc()

    components = {
        "sona": intelligence.sona_enabled,
        "moe": intelligence.moe_enabled,
        "hnsw": intelligence.hnsw_enabled,
        "ewc": intelligence.ewc_enabled,
        "flash_attention": intelligence.flash_attention_enabled
    }

    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        components=components
    )


@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint."""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


# ==============================================================================
# Intelligence Pipeline Endpoints
# ==============================================================================

@app.post("/retrieve", response_model=RetrieveResponse)
async def retrieve_patterns(request: RetrieveRequest):
    """
    STEP 1: RETRIEVE
    Fetch relevant patterns via HNSW-enhanced search.
    """
    REQUESTS_TOTAL.labels(endpoint='/retrieve').inc()

    with REQUEST_DURATION.labels(endpoint='/retrieve').time():
        try:
            result = await intelligence.retrieve(
                query=request.query,
                k=request.k,
                min_similarity=request.min_similarity
            )

            PATTERNS_RETRIEVED.inc(len(result["patterns"]))
            HNSW_SEARCH_TIME.observe(result["retrieval_time_ms"] / 1000)

            return RetrieveResponse(**result)

        except Exception as e:
            logger.error("retrieve_failed", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))


@app.post("/judge", response_model=JudgeResponse)
async def judge_verdict(request: JudgeRequest):
    """
    STEP 2: JUDGE
    Evaluate trajectory with verdict judgment.
    """
    REQUESTS_TOTAL.labels(endpoint='/judge').inc()

    with REQUEST_DURATION.labels(endpoint='/judge').time():
        try:
            result = await intelligence.judge(
                trajectory_id=request.trajectory_id,
                task=request.task,
                output=request.output,
                success=request.success,
                reward=request.reward
            )

            VERDICT_JUDGMENTS.labels(verdict=result["verdict"]).inc()

            return JudgeResponse(**result)

        except Exception as e:
            logger.error("judge_failed", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))


@app.post("/distill", response_model=DistillResponse)
async def distill_knowledge(request: DistillRequest):
    """
    STEP 3: DISTILL
    Extract key learnings via LoRA fine-tuning.
    """
    REQUESTS_TOTAL.labels(endpoint='/distill').inc()

    with REQUEST_DURATION.labels(endpoint='/distill').time():
        try:
            result = await intelligence.distill(
                patterns=request.patterns,
                epochs=request.epochs
            )

            return DistillResponse(**result)

        except Exception as e:
            logger.error("distill_failed", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))


@app.post("/consolidate", response_model=ConsolidateResponse)
async def consolidate_memory(request: ConsolidateRequest):
    """
    STEP 4: CONSOLIDATE
    Prevent catastrophic forgetting via EWC++.
    """
    REQUESTS_TOTAL.labels(endpoint='/consolidate').inc()

    with REQUEST_DURATION.labels(endpoint='/consolidate').time():
        try:
            result = await intelligence.consolidate(
                consolidation_type=request.consolidation_type
            )

            MEMORY_CONSOLIDATIONS.inc()

            return ConsolidateResponse(**result)

        except Exception as e:
            logger.error("consolidate_failed", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# Utility Endpoints
# ==============================================================================

@app.post("/search", response_model=SearchResponse)
async def vector_search(request: SearchRequest):
    """Direct HNSW vector search."""
    REQUESTS_TOTAL.labels(endpoint='/search').inc()

    with REQUEST_DURATION.labels(endpoint='/search').time():
        try:
            result = await intelligence.search(
                query_embedding=request.query_embedding,
                k=request.k
            )

            return SearchResponse(**result)

        except Exception as e:
            logger.error("search_failed", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))


@app.post("/embed", response_model=EmbedResponse)
async def generate_embeddings(request: EmbedRequest):
    """Generate embeddings for texts."""
    REQUESTS_TOTAL.labels(endpoint='/embed').inc()

    with REQUEST_DURATION.labels(endpoint='/embed').time():
        try:
            result = await intelligence.embed(
                texts=request.texts,
                normalize=request.normalize
            )

            return EmbedResponse(**result)

        except Exception as e:
            logger.error("embed_failed", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# Application Entry Point
# ==============================================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.RUVECTOR_HOST,
        port=settings.RUVECTOR_PORT,
        log_level="info",
        access_log=True
    )
