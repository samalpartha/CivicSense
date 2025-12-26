# CivicSense API Documentation

## 🎯 Overview

The CivicSense backend now includes **complete OpenAPI/Swagger documentation** for all endpoints. This provides an interactive API explorer, automatic client SDK generation, and comprehensive endpoint documentation.

---

## 🚀 Accessing the Documentation

### 1. Start the Backend

```bash
cd services/backend
source venv/bin/activate
./deploy.sh
```

### 2. Access Documentation Interfaces

Once the backend is running on `http://localhost:8000`, you can access:

#### **Swagger UI** (Interactive)
📍 **URL**: [http://localhost:8000/docs](http://localhost:8000/docs)

**Features**:
- Interactive "Try it out" functionality
- Test endpoints directly in browser
- View request/response schemas
- See example payloads
- Execute real API calls

**Perfect for**: Testing, demos, development

#### **ReDoc** (Reference)
📍 **URL**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

**Features**:
- Beautiful, scrollable documentation
- Detailed schema descriptions
- Code examples in multiple languages
- Printable/exportable format

**Perfect for**: Reading, reference, integration planning

#### **OpenAPI JSON** (Machine-Readable)
📍 **URL**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

**Features**:
- Raw OpenAPI 3.0 specification
- Generate client SDKs
- Import into API tools (Postman, Insomnia)
- CI/CD integration

**Perfect for**: Automation, code generation, tooling

---

## 📋 Available Endpoints

### Health Endpoints

#### `GET /`
Root endpoint with basic service information.

**Response**:
```json
{
  "service": "CivicSense Backend",
  "status": "healthy",
  "version": "1.0.0"
}
```

#### `GET /health`
Detailed health check with component status.

**Response**:
```json
{
  "status": "healthy",
  "kafka_connected": true,
  "active_connections": 5,
  "query_handler_ready": true
}
```

---

### Query Endpoints

#### `POST /api/query`
Submit a civic query for AI processing.

**Request Body**:
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
  "answer": "Based on current conditions, schools are operating normally today...",
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
curl -X POST "http://localhost:8000/api/query" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Is it safe to go outside?",
    "context": {
      "user_type": "general"
    }
  }'
```

---

### WebSocket Endpoint

#### `WS /ws/chat`
Real-time bidirectional chat connection.

**Connection**:
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/chat');
```

**Send Query**:
```json
{
  "type": "query",
  "message": "What transit lines are affected?",
  "context": {
    "user_type": "worker",
    "location": "Downtown"
  }
}
```

**Receive Response**:
```json
{
  "type": "response",
  "message": "The Blue Line is experiencing delays...",
  "sources": ["Transit Authority"],
  "severity": "moderate",
  "affected_areas": ["Downtown", "Midtown"],
  "timestamp": "2025-12-25T10:30:00"
}
```

See WebSocket endpoint documentation in Swagger UI for complete message protocol.

---

## 🧪 Testing in Swagger UI

### Step 1: Navigate to Swagger UI
Open [http://localhost:8000/docs](http://localhost:8000/docs) in your browser.

### Step 2: Test an Endpoint

1. **Expand** the endpoint (e.g., `POST /api/query`)
2. Click **"Try it out"** button
3. **Edit** the request body:
   ```json
   {
     "message": "Are there any emergencies in my area?",
     "context": {
       "user_type": "general",
       "location": "Downtown"
     }
   }
   ```
4. Click **"Execute"**
5. View the response below

### Step 3: Explore Schemas

Scroll down in Swagger UI to see all **Schemas** (Pydantic models):
- QueryRequest
- QueryResponse
- HealthResponse
- WebSocketQueryMessage
- And more...

---

## 📊 API Features

### Request Validation
- **Automatic**: Pydantic validates all incoming requests
- **Type-safe**: Enforces correct data types
- **Error messages**: Clear validation errors for invalid inputs

### Response Models
- **Structured**: All responses follow defined schemas
- **Predictable**: Guaranteed response format
- **Documented**: Every field is described

### Examples
- **Request examples**: Pre-filled for every endpoint
- **Response examples**: Shows what to expect
- **Edge cases**: Error response examples

### Interactive Testing
- **Try it out**: Execute real API calls from browser
- **No auth needed**: Local testing without authentication
- **Live data**: See actual responses from your backend

---

## 🎬 Demo for Judges

### Show Professional API Design

1. **Open Swagger UI** during demo
2. **Show the interactive docs** - emphasizes production-ready code
3. **Execute a live query**:
   - Click "Try it out" on POST /api/query
   - Show the request/response schemas
   - Execute and show real-time AI response
4. **Highlight features**:
   - "Complete OpenAPI documentation"
   - "Professional API design"
   - "Ready for client integration"

### Talking Points

> "Our API includes complete Swagger documentation. Here you can see all endpoints, test them interactively, and view detailed schemas. This makes integration easy for any developer."

> "Every endpoint has proper request validation, response models, and examples. This is production-grade API design."

> "We support both HTTP and WebSocket—HTTP for one-off queries, WebSocket for continuous interaction."

---

## 🔧 Generate Client SDKs

Using the OpenAPI specification, you can generate client libraries:

### Python Client
```bash
openapi-generator-cli generate \
  -i http://localhost:8000/openapi.json \
  -g python \
  -o ./client-python
```

### TypeScript Client
```bash
openapi-generator-cli generate \
  -i http://localhost:8000/openapi.json \
  -g typescript-fetch \
  -o ./client-typescript
```

### Other Languages
Supports 50+ languages including Java, Go, Ruby, PHP, C#, and more.

---

## 📝 Schema Documentation

All Pydantic models are fully documented with:

- **Field descriptions**: What each field represents
- **Examples**: Sample values for clarity
- **Validation rules**: Min/max length, patterns, ranges
- **Default values**: Optional fields with defaults
- **Type information**: Exact data types expected

Example from `QueryRequest`:
```python
class QueryRequest(BaseModel):
    message: str = Field(
        ...,
        description="The user's question about civic events",
        example="Is it safe to go to school today?",
        min_length=1,
        max_length=500
    )
```

This generates comprehensive OpenAPI schema with all metadata.

---

## 🏆 Benefits for Hackathon

### Demonstrates Professional Quality
- ✅ Complete API documentation
- ✅ Interactive testing capability
- ✅ Production-ready design
- ✅ Easy integration

### Impresses Judges
- "This isn't just a prototype—it's production-ready"
- Shows attention to detail
- Demonstrates best practices
- Ready for real-world use

### Easy to Demo
- Live API testing in browser
- Visual, interactive interface
- No Postman setup needed
- Clear, professional presentation

---

## 🔍 Troubleshooting

### Can't Access Swagger UI

**Problem**: 404 on /docs

**Solution**:
1. Ensure backend is running: `curl http://localhost:8000/health`
2. Check port (default 8000): `netstat -an | grep 8000`
3. Verify no CORS issues in browser console

### Validation Errors

**Problem**: 422 Unprocessable Entity

**Solution**:
- Check request matches schema exactly
- Verify all required fields are present
- Ensure correct data types
- Review validation rules in Swagger UI

### WebSocket Not Connecting

**Problem**: WebSocket connection fails

**Solution**:
1. Use `ws://` for http, `wss://` for https
2. Check firewall/proxy settings
3. Verify backend WebSocket endpoint is active
4. Test with simple WebSocket client first

---

## 📚 Additional Resources

### FastAPI Documentation
- [OpenAPI Support](https://fastapi.tiangolo.com/tutorial/metadata/)
- [Response Models](https://fastapi.tiangolo.com/tutorial/response-model/)
- [Request Validation](https://fastapi.tiangolo.com/tutorial/body/)

### Pydantic Documentation
- [Models](https://docs.pydantic.dev/latest/concepts/models/)
- [Field](https://docs.pydantic.dev/latest/concepts/fields/)
- [Validation](https://docs.pydantic.dev/latest/concepts/validators/)

### OpenAPI Specification
- [OpenAPI 3.0](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [ReDoc](https://github.com/Redocly/redoc)

---

## ✅ Summary

**What you now have**:

1. ✅ Complete Swagger UI at `/docs`
2. ✅ ReDoc documentation at `/redoc`
3. ✅ OpenAPI JSON at `/openapi.json`
4. ✅ All endpoints documented
5. ✅ Request/response models defined
6. ✅ Interactive testing capability
7. ✅ Professional API design
8. ✅ Ready for demo

**Access now**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

*CivicSense - Production-ready API design for the Confluent Hackathon* 🚀


