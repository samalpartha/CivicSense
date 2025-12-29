#!/bin/bash
# Demo Launcher - Start all event producers for CivicSense demo

echo "🎬 CivicSense Live Demo Event Simulator"
echo "========================================="
echo ""

# Try to activate backend venv if it exists
if [ -f "../services/backend/venv/bin/activate" ]; then
    echo "🐍 Activating existing backend virtual environment..."
    source "../services/backend/venv/bin/activate"
elif [ -f "venv/bin/activate" ]; then
    source "venv/bin/activate"
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create .env with Kafka credentials"
    exit 1
fi

echo "Starting event producers..."
echo ""

# Start emergency producer in background
echo "🚨 Starting Emergency Events Producer..."
python3 emergency_producer.py --interval 8 &
PID_EMERGENCY=$!

sleep 2

# Start transit producer in background
echo "🚇 Starting Transit Events Producer..."
python3 transit_producer.py --interval 12 &
PID_TRANSIT=$!

sleep 2

# Start infrastructure producer in background
echo "⚡ Starting Infrastructure Events Producer..."
python3 infrastructure_producer.py --interval 15 &
PID_INFRASTRUCTURE=$!

sleep 2

echo ""
echo "✅ All producers running!"
echo "========================================="
echo "PIDs:"
echo "  Emergency: $PID_EMERGENCY"
echo "  Transit: $PID_TRANSIT"
echo "  Infrastructure: $PID_INFRASTRUCTURE"
echo ""
echo "Press Ctrl+C to stop all producers"
echo "========================================="
echo ""

# Wait for user interrupt
trap "echo ''; echo 'Stopping all producers...'; kill $PID_EMERGENCY $PID_TRANSIT $PID_INFRASTRUCTURE 2>/dev/null; echo '✅ All producers stopped'; exit 0" INT

# Keep script running
wait

