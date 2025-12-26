# CivicSense Chatbot Feature Guide

## Overview

The CivicSense chatbot is a **real-time AI-powered assistant** that helps citizens understand and respond to civic events, emergencies, and service disruptions. It combines:

- 🔄 **Real-time streaming data** from Kafka
- 🤖 **Multi-agent AI system** for intelligent responses
- 🔍 **Vector search** for knowledge retrieval
- 💬 **WebSocket** for instant communication

## Architecture

```
┌─────────────┐
│   Browser   │
│  (React UI) │
└──────┬──────┘
       │ WebSocket
       │ /ws/chat
       ▼
┌──────────────────┐
│  FastAPI Server  │
│   Connection     │
│    Manager       │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌──────────────┐
│  Kafka  │ │Query Handler │
│Consumer │ │ (Orchestrator)│
└─────────┘ └───────┬──────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
    ┌───────┐  ┌────────┐  ┌─────────┐
    │Triage │  │Impact  │  │Guidance │
    │Agent  │  │Agent   │  │Agent    │
    └───────┘  └────────┘  └─────────┘
                    │
                    ▼
            ┌───────────────┐
            │  Gemini AI    │
            │ + Vector DB   │
            └───────────────┘
```

## How It Works

### 1. User Sends a Query

**Frontend** (`ChatBox.tsx`):
```typescript
// User types: "Is it safe to go to school today?"
wsService.sendQuery(message, {
  user_type: 'parent',
  language: 'en'
});
```

**Message Format**:
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

### 2. Backend Receives Query

**WebSocket Handler** (`main.py`):
- Accepts WebSocket connection
- Parses incoming JSON message
- Sends acknowledgment: "Processing your question..."
- Routes to Query Handler

### 3. Multi-Agent Processing Pipeline

#### Step 1: Triage Agent
**Purpose**: Classify the query

```python
# Input: "Is it safe to go to school today?"
# Output:
{
  "category": "education",
  "urgency": "medium",
  "confidence": 0.92,
  "reasoning": "School safety inquiry"
}
```

**Categories**:
- `emergency`: Fire, flood, severe weather
- `infrastructure`: Power, water, internet, roads
- `education`: Schools, closures, schedules
- `transit`: Buses, trains, metro
- `general`: Other civic questions

#### Step 2: Vector Search
**Purpose**: Retrieve relevant knowledge

```python
# Searches MongoDB Atlas for similar documents
# Uses Gemini embeddings for semantic matching
results = [
  {
    "title": "School Closure Guidelines",
    "content": "Schools close when...",
    "score": 0.89
  }
]
```

#### Step 3: Impact Agent
**Purpose**: Assess severity and scope

```python
# Output:
{
  "severity": "low",
  "affected_groups": ["students", "parents", "teachers"],
  "affected_areas": ["Downtown", "Midtown"],
  "time_sensitive": true,
  "estimated_impact": "Affects morning commute decisions"
}
```

**Severity Levels**:
- `critical`: Life-threatening, immediate action required
- `high`: Significant disruption, urgent attention
- `moderate`: Notable impact, plan accordingly
- `low`: Minor inconvenience
- `info`: Informational only

#### Step 4: Guidance Agent
**Purpose**: Generate clear, actionable response

```python
# Combines:
# - Triage classification
# - Vector search knowledge
# - Impact assessment
# - User context (parent)

# Output:
{
  "answer": "Based on current conditions, schools are 
             operating normally today. There are no 
             weather alerts or safety concerns affecting 
             the Downtown area. Your child can safely 
             attend school. However, be aware of a minor 
             road closure on Main St that may add 5-10 
             minutes to your morning commute.",
  "knowledge_used": true,
  "sources_count": 2
}
```

**Guidance Principles**:
- ✅ Clear, simple language
- ✅ Specific action steps
- ✅ Calm, reassuring tone
- ✅ Adapted to user type
- ❌ No speculation
- ❌ No legal advice
- ❌ No panic language

#### Step 5: Monitoring Agent
**Purpose**: Log for analytics (async, non-blocking)

```python
# Stores in MongoDB:
{
  "timestamp": "2025-12-25T10:30:00Z",
  "query": "Is it safe to go to school today?",
  "category": "education",
  "severity": "low",
  "processing_time": 2.3,
  "user_type": "parent"
}
```

### 4. Response Sent to User

**Backend** (`main.py`):
```python
await connection_manager.send_personal_message({
  "type": "response",
  "message": "Based on current conditions...",
  "severity": "low",
  "affected_areas": ["Downtown"],
  "sources": ["School Closure Guidelines"],
  "timestamp": "2025-12-25T10:30:00Z"
}, websocket)
```

**Frontend** (`ChatBox.tsx`):
- Receives message via WebSocket
- Displays in chat interface
- Shows severity indicator
- Lists sources if available
- Auto-scrolls to new message

## User Types and Tone Adaptation

The Guidance Agent adapts responses based on user type:

### Parent
- **Focus**: Safety, decision-making for children
- **Tone**: Clear, reassuring, actionable
- **Example**: "Your child can safely attend school today. However, be aware of..."

### Senior
- **Focus**: Simplicity, accessibility
- **Tone**: Extra clear, avoid jargon
- **Example**: "It is safe to go outside today. The weather is good. If you need help..."

### Worker
- **Focus**: Commute, work impact
- **Tone**: Concise, time-efficient
- **Example**: "Your commute is affected. Take Route 5 instead. Expect 15-minute delay."

### Student
- **Focus**: Direct answers, peer-relevant
- **Tone**: Straightforward, brief
- **Example**: "School is open. Bus 42 is delayed 10 minutes."

### General
- **Focus**: Balanced information
- **Tone**: Professional, informative
- **Example**: "Current conditions are normal. No alerts in your area."

## Real-Time Updates

The chatbot also receives **live updates from Kafka**:

```python
# Kafka consumer broadcasts to all connected clients
await connection_manager.broadcast({
  "type": "kafka_update",
  "topic": "impact_signals",
  "data": {
    "event": "power_outage",
    "area": "Downtown",
    "severity": "high"
  }
})
```

**Frontend displays**:
- 🔴 Alert badge
- Push notification (if enabled)
- Live update in chat

## Example Conversations

### Example 1: Emergency Query

**User**: "Is there a fire near me?"

**Triage**: `category=emergency, urgency=critical`

**Impact**: `severity=high, affected_areas=["Downtown"]`

**Response**: 
> ⚠️ **ALERT**: There is an active fire incident 3 blocks from Downtown. 
> 
> **Immediate Actions**:
> 1. Stay indoors if you're in the area
> 2. Close windows and doors
> 3. Monitor local news for evacuation orders
> 4. Emergency hotline: 911
> 
> **Affected Areas**: Downtown, 3rd St to 5th St
> 
> This is a developing situation. I'll update you as more information becomes available.

### Example 2: Transit Query

**User**: "Why is my train delayed?"

**Triage**: `category=transit, urgency=medium`

**Impact**: `severity=moderate, affected_groups=["commuters"]`

**Response**:
> 🚇 **Transit Update**: The Blue Line is experiencing delays due to signal maintenance at Central Station.
> 
> **Current Status**:
> - Delays: 10-15 minutes
> - Alternative: Take Red Line to Oak St, transfer to Bus 42
> - Expected resolution: 11:00 AM
> 
> **Affected Lines**: Blue Line (all stops)
> 
> I'm monitoring the situation and will notify you when service returns to normal.

### Example 3: General Inquiry

**User**: "What civic services are available on weekends?"

**Triage**: `category=general, urgency=low`

**Impact**: `severity=info`

**Response**:
> 📋 **Weekend Civic Services**:
> 
> **Open on Saturdays**:
> - City Hall (9 AM - 1 PM)
> - Public Library (10 AM - 6 PM)
> - Recreation Centers (8 AM - 8 PM)
> 
> **Open on Sundays**:
> - Public Library (12 PM - 5 PM)
> - Emergency Services (24/7)
> 
> **Closed Weekends**:
> - DMV
> - Permit Office
> - Tax Services
> 
> For emergencies, call 911 anytime.

## Technical Details

### WebSocket Protocol

**Connection**: `ws://localhost:8000/ws/chat` (or `wss://` for HTTPS)

**Message Types**:

| Type | Direction | Purpose |
|------|-----------|---------|
| `query` | Client → Server | User question |
| `response` | Server → Client | AI-generated answer |
| `status` | Server → Client | Processing updates |
| `error` | Server → Client | Error messages |
| `system` | Server → Client | Connection events |
| `kafka_update` | Server → Client | Live event updates |
| `ping` | Client → Server | Keep-alive |
| `pong` | Server → Client | Keep-alive response |

### Connection Management

**Automatic Reconnection**:
```typescript
// Frontend automatically reconnects if disconnected
private reconnectAttempts: number = 0;
private maxReconnectAttempts: number = 5;
private reconnectDelay: number = 3000; // 3 seconds
```

**Keep-Alive**:
```typescript
// Send ping every 30 seconds
setInterval(() => {
  wsService.sendPing();
}, 30000);
```

### Performance

**Average Response Times**:
- Triage: ~0.5s
- Vector Search: ~0.3s
- Impact Assessment: ~0.6s
- Guidance Generation: ~1.2s
- **Total**: ~2.5s end-to-end

**Optimizations**:
- Async/await throughout (non-blocking)
- Connection pooling for MongoDB
- Cached Gemini model instances
- Parallel agent execution where possible

### Error Handling

**Graceful Degradation**:
```python
# If vector search fails, continue without knowledge base
try:
    search_results = await vector_search.search(query)
except VectorSearchError:
    search_results = []
    logger.warning("Vector search failed, continuing without KB")
```

**User-Friendly Errors**:
```json
{
  "type": "error",
  "message": "I'm having trouble processing your question. 
              Please try rephrasing or contact support."
}
```

## Configuration

### Environment Variables

```env
# Gemini AI (for agents)
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-1.5-pro

# MongoDB (for vector search)
MONGO_URI=mongodb+srv://...
MONGO_DATABASE=civicsense
MONGO_COLLECTION_GUIDES=civic_guides
MONGO_VECTOR_INDEX=vector_index

# Kafka (for real-time updates)
KAFKA_BOOTSTRAP_SERVERS=pkc-xxxxx.confluent.cloud:9092
KAFKA_API_KEY=...
KAFKA_API_SECRET=...

# Application
LOG_LEVEL=INFO
HOST=0.0.0.0
PORT=8000
```

### Customization

**Adjust Agent Behavior**:
```python
# In agents/guidance_agent.py
self.system_instruction = """
You are a helpful civic guidance assistant.
[Customize tone, style, constraints here]
"""
```

**Change Temperature**:
```python
# Lower = more deterministic, Higher = more creative
await self.call_gemini(
    prompt=prompt,
    temperature=0.7  # Adjust 0.0-1.0
)
```

## Testing the Chatbot

### Manual Testing

1. **Start Backend**:
   ```bash
   cd services/backend
   ./deploy.sh
   ```

2. **Start Frontend**:
   ```bash
   cd services/websocket/frontend
   npm run dev
   ```

3. **Open Browser**: `http://localhost:5173`

4. **Test Queries**:
   - "Is there an emergency in my area?"
   - "Are schools open today?"
   - "Why is the power out?"
   - "What transit lines are affected?"

### Command-Line Testing

```bash
# Install wscat
npm install -g wscat

# Connect
wscat -c ws://localhost:8000/ws/chat

# Send query
{"type":"query","message":"Is it safe outside?","context":{"user_type":"general"}}

# Wait for response
```

### HTTP API Testing

```bash
# Alternative to WebSocket
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What civic services are open?",
    "context": {"user_type": "general"}
  }'
```

## Troubleshooting

### Chatbot Not Responding

1. **Check Backend**: `curl http://localhost:8000/health`
2. **Check Logs**: Look for errors in terminal
3. **Verify Environment**: Ensure `.env` has all required variables
4. **Test Gemini API**: Verify API key is valid

### Slow Responses

1. **Check Gemini Quotas**: May be rate-limited
2. **Optimize Vector Search**: Reduce `VECTOR_SEARCH_LIMIT`
3. **Check Network**: Latency to GCP/MongoDB
4. **Review Logs**: Look for timeout warnings

### Connection Drops

1. **Check WebSocket**: Ensure no firewall blocking
2. **Increase Timeout**: Adjust `session.timeout.ms` in Kafka config
3. **Enable Keep-Alive**: Frontend sends ping every 30s
4. **Check Server Resources**: CPU/memory usage

## Best Practices

### For Users
- ✅ Ask specific questions
- ✅ Provide location context when relevant
- ✅ Specify user type for better responses
- ❌ Don't ask multiple questions at once
- ❌ Don't expect legal or medical advice

### For Developers
- ✅ Always handle WebSocket disconnections
- ✅ Implement exponential backoff for reconnection
- ✅ Log all interactions for debugging
- ✅ Use async/await for non-blocking operations
- ✅ Validate all inputs
- ❌ Don't block the event loop
- ❌ Don't expose sensitive data in logs

## Future Enhancements

### Planned Features
- [ ] Multi-language support (Spanish, Chinese, etc.)
- [ ] Voice input/output
- [ ] Image/photo analysis for incident reporting
- [ ] Personalized alerts based on user preferences
- [ ] Historical query search
- [ ] Suggested follow-up questions
- [ ] Integration with city 311 systems
- [ ] Mobile push notifications

### Optimization Opportunities
- [ ] Response caching for common queries
- [ ] Batch processing for multiple queries
- [ ] Streaming responses (word-by-word)
- [ ] Pre-computed embeddings for frequent queries
- [ ] Agent result caching

## Summary

The CivicSense chatbot is a **production-ready, real-time AI assistant** that:

✅ Processes queries through a multi-agent AI pipeline  
✅ Provides clear, actionable guidance adapted to user needs  
✅ Integrates live streaming data from Kafka  
✅ Uses RAG for grounded, accurate responses  
✅ Handles errors gracefully with fallbacks  
✅ Scales to handle multiple concurrent users  
✅ Follows best practices for async Python and TypeScript  

**Ready for demonstration and deployment!** 🚀

