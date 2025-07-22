from django.contrib import admin
from .models import Transaction, Expense, Category, PaymentMethod, Budget

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
