#!/bin/bash

# SmartBudget Django Server Starter
# Automatically finds an available port and starts the Django development server

echo "🚀 Starting SmartBudget Django Server..."

# Check if we're in the right directory
if [ ! -f "manage.py" ]; then
    echo "❌ Error: manage.py not found. Please run this script from the backend directory."
    echo "   Current directory: $(pwd)"
    echo "   Expected: .../Budjet_App/backend/"
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 not found. Please install Python 3."
    exit 1
fi

# Start the server with auto-port detection
echo "🔍 Finding available port..."
python3 start_server.py

# If the script exits with an error, show helpful message
if [ $? -ne 0 ]; then
    echo ""
    echo "💡 Troubleshooting tips:"
    echo "   1. Make sure you're in the backend directory"
    echo "   2. Try: cd backend && python3 start_server.py"
    echo "   3. Kill existing processes: lsof -ti:8000 | xargs kill -9"
    echo "   4. Check if another Django server is running"
fi 