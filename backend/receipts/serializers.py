from rest_framework import serializers
from .models import Budget, Category, Expense, PaymentMethod, Transaction, MonthlyIncome

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ['id', 'name']

class ExpenseSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    payment_method = PaymentMethodSerializer(read_only=True)
    
    class Meta:
        model = Expense
        fields = [
            'id', 'user', 'date', 'merchant', 'amount', 'currency', 
            'category', 'payment_method', 'description', 'created_at'
        ]

class BudgetSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    
    class Meta:
        model = Budget
        fields = ['id', 'user', 'category', 'amount', 'currency', 'month', 'year']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'user', 'description', 'amount', 'category', 'date', 'created_at']

class MonthlyIncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyIncome
        fields = ['id', 'user', 'amount', 'currency', 'month', 'year', 'created_at'] 