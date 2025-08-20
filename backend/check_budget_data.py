#!/usr/bin/env python3
"""
Check Budget Data
================

Check if the user has budget data set up and what it contains.
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

def check_budget_data():
    """Check budget data for all users"""
    
    print("📋 Checking Budget Data")
    print("=" * 40)
    
    now = timezone.now()
    current_month = now.month
    current_year = now.year
    
    print(f"Current Month: {current_month}, Year: {current_year}")
    print()
    
    # Check all users
    users = User.objects.all()
    print(f"Total users: {users.count()}")
    print()
    
    for user in users:
        print(f"👤 User: {user.username} (ID: {user.id})")
        print("-" * 30)
        
        # Check budget data
        budgets = Budget.objects.filter(
            user=user,
            month=current_month,
            year=current_year
        )
        
        if budgets.exists():
            total_budget = sum(budget.amount for budget in budgets)
            print(f"📋 Budget Data Found:")
            print(f"  Total Budget: NPR {total_budget:,.2f}")
            print(f"  Number of Budget Categories: {budgets.count()}")
            
            print("  Budget Breakdown:")
            for budget in budgets:
                print(f"    • {budget.category.name}: NPR {budget.amount:,.2f}")
            
            # Check actual expenses
            expenses = Expense.objects.filter(
                user=user,
                date__year=current_year,
                date__month=current_month
            )
            total_expenses = expenses.aggregate(total=Sum('amount'))['total'] or 0
            
            print(f"  💸 Actual Expenses: NPR {total_expenses:,.2f}")
            print(f"  📊 Remaining Budget: NPR {total_budget - total_expenses:,.2f}")
            print(f"  🎯 Status: {'✅ Under budget' if total_expenses <= total_budget else '⚠️ Over budget'}")
            
        else:
            print("📋 No budget data found for this month")
            
            # Check if they have any budget data at all
            all_budgets = Budget.objects.filter(user=user)
            if all_budgets.exists():
                print(f"  ℹ️  Has budget data in other months: {all_budgets.count()} records")
                # Show most recent budget
                recent_budget = all_budgets.order_by('-year', '-month').first()
                print(f"  📅 Most recent: {recent_budget.month}/{recent_budget.year} - {recent_budget.category.name}: NPR {recent_budget.amount:,.2f}")
            else:
                print("  ❌ No budget data at all")
        
        print()
    
    # Check categories that could have budgets
    print("🏷️ Available Categories for Budgeting:")
    print("-" * 40)
    categories = Category.objects.all()
    for category in categories:
        print(f"  • {category.name}")
    
    print()
    print("💡 Summary:")
    print("-" * 30)
    total_budgets = Budget.objects.filter(month=current_month, year=current_year).count()
    print(f"Total budget records this month: {total_budgets}")
    
    if total_budgets == 0:
        print("⚠️  No users have budget data set up for the current month")
        print("💡 Users need to create budget categories to get budget-specific responses")
    else:
        print("✅ Some users have budget data set up")

if __name__ == "__main__":
    check_budget_data()
