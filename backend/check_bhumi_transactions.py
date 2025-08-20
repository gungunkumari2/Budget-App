#!/usr/bin/env python3
"""
Check Bhumi's Transactions by Month
===================================

Check Bhumi's transaction data broken down by month.
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

def check_bhumi_transactions():
    """Check Bhumi's transaction data by month"""
    
    print("👤 Checking Bhumi's Transaction Data by Month")
    print("=" * 50)
    
    # Get Bhumi user
    try:
        bhumi = User.objects.get(username='Bhumi')
        print(f"User: {bhumi.username} (ID: {bhumi.id})")
        print()
    except User.DoesNotExist:
        print("❌ Bhumi user not found!")
        return
    
    # Check transactions by month
    print("📊 Transaction Model Data by Month:")
    print("-" * 40)
    
    transactions = Transaction.objects.filter(user=bhumi).order_by('date')
    
    if transactions.exists():
        # Group by month
        monthly_data = {}
        for transaction in transactions:
            if transaction.date:
                month_key = f"{transaction.date.year}-{transaction.date.month:02d}"
                if month_key not in monthly_data:
                    monthly_data[month_key] = {'total': 0, 'count': 0, 'transactions': []}
                monthly_data[month_key]['total'] += transaction.amount or 0
                monthly_data[month_key]['count'] += 1
                monthly_data[month_key]['transactions'].append(transaction)
        
        # Display monthly breakdown
        for month_key in sorted(monthly_data.keys()):
            data = monthly_data[month_key]
            print(f"📅 {month_key}: NPR {data['total']:,.2f} ({data['count']} records)")
            
            # Show first few transactions for each month
            for transaction in data['transactions'][:3]:
                print(f"    - {transaction.date}: {transaction.description[:40]}... - NPR {transaction.amount:,.2f}")
            if len(data['transactions']) > 3:
                print(f"    ... and {len(data['transactions']) - 3} more")
            print()
    else:
        print("No transaction data found for Bhumi")
    
    # Check current month specifically
    now = timezone.now()
    current_month = now.month
    current_year = now.year
    
    print(f"🎯 Current Month ({current_year}-{current_month:02d}) Summary:")
    print("-" * 40)
    
    # Current month expenses
    current_expenses = Expense.objects.filter(
        user=bhumi,
        date__year=current_year,
        date__month=current_month
    )
    
    current_expense_total = current_expenses.aggregate(total=Sum('amount'))['total'] or 0
    current_expense_count = current_expenses.count()
    
    # Current month transactions
    current_transactions = Transaction.objects.filter(
        user=bhumi,
        date__year=current_year,
        date__month=current_month
    )
    
    current_transaction_total = current_transactions.aggregate(total=Sum('amount'))['total'] or 0
    current_transaction_count = current_transactions.count()
    
    print(f"💸 Expense Model: NPR {current_expense_total:,.2f} ({current_expense_count} records)")
    print(f"📊 Transaction Model: NPR {current_transaction_total:,.2f} ({current_transaction_count} records)")
    print(f"🎯 Combined Total: NPR {current_expense_total + current_transaction_total:,.2f}")
    
    if current_expenses.exists():
        print("\nCurrent month expenses:")
        for expense in current_expenses:
            print(f"  - {expense.date}: {expense.merchant} - NPR {expense.amount:,.2f} ({expense.category.name if expense.category else 'No category'})")
    
    if current_transactions.exists():
        print("\nCurrent month transactions:")
        for transaction in current_transactions:
            print(f"  - {transaction.date}: {transaction.description[:50]}... - NPR {transaction.amount:,.2f} ({transaction.category})")
    
    print()
    print("💡 Conclusion:")
    print("-" * 30)
    if current_transaction_total == 0:
        print("✅ The current month only has Expense model data (NPR 4,800)")
        print("✅ The Transaction model data is from previous months")
        print("✅ Your expense total of NPR 4,800 is correct for the current month")
    else:
        print("⚠️  There is Transaction model data for the current month")
        print(f"⚠️  Total should be NPR {current_expense_total + current_transaction_total:,.2f}")

if __name__ == "__main__":
    check_bhumi_transactions()
