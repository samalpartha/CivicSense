# Deployment Guide for CivicSense

## 📋 Prerequisites

### 1. Confluent Cloud Setup
- ✅ Kafka cluster (Basic tier, GCP us-central1)
- ✅ 6 Kafka topics:
  - `civic_impact_signals`
  - `civic_chat_output`
  - `emergency_events`
  - `transit_events`
  - `infrastructure_events`
  - `education_events`
- ✅ Flink compute pool
- ✅ Flink SQL statements (for real-time processing)
- ✅ Service accounts and API keys
- ✅ MongoDB sink connector
- ✅ ACLs and permissions

### 2. MongoDB Atlas Resources
- ✅ Project in your organization
- ✅ Cluster (M0 Free tier already created)
- ✅ Database: `civicsense`
- ✅ Collections for civic context and chat history
- ✅ IP access list

### 3. GCP Resources
- ✅ Service account for integrations
- ✅ Cloud Storage bucket
- ✅ IAM bindings

---

## ⏱️ Deployment Timeline

- **GCP Authentication**: 2-3 minutes (browser OAuth)
- **Terraform Planning**: 1-2 minutes
- **Infrastructure Creation**: 10-15 minutes
  - Kafka cluster: ~5 minutes
  - Flink pool: ~3 minutes
  - MongoDB setup: ~2 minutes
  - Connectors & topics: ~3 minutes
- **Backend Deployment**: 2-3 minutes

**Total: ~15-20 minutes**

---

## 🎯 After Deployment

### Extract Connection Details

After Terraform completes, run these commands to get your application credentials:

```bash
cd /Users/psama0214/Hackathon-New/maap-confluent-gcp-qs-main

# Get Kafka bootstrap servers
docker compose run --rm terraform output -raw bootstrap_servers

# Get Kafka API key (for applications)
docker compose run --rm terraform output -raw clients_kafka_api_key

# Get Kafka API secret
docker compose run --rm terraform output -raw clients_kafka_api_secret

# Get MongoDB host
docker compose run --rm terraform output -raw mongodb_host

# Get MongoDB user
docker compose run --rm terraform output -raw mongodb_db_user

# Get MongoDB password
docker compose run --rm terraform output -raw mongodb_db_password
```

### Update Backend .env File

Use the outputs above to fill in:
```
/Users/psama0214/Hackathon-New/maap-confluent-gcp-qs-main/services/backend/.env
```

**Required fields:**
- `KAFKA_BOOTSTRAP_SERVERS`
- `KAFKA_API_KEY`
- `KAFKA_API_SECRET`
- `MONGO_URI` (format: `mongodb+srv://USER:PASS@HOST/civicsense?retryWrites=true&w=majority`)
- `GEMINI_API_KEY=YOUR_GEMINI_API_KEY`
- `GCP_PROJECT_ID=YOUR_PROJECT_ID`

---

## 🔧 Start Services

### 1. Start Event Producers (Simulate Data)

```bash
cd /Users/psama0214/Hackathon-New/maap-confluent-gcp-qs-main/producers
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Copy backend .env
cp ../services/backend/.env .env

# Launch all producers
./demo_launcher.sh
```

### 2. Start Backend API

```bash
cd /Users/psama0214/Hackathon-New/maap-confluent-gcp-qs-main/services/backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8081 --reload
```

**Verify:**
- http://localhost:8081/docs (Swagger UI)
- http://localhost:8081/health (Health check)

### 3. Start Frontend

```bash
cd /Users/psama0214/Hackathon-New/maap-confluent-gcp-qs-main/services/websocket/frontend
npm install
npm run dev
```

**Access:**
- http://localhost:5173 (React UI)

---

## 🎬 Demo Scenario

1. **Open Confluent Cloud Console**
   - Watch live events flowing into topics
   
2. **Open Frontend** (http://localhost:5173)
   - Ask: "Is it safe to go outside?"
   
3. **Trigger Emergency Event**
   - Run emergency producer in burst mode
   
4. **Ask Again**
   - Watch AI response change in real-time!

---

## 📊 Monitoring

### Confluent Cloud Console
```
https://confluent.cloud
```
- View cluster metrics
- Monitor Flink SQL jobs
- Check connector status

### Backend API Health
```
http://localhost:8081/health
```

### MongoDB Atlas Console
```
https://cloud.mongodb.com
```
- View collections
- Monitor vector search
- Check performance

---

## 🆘 Troubleshooting

### Issue: Terraform fails with authentication error
**Solution**: Re-run GCP authentication
```bash
docker run -v "$(pwd)/.config:/root/.config/" -ti --rm gcr.io/google.com/cloudsdktool/google-cloud-cli:stable gcloud auth application-default login
```

### Issue: Port 8081 already in use
**Solution**: Change port in `services/backend/config.py`

### Issue: MongoDB connection timeout
**Solution**: Check IP whitelist in MongoDB Atlas Network Access

### Issue: Kafka authentication failed
**Solution**: Verify API keys in `.env` match Terraform outputs

---

## 🔐 Security Reminders

1. ✅ `credentials.txt` is in `.gitignore`
2. ✅ `.env` files are in `.gitignore`
3. ⚠️ **DELETE `credentials.txt` after successful deployment**
4. ⚠️ Never commit API keys to git
5. ⚠️ Rotate keys after the hackathon

---

## 📞 Support

For issues during deployment:
- Check `infrastructure/terraform.log`
- View Docker logs: `docker compose logs`
- Confluent support: gcpteam@confluent.io

---

**You're ready to deploy! Run `./deploy.sh` now!** 🚀
