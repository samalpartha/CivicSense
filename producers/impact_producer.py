#!/usr/bin/env python3
"""
Impact Signals Producer for CivicSense
Generates synthetic high-level impact assessments (simulating AI analysis).
"""
import json
import random
import time
from datetime import datetime
from confluent_kafka import Producer
import os
from dotenv import load_dotenv

load_dotenv()

conf = {
    'bootstrap.servers': os.getenv('KAFKA_BOOTSTRAP_SERVERS'),
    'security.protocol': 'SASL_SSL',
    'sasl.mechanisms': 'PLAIN',
    'sasl.username': os.getenv('KAFKA_API_KEY'),
    'sasl.password': os.getenv('KAFKA_API_SECRET'),
    'client.id': 'civicsense-impact-producer'
}

producer = Producer(conf)

IMPACTS = [
    {
        "type": "crowd_risk",
        "description": "High crowd density detected near Downtown.",
        "suggested_action": "Deploy crowd control units",
        "severity": "high"
    },
    {
        "type": "traffic_gridlock",
        "description": "Gridlock impacting emergency routes on I-84.",
        "suggested_action": "Reroute traffic via Route 5",
        "severity": "moderate"
    },
    {
        "type": "weather_impact",
        "description": "Flash flood warning for lower districts.",
        "suggested_action": "Initiate evacuation protocol B",
        "severity": "critical"
    }
]

def delivery_callback(err, msg):
    if err:
        print(f'❌ Impact delivery failed: {err}')
    else:
        print(f'⚠️  Impact Signal Sent: {json.loads(msg.value().decode("utf-8"))["type"]}')

def produce_events(interval_seconds=30):
    print("📡 Starting CivicSense Impact Signal Producer (Simulation)")
    print(f"⏱️  Interval: {interval_seconds} seconds")
    
    try:
        while True:
            impact = random.choice(IMPACTS)
            event = {
                "impact_id": f"IMP-{int(time.time())}",
                "timestamp": datetime.now().isoformat(),
                **impact
            }
            
            producer.produce(
                'civic_impact_signals',
                value=json.dumps(event).encode('utf-8'),
                callback=delivery_callback
            )
            producer.poll(0)
            time.sleep(interval_seconds)
            
    except KeyboardInterrupt:
        pass
    finally:
        producer.flush()

if __name__ == "__main__":
    produce_events()
