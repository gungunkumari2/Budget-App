#!/usr/bin/env python3
"""
Test Entertainment Expense
=========================

Test the entertainment expense logic and check actual entertainment spending.
"""

import os
import django
from django.utils import timezone
from django.db.models import Sum

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budjet_backend.settings')
django.setup()

from receipts.models import Expense, Transaction, Category
from django.contrib.auth.models import User

def test_entertainment_expense():
    """Test entertainment expense logic"""
    
    print("🎬 Testing Entertainment Expense Logic")
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
    
    # Get all categories and their expenses
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
    
    print(f"\n📈 All Category Totals:")
    print("-" * 40)
    for i, cat in enumerate(category_totals, 1):
        print(f"{i}. {cat['category']}: NPR {cat['amount']:,.2f}")
    
    # Test entertainment expense logic
    print(f"\n🎯 Testing Entertainment Expense Logic:")
    print("-" * 40)
    
    entertainment_expenses = sum([cat['amount'] for cat in category_totals if any(word in cat['category'].lower() for word in ['entertainment', 'movie', 'cinema', 'theater', 'show', 'concert', 'game', 'hobby', 'fun'])])
    total_expenses = sum(cat['amount'] for cat in category_totals)
    
    print(f"Entertainment Expenses: NPR {entertainment_expenses:,.2f}")
    print(f"Total Expenses: NPR {total_expenses:,.2f}")
    
    if entertainment_expenses > 0:
        percentage = ((entertainment_expenses / total_expenses) * 100) if total_expenses > 0 else 0
        print(f"Percentage of Total: {percentage:.1f}%")
        
        # Simulate the chatbot response
        print(f"\n🎬 Simulated Chatbot Response:")
        print("-" * 40)
        
        response = f"Your **entertainment expenses** this month are **NPR {entertainment_expenses:,.2f}**. This represents {percentage:.1f}% of your total spending.\n\n🎬 **Entertainment Analysis**: This includes movies, shows, concerts, games, and other leisure activities. Consider setting a monthly entertainment budget to balance fun with financial goals."
        
        print(response)
        
        print(f"\n✅ SUCCESS: Chatbot should now provide specific entertainment information!")
        print(f"✅ Entertainment Amount: NPR {entertainment_expenses:,.2f}")
        print(f"✅ Percentage of Total: {percentage:.1f}%")
        
    else:
        print("❌ No entertainment expenses found this month")
        print("The chatbot should inform you that no entertainment expenses are recorded")

if __name__ == "__main__":
    test_entertainment_expense()
