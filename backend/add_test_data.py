#!/usr/bin/env python3
"""
Add Test Financial Data
=======================

Add sample financial data for testing the AI chatbot accuracy.
"""

import os
import sys
import django
from datetime import datetime, date
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budjet_backend.settings')
django.setup()

from django.contrib.auth.models import User
from receipts.models import Category, Expense, Transaction, MonthlyIncome, Budget
from django.db.models import Sum

def add_test_financial_data():
    """Add comprehensive test financial data for the bhumi user"""
    
    print("💰 Adding Test Financial Data")
    print("=" * 50)
    
    # Get the test user
    try:
        user = User.objects.get(email='bhumi@example.com')
        print(f"✅ Found user: {user.username} ({user.email})")
    except User.DoesNotExist:
        print("❌ Test user not found. Please run create_test_users.py first.")
        return False
    
    # Create categories if they don't exist
    categories_data = [
        {'name': 'Food & Dining', 'description': 'Restaurants, groceries, and food delivery'},
        {'name': 'Entertainment', 'description': 'Movies, shows, games, and leisure activities'},
        {'name': 'Transportation', 'description': 'Fuel, public transport, and travel expenses'},
        {'name': 'Shopping', 'description': 'Clothing, accessories, and retail purchases'},
        {'name': 'Healthcare', 'description': 'Medical expenses and health-related costs'},
        {'name': 'Education', 'description': 'Courses, training, and learning materials'},
        {'name': 'Utilities', 'description': 'Electricity, water, internet, and phone bills'},
        {'name': 'Insurance', 'description': 'Health, auto, and other insurance policies'},
    ]
    
    categories = {}
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={'description': cat_data['description']}
        )
        categories[cat_data['name']] = category
        if created:
            print(f"✅ Created category: {category.name}")
        else:
            print(f"ℹ️  Category exists: {category.name}")
    
    # Add monthly income for current month
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    monthly_income, created = MonthlyIncome.objects.get_or_create(
        user=user,
        month=current_month,
        year=current_year,
        defaults={'amount': Decimal('50000.00')}
    )
    
    if created:
        print(f"✅ Added monthly income: NPR {monthly_income.amount:,.2f}")
    else:
        print(f"ℹ️  Monthly income exists: NPR {monthly_income.amount:,.2f}")
    
    # Add sample expenses for current month
    expenses_data = [
        {'category': 'Food & Dining', 'amount': Decimal('12000.00'), 'description': 'Groceries and restaurants'},
        {'category': 'Entertainment', 'amount': Decimal('8000.00'), 'description': 'Movies and games'},
        {'category': 'Transportation', 'amount': Decimal('6000.00'), 'description': 'Fuel and public transport'},
        {'category': 'Shopping', 'amount': Decimal('15000.00'), 'description': 'Clothing and accessories'},
        {'category': 'Healthcare', 'amount': Decimal('3000.00'), 'description': 'Medical checkup'},
        {'category': 'Education', 'amount': Decimal('5000.00'), 'description': 'Online course'},
        {'category': 'Utilities', 'amount': Decimal('4000.00'), 'description': 'Electricity and internet'},
        {'category': 'Insurance', 'amount': Decimal('2500.00'), 'description': 'Health insurance premium'},
    ]
    
    # Clear existing expenses for current month
    Expense.objects.filter(user=user, date__year=current_year, date__month=current_month).delete()
    Transaction.objects.filter(user=user, date__year=current_year, date__month=current_month).delete()
    
    print(f"\n📊 Adding expenses for {datetime.now().strftime('%B %Y')}:")
    
    for exp_data in expenses_data:
        category = categories[exp_data['category']]
        
        # Create expense
        expense = Expense.objects.create(
            user=user,
            category=category,
            amount=exp_data['amount'],
            description=exp_data['description'],
            date=date(current_year, current_month, 15),  # Mid-month date
            merchant='Test Merchant'
        )
        
        print(f"✅ {category.name}: NPR {exp_data['amount']:,.2f}")
    
    # Add some transactions as well
    transactions_data = [
        {'category': 'Food & Dining', 'amount': Decimal('2500.00'), 'description': 'Restaurant dinner'},
        {'category': 'Entertainment', 'amount': Decimal('1500.00'), 'description': 'Movie tickets'},
        {'category': 'Transportation', 'amount': Decimal('1000.00'), 'description': 'Taxi ride'},
    ]
    
    for trans_data in transactions_data:
        transaction = Transaction.objects.create(
            user=user,
            category=trans_data['category'],
            amount=trans_data['amount'],
            description=trans_data['description'],
            date=date(current_year, current_month, 20)
        )
        
        print(f"✅ Transaction - {trans_data['category']}: NPR {trans_data['amount']:,.2f}")
    
    # Add budget data
    budget_data = [
        {'category': 'Food & Dining', 'amount': Decimal('15000.00')},
        {'category': 'Entertainment', 'amount': Decimal('10000.00')},
        {'category': 'Transportation', 'amount': Decimal('8000.00')},
        {'category': 'Shopping', 'amount': Decimal('20000.00')},
    ]
    
    print(f"\n📋 Adding budget data:")
    
    for budget_item in budget_data:
        category = categories[budget_item['category']]
        
        budget, created = Budget.objects.get_or_create(
            user=user,
            category=category,
            month=current_month,
            year=current_year,
            defaults={'amount': budget_item['amount']}
        )
        
        if created:
            print(f"✅ Budget - {category.name}: NPR {budget_item['amount']:,.2f}")
        else:
            print(f"ℹ️  Budget exists - {category.name}: NPR {budget.amount:,.2f}")
    
    # Calculate totals
    total_expenses = Expense.objects.filter(
        user=user, 
        date__year=current_year, 
        date__month=current_month
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
    
    total_transactions = Transaction.objects.filter(
        user=user, 
        date__year=current_year, 
        date__month=current_month
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
    
    total_spending = total_expenses + total_transactions
    savings = monthly_income.amount - total_spending
    
    print(f"\n📈 Financial Summary:")
    print(f"💰 Monthly Income: NPR {monthly_income.amount:,.2f}")
    print(f"💸 Total Expenses: NPR {total_spending:,.2f}")
    print(f"💎 Savings: NPR {savings:,.2f}")
    print(f"📊 Savings Rate: {(savings / monthly_income.amount * 100):.1f}%")
    
    # Show category breakdown
    print(f"\n📊 Category Breakdown:")
    for exp_data in expenses_data:
        category_name = exp_data['category']
        amount = exp_data['amount']
        percentage = (amount / total_spending * 100) if total_spending > 0 else 0
        print(f"   {category_name}: NPR {amount:,.2f} ({percentage:.1f}%)")
    
    print(f"\n🎉 Test financial data added successfully!")
    print(f"Now you can test the AI chatbot with realistic data.")
    
    return True

if __name__ == "__main__":
    add_test_financial_data()
