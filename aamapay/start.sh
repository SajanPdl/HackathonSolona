#!/bin/bash

echo "🔄 Starting AamaPay..."

# Kill any existing processes on these ports
fuser -k 3000/tcp 2>/dev/null
fuser -k 3001/tcp 2>/dev/null
sleep 1

# Get current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Start backend
echo "📡 Starting backend (port 3001)..."
cd "$SCRIPT_DIR/backend" && npx tsx src/index.ts &
sleep 2

# Start frontend
echo "🌐 Starting frontend (port 3000)..."
cd "$SCRIPT_DIR/frontend" && node node_modules/next/dist/bin/next start -p 3000 &
sleep 2

echo ""
echo "✅ AamaPay is running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop"

# Wait
wait