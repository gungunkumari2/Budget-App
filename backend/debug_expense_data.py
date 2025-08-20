#!/usr/bin/env python3
"""
Debug Expense Data
=================

This script checks what expense data exists in both Expense and Transaction models
to understand why the total expenses seem low.
"""

import os
import sys
import django
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budjet_backend.settings')
django.setup()

from receipts.models import Expense, Transaction, MonthlyIncome, Category
from django.db.models import Sum
from django.utils import timezone

def debug_expense_data():
    """Debug expense data across all models"""
    
    now = timezone.now()
    current_month = now.month
    current_year = now.year
    
    print("🔍 Debugging Expense Data")
    print("=" * 50)
    print(f"Current Month: {current_month}, Year: {current_year}")
    print()
    
    # Check MonthlyIncome
    print("💰 Monthly Income Data:")
    print("-" * 30)
    monthly_incomes = MonthlyIncome.objects.filter(month=current_month, year=current_year)
    total_income = monthly_incomes.aggregate(total=Sum('amount'))['total'] or 0
    print(f"Total Monthly Income: NPR {total_income:,.2f}")
    for income in monthly_incomes:
        print(f"  - User: {income.user.username}, Amount: NPR {income.amount:,.2f}")
    print()
    
    # Check Expense model
    print("💸 Expense Model Data:")
    print("-" * 30)
    expenses = Expense.objects.filter(date__year=current_year, date__month=current_month)
    total_expenses = expenses.aggregate(total=Sum('amount'))['total'] or 0
    print(f"Total Expenses (Expense model): NPR {total_expenses:,.2f}")
    print(f"Number of expense records: {expenses.count()}")
    
    if expenses.exists():
        print("Recent expenses:")
        for expense in expenses.order_by('-date')[:10]:
            print(f"  - {expense.date}: {expense.merchant} - NPR {expense.amount:,.2f} ({expense.category.name if expense.category else 'No category'})")
    else:
        print("  No expense records found!")
    print()
    
    # Check Transaction model
    print("📊 Transaction Model Data:")
    print("-" * 30)
    transactions = Transaction.objects.filter(date__year=current_year, date__month=current_month)
    total_transactions = transactions.aggregate(total=Sum('amount'))['total'] or 0
    print(f"Total Transactions (Transaction model): NPR {total_transactions:,.2f}")
    print(f"Number of transaction records: {transactions.count()}")
    
    if transactions.exists():
        print("Recent transactions:")
        for transaction in transactions.order_by('-date')[:10]:
            print(f"  - {transaction.date}: {transaction.description[:50]}... - NPR {transaction.amount:,.2f} ({transaction.category})")
    else:
        print("  No transaction records found!")
    print()
    
    # Check all transactions (not filtered by date)
    print("📈 All Transaction Data (Any Date):")
    print("-" * 30)
    all_transactions = Transaction.objects.all()
    total_all_transactions = all_transactions.aggregate(total=Sum('amount'))['total'] or 0
    print(f"Total All Transactions: NPR {total_all_transactions:,.2f}")
    print(f"Number of all transaction records: {all_transactions.count()}")
    
    if all_transactions.exists():
        print("Recent transactions (any date):")
        for transaction in all_transactions.order_by('-date')[:5]:
            print(f"  - {transaction.date}: {transaction.description[:50]}... - NPR {transaction.amount:,.2f} ({transaction.category})")
    print()
    
    # Check categories
    print("🏷️ Category Data:")
    print("-" * 30)
    categories = Category.objects.all()
    print(f"Total categories: {categories.count()}")
    for category in categories:
        category_expenses = Expense.objects.filter(category=category, date__year=current_year, date__month=current_month)
        category_total = category_expenses.aggregate(total=Sum('amount'))['total'] or 0
        print(f"  - {category.name}: NPR {category_total:,.2f} ({category_expenses.count()} records)")
    print()
    
    # Calculate what the total should be
    print("🧮 Summary:")
    print("-" * 30)
    print(f"Monthly Income: NPR {total_income:,.2f}")
    print(f"Expense Model Total: NPR {total_expenses:,.2f}")
    print(f"Transaction Model Total (current month): NPR {total_transactions:,.2f}")
    print(f"Combined Total (Expense + Transaction): NPR {total_expenses + total_transactions:,.2f}")
    
    if total_income > 0:
        expense_rate = (total_expenses / total_income) * 100
        combined_rate = ((total_expenses + total_transactions) / total_income) * 100
        print(f"Expense Rate (Expense model only): {expense_rate:.1f}%")
        print(f"Expense Rate (Combined): {combined_rate:.1f}%")
    
    print()
    print("💡 Recommendation:")
    if total_transactions > 0:
        print("The Transaction model contains additional expense data that should be included in calculations.")
        print("Consider updating the ChatView and DashboardSummaryView to include Transaction data.")
    else:
        print("All expense data appears to be in the Expense model only.")
        print("The low expense total might be accurate if you haven't recorded many expenses this month.")

if __name__ == "__main__":
    debug_expense_data()
