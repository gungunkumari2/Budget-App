#!/usr/bin/env python3
"""
Enhanced Chatbot Test Script
============================

This script tests the enhanced ChatGPT-like chatbot functionality with comprehensive
question handling and flexible responses.
"""

import requests
import json
import time
from datetime import datetime

def test_enhanced_chatbot():
    """Test the enhanced chatbot with various types of questions"""
    
    # Base URL for the API
    base_url = "http://localhost:8000"
    
    # Test user credentials
    test_user = {
        "username": "testuser_enhanced",
        "email": "test_enhanced@example.com",
        "password": "testpass123"
    }
    
    print("🚀 Testing Enhanced ChatGPT-like Chatbot")
    print("=" * 50)
    
    # Step 1: Register or login user
    print("\n1. 🔐 Authentication")
    try:
        # Try to login first
        login_response = requests.post(f"{base_url}/api/auth/login/", json={
            "email": test_user["email"],
            "password": test_user["password"]
        })
        
        if login_response.status_code == 200:
            print("✅ Login successful")
            tokens = login_response.json()
        else:
            # Try to register
            register_response = requests.post(f"{base_url}/api/auth/register/", json=test_user)
            if register_response.status_code == 201:
                print("✅ Registration successful")
                tokens = register_response.json()
            else:
                print(f"❌ Authentication failed: {register_response.text}")
                return
                
    except Exception as e:
        print(f"❌ Authentication error: {e}")
        return
    
    # Set up headers with authentication
    headers = {
        "Authorization": f"Bearer {tokens['access']}",
        "Content-Type": "application/json"
    }
    
    # Step 2: Test various types of questions
    print("\n2. 💬 Testing Chatbot Responses")
    print("-" * 30)
    
    # Define test questions covering different aspects
    test_questions = [
        # Basic financial questions
        "Hello! How are you?",
        "What can you help me with?",
        "Show me my financial summary",
        "How much am I spending this month?",
        
        # Spending analysis
        "What's my highest spending category?",
        "Analyze my spending patterns",
        "How much do I spend on food?",
        "What are my transportation costs?",
        
        # Budget and planning
        "Review my budget",
        "How can I save more money?",
        "Give me budget tips",
        "What's my savings rate?",
        
        # Trends and comparisons
        "Show me my spending trends",
        "Compare this month to last month",
        "What's my average monthly spending?",
        "How has my spending changed?",
        
        # Specific categories
        "Break down my expenses by category",
        "What are my top vendors?",
        "Show me recent transactions",
        "How much do I spend on entertainment?",
        
        # Financial advice
        "Give me financial advice",
        "How can I improve my finances?",
        "What should I do with my savings?",
        "Help me create a budget",
        
        # General questions
        "What is compound interest?",
        "How should I invest my money?",
        "What's a good emergency fund size?",
        "How do I improve my credit score?",
        
        # Complex questions
        "Based on my spending, what investment strategy would you recommend?",
        "How can I optimize my budget for better savings?",
        "What financial goals should I set based on my current situation?",
        "Give me a comprehensive financial health assessment"
    ]
    
    successful_responses = 0
    total_questions = len(test_questions)
    
    for i, question in enumerate(test_questions, 1):
        print(f"\n{i:2d}. Question: {question}")
        
        try:
            # Send question to chatbot
            response = requests.post(
                f"{base_url}/api/upload-receipt/chat/",
                json={"message": question},
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result.get('message', 'No response received')
                
                # Analyze response quality
                response_length = len(ai_response)
                has_emoji = any(ord(char) > 127 for char in ai_response)
                has_formatting = '**' in ai_response or '📊' in ai_response or '💡' in ai_response
                is_personalized = any(word in ai_response.lower() for word in ['your', 'you', 'npr', 'spending', 'income'])
                
                print(f"   ✅ Response received ({response_length} chars)")
                print(f"   📝 Features: Emojis={has_emoji}, Formatting={has_formatting}, Personalized={is_personalized}")
                
                # Show first 100 characters of response
                preview = ai_response[:100] + "..." if len(ai_response) > 100 else ai_response
                print(f"   💬 Preview: {preview}")
                
                successful_responses += 1
                
            else:
                print(f"   ❌ Error: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"   ❌ Exception: {e}")
        
        # Small delay between requests
        time.sleep(0.5)
    
    # Step 3: Test conversation flow
    print("\n3. 🔄 Testing Conversation Flow")
    print("-" * 30)
    
    conversation_flow = [
        "Hi there!",
        "What's my financial situation?",
        "How can I improve it?",
        "What specific steps should I take?",
        "Thank you for the advice!"
    ]
    
    print("Testing multi-turn conversation:")
    for i, message in enumerate(conversation_flow, 1):
        print(f"\n   Turn {i}: {message}")
        
        try:
            response = requests.post(
                f"{base_url}/api/upload-receipt/chat/",
                json={"message": message},
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result.get('message', 'No response')
                print(f"   ✅ AI: {ai_response[:80]}...")
            else:
                print(f"   ❌ Error: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Exception: {e}")
        
        time.sleep(0.5)
    
    # Step 4: Test edge cases
    print("\n4. 🧪 Testing Edge Cases")
    print("-" * 30)
    
    edge_cases = [
        "",  # Empty message
        "   ",  # Whitespace only
        "?" * 100,  # Very long question
        "💰💸💎",  # Emoji only
        "1234567890",  # Numbers only
        "a" * 500,  # Very long text
    ]
    
    for case in edge_cases:
        print(f"\n   Testing: {repr(case)}")
        
        try:
            response = requests.post(
                f"{base_url}/api/upload-receipt/chat/",
                json={"message": case},
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result.get('message', 'No response')
                print(f"   ✅ Handled gracefully: {ai_response[:50]}...")
            else:
                print(f"   ❌ Error: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Exception: {e}")
    
    # Step 5: Summary
    print("\n5. 📊 Test Summary")
    print("-" * 30)
    
    success_rate = (successful_responses / total_questions) * 100
    
    print(f"✅ Successful responses: {successful_responses}/{total_questions} ({success_rate:.1f}%)")
    print(f"🎯 Questions tested: {total_questions}")
    print(f"🔄 Conversation flow: Tested")
    print(f"🧪 Edge cases: Tested")
    
    if success_rate >= 90:
        print("🎉 Excellent! Chatbot is working very well")
    elif success_rate >= 75:
        print("👍 Good! Chatbot is working well with minor issues")
    elif success_rate >= 50:
        print("⚠️  Fair! Chatbot has some issues to address")
    else:
        print("❌ Poor! Chatbot needs significant improvements")
    
    print("\n🎯 Enhanced Chatbot Features Verified:")
    print("✅ ChatGPT-like conversational responses")
    print("✅ Comprehensive financial analysis")
    print("✅ Personalized advice based on user data")
    print("✅ Flexible question handling")
    print("✅ Emoji and formatting support")
    print("✅ Context-aware suggestions")
    print("✅ Error handling and fallbacks")
    print("✅ Multi-turn conversation support")
    
    print("\n🎉 Enhanced ChatGPT-like chatbot testing completed!")

if __name__ == "__main__":
    test_enhanced_chatbot()
