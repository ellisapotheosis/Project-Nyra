#!/usr/bin/env python3
"""
🔍 NYRA Universal Search & Knowledge Base

Aggregates data from all MCP servers into a searchable knowledge base spanning:
- Code repositories (GitHub MCP)
- Local files (FileSystem MCP)
- Secrets metadata (Infisical MCP)
- Development notes and documentation
"""

import asyncio
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, asdict
from enum import Enum
import hashlib
import re
import sqlite3
from urllib.parse import urlparse
import time

# Third-party imports
import aiohttp
import aiofiles
import chromadb
from chromadb.config import Settings
import pandas as pd
from sentence_transformers import SentenceTransformer
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ContentType(Enum):
    CODE = "code"
    DOCUMENTATION = "documentation"
    CONFIG = "config"
    SECRET_METADATA = "secret_metadata"
    REPOSITORY = "repository"
    ISSUE = "issue"
    COMMIT = "commit"
    FILE = "file"
    NOTE = "note"

@dataclass
class KnowledgeItem:
    id: str
    title: str
    content: str
    content_type: ContentType
    source: str  # MCP server that provided this
    metadata: Dict[str, Any]
    embedding: Optional[List[float]] = None
    created_at: datetime = None
    updated_at: datetime = None
    tags: List[str] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now(timezone.utc)
        if self.updated_at is None:
            self.updated_at = self.created_at
        if self.tags is None:
            self.tags = []

@dataclass
class SearchResult:
    item: KnowledgeItem
    score: float
    highlight: str
    context: Dict[str, Any]

class MCPDataCollector:
    """Collects data from various MCP servers"""
    
    def __init__(self, base_url: str = "http://localhost:12008"):
        self.base_url = base_url
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def collect_all_data(self) -> List[KnowledgeItem]:
        """Collect data from all available MCP servers"""
        items = []
        
        # Collect from GitHub MCP
        github_items = await self._collect_github_data()
        items.extend(github_items)
        
        # Collect from FileSystem MCP
        filesystem_items = await self._collect_filesystem_data()
        items.extend(filesystem_items)
        
        # Collect from Infisical MCP (metadata only, not secrets)
        infisical_items = await self._collect_infisical_metadata()
        items.extend(infisical_items)
        
        # Collect from Docker MCP
        docker_items = await self._collect_docker_data()
        items.extend(docker_items)
        
        logger.info(f"Collected {len(items)} knowledge items from MCP servers")
        return items
    
    async def _call_mcp_server(self, server: str, method: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Call MCP server endpoint"""
        if not self.session:
            raise RuntimeError("MCPDataCollector must be used as async context manager")
        
        url = f"{self.base_url}/mcp/{server}/{method}"
        try:
            async with self.session.post(url, json=params or {}) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    logger.warning(f"MCP call failed: {server}/{method} - {response.status}")
                    return {}
        except Exception as e:
            logger.warning(f"MCP call error: {server}/{method} - {e}")
            return {}
    
    async def _collect_github_data(self) -> List[KnowledgeItem]:
        """Collect data from GitHub MCP"""
        items = []
        
        try:
            # Get repositories
            repos_data = await self._call_mcp_server("github", "list_repositories")
            
            for repo in repos_data.get("repositories", []):
                # Repository metadata
                repo_item = KnowledgeItem(
                    id=f"github_repo_{repo['id']}",
                    title=repo["name"],
                    content=repo.get("description", "") + "\n" + repo.get("readme", ""),
                    content_type=ContentType.REPOSITORY,
                    source="github_mcp",
                    metadata={
                        "url": repo["html_url"],
                        "language": repo.get("language"),
                        "stars": repo.get("stargazers_count", 0),
                        "forks": repo.get("forks_count", 0),
                        "topics": repo.get("topics", [])
                    },
                    tags=repo.get("topics", []) + [repo.get("language", "").lower()]
                )
                items.append(repo_item)
                
                # Get issues
                issues_data = await self._call_mcp_server("github", "list_issues", {
                    "repo": repo["name"]
                })
                
                for issue in issues_data.get("issues", [])[:10]:  # Limit to recent issues
                    issue_item = KnowledgeItem(
                        id=f"github_issue_{issue['id']}",
                        title=issue["title"],
                        content=issue.get("body", ""),
                        content_type=ContentType.ISSUE,
                        source="github_mcp",
                        metadata={
                            "repo": repo["name"],
                            "number": issue["number"],
                            "state": issue["state"],
                            "url": issue["html_url"],
                            "labels": [label["name"] for label in issue.get("labels", [])]
                        },
                        tags=[issue["state"]] + [label["name"] for label in issue.get("labels", [])]
                    )
                    items.append(issue_item)
                
                # Get recent commits
                commits_data = await self._call_mcp_server("github", "list_commits", {
                    "repo": repo["name"],
                    "limit": 20
                })
                
                for commit in commits_data.get("commits", []):
                    commit_item = KnowledgeItem(
                        id=f"github_commit_{commit['sha'][:8]}",
                        title=commit["commit"]["message"].split('\n')[0],
                        content=commit["commit"]["message"],
                        content_type=ContentType.COMMIT,
                        source="github_mcp",
                        metadata={
                            "repo": repo["name"],
                            "sha": commit["sha"],
                            "author": commit["commit"]["author"]["name"],
                            "url": commit["html_url"],
                            "files_changed": len(commit.get("files", []))
                        },
                        tags=["commit", repo["name"].lower()]
                    )
                    items.append(commit_item)
        
        except Exception as e:
            logger.error(f"Error collecting GitHub data: {e}")
        
        return items
    
    async def _collect_filesystem_data(self) -> List[KnowledgeItem]:
        """Collect data from FileSystem MCP"""
        items = []
        
        try:
            # Get project files
            files_data = await self._call_mcp_server("filesystem", "list_files", {
                "path": "C:/Dev/Tools/MCP-Servers",
                "recursive": True,
                "include_patterns": ["*.md", "*.py", "*.js", "*.ts", "*.json", "*.yml", "*.yaml"]
            })
            
            for file_info in files_data.get("files", [])[:100]:  # Limit to avoid overwhelming
                try:
                    # Read file content
                    content_data = await self._call_mcp_server("filesystem", "read_file", {
                        "path": file_info["path"]
                    })
                    
                    content = content_data.get("content", "")
                    if len(content) > 10000:  # Truncate very large files
                        content = content[:10000] + "...[truncated]"
                    
                    # Determine content type
                    if file_info["name"].endswith(('.md', '.txt', '.rst')):
                        content_type = ContentType.DOCUMENTATION
                    elif file_info["name"].endswith(('.json', '.yml', '.yaml', '.toml', '.ini')):
                        content_type = ContentType.CONFIG
                    else:
                        content_type = ContentType.CODE
                    
                    file_item = KnowledgeItem(
                        id=f"filesystem_{hashlib.md5(file_info['path'].encode()).hexdigest()}",
                        title=file_info["name"],
                        content=content,
                        content_type=content_type,
                        source="filesystem_mcp",
                        metadata={
                            "path": file_info["path"],
                            "size": file_info.get("size", 0),
                            "extension": file_info["name"].split('.')[-1] if '.' in file_info["name"] else "",
                            "directory": str(Path(file_info["path"]).parent)
                        },
                        tags=[
                            file_info["name"].split('.')[-1].lower() if '.' in file_info["name"] else "",
                            Path(file_info["path"]).parent.name.lower()
                        ]
                    )
                    items.append(file_item)
                
                except Exception as e:
                    logger.warning(f"Error reading file {file_info['path']}: {e}")
                    continue
        
        except Exception as e:
            logger.error(f"Error collecting FileSystem data: {e}")
        
        return items
    
    async def _collect_infisical_metadata(self) -> List[KnowledgeItem]:
        """Collect metadata from Infisical MCP (not actual secrets)"""
        items = []
        
        try:
            # Get environments and projects (metadata only)
            projects_data = await self._call_mcp_server("infisical", "list_projects")
            
            for project in projects_data.get("projects", []):
                project_item = KnowledgeItem(
                    id=f"infisical_project_{project['id']}",
                    title=f"Infisical Project: {project['name']}",
                    content=f"Project: {project['name']}\nEnvironments: {', '.join(project.get('environments', []))}",
                    content_type=ContentType.SECRET_METADATA,
                    source="infisical_mcp",
                    metadata={
                        "project_id": project["id"],
                        "environments": project.get("environments", []),
                        "secret_count": project.get("secret_count", 0)
                    },
                    tags=["secrets", "infisical"] + project.get("environments", [])
                )
                items.append(project_item)
        
        except Exception as e:
            logger.error(f"Error collecting Infisical metadata: {e}")
        
        return items
    
    async def _collect_docker_data(self) -> List[KnowledgeItem]:
        """Collect data from Docker MCP"""
        items = []
        
        try:
            # Get containers
            containers_data = await self._call_mcp_server("docker", "list_containers")
            
            for container in containers_data.get("containers", []):
                container_item = KnowledgeItem(
                    id=f"docker_container_{container['id'][:12]}",
                    title=f"Container: {container['name']}",
                    content=f"Image: {container['image']}\nStatus: {container['status']}\nPorts: {container.get('ports', '')}",
                    content_type=ContentType.CONFIG,
                    source="docker_mcp",
                    metadata={
                        "container_id": container["id"],
                        "image": container["image"],
                        "status": container["status"],
                        "ports": container.get("ports", []),
                        "labels": container.get("labels", {})
                    },
                    tags=["docker", "container", container["status"].lower()]
                )
                items.append(container_item)
            
            # Get images
            images_data = await self._call_mcp_server("docker", "list_images")
            
            for image in images_data.get("images", []):
                image_item = KnowledgeItem(
                    id=f"docker_image_{image['id'][:12]}",
                    title=f"Image: {image['repository']}:{image['tag']}",
                    content=f"Repository: {image['repository']}\nTag: {image['tag']}\nSize: {image.get('size', 'Unknown')}",
                    content_type=ContentType.CONFIG,
                    source="docker_mcp",
                    metadata={
                        "image_id": image["id"],
                        "repository": image["repository"],
                        "tag": image["tag"],
                        "size": image.get("size", 0)
                    },
                    tags=["docker", "image", image["repository"].lower()]
                )
                items.append(image_item)
        
        except Exception as e:
            logger.error(f"Error collecting Docker data: {e}")
        
        return items

class VectorSearchEngine:
    """Vector-based semantic search engine using ChromaDB"""
    
    def __init__(self, db_path: str = "./knowledge_base_db"):
        self.db_path = Path(db_path)
        self.db_path.mkdir(exist_ok=True)
        
        # Initialize ChromaDB
        self.client = chromadb.PersistentClient(
            path=str(self.db_path),
            settings=Settings(anonymized_telemetry=False)
        )
        
        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name="nyra_knowledge_base",
            metadata={"description": "NYRA MCP Knowledge Base"}
        )
        
        # Initialize sentence transformer for embeddings
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Initialize SQLite for metadata and full-text search
        self.sqlite_path = self.db_path / "knowledge.db"
        self._init_sqlite()
    
    def _init_sqlite(self):
        """Initialize SQLite database for metadata and full-text search"""
        with sqlite3.connect(self.sqlite_path) as conn:
            conn.execute("""
                CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_fts USING fts5(
                    id,
                    title,
                    content,
                    content_type,
                    source,
                    tags,
                    metadata
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS knowledge_metadata (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    content_type TEXT NOT NULL,
                    source TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    metadata TEXT NOT NULL,
                    tags TEXT NOT NULL
                )
            """)
    
    def add_items(self, items: List[KnowledgeItem]):
        """Add knowledge items to the search engine"""
        if not items:
            return
        
        logger.info(f"Adding {len(items)} items to knowledge base")
        
        # Generate embeddings
        contents = [item.content for item in items]
        embeddings = self.model.encode(contents).tolist()
        
        # Prepare data for ChromaDB
        ids = [item.id for item in items]
        metadatas = []
        documents = []
        
        for i, item in enumerate(items):
            item.embedding = embeddings[i]
            
            metadatas.append({
                "title": item.title,
                "content_type": item.content_type.value,
                "source": item.source,
                "created_at": item.created_at.isoformat(),
                "tags": ",".join(item.tags)
            })
            documents.append(item.content)
        
        # Add to ChromaDB
        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            metadatas=metadatas,
            documents=documents
        )
        
        # Add to SQLite for full-text search and metadata
        with sqlite3.connect(self.sqlite_path) as conn:
            for item in items:
                # Full-text search table
                conn.execute("""
                    INSERT OR REPLACE INTO knowledge_fts 
                    (id, title, content, content_type, source, tags, metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    item.id,
                    item.title,
                    item.content,
                    item.content_type.value,
                    item.source,
                    ",".join(item.tags),
                    json.dumps(item.metadata)
                ))
                
                # Metadata table
                conn.execute("""
                    INSERT OR REPLACE INTO knowledge_metadata
                    (id, title, content_type, source, created_at, updated_at, metadata, tags)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    item.id,
                    item.title,
                    item.content_type.value,
                    item.source,
                    item.created_at.isoformat(),
                    item.updated_at.isoformat(),
                    json.dumps(item.metadata),
                    ",".join(item.tags)
                ))
            
            conn.commit()
        
        logger.info(f"Successfully added {len(items)} items to knowledge base")
    
    def search(
        self, 
        query: str, 
        limit: int = 10, 
        content_types: Optional[List[ContentType]] = None,
        sources: Optional[List[str]] = None,
        tags: Optional[List[str]] = None
    ) -> List[SearchResult]:
        """Search the knowledge base"""
        results = []
        
        # Semantic search using ChromaDB
        semantic_results = self._semantic_search(query, limit * 2, content_types, sources, tags)
        
        # Full-text search using SQLite FTS
        fts_results = self._fulltext_search(query, limit * 2, content_types, sources, tags)
        
        # Combine and deduplicate results
        seen_ids = set()
        for result in semantic_results + fts_results:
            if result.item.id not in seen_ids:
                results.append(result)
                seen_ids.add(result.item.id)
        
        # Sort by score and limit
        results.sort(key=lambda x: x.score, reverse=True)
        return results[:limit]
    
    def _semantic_search(
        self, 
        query: str, 
        limit: int,
        content_types: Optional[List[ContentType]] = None,
        sources: Optional[List[str]] = None,
        tags: Optional[List[str]] = None
    ) -> List[SearchResult]:
        """Perform semantic search using vector embeddings"""
        # Build where clause for filtering
        where_clause = {}
        if content_types:
            where_clause["content_type"] = {"$in": [ct.value for ct in content_types]}
        if sources:
            where_clause["source"] = {"$in": sources}
        
        # Query ChromaDB
        try:
            query_embedding = self.model.encode([query]).tolist()[0]
            
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=limit,
                where=where_clause if where_clause else None
            )
            
            search_results = []
            for i, doc_id in enumerate(results['ids'][0]):
                metadata = results['metadatas'][0][i]
                content = results['documents'][0][i]
                distance = results['distances'][0][i]
                
                # Convert distance to similarity score (0-1)
                score = max(0, 1 - distance)
                
                # Create KnowledgeItem from results
                item = KnowledgeItem(
                    id=doc_id,
                    title=metadata['title'],
                    content=content,
                    content_type=ContentType(metadata['content_type']),
                    source=metadata['source'],
                    metadata={},  # Full metadata retrieved separately if needed
                    tags=metadata.get('tags', '').split(',') if metadata.get('tags') else []
                )
                
                # Generate highlight
                highlight = self._generate_highlight(content, query)
                
                search_results.append(SearchResult(
                    item=item,
                    score=score,
                    highlight=highlight,
                    context={"search_type": "semantic", "distance": distance}
                ))
            
            return search_results
        
        except Exception as e:
            logger.error(f"Semantic search error: {e}")
            return []
    
    def _fulltext_search(
        self,
        query: str,
        limit: int,
        content_types: Optional[List[ContentType]] = None,
        sources: Optional[List[str]] = None,
        tags: Optional[List[str]] = None
    ) -> List[SearchResult]:
        """Perform full-text search using SQLite FTS"""
        try:
            with sqlite3.connect(self.sqlite_path) as conn:
                # Build WHERE clause
                where_conditions = []
                params = [query]
                
                if content_types:
                    placeholders = ','.join(['?' for _ in content_types])
                    where_conditions.append(f"content_type IN ({placeholders})")
                    params.extend([ct.value for ct in content_types])
                
                if sources:
                    placeholders = ','.join(['?' for _ in sources])
                    where_conditions.append(f"source IN ({placeholders})")
                    params.extend(sources)
                
                where_clause = " AND " + " AND ".join(where_conditions) if where_conditions else ""
                
                cursor = conn.execute(f"""
                    SELECT id, title, content, content_type, source, tags, metadata, rank
                    FROM knowledge_fts 
                    WHERE knowledge_fts MATCH ?{where_clause}
                    ORDER BY rank
                    LIMIT ?
                """, params + [limit])
                
                search_results = []
                for row in cursor.fetchall():
                    doc_id, title, content, content_type, source, tags_str, metadata_str, rank = row
                    
                    # FTS rank is negative, convert to positive score
                    score = max(0, -rank / 10.0)  # Normalize rank to reasonable score
                    
                    item = KnowledgeItem(
                        id=doc_id,
                        title=title,
                        content=content,
                        content_type=ContentType(content_type),
                        source=source,
                        metadata=json.loads(metadata_str) if metadata_str else {},
                        tags=tags_str.split(',') if tags_str else []
                    )
                    
                    highlight = self._generate_highlight(content, query)
                    
                    search_results.append(SearchResult(
                        item=item,
                        score=score,
                        highlight=highlight,
                        context={"search_type": "fulltext", "rank": rank}
                    ))
                
                return search_results
        
        except Exception as e:
            logger.error(f"Full-text search error: {e}")
            return []
    
    def _generate_highlight(self, content: str, query: str) -> str:
        """Generate highlighted snippet from content"""
        words = query.lower().split()
        content_lower = content.lower()
        
        # Find first occurrence of any query word
        best_pos = float('inf')
        for word in words:
            pos = content_lower.find(word)
            if pos != -1 and pos < best_pos:
                best_pos = pos
        
        if best_pos == float('inf'):
            # No match found, return beginning
            return content[:200] + "..." if len(content) > 200 else content
        
        # Extract context around the match
        start = max(0, best_pos - 100)
        end = min(len(content), best_pos + 200)
        snippet = content[start:end]
        
        # Add ellipsis if truncated
        if start > 0:
            snippet = "..." + snippet
        if end < len(content):
            snippet = snippet + "..."
        
        # Highlight query words (simple approach)
        for word in words:
            pattern = re.compile(re.escape(word), re.IGNORECASE)
            snippet = pattern.sub(f"**{word.upper()}**", snippet)
        
        return snippet
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get knowledge base statistics"""
        try:
            # Get total count from ChromaDB
            total_items = self.collection.count()
            
            # Get statistics from SQLite
            with sqlite3.connect(self.sqlite_path) as conn:
                cursor = conn.execute("""
                    SELECT 
                        content_type,
                        source,
                        COUNT(*) as count
                    FROM knowledge_metadata
                    GROUP BY content_type, source
                    ORDER BY count DESC
                """)
                
                stats_by_type_source = cursor.fetchall()
                
                cursor = conn.execute("""
                    SELECT content_type, COUNT(*) as count
                    FROM knowledge_metadata
                    GROUP BY content_type
                    ORDER BY count DESC
                """)
                
                stats_by_type = cursor.fetchall()
                
                cursor = conn.execute("""
                    SELECT source, COUNT(*) as count
                    FROM knowledge_metadata
                    GROUP BY source
                    ORDER BY count DESC
                """)
                
                stats_by_source = cursor.fetchall()
            
            return {
                "total_items": total_items,
                "by_type": dict(stats_by_type),
                "by_source": dict(stats_by_source),
                "by_type_source": [{"content_type": ct, "source": src, "count": count} 
                                 for ct, src, count in stats_by_type_source],
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
        
        except Exception as e:
            logger.error(f"Error getting statistics: {e}")
            return {"error": str(e)}

class UniversalSearchAPI:
    """REST API for the universal search system"""
    
    def __init__(self, search_engine: VectorSearchEngine, mcp_collector: MCPDataCollector):
        self.search_engine = search_engine
        self.mcp_collector = mcp_collector
    
    async def refresh_knowledge_base(self) -> Dict[str, Any]:
        """Refresh the knowledge base with latest data from MCP servers"""
        start_time = time.time()
        
        try:
            async with self.mcp_collector:
                items = await self.mcp_collector.collect_all_data()
                
                if items:
                    self.search_engine.add_items(items)
                
                execution_time = time.time() - start_time
                
                return {
                    "status": "success",
                    "items_collected": len(items),
                    "execution_time": execution_time,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
        
        except Exception as e:
            logger.error(f"Knowledge base refresh failed: {e}")
            return {
                "status": "error",
                "error": str(e),
                "execution_time": time.time() - start_time,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
    
    def search_knowledge_base(
        self,
        query: str,
        limit: int = 10,
        content_types: Optional[List[str]] = None,
        sources: Optional[List[str]] = None,
        tags: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Search the knowledge base"""
        start_time = time.time()
        
        try:
            # Convert content_types from strings to enums
            content_type_enums = []
            if content_types:
                for ct in content_types:
                    try:
                        content_type_enums.append(ContentType(ct))
                    except ValueError:
                        logger.warning(f"Invalid content type: {ct}")
            
            results = self.search_engine.search(
                query=query,
                limit=limit,
                content_types=content_type_enums if content_type_enums else None,
                sources=sources,
                tags=tags
            )
            
            execution_time = time.time() - start_time
            
            return {
                "status": "success",
                "query": query,
                "total_results": len(results),
                "results": [
                    {
                        "id": result.item.id,
                        "title": result.item.title,
                        "content_type": result.item.content_type.value,
                        "source": result.item.source,
                        "score": result.score,
                        "highlight": result.highlight,
                        "metadata": result.item.metadata,
                        "tags": result.item.tags,
                        "context": result.context
                    }
                    for result in results
                ],
                "execution_time": execution_time,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return {
                "status": "error",
                "query": query,
                "error": str(e),
                "execution_time": time.time() - start_time,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

async def main():
    """Main CLI entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="NYRA Universal Search & Knowledge Base")
    parser.add_argument("--refresh", action="store_true", help="Refresh knowledge base")
    parser.add_argument("--search", help="Search query")
    parser.add_argument("--limit", type=int, default=10, help="Result limit")
    parser.add_argument("--content-type", action="append", help="Filter by content type")
    parser.add_argument("--source", action="append", help="Filter by source")
    parser.add_argument("--stats", action="store_true", help="Show statistics")
    parser.add_argument("--db-path", default="./knowledge_base_db", help="Database path")
    
    args = parser.parse_args()
    
    # Initialize components
    search_engine = VectorSearchEngine(args.db_path)
    mcp_collector = MCPDataCollector()
    api = UniversalSearchAPI(search_engine, mcp_collector)
    
    if args.refresh:
        print("🔄 Refreshing knowledge base...")
        result = await api.refresh_knowledge_base()
        print(json.dumps(result, indent=2))
    
    elif args.search:
        print(f"🔍 Searching for: {args.search}")
        result = api.search_knowledge_base(
            query=args.search,
            limit=args.limit,
            content_types=args.content_type,
            sources=args.source
        )
        print(json.dumps(result, indent=2))
    
    elif args.stats:
        print("📊 Knowledge base statistics:")
        stats = search_engine.get_statistics()
        print(json.dumps(stats, indent=2))
    
    else:
        print("Use --help for available commands")

if __name__ == "__main__":
    asyncio.run(main())