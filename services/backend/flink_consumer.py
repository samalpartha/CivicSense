"""
Flink Aggregate Consumer for CivicSense Backend.
Consumes pre-computed statistics from Apache Flink SQL tables.
"""

from confluent_kafka import Consumer, KafkaError
from config import settings
from logger import logger
import json
from typing import Dict, Optional, AsyncGenerator
from datetime import datetime


class FlinkAggregateConsumer:
    """
    Dedicated consumer for Flink-aggregated topics.
    Provides real-time statistics computed by Flink SQL windowing functions.
    """

    def __init__(self):
        self.config = {
            "bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS,
            "sasl.mechanisms": settings.KAFKA_SASL_MECHANISM,
            "security.protocol": settings.KAFKA_SECURITY_PROTOCOL,
            "sasl.username": settings.KAFKA_API_KEY,
            "sasl.password": settings.KAFKA_API_SECRET,
            "group.id": "flink-aggregates-consumer-group",
            "auto.offset.reset": "latest",
            "enable.auto.commit": True,
        }

        self.consumer: Optional[Consumer] = None
        self.running = False

        # In-memory cache of latest Flink aggregations
        self.latest_stats = {
            "active_alerts": 0,
            "events_today": 0,
            "high_risk_areas": [],
            "event_types_breakdown": {},
            "last_update": None,
            "source": "Flink SQL 5-min Window",
        }

    def start(self, topics=None):
        """
        Initialize consumer and subscribe to Flink output topics.

        Args:
            topics: List of Flink table topics to consume (default: aggregated tables)
        """
        if topics is None:
            topics = ["civic_events_aggregated", "severity_alerts"]

        try:
            self.consumer = Consumer(self.config)
            self.consumer.subscribe(topics)
            self.running = True
            logger.info(f"Flink consumer subscribed to topics: {topics}")
        except Exception as e:
            logger.error(f"Failed to start Flink consumer: {e}")
            raise

    def stop(self):
        """Gracefully shutdown the Flink consumer."""
        if self.consumer:
            self.running = False
            self.consumer.close()
            logger.info("Flink consumer stopped")

    def is_running(self) -> bool:
        """Check if consumer is actively running."""
        return self.running

    async def consume_aggregates(self) -> AsyncGenerator[Dict, None]:
        """
        Async generator that yields Flink-computed statistics.
        Continuously polls Kafka for new aggregated data from Flink SQL.

        Yields:
            dict: Latest aggregated statistics
        """
        if not self.consumer:
            logger.error("Consumer not initialized. Call start() first.")
            return

        logger.info("Starting Flink aggregate consumption loop...")

        while self.running:
            try:
                msg = self.consumer.poll(timeout=1.0)

                if msg is None:
                    continue

                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        logger.debug(f"Reached end of partition: {msg.topic()}")
                    else:
                        logger.error(f"Flink consumer error: {msg.error()}")
                    continue

                # Parse Flink output
                value = json.loads(msg.value().decode("utf-8"))
                topic = msg.topic()

                logger.debug(f"Received Flink aggregate from {topic}: {value}")

                # Update in-memory statistics based on topic
                if topic == "civic_events_aggregated":
                    self._process_event_aggregate(value)
                elif topic == "severity_alerts":
                    self._process_severity_alert(value)

                # Update timestamp
                self.latest_stats["last_update"] = datetime.now().isoformat()

                yield self.latest_stats

            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse Flink message: {e}")
            except Exception as e:
                logger.error(f"Error in Flink consumption loop: {e}")

    def _process_event_aggregate(self, value: Dict):
        """Process civic_events_aggregated table output."""
        event_count = value.get("event_count", 0)
        severity = value.get("severity", "unknown")
        area = value.get("area", "unknown")
        event_types = value.get("event_types", [])

        # Accumulate total events
        self.latest_stats["events_today"] += event_count

        # Track high-severity alerts
        if severity in ["high", "critical"]:
            self.latest_stats["active_alerts"] += event_count
            if area not in self.latest_stats["high_risk_areas"]:
                self.latest_stats["high_risk_areas"].append(area)

        # Event type breakdown
        for event_type in event_types:
            if event_type not in self.latest_stats["event_types_breakdown"]:
                self.latest_stats["event_types_breakdown"][event_type] = 0
            self.latest_stats["event_types_breakdown"][event_type] += 1

    def _process_severity_alert(self, value: Dict):
        """Process severity_alerts table output (critical event clustering)."""
        area = value.get("area")
        requires_action = value.get("requires_immediate_action", False)

        if requires_action and area:
            if area not in self.latest_stats["high_risk_areas"]:
                self.latest_stats["high_risk_areas"].append(area)
                logger.warning(f"CRITICAL: Multiple high-severity events in {area}")

    def get_current_stats(self) -> Dict:
        """
        Get the latest aggregated statistics without blocking.

        Returns:
            dict: Current snapshot of Flink-computed metrics
        """
        return self.latest_stats.copy()

    def reset_stats(self):
        """Reset accumulated statistics (useful for testing/demo resets)."""
        self.latest_stats = {
            "active_alerts": 0,
            "events_today": 0,
            "high_risk_areas": [],
            "event_types_breakdown": {},
            "last_update": None,
            "source": "Flink SQL 5-min Window",
        }
        logger.info("Flink statistics reset")
