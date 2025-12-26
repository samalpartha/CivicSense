# CivicSense Backend

Real-Time Public Safety & Services Intelligence Copilot backend powered by FastAPI, Confluent Cloud Kafka, MongoDB Atlas, and Google Gemini AI.

## 📚 Complete API Documentation

**Interactive Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs) ⭐ NEW!

- Test all endpoints in your browser
- View detailed request/response schemas
- Try live API calls with example payloads
- See complete WebSocket protocol documentation

**Alternative Docs**: [ReDoc](http://localhost:8000/redoc) | [OpenAPI JSON](http://localhost:8000/openapi.json)

## Architecture

```
┌─────────────┐
│  Frontend   │ ──WebSocket──┐
└─────────────┘               │
                              ▼
                    ┌──────────────────┐
                    │  FastAPI Server  │
                    │   (main.py)      │
                    └──────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────┐  ┌──────────────┐  ┌─────────────────┐
│ Kafka Consumer  │  │ Query Handler│  │  Vector Search  │
│ (impact_signals)│  │ (Orchestrator)│  │  (MongoDB)      │
└─────────────────┘  └──────────────┘  └─────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│Triage Agent  │  │Impact Agent  │  │Guidance Agent│  │Monitor Agent │
│  (classify)  │  │  (assess)    │  │  (generate)  │  │   (log)      │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
          │                   │                   │
          └───────────────────┴───────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Gemini AI      │
                    │  (GCP/Vertex)    │
                    └──────────────────┘
```

## Features

### 1. **Real-Time Chatbot (WebSocket)**
- Persistent WebSocket connection at `/ws/chat`
- Bi-directional communication
- Automatic reconnection
- Support for multiple concurrent users

### 2. **Multi-Agent AI System**
- **Triage Agent**: Classifies queries by category and urgency
- **Impact Agent**: Assesses severity and affected areas
- **Guidance Agent**: Generates clear, actionable responses
- **Monitoring Agent**: Logs interactions for analytics

### 3. **RAG (Retrieval-Augmented Generation)**
- MongoDB Atlas Vector Search for semantic knowledge retrieval
- Gemini embeddings for query vectorization
- Context-aware response generation

### 4. **Kafka Streaming Integration**
- Consumes from `impact_signals` and `chat_output` topics
- Real-time event broadcasting to WebSocket clients
- Non-blocking async consumption

## Project Structure

```
backend/
├── main.py                 # FastAPI app & WebSocket endpoint
├── config.py               # Configuration management (Pydantic)
├── logger.py               # Centralized logging
├── exceptions.py           # Custom exception classes
├── kafka_consumer.py       # Kafka consumer manager
├── query_handler.py        # Agent orchestration
├── vector_search.py        # MongoDB Atlas vector search
├── agents/
│   ├── __init__.py
│   ├── base_agent.py       # Abstract base agent
│   ├── triage_agent.py     # Query classification
│   ├── impact_agent.py     # Impact assessment
│   ├── guidance_agent.py   # Response generation
│   └── monitoring_agent.py # Interaction logging
├── requirements.txt        # Python dependencies
├── Dockerfile              # Container image
├── .env.example            # Environment variables template
├── deploy.sh               # Deployment script
└── destroy.sh              # Teardown script
```

## Setup

### Prerequisites

- Python 3.11+
- Confluent Cloud account with Kafka cluster
- MongoDB Atlas cluster with vector search enabled
- Google Cloud account with Gemini API access

### Installation

1. **Clone the repository**:
   ```bash
   cd services/backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

5. **Required environment variables**:
   ```env
   # Kafka (Confluent Cloud)
   KAFKA_BOOTSTRAP_SERVERS=pkc-xxxxx.us-east-1.aws.confluent.cloud:9092
   KAFKA_API_KEY=your_api_key
   KAFKA_API_SECRET=your_api_secret

   # MongoDB Atlas
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/
   MONGO_DATABASE=civicsense

   # Google Gemini AI
   GEMINI_API_KEY=AIzaSy...
   GCP_PROJECT_ID=your-project-id
   ```

## Running

### Local Development

```bash
# Make sure you're in the backend directory with venv activated
./deploy.sh
```

Or manually:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Access the API

Once running:
- **API Base**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs (interactive documentation)
- **ReDoc**: http://localhost:8000/redoc (alternative docs)
- **Health Check**: http://localhost:8000/health

### Docker

```bash
docker build -t civicsense-backend .
docker run -p 8000:8000 --env-file .env civicsense-backend
```

### Production

Use Docker Compose from project root:
```bash
cd ../../  # Go to project root
docker-compose up backend
```

## API Endpoints

### WebSocket

**`/ws/chat`** - Real-time chatbot connection

**Message Types:**

1. **Query (Client → Server)**:
   ```json
   {
     "type": "query",
     "message": "Is it safe to go to school today?",
     "context": {
       "user_type": "parent",
       "location": "Downtown",
       "language": "en"
     }
   }
   ```

2. **Response (Server → Client)**:
   ```json
   {
     "type": "response",
     "message": "Based on current conditions...",
     "severity": "low",
     "affected_areas": ["Downtown", "Midtown"],
     "sources": ["Emergency Management Guide"],
     "timestamp": "2025-12-25T10:30:00Z"
   }
   ```

3. **Status (Server → Client)**:
   ```json
   {
     "type": "status",
     "message": "Processing your question..."
   }
   ```

4. **Error (Server → Client)**:
   ```json
   {
     "type": "error",
     "message": "Unable to process request"
   }
   ```

5. **Kafka Update (Server → Client)**:
   ```json
   {
     "type": "kafka_update",
     "topic": "impact_signals",
     "data": { ... }
   }
   ```

### HTTP Endpoints

All endpoints are fully documented in **[Swagger UI](http://localhost:8000/docs)** with interactive testing.

**`GET /`** - Root endpoint with service info

**`GET /health`** - Detailed health check with component status

**`POST /api/query`** - Submit a civic query for AI processing

**Request**:
```json
{
  "message": "Is it safe to go to school today?",
  "context": {
    "user_type": "parent",
    "location": "Downtown",
    "language": "en"
  }
}
```

**Response**:
```json
{
  "answer": "Based on current conditions, schools are operating normally...",
  "category": "education",
  "severity": "low",
  "affected_areas": ["Downtown"],
  "sources": ["School Closure Guidelines"],
  "confidence": 0.92,
  "timestamp": "2025-12-25T10:30:00.123456",
  "processing_time_ms": 2543.21
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What transit lines are affected?",
    "context": {"user_type": "worker"}
  }'
```

**Or test in Swagger UI**: Click "Try it out" at http://localhost:8000/docs

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `KAFKA_BOOTSTRAP_SERVERS` | Kafka broker address | Required |
| `KAFKA_API_KEY` | Confluent Cloud API key | Required |
| `KAFKA_API_SECRET` | Confluent Cloud API secret | Required |
| `MONGO_URI` | MongoDB connection string | Required |
| `MONGO_DATABASE` | Database name | `civicsense` |
| `GEMINI_API_KEY` | Google Gemini API key | Required |
| `LOG_LEVEL` | Logging level | `INFO` |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `CORS_ORIGINS` | Allowed CORS origins | `*` |

### Kafka Topics

- `emergency_events`: Emergency alerts and warnings
- `infrastructure_events`: Utility and road issues
- `education_events`: School-related updates
- `transit_events`: Transportation disruptions
- `impact_signals`: Processed impact assessments (consumed)
- `chat_output`: AI-generated responses (consumed)

## Agent System

### Triage Agent
Classifies incoming queries:
- **Categories**: emergency, infrastructure, education, transit, general
- **Urgency**: critical, high, medium, low
- **Temperature**: 0.3 (deterministic)

### Impact Agent
Assesses event severity:
- **Severity**: critical, high, moderate, low, info
- **Output**: Affected groups, areas, time sensitivity
- **Temperature**: 0.4 (slightly creative)

### Guidance Agent
Generates responses using RAG:
- **Knowledge**: Retrieved from MongoDB vector search
- **Tone**: Adapted to user type (parent, senior, student, etc.)
- **Guidelines**: Clear, calm, actionable, no speculation
- **Temperature**: 0.7 (balanced creativity)

### Monitoring Agent
Logs all interactions:
- **Storage**: MongoDB `interaction_logs` collection
- **Data**: Query, response, timing, user context
- **Purpose**: Analytics, debugging, improvements

## Development

### Adding a New Agent

1. Create file in `agents/` (e.g., `notification_agent.py`)
2. Extend `BaseAgent`:
   ```python
   from agents.base_agent import BaseAgent
   
   class NotificationAgent(BaseAgent):
       def __init__(self):
           super().__init__("NotificationAgent")
       
       async def execute(self, *args, **kwargs):
           # Implementation
           pass
   ```
3. Import and use in `query_handler.py`

### Testing WebSocket

Use `wscat` for manual testing:
```bash
npm install -g wscat
wscat -c ws://localhost:8000/ws/chat

# Send query:
{"type":"query","message":"Is the power out?","context":{"user_type":"general"}}
```

### Logging

Adjust log level via environment:
```bash
LOG_LEVEL=DEBUG uvicorn main:app
```

Log levels:
- `DEBUG`: Verbose, all operations
- `INFO`: Normal operations (default)
- `WARNING`: Important events
- `ERROR`: Error conditions only

## Best Practices

1. **Error Handling**: All agents have fallback responses
2. **Async Operations**: Non-blocking I/O for scalability
3. **Configuration**: Centralized in `config.py`
4. **Logging**: Structured logging for debugging
5. **Type Hints**: Full Python type annotations
6. **Docstrings**: Comprehensive documentation

## Troubleshooting

### WebSocket won't connect
- Check if backend is running: `curl http://localhost:8000`
- Verify CORS settings in `config.py`
- Check browser console for errors

### Kafka consumer not receiving messages
- Verify Kafka credentials in `.env`
- Check topic names match Flink output
- View logs: `LOG_LEVEL=DEBUG`

### MongoDB vector search fails
- Ensure vector index is created on collection
- Verify embedding dimension (768 for Gemini)
- Check MongoDB Atlas connection string

### Gemini API errors
- Validate `GEMINI_API_KEY`
- Check GCP project quotas
- Review rate limits

## Performance

### Benchmarks
- Average query processing: 2-3 seconds
- WebSocket latency: <100ms
- Concurrent connections: 100+ (tested)

### Optimization Tips
1. Use connection pooling for MongoDB
2. Cache frequently accessed documents
3. Batch Gemini API calls when possible
4. Implement rate limiting for production

## License

See project LICENSE file.

## Support

For questions or issues, contact the CivicSense team.

