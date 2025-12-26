# 🚀 Quick API Access Guide

## Start the Backend

```bash
cd services/backend
source venv/bin/activate
./deploy.sh
```

## Access the API Documentation

### 📚 Swagger UI (Interactive)
**URL**: http://localhost:8000/docs

**What you can do**:
- ✅ View all endpoints
- ✅ See request/response schemas
- ✅ Test APIs with "Try it out"
- ✅ Execute real queries
- ✅ View examples

### 📖 ReDoc (Reference)
**URL**: http://localhost:8000/redoc

**What you can do**:
- ✅ Beautiful documentation
- ✅ Scrollable reference
- ✅ Detailed schemas
- ✅ Code examples

### 🔧 OpenAPI JSON
**URL**: http://localhost:8000/openapi.json

**What you can do**:
- ✅ Raw specification
- ✅ Generate client SDKs
- ✅ Import to Postman
- ✅ CI/CD integration

## Quick Test

### Test in Browser (Swagger UI)

1. Open http://localhost:8000/docs
2. Find `POST /api/query`
3. Click "Try it out"
4. Use this example:
   ```json
   {
     "message": "Is it safe to go outside?",
     "context": {
       "user_type": "general"
     }
   }
   ```
5. Click "Execute"
6. See the AI response!

### Test with cURL

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

### Test with Python

```python
import requests

response = requests.post(
    "http://localhost:8000/api/query",
    json={
        "message": "Is it safe to go outside?",
        "context": {"user_type": "general"}
    }
)

print(response.json())
```

## Verify Everything Works

```bash
# Run automated test
cd services/backend
python test_api.py
```

Expected output:
```
✅ All tests passed!
📚 Access Swagger UI: http://localhost:8000/docs
```

## For Demo

1. **Start backend** before demo
2. **Open Swagger UI** in browser tab
3. **Keep it ready** to show judges
4. **Demo the "Try it out"** feature live

---

**That's it! Your API is fully documented and ready to use.** 🎉


