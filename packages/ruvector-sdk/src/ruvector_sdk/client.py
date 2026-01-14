import httpx
from typing import List, Optional, Dict, Any
from tenacity import retry, stop_after_attempt, wait_exponential

from .models import (
    Vector,
    SearchResult,
    Collection,
    IndexConfig,
    DistanceMetric,
    IndexType,
    UpsertRequest,
    SearchRequest,
    ClusterStatus,
)


class RuvectorClient:
    """Ruvector Python client with connection pooling and retries"""

    def __init__(
        self,
        host: str = "localhost",
        port: int = 6370,
        timeout: float = 30.0,
        max_retries: int = 3,
    ):
        """
        Initialize Ruvector client

        Args:
            host: Ruvector host address
            port: Ruvector port
            timeout: Request timeout in seconds
            max_retries: Maximum number of retry attempts
        """
        self.base_url = f"http://{host}:{port}"
        self.timeout = timeout
        self.max_retries = max_retries
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=timeout,
            limits=httpx.Limits(max_keepalive_connections=20, max_connections=100),
        )

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
    )
    async def _request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make HTTP request with retry logic"""
        response = await self.client.request(method, endpoint, **kwargs)
        response.raise_for_status()
        return response.json()

    # Collection Management

    async def create_collection(
        self,
        name: str,
        dimension: int,
        distance_metric: DistanceMetric = DistanceMetric.COSINE,
        index_type: IndexType = IndexType.HNSW,
        index_config: Optional[IndexConfig] = None,
    ) -> Collection:
        """
        Create a new collection

        Args:
            name: Collection name
            dimension: Vector dimension
            distance_metric: Distance metric for similarity
            index_type: Index type (HNSW or FLAT)
            index_config: Index configuration (for HNSW)

        Returns:
            Collection metadata
        """
        payload = {
            "name": name,
            "dimension": dimension,
            "distance_metric": distance_metric.value,
            "index_type": index_type.value,
        }

        if index_config and index_type == IndexType.HNSW:
            payload["index_config"] = index_config.dict()

        result = await self._request("POST", "/collections", json=payload)
        return Collection(**result)

    async def get_collection(self, name: str) -> Collection:
        """Get collection metadata"""
        result = await self._request("GET", f"/collections/{name}")
        return Collection(**result)

    async def list_collections(self) -> List[Collection]:
        """List all collections"""
        result = await self._request("GET", "/collections")
        return [Collection(**c) for c in result["collections"]]

    async def delete_collection(self, name: str) -> bool:
        """Delete a collection"""
        await self._request("DELETE", f"/collections/{name}")
        return True

    # Vector Operations

    async def upsert(
        self,
        collection: str,
        vectors: List[Vector],
        batch_size: int = 1000,
    ) -> int:
        """
        Upsert vectors in batches

        Args:
            collection: Collection name
            vectors: List of vectors to upsert
            batch_size: Batch size for upsert operations

        Returns:
            Number of vectors upserted
        """
        total_upserted = 0

        for i in range(0, len(vectors), batch_size):
            batch = vectors[i : i + batch_size]
            payload = UpsertRequest(vectors=batch)

            result = await self._request(
                "POST",
                f"/collections/{collection}/vectors",
                json=payload.dict(),
            )

            total_upserted += result.get("upserted", len(batch))

        return total_upserted

    async def get_vector(
        self,
        collection: str,
        vector_id: str,
        include_vector: bool = True,
    ) -> Optional[Vector]:
        """Get a vector by ID"""
        params = {"include_vector": include_vector}
        result = await self._request(
            "GET",
            f"/collections/{collection}/vectors/{vector_id}",
            params=params,
        )

        if not result:
            return None

        return Vector(**result)

    async def delete_vector(self, collection: str, vector_id: str) -> bool:
        """Delete a vector by ID"""
        await self._request(
            "DELETE",
            f"/collections/{collection}/vectors/{vector_id}",
        )
        return True

    async def search(
        self,
        collection: str,
        query_vector: List[float],
        top_k: int = 10,
        filter: Optional[Dict[str, Any]] = None,
        include_vectors: bool = False,
    ) -> List[SearchResult]:
        """
        Search for similar vectors

        Args:
            collection: Collection name
            query_vector: Query vector
            top_k: Number of results to return
            filter: Metadata filter
            include_vectors: Include vectors in results

        Returns:
            List of search results
        """
        payload = SearchRequest(
            vector=query_vector,
            top_k=top_k,
            filter=filter,
            include_vectors=include_vectors,
        )

        result = await self._request(
            "POST",
            f"/collections/{collection}/search",
            json=payload.dict(exclude_none=True),
        )

        return [SearchResult(**r) for r in result["results"]]

    async def cluster_status(self) -> ClusterStatus:
        """Get cluster status"""
        result = await self._request("GET", "/cluster/status")
        return ClusterStatus(**result)

    async def health_check(self) -> bool:
        """Check if Ruvector is healthy"""
        try:
            await self._request("GET", "/health")
            return True
        except Exception:
            return False

    async def count_vectors(self, collection: str) -> int:
        """Count vectors in a collection"""
        result = await self._request("GET", f"/collections/{collection}/count")
        return result["count"]

    async def scroll(
        self,
        collection: str,
        batch_size: int = 100,
        offset: int = 0,
    ) -> List[Vector]:
        """
        Scroll through vectors in a collection

        Args:
            collection: Collection name
            batch_size: Number of vectors to retrieve
            offset: Starting offset

        Returns:
            List of vectors
        """
        params = {"limit": batch_size, "offset": offset}
        result = await self._request(
            "GET",
            f"/collections/{collection}/scroll",
            params=params,
        )

        return [Vector(**v) for v in result["vectors"]]
