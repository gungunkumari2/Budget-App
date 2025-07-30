#!/usr/bin/env python3
"""
Simple script to create test users for authentication testing
Run this script from the backend directory: python3 create_test_users.py
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

def create_test_users():
    """Create test users for authentication testing"""
    
    # Test user 1
    username1 = 'testuser'
    email1 = 'test@example.com'
    password1 = 'testpass123'
    
    # Test user 2 (Bhumi)
    username2 = 'bhumi'
    email2 = 'bhumi@example.com'
    password2 = 'testpass123'
    
    # Test user 3
    username3 = 'admin'
    email3 = 'admin@example.com'
    password3 = 'admin123'
    
    users_to_create = [
        (username1, email1, password1, 'Test', 'User'),
        (username2, email2, password2, 'Bhumi', 'Jaiswal'),
        (username3, email3, password3, 'Admin', 'User'),
    ]
    
    created_users = []
    
    for username, email, password, first_name, last_name in users_to_create:
        if User.objects.filter(username=username).exists():
            print(f"User '{username}' already exists")
            continue
            
        if User.objects.filter(email=email).exists():
            print(f"Email '{email}' already exists")
            continue
        
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            created_users.append(user)
            print(f"✅ Created user: {username} ({email})")
            print(f"   Password: {password}")
        except Exception as e:
            print(f"❌ Failed to create user {username}: {e}")
    
    if created_users:
        print(f"\n🎉 Successfully created {len(created_users)} test users!")
        print("\n📋 Test Credentials:")
        print("=" * 50)
        for user in created_users:
            print(f"Username: {user.username}")
            print(f"Email: {user.email}")
            print(f"Password: testpass123")
            print("-" * 30)
    else:
        print("\nℹ️  No new users were created (they may already exist)")
    
    # Show all existing users
    print(f"\n📊 All users in database:")
    print("=" * 50)
    for user in User.objects.all():
        print(f"ID: {user.id}, Username: {user.username}, Email: {user.email}")

if __name__ == '__main__':
    create_test_users() 