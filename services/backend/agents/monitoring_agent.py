"""
Monitoring Agent - Logs interactions for analytics and improvements.
"""

from datetime import datetime
from typing import Dict
from pymongo import MongoClient

from agents.base_agent import BaseAgent
from config import settings
from logger import logger
from exceptions import MongoDBError


class MonitoringAgent(BaseAgent):
    """
    Logs query interactions for monitoring, analytics, and continuous improvement.
    Stores interaction data in MongoDB for analysis.
    """

    def __init__(self):
        super().__init__("MonitoringAgent")
        self._init_mongo()

    def _init_mongo(self):
        """Initialize MongoDB connection for logging."""
        try:
            self.client = MongoClient(settings.MONGO_URI)
            self.db = self.client[settings.MONGO_DATABASE]
            self.collection = self.db["interaction_logs"]

            # Create indexes for efficient queries
            self.collection.create_index("timestamp")
            self.collection.create_index("category")
            self.collection.create_index("severity")

            logger.info("Monitoring agent MongoDB initialized")

        except Exception as e:
            logger.error(f"Failed to initialize monitoring MongoDB: {e}")
            self.client = None
            self.collection = None

    async def log_interaction(
        self,
        query: str,
        response: Dict,
        context: Dict = None,
        processing_time: float = 0,
    ):
        """
        Log a query-response interaction.

        Args:
            query: User's query
            response: Generated response dict
            context: Optional user context
            processing_time: Processing time in seconds
        """
        if self.collection is None:
            logger.warning("Monitoring collection not available, skipping log")
            return

        try:
            log_entry = {
                "timestamp": datetime.now(),
                "query": query,
                "response_preview": response.get("answer", "")[:200],
                "category": response.get("category", "unknown"),
                "severity": response.get("severity", "info"),
                "confidence": response.get("confidence", 0),
                "sources_count": response.get("sources_count", 0),
                "processing_time_seconds": processing_time,
                "user_type": context.get("user_type") if context else None,
                "location": context.get("location") if context else None,
                "language": context.get("language", "en") if context else "en",
            }

            self.collection.insert_one(log_entry)
            logger.debug(f"Logged interaction: {query[:50]}...")

        except Exception as e:
            logger.error(f"Failed to log interaction: {e}")

    async def get_statistics(self, hours: int = 24) -> Dict:
        """
        Get interaction statistics for the past N hours.

        Args:
            hours: Number of hours to look back

        Returns:
            Statistics dictionary
        """
        if not self.collection:
            return {}

        try:
            from datetime import timedelta

            start_time = datetime.now() - timedelta(hours=hours)

            # Aggregate statistics
            pipeline = [
                {"$match": {"timestamp": {"$gte": start_time}}},
                {
                    "$group": {
                        "_id": None,
                        "total_queries": {"$sum": 1},
                        "avg_processing_time": {"$avg": "$processing_time_seconds"},
                        "categories": {"$push": "$category"},
                        "severities": {"$push": "$severity"},
                    }
                },
            ]

            result = list(self.collection.aggregate(pipeline))

            if result:
                stats = result[0]
                return {
                    "total_queries": stats.get("total_queries", 0),
                    "avg_processing_time": stats.get("avg_processing_time", 0),
                    "category_distribution": self._count_distribution(
                        stats.get("categories", [])
                    ),
                    "severity_distribution": self._count_distribution(
                        stats.get("severities", [])
                    ),
                }

            return {"total_queries": 0}

        except Exception as e:
            logger.error(f"Failed to get statistics: {e}")
            return {}

    def _count_distribution(self, items: list) -> Dict[str, int]:
        """Count distribution of items."""
        distribution = {}
        for item in items:
            distribution[item] = distribution.get(item, 0) + 1
        return distribution

    async def execute(self, *args, **kwargs) -> Dict:
        """Execute method for base class compatibility."""
        await self.log_interaction(*args, **kwargs)
        return {"status": "logged"}
