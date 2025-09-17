#!/bin/bash

echo "Starting Family Feud Development Environment..."
echo

echo "Starting Backend Server..."
cd backend && go run server/main.go &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 3

echo "Starting Frontend Development Server..."
cd ../frontend/family100-fe && npm run dev &
FRONTEND_PID=$!

echo
echo "Both servers are starting..."
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:5173"
echo
echo "Press Ctrl+C to stop both servers"

# Function to cleanup background processes
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for user to stop
wait
