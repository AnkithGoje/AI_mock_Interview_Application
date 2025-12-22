#!/bin/bash
set -e

if [ "$MODE" = "server" ]; then
    echo "Starting Token Server..."
    # Run Gunicorn for production server
    # Bind to 0.0.0.0:$PORT (default 5000)
    exec gunicorn --bind 0.0.0.0:${PORT:-5000} server:app
elif [ "$MODE" = "agent" ]; then
    echo "Starting LiveKit Agent..."
    exec python agent.py start
else
    echo "Unknown MODE: $MODE"
    echo "Available modes: server, agent"
    exit 1
fi
