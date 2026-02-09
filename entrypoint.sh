#!/bin/bash

# Kill any rogue processes on ports 3000, 4000, 2019, 80, and 443
echo "🧹 Clearing ports..."
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 4000/tcp 2>/dev/null || true
fuser -k 2019/tcp 2>/dev/null || true
fuser -k 80/tcp 2>/dev/null || true
fuser -k 443/tcp 2>/dev/null || true

# Project root directory
PROJECT_ROOT=$(pwd)

echo "Starting Caddy Manager Fullstack App..."

# Start Caddy (Background) - use sudo if port 80 is required
echo " Starting Caddy Server..."
# Checking if Caddyfile contains port 80 or just hostname (which defaults to 80/443)
echo " Starting Caddy Server (Service Mode)..."
caddy run --config "$PROJECT_ROOT/Caddyfile" --adapter caddyfile > caddy_server.log 2>&1 &
CADDY_PID=$!
# wait a moment for Caddy Admin API to be ready
sleep 5

# Start Backend
echo " Starting Backend Middleware..."
cd "$PROJECT_ROOT/CaddyServer-backend"
npm start &
BACKEND_PID=$!

# Start Frontend
echo " Starting Frontend..."
cd "$PROJECT_ROOT/CaddyServer-frontend"
npm run dev &
FRONTEND_PID=$!

# Handle shutdown
trap "echo 'Terminating...'; kill $BACKEND_PID $FRONTEND_PID $CADDY_PID 2>/dev/null; exit" SIGINT SIGTERM EXIT

# Wait for process
wait
