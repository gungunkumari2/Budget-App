from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

# Create your models here.

class PaymentMethod(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=50)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='custom_categories')
    # null user = global/predefined category

    class Meta:
        unique_together = ('name', 'user')
        indexes = [
            models.Index(fields=['name']),
        ]

    def __str__(self):
        return self.name

class ExpenseQuerySet(models.QuerySet):
    def monthly_totals(self, user, year, month):
        return self.filter(user=user, date__year=year, date__month=month)\
                   .values('category__name')\
                   .annotate(total=models.Sum('amount'))\
                   .order_by('-total')

    def yearly_totals(self, user, year):
        return self.filter(user=user, date__year=year)\
                   .values('category__name')\
                   .annotate(total=models.Sum('amount'))\
                   .order_by('-total')

    def top_categories_last_month(self, user, n=3):
        from datetime import date, timedelta
        today = date.today()
        first = date(today.year, today.month, 1)
        last_month = first - timedelta(days=1)
        return self.filter(user=user, date__year=last_month.year, date__month=last_month.month)\
                   .values('category__name')\
                   .annotate(total=models.Sum('amount'))\
                   .order_by('-total')[:n]

    def compare_budget_vs_actual(self, user, year, month):
        actuals = self.monthly_totals(user, year, month)
        budgets = Budget.objects.filter(user=user, year=year, month=month)
        return actuals, budgets

class Expense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    date = models.DateField()
    merchant = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='USD')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='expenses')
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = ExpenseQuerySet.as_manager()

    class Meta:
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['category', 'date']),
        ]
        ordering = ['-date']

    def __str__(self):
        return f"{self.date} - {self.merchant} - {self.amount} {self.currency}"

class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='budgets')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='USD')
    month = models.PositiveSmallIntegerField()  # 1-12
    year = models.PositiveSmallIntegerField()

    class Meta:
        unique_together = ('user', 'category', 'month', 'year')
        indexes = [
            models.Index(fields=['user', 'category', 'month', 'year']),
        ]

    def __str__(self):
        return f"{self.user} - {self.category} - {self.month}/{self.year}: {self.amount} {self.currency}"

class Transaction(models.Model):
    file = models.FileField(upload_to='receipts/', null=True, blank=True)
    description = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    category = models.CharField(max_length=100, blank=True)
    date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.description} - {self.amount}"

class MonthlyIncome(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    month = models.PositiveSmallIntegerField()
    year = models.PositiveSmallIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'month', 'year')
