#!/bin/bash
set -e

echo "Tearing down CivicSense backend..."

# Kill uvicorn processes
pkill -f "uvicorn main:app" || true

echo "Backend stopped."

