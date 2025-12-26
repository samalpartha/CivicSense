#!/usr/bin/env python3
"""
Infrastructure Events Producer for CivicSense
Generates real-time synthetic infrastructure events (power, water, internet).
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
    'client.id': 'civicsense-infrastructure-producer'
}

producer = Producer(conf)

INFRASTRUCTURE_TYPES = {
    "power_outage": {
        "severity": ["critical", "high", "moderate"],
        "causes": [
            "Equipment failure",
            "Weather-related damage",
            "Scheduled maintenance",
            "Transformer issue",
            "Grid overload"
        ],
        "affected_count": [500, 1000, 2500, 5000, 10000]
    },
    "water_advisory": {
        "severity": ["high", "moderate", "low"],
        "types": [
            "Boil water notice",
            "Water main break",
            "Low pressure advisory",
            "Scheduled maintenance",
            "Quality testing in progress"
        ]
    },
    "internet_outage": {
        "severity": ["moderate", "low"],
        "providers": ["CityNet", "MetroFiber", "QuickConnect", "DataFlow"],
        "causes": [
            "Fiber cut",
            "Network maintenance",
            "Equipment upgrade",
            "Service disruption"
        ]
    },
    "road_closure": {
        "severity": ["high", "moderate"],
        "reasons": [
            "Construction work",
            "Water main repair",
            "Emergency repair",
            "Event setup",
            "Safety inspection"
        ],
        "durations": ["2 hours", "4 hours", "8 hours", "24 hours", "3 days"]
    }
}

AREAS = [
    "Downtown", "Midtown", "Eastside", "Westside",
    "North District", "South District", "Riverside",
    "Hillside", "Industrial Zone", "Business District"
]

STREETS = [
    "Main Street", "Market Street", "Oak Avenue", "Elm Street",
    "Broadway", "5th Avenue", "Park Boulevard", "River Road"
]


def generate_infrastructure_event():
    """Generate a random infrastructure event."""
    infra_type = random.choice(list(INFRASTRUCTURE_TYPES.keys()))
    config = INFRASTRUCTURE_TYPES[infra_type]
    
    event = {
        "event_id": f"INF-{int(time.time())}-{random.randint(1000, 9999)}",
        "type": infra_type,
        "severity": random.choice(config["severity"]),
        "area": random.choice(AREAS),
        "timestamp": datetime.now().isoformat(),
        "estimated_restoration": (datetime.now() + timedelta(hours=random.randint(1, 8))).isoformat(),
        "source": "CivicSense Infrastructure Monitor",
        "status": random.choice(["investigating", "in_progress", "monitoring"])
    }
    
    # Add type-specific fields
    if infra_type == "power_outage":
        event["cause"] = random.choice(config["causes"])
        event["affected_customers"] = random.choice(config["affected_count"])
        event["utility_company"] = "City Power & Light"
    elif infra_type == "water_advisory":
        event["advisory_type"] = random.choice(config["types"])
        event["water_district"] = f"District {random.randint(1, 5)}"
    elif infra_type == "internet_outage":
        event["provider"] = random.choice(config["providers"])
        event["cause"] = random.choice(config["causes"])
    elif infra_type == "road_closure":
        event["street"] = random.choice(STREETS)
        event["reason"] = random.choice(config["reasons"])
        event["duration"] = random.choice(config["durations"])
        event["detour_available"] = random.choice([True, False])
    
    return event


def delivery_callback(err, msg):
    """Callback for message delivery confirmation."""
    if err:
        print(f'❌ Message delivery failed: {err}')
    else:
        event = json.loads(msg.value().decode('utf-8'))
        print(f'✓ Infrastructure: {event["type"]} | {event["severity"]} | {event["area"]}')


def produce_events(interval_seconds=15, max_events=None):
    """Produce infrastructure events continuously."""
    print("⚡ Starting CivicSense Infrastructure Event Producer")
    print(f"📡 Target topic: infrastructure_events")
    print(f"⏱️  Interval: {interval_seconds} seconds")
    print("-" * 60)
    
    count = 0
    
    try:
        while True:
            if max_events and count >= max_events:
                break
            
            event = generate_infrastructure_event()
            
            producer.produce(
                'infrastructure_events',
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
    
    parser = argparse.ArgumentParser(description='CivicSense Infrastructure Event Producer')
    parser.add_argument('--interval', type=int, default=15, help='Seconds between events')
    parser.add_argument('--max', type=int, default=None, help='Maximum events')
    
    args = parser.parse_args()
    produce_events(interval_seconds=args.interval, max_events=args.max)

