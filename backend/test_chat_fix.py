#!/usr/bin/env python3
"""
Test Chat Fix
============

Simple test to verify the chat endpoint works with proper authentication.
"""

import requests
import json

def test_chat_with_auth():
    """Test the chat endpoint with proper authentication"""
    
    base_url = "http://localhost:8000"
    
    # Test user credentials
    test_user = {
        "username": "testuser_fix_final",
        "email": "test_fix_final@example.com",
        "password": "testpass123"
    }
    
    print("🧪 Testing Chat Fix")
    print("=" * 30)
    
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
    
    # Set up headers with authentication
    headers = {
        "Authorization": f"Bearer {tokens['access']}",
        "Content-Type": "application/json"
    }
    
    # Step 2: Test chat endpoint
    print("\n2. 💬 Testing Chat Endpoint")
    print("-" * 30)
    
    test_message = "Hello! How are you?"
    print(f"📤 Sending message: {test_message}")
    
    try:
        response = requests.post(
            f"{base_url}/api/upload-receipt/chat/",
            json={"message": test_message},
            headers=headers
        )
        
        if response.status_code == 200:
            result = response.json()
            ai_response = result.get('message', 'No response received')
            
            print(f"✅ Chat response received!")
            print(f"📝 Response length: {len(ai_response)} characters")
            print(f"💬 Preview: {ai_response[:100]}...")
            
            # Check if response has expected features
            has_emoji = any(ord(char) > 127 for char in ai_response)
            has_formatting = '**' in ai_response or '📊' in ai_response or '💡' in ai_response
            is_personalized = any(word in ai_response.lower() for word in ['your', 'you', 'npr', 'spending', 'income'])
            
            print(f"\n📊 Response Analysis:")
            print(f"   Emojis: {has_emoji}")
            print(f"   Formatting: {has_formatting}")
            print(f"   Personalized: {is_personalized}")
            
            if has_emoji and has_formatting and is_personalized:
                print("\n🎉 Chat endpoint is working perfectly!")
            else:
                print("\n⚠️  Chat endpoint working but missing some features")
                
        else:
            print(f"❌ Chat failed: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Chat error: {e}")
    
    print("\n✅ Chat fix test completed!")

if __name__ == "__main__":
    test_chat_with_auth()
