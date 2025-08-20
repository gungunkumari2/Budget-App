#!/usr/bin/env python3
"""
Test AI Integration
==================

Test the AI service integration with different AI providers.
"""

import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budjet_backend.settings')
django.setup()

from receipts.ai_service import AIService

def test_ai_integration():
    """Test AI service integration"""
    
    print("🤖 Testing AI Service Integration")
    print("=" * 50)
    
    # Initialize AI service
    ai_service = AIService()
    
    # Get service status
    status = ai_service.get_service_status()
    
    print(f"Preferred Service: {status['preferred_service']}")
    print(f"Use Mock: {status['use_mock']}")
    print(f"Available Services: {', '.join(status['available_services'])}")
    print()
    
    # Test financial context
    financial_context = {
        'monthly_income': 200000,
        'total_expenses': 4800,
        'category_totals': [
            {'category': 'Groceries', 'amount': 3300},
            {'category': 'Insurance', 'amount': 1500}
        ],
        'spending_trends': {'message': 'Your spending has increased by 71.6% compared to previous months'},
        'budget_info': {'has_budgets': True}
    }
    
    # Test questions
    test_questions = [
        "tell me how much i expense in entertainment",
        "what is my total budget",
        "where have i expense least",
        "what's my biggest expense",
        "how can I save more money"
    ]
    
    print("🧪 Testing AI Responses:")
    print("-" * 40)
    
    for i, question in enumerate(test_questions, 1):
        print(f"\n{i}. Question: '{question}'")
        print("-" * 30)
        
        try:
            response = ai_service.generate_response(question, financial_context)
            print(f"Response: {response[:200]}...")
            
            # Check if response is meaningful
            if len(response) > 50 and not response.startswith("🤖 Mock AI Response"):
                print("✅ Good response generated")
            elif response.startswith("🤖 Mock AI Response"):
                print("ℹ️  Mock response (AI services not configured)")
            else:
                print("⚠️  Short or generic response")
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
    
    print(f"\n🎯 Summary:")
    print("-" * 30)
    print(f"AI Service Status: {status['preferred_service']}")
    print(f"Mock Mode: {'Yes' if status['use_mock'] else 'No'}")
    
    if status['use_mock']:
        print("\n💡 To use real AI services:")
        print("1. Set USE_MOCK to False in settings.py")
        print("2. Add your API keys as environment variables:")
        print("   export OPENAI_API_KEY='your-key'")
        print("   export ANTHROPIC_API_KEY='your-key'")
        print("   export HUGGINGFACE_API_KEY='your-key'")
        print("3. Or ensure OpenAI API key is set in environment")
    else:
        print("✅ Real AI services are configured!")

if __name__ == "__main__":
    test_ai_integration()
