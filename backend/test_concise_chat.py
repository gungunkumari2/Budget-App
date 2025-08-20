#!/usr/bin/env python3
"""
Test Concise Chat Responses
===========================

Test script to verify that the AI chatbot now provides more concise and focused responses.
"""

import requests
import json
import time

def test_concise_chat_responses():
    """Test that the chatbot provides concise responses"""
    
    base_url = "http://localhost:8000"
    
    # Test user credentials
    test_user = {
        'email': 'bhumi@example.com',
        'password': 'testpass123'
    }
    
    print("🧪 Testing Concise Chat Responses")
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
    
    # Step 2: Test concise responses
    print("\n2. 💬 Testing Concise Responses")
    
    test_questions = [
        "What is my highest spending category?",
        "Where have I spent the least?",
        "How much did I spend on entertainment?",
        "What is my total budget?",
        "Show me my food expenses"
    ]
    
    for question in test_questions:
        print(f"\n📝 Testing: '{question}'")
        
        try:
            chat_data = {'message': question}
            response = requests.post(
                f"{base_url}/api/upload-receipt/chat/",
                json=chat_data,
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                chatbot_response = result.get('message', 'No response')
                
                # Check if response is concise (under 200 characters)
                response_length = len(chatbot_response)
                is_concise = response_length < 200
                
                print(f"✅ Response ({response_length} chars): {chatbot_response[:100]}...")
                print(f"   Concise: {'✅' if is_concise else '❌'}")
                
                # Check for verbose indicators
                verbose_indicators = ['💡', '🎬', '📊', '🚗', '🍽️', '🛍️', '🏥', '📚', '🛡️']
                has_verbose_indicators = any(indicator in chatbot_response for indicator in verbose_indicators)
                print(f"   No verbose formatting: {'✅' if not has_verbose_indicators else '❌'}")
                
            else:
                print(f"❌ Chat failed: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Chat error: {e}")
        
        time.sleep(1)  # Small delay between requests
    
    print("\n🎉 Concise chat testing completed!")
    print("\n📊 Summary:")
    print("- Responses should be under 200 characters")
    print("- No verbose formatting or emojis")
    print("- Direct answers to questions")
    print("- No lengthy explanations unless specifically requested")

if __name__ == "__main__":
    test_concise_chat_responses()
