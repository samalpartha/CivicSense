"""
Configuration management for CivicSense backend.
Uses Pydantic for validation and environment variable loading.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict  # pyright: ignore[reportMissingImports]
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Kafka Configuration
    KAFKA_BOOTSTRAP_SERVERS: str
    KAFKA_API_KEY: str
    KAFKA_API_SECRET: str
    KAFKA_SASL_MECHANISM: str = "PLAIN"
    KAFKA_SECURITY_PROTOCOL: str = "SASL_SSL"
    
    # Kafka Topics
    KAFKA_TOPIC_EMERGENCY: str = "emergency_events"
    KAFKA_TOPIC_INFRASTRUCTURE: str = "infrastructure_events"
    KAFKA_TOPIC_EDUCATION: str = "education_events"
    KAFKA_TOPIC_TRANSIT: str = "transit_events"
    KAFKA_TOPIC_IMPACT_SIGNALS: str = "impact_signals"
    KAFKA_TOPIC_CHAT_INPUT: str = "chat_input"
    KAFKA_TOPIC_CHAT_OUTPUT: str = "chat_output"
    
    # MongoDB Configuration
    MONGO_URI: str
    MONGO_DATABASE: str = "civicsense"
    MONGO_COLLECTION_GUIDES: str = "civic_guides"
    MONGO_VECTOR_INDEX: str = "vector_index"
    
    # Google Cloud / Gemini Configuration
    GEMINI_API_KEY: str
    GCP_PROJECT_ID: Optional[str] = None
    GCP_REGION: str = "us-central1"
    GEMINI_MODEL: str = "models/gemini-2.0-flash"  # Fast and efficient model
    
    # Application Configuration
    LOG_LEVEL: str = "INFO"
    HOST: str = "0.0.0.0"
    PORT: int = 8081
    CORS_ORIGINS: str = "*"
    
    # Vector Search Configuration
    VECTOR_DIMENSION: int = 768
    VECTOR_SEARCH_LIMIT: int = 5
    VECTOR_SEARCH_THRESHOLD: float = 0.7


settings = Settings()

