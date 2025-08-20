#!/usr/bin/env python3
"""
Debug Chat Filter
================

Debug script to test the chat filter logic in views.py
"""

def test_chat_filter():
    """Test the chat filter logic"""
    
    test_messages = [
        'hello',
        'hi',
        'hey',
        'greetings',
        'What is my highest spending category?',
        'Show me my highest spending category',
        'How much did I spend on entertainment?',
        'What is my total budget?',
        'Where have I spent the least?'
    ]
    
    print("🧪 Testing Chat Filter Logic")
    print("=" * 50)
    
    for message in test_messages:
        user_message_lower = message.lower()
        
        # Test greeting filter
        is_greeting = any(word == user_message_lower.strip() for word in ['hello', 'hi', 'hey', 'greetings'])
        
        # Test social filter
        is_social = any(word in user_message_lower for word in ['how are you', 'how do you do', 'what\'s up'])
        
        # Test goodbye filter
        is_goodbye = any(word in user_message_lower for word in ['thanks', 'thank you', 'bye', 'goodbye'])
        
        print(f"\n📝 Message: '{message}'")
        print(f"   Lowercase: '{user_message_lower}'")
        print(f"   Is greeting: {'✅' if is_greeting else '❌'}")
        print(f"   Is social: {'✅' if is_social else '❌'}")
        print(f"   Is goodbye: {'✅' if is_goodbye else '❌'}")
        
        if is_greeting:
            print(f"   🎯 Result: Would get greeting response")
        elif is_social:
            print(f"   🎯 Result: Would get social response")
        elif is_goodbye:
            print(f"   🎯 Result: Would get goodbye response")
        else:
            print(f"   🎯 Result: Would go to OpenAI service")

if __name__ == "__main__":
    test_chat_filter()
