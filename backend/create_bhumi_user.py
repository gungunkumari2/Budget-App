#!/usr/bin/env python3
"""
Script to create Bhumi user with correct email
Run this script from the backend directory: python3 create_bhumi_user.py
"""

import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budjet_backend.settings')
django.setup()

from django.contrib.auth.models import User

def create_bhumi_user():
    """Create Bhumi user with correct email"""
    
    # Bhumi's actual email
    username = 'bhumi'
    email = 'jaiswalbhumi89@gmail.com'
    password = 'testpass123'
    first_name = 'Bhumi'
    last_name = 'Jaiswal'
    
    # Check if user already exists
    if User.objects.filter(username=username).exists():
        print(f"User '{username}' already exists")
        user = User.objects.get(username=username)
        # Update email if different
        if user.email != email:
            user.email = email
            user.save()
            print(f"Updated email to: {email}")
        return user
    
    if User.objects.filter(email=email).exists():
        print(f"Email '{email}' already exists")
        user = User.objects.get(email=email)
        return user
    
    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        print(f"✅ Created Bhumi user successfully!")
        print(f"Username: {username}")
        print(f"Email: {email}")
        print(f"Password: {password}")
        return user
    except Exception as e:
        print(f"❌ Failed to create Bhumi user: {e}")
        return None

if __name__ == '__main__':
    create_bhumi_user() 