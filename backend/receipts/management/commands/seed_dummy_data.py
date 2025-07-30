from django.core.management.base import BaseCommand
from django.utils import timezone
from receipts.models import Budget, Category, Expense, PaymentMethod, Transaction, MonthlyIncome
from django.contrib.auth import get_user_model
from datetime import date, timedelta
import random

class Command(BaseCommand):
    help = 'Seed the database with dummy data for Budgets, Categories, Expenses, PaymentMethods, and Transactions.'

    def handle(self, *args, **options):
        User = get_user_model()
        user = User.objects.first()
        if not user:
            self.stdout.write(self.style.ERROR('No user found. Please create a user first.'))
            return

        # Create more comprehensive categories
        category_data = [
            {'name': 'Food & Dining', 'color': '#ef4444'},
            {'name': 'Transportation', 'color': '#3b82f6'},
            {'name': 'Utilities', 'color': '#10b981'},
            {'name': 'Entertainment', 'color': '#f59e0b'},
            {'name': 'Groceries', 'color': '#8b5cf6'},
            {'name': 'Shopping', 'color': '#ec4899'},
            {'name': 'Healthcare', 'color': '#06b6d4'},
            {'name': 'Education', 'color': '#84cc16'},
            {'name': 'Travel', 'color': '#f97316'},
            {'name': 'Insurance', 'color': '#6366f1'},
        ]
        
        categories = []
        for cat_data in category_data:
            cat, created = Category.objects.get_or_create(
                name=cat_data['name'], 
                user=None,
                defaults={'name': cat_data['name']}
            )
            categories.append(cat)

        # Create payment methods
        payment_method_names = ['Credit Card', 'Debit Card', 'Cash', 'UPI', 'Net Banking', 'Digital Wallet']
        payment_methods = []
        for name in payment_method_names:
            pm, created = PaymentMethod.objects.get_or_create(name=name)
            payment_methods.append(pm)

        # Create realistic expense data
        expense_data = [
            # Food & Dining
            {'category': 'Food & Dining', 'merchant': 'Pizza Hut', 'amount': 1200, 'description': 'Dinner with friends'},
            {'category': 'Food & Dining', 'merchant': 'Starbucks', 'amount': 350, 'description': 'Coffee and snacks'},
            {'category': 'Food & Dining', 'merchant': 'McDonald\'s', 'amount': 450, 'description': 'Lunch'},
            {'category': 'Food & Dining', 'merchant': 'Domino\'s', 'amount': 800, 'description': 'Pizza delivery'},
            {'category': 'Food & Dining', 'merchant': 'KFC', 'amount': 600, 'description': 'Fried chicken meal'},
            
            # Transportation
            {'category': 'Transportation', 'merchant': 'Uber', 'amount': 250, 'description': 'Ride to office'},
            {'category': 'Transportation', 'merchant': 'Ola', 'amount': 180, 'description': 'Airport pickup'},
            {'category': 'Transportation', 'merchant': 'Metro', 'amount': 50, 'description': 'Daily commute'},
            {'category': 'Transportation', 'merchant': 'Petrol Pump', 'amount': 2000, 'description': 'Fuel refill'},
            {'category': 'Transportation', 'merchant': 'Parking', 'amount': 100, 'description': 'Parking fee'},
            
            # Utilities
            {'category': 'Utilities', 'merchant': 'Electricity Bill', 'amount': 1500, 'description': 'Monthly electricity'},
            {'category': 'Utilities', 'merchant': 'Water Bill', 'amount': 300, 'description': 'Water supply'},
            {'category': 'Utilities', 'merchant': 'Internet', 'amount': 1200, 'description': 'Broadband connection'},
            {'category': 'Utilities', 'merchant': 'Gas Bill', 'amount': 400, 'description': 'Cooking gas'},
            {'category': 'Utilities', 'merchant': 'Mobile Recharge', 'amount': 500, 'description': 'Phone bill'},
            
            # Entertainment
            {'category': 'Entertainment', 'merchant': 'Netflix', 'amount': 650, 'description': 'Streaming subscription'},
            {'category': 'Entertainment', 'merchant': 'Movie Theater', 'amount': 800, 'description': 'Weekend movie'},
            {'category': 'Entertainment', 'merchant': 'Spotify', 'amount': 150, 'description': 'Music subscription'},
            {'category': 'Entertainment', 'merchant': 'Gaming Store', 'amount': 1200, 'description': 'Video game'},
            {'category': 'Entertainment', 'merchant': 'Concert Tickets', 'amount': 2500, 'description': 'Live music event'},
            
            # Groceries
            {'category': 'Groceries', 'merchant': 'Big Bazaar', 'amount': 2500, 'description': 'Weekly groceries'},
            {'category': 'Groceries', 'merchant': 'Reliance Fresh', 'amount': 1800, 'description': 'Fresh vegetables'},
            {'category': 'Groceries', 'merchant': 'D-Mart', 'amount': 3200, 'description': 'Monthly shopping'},
            {'category': 'Groceries', 'merchant': 'Local Market', 'amount': 900, 'description': 'Fruits and vegetables'},
            {'category': 'Groceries', 'merchant': 'Organic Store', 'amount': 1500, 'description': 'Organic products'},
            
            # Shopping
            {'category': 'Shopping', 'merchant': 'Amazon', 'amount': 3500, 'description': 'Online shopping'},
            {'category': 'Shopping', 'merchant': 'Flipkart', 'amount': 2800, 'description': 'Electronics purchase'},
            {'category': 'Shopping', 'merchant': 'Myntra', 'amount': 1200, 'description': 'Clothing purchase'},
            {'category': 'Shopping', 'merchant': 'Nike Store', 'amount': 4500, 'description': 'Sports shoes'},
            {'category': 'Shopping', 'merchant': 'Zara', 'amount': 3200, 'description': 'Fashion shopping'},
            
            # Healthcare
            {'category': 'Healthcare', 'merchant': 'Apollo Hospital', 'amount': 5000, 'description': 'Medical checkup'},
            {'category': 'Healthcare', 'merchant': 'Pharmacy', 'amount': 800, 'description': 'Medicines'},
            {'category': 'Healthcare', 'merchant': 'Dental Clinic', 'amount': 2500, 'description': 'Dental cleaning'},
            {'category': 'Healthcare', 'merchant': 'Eye Care', 'amount': 1800, 'description': 'Eye examination'},
            {'category': 'Healthcare', 'merchant': 'Gym Membership', 'amount': 2000, 'description': 'Fitness center'},
            
            # Education
            {'category': 'Education', 'merchant': 'Coursera', 'amount': 3000, 'description': 'Online course'},
            {'category': 'Education', 'merchant': 'Udemy', 'amount': 1200, 'description': 'Programming course'},
            {'category': 'Education', 'merchant': 'Book Store', 'amount': 800, 'description': 'Study materials'},
            {'category': 'Education', 'merchant': 'Library', 'amount': 500, 'description': 'Membership fee'},
            {'category': 'Education', 'merchant': 'Workshop', 'amount': 2500, 'description': 'Skill development'},
            
            # Travel
            {'category': 'Travel', 'merchant': 'Air India', 'amount': 15000, 'description': 'Flight tickets'},
            {'category': 'Travel', 'merchant': 'Hotel Booking', 'amount': 8000, 'description': 'Accommodation'},
            {'category': 'Travel', 'merchant': 'Travel Agency', 'amount': 5000, 'description': 'Tour package'},
            {'category': 'Travel', 'merchant': 'Train Tickets', 'amount': 1200, 'description': 'Railway booking'},
            {'category': 'Travel', 'merchant': 'Car Rental', 'amount': 3000, 'description': 'Vehicle hire'},
            
            # Insurance
            {'category': 'Insurance', 'merchant': 'LIC', 'amount': 5000, 'description': 'Life insurance premium'},
            {'category': 'Insurance', 'merchant': 'Health Insurance', 'amount': 3000, 'description': 'Medical insurance'},
            {'category': 'Insurance', 'merchant': 'Car Insurance', 'amount': 8000, 'description': 'Vehicle insurance'},
            {'category': 'Insurance', 'merchant': 'Home Insurance', 'amount': 4000, 'description': 'Property insurance'},
            {'category': 'Insurance', 'merchant': 'Travel Insurance', 'amount': 1500, 'description': 'Trip coverage'},
        ]

        # Create expenses with varied dates (last 3 months)
        expenses = []
        for i, exp_data in enumerate(expense_data):
            # Generate random date within last 3 months
            days_ago = random.randint(0, 90)
            expense_date = date.today() - timedelta(days=days_ago)
            
            category = Category.objects.get(name=exp_data['category'])
            payment_method = random.choice(payment_methods)
            
            expense, created = Expense.objects.get_or_create(
                user=user,
                date=expense_date,
                merchant=exp_data['merchant'],
                amount=exp_data['amount'],
                currency='NPR',
                category=category,
                payment_method=payment_method,
                description=exp_data['description'],
                defaults={'created_at': timezone.now()}
            )
            expenses.append(expense)

        # Create budgets for current month
        budget_data = [
            ('Food & Dining', 5000),
            ('Transportation', 3000),
            ('Utilities', 4000),
            ('Entertainment', 2500),
            ('Groceries', 6000),
            ('Shopping', 4000),
            ('Healthcare', 3000),
            ('Education', 2000),
            ('Travel', 10000),
            ('Insurance', 5000),
        ]
        
        budgets = []
        for cat_name, amount in budget_data:
            cat = Category.objects.get(name=cat_name, user=None)
            budget, created = Budget.objects.get_or_create(
                user=user, 
                category=cat, 
                month=timezone.now().month, 
                year=timezone.now().year,
                defaults={'amount': amount, 'currency': 'NPR'}
            )
            budgets.append(budget)

        # Create monthly income
        monthly_income, created = MonthlyIncome.objects.get_or_create(
            user=user,
            month=timezone.now().month,
            year=timezone.now().year,
            defaults={'amount': 200000, 'currency': 'NPR'}
        )

        # Create some transactions
        transaction_data = [
            {'description': 'Grocery shopping at Big Bazaar', 'amount': 2500, 'category': 'Groceries'},
            {'description': 'Fuel refill at petrol pump', 'amount': 2000, 'category': 'Transportation'},
            {'description': 'Electricity bill payment', 'amount': 1500, 'category': 'Utilities'},
            {'description': 'Netflix subscription renewal', 'amount': 650, 'category': 'Entertainment'},
            {'description': 'Online course purchase', 'amount': 3000, 'category': 'Education'},
        ]
        
        for trans_data in transaction_data:
            Transaction.objects.get_or_create(
                user=user,
                description=trans_data['description'],
                amount=trans_data['amount'],
                category=trans_data['category'],
                date=date.today() - timedelta(days=random.randint(1, 30)),
                defaults={'created_at': timezone.now()}
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully added dummy data:\n'
                f'- {len(categories)} categories\n'
                f'- {len(payment_methods)} payment methods\n'
                f'- {len(expenses)} expenses\n'
                f'- {len(budgets)} budgets\n'
                f'- 1 monthly income\n'
                f'- {len(transaction_data)} transactions'
            )
        ) 