# CivicSense Event Producers

Real-time synthetic event generators for demonstrating **AI on Data in Motion**.

## 🎯 Purpose

These producers generate realistic civic events to showcase how CivicSense processes **streaming data in real-time** using Confluent Cloud Kafka.

## 📦 Producers

### 1. Emergency Events Producer
**File**: `emergency_producer.py`  
**Topic**: `emergency_events`  
**Generates**:
- Weather alerts (thunderstorms, floods, tornadoes)
- Fire incidents
- Public safety events
- Health advisories

**Features**:
- Random severity levels (critical, high, moderate, low)
- Geographic areas and affected groups
- Safety instructions
- **Burst mode**: Simulates multiple simultaneous events (15% chance)

### 2. Transit Events Producer
**File**: `transit_producer.py`  
**Topic**: `transit_events`  
**Generates**:
- Subway/train delays
- Bus route changes
- Service suspensions
- Alternative routes

**Features**:
- Multiple transit modes (subway, bus, train)
- Delay duration estimates
- Affected stations
- Resolution timeframes

### 3. Infrastructure Events Producer
**File**: `infrastructure_producer.py`  
**Topic**: `infrastructure_events`  
**Generates**:
- Power outages
- Water advisories
- Internet disruptions
- Road closures

**Features**:
- Severity classification
- Affected customer counts
- Restoration estimates
- Utility provider information

## 🚀 Quick Start

### Setup

```bash
cd producers

# Install dependencies
pip install -r requirements.txt

# Create .env with Kafka credentials (copy from backend)
cp ../services/backend/.env .env
```

### Run Individual Producers

```bash
# Emergency events (default: every 5 seconds)
python3 emergency_producer.py

# Transit events (default: every 10 seconds)
python3 transit_producer.py

# Infrastructure events (default: every 15 seconds)
python3 infrastructure_producer.py
```

### Run All Producers (Demo Mode)

```bash
# Start all producers simultaneously
chmod +x demo_launcher.sh
./demo_launcher.sh
```

This launches all three producers in parallel for a live demo.

## ⚙️ Configuration

### Command Line Options

```bash
# Custom interval
python3 emergency_producer.py --interval 3

# Limit number of events
python3 emergency_producer.py --max 50

# Demo mode (rapid events for 2 minutes)
python3 emergency_producer.py --demo
```

### Environment Variables

Required in `.env`:
```env
# Kafka credentials
KAFKA_BOOTSTRAP_SERVERS=your-server.confluent.cloud:9092
KAFKA_API_KEY=your-api-key
KAFKA_API_SECRET=your-api-secret

# Redis (optional for producers, required for backend)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 📊 Event Schemas

### Emergency Event
```json
{
  "event_id": "EMG-1234567890-5678",
  "type": "weather_alert",
  "severity": "high",
  "message": "Severe thunderstorm warning in effect",
  "area": "Downtown",
  "affected_groups": ["general public"],
  "timestamp": "2025-12-25T10:30:00",
  "expires_at": "2025-12-25T16:30:00",
  "coordinates": {"lat": 40.7128, "lon": -74.0060},
  "instructions": ["Stay indoors", "Monitor news"]
}
```

### Transit Event
```json
{
  "event_id": "TRN-1234567890-5678",
  "type": "delay",
  "mode": "subway",
  "line": "Blue Line",
  "severity": "moderate",
  "reason": "Signal maintenance",
  "delay_minutes": 15,
  "affected_stations": ["Central Station", "Oak Street"],
  "timestamp": "2025-12-25T10:30:00",
  "estimated_resolution": "2025-12-25T11:00:00"
}
```

### Infrastructure Event
```json
{
  "event_id": "INF-1234567890-5678",
  "type": "power_outage",
  "severity": "high",
  "area": "Eastside",
  "cause": "Equipment failure",
  "affected_customers": 5000,
  "utility_company": "City Power & Light",
  "timestamp": "2025-12-25T10:30:00",
  "estimated_restoration": "2025-12-25T14:30:00",
  "status": "in_progress"
}
```

## 🎬 Demo Usage

### For Hackathon Demo

1. **Start producers** before demo:
   ```bash
   ./demo_launcher.sh
   ```

2. **Show live Kafka topics** in Confluent Cloud console

3. **Trigger chatbot query** while events are streaming:
   ```
   User: "Are there any emergencies right now?"
   Bot: [Responds with real-time data from streaming events]
   ```

4. **Show Flink SQL** processing events in real-time

5. **Demonstrate burst mode**:
   - Emergency producer has 15% chance of generating multiple events
   - Shows system handling sudden load

### Demo Scenarios

#### Scenario 1: Real-Time Emergency Response
```bash
# Start emergency producer with short interval
python3 emergency_producer.py --interval 3

# Ask chatbot: "What emergencies are happening?"
# Show how AI responds to streaming data
```

#### Scenario 2: Transit Disruption Cascade
```bash
# Multiple transit issues
python3 transit_producer.py --interval 5

# Ask: "How do I get to work?"
# Show AI adapting to changing transit conditions
```

#### Scenario 3: Infrastructure Crisis
```bash
# Infrastructure failures
python3 infrastructure_producer.py --interval 8

# Ask: "Is the power out in my area?"
# Demonstrate real-time impact assessment
```

## 🎯 Key Features for Judges

### 1. **True Real-Time Streaming**
- Events flow continuously into Kafka
- Not batch, not polling - pure event-driven architecture
- Demonstrates **data in motion**

### 2. **Realistic Event Patterns**
- Variable severity levels
- Geographic distribution
- Time-based patterns (burst mode simulates real crises)

### 3. **Confluent Cloud Integration**
- Uses Confluent Kafka (not self-hosted)
- SASL_SSL authentication
- Topic-based routing

### 4. **Demo-Ready**
- Easy to start/stop
- Configurable intervals
- Visual feedback (console output with emojis)
- Demo launcher for one-command startup

## 🔧 Troubleshooting

### Producer won't start
```bash
# Check Kafka credentials
python3 -c "from dotenv import load_dotenv; load_dotenv(); import os; print(os.getenv('KAFKA_BOOTSTRAP_SERVERS'))"

# Test connectivity
telnet your-server.confluent.cloud 9092

# Test Redis connection (from project root)
python3 verify_redis.py
```

### Events not appearing in Kafka
- Verify topics exist in Confluent Cloud
- Check API key permissions
- Review producer logs for errors

### Too many/too few events
```bash
# Adjust interval
python3 emergency_producer.py --interval 20  # Slower

python3 emergency_producer.py --interval 2   # Faster
```

## 📈 Performance

### Typical Throughput
- **Emergency**: ~12 events/minute (5s interval)
- **Transit**: ~6 events/minute (10s interval)
- **Infrastructure**: ~4 events/minute (15s interval)
- **Total**: ~22 events/minute

### Demo Mode
- **Emergency (demo)**: ~20 events/minute + bursts
- Generates realistic load for 2 minutes
- Perfect for quick demonstrations

## 🏆 Hackathon Scoring

These producers directly demonstrate:

✅ **Real-Time Data** - Continuous event streams  
✅ **Confluent Integration** - Native Kafka producers  
✅ **Realistic Use Case** - Actual civic event patterns  
✅ **Scalability** - Can increase throughput easily  
✅ **Demo-Friendly** - Visual, easy to control  

## 💡 Tips

1. **Start producers 1-2 minutes before demo** to populate Kafka
2. **Use demo_launcher.sh** for consistent multi-producer startup
3. **Monitor Confluent Cloud** console to show live data flow
4. **Time chatbot queries** to coincide with event generation
5. **Show burst mode** to demonstrate handling event spikes

---

**Ready to demonstrate AI on Data in Motion!** 🚀

