"""
CivicSense FastAPI Backend - Real-Time Public Safety & Services Intelligence Copilot
Main application entry point with WebSocket support for chatbot.
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import asyncio
import json
from typing import Dict, Set
import uvicorn

from config import settings
from logger import logger
from exceptions import CivicSenseException
from kafka_consumer import KafkaConsumerManager
from query_handler import QueryHandler
from models import (
    QueryRequest,
    QueryResponse,
    HealthResponse,
    RootResponse,
    ErrorResponse,
    WebSocketQueryMessage,
    WebSocketResponseMessage,
    WebSocketStatusMessage,
    WebSocketErrorMessage,
    WebSocketSystemMessage
)


# WebSocket connection manager
class ConnectionManager:
    """Manages WebSocket connections for real-time chat."""
    
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
    
    async def connect(self, websocket: WebSocket):
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"New WebSocket connection. Total: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection."""
        self.active_connections.discard(websocket)
        logger.info(f"WebSocket disconnected. Total: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send a message to a specific WebSocket connection."""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            self.disconnect(websocket)
    
    async def broadcast(self, message: dict):
        """Broadcast a message to all connected clients."""
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to connection: {e}")
                disconnected.add(connection)
        
        # Clean up disconnected clients
        for conn in disconnected:
            self.disconnect(conn)


# Global instances
connection_manager = ConnectionManager()
kafka_consumer_manager: KafkaConsumerManager = None
query_handler: QueryHandler = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown."""
    global kafka_consumer_manager, query_handler
    
    logger.info("Starting CivicSense backend...")
    
    # Initialize query handler
    query_handler = QueryHandler()
    logger.info("Query handler initialized")
    
    # Initialize and start Kafka consumer
    kafka_consumer_manager = KafkaConsumerManager(
        topics=[settings.KAFKA_TOPIC_IMPACT_SIGNALS, settings.KAFKA_TOPIC_CHAT_OUTPUT]
    )
    asyncio.create_task(consume_kafka_messages())
    logger.info("Kafka consumer started")
    
    yield
    
    # Cleanup on shutdown
    logger.info("Shutting down CivicSense backend...")
    if kafka_consumer_manager:
        kafka_consumer_manager.stop()


# OpenAPI tags for endpoint organization
tags_metadata = [
    {
        "name": "Health",
        "description": "Health check and status endpoints for monitoring service availability."
    },
    {
        "name": "Query",
        "description": "AI-powered query processing endpoints for civic intelligence. Submit questions about emergencies, transit, infrastructure, or education and receive real-time guidance."
    },
    {
        "name": "WebSocket",
        "description": "Real-time WebSocket connection for continuous chat interaction with the AI copilot. Supports bidirectional communication with automatic updates from streaming events."
    }
]

# Create FastAPI app
app = FastAPI(
    title="CivicSense API",
    description="""
# Real-Time Public Safety & Services Intelligence Copilot

**AI on Data in Motion** - CivicSense turns live city data streams into clear, actionable guidance for citizens.

## Features

- 🤖 **Multi-Agent AI System**: Specialized agents for triage, impact assessment, and guidance generation
- 📡 **Real-Time Streaming**: Processes live events from Confluent Cloud Kafka
- 🔍 **RAG Pattern**: Grounds responses in civic knowledge base using MongoDB Atlas vector search
- ⚡ **Instant Delivery**: WebSocket-powered real-time communication
- 🎯 **Personalized Guidance**: Adapts responses based on user type and context

## Technology Stack

- **Streaming**: Confluent Cloud Kafka + Apache Flink SQL
- **AI/ML**: Google Gemini 1.5 Pro with multi-agent orchestration
- **Vector DB**: MongoDB Atlas for semantic search
- **Backend**: Python FastAPI with async processing
- **WebSocket**: Real-time bidirectional communication

## Use Cases

- Emergency response guidance (weather, fires, public safety)
- Transit disruption information and alternatives
- Infrastructure status (power, water, internet, roads)
- Education updates (school closures, safety)

## Response Time

< 5 seconds from event occurrence to citizen notification
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=tags_metadata,
    contact={
        "name": "CivicSense Team",
        "email": "gcpteam@confluent.io"
    },
    license_info={
        "name": "See LICENSE file",
        "url": "https://github.com/your-repo/LICENSE"
    }
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def consume_kafka_messages():
    """Background task to consume Kafka messages and broadcast to WebSocket clients."""
    logger.info("Starting Kafka message consumption...")
    
    try:
        async for message in kafka_consumer_manager.consume():
            if message:
                # Broadcast impact signals and chat outputs to all connected clients
                await connection_manager.broadcast({
                    "type": "kafka_update",
                    "topic": message.get("topic"),
                    "data": message.get("value")
                })
    except Exception as e:
        logger.error(f"Error in Kafka consumption: {e}")


@app.get(
    "/",
    response_model=RootResponse,
    tags=["Health"],
    summary="Root endpoint",
    description="Basic service information and health status. Use this endpoint to verify the API is accessible.",
    responses={
        200: {
            "description": "Service is running and accessible",
            "content": {
                "application/json": {
                    "example": {
                        "service": "CivicSense Backend",
                        "status": "healthy",
                        "version": "1.0.0"
                    }
                }
            }
        }
    }
)
async def root() -> RootResponse:
    """
    Root endpoint providing basic service information.
    
    Returns basic metadata about the CivicSense API including service name,
    current status, and version number.
    """
    return RootResponse(
        service="CivicSense Backend",
        status="healthy",
        version="1.0.0"
    )


@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["Health"],
    summary="Detailed health check",
    description="""
    Comprehensive health status of the CivicSense backend service.
    
    This endpoint reports the status of all critical components:
    - Kafka consumer connection status
    - Number of active WebSocket connections
    - AI query handler initialization status
    
    Use this endpoint for monitoring, load balancing decisions, and troubleshooting.
    """,
    responses={
        200: {
            "description": "Health status retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "status": "healthy",
                        "kafka_connected": True,
                        "active_connections": 5,
                        "query_handler_ready": True
                    }
                }
            }
        }
    }
)
async def health() -> HealthResponse:
    """
    Detailed health check endpoint.
    
    Returns comprehensive status information about all backend components
    including Kafka connectivity, active WebSocket connections, and AI
    query handler readiness.
    """
    return HealthResponse(
        status="healthy",
        kafka_connected=kafka_consumer_manager.is_running() if kafka_consumer_manager else False,
        active_connections=len(connection_manager.active_connections),
        query_handler_ready=query_handler is not None
    )


@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    """
    WebSocket endpoint for real-time bidirectional chat with CivicSense AI copilot.
    
    ## Connection Flow
    
    1. Client connects to `ws://localhost:8000/ws/chat`
    2. Server accepts and sends welcome message (type: `system`)
    3. Client can send queries (type: `query`)
    4. Server processes and responds (type: `response`, `status`, or `error`)
    5. Server broadcasts live Kafka updates (type: `kafka_update`)
    
    ## Message Types
    
    ### Client → Server
    
    **Query Message**:
    ```json
    {
        "type": "query",
        "message": "Is it safe to go outside?",
        "context": {
            "user_type": "parent",
            "location": "Downtown",
            "language": "en"
        }
    }
    ```
    
    **Ping Message** (keep-alive):
    ```json
    {
        "type": "ping"
    }
    ```
    
    ### Server → Client
    
    **System Message** (on connect):
    ```json
    {
        "type": "system",
        "message": "Connected to CivicSense. Ask me about safety, transit, emergencies, or services."
    }
    ```
    
    **Status Message** (processing):
    ```json
    {
        "type": "status",
        "message": "Processing your question..."
    }
    ```
    
    **Response Message** (AI answer):
    ```json
    {
        "type": "response",
        "message": "Based on current conditions...",
        "sources": ["Emergency Management Guide"],
        "severity": "low",
        "affected_areas": ["Downtown"],
        "timestamp": "2025-12-25T10:30:00"
    }
    ```
    
    **Error Message**:
    ```json
    {
        "type": "error",
        "message": "I'm having trouble processing your question."
    }
    ```
    
    **Kafka Update** (live events):
    ```json
    {
        "type": "kafka_update",
        "topic": "impact_signals",
        "data": { ... }
    }
    ```
    
    **Pong Message** (keep-alive response):
    ```json
    {
        "type": "pong"
    }
    ```
    
    ## Features
    
    - **Real-time**: Instant query processing and response delivery
    - **Bidirectional**: Server can push updates without client request
    - **Live Events**: Automatic broadcast of streaming Kafka events
    - **Keep-alive**: Ping/pong for connection health monitoring
    - **Error Handling**: Graceful error messages for invalid inputs
    
    ## Connection Management
    
    - Automatic reconnection recommended (client-side)
    - Max connection time: Unlimited
    - Idle timeout: None (use ping/pong)
    - Max message size: 1MB
    """
    await connection_manager.connect(websocket)
    
    try:
        # Send welcome message
        await connection_manager.send_personal_message({
            "type": "system",
            "message": "Connected to CivicSense. Ask me about safety, transit, emergencies, or services in your area."
        }, websocket)
        
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            
            try:
                message_data = json.loads(data)
                message_type = message_data.get("type")
                
                if message_type == "query":
                    # Send acknowledgment
                    await connection_manager.send_personal_message({
                        "type": "status",
                        "message": "Processing your question..."
                    }, websocket)
                    
                    # Process the query using AI agents
                    user_message = message_data.get("message", "")
                    context = message_data.get("context", {})
                    
                    logger.info(f"Processing query: {user_message}")
                    
                    try:
                        # Get response from query handler
                        response = await query_handler.process_query(user_message, context)
                        
                        # Send response back to client
                        await connection_manager.send_personal_message({
                            "type": "response",
                            "message": response["answer"],
                            "sources": response.get("sources", []),
                            "severity": response.get("severity", "info"),
                            "affected_areas": response.get("affected_areas", []),
                            "timestamp": response.get("timestamp")
                        }, websocket)
                        
                    except Exception as e:
                        logger.error(f"Error processing query: {e}")
                        await connection_manager.send_personal_message({
                            "type": "error",
                            "message": "I'm having trouble processing your question. Please try again."
                        }, websocket)
                
                elif message_type == "ping":
                    # Handle ping for connection keep-alive
                    await connection_manager.send_personal_message({
                        "type": "pong"
                    }, websocket)
                
                else:
                    await connection_manager.send_personal_message({
                        "type": "error",
                        "message": f"Unknown message type: {message_type}"
                    }, websocket)
                    
            except json.JSONDecodeError:
                await connection_manager.send_personal_message({
                    "type": "error",
                    "message": "Invalid message format. Please send valid JSON."
                }, websocket)
            
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket)
        logger.info("Client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        connection_manager.disconnect(websocket)


@app.post(
    "/api/query",
    response_model=QueryResponse,
    tags=["Query"],
    summary="Submit a civic query",
    description="""
    Process a user query using CivicSense's multi-agent AI system.
    
    ## Processing Pipeline
    
    1. **Triage Agent**: Classifies the query by category and urgency
    2. **Vector Search**: Retrieves relevant civic guidelines from knowledge base
    3. **Impact Agent**: Assesses severity and identifies affected areas
    4. **Guidance Agent**: Generates clear, actionable response using RAG
    5. **Monitoring Agent**: Logs interaction for analytics
    
    ## Query Categories
    
    - `emergency`: Fire, weather alerts, public safety
    - `infrastructure`: Power, water, internet, roads
    - `education`: Schools, closures, safety
    - `transit`: Buses, trains, delays
    - `general`: Other civic inquiries
    
    ## User Types
    
    Responses are adapted based on user type:
    - `parent`: Safety-focused, decision-making guidance
    - `senior`: Simplified language, accessibility-aware
    - `worker`: Concise, commute-focused
    - `student`: Direct, peer-relevant
    - `general`: Balanced information
    
    ## Response Time
    
    Average: 2-3 seconds (includes AI reasoning + vector search)
    """,
    responses={
        200: {
            "description": "Query processed successfully",
            "content": {
                "application/json": {
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
            }
        },
        400: {
            "model": ErrorResponse,
            "description": "Invalid request (missing required fields)"
        },
        500: {
            "model": ErrorResponse,
            "description": "Internal server error during processing"
        }
    },
    status_code=status.HTTP_200_OK
)
async def query_endpoint(query: QueryRequest) -> QueryResponse:
    """
    Process a civic query using multi-agent AI system.
    
    This endpoint provides an HTTP alternative to WebSocket for one-off queries.
    It processes the query through the complete AI pipeline and returns a
    comprehensive response with guidance, severity assessment, and source citations.
    
    Args:
        query: QueryRequest containing the user's message and optional context
        
    Returns:
        QueryResponse with AI-generated guidance and metadata
        
    Raises:
        HTTPException(400): If message is missing or invalid
        HTTPException(500): If processing fails
    """
    try:
        if not query.message or not query.message.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message is required and cannot be empty"
            )
        
        # Extract context as dict
        context_dict = query.context.model_dump() if query.context else {}
        
        # Process query through AI pipeline
        response = await query_handler.process_query(query.message, context_dict)
        
        # Return structured response
        return QueryResponse(**response)
        
    except HTTPException:
        raise
    except CivicSenseException as e:
        logger.error(f"Error processing query: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process query: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error processing query: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while processing your query"
        )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=False,
        log_level=settings.LOG_LEVEL.lower()
    )

