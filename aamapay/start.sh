#!/bin/bash

# Kill existing
pkill -f "next" 2>/dev/null
pkill -f "tsx" 2>/dev/null  
sleep 1

# Build
rm -rf frontend/.next
cd frontend && npm run build

# Start servers
cd ../backend && npx tsx src/index.ts &
cd ../frontend && npx next dev -p 3000 &

sleep 4

echo ""
echo "✅ AamaPay running at http://localhost:3000"