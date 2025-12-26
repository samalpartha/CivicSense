"""
Pydantic models for CivicSense API request/response schemas.
Used for OpenAPI/Swagger documentation and validation.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class QueryContext(BaseModel):
    """Context information for a user query."""
    user_type: Optional[str] = Field(
        default="general",
        description="Type of user asking the question",
        example="parent",
        pattern="^(parent|senior|worker|student|general)$"
    )
    location: Optional[str] = Field(
        default=None,
        description="User's location or area of interest",
        example="Downtown"
    )
    language: Optional[str] = Field(
        default="en",
        description="Preferred language for response",
        example="en"
    )


class QueryRequest(BaseModel):
    """Request model for submitting a civic query."""
    message: str = Field(
        ...,
        description="The user's question or query about civic events, safety, or services",
        example="Is it safe to go to school today?",
        min_length=1,
        max_length=500
    )
    context: Optional[QueryContext] = Field(
        default=QueryContext(),
        description="Optional context to personalize the response"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Is it safe to go to school today?",
                "context": {
                    "user_type": "parent",
                    "location": "Downtown",
                    "language": "en"
                }
            }
        }


class QueryResponse(BaseModel):
    """Response model for civic query results."""
    answer: str = Field(
        ...,
        description="AI-generated response with clear, actionable guidance",
        example="Based on current conditions, schools are operating normally today. There are no weather alerts or safety concerns affecting the Downtown area."
    )
    category: str = Field(
        ...,
        description="Classified category of the query",
        example="education"
    )
    severity: str = Field(
        ...,
        description="Assessed severity level of the situation",
        example="low",
        pattern="^(critical|high|moderate|low|info)$"
    )
    affected_areas: List[str] = Field(
        default=[],
        description="Geographic areas affected by the event",
        example=["Downtown", "Midtown"]
    )
    sources: List[str] = Field(
        default=[],
        description="Knowledge base sources used to ground the response",
        example=["School Closure Guidelines", "Emergency Management Guide"]
    )
    confidence: float = Field(
        default=0.0,
        description="Confidence score of the classification (0.0 to 1.0)",
        example=0.92,
        ge=0.0,
        le=1.0
    )
    timestamp: str = Field(
        ...,
        description="ISO 8601 timestamp when the response was generated",
        example="2025-12-25T10:30:00.123456"
    )
    processing_time_ms: float = Field(
        default=0.0,
        description="Time taken to process the query in milliseconds",
        example=2543.21
    )

    class Config:
        json_schema_extra = {
            "example": {
                "answer": "Based on current conditions, schools are operating normally today. There are no weather alerts or safety concerns affecting the Downtown area. Your child can safely attend school.",
                "category": "education",
                "severity": "low",
                "affected_areas": ["Downtown"],
                "sources": ["School Closure Guidelines"],
                "confidence": 0.92,
                "timestamp": "2025-12-25T10:30:00.123456",
                "processing_time_ms": 2543.21
            }
        }


class HealthResponse(BaseModel):
    """Response model for health check endpoints."""
    status: str = Field(
        ...,
        description="Overall service status",
        example="healthy"
    )
    kafka_connected: bool = Field(
        ...,
        description="Whether Kafka consumer is connected and running",
        example=True
    )
    active_connections: int = Field(
        ...,
        description="Number of active WebSocket connections",
        example=5,
        ge=0
    )
    query_handler_ready: bool = Field(
        ...,
        description="Whether the AI query handler is initialized and ready",
        example=True
    )

    class Config:
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "kafka_connected": True,
                "active_connections": 5,
                "query_handler_ready": True
            }
        }


class RootResponse(BaseModel):
    """Response model for root endpoint."""
    service: str = Field(
        ...,
        description="Service name",
        example="CivicSense Backend"
    )
    status: str = Field(
        ...,
        description="Service status",
        example="healthy"
    )
    version: str = Field(
        ...,
        description="API version",
        example="1.0.0"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "service": "CivicSense Backend",
                "status": "healthy",
                "version": "1.0.0"
            }
        }


class ErrorResponse(BaseModel):
    """Standard error response model."""
    detail: str = Field(
        ...,
        description="Error message describing what went wrong",
        example="Message is required"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "detail": "Message is required"
            }
        }


class WebSocketQueryMessage(BaseModel):
    """WebSocket message model for user queries."""
    type: str = Field(
        ...,
        description="Message type",
        example="query",
        pattern="^query$"
    )
    message: str = Field(
        ...,
        description="The user's question",
        example="Is it safe to go outside?",
        min_length=1,
        max_length=500
    )
    context: Optional[Dict[str, Any]] = Field(
        default={},
        description="Optional context for personalization",
        example={"user_type": "parent", "location": "Downtown"}
    )

    class Config:
        json_schema_extra = {
            "example": {
                "type": "query",
                "message": "Is it safe to go outside?",
                "context": {
                    "user_type": "parent",
                    "location": "Downtown",
                    "language": "en"
                }
            }
        }


class WebSocketResponseMessage(BaseModel):
    """WebSocket message model for AI responses."""
    type: str = Field(
        ...,
        description="Message type",
        example="response"
    )
    message: str = Field(
        ...,
        description="AI-generated response",
        example="Based on current conditions, it is safe to go outside."
    )
    sources: Optional[List[str]] = Field(
        default=[],
        description="Knowledge sources",
        example=["Emergency Management Guide"]
    )
    severity: Optional[str] = Field(
        default="info",
        description="Severity level",
        example="low"
    )
    affected_areas: Optional[List[str]] = Field(
        default=[],
        description="Affected geographic areas",
        example=["Downtown"]
    )
    timestamp: Optional[str] = Field(
        default=None,
        description="Response timestamp",
        example="2025-12-25T10:30:00"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "type": "response",
                "message": "Based on current conditions, it is safe to go outside. There are no active alerts in your area.",
                "sources": ["Emergency Management Guide"],
                "severity": "info",
                "affected_areas": [],
                "timestamp": "2025-12-25T10:30:00"
            }
        }


class WebSocketStatusMessage(BaseModel):
    """WebSocket message model for status updates."""
    type: str = Field(
        ...,
        description="Message type",
        example="status",
        pattern="^status$"
    )
    message: str = Field(
        ...,
        description="Status message",
        example="Processing your question..."
    )

    class Config:
        json_schema_extra = {
            "example": {
                "type": "status",
                "message": "Processing your question..."
            }
        }


class WebSocketErrorMessage(BaseModel):
    """WebSocket message model for errors."""
    type: str = Field(
        ...,
        description="Message type",
        example="error",
        pattern="^error$"
    )
    message: str = Field(
        ...,
        description="Error message",
        example="Unable to process request"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "type": "error",
                "message": "I'm having trouble processing your question. Please try again."
            }
        }


class WebSocketSystemMessage(BaseModel):
    """WebSocket message model for system messages."""
    type: str = Field(
        ...,
        description="Message type",
        example="system",
        pattern="^system$"
    )
    message: str = Field(
        ...,
        description="System message",
        example="Connected to CivicSense"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "type": "system",
                "message": "Connected to CivicSense. Ask me about safety, transit, emergencies, or services in your area."
            }
        }


