"""
Query handler with agent orchestration.
Processes user queries using multiple AI agents and RAG.
"""

import asyncio
from datetime import datetime
from typing import Dict, List, Optional

from config import settings
from logger import logger
from exceptions import AgentExecutionError
from vector_search import VectorSearchEngine
from agents.triage_agent import TriageAgent
from agents.impact_agent import ImpactAgent
from agents.guidance_agent import GuidanceAgent
from agents.monitoring_agent import MonitoringAgent


class QueryHandler:
    """
    Orchestrates AI agents to process user queries.
    Implements RAG pattern with MongoDB Atlas vector search.
    """

    def __init__(self):
        """Initialize query handler with agents and vector search."""
        self.vector_search = VectorSearchEngine()
        self.triage_agent = TriageAgent()
        self.impact_agent = ImpactAgent()
        self.guidance_agent = GuidanceAgent()
        self.monitoring_agent = MonitoringAgent()

        logger.info("Query handler initialized with all agents")

    async def process_query(self, message: str, context: Dict = None) -> Dict:
        """
        Process a user query through the agent pipeline.

        Args:
            message: User's question or query
            context: Optional context (user_type, location, language, etc.)

        Returns:
            Dictionary containing the response and metadata
        """
        try:
            start_time = datetime.now()
            logger.info(f"Processing query: {message[:100]}...")

            context = context or {}

            # Step 1: Triage - Classify the query
            triage_result = await self.triage_agent.classify(message, context)
            logger.info(f"Triage result: {triage_result}")

            # Step 2: Vector Search - Get relevant context from knowledge base
            search_results = []
            try:
                search_results = await self.vector_search.search(
                    message, limit=settings.VECTOR_SEARCH_LIMIT
                )
                logger.info(f"Found {len(search_results)} relevant documents")
            except Exception as e:
                logger.warning(f"Vector search failed (continuing without RAG): {e}")
                # Continue without vector search results

            # Step 3: Impact Assessment - Determine severity and affected areas
            impact_result = await self.impact_agent.assess(
                query=message, category=triage_result["category"], context=context
            )
            logger.info(f"Impact assessment: severity={impact_result.get('severity')}")

            # Step 4: Guidance Generation - Create the response
            guidance_result = await self.guidance_agent.generate(
                query=message,
                category=triage_result["category"],
                impact=impact_result,
                knowledge=search_results,
                context=context,
            )

            # Step 5: Monitoring - Log for analytics (async, non-blocking)
            asyncio.create_task(
                self.monitoring_agent.log_interaction(
                    query=message,
                    response=guidance_result,
                    context=context,
                    processing_time=(datetime.now() - start_time).total_seconds(),
                )
            )

            # Compile final response
            response = {
                "answer": guidance_result["answer"],
                "category": triage_result["category"],
                "severity": impact_result.get("severity", "info"),
                "affected_areas": impact_result.get("affected_areas", []),
                "sources": [
                    doc.get("title", "Knowledge Base") for doc in search_results
                ],
                "confidence": triage_result.get("confidence", 0.0),
                "timestamp": datetime.now().isoformat(),
                "processing_time_ms": (datetime.now() - start_time).total_seconds()
                * 1000,
            }

            logger.info(
                f"Query processed successfully in {response['processing_time_ms']:.2f}ms"
            )
            return response

        except Exception as e:
            logger.error(f"Error processing query: {e}", exc_info=True)
            raise AgentExecutionError(f"Failed to process query: {str(e)}")
