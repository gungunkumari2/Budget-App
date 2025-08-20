#!/usr/bin/env python3
"""
Test AI Chatbot Accuracy
========================

Test script to verify that the AI chatbot provides accurate responses with real financial data.
"""

import requests
import json
import time

def test_chatbot_accuracy():
    """Test that the chatbot provides accurate responses"""
    
    base_url = "http://localhost:8000"
    
    # Test user credentials
    test_user = {
        'email': 'bhumi@example.com',
        'password': 'testpass123'
    }
    
    print("🧪 Testing AI Chatbot Accuracy")
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
    
    # Step 2: Test accuracy with expected data
    print("\n2. 🎯 Testing Accuracy with Expected Data")
    
    # Expected data based on our test data
    expected_data = {
        'income': 50000.00,
        'total_expenses': 60500.00,  # 53,000 from expenses + 7,500 from transactions
        'savings': -10500.00,
        'savings_rate': -21.0,
        'highest_category': 'Shopping',
        'highest_amount': 15000.00,
        'lowest_category': 'Insurance',
        'lowest_amount': 2500.00,
        'food_expenses': 14500.00,  # 12,000 + 2,500
        'entertainment_expenses': 9500.00,  # 8,000 + 1,500
        'transportation_expenses': 7000.00,  # 6,000 + 1,000
        'total_budget': 53000.00,  # Sum of all budget categories
    }
    
    test_questions = [
        {
            'question': 'What is my highest spending category?',
            'expected_keywords': ['Shopping', '15,000', '24.8'],
            'description': 'Should identify Shopping as highest category'
        },
        {
            'question': 'Where have I spent the least?',
            'expected_keywords': ['Insurance', '2,500', '4.1'],
            'description': 'Should identify Insurance as lowest category'
        },
        {
            'question': 'How much did I spend on entertainment?',
            'expected_keywords': ['9,500', '15.7'],
            'description': 'Should show entertainment expenses (8,000 + 1,500)'
        },
        {
            'question': 'What is my total budget?',
            'expected_keywords': ['53,000', 'budget'],
            'description': 'Should show total budget amount'
        },
        {
            'question': 'Show me my food expenses',
            'expected_keywords': ['14,500', 'food', 'dining'],
            'description': 'Should show food expenses (12,000 + 2,500)'
        },
        {
            'question': 'What are my transportation expenses?',
            'expected_keywords': ['7,000', 'transportation'],
            'description': 'Should show transportation expenses (6,000 + 1,000)'
        },
        {
            'question': 'How much did I spend on shopping?',
            'expected_keywords': ['15,000', 'shopping'],
            'description': 'Should show shopping expenses'
        },
        {
            'question': 'What is my monthly income?',
            'expected_keywords': ['50,000', 'income'],
            'description': 'Should show monthly income'
        },
        {
            'question': 'How much have I saved this month?',
            'expected_keywords': ['-10,500', 'savings', '-21.0'],
            'description': 'Should show negative savings (over budget)'
        }
    ]
    
    accuracy_score = 0
    total_tests = len(test_questions)
    
    for i, test_case in enumerate(test_questions, 1):
        question = test_case['question']
        expected_keywords = test_case['expected_keywords']
        description = test_case['description']
        
        print(f"\n📝 Test {i}: '{question}'")
        print(f"   Expected: {description}")
        
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
                
                # Check if response contains expected keywords
                response_lower = chatbot_response.lower()
                found_keywords = []
                missing_keywords = []
                
                for keyword in expected_keywords:
                    if keyword.lower() in response_lower:
                        found_keywords.append(keyword)
                    else:
                        missing_keywords.append(keyword)
                
                # Calculate accuracy for this test
                accuracy = len(found_keywords) / len(expected_keywords) * 100
                accuracy_score += accuracy
                
                print(f"   ✅ Response: {chatbot_response}")
                print(f"   📊 Found keywords: {found_keywords}")
                if missing_keywords:
                    print(f"   ❌ Missing keywords: {missing_keywords}")
                print(f"   🎯 Accuracy: {accuracy:.1f}%")
                
                # Check response length
                response_length = len(chatbot_response)
                is_concise = response_length < 200
                print(f"   📏 Length: {response_length} chars {'✅' if is_concise else '❌'}")
                
            else:
                print(f"   ❌ Chat failed: {response.status_code}")
                accuracy_score += 0
                
        except Exception as e:
            print(f"   ❌ Chat error: {e}")
            accuracy_score += 0
        
        time.sleep(1)  # Small delay between requests
    
    # Calculate overall accuracy
    overall_accuracy = accuracy_score / total_tests
    
    print(f"\n🎉 Accuracy Testing Completed!")
    print(f"📊 Overall Accuracy: {overall_accuracy:.1f}%")
    print(f"📈 Score: {accuracy_score:.1f}/{total_tests * 100}")
    
    # Performance assessment
    if overall_accuracy >= 90:
        print("🏆 Excellent accuracy! The chatbot is providing highly accurate responses.")
    elif overall_accuracy >= 80:
        print("✅ Good accuracy! The chatbot is providing mostly accurate responses.")
    elif overall_accuracy >= 70:
        print("⚠️  Fair accuracy. Some responses may need improvement.")
    else:
        print("❌ Poor accuracy. The chatbot needs significant improvements.")
    
    print(f"\n📋 Summary:")
    print(f"- Tested {total_tests} different questions")
    print(f"- Expected accurate financial data responses")
    print(f"- Verified concise response format")
    print(f"- Overall accuracy: {overall_accuracy:.1f}%")

if __name__ == "__main__":
    test_chatbot_accuracy()
