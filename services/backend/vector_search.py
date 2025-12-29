"""
MongoDB Atlas Vector Search integration.
Implements RAG pattern for knowledge retrieval.
"""

import asyncio
from pymongo import MongoClient
from typing import List, Dict
import google.generativeai as genai

from config import settings
from logger import logger
from exceptions import VectorSearchError, MongoDBError


class VectorSearchEngine:
    """
    MongoDB Atlas vector search for semantic document retrieval.
    Uses Google Gemini for embedding generation.
    """

    def __init__(self):
        """Initialize MongoDB connection and Gemini for embeddings."""
        try:
            # Initialize MongoDB client
            self.client = MongoClient(settings.MONGO_URI)
            self.db = self.client[settings.MONGO_DATABASE]
            self.collection = self.db[settings.MONGO_COLLECTION_GUIDES]

            # Initialize Gemini for embeddings
            genai.configure(api_key=settings.GEMINI_API_KEY)

            logger.info("Vector search engine initialized")

        except Exception as e:
            logger.error(f"Failed to initialize vector search: {e}")
            raise MongoDBError(f"Vector search initialization failed: {e}")

    async def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding vector for text using Gemini.

        Args:
            text: Text to embed

        Returns:
            Embedding vector as list of floats
        """
        try:
            # Run synchronous embedding call in thread pool
            result = await asyncio.to_thread(
                genai.embed_content,
                model="models/embedding-001",
                content=text,
                task_type="retrieval_query",
            )
            return result["embedding"]

        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            raise VectorSearchError(f"Failed to generate embedding: {e}")

    async def search(
        self, query: str, limit: int = None, filter_criteria: Dict = None
    ) -> List[Dict]:
        """
        Perform vector similarity search.

        Args:
            query: Search query text
            limit: Maximum number of results
            filter_criteria: Optional MongoDB filter

        Returns:
            List of matching documents with scores
        """
        try:
            limit = limit or settings.VECTOR_SEARCH_LIMIT

            # Generate query embedding
            query_vector = await self.generate_embedding(query)

            # Build aggregation pipeline
            pipeline = [
                {
                    "$vectorSearch": {
                        "index": settings.MONGO_VECTOR_INDEX,
                        "path": "embedding",
                        "queryVector": query_vector,
                        "numCandidates": limit * 10,
                        "limit": limit,
                    }
                },
                {
                    "$project": {
                        "_id": 0,
                        "title": 1,
                        "content": 1,
                        "category": 1,
                        "tags": 1,
                        "language": 1,
                        "score": {"$meta": "vectorSearchScore"},
                    }
                },
            ]

            # Add filter if provided
            if filter_criteria:
                pipeline.insert(1, {"$match": filter_criteria})

            # Execute search (run synchronous MongoDB call in thread pool)
            results = await asyncio.to_thread(
                lambda: list(self.collection.aggregate(pipeline))
            )

            # Filter by threshold
            filtered_results = [
                r
                for r in results
                if r.get("score", 0) >= settings.VECTOR_SEARCH_THRESHOLD
            ]

            logger.info(
                f"Vector search returned {len(filtered_results)} results "
                f"(from {len(results)} candidates)"
            )

            return filtered_results

        except Exception as e:
            logger.error(f"Vector search failed: {e}")
            raise VectorSearchError(f"Search failed: {e}")

    def close(self):
        """Close MongoDB connection."""
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed")
