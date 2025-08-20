#!/usr/bin/env python3
"""
Test Greeting Fix
================

Test script to verify that the AI chatbot responds appropriately to greetings
without giving unwanted financial information.
"""

import requests
import json
import time

def test_greeting_responses():
    """Test that the chatbot responds appropriately to greetings"""
    
    base_url = "http://localhost:8000"
    
    # Test user credentials
    test_user = {
        'email': 'bhumi@example.com',
        'password': 'testpass123'
    }
    
    print("🧪 Testing Greeting Responses")
    print("=" * 50)
    
    # Step 1: Login to get authentication token
    print("\n1. 🔐 Logging in...")
    try:
        login_response = requests.post(
            f"{base_url}/api/auth/login/",
            json=test_user
        )
        
        if login_response.status_code == 200:
            token = login_response.json().get('access')
            headers = {'Authorization': f'Bearer {token}'}
            print("✅ Login successful")
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            return
            
    except Exception as e:
        print(f"❌ Login error: {e}")
        return
    
    # Step 2: Test greeting responses
    print("\n2. 💬 Testing Greeting Responses")
    
    greeting_tests = [
        {
            'message': 'hello',
            'expected': 'should give simple greeting, not financial info',
            'should_contain_financial_data': False
        },
        {
            'message': 'hi',
            'expected': 'should give simple greeting, not financial info',
            'should_contain_financial_data': False
        },
        {
            'message': 'hey',
            'expected': 'should give simple greeting, not financial info',
            'should_contain_financial_data': False
        },
        {
            'message': 'how are you',
            'expected': 'should give simple response, not financial info',
            'should_contain_financial_data': False
        },
        {
            'message': 'what is my budget',
            'expected': 'should give financial info',
            'should_contain_financial_data': True
        },
        {
            'message': 'how much did I spend',
            'expected': 'should give financial info',
            'should_contain_financial_data': True
        }
    ]
    
    for test in greeting_tests:
        message = test['message']
        expected = test['expected']
        should_contain_financial_data = test['should_contain_financial_data']
        
        print(f"\n📝 Testing: '{message}'")
        print(f"   Expected: {expected}")
        
        try:
            chat_data = {'message': message}
            response = requests.post(
                f"{base_url}/api/upload-receipt/chat/",
                json=chat_data,
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                chatbot_response = result.get('message', 'No response')
                
                # Check if response contains financial data
                financial_indicators = ['NPR', 'budget', 'expenses', 'income', 'savings', 'spending']
                contains_financial_data = any(indicator in chatbot_response for indicator in financial_indicators)
                
                # Check response length
                response_length = len(chatbot_response)
                is_appropriate_length = response_length < 100  # Should be short for greetings
                
                print(f"   ✅ Response: {chatbot_response}")
                print(f"   📏 Length: {response_length} chars")
                print(f"   💰 Contains financial data: {'✅' if contains_financial_data else '❌'}")
                print(f"   📏 Appropriate length: {'✅' if is_appropriate_length else '❌'}")
                
                # Evaluate if response is appropriate
                if should_contain_financial_data:
                    if contains_financial_data:
                        print(f"   🎯 Result: ✅ Correct - Financial data provided as expected")
                    else:
                        print(f"   🎯 Result: ❌ Incorrect - Should have provided financial data")
                else:
                    if not contains_financial_data and is_appropriate_length:
                        print(f"   🎯 Result: ✅ Correct - Simple greeting without financial data")
                    else:
                        print(f"   🎯 Result: ❌ Incorrect - Should be simple greeting")
                
            else:
                print(f"   ❌ Chat failed: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Chat error: {e}")
        
        time.sleep(1)  # Small delay between requests
    
    print(f"\n🎉 Greeting response testing completed!")
    print(f"\n📋 Summary:")
    print(f"- Greetings should get simple responses without financial data")
    print(f"- Financial questions should get financial data")
    print(f"- Responses should be concise and appropriate")

if __name__ == "__main__":
    test_greeting_responses()
