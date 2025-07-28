from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Sum
from django.utils import timezone
from .models import Transaction, Expense, Category, PaymentMethod, Budget, MonthlyIncome
from django.db import models

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'description', 'amount', 'category', 'date', 'created_at')
    search_fields = ('description', 'category')
    list_filter = ('category', 'date', 'created_at')
    ordering = ('-created_at',)

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'date', 'merchant', 'amount', 'currency', 'category', 'payment_method', 'description', 'created_at')
    search_fields = ('merchant', 'description')
    list_filter = ('category', 'user', 'date', 'created_at')
    ordering = ('-date',)
    readonly_fields = ('total_expense_summary',)

    def total_expense_summary(self, obj=None):
        from django.utils import timezone
        from django.db.models import Sum
        now = timezone.now()
        total_expenses = Expense.objects.filter(
            date__year=now.year, date__month=now.month
        ).aggregate(total=Sum('amount'))['total'] or 0
        from django.utils.html import format_html
        return format_html(
            "<h3 style='color:#b91c1c;'>Total Expenses (This Month): <strong>{} NPR</strong></h3>",
            total_expenses
        )
    total_expense_summary.short_description = "Total Expenses (This Month)"

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'user')
    search_fields = ('name',)
    list_filter = ('user',)

@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'category', 'amount', 'currency', 'month', 'year')
    search_fields = ('user__username', 'category__name')
    list_filter = ('user', 'category', 'month', 'year')
    readonly_fields = ('dashboard_summary',)

    def dashboard_summary(self, obj=None):
        from django.utils import timezone
        from django.db.models import Sum
        from .models import MonthlyIncome, Expense, Budget
        now = timezone.now()
        monthly_income = MonthlyIncome.objects.filter(
            month=now.month, year=now.year
        ).aggregate(total=Sum('amount'))['total'] or 0
        total_budgeted = Budget.objects.aggregate(total=Sum('amount'))['total'] or 0
        total_spent = Expense.objects.filter(
            date__year=now.year, date__month=now.month
        ).aggregate(total=Sum('amount'))['total'] or 0
        remaining = monthly_income - total_spent
        from django.utils.html import format_html
        return format_html(
            "<ul>"
            "<li><strong>Monthly Income:</strong> {} NPR</li>"
            "<li><strong>Total Budgeted:</strong> {} NPR</li>"
            "<li><strong>Total Spent:</strong> {} NPR</li>"
            "<li><strong>Remaining:</strong> {} NPR</li>"
            "</ul>",
            monthly_income, total_budgeted, total_spent, remaining
        )
    dashboard_summary.short_description = "Dashboard Summary"

@admin.register(MonthlyIncome)
class MonthlyIncomeAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'month', 'year', 'created_at')
    search_fields = ('user__username',)
    list_filter = ('month', 'year')
    readonly_fields = ('summary',)

    def summary(self, obj=None):
        from django.utils import timezone
        from django.db.models import Sum
        from .models import Expense, Budget, MonthlyIncome
        now = timezone.now()
        monthly_income = MonthlyIncome.objects.filter(
            month=now.month, year=now.year
        ).aggregate(total=Sum('amount'))['total'] or 0
        total_expenses = Expense.objects.filter(
            date__year=now.year, date__month=now.month
        ).aggregate(total=Sum('amount'))['total'] or 0
        saving_rate = ((monthly_income - total_expenses) / monthly_income * 100) if monthly_income else 0
        total_budgeted = Budget.objects.aggregate(total=Sum('amount'))['total'] or 0
        budget_score = 100
        if total_budgeted:
            percent_spent = (total_expenses / total_budgeted) * 100
            budget_score = max(0, 100 - max(0, percent_spent - 100))
        from django.utils.html import format_html
        return format_html(
            "<ul>"
            "<li><strong>Total Expenses:</strong> {}</li>"
            "<li><strong>Saving Rate:</strong> {}%</li>"
            "<li><strong>Budget Score:</strong> {}</li>"
            "</ul>",
            total_expenses, round(saving_rate, 2), round(budget_score, 2)
        )
