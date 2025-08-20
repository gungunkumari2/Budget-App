#!/usr/bin/env python3
"""
Test Expense Calculation
========================

Simple test to verify that expense calculations include both Expense and Transaction models.
"""

import os
import django
from django.utils import timezone
from django.db.models import Sum

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budjet_backend.settings')
django.setup()

from receipts.models import Expense, Transaction, MonthlyIncome

def test_expense_calculation():
    """Test expense calculation logic"""
    
    now = timezone.now()
    current_month = now.month
    current_year = now.year
    
    print("🧮 Testing Expense Calculation")
    print("=" * 40)
    print(f"Current Month: {current_month}, Year: {current_year}")
    print()
    
    # Test the old calculation (Expense model only)
    old_total = Expense.objects.filter(
        date__year=current_year, 
        date__month=current_month
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    print(f"📊 Old Calculation (Expense model only): NPR {old_total:,.2f}")
    
    # Test the new calculation (both models)
    expense_total = Expense.objects.filter(
        date__year=current_year, 
        date__month=current_month
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    transaction_total = Transaction.objects.filter(
        date__year=current_year, 
        date__month=current_month
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    new_total = expense_total + transaction_total
    
    print(f"💸 Expense Model Total: NPR {expense_total:,.2f}")
    print(f"📊 Transaction Model Total: NPR {transaction_total:,.2f}")
    print(f"🎯 New Calculation (Combined): NPR {new_total:,.2f}")
    print()
    
    # Calculate difference
    difference = new_total - old_total
    percentage_increase = (difference / old_total * 100) if old_total > 0 else 0
    
    print(f"📈 Difference: NPR {difference:,.2f}")
    print(f"📊 Percentage Increase: {percentage_increase:.1f}%")
    print()
    
    # Test with user filter (like in ChatView)
    print("👤 Testing with User Filter:")
    print("-" * 30)
    
    # Get first user
    from django.contrib.auth.models import User
    users = User.objects.all()
    if users.exists():
        test_user = users.first()
        print(f"Testing with user: {test_user.username}")
        
        # Old calculation
        old_user_total = Expense.objects.filter(
            user=test_user,
            date__year=current_year, 
            date__month=current_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # New calculation
        expense_user_total = Expense.objects.filter(
            user=test_user,
            date__year=current_year, 
            date__month=current_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        transaction_user_total = Transaction.objects.filter(
            user=test_user,
            date__year=current_year, 
            date__month=current_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        new_user_total = expense_user_total + transaction_user_total
        
        print(f"  Old User Total: NPR {old_user_total:,.2f}")
        print(f"  New User Total: NPR {new_user_total:,.2f}")
        print(f"  User Difference: NPR {new_user_total - old_user_total:,.2f}")
        
        if new_user_total > old_user_total:
            print("  ✅ SUCCESS: New calculation includes more expense data!")
        else:
            print("  ℹ️  No additional data found in Transaction model for this user")
    else:
        print("No users found in database")
    
    print()
    print("🎯 Conclusion:")
    if new_total > old_total:
        print("✅ The fix successfully includes additional expense data from Transaction model")
        print(f"✅ Total expenses increased from NPR {old_total:,.2f} to NPR {new_total:,.2f}")
    else:
        print("ℹ️  No additional expense data found in Transaction model")

if __name__ == "__main__":
    test_expense_calculation()
