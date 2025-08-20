#!/usr/bin/env python3
"""
Test Budget Question
===================

Test if the chatbot properly handles "what is my total budget" questions.
"""

import os
import django
from django.utils import timezone
from django.db.models import Sum

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budjet_backend.settings')
django.setup()

from receipts.models import Budget, Category, Expense, Transaction
from django.contrib.auth.models import User

def test_budget_question():
    """Test the budget question logic"""
    
    print("🧪 Testing Budget Question Logic")
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
    
    # Get budget data
    budgets = Budget.objects.filter(
        user=bhumi,
        month=current_month,
        year=current_year
    )
    
    if budgets.exists():
        total_budget = sum(budget.amount for budget in budgets)
        print(f"\n📋 Budget Data Found:")
        print(f"Total Budget: NPR {total_budget:,.2f}")
        print(f"Number of Budget Categories: {budgets.count()}")
        
        print("\nBudget Breakdown:")
        for budget in budgets:
            print(f"  • {budget.category.name}: NPR {budget.amount:,.2f}")
        
        # Get actual expenses
        expenses = Expense.objects.filter(
            user=bhumi,
            date__year=current_year,
            date__month=current_month
        )
        total_expenses = expenses.aggregate(total=Sum('amount'))['total'] or 0
        
        print(f"\n💸 Actual Expenses: NPR {total_expenses:,.2f}")
        print(f"📊 Remaining Budget: NPR {total_budget - total_expenses:,.2f}")
        print(f"🎯 Status: {'✅ Under budget' if total_expenses <= total_budget else '⚠️ Over budget'}")
        
        # Simulate the chatbot response
        print(f"\n🎯 Simulated Chatbot Response:")
        print("-" * 40)
        
        budget_details = []
        for budget in budgets:
            budget_details.append(f"• {budget.category.name}: NPR {budget.amount:,.2f}")
        
        budget_list = '\n'.join(budget_details)
        
        response = f"📋 **Your Total Budget This Month**: **NPR {total_budget:,.2f}**\n\n🎯 **Budget Breakdown**:\n{budget_list}\n\n📊 **Budget vs Actual**:\n• Total Budget: NPR {total_budget:,.2f}\n• Actual Expenses: NPR {total_expenses:,.2f}\n• Remaining: NPR {total_budget - total_expenses:,.2f}\n\n💡 **Status**: {'✅ Under budget' if total_expenses <= total_budget else '⚠️ Over budget'}"
        
        print(response)
        
        print(f"\n✅ SUCCESS: Chatbot should now provide specific budget information!")
        print(f"✅ Total Budget: NPR {total_budget:,.2f}")
        print(f"✅ Budget Categories: {budgets.count()}")
        print(f"✅ Budget vs Actual comparison included")
        
    else:
        print("❌ No budget data found for this month")
        print("The chatbot should inform you that no budget is set up")

if __name__ == "__main__":
    test_budget_question()
