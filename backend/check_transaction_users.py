#!/usr/bin/env python3
"""
Check Transaction Users
======================

Check which users have data in the Transaction model.
"""

import os
import django
from django.utils import timezone
from django.db.models import Sum

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budjet_backend.settings')
django.setup()

from receipts.models import Transaction, Expense
from django.contrib.auth.models import User

def check_transaction_users():
    """Check which users have transaction data"""
    
    now = timezone.now()
    current_month = now.month
    current_year = now.year
    
    print("👥 Checking Transaction Users")
    print("=" * 40)
    print(f"Current Month: {current_month}, Year: {current_year}")
    print()
    
    # Check all users
    users = User.objects.all()
    print(f"Total users: {users.count()}")
    print()
    
    for user in users:
        print(f"👤 User: {user.username} (ID: {user.id})")
        print("-" * 30)
        
        # Check Expense data
        expense_total = Expense.objects.filter(
            user=user,
            date__year=current_year, 
            date__month=current_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        expense_count = Expense.objects.filter(
            user=user,
            date__year=current_year, 
            date__month=current_month
        ).count()
        
        # Check Transaction data
        transaction_total = Transaction.objects.filter(
            user=user,
            date__year=current_year, 
            date__month=current_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        transaction_count = Transaction.objects.filter(
            user=user,
            date__year=current_year, 
            date__month=current_month
        ).count()
        
        # Check all Transaction data (any date)
        all_transaction_total = Transaction.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0
        all_transaction_count = Transaction.objects.filter(user=user).count()
        
        print(f"  💸 Expense Model: NPR {expense_total:,.2f} ({expense_count} records)")
        print(f"  📊 Transaction Model (current month): NPR {transaction_total:,.2f} ({transaction_count} records)")
        print(f"  📈 Transaction Model (all time): NPR {all_transaction_total:,.2f} ({all_transaction_count} records)")
        print(f"  🎯 Combined Total: NPR {expense_total + transaction_total:,.2f}")
        print()
    
    # Check transactions without user (null user)
    print("🔍 Checking Transactions without User:")
    print("-" * 30)
    null_user_transactions = Transaction.objects.filter(user__isnull=True)
    null_user_total = null_user_transactions.aggregate(total=Sum('amount'))['total'] or 0
    null_user_count = null_user_transactions.count()
    
    print(f"  📊 Null User Transactions: NPR {null_user_total:,.2f} ({null_user_count} records)")
    
    if null_user_count > 0:
        print("  Recent null user transactions:")
        for transaction in null_user_transactions.order_by('-date')[:5]:
            print(f"    - {transaction.date}: {transaction.description[:50]}... - NPR {transaction.amount:,.2f}")
    
    print()
    print("💡 Summary:")
    print("-" * 30)
    total_transaction_amount = Transaction.objects.all().aggregate(total=Sum('amount'))['total'] or 0
    total_transaction_count = Transaction.objects.all().count()
    
    print(f"Total Transaction Model Data: NPR {total_transaction_amount:,.2f} ({total_transaction_count} records)")
    print(f"Null User Transactions: NPR {null_user_total:,.2f} ({null_user_count} records)")
    print(f"Assigned User Transactions: NPR {total_transaction_amount - null_user_total:,.2f}")

if __name__ == "__main__":
    check_transaction_users()
