# CivicSense Manual Setup Guide

Since you already have MongoDB Cluster0 created and there are some Terraform issues, here's how to proceed manually:

## ✅ What's Already Done

- ✅ Confluent Cloud account with API keys
- ✅ MongoDB Cluster0 created manually
- ✅ MongoDB database user created
- ✅ Google Cloud project and Gemini API
- ✅ GCP service account created by Terraform

## 🚀 Complete Setup Steps

### Step 1: Get MongoDB Connection String

1. Go to https://cloud.mongodb.com
2. Click on "Cluster0" → "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with: `OoflDAZDE7xOz0I6`
6. Replace `<dbname>` with: `civicsense`

**Your connection string should look like:**
```
mongodb+srv://samalpartha_db_user:OoflDAZDE7xOz0I6@cluster0.xxxxx.mongodb.net/civicsense?retryWrites=true&w=majority
```

### Step 2: Create Confluent Resources Manually

#### Option A: Use Confluent Cloud Console (Easier)

1. **Go to**: https://confluent.cloud
2. **Create Environment**: "civicsense"
3. **Create Cluster**: Basic tier, GCP, us-central1
4. **Create Topics**:
   - `civic_impact_signals`
   - `civic_chat_output`
   - `emergency_events`
   - `transit_events`
   - `infrastructure_events`
   - `education_events`

5. **Create API Keys**:
   - Go to Cluster → API Keys
   - Create a new key for your application
   - Save the Key and Secret

#### Option B: Use Confluent CLI (Faster)

```bash
# Install Confluent CLI
brew install confluentinc/tap/cli

# Login
confluent login

# Create environment
confluent environment create civicsense

# Select environment
confluent environment use <env-id>

# Create cluster
confluent kafka cluster create civicsense-cluster \
  --cloud gcp \
  --region us-central1 \
  --type basic

# Create topics
for topic in civic_impact_signals civic_chat_output emergency_events transit_events infrastructure_events education_events; do
  confluent kafka topic create $topic --partitions 3
done

# Create API key
confluent api-key create --resource <cluster-id>
```

### Step 3: Update Backend .env File

Edit `/Users/psama0214/Hackathon-New/maap-confluent-gcp-qs-main/services/backend/.env`:

```bash
# Confluent Cloud Kafka
KAFKA_BOOTSTRAP_SERVERS=pkc-xxxxx.us-central1.gcp.confluent.cloud:9092
KAFKA_API_KEY=YOUR_KAFKA_API_KEY
KAFKA_API_SECRET=YOUR_KAFKA_API_SECRET

# Kafka Topics
KAFKA_TOPIC_IMPACT_SIGNALS=civic_impact_signals
KAFKA_TOPIC_CHAT_OUTPUT=civic_chat_output

# MongoDB Atlas
MONGO_URI=mongodb+srv://samalpartha_db_user:OoflDAZDE7xOz0I6@cluster0.xxxxx.mongodb.net/civicsense?retryWrites=true&w=majority
MONGO_DATABASE=civicsense
MONGO_COLLECTION_CONTEXT=civic_context
MONGO_COLLECTION_HISTORY=chat_history

# Google Gemini AI
GEMINI_API_KEY=AIzaSyA6Do1M7HzALtbrNdgev0EyBvKjuYy20S8
GCP_PROJECT_ID=239792488452
GCP_REGION=us-central1

# Server Config
LOG_LEVEL=INFO
HOST=0.0.0.0
PORT=8081
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Step 4: Start the Backend

```bash
cd /Users/psama0214/Hackathon-New/maap-confluent-gcp-qs-main/services/backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8081 --reload
```

### Step 5: Start the Frontend

```bash
cd /Users/psama0214/Hackathon-New/maap-confluent-gcp-qs-main/services/websocket/frontend
npm install
npm run dev
```

### Step 6: Run Event Producers

```bash
cd /Users/psama0214/Hackathon-New/maap-confluent-gcp-qs-main/producers
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Copy backend .env
cp ../services/backend/.env .env

# Run individual producers
python emergency_producer.py
```

## 🎬 Demo

1. Open http://localhost:5173
2. Start event producers
3. Ask the chatbot questions about civic events
4. Watch real-time responses!

## 🔧 If You Want to Fix Terraform Issues

### Fix GCP Billing:
1. Go to https://console.cloud.google.com/billing
2. Enable billing for project 239792488452

### Fix MongoDB Org ID:
1. Go to https://cloud.mongodb.com
2. Check the URL for your actual org ID
3. Update `infrastructure/terraform.tfvars`
4. Run: `terraform apply` again

---

**For hackathon purposes, the manual setup (Option A) is fastest!** ⚡


