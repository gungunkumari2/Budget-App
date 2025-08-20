#!/bin/bash

echo "🚀 Starting SmartBudget Backend Server"
echo "======================================"

# Navigate to backend directory
cd backend

echo "📁 Current directory: $(pwd)"

# Check if manage.py exists
if [ ! -f "manage.py" ]; then
    echo "❌ Error: manage.py not found in current directory"
    echo "Please make sure you're in the backend directory"
    exit 1
fi

echo "✅ Found manage.py"

# Create Bhumi user
echo ""
echo "👤 Creating Bhumi user..."
python3 manage.py create_bhumi_user

echo ""
echo "🔄 Starting Django development server..."
echo "Server will be available at: http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""

# Start the Django server
python3 manage.py runserver 