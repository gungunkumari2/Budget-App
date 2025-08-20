#!/usr/bin/env python3
"""
Check Bhumi's data in the database
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
from receipts.models import Transaction, Category

def check_bhumi_data():
    """Check Bhumi's data in the database"""
    
    print("=== Checking Bhumi's Data ===")
    
    # Get Bhumi user
    try:
        user = User.objects.get(email='jaiswalbhumi89@gmail.com')
        print(f"User: {user.username} (ID: {user.id})")
        print(f"Email: {user.email}")
        print(f"Staff: {user.is_staff}")
        print(f"Active: {user.is_active}")
    except User.DoesNotExist:
        print("❌ Bhumi user not found!")
        return
    
    # Check transactions
    transactions = Transaction.objects.filter(user=user)
    print(f"\nTransactions: {transactions.count()}")
    
    if transactions.exists():
        print("Sample transactions:")
        for i, t in enumerate(transactions[:5], 1):
            print(f"  {i}. {t.description}: ${t.amount} ({t.category}) - {t.date}")
    else:
        print("❌ No transactions found for Bhumi")
    
    # Check categories
    categories = Category.objects.all()
    print(f"\nCategories: {categories.count()}")
    
    if categories.exists():
        print("Available categories:")
        for cat in categories:
            print(f"  - {cat.name}")
    
    # Check if backend server is running
    print(f"\n=== Backend Status ===")
    try:
        import requests
        response = requests.get('http://localhost:8000/api/upload-receipt/transactions/', timeout=5)
        print(f"Backend API Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"API Response: {len(data)} items")
        else:
            print(f"API Error: {response.text}")
    except Exception as e:
        print(f"❌ Backend not accessible: {e}")

if __name__ == '__main__':
    check_bhumi_data() 