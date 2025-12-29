"""
Custom exception classes for CivicSense application.
"""


class CivicSenseException(Exception):
    """Base exception for all CivicSense application errors."""

    pass


class KafkaProducerError(CivicSenseException):
    """Raised when there's an error producing messages to Kafka."""

    pass


class KafkaConsumerError(CivicSenseException):
    """Raised when there's an error consuming messages from Kafka."""

    pass


class MongoDBError(CivicSenseException):
    """Raised when there's an error interacting with MongoDB."""

    pass


class VectorSearchError(MongoDBError):
    """Raised when vector search fails."""

    pass


class GeminiAPIError(CivicSenseException):
    """Raised when there's an error calling the Gemini API."""

    pass


class AgentExecutionError(CivicSenseException):
    """Raised when an agent fails to execute its task."""

    pass


class ConfigurationError(CivicSenseException):
    """Raised when there's a configuration issue."""

    pass
