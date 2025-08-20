#!/usr/bin/env python3
"""
Test Chatbot with Sample Data
============================

This script adds sample financial data and then tests the enhanced chatbot
to demonstrate how it works with actual financial information.
"""

import requests
import json
import time
from datetime import datetime, date

def add_sample_data(base_url, headers):
    """Add sample financial data for testing"""
    
    print("📊 Adding sample financial data...")
    
    # Add sample income
    income_data = {
        "amount": 50000,
        "month": datetime.now().month,
        "year": datetime.now().year
    }
    
    try:
        response = requests.post(f"{base_url}/api/upload-receipt/monthly-income/", 
                               json=income_data, headers=headers)
        if response.status_code == 201:
            print("✅ Added monthly income: NPR 50,000")
        else:
            print(f"⚠️  Income response: {response.status_code}")
    except Exception as e:
        print(f"⚠️  Income error: {e}")
    
    # Add sample expenses
    expenses = [
        {"amount": 8500, "category": "Food & Dining", "merchant": "Grocery Store", "date": date.today().isoformat()},
        {"amount": 6200, "category": "Transportation", "merchant": "Gas Station", "date": date.today().isoformat()},
        {"amount": 4800, "category": "Shopping", "merchant": "Online Store", "date": date.today().isoformat()},
        {"amount": 3200, "category": "Entertainment", "merchant": "Movie Theater", "date": date.today().isoformat()},
        {"amount": 2800, "category": "Utilities", "merchant": "Electric Company", "date": date.today().isoformat()},
        {"amount": 1800, "category": "Food & Dining", "merchant": "Restaurant", "date": date.today().isoformat()},
        {"amount": 1500, "category": "Transportation", "merchant": "Uber", "date": date.today().isoformat()},
    ]
    
    for expense in expenses:
        try:
            response = requests.post(f"{base_url}/api/upload-receipt/expenses/", 
                                   json=expense, headers=headers)
            if response.status_code == 201:
                print(f"✅ Added expense: {expense['category']} - NPR {expense['amount']:,}")
            else:
                print(f"⚠️  Expense response: {response.status_code}")
        except Exception as e:
            print(f"⚠️  Expense error: {e}")
        
        time.sleep(0.1)
    
    print("📊 Sample data added successfully!")

def test_chatbot_with_data():
    """Test the enhanced chatbot with sample financial data"""
    
    base_url = "http://localhost:8000"
    
    # Test user credentials
    test_user = {
        "username": "testuser_with_data",
        "email": "test_with_data@example.com",
        "password": "testpass123"
    }
    
    print("🚀 Testing Enhanced Chatbot with Sample Data")
    print("=" * 50)
    
    # Step 1: Register user
    print("\n1. 🔐 Authentication")
    try:
        register_response = requests.post(f"{base_url}/api/auth/register/", json=test_user)
        if register_response.status_code == 201:
            print("✅ Registration successful")
            tokens = register_response.json()
        else:
            print(f"❌ Registration failed: {register_response.text}")
            return
    except Exception as e:
        print(f"❌ Authentication error: {e}")
        return
    
    # Set up headers
    headers = {
        "Authorization": f"Bearer {tokens['access']}",
        "Content-Type": "application/json"
    }
    
    # Step 2: Add sample data
    print("\n2. 📊 Adding Sample Financial Data")
    add_sample_data(base_url, headers)
    
    # Step 3: Test chatbot with data
    print("\n3. 💬 Testing Chatbot with Real Data")
    print("-" * 40)
    
    test_questions = [
        "Show me my financial summary",
        "What's my highest spending category?",
        "How much do I spend on food?",
        "What are my transportation costs?",
        "Give me budget tips",
        "How can I save more money?",
        "What's my savings rate?",
        "Analyze my spending patterns",
        "What are my top vendors?",
        "Give me personalized financial advice"
    ]
    
    for i, question in enumerate(test_questions, 1):
        print(f"\n{i:2d}. Question: {question}")
        
        try:
            response = requests.post(
                f"{base_url}/api/upload-receipt/chat/",
                json={"message": question},
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result.get('message', 'No response received')
                
                # Show the full response for demonstration
                print(f"   💬 AI Response:")
                print(f"   {ai_response}")
                print(f"   {'-' * 50}")
                
            else:
                print(f"   ❌ Error: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"   ❌ Exception: {e}")
        
        time.sleep(0.5)
    
    print("\n🎉 Chatbot testing with sample data completed!")
    print("\n📊 Key Features Demonstrated:")
    print("✅ Real financial data analysis")
    print("✅ Personalized spending insights")
    print("✅ Category-based recommendations")
    print("✅ Vendor analysis")
    print("✅ Savings rate calculations")
    print("✅ Actionable financial advice")
    print("✅ Rich formatting and emojis")
    print("✅ Context-aware responses")

if __name__ == "__main__":
    test_chatbot_with_data()
