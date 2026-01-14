from abc import ABC, abstractmethod
from typing import List, Union
import numpy as np


class EmbeddingGenerator(ABC):
    """Abstract base class for embedding generators"""

    @abstractmethod
    def embed(self, texts: Union[str, List[str]]) -> Union[List[float], List[List[float]]]:
        """Generate embeddings for text(s)"""
        pass

    @abstractmethod
    def dimension(self) -> int:
        """Get embedding dimension"""
        pass


class OpenAIEmbeddings(EmbeddingGenerator):
    """OpenAI embeddings generator"""

    def __init__(self, api_key: str, model: str = "text-embedding-ada-002"):
        """
        Initialize OpenAI embeddings

        Args:
            api_key: OpenAI API key
            model: Embedding model name
        """
        try:
            from openai import OpenAI
        except ImportError:
            raise ImportError(
                "openai package is required for OpenAIEmbeddings. "
                "Install with: pip install ruvector-sdk[embeddings]"
            )

        self.client = OpenAI(api_key=api_key)
        self.model = model
        self._dimension = 1536 if "ada" in model else 1536  # ada-002 is 1536-dim

    def embed(self, texts: Union[str, List[str]]) -> Union[List[float], List[List[float]]]:
        """Generate OpenAI embeddings"""
        is_single = isinstance(texts, str)
        if is_single:
            texts = [texts]

        response = self.client.embeddings.create(
            model=self.model,
            input=texts,
        )

        embeddings = [item.embedding for item in response.data]

        return embeddings[0] if is_single else embeddings

    def dimension(self) -> int:
        """Get embedding dimension"""
        return self._dimension


class SentenceTransformerEmbeddings(EmbeddingGenerator):
    """Sentence Transformers embeddings (local)"""

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize Sentence Transformer embeddings

        Args:
            model_name: Model name from sentence-transformers
                       Popular options:
                       - all-MiniLM-L6-v2 (384-dim, fast, good quality)
                       - all-mpnet-base-v2 (768-dim, best quality, slower)
                       - paraphrase-multilingual-MiniLM-L12-v2 (384-dim, multilingual)
        """
        try:
            from sentence_transformers import SentenceTransformer
        except ImportError:
            raise ImportError(
                "sentence-transformers is required for SentenceTransformerEmbeddings. "
                "Install with: pip install ruvector-sdk[embeddings]"
            )

        self.model = SentenceTransformer(model_name)
        self._dimension = self.model.get_sentence_embedding_dimension()

    def embed(self, texts: Union[str, List[str]]) -> Union[List[float], List[List[float]]]:
        """Generate Sentence Transformer embeddings"""
        is_single = isinstance(texts, str)
        if is_single:
            texts = [texts]

        embeddings = self.model.encode(texts, convert_to_numpy=True)
        embeddings = embeddings.tolist()

        return embeddings[0] if is_single else embeddings

    def dimension(self) -> int:
        """Get embedding dimension"""
        return self._dimension


class HuggingFaceEmbeddings(EmbeddingGenerator):
    """HuggingFace Transformers embeddings"""

    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        """
        Initialize HuggingFace embeddings

        Args:
            model_name: Model identifier from HuggingFace Hub
        """
        try:
            from transformers import AutoTokenizer, AutoModel
            import torch
        except ImportError:
            raise ImportError(
                "transformers and torch are required for HuggingFaceEmbeddings. "
                "Install with: pip install transformers torch"
            )

        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name)
        self._dimension = self.model.config.hidden_size
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model.to(self.device)

    def embed(self, texts: Union[str, List[str]]) -> Union[List[float], List[List[float]]]:
        """Generate HuggingFace embeddings"""
        import torch

        is_single = isinstance(texts, str)
        if is_single:
            texts = [texts]

        # Tokenize
        encoded = self.tokenizer(
            texts,
            padding=True,
            truncation=True,
            return_tensors="pt",
        )
        encoded = {k: v.to(self.device) for k, v in encoded.items()}

        # Generate embeddings
        with torch.no_grad():
            outputs = self.model(**encoded)
            # Mean pooling
            embeddings = outputs.last_hidden_state.mean(dim=1)
            embeddings = embeddings.cpu().numpy()

        embeddings = embeddings.tolist()

        return embeddings[0] if is_single else embeddings

    def dimension(self) -> int:
        """Get embedding dimension"""
        return self._dimension


# Utility functions

def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Calculate cosine similarity between two vectors"""
    a_np = np.array(a)
    b_np = np.array(b)

    dot_product = np.dot(a_np, b_np)
    norm_a = np.linalg.norm(a_np)
    norm_b = np.linalg.norm(b_np)

    return dot_product / (norm_a * norm_b)


def euclidean_distance(a: List[float], b: List[float]) -> float:
    """Calculate Euclidean distance between two vectors"""
    a_np = np.array(a)
    b_np = np.array(b)

    return float(np.linalg.norm(a_np - b_np))


def normalize_vector(vector: List[float]) -> List[float]:
    """Normalize a vector to unit length"""
    vec_np = np.array(vector)
    norm = np.linalg.norm(vec_np)

    if norm == 0:
        return vector

    normalized = vec_np / norm
    return normalized.tolist()
