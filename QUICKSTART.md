# CivicSense Quick Start Guide 🚀

Follow this 5-minute guide to get CivicSense running locally.

## 📋 Prerequisites

- **Python 3.11+**
- **Docker & Docker Compose**
- **Confluent Cloud Account** (Kafka & Flink)
- **MongoDB Atlas Account** (Vector Search)
- **Google Cloud Gemini API Key**
- **Redis** (Local or Cloud)

---

## 🛠️ Rapid Setup

### 1. Clone & Configure
```bash
git clone https://github.com/samalpartha/CivicSense.git
cd CivicSense

# Setup Backend Environment
cp services/backend/env.template services/backend/.env
# Edit services/backend/.env with your API keys
```

### 2. Start Services
Ensure Docker is running, then choose your mode:

**Mode A: Complete Production Stack (Recommended)**
```bash
docker-compose up -d
```

**Mode B: Local Development**
```bash
# Terminal 1: Backend
cd services/backend
./deploy.sh

# Terminal 2: Frontend
cd services/websocket/frontend
npm install
npm run dev

# Terminal 3: Event Producers
cd producers
./demo_launcher.sh
```

---

## ⚡ Redis Integration (New!)

CivicSense now uses Redis for high-speed caching and rate limiting.

### Verification
Ensure Redis is running (default: `localhost:6379`), then run:
```bash
python3 verify_redis.py
```

---

## 🎬 Testing the Demo

1. Open the dashboard: [http://localhost:8080](http://localhost:8080)
2. Start the demo launcher in the `producers/` directory.
3. Open the **AI Copilot** (bottom right).
4. Ask: *"What are the current safety alerts?"*
5. Watch as the AI reasons over **live data in motion** from your streaming producers!

---

## 📚 Related Documentation

- [Full Architecture Deep-Dive](./IMPLEMENTATION_STATUS.md)
- [Multi-Agent System Guide](./CHATBOT_GUIDE.md)
- [Backend API Docs](./services/backend/README.md)
- [Event Producers Guide](./producers/README.md)

---

**You're all set!** For deployment to Google Cloud Run, see `deploy_updates.sh`.
