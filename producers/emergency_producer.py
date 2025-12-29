#!/usr/bin/env python3
"""
Emergency Events Producer for CivicSense
Generates real-time synthetic emergency events for demonstration.
"""
import json
import random
import time
from datetime import datetime, timedelta
from confluent_kafka import Producer
import os
from dotenv import load_dotenv

load_dotenv()

# Kafka configuration
conf = {
    'bootstrap.servers': os.getenv('KAFKA_BOOTSTRAP_SERVERS'),
    'security.protocol': 'SASL_SSL',
    'sasl.mechanisms': 'PLAIN',
    'sasl.username': os.getenv('KAFKA_API_KEY'),
    'sasl.password': os.getenv('KAFKA_API_SECRET'),
    'client.id': 'civicsense-emergency-producer'
}

producer = Producer(conf)

# Event templates
# Seasonal Logic
current_month = datetime.now().month
is_winter = current_month in [12, 1, 2]
is_summer = current_month in [6, 7, 8]

EMERGENCY_TYPES = []

if is_winter:
    EMERGENCY_TYPES.extend([
        {
            "type": "weather_alert",
            "severity_options": ["critical", "high", "moderate"],
            "messages": [
                "Winter storm warning - heavy snow expected",
                "Black ice reported on bridges",
                "Code Blue: Extreme cold emergency",
                "Frozen pipe burst risk - take precautions"
            ]
        },
        {
            "type": "public_safety",
            "severity_options": ["high", "moderate"],
            "messages": [
                "Heating center open at Community Hall",
                "Vehicle pileup due to icy roads",
                "Power outage reported in North End (Heating Risk)"
            ]
        },
        {
            "type": "health_alert",
            "severity_options": ["moderate"],
            "messages": [
                "Flu activity high in this zone",
                "Carbon Monoxide warning - check detectors",
                "Slippery sidewalk advisory"
            ]
        }
    ])
elif is_summer:
    EMERGENCY_TYPES.extend([
        {
            "type": "weather_alert",
            "severity_options": ["critical", "high", "moderate"],
            "messages": [
                "Severe thunderstorm warning in effect",
                "Flash flood watch issued",
                "Tornado warning - seek shelter immediately",
                "Heat advisory in effect - cooling centers open"
            ]
        },
        {
            "type": "fire_incident",
            "severity_options": ["critical", "high"],
            "messages": [
                "Brush fire reported near highway",
                "Red Flag Warning: High fire danger"
            ]
        },
        {
            "type": "health_alert",
            "severity_options": ["moderate", "low"],
            "messages": [
                "Air quality alert (Ozone)",
                "Pollen count extremely high",
                "Dehydration risk advisory"
            ]
        }
    ])
else:
    # Fall/Spring generic
    EMERGENCY_TYPES.extend([
        {
            "type": "weather_alert",
            "severity_options": ["high", "moderate"],
            "messages": [
                "Heavy rain warning",
                "High wind advisory",
                "Flood watch in low-lying areas"
            ]
        },
        {
            "type": "public_safety",
            "severity_options": ["high", "moderate", "low"],
            "messages": [
                "Police activity in progress",
                "Traffic accident - major delays",
                "Construction road closure"
            ]
        }
    ])

# Always add generic emergencies regardless of season
EMERGENCY_TYPES.append({
    "type": "fire_incident",
    "severity_options": ["critical", "high"],
    "messages": [
        "Building fire reported",
        "Smoke condition investigation"
    ]
})
EMERGENCY_TYPES.append({
    "type": "public_safety",
    "severity_options": ["high", "moderate"],
    "messages": [
        "Gas leak reported",
        "Water main break",
        "Traffic signal malfunction"
    ]
})

AREAS = [
    "Downtown", "Midtown", "Uptown", "Eastside", "Westside",
    "North District", "South District", "Central Plaza",
    "Riverside", "Hillside", "Lakefront", "Industrial Zone"
]

AFFECTED_GROUPS = [
    ["general public"],
    ["commuters", "drivers"],
    ["parents", "students"],
    ["seniors", "vulnerable populations"],
    ["outdoor workers", "construction crews"],
    ["residents", "local businesses"]
]


def generate_event():
    """Generate a random emergency event."""
    event_template = random.choice(EMERGENCY_TYPES)
    
    event = {
        "event_id": f"EMG-{int(time.time())}-{random.randint(1000, 9999)}",
        "type": event_template["type"],
        "severity": random.choice(event_template["severity_options"]),
        "message": random.choice(event_template["messages"]),
        "area": random.choice(AREAS),
        "affected_groups": random.choice(AFFECTED_GROUPS),
        "timestamp": datetime.now().isoformat(),
        "expires_at": (datetime.now() + timedelta(hours=random.randint(1, 6))).isoformat(),
        "source": "CivicSense Event Simulator",
        "coordinates": {
            "lat": round(40.7128 + random.uniform(-0.1, 0.1), 6),
            "lon": round(-74.0060 + random.uniform(-0.1, 0.1), 6)
        },
        "instructions": generate_instructions(event_template["type"])
    }
    
    return event


def generate_instructions(event_type):
    """Generate safety instructions based on event type."""
    instructions = {
        "weather_alert": [
            "Stay indoors if possible",
            "Monitor local news for updates",
            "Have emergency supplies ready"
        ],
        "fire_incident": [
            "Evacuate immediately if in affected area",
            "Close all windows and doors",
            "Call 911 if you see flames or smoke"
        ],
        "public_safety": [
            "Avoid the affected area",
            "Follow law enforcement instructions",
            "Report suspicious activity to authorities"
        ],
        "health_alert": [
            "Limit outdoor exposure",
            "Vulnerable individuals stay indoors",
            "Follow health department guidelines"
        ]
    }
    
    return instructions.get(event_type, ["Stay informed", "Follow official guidance"])


def delivery_callback(err, msg):
    """Callback for message delivery confirmation."""
    if err:
        print(f'❌ Message delivery failed: {err}')
    else:
        event = json.loads(msg.value().decode('utf-8'))
        print(f'✓ Event delivered: {event["event_id"]} | {event["type"]} | {event["severity"]} | {event["area"]}')


def produce_events(interval_seconds=5, max_events=None):
    """
    Produce emergency events continuously.
    
    Args:
        interval_seconds: Time between events
        max_events: Maximum events to produce (None = infinite)
    """
    print("🚀 Starting CivicSense Emergency Event Producer")
    print(f"📡 Target topic: emergency_events")
    print(f"⏱️  Interval: {interval_seconds} seconds")
    print("-" * 60)
    
    count = 0
    
    try:
        while True:
            if max_events and count >= max_events:
                break
            
            event = generate_event()
            
            # Produce to Kafka
            producer.produce(
                'emergency_events',
                key=event['event_id'].encode('utf-8'),
                value=json.dumps(event).encode('utf-8'),
                callback=delivery_callback
            )
            
            producer.poll(0)
            count += 1
            
            # Random burst mode (simulate multiple events)
            if random.random() < 0.15:  # 15% chance of burst
                burst_count = random.randint(2, 4)
                print(f"💥 BURST MODE: Generating {burst_count} simultaneous events...")
                for _ in range(burst_count):
                    burst_event = generate_event()
                    producer.produce(
                        'emergency_events',
                        key=burst_event['event_id'].encode('utf-8'),
                        value=json.dumps(burst_event).encode('utf-8'),
                        callback=delivery_callback
                    )
                    producer.poll(0)
                count += burst_count
            
            time.sleep(interval_seconds)
    
    except KeyboardInterrupt:
        print("\n\n⏹️  Stopping producer...")
    
    finally:
        print(f"\n📊 Total events produced: {count}")
        producer.flush()
        print("✅ Producer stopped cleanly")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='CivicSense Emergency Event Producer')
    parser.add_argument('--interval', type=int, default=5, help='Seconds between events (default: 5)')
    parser.add_argument('--max', type=int, default=None, help='Maximum events to produce (default: unlimited)')
    parser.add_argument('--demo', action='store_true', help='Demo mode: rapid events for 2 minutes')
    
    args = parser.parse_args()
    
    if args.demo:
        print("🎬 DEMO MODE: Rapid event generation for 2 minutes")
        produce_events(interval_seconds=3, max_events=40)
    else:
        produce_events(interval_seconds=args.interval, max_events=args.max)

