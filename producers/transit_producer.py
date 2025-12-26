#!/usr/bin/env python3
"""
Transit Events Producer for CivicSense
Generates real-time synthetic transit disruption events.
"""
import json
import random
import time
from datetime import datetime, timedelta
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
    'client.id': 'civicsense-transit-producer'
}

producer = Producer(conf)

TRANSIT_LINES = {
    "subway": ["Red Line", "Blue Line", "Green Line", "Orange Line", "Yellow Line"],
    "bus": ["Route 42", "Route 18", "Route 95", "Express 1", "Express 5"],
    "train": ["North Rail", "South Rail", "East Rail", "West Rail"]
}

DISRUPTION_TYPES = [
    {
        "type": "delay",
        "severity": ["moderate", "low"],
        "reasons": [
            "Signal maintenance",
            "Track work",
            "Equipment malfunction",
            "Weather conditions",
            "Heavy passenger volume"
        ],
        "delay_minutes": [10, 15, 20, 25, 30]
    },
    {
        "type": "service_change",
        "severity": ["high", "moderate"],
        "reasons": [
            "Emergency track maintenance",
            "Police investigation",
            "Medical emergency",
            "Infrastructure inspection"
        ],
        "alternatives": [
            "Use shuttle bus service",
            "Take alternate line",
            "Use parallel route",
            "Transfer at next station"
        ]
    },
    {
        "type": "suspension",
        "severity": ["critical", "high"],
        "reasons": [
            "Power outage",
            "Accident investigation",
            "Severe weather",
            "Infrastructure failure"
        ]
    }
]

STATIONS = [
    "Central Station", "Union Square", "Oak Street", "Park Plaza",
    "River Station", "Hill Top", "Market Street", "City Hall",
    "North Terminal", "South Terminal", "Airport Junction"
]


def generate_transit_event():
    """Generate a random transit event."""
    mode = random.choice(list(TRANSIT_LINES.keys()))
    line = random.choice(TRANSIT_LINES[mode])
    disruption = random.choice(DISRUPTION_TYPES)
    
    event = {
        "event_id": f"TRN-{int(time.time())}-{random.randint(1000, 9999)}",
        "type": disruption["type"],
        "mode": mode,
        "line": line,
        "severity": random.choice(disruption["severity"]),
        "reason": random.choice(disruption["reasons"]),
        "affected_stations": random.sample(STATIONS, random.randint(2, 5)),
        "timestamp": datetime.now().isoformat(),
        "estimated_resolution": (datetime.now() + timedelta(minutes=random.randint(30, 180))).isoformat(),
        "affected_groups": ["commuters", "workers", "students"],
        "source": "CivicSense Transit Monitor"
    }
    
    # Add type-specific fields
    if disruption["type"] == "delay":
        event["delay_minutes"] = random.choice(disruption["delay_minutes"])
    elif disruption["type"] == "service_change":
        event["alternative"] = random.choice(disruption["alternatives"])
    
    return event


def delivery_callback(err, msg):
    """Callback for message delivery confirmation."""
    if err:
        print(f'❌ Message delivery failed: {err}')
    else:
        event = json.loads(msg.value().decode('utf-8'))
        print(f'✓ Transit event: {event["line"]} | {event["type"]} | {event["severity"]}')


def produce_events(interval_seconds=10, max_events=None):
    """Produce transit events continuously."""
    print("🚇 Starting CivicSense Transit Event Producer")
    print(f"📡 Target topic: transit_events")
    print(f"⏱️  Interval: {interval_seconds} seconds")
    print("-" * 60)
    
    count = 0
    
    try:
        while True:
            if max_events and count >= max_events:
                break
            
            event = generate_transit_event()
            
            producer.produce(
                'transit_events',
                key=event['event_id'].encode('utf-8'),
                value=json.dumps(event).encode('utf-8'),
                callback=delivery_callback
            )
            
            producer.poll(0)
            count += 1
            time.sleep(interval_seconds)
    
    except KeyboardInterrupt:
        print("\n\n⏹️  Stopping producer...")
    
    finally:
        print(f"\n📊 Total events produced: {count}")
        producer.flush()
        print("✅ Producer stopped cleanly")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='CivicSense Transit Event Producer')
    parser.add_argument('--interval', type=int, default=10, help='Seconds between events')
    parser.add_argument('--max', type=int, default=None, help='Maximum events')
    
    args = parser.parse_args()
    produce_events(interval_seconds=args.interval, max_events=args.max)

