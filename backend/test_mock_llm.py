#!/usr/bin/env python
"""
Test script for mock LLM responses

This script directly tests the mock LLM response generator without going through the API.
"""

import os
import sys
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budjet_backend.settings')
django.setup()

# Now we can import Django models
from receipts.views import ChatView
from django.contrib.auth.models import User

def test_mock_llm_responses():
    """Test the mock LLM response generator"""
    # Create a ChatView instance
    chat_view = ChatView()
    
    # Sample financial data
    monthly_income = 50000
    total_expenses = 35000
    
    # Sample category data
    category_totals = [
        {'category': 'Food', 'amount': 10000},
        {'category': 'Transportation', 'amount': 8000},
        {'category': 'Entertainment', 'amount': 5000},
    ]
    
    # Sample historical spending data
    historical_spending = [
        {'month': 'January', 'year': 2023, 'total': 32000},
        {'month': 'February', 'year': 2023, 'total': 34000},
        {'month': 'March', 'year': 2023, 'total': 35000},
    ]
    
    # Sample yearly category totals
    year_category_totals = [
        {'category': 'Food', 'amount': 120000},
        {'category': 'Transportation', 'amount': 96000},
        {'category': 'Entertainment', 'amount': 60000},
        {'category': 'Housing', 'amount': 180000},
        {'category': 'Utilities', 'amount': 48000},
    ]
    
    # Context for mock LLM
    context = {
        "monthly_income": monthly_income,
        "total_expenses": total_expenses,
        "savings": monthly_income - total_expenses,
        "savings_rate": (monthly_income - total_expenses) / monthly_income * 100 if monthly_income > 0 else 0,
        "top_categories": category_totals[:3] if category_totals else [],
        "historical_spending": historical_spending,
        "yearly_categories": year_category_totals[:5] if year_category_totals else []
    }
    
    # Test messages
    test_messages = [
        "How much am I spending this month?",
        "What are my top spending categories?",
        "How can I save more money?",
        "What's my income this month?",
        "Give me a summary of my finances"
    ]
    
    print("\n=== Testing Mock LLM Responses ===\n")
    
    for message in test_messages:
        print(f"\nUser: {message}")
        
        # Get response from mock LLM
        response = chat_view.generate_mock_llm_response(message, monthly_income, total_expenses, context)
        
        print(f"AI: {response}\n")
        print("-" * 80)

if __name__ == "__main__":
    test_mock_llm_responses()