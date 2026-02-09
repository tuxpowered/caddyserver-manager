#!/bin/bash

# Port definitions
FRONTEND_PORT=3000
BACKEND_PORT=4000

echo " Starting Caddy Management UI Environment..."

# Function to kill process on a port
kill_port() {
    local port=$1
    local pid=$(lsof -t -i:$port)
    if [ ! -z "$pid" ]; then
        echo "  Found process $pid on port $port. Terminating..."
        kill -9 $pid
    fi
}

# 1. Clean up existing processes
kill_port $FRONTEND_PORT
kill_port $BACKEND_PORT

# 2. Start Backend
echo " Starting Backend on port $BACKEND_PORT..."
cd CaddyServer-backend
npm start & 
BACKEND_PID=$!
cd ..

# 3. Start Frontend
echo " Starting Frontend on port $FRONTEND_PORT..."
cd CaddyServer-frontend
# Force port 3000 in case of env issues
npm run dev -- --port $FRONTEND_PORT &
FRONTEND_PID=$!

# Handle shutdown
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM

echo " Environment is warming up!"
echo "   - Frontend: http://localhost:$FRONTEND_PORT"
echo "   - Backend: http://localhost:$BACKEND_PORT"
echo "Press Ctrl+C to stop both."

wait
