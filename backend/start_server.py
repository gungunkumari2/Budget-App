#!/usr/bin/env python3
"""
Auto-port Django development server starter
Automatically finds an available port and starts the Django development server
"""

import socket
import subprocess
import sys
import os

def is_port_in_use(port):
    """Check if a port is in use"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('localhost', port))
            return False
        except OSError:
            return True

def find_available_port(start_port=8000, max_attempts=10):
    """Find the first available port starting from start_port"""
    for port in range(start_port, start_port + max_attempts):
        if not is_port_in_use(port):
            return port
    return None

def main():
    # Find available port
    available_port = find_available_port()
    
    if available_port is None:
        print("❌ No available ports found in range 8000-8009")
        sys.exit(1)
    
    if available_port != 8000:
        print(f"⚠️  Port 8000 is in use. Using port {available_port} instead.")
    else:
        print(f"✅ Starting server on port {available_port}")
    
    # Start Django development server
    try:
        subprocess.run([
            sys.executable, 'manage.py', 'runserver', f'127.0.0.1:{available_port}'
        ], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main() 