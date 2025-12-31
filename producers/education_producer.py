#!/usr/bin/env python3
"""
Education Events Producer for CivicSense
Generates real-time synthetic education events (school closings, delays, safety).
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
    'client.id': 'civicsense-education-producer'
}

producer = Producer(conf)

EDUCATION_TYPES = {
    "school_closure": {
        "severity": ["high", "moderate"],
        "reasons": [
            "Snow storm",
            "Heating failure",
            "Water main break",
            "Staff shortage",
            "Power outage"
        ],
        "duration": ["1 day", "2 days", "Until further notice"]
    },
    "delay_opening": {
        "severity": ["moderate", "low"],
        "reasons": [
            "Icy roads",
            "Bus delays",
            "Severe weather expected"
        ],
        "delay_time": ["90 minutes", "2 hours"]
    },
    "early_dismissal": {
        "severity": ["moderate"],
        "reasons": [
            "Pending storm",
            "Facility issue",
            "Heat advisory"
        ],
        "time": ["12:00 PM", "1:00 PM"]
    },
    "campus_safety": {
        "severity": ["high", "moderate"],
        "types": [
            "Lockdown drill",
            "Suspicious activity",
            "Health advisory",
            "Fire alarm"
        ]
    }
}

SCHOOLS = [
    "Hartford High", "West Middle School", "North End Elementary", 
    "Riverside Academy", "Tech High School", "Montessori Magnet"
]

def generate_education_event():
    """Generate a random education event."""
    event_type = random.choice(list(EDUCATION_TYPES.keys()))
    config = EDUCATION_TYPES[event_type]
    school = random.choice(SCHOOLS)
    
    event = {
        "event_id": f"EDU-{int(time.time())}-{random.randint(1000, 9999)}",
        "type": event_type,
        "severity": random.choice(config["severity"]),
        "location": school,
        "timestamp": datetime.now().isoformat(),
        "source": "District Superintendent Office",
        "status": "active"
    }
    
    # Add type-specific fields
    if event_type == "school_closure":
        event["reason"] = random.choice(config["reasons"])
        event["duration"] = random.choice(config["duration"])
        event["message"] = f"{school} closed due to {event['reason']}."
    elif event_type == "delay_opening":
        event["delay"] = random.choice(config["delay_time"])
        event["reason"] = random.choice(config["reasons"])
        event["message"] = f"{school} opening delayed by {event['delay']}."
    elif event_type == "early_dismissal":
        event["dismissal_time"] = random.choice(config["time"])
        event["message"] = f"Early dismissal at {event['dismissal_time']} for {school}."
    elif event_type == "campus_safety":
        event["alert_type"] = random.choice(config["types"])
        event["message"] = f"{event['alert_type']} reported at {school}. Please follow safety protocols."
    
    return event


def delivery_callback(err, msg):
    """Callback for message delivery confirmation."""
    if err:
        print(f'❌ Message delivery failed: {err}')
    else:
        event = json.loads(msg.value().decode('utf-8'))
        print(f'🎓 Education: {event["type"]} | {event["severity"]} | {event["location"]}')


def produce_events(interval_seconds=20, max_events=None):
    """Produce education events continuously."""
    print("📚 Starting CivicSense Education Event Producer")
    print(f"📡 Target topic: education_events")
    print(f"⏱️  Interval: {interval_seconds} seconds")
    print("-" * 60)
    
    count = 0
    
    try:
        while True:
            if max_events and count >= max_events:
                break
            
            event = generate_education_event()
            
            producer.produce(
                'education_events',
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
    
    parser = argparse.ArgumentParser(description='CivicSense Education Event Producer')
    parser.add_argument('--interval', type=int, default=20, help='Seconds between events')
    parser.add_argument('--max', type=int, default=None, help='Maximum events')
    
    args = parser.parse_args()
    produce_events(interval_seconds=args.interval, max_events=args.max)
