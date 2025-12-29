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

            # Parallel Execution: Run Analysis (Triage+Impact) and Vector Search concurrently
            # This saves significant time by overlapping LLM and Database I/O
            triage_task = asyncio.create_task(self.triage_agent.classify(message, context))
            search_task = asyncio.create_task(self.vector_search.search(message, limit=settings.VECTOR_SEARCH_LIMIT))

            # Await both
            triage_result, search_results = await asyncio.gather(triage_task, search_task, return_exceptions=True)

            # Handle Triage Result
            if isinstance(triage_result, Exception):
                logger.error(f"Triage failed: {triage_result}")
                triage_result = {"category": "general", "severity": "info", "urgency": "medium"}
            
            # Handle Search Result
            if isinstance(search_results, Exception):
                logger.warning(f"Vector search failed (continuing without RAG): {search_results}")
                search_results = []
            else:
                logger.info(f"Found {len(search_results)} relevant documents")

            # Construct impact object from new Triage result
            # (TriageAgent now returns impact fields directly)
            impact_result = {
                "severity": triage_result.get("severity", "info"),
                "affected_areas": triage_result.get("affected_areas", []),
                "affected_groups": triage_result.get("affected_groups", []),
                "time_sensitive": triage_result.get("urgency") in ["critical", "high"]
            }

            # Step 3: Guidance Generation - Create the response
            guidance_result = await self.guidance_agent.generate(
                query=message,
                category=triage_result["category"],
                impact=impact_result,
                knowledge=search_results,
                context=context,
            )

            # Step 4: Monitoring - Log for analytics (async, non-blocking)
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

    async def process_query_stream(self, message: str, context: Dict = None):
        """
        Process a user query and yield response chunks.
        Yields: Dict with 'type' ('token', 'metadata', 'error') and payload.
        """
        try:
            start_time = datetime.now()
            logger.info(f"Processing query stream: {message[:100]}...")

            context = context or {}

            # Parallel Analysis & Search
            triage_task = asyncio.create_task(self.triage_agent.classify(message, context))
            search_task = asyncio.create_task(self.vector_search.search(message, limit=settings.VECTOR_SEARCH_LIMIT))

            triage_result, search_results = await asyncio.gather(triage_task, search_task, return_exceptions=True)

            # Handle Failures
            if isinstance(triage_result, Exception):
                logger.error(f"Triage failed: {triage_result}")
                triage_result = {"category": "general", "severity": "info", "urgency": "medium"}
            
            if isinstance(search_results, Exception):
                logger.warning(f"Vector search failed: {search_results}")
                search_results = []

            # Construct Impact
            impact_result = {
                "severity": triage_result.get("severity", "info"),
                "affected_areas": triage_result.get("affected_areas", []),
                "affected_groups": triage_result.get("affected_groups", []),
                "time_sensitive": triage_result.get("urgency") in ["critical", "high"]
            }

            # 1. Send Metadata First (so UI knows severity/sources early)
            yield {
                "type": "metadata",
                "category": triage_result["category"],
                "severity": impact_result["severity"],
                "affected_areas": impact_result["affected_areas"],
                "sources": [doc.get("title", "Knowledge Base") for doc in search_results]
            }

            # 2. Stream Guidance
            full_answer = ""
            async for chunk in self.guidance_agent.generate_stream(
                query=message,
                category=triage_result["category"],
                impact=impact_result,
                knowledge=search_results,
                context=context
            ):
                full_answer += chunk
                yield {"type": "token", "token": chunk}

            # 3. Log Analytics (Async)
            asyncio.create_task(
                self.monitoring_agent.log_interaction(
                    query=message,
                    response={"answer": full_answer},
                    context=context,
                    processing_time=(datetime.now() - start_time).total_seconds(),
                )
            )

        except Exception as e:
            logger.error(f"Stream error: {e}", exc_info=True)
            yield {"type": "error", "message": str(e)}
