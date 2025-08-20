#!/usr/bin/env python3
"""
Test Least Expense Question
==========================

Test if the chatbot properly handles "where have i expense least" questions.
"""

import os
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budjet_backend.settings')
django.setup()

from django.contrib.auth.models import User
from receipts.models import Expense, Transaction, Category

def test_least_expense_question():
    """Test the chatbot with least expense questions"""
    
    print("🧪 Testing Least Expense Question")
    print("=" * 40)
    
    # Get Bhumi user
    try:
        bhumi = User.objects.get(username='Bhumi')
        print(f"Testing with user: {bhumi.username}")
    except User.DoesNotExist:
        print("❌ Bhumi user not found!")
        return
    
    # Test questions
    test_questions = [
        "where have i expense least",
        "what's my lowest spending category",
        "where do I spend the least",
        "what's my smallest expense",
        "which category do I spend least on"
    ]
    
    # API endpoint
    api_url = "http://localhost:8000/api/upload-receipt/chat/"
    
    # Get auth token (you'll need to login first)
    print("\n🔐 Getting authentication token...")
    
    # Try to get token from existing session or login
    login_url = "http://localhost:8000/api/auth/login/"
    login_data = {
        "username": "Bhumi",
        "password": "testpass123"  # Use the actual password
    }
    
    try:
        login_response = requests.post(login_url, json=login_data)
        if login_response.status_code == 200:
            token_data = login_response.json()
            access_token = token_data.get('access')
            print("✅ Login successful")
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            return
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return
    
    # Headers for API calls
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    print("\n📝 Testing Chatbot Responses:")
    print("-" * 40)
    
    for i, question in enumerate(test_questions, 1):
        print(f"\n{i}. Question: '{question}'")
        print("-" * 30)
        
        try:
            chat_data = {
                "message": question
            }
            
            response = requests.post(api_url, json=chat_data, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                chatbot_response = result.get('message', 'No response')
                print(f"✅ Response: {chatbot_response[:200]}...")
                
                # Check if response mentions "lowest" or "least"
                if any(word in chatbot_response.lower() for word in ['lowest', 'least', 'smallest', 'minimum']):
                    print("✅ GOOD: Response addresses the least expense question")
                else:
                    print("⚠️  WARNING: Response doesn't seem to address least expense")
                    
            else:
                print(f"❌ Error: {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"❌ Request error: {str(e)}")
    
    print("\n🎯 Summary:")
    print("-" * 30)
    print("The chatbot should now properly handle 'least expense' questions")
    print("and provide specific analysis of your lowest spending categories.")

if __name__ == "__main__":
    test_least_expense_question()
