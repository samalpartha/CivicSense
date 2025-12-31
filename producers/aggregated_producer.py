#!/usr/bin/env python3
"""
Aggregated Events Producer for CivicSense
Simulates the output of the Flink SQL job (tumbling window stats).
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
    'client.id': 'civicsense-aggregated-producer'
}

producer = Producer(conf)

def delivery_callback(err, msg):
    if err:
        print(f'❌ Aggregation delivery failed: {err}')
    else:
        print(f'📊 Aggregation Window Emitted')

def produce_events(interval_seconds=60):
    print("📈 Starting CivicSense Aggregate Stats Producer (Simulation)")
    print(f"⏱️  Interval: {interval_seconds} seconds")
    
    try:
        while True:
            # Generate a row that matches:
            # area, severity, event_count, event_types, window_start, window_end
            
            row = {
                "area": random.choice(["Downtown", "North End", "South End", "Westside"]),
                "severity": random.choice(["critical", "high", "moderate", "low"]),
                "event_count": random.randint(1, 50),
                "event_types": random.sample(["fire", "medical", "traffic", "power"], k=random.randint(1, 3)),
                "window_start": datetime.now().isoformat(),
                "window_end": datetime.now().isoformat()
            }
            
            # Note: 'value.format' = 'json-registry' usually implies Confluent Schema Registry.
            # If the broker rejects this due to missing schema ID in header (magic byte),
            # the user might still need to disable the contract.
            # But let's try sending the CORRECT JSON structure first.
            
            producer.produce(
                'civic_events_aggregated',
                value=json.dumps(row).encode('utf-8'),
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
