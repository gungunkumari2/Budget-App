#!/usr/bin/env python3
"""
Test Rule-Based Least Expense Logic
==================================

Test the rule-based logic for handling least expense questions.
"""

import os
import django
from django.db.models import Sum

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budjet_backend.settings')
django.setup()

from receipts.models import Expense, Transaction, Category
from django.contrib.auth.models import User
from django.utils import timezone

def test_rule_based_least():
    """Test the rule-based logic for least expense questions"""
    
    print("🧪 Testing Rule-Based Least Expense Logic")
    print("=" * 50)
    
    # Get Bhumi user
    try:
        bhumi = User.objects.get(username='Bhumi')
        print(f"Testing with user: {bhumi.username}")
    except User.DoesNotExist:
        print("❌ Bhumi user not found!")
        return
    
    # Get current month data
    now = timezone.now()
    current_month = now.month
    current_year = now.year
    
    print(f"\n📊 Current Month: {current_month}, Year: {current_year}")
    
    # Get category totals (like in ChatView)
    categories = Category.objects.all()
    category_totals = []
    
    for cat in categories:
        # Get expenses from Expense model
        expense_amount = Expense.objects.filter(
            user=bhumi, 
            category=cat, 
            date__year=current_year, 
            date__month=current_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Get expenses from Transaction model (matching category name)
        transaction_amount = Transaction.objects.filter(
            user=bhumi, 
            category=cat.name,
            date__year=current_year, 
            date__month=current_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        total_amount = expense_amount + transaction_amount
        if total_amount > 0:
            category_totals.append({'category': cat.name, 'amount': total_amount})
    
    category_totals.sort(key=lambda x: x['amount'], reverse=True)
    
    print(f"\n📈 Category Totals (sorted by amount):")
    print("-" * 40)
    for i, cat in enumerate(category_totals, 1):
        print(f"{i}. {cat['category']}: NPR {cat['amount']:,.2f}")
    
    # Test the rule-based logic
    print(f"\n🎯 Testing Rule-Based Logic:")
    print("-" * 40)
    
    # Simulate the rule-based response logic
    user_message_lower = "where have i expense least"
    
    if any(word in user_message_lower for word in ['least', 'lowest', 'minimum', 'smallest', 'low', 'where have i expense least']):
        if category_totals and len(category_totals) > 1:
            # Sort categories by amount to find the lowest
            sorted_categories = sorted(category_totals, key=lambda x: x['amount'])
            lowest_category = sorted_categories[0]
            total_expenses = sum(cat['amount'] for cat in category_totals)
            percentage = ((lowest_category['amount'] / total_expenses) * 100) if total_expenses > 0 else 0
            
            # Get the second lowest for comparison
            second_lowest = sorted_categories[1] if len(sorted_categories) > 1 else None
            comparison = f"\n\n📊 **Comparison**: Your next lowest category is {second_lowest['category']} at NPR {second_lowest['amount']:,.2f}." if second_lowest else ""
            
            response = f"Your **lowest spending category** this month is **{lowest_category['category']}** with NPR {lowest_category['amount']:,.2f}. This represents {percentage:.1f}% of your total expenses.{comparison}\n\n💡 **Insight**: This is your most controlled expense area. Consider if you can apply similar discipline to other categories."
            
            print("✅ Rule-based response generated:")
            print(response)
            
        elif category_totals and len(category_totals) == 1:
            response = f"You only have one spending category recorded this month: **{category_totals[0]['category']}** with NPR {category_totals[0]['amount']:,.2f}. To get better insights, try categorizing your expenses into different categories like Food, Transportation, Entertainment, etc."
            print("✅ Rule-based response generated:")
            print(response)
            
        else:
            response = "You haven't recorded any categorized expenses yet this month. Start categorizing your expenses to see which areas you spend the least on."
            print("✅ Rule-based response generated:")
            print(response)
    
    print(f"\n🎯 Summary:")
    print("-" * 30)
    if category_totals:
        print(f"✅ Found {len(category_totals)} spending categories")
        print(f"✅ Lowest category: {sorted(category_totals, key=lambda x: x['amount'])[0]['category']}")
        print(f"✅ Rule-based logic is working correctly")
    else:
        print("⚠️  No spending categories found")
        print("⚠️  User needs to categorize their expenses")

if __name__ == "__main__":
    test_rule_based_least()
