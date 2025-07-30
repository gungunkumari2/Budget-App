#!/usr/bin/env python3
"""
Test script for authentication
Run this to test the login endpoint and create a test user
"""

import os
import sys
import django
import requests
import json

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budjet_backend.settings')
django.setup()

from django.contrib.auth.models import User

def create_test_user():
    """Create a test user for authentication testing"""
    
    # Test user credentials
    username = 'bhumi'
    email = 'jaiswalbhumi89@gmail.com'
    password = 'testpass123'
    first_name = 'Bhumi'
    last_name = 'Jaiswal'
    
    # Check if user already exists
    if User.objects.filter(username=username).exists():
        user = User.objects.get(username=username)
        print(f"✅ User '{username}' already exists")
        return user
    
    if User.objects.filter(email=email).exists():
        user = User.objects.get(email=email)
        print(f"✅ Email '{email}' already exists for user: {user.username}")
        return user
    
    # Create new user
    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        print(f"✅ Created user: {username}")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        return user
    except Exception as e:
        print(f"❌ Failed to create user: {e}")
        return None

def test_login_endpoint():
    """Test the login endpoint"""
    
    # Test credentials
    login_data = {
        'email': 'jaiswalbhumi89@gmail.com',
        'password': 'testpass123'
    }
    
    # Test the login endpoint
    try:
        response = requests.post(
            'http://localhost:8000/api/upload-receipt/login/',
            json=login_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"\n🔍 Testing login endpoint...")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login successful!")
            print(f"   Access Token: {data.get('access', 'N/A')[:20]}...")
            print(f"   Refresh Token: {data.get('refresh', 'N/A')[:20]}...")
            print(f"   User: {data.get('user', {}).get('username', 'N/A')}")
        else:
            print(f"❌ Login failed with status {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure Django server is running on port 8000")
    except Exception as e:
        print(f"❌ Error testing login: {e}")

def main():
    print("🚀 SmartBudget Authentication Test")
    print("=" * 40)
    
    # Create test user
    print("\n1. Creating test user...")
    user = create_test_user()
    
    if user:
        print(f"✅ User ready: {user.username} ({user.email})")
        
        # Test login endpoint
        print("\n2. Testing login endpoint...")
        test_login_endpoint()
        
        print(f"\n📋 Test Credentials:")
        print(f"   Email: {user.email}")
        print(f"   Password: testpass123")
        print(f"   Username: {user.username}")
        
    else:
        print("❌ Failed to create test user")

if __name__ == '__main__':
    main() 