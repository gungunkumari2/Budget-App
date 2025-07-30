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
from django.contrib.auth import authenticate

def debug_login():
    """Debug the login process"""
    
    email = "jaiswalbhumi89@gmail.com"
    password = "testpass123"
    
    print("=== Debugging Login Process ===")
    
    # Check if user exists
    try:
        user = User.objects.get(email=email)
        print(f"✅ User found: {user.username} (ID: {user.id})")
        print(f"   Email: {user.email}")
        print(f"   Is active: {user.is_active}")
        print(f"   Is staff: {user.is_staff}")
        print(f"   Is superuser: {user.is_superuser}")
        
        # Test authentication
        authenticated_user = authenticate(username=user.username, password=password)
        if authenticated_user:
            print(f"✅ Authentication successful for: {authenticated_user.username}")
        else:
            print(f"❌ Authentication failed for: {user.username}")
            print("   This means the password is incorrect")
            
    except User.DoesNotExist:
        print(f"❌ User with email {email} not found!")
        return False
    
    return True

if __name__ == "__main__":
    success = debug_login()
    if success:
        print("\n🎉 Login debugging completed!")
    else:
        print("\n❌ Login debugging failed!") 