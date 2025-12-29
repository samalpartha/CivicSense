"""
Kafka consumer for real-time event streaming.
Consumes from impact_signals and chat_output topics.
"""

from confluent_kafka import Consumer, KafkaError, KafkaException
import asyncio
import json
from typing import List, Optional, AsyncGenerator

from config import settings
from logger import logger
from exceptions import KafkaConsumerError


class KafkaConsumerManager:
    """
    Manages Kafka consumer for real-time message consumption.
    Uses asyncio for non-blocking operation.
    """

    def __init__(self, topics: List[str]):
        """
        Initialize Kafka consumer.

        Args:
            topics: List of Kafka topics to subscribe to
        """
        self.topics = topics
        self.running = False
        self.consumer = None
        self._init_consumer()

    def _init_consumer(self):
        """Initialize Confluent Kafka consumer."""
        try:
            consumer_config = {
                "bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS,
                "security.protocol": settings.KAFKA_SECURITY_PROTOCOL,
                "sasl.mechanisms": settings.KAFKA_SASL_MECHANISM,
                "sasl.username": settings.KAFKA_API_KEY,
                "sasl.password": settings.KAFKA_API_SECRET,
                "group.id": "civicsense-backend-group",
                "auto.offset.reset": "latest",
                "enable.auto.commit": True,
                "session.timeout.ms": 45000,
            }

            self.consumer = Consumer(consumer_config)
            self.consumer.subscribe(self.topics)
            self.running = True

            logger.info(f"Kafka consumer initialized for topics: {self.topics}")

        except Exception as e:
            logger.error(f"Failed to initialize Kafka consumer: {e}")
            raise KafkaConsumerError(f"Consumer initialization failed: {e}")

    async def consume(self) -> AsyncGenerator[Optional[dict], None]:
        """
        Async generator that yields consumed messages.

        Yields:
            Dictionary containing message data and metadata
        """
        if not self.consumer:
            raise KafkaConsumerError("Consumer not initialized")

        logger.info("Starting message consumption...")

        while self.running:
            try:
                # Poll with timeout (non-blocking with async sleep)
                msg = self.consumer.poll(timeout=1.0)

                if msg is None:
                    # No message available, yield control
                    await asyncio.sleep(0.1)
                    continue

                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        # End of partition, not an error
                        continue
                    else:
                        logger.error(f"Kafka error: {msg.error()}")
                        continue

                # Parse message
                try:
                    value = json.loads(msg.value().decode("utf-8"))
                    topic = msg.topic()

                    logger.debug(f"Received message from {topic}: {value}")

                    yield {
                        "topic": topic,
                        "value": value,
                        "partition": msg.partition(),
                        "offset": msg.offset(),
                        "timestamp": msg.timestamp(),
                    }

                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse message: {e}")
                    continue

                # Yield control to event loop
                await asyncio.sleep(0)

            except Exception as e:
                logger.error(f"Error consuming message: {e}")
                await asyncio.sleep(1)

    def stop(self):
        """Stop the consumer and close connection."""
        logger.info("Stopping Kafka consumer...")
        self.running = False

        if self.consumer:
            try:
                self.consumer.close()
                logger.info("Kafka consumer closed successfully")
            except Exception as e:
                logger.error(f"Error closing consumer: {e}")

    def is_running(self) -> bool:
        """Check if consumer is running."""
        return self.running and self.consumer is not None
