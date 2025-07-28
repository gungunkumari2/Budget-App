from django.core.management.base import BaseCommand
from django.utils import timezone
from receipts.models import Budget, Category, Expense, PaymentMethod, Transaction
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Seed the database with dummy data for Budgets, Categories, Expenses, PaymentMethods, and Transactions.'

    def handle(self, *args, **options):
        User = get_user_model()
        user = User.objects.first()
        if not user:
            self.stdout.write(self.style.ERROR('No user found. Please create a user first.'))
            return

        # Dummy categories
        category_names = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Groceries']
        categories = []
        for name in category_names:
            cat, created = Category.objects.get_or_create(name=name, user=None)
            categories.append(cat)

        # Dummy payment methods
        payment_method_names = ['Credit Card', 'Debit Card', 'Cash', 'UPI', 'Net Banking']
        payment_methods = []
        for name in payment_method_names:
            pm, created = PaymentMethod.objects.get_or_create(name=name)
            payment_methods.append(pm)

        # Dummy budgets
        budget_data = [
            ('Groceries', 4000),
            ('Utilities', 2500),
            ('Transport', 1500),
            ('Entertainment', 2000),
            ('Food', 3500),
        ]
        budgets = []
        for i, (cat_name, amount) in enumerate(budget_data):
            cat = Category.objects.get(name=cat_name, user=None)
            budget, created = Budget.objects.get_or_create(
                user=user, category=cat, month=timezone.now().month, year=timezone.now().year,
                defaults={'amount': amount, 'currency': 'NPR'}
            )
            budgets.append(budget)

        # Dummy expenses
        expenses = []
        for i in range(5):
            cat = categories[i % len(categories)]
            budget = budgets[i % len(budgets)]
            expense, created = Expense.objects.get_or_create(
                user=user,
                date=timezone.now().date(),
                merchant=f"Merchant {i+1}",
                amount=1000 + i * 200,
                currency='NPR',
                category=cat,
                payment_method=payment_methods[i % len(payment_methods)],
                description=f"Expense for {cat.name}",
                defaults={'created_at': timezone.now()}
            )
            expenses.append(expense)

        # Dummy transactions
        for i in range(5):
            Transaction.objects.get_or_create(
                description=f"Transaction {i+1} for {categories[i % len(categories)].name}",
                amount=500 + i * 100,
                category=categories[i % len(categories)].name,
                date=timezone.now().date(),
                defaults={'created_at': timezone.now()}
            )

        self.stdout.write(self.style.SUCCESS('Successfully added dummy data.')) 