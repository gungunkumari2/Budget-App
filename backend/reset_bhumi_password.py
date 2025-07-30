#!/usr/bin/env python3
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budjet_backend.settings')
django.setup()

from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
import requests
import json

def reset_bhumi_password():
    """Reset Bhumi user's password and test login"""
    
    email = "jaiswalbhumi89@gmail.com"
    password = "testpass123"
    
    print("=== Resetting Bhumi User Password ===")
    
    # Find the user
    try:
        user = User.objects.get(email=email)
        print(f"Found user: {user.username} (ID: {user.id})")
        print(f"Current email: {user.email}")
        print(f"Current staff status: {user.is_staff}")
        
        # Reset password
        user.password = make_password(password)
        user.save()
        print(f"✅ Password reset to: {password}")
        
    except User.DoesNotExist:
        print(f"❌ User with email {email} not found!")
        return False
    
    # Test login via API
    print("\n=== Testing Login API ===")
    
    login_url = "http://localhost:8000/api/upload-receipt/login/"
    login_data = {
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(login_url, json=login_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
            data = response.json()
            print(f"Access Token: {data.get('access', 'N/A')[:50]}...")
            print(f"User ID: {data.get('user', {}).get('id', 'N/A')}")
            return True
        else:
            print("❌ Login failed!")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure Django server is running on port 8000")
        return False
    except Exception as e:
        print(f"❌ Error testing login: {e}")
        return False

if __name__ == "__main__":
    success = reset_bhumi_password()
    if success:
        print("\n🎉 Password reset and login test successful!")
        print("You can now login with:")
        print("Email: jaiswalbhumi89@gmail.com")
        print("Password: testpass123")
    else:
        print("\n❌ Something went wrong. Check the error messages above.") 