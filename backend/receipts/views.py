from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
import tempfile
import os
from PIL import Image, UnidentifiedImageError
import pytesseract
import pandas as pd
import traceback
from rest_framework import generics
from .models import Budget, Category, Expense, PaymentMethod, Transaction, MonthlyIncome
from .serializers import BudgetSerializer, CategorySerializer, ExpenseSerializer, PaymentMethodSerializer, TransactionSerializer, MonthlyIncomeSerializer
from django.db.models import Sum
from datetime import date
from .models import MonthlyIncome
from .serializers import MonthlyIncomeSerializer
from django.utils import timezone
from django.db import models
from django.db.models.functions import TruncMonth
from django.contrib.auth import authenticate, login as django_login, update_session_auth_hash
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters import rest_framework as filters
from .expense_extractor import ExpenseExtractor
import tempfile
import os
from datetime import datetime
import logging
from django.conf import settings

try:
    import easyocr
    easyocr_reader = easyocr.Reader(['en'])
except ImportError:
    easyocr_reader = None

try:
    from pdf2image import convert_from_path
except ImportError:
    convert_from_path = None

# Create your views here.

class UploadReceiptView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)
        suffix = os.path.splitext(file_obj.name)[1].lower()
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            for chunk in file_obj.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name
        try:
            # Handle images
            if suffix in ['.jpg', '.jpeg', '.png']:
                try:
                    image = Image.open(tmp_path)
                except UnidentifiedImageError:
                    return Response({'error': 'Uploaded file is not a valid image.'}, status=400)
                text = pytesseract.image_to_string(image)
                if easyocr_reader:
                    easyocr_text = "\n".join([line[1] for line in easyocr_reader.readtext(tmp_path)])
                    text += f"\n(EasyOCR)\n{easyocr_text}"
                transaction = Transaction.objects.create(
                    user=request.user,
                    file=file_obj,
                    description=text.strip()
                )
                return Response({'type': 'image', 'text': text.strip(), 'transaction_id': transaction.id})

            # Handle PDFs
            elif suffix == '.pdf':
                if convert_from_path is None:
                    return Response({'error': 'pdf2image not installed'}, status=500)
                try:
                    images = convert_from_path(tmp_path)
                except Exception as e:
                    return Response({'error': f'PDF conversion failed: {str(e)}'}, status=400)
                all_text = []
                for img in images:
                    text = pytesseract.image_to_string(img)
                    all_text.append(text)
                if easyocr_reader:
                    for img in images:
                        easyocr_text = "\n".join([line[1] for line in easyocr_reader.readtext(img)])
                        all_text.append(f"(EasyOCR)\n{easyocr_text}")
                full_text = "\n".join(all_text).strip()
                transaction = Transaction.objects.create(
                    user=request.user,
                    file=file_obj,
                    description=full_text
                )
                return Response({'type': 'pdf', 'text': full_text, 'transaction_id': transaction.id})

            # Handle CSVs
            elif suffix == '.csv':
                try:
                    df = pd.read_csv(tmp_path)
                except Exception as e:
                    return Response({'error': f'CSV parsing failed: {str(e)}'}, status=400)
                data = df.to_dict(orient="records")
                for row in data:
                    Transaction.objects.create(
                        user=request.user,
                        file=file_obj,
                        description=str(row),
                        amount=row.get('amount'),
                        category=row.get('category', ''),
                        date=row.get('date', date.today())
                    )
                return Response({'type': 'csv', 'message': f'Processed {len(data)} transactions from CSV'})

            else:
                return Response({'error': 'Unsupported file type. Please upload JPG, PNG, PDF, or CSV files.'}, status=400)

        except Exception as e:
            return Response({'error': f'Processing failed: {str(e)}'}, status=500)
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

class TransactionListView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).order_by('-date')

class CategoryTotalsView(APIView):
    def get(self, request):
        categories = Category.objects.all()
        category_totals = []
        for category in categories:
            total = Expense.objects.filter(category=category).aggregate(total=Sum('amount'))['total'] or 0
            category_totals.append({
                'category': category.name,
                'total': total,
                'color': category.color
            })
        return Response(category_totals)

class BudgetListView(generics.ListAPIView):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer

class MonthlyIncomeView(generics.ListAPIView):
    serializer_class = MonthlyIncomeSerializer

    def get_queryset(self):
        return MonthlyIncome.objects.filter(month=timezone.now().month, year=timezone.now().year)

class BudgetSummaryView(APIView):
    def get(self, request):
        now = timezone.now()
        monthly_income = MonthlyIncome.objects.filter(month=now.month, year=now.year).aggregate(total=Sum('amount'))['total'] or 0
        # Get expenses from both Expense and Transaction models for current month
        expense_total = Expense.objects.filter(date__year=now.year, date__month=now.month).aggregate(total=Sum('amount'))['total'] or 0
        transaction_total = Transaction.objects.filter(date__year=now.year, date__month=now.month).aggregate(total=Sum('amount'))['total'] or 0
        total_expenses = expense_total + transaction_total
        savings_rate = ((monthly_income - total_expenses) / monthly_income * 100) if monthly_income > 0 else 0
        
        return Response({
            'monthly_income': monthly_income,
            'total_expenses': total_expenses,
            'savings_rate': round(savings_rate, 2),
            'currency': 'NPR'
        })

class BudgetCategoriesView(APIView):
    def get(self, request):
        categories = Category.objects.all()
        category_data = []
        now = timezone.now()
        
        for category in categories:
            # Get expenses from both Expense and Transaction models for current month
            expense_amount = Expense.objects.filter(
                user=request.user,
                category=category, 
                date__year=now.year, 
                date__month=now.month
            ).aggregate(total=Sum('amount'))['total'] or 0
            transaction_amount = Transaction.objects.filter(
                user=request.user,
                category=category, 
                date__year=now.year, 
                date__month=now.month
            ).aggregate(total=Sum('amount'))['total'] or 0
            amount_spent = expense_amount + transaction_amount
            
            # Get budget limit from Budget model for the current user
            budget_obj = Budget.objects.filter(
                user=request.user,
                category=category,
                month=now.month,
                year=now.year
            ).first()
            budget_limit = budget_obj.amount if budget_obj else 0
            
            percentage_used = (amount_spent / budget_limit * 100) if budget_limit > 0 else 0
            
            category_data.append({
                'id': category.id,
                'name': category.name,
                'budget_limit': budget_limit,
                'amount_spent': amount_spent,
                'percentage_used': round(percentage_used, 2),
                'color': getattr(category, 'color', '#3b82f6'),  # Default color if not set
                'status': 'over' if amount_spent > budget_limit else 'under' if amount_spent < float(budget_limit) * 0.8 else 'normal'
            })
        
        return Response(category_data)

class DashboardSummaryView(APIView):
    def get(self, request):
        now = timezone.now()
        monthly_income = MonthlyIncome.objects.filter(
            user=request.user,
            month=now.month, 
            year=now.year
        ).aggregate(total=Sum('amount'))['total'] or 0
        # Get expenses from both Expense and Transaction models for current month
        expense_total = Expense.objects.filter(
            user=request.user,
            date__year=now.year, 
            date__month=now.month
        ).aggregate(total=Sum('amount'))['total'] or 0
        transaction_total = Transaction.objects.filter(
            user=request.user,
            date__year=now.year, 
            date__month=now.month
        ).aggregate(total=Sum('amount'))['total'] or 0
        total_expenses = expense_total + transaction_total
        savings_rate = ((monthly_income - total_expenses) / monthly_income * 100) if monthly_income > 0 else 0
        
        # Get recent transactions
        recent_transactions = Transaction.objects.all().order_by('-date')[:5]
        transaction_data = []
        for transaction in recent_transactions:
            transaction_data.append({
                'id': transaction.id,
                'description': transaction.description[:50] + '...' if len(transaction.description) > 50 else transaction.description,
                'amount': transaction.amount or 0,
                'date': transaction.date.strftime('%Y-%m-%d') if transaction.date else None,
                'category': transaction.category or 'Uncategorized'
            })
        
        return Response({
            'monthly_income': monthly_income,
            'total_expenses': total_expenses,
            'savings_rate': round(savings_rate, 2),
            'currency': 'NPR',
            'recent_transactions': transaction_data
        })

class DashboardTrendsView(APIView):
    def get(self, request):
        now = timezone.now()
        trends = []
        
        # Get last 6 months of data
        for i in range(6):
            month = now.month - i
            year = now.year
            if month <= 0:
                month += 12
                year -= 1
            
            monthly_income = MonthlyIncome.objects.filter(user=request.user, month=month, year=year).aggregate(total=Sum('amount'))['total'] or 0
            # Get expenses from both Expense and Transaction models for the month
            expense_total = Expense.objects.filter(user=request.user, date__year=year, date__month=month).aggregate(total=Sum('amount'))['total'] or 0
            transaction_total = Transaction.objects.filter(user=request.user, date__year=year, date__month=month).aggregate(total=Sum('amount'))['total'] or 0
            total_expenses = expense_total + transaction_total
            
            trends.append({
                'month': f"{year}-{month:02d}",
                'income': monthly_income,
                'expenses': total_expenses,
                'savings': monthly_income - total_expenses
            })
        
        return Response(trends[::-1])  # Reverse to show oldest first

class ChatView(APIView):
    def post(self, request):
        user_message = request.data.get('message', '').lower()
        now = timezone.now()
        
        # Get comprehensive financial data for complete AI knowledge
        monthly_income = MonthlyIncome.objects.filter(user=request.user, month=now.month, year=now.year).aggregate(total=Sum('amount'))['total'] or 0
        
        # Get expenses from both Expense and Transaction models
        expense_total = Expense.objects.filter(user=request.user, date__year=now.year, date__month=now.month).aggregate(total=Sum('amount'))['total'] or 0
        transaction_total = Transaction.objects.filter(user=request.user, date__year=now.year, date__month=now.month).aggregate(total=Sum('amount'))['total'] or 0
        total_expenses = expense_total + transaction_total
        
        # Calculate savings
        savings = monthly_income - total_expenses
        savings_rate = (savings / monthly_income * 100) if monthly_income > 0 else 0
        
        # Get ALL transactions for complete context
        all_transactions = Transaction.objects.filter(user=request.user).order_by('-date')[:50]  # Last 50 transactions
        transaction_details = []
        for transaction in all_transactions:
            transaction_details.append({
                'description': transaction.description,
                'amount': float(transaction.amount) if transaction.amount else 0,
                'category': transaction.category if transaction.category else 'Uncategorized',
                'date': transaction.date.strftime('%Y-%m-%d') if transaction.date else '',
                'vendor': 'Unknown'  # Transaction model doesn't have vendor field
            })
        
        # Get category spending data for current month (from both Expense and Transaction models)
        category_totals = {}
        all_category_totals_map = {}
        
        # Get expenses from Expense model
        expense_totals = Expense.objects.filter(
            user=request.user, 
            date__year=now.year, 
            date__month=now.month
        ).values('category__name').annotate(total=Sum('amount'))
        
        for expense in expense_totals:
            if expense['category__name']:
                cat_name = expense['category__name']
                category_totals[cat_name] = category_totals.get(cat_name, 0) + expense['total']
        
        # Get expenses from Transaction model
        transaction_totals = Transaction.objects.filter(
            user=request.user, 
            date__year=now.year, 
            date__month=now.month
        ).values('category').annotate(total=Sum('amount'))
        
        for transaction in transaction_totals:
            if transaction['category']:
                cat_name = transaction['category']
                category_totals[cat_name] = category_totals.get(cat_name, 0) + transaction['total']
        
        # Convert to list format and sort
        category_totals = [{'category': k, 'amount': v} for k, v in category_totals.items() if v > 0]
        category_totals.sort(key=lambda x: x['amount'], reverse=True)

        # Build ALL-TIME category totals (include categories with zero)
        # Expenses (all-time)
        all_expense_totals = Expense.objects.filter(
            user=request.user
        ).values('category__name').annotate(total=Sum('amount'))

        for expense in all_expense_totals:
            if expense['category__name']:
                cat_name = expense['category__name']
                all_category_totals_map[cat_name] = all_category_totals_map.get(cat_name, 0) + expense['total']

        # Transactions (all-time)
        all_transaction_totals = Transaction.objects.filter(
            user=request.user
        ).values('category').annotate(total=Sum('amount'))

        for transaction in all_transaction_totals:
            if transaction['category']:
                cat_name = transaction['category']
                all_category_totals_map[cat_name] = all_category_totals_map.get(cat_name, 0) + transaction['total']

        # Ensure all defined categories appear, even if zero
        all_categories_qs = Category.objects.all().values_list('name', flat=True)
        all_category_totals = [
            {
                'category': cat_name,
                'amount': all_category_totals_map.get(cat_name, 0)
            }
            for cat_name in all_categories_qs
        ]
        all_category_totals.sort(key=lambda x: x['amount'], reverse=True)
        
        # Get historical spending data for the last 12 months (full year)
        historical_spending = []
        for i in range(12):  # Last 12 months
            month = now.month - i
            year = now.year
            if month <= 0:
                month += 12
                year -= 1
            
            # Get expenses from both models for historical data
            month_expense_total = Expense.objects.filter(user=request.user, date__year=year, date__month=month).aggregate(total=Sum('amount'))['total'] or 0
            month_transaction_total = Transaction.objects.filter(user=request.user, date__year=year, date__month=month).aggregate(total=Sum('amount'))['total'] or 0
            month_expenses = month_expense_total + month_transaction_total
            month_income = MonthlyIncome.objects.filter(user=request.user, month=month, year=year).aggregate(total=Sum('amount'))['total'] or 0
            month_savings = month_income - month_expenses
            month_name = timezone.datetime(year, month, 1).strftime('%B')
            historical_spending.append({
                'month': month_name, 
                'year': year, 
                'expenses': month_expenses,
                'income': month_income,
                'savings': month_savings,
                'savings_rate': (month_savings / month_income * 100) if month_income > 0 else 0
            })
        
        # Get top spending categories for the year (from both models)
        year_categories = {}
        
        # Add expenses from Expense model
        year_expenses = Expense.objects.filter(user=request.user, date__year=now.year)
        for expense in year_expenses:
            if expense.category:
                cat_name = expense.category.name
                if cat_name in year_categories:
                    year_categories[cat_name] += expense.amount
                else:
                    year_categories[cat_name] = expense.amount
        
        # Add expenses from Transaction model
        year_transactions = Transaction.objects.filter(user=request.user, date__year=now.year)
        for transaction in year_transactions:
            if transaction.category:
                cat_name = transaction.category
                if cat_name in year_categories:
                    year_categories[cat_name] += transaction.amount or 0
                else:
                    year_categories[cat_name] = transaction.amount or 0
        
        year_category_totals = [{'category': k, 'amount': v} for k, v in year_categories.items()]
        year_category_totals.sort(key=lambda x: x['amount'], reverse=True)
        
        # Get top vendors/merchants with detailed info (from both models)
        # For Expense model
        expense_vendors = Expense.objects.filter(
            user=request.user, 
            date__year=now.year, 
            date__month=now.month
        ).values('merchant').annotate(
            total=Sum('amount'),
            count=models.Count('id'),
            avg_amount=Sum('amount') / models.Count('id')
        )
        
        # For Transaction model (using description as merchant)
        transaction_vendors = Transaction.objects.filter(
            user=request.user, 
            date__year=now.year, 
            date__month=now.month
        ).values('description').annotate(
            total=Sum('amount'),
            count=models.Count('id'),
            avg_amount=Sum('amount') / models.Count('id')
        )
        
        # Combine and sort by total
        top_vendors = list(expense_vendors) + list(transaction_vendors)
        top_vendors.sort(key=lambda x: x['total'], reverse=True)
        top_vendors = top_vendors[:10]
        
        # Get average spending by category for last 6 months
        avg_category_spending = {}
        for i in range(6):
            month = now.month - i
            year = now.year
            if month <= 0:
                month += 12
                year -= 1
            
            # Get category spending from both models
            expense_categories = Expense.objects.filter(
                user=request.user, 
                date__year=year, 
                date__month=month
            ).values('category__name').annotate(total=Sum('amount'))
            
            transaction_categories = Transaction.objects.filter(
                user=request.user, 
                date__year=year, 
                date__month=month
            ).values('category').annotate(total=Sum('amount'))
            
            # Combine category data
            month_categories = {}
            for cat in expense_categories:
                cat_name = cat['category__name']
                if cat_name in month_categories:
                    month_categories[cat_name] += cat['total']
                else:
                    month_categories[cat_name] = cat['total']
            
            for cat in transaction_categories:
                cat_name = cat['category']
                if cat_name in month_categories:
                    month_categories[cat_name] += cat['total']
                else:
                    month_categories[cat_name] = cat['total']
            
            for cat_name, total in month_categories.items():
                if cat_name not in avg_category_spending:
                    avg_category_spending[cat_name] = []
                avg_category_spending[cat_name].append(total)
        
        # Calculate averages
        for cat_name in avg_category_spending:
            avg_category_spending[cat_name] = sum(avg_category_spending[cat_name]) / len(avg_category_spending[cat_name])
        
        # Get spending trends and patterns
        spending_trends = self.analyze_spending_trends(historical_spending)
        
        # Get budget information if available
        budget_info = self.get_budget_analysis(request.user, category_totals, monthly_income)
        
        # Check for greetings and non-financial messages first
        user_message_lower = user_message.lower()
        
        # Handle greetings and non-financial messages
        if any(word == user_message_lower.strip() for word in ['hello', 'hi', 'hey', 'greetings']):
            response = "Hello! I'm your comprehensive AI financial advisor with complete knowledge of your financial data. I can help you with spending analysis, savings tracking, budget monitoring, spending trends, vendor analysis, and personalized financial advice. Ask me anything about your finances!"
        elif any(phrase in user_message_lower for phrase in ['how are you', 'how do you do', 'what\'s up']):
            response = "I'm doing well, thank you! I'm your AI financial advisor ready to help you with comprehensive financial analysis, spending insights, budget tracking, and personalized advice. What would you like to know about your finances?"
        elif any(phrase in user_message_lower for phrase in ['thanks', 'thank you', 'bye', 'goodbye']):
            response = "You're welcome! Feel free to ask me about your finances anytime. I'm here to provide comprehensive financial insights and analysis."
        else:
            # Use OpenAI AI service for financial questions
            try:
                from .openai_service import OpenAIAIService
                
                ai_service = OpenAIAIService()
                
                # Prepare financial context for AI
                financial_context = {
                    'monthly_income': monthly_income,
                    'total_expenses': total_expenses,
                    'category_totals': category_totals,
                    'all_category_totals': all_category_totals,
                    'historical_spending': historical_spending,
                    'year_category_totals': year_category_totals,
                    'top_vendors': top_vendors,
                    'avg_category_spending': avg_category_spending,
                    'transaction_details': transaction_details,
                    'spending_trends': spending_trends,
                    'budget_info': budget_info
                }
                
                response = ai_service.generate_response(user_message, financial_context)
                
            except Exception as e:
                print(f"OpenAI AI service error: {str(e)}")
                # Fallback to rule-based response if AI service fails
                response = self.generate_enhanced_response(
                    user_message, 
                    monthly_income, 
                    total_expenses, 
                    category_totals,
                    historical_spending,
                    year_category_totals,
                    top_vendors,
                    avg_category_spending,
                    transaction_details,
                    spending_trends,
                    budget_info
                )
        
        return Response({'message': response, 'timestamp': timezone.now()})
    
    def analyze_spending_trends(self, historical_spending):
        """Analyze spending trends and patterns"""
        if len(historical_spending) < 2:
            return {'trend': 'insufficient_data', 'message': 'Need more data to analyze trends'}
        
        # Calculate month-over-month changes
        recent_months = historical_spending[:3]  # Last 3 months
        avg_recent_spending = sum([m['expenses'] for m in recent_months]) / len(recent_months)
        avg_older_spending = sum([m['expenses'] for m in historical_spending[3:6]]) / 3 if len(historical_spending) >= 6 else avg_recent_spending
        
        spending_change = ((avg_recent_spending - avg_older_spending) / avg_older_spending * 100) if avg_older_spending > 0 else 0
        
        # Determine trend
        if spending_change > 10:
            trend = 'increasing'
            message = f'Your spending has increased by {abs(spending_change):.1f}% compared to previous months'
        elif spending_change < -10:
            trend = 'decreasing'
            message = f'Your spending has decreased by {abs(spending_change):.1f}% compared to previous months'
        else:
            trend = 'stable'
            message = 'Your spending has remained relatively stable'
        
        return {
            'trend': trend,
            'change_percentage': spending_change,
            'message': message,
            'avg_recent_spending': avg_recent_spending,
            'avg_older_spending': avg_older_spending
        }
    
    def get_budget_analysis(self, user, category_totals, monthly_income):
        """Get budget analysis and recommendations"""
        budget_info = {
            'has_budgets': False,
            'budget_status': [],
            'recommendations': []
        }
        
        # Check if user has set budgets
        user_budgets = Budget.objects.filter(user=user)
        if user_budgets.exists():
            budget_info['has_budgets'] = True
            
            for budget in user_budgets:
                category_name = budget.category.name if budget.category else 'Overall'
                budget_limit = budget.amount
                
                # Find actual spending for this category
                actual_spending = 0
                for cat in category_totals:
                    if cat['category'] == category_name:
                        actual_spending = cat['amount']
                        break
                
                # Calculate percentage used
                percentage_used = (actual_spending / budget_limit * 100) if budget_limit > 0 else 0
                
                # Determine status
                if percentage_used > 100:
                    status = 'over_budget'
                    message = f'You are {percentage_used - 100:.1f}% over your {category_name} budget'
                elif percentage_used > 80:
                    status = 'near_limit'
                    message = f'You are {100 - percentage_used:.1f}% away from your {category_name} budget limit'
                else:
                    status = 'under_budget'
                    message = f'You are {100 - percentage_used:.1f}% under your {category_name} budget'
                
                budget_info['budget_status'].append({
                    'category': category_name,
                    'budget_limit': budget_limit,
                    'actual_spending': actual_spending,
                    'percentage_used': percentage_used,
                    'status': status,
                    'message': message
                })
        
        # Generate recommendations
        if monthly_income > 0:
            total_spending = sum([cat['amount'] for cat in category_totals])
            savings_rate = float(((monthly_income - total_spending) / monthly_income * 100))
            
            if savings_rate < 20:
                budget_info['recommendations'].append('Consider saving at least 20% of your income')
            
            if category_totals and category_totals[0]['amount'] > float(monthly_income) * 0.3:
                budget_info['recommendations'].append(f"Your {category_totals[0]['category']} spending is over 30% of your income - consider reducing it")
        
        return budget_info
        
    def generate_ollama_response(self, user_message, monthly_income, total_expenses, category_totals, historical_spending, year_category_totals, top_vendors, avg_category_spending, transaction_details, spending_trends, budget_info):
        try:
            import requests
            
            # Create comprehensive financial context
            savings = monthly_income - total_expenses
            savings_rate = (savings / monthly_income * 100) if monthly_income > 0 else 0
            
            # Build detailed context with ALL financial information
            context = {
                'monthly_income': monthly_income,
                'total_expenses': total_expenses,
                'savings': savings,
                'savings_rate': savings_rate,
                'top_categories': category_totals[:5],
                'yearly_top_categories': year_category_totals[:5],
                'historical_spending': historical_spending,
                'top_vendors': list(top_vendors),
                'avg_category_spending': avg_category_spending,
                'recent_transactions': transaction_details[:20],  # Last 20 transactions
                'spending_trends': spending_trends,
                'budget_info': budget_info
            }
            
            # Concise and focused prompt template
            prompt = f"""You are a precise AI financial assistant. Answer ONLY what the user asks - be direct and concise.

FINANCIAL DATA:
- Income: NPR {monthly_income:,.2f}
- Expenses: NPR {total_expenses:,.2f}
- Savings: NPR {savings:,.2f} ({savings_rate:.1f}%)
- Top Categories: {', '.join([f"{cat['category']} NPR {cat['amount']:,.2f}" for cat in category_totals[:3]])}

USER QUESTION: {user_message}

INSTRUCTIONS:
1. Answer ONLY the specific question asked
2. Be direct and concise - no lengthy explanations
3. Use exact numbers from their data
4. No generic advice unless specifically requested
5. No emojis or excessive formatting
6. Focus on facts, not recommendations unless asked
7. Keep responses under 2-3 sentences unless more detail is specifically requested

RESPONSE:"""
            
            # Get LLM settings from Django settings
            llm_api_url = f"{settings.LLM_SETTINGS['API_URL']}/generate"
            llm_model = settings.LLM_SETTINGS['DEFAULT_MODEL']
            
            # Make request to LLM API
            response = requests.post(
                llm_api_url,
                json={
                    "model": llm_model,
                    "prompt": prompt,
                    "stream": False
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get('response', self.generate_enhanced_response(user_message, monthly_income, total_expenses, category_totals, historical_spending, year_category_totals, top_vendors, avg_category_spending, transaction_details, spending_trends, budget_info))
            else:
                # Fallback to rule-based response if API call fails
                return self.generate_enhanced_response(user_message, monthly_income, total_expenses, category_totals, historical_spending, year_category_totals, top_vendors, avg_category_spending, transaction_details, spending_trends, budget_info)
                
        except Exception as e:
            print(f"Error calling LLM API: {str(e)}")
            # Fallback to rule-based response if LLM fails
            return self.generate_enhanced_response(user_message, monthly_income, total_expenses, category_totals, historical_spending, year_category_totals, top_vendors, avg_category_spending, transaction_details, spending_trends, budget_info)
            
    def generate_enhanced_response(self, user_message, monthly_income, total_expenses, category_totals, historical_spending, year_category_totals, top_vendors, avg_category_spending, transaction_details, spending_trends, budget_info):
        """Enhanced rule-based response generator with comprehensive financial analysis and ChatGPT-like flexibility"""
        
        savings = monthly_income - total_expenses
        savings_rate = (savings / monthly_income * 100) if monthly_income > 0 else 0
        
        # Convert user message to lowercase for easier matching
        user_message_lower = user_message.lower()
        
        # Comprehensive financial context for any response
        financial_context = {
            'income': monthly_income,
            'expenses': total_expenses,
            'savings': savings,
            'savings_rate': savings_rate,
            'top_categories': category_totals[:3] if category_totals else [],
            'spending_trend': spending_trends.get('message', ''),
            'has_data': len(category_totals) > 0 or total_expenses > 0
        }
        
        # Concise question handling
        if any(word in user_message_lower for word in ['most', 'highest', 'top', 'spend', 'biggest']):
            if category_totals:
                top_category = category_totals[0]
                return f"{top_category['category']}: NPR {top_category['amount']:,.2f}"
            else:
                return "No expenses recorded."
        
        elif any(word in user_message_lower for word in ['least', 'lowest', 'minimum', 'smallest', 'low', 'where have i expense least']):
            if category_totals and len(category_totals) > 1:
                sorted_categories = sorted(category_totals, key=lambda x: x['amount'])
                lowest_category = sorted_categories[0]
                return f"{lowest_category['category']}: NPR {lowest_category['amount']:,.2f}"
            elif category_totals and len(category_totals) == 1:
                return f"{category_totals[0]['category']}: NPR {category_totals[0]['amount']:,.2f}"
            else:
                return "No expenses recorded."
        
        elif any(word in user_message_lower for word in ['travel', 'transport', 'transportation', 'commute']):
            travel_expenses = sum([cat['amount'] for cat in category_totals if any(word in cat['category'].lower() for word in ['travel', 'transport', 'commute', 'gas', 'fuel'])])
            if travel_expenses > 0:
                return f"Transportation: NPR {travel_expenses:,.2f}"
            else:
                return "No transportation expenses."
        
        elif any(word in user_message_lower for word in ['food', 'meal', 'restaurant', 'groceries', 'dining', 'eat']):
            food_expenses = sum([cat['amount'] for cat in category_totals if any(word in cat['category'].lower() for word in ['food', 'meal', 'restaurant', 'grocery', 'dining', 'eat'])])
            if food_expenses > 0:
                return f"Food: NPR {food_expenses:,.2f}"
            else:
                return "No food expenses."
        
        elif any(word in user_message_lower for word in ['entertainment', 'entertain', 'movie', 'cinema', 'theater', 'show', 'concert', 'game', 'hobby', 'fun']):
            entertainment_expenses = sum([cat['amount'] for cat in category_totals if any(word in cat['category'].lower() for word in ['entertainment', 'movie', 'cinema', 'theater', 'show', 'concert', 'game', 'hobby', 'fun'])])
            if entertainment_expenses > 0:
                return f"Entertainment: NPR {entertainment_expenses:,.2f}"
            else:
                return "No entertainment expenses."
        
        elif any(word in user_message_lower for word in ['shopping', 'clothes', 'clothing', 'fashion', 'apparel', 'accessories', 'retail']):
            shopping_expenses = sum([cat['amount'] for cat in category_totals if any(word in cat['category'].lower() for word in ['shopping', 'clothes', 'clothing', 'fashion', 'apparel', 'accessories', 'retail'])])
            if shopping_expenses > 0:
                return f"Shopping: NPR {shopping_expenses:,.2f}"
            else:
                return "No shopping expenses."
        
        elif any(word in user_message_lower for word in ['healthcare', 'health', 'medical', 'doctor', 'hospital', 'medicine', 'pharmacy', 'dental']):
            healthcare_expenses = sum([cat['amount'] for cat in category_totals if any(word in cat['category'].lower() for word in ['healthcare', 'health', 'medical', 'doctor', 'hospital', 'medicine', 'pharmacy', 'dental'])])
            if healthcare_expenses > 0:
                return f"Healthcare: NPR {healthcare_expenses:,.2f}"
            else:
                return "No healthcare expenses."
        
        elif any(word in user_message_lower for word in ['education', 'school', 'college', 'university', 'course', 'training', 'learning', 'study']):
            education_expenses = sum([cat['amount'] for cat in category_totals if any(word in cat['category'].lower() for word in ['education', 'school', 'college', 'university', 'course', 'training', 'learning', 'study'])])
            if education_expenses > 0:
                return f"Education: NPR {education_expenses:,.2f}"
            else:
                return "No education expenses."
        
        elif any(word in user_message_lower for word in ['insurance', 'insure', 'policy', 'coverage']):
            insurance_expenses = sum([cat['amount'] for cat in category_totals if any(word in cat['category'].lower() for word in ['insurance', 'insure', 'policy', 'coverage'])])
            if insurance_expenses > 0:
                return f"Insurance: NPR {insurance_expenses:,.2f}"
            else:
                return "No insurance expenses."
        
        elif any(word in user_message_lower for word in ['budget', 'plan', 'planning', 'financial plan', 'total budget']):
            # Check if user is asking specifically about budget amounts
            if any(word in user_message_lower for word in ['total budget', 'budget amount', 'budget total', 'how much budget']):
                if budget_info['has_budgets']:
                    # Get actual budget amounts
                    from receipts.models import Budget
                    now = timezone.now()
                    user_budgets = Budget.objects.filter(
                        user=request.user,
                        month=now.month,
                        year=now.year
                    )
                    
                    if user_budgets.exists():
                        total_budget = sum(budget.amount for budget in user_budgets)
                        return f"Budget: NPR {total_budget:,.2f}"
                    else:
                        return f"Budget: NPR {monthly_income:,.2f}"
                else:
                    return f"Budget: NPR {monthly_income:,.2f}"
            else:
                # General budget overview
                return f"Budget: NPR {monthly_income:,.2f}"
        
        elif any(word in user_message_lower for word in ['cut', 'reduce', 'save', 'saving', 'spending', 'optimize', 'minimize']):
            recommendations = budget_info['recommendations']
            rec_text = f"\n\n🎯 **Recommendations**: {', '.join(recommendations)}" if recommendations else ""
            
            if category_totals:
                suggestions = []
                if savings_rate < 20:
                    suggestions.append("aim to save at least 20% of your income")
                if category_totals[0]['amount'] > float(monthly_income) * 0.3:
                    suggestions.append(f"consider reducing spending in {category_totals[0]['category']} which is {((category_totals[0]['amount'] / float(monthly_income)) * 100):.1f}% of your income")
                
                if len(suggestions) > 0:
                    return f"To **improve your savings** (currently {savings_rate:.1f}%), I suggest:\n\n✅ {', '.join(suggestions)}\n\n💸 **Highest Spending**: {category_totals[0]['category']} at NPR {category_totals[0]['amount']:,.2f}{rec_text}\n\n💡 **Quick Wins**:\n• Review subscriptions and cancel unused ones\n• Cook more meals at home\n• Use public transport when possible\n• Set up automatic savings transfers"
                else:
                    return f"🎉 **Excellent work!** Your savings rate of {savings_rate:.1f}% is above the recommended 20%. {spending_trends['message']}\n\n💡 **Keep it up**: Continue tracking your expenses and consider investing your savings for long-term growth."
            else:
                return f"Your current savings rate is {savings_rate:.1f}%. To improve it:\n\n📝 **Start tracking**: Categorize your expenses to identify spending patterns\n💡 **Set goals**: Aim for 20% savings rate\n🎯 **Create budget**: Allocate specific amounts to each category\n\n💡 **General Tips**:\n• Track every expense for a month\n• Identify non-essential spending\n• Set up automatic savings{rec_text}"
        
        elif any(word in user_message_lower for word in ['average', 'avg', 'mean', 'typical']):
            if any(word in user_message_lower for word in ['food', 'meal', 'restaurant', 'groceries']):
                food_avg = avg_category_spending.get('Food & Dining', 0) or avg_category_spending.get('Groceries', 0)
                if food_avg > 0:
                    return f"Your **average monthly food spending** over the last 6 months is **NPR {food_avg:,.2f}**.\n\n📊 **Analysis**: This gives you a baseline to compare your current month's food spending and identify any unusual patterns."
                else:
                    return "I don't have enough data to calculate your average food spending. Start tracking your food expenses consistently to get this valuable insight."
            elif 'month' in user_message_lower:
                avg_monthly = sum([h['expenses'] for h in historical_spending]) / len(historical_spending) if historical_spending else 0
                return f"Your **average monthly spending** over the last 12 months is **NPR {avg_monthly:,.2f}**.\n\n📈 **Trend**: {spending_trends['message']}\n\n💡 **Insight**: Compare this to your current month to see if you're on track or need to adjust your spending."
            else:
                avg_6month = sum([h['expenses'] for h in historical_spending[:6]]) / 6 if len(historical_spending) >= 6 else 0
                return f"Your **average monthly spending** over the last 6 months is **NPR {avg_6month:,.2f}**.\n\n📊 **Context**: This shorter timeframe gives you a more recent picture of your spending habits."
        
        elif any(word in user_message_lower for word in ['trend', 'pattern', 'change', 'compare']):
            return f"📈 **Spending Trends**: {spending_trends['message']}\n\n📊 **Change**: Your average spending has changed by {spending_trends.get('change_percentage', 0):.1f}% compared to previous months.\n\n💡 **Analysis**: This trend helps you understand if your spending is increasing, decreasing, or staying stable over time."
        
        elif any(word in user_message_lower for word in ['transaction', 'recent', 'last', 'purchase']):
            if transaction_details:
                recent_transactions = transaction_details[:5]
                transaction_list = '\n'.join([f"• {t['description']} - NPR {t['amount']:,.2f}" for t in recent_transactions])
                return f"Your **recent transactions** include:\n\n{transaction_list}\n\n📊 **Total**: You have {len(transaction_details)} transactions recorded in your history.\n\n💡 **Tip**: Review these transactions to ensure they're all legitimate and properly categorized."
            else:
                return "You don't have any recent transactions recorded yet. Start uploading receipts or manually entering transactions to build your financial history."
        
        elif any(word in user_message_lower for word in ['vendor', 'merchant', 'store', 'shop', 'business']):
            if top_vendors:
                vendor_list = '\n'.join([f"• {vendor['merchant']} - NPR {vendor['total']:,.2f}" for vendor in top_vendors[:3]])
                return f"Your **top vendors** this month are:\n\n{vendor_list}\n\n💡 **Insight**: Understanding where you spend most can help you negotiate better deals or find alternative vendors."
            else:
                return "You don't have any vendor information recorded yet. Make sure to include merchant names when entering your expenses for better tracking."
        
        elif any(word in user_message_lower for word in ['income', 'earn', 'salary', 'wage', 'revenue']):
            return f"Your **monthly income** is **NPR {monthly_income:,.2f}**.\n\n📊 **Financial Summary**:\n• Income: NPR {monthly_income:,.2f}\n• Expenses: NPR {total_expenses:,.2f}\n• Savings: NPR {savings:,.2f} ({savings_rate:.1f}% of income)\n\n💡 **Income Analysis**: Your savings rate of {savings_rate:.1f}% {'meets' if savings_rate >= 20 else 'is below'} the recommended 20% target."
        
        elif any(word in user_message_lower for word in ['savings', 'save', 'saved', 'emergency fund']):
            return f"Savings: NPR {savings:,.2f}"
        
        elif any(word in user_message_lower for word in ['overview', 'summary', 'financial summary', 'financial health']):
            top_categories = ', '.join([f"{cat['category']} (NPR {cat['amount']:,.2f})" for cat in category_totals[:3]]) if category_totals else "No categories"
            top_vendors_list = ', '.join([f"{vendor['merchant']} (NPR {vendor['total']:,.2f})" for vendor in top_vendors[:3]]) if top_vendors else "No vendors"
            
            return f"📊 **Financial Summary**\n\n💰 **Income**: NPR {monthly_income:,.2f}\n💸 **Expenses**: NPR {total_expenses:,.2f}\n💎 **Savings**: NPR {savings:,.2f} ({savings_rate:.1f}% of income)\n\n📈 **Top Categories**: {top_categories}\n🏪 **Top Vendors**: {top_vendors_list}\n\n📈 **Trend**: {spending_trends['message']}\n\n💡 **Financial Health**: Your savings rate of {savings_rate:.1f}% {'indicates good' if savings_rate >= 20 else 'suggests room for improvement in'} financial health."
        
        elif any(word in user_message_lower for word in ['help', 'what can you do', 'capabilities', 'features']):
            return """🤖 **I'm your AI Financial Assistant!** Here's what I can help you with:

📊 **Financial Analysis**:
• Analyze your spending patterns and trends
• Review your budget performance
• Compare spending across categories
• Track your savings rate

💡 **Personalized Advice**:
• Provide savings recommendations
• Suggest budget optimizations
• Identify spending reduction opportunities
• Give financial planning tips

📈 **Data Insights**:
• Show your top spending categories
• Analyze vendor/merchant spending
• Track historical trends
• Calculate averages and patterns

🎯 **Financial Education**:
• Explain financial concepts
• Provide money management tips
• Answer questions about budgeting
• Share investment basics

💬 **Conversational Support**:
• Answer any financial questions
• Provide context-aware responses
• Give personalized recommendations
• Help with financial decision-making

Just ask me anything about your finances, and I'll provide personalized insights based on your actual data!"""
        
        else:
            # Only provide financial info if user asks a specific question
            return "I'm here to help with your finances. Ask me about your spending, budget, savings, or any financial questions!"

# Authentication Views
class LoginView(APIView):
    permission_classes = []
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        print(f"Login attempt - Email: {email}")  # Debug log
        
        if not email or not password:
            print("Missing email or password")  # Debug log
            return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Try to find user by email (since we're using email for login)
            user = User.objects.get(email=email)
            print(f"User found: {user.username}")  # Debug log
        except User.DoesNotExist:
            print(f"User not found for email: {email}")  # Debug log
            return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Authenticate user
        authenticated_user = authenticate(username=user.username, password=password)
        if authenticated_user is None:
            print(f"Authentication failed for user: {user.username}")  # Debug log
            return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
        
        print(f"Authentication successful for user: {authenticated_user.username}")  # Debug log
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(authenticated_user)
        
        response_data = {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': authenticated_user.id,
                'username': authenticated_user.username,
                'email': authenticated_user.email,
                'first_name': authenticated_user.first_name,
                'last_name': authenticated_user.last_name
            },
            'message': 'Login successful'
        }
        
        print(f"Login successful, returning response")  # Debug log
        return Response(response_data)

class RegisterView(APIView):
    permission_classes = []
    
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not username or not email or not password:
            return Response({'error': 'Username, email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create user
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )
            
            # Generate JWT tokens for the new user
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'User created successfully',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': f'Error creating user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LogoutView(APIView):
    def post(self, request):
        try:
            # Blacklist the refresh token
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Error during logout: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    def get(self, request):
        return Response({
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name
            }
        })
    
    def put(self, request):
        user = request.user
        
        # Get data from request
        username = request.data.get('username')
        email = request.data.get('email')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        
        # Validate username uniqueness if changed
        if username and username != user.username:
            if User.objects.filter(username=username).exists():
                return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
            user.username = username
        
        # Validate email uniqueness if changed
        if email and email != user.email:
            if User.objects.filter(email=email).exists():
                return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
            user.email = email
        
        # Update other fields
        user.first_name = first_name
        user.last_name = last_name
        
        try:
            user.save()
            return Response({
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                },
                'message': 'Profile updated successfully'
            })
        except Exception as e:
            return Response({'error': f'Error updating profile: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ChangePasswordView(APIView):
    def post(self, request):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        # Validate current password
        if not user.check_password(current_password):
            return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate new password
        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({'error': e.messages}, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        # Update session auth hash to keep user logged in
        update_session_auth_hash(request, user)
        
        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)

class TokenRefreshView(APIView):
    permission_classes = []
    
    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            refresh = RefreshToken(refresh_token)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            })
        except Exception as e:
            return Response({'error': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)

# Custom JWT Login View that supports email login
class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        # Check if user is trying to login with email
        email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')
        
        if email and not username:
            # Try to find user by email
            try:
                user = User.objects.get(email=email)
                request.data['username'] = user.username
            except User.DoesNotExist:
                return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
        
        return super().post(request, *args, **kwargs)

class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    
    def get_queryset(self):
        return Category.objects.all().order_by('name')

class PaymentMethodListView(generics.ListAPIView):
    serializer_class = PaymentMethodSerializer
    
    def get_queryset(self):
        return PaymentMethod.objects.all().order_by('name')

class ExpenseListView(generics.ListAPIView):
    serializer_class = ExpenseSerializer
    
    def get_queryset(self):
        queryset = Expense.objects.filter(user=self.request.user).select_related('category', 'payment_method')
        now = timezone.now()
        
        # Filter by category
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        year = self.request.query_params.get('year')
        month = self.request.query_params.get('month')
        
        # If no explicit date range provided, default to current month (or supplied month/year)
        if not start_date and not end_date:
            try:
                y = int(year) if year else now.year
                m = int(month) if month else now.month
                queryset = queryset.filter(date__year=y, date__month=m)
            except Exception:
                queryset = queryset.filter(date__year=now.year, date__month=now.month)
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        # Filter by amount range
        min_amount = self.request.query_params.get('min_amount')
        max_amount = self.request.query_params.get('max_amount')
        if min_amount:
            queryset = queryset.filter(amount__gte=min_amount)
        if max_amount:
            queryset = queryset.filter(amount__lte=max_amount)
        
        # Filter by merchant
        merchant = self.request.query_params.get('merchant')
        if merchant:
            queryset = queryset.filter(merchant__icontains=merchant)
        
        # Order by date (newest first)
        queryset = queryset.order_by('-date')

        # Optional simple pagination via query params: limit & offset
        try:
            limit = int(self.request.query_params.get('limit')) if self.request.query_params.get('limit') else None
            offset = int(self.request.query_params.get('offset', 0))
        except ValueError:
            limit = None
            offset = 0
        
        if limit is not None:
            return queryset[offset:offset+limit]
        return queryset

class ExpenseStatsView(APIView):
    def get(self, request):
        user = request.user
        now = timezone.now()
        
        # Get total expenses for current month (from both Expense and Transaction models)
        expense_total = Expense.objects.filter(
            user=user,
            date__year=now.year,
            date__month=now.month
        ).aggregate(total=Sum('amount'))['total'] or 0
        transaction_total = Transaction.objects.filter(
            user=user,
            date__year=now.year,
            date__month=now.month
        ).aggregate(total=Sum('amount'))['total'] or 0
        current_month_expenses = expense_total + transaction_total
        
        # Get expenses by category for current month
        category_expenses = Expense.objects.filter(
            user=user,
            date__year=now.year,
            date__month=now.month
        ).values('category__name').annotate(
            total=Sum('amount'),
            count=models.Count('id')
        ).order_by('-total')
        
        # Get top merchants
        top_merchants = Expense.objects.filter(
            user=user,
            date__year=now.year,
            date__month=now.month
        ).values('merchant').annotate(
            total=Sum('amount'),
            count=models.Count('id')
        ).order_by('-total')[:5]
        
        # Get recent expenses
        recent_expenses = Expense.objects.filter(user=user).select_related('category', 'payment_method').order_by('-date')[:10]
        
        return Response({
            'current_month_total': current_month_expenses,
            'category_breakdown': list(category_expenses),
            'top_merchants': list(top_merchants),
            'recent_expenses': ExpenseSerializer(recent_expenses, many=True).data
        })

class ExpenseExtractionView(APIView):
    """
    Extract structured expense data from uploaded receipts/bills with enhanced quality control.
    Supports both image and PDF formats with automatic categorization and validation.
    """
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request):
        try:
            # Check if file was uploaded
            if 'file' not in request.FILES:
                return Response(
                    {'error': 'No file uploaded'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            uploaded_file = request.FILES['file']
            
            # Validate file type
            allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
            if uploaded_file.content_type not in allowed_types:
                return Response(
                    {'error': 'Unsupported file type. Please upload JPG, PNG, or PDF files.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Save uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(uploaded_file.name)[1]) as temp_file:
                for chunk in uploaded_file.chunks():
                    temp_file.write(chunk)
                temp_file_path = temp_file.name
            
            try:
                # Initialize enhanced expense extractor
                extractor = ExpenseExtractor()
                
                # Extract data from file with enhanced processing
                extracted_data = extractor.extract_from_file(temp_file_path)
                
                # Add user information if authenticated
                if request.user.is_authenticated:
                    extracted_data['user_id'] = request.user.id
                    extracted_data['extracted_by'] = request.user.username
                
                # Create transaction records for each line item
                transactions = []
                for item in extracted_data['line_items']:
                    # Find or create category
                    category, created = Category.objects.get_or_create(
                        name=item['category'],
                        defaults={'name': item['category']}
                    )
                    
                    # Create transaction
                    transaction = Transaction.objects.create(
                        user=request.user if request.user.is_authenticated else None,
                        description=item['description'],
                        amount=item['amount'],
                        category=category,
                        date=extracted_data.get('date') or datetime.now().date(),
                        vendor=extracted_data.get('vendor', 'Unknown'),
                        source_file=uploaded_file.name
                    )
                    transactions.append({
                        'id': transaction.id,
                        'description': transaction.description,
                        'amount': float(transaction.amount),
                        'category': transaction.category.name,
                        'date': transaction.date.isoformat(),
                        'vendor': transaction.vendor
                    })
                
                # Prepare enhanced response with quality metrics
                response_data = {
                    'success': True,
                    'message': 'Expense data extracted successfully',
                    'extraction_summary': {
                        'vendor': extracted_data.get('vendor'),
                        'date': extracted_data.get('date'),
                        'total_amount': extracted_data.get('total_amount'),
                        'currency': extracted_data.get('currency'),
                        'confidence_score': extracted_data['summary']['confidence_score'],
                        'quality_score': extracted_data['summary']['quality_score'],
                        'total_items': len(transactions),
                        'categories_found': list(set(item['category'] for item in transactions)),
                        'needs_review': extracted_data['summary']['needs_review']
                    },
                    'transactions': transactions,
                    'validation': extracted_data.get('validation', {}),
                    'raw_extraction': extracted_data
                }
                
                return Response(response_data, status=status.HTTP_200_OK)
                
            finally:
                # Clean up temporary file
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                    
        except Exception as e:
            logging.error(f"Error in enhanced expense extraction: {str(e)}")
            return Response(
                {'error': f'Extraction failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class BulkExpenseExtractionView(APIView):
    """
    Extract expense data from multiple files at once with enhanced quality control.
    """
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request):
        try:
            # Check if files were uploaded
            if 'files' not in request.FILES:
                return Response(
                    {'error': 'No files uploaded'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            uploaded_files = request.FILES.getlist('files')
            
            if len(uploaded_files) == 0:
                return Response(
                    {'error': 'No files uploaded'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate file types
            allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
            for file in uploaded_files:
                if file.content_type not in allowed_types:
                    return Response(
                        {'error': f'Unsupported file type: {file.name}. Please upload JPG, PNG, or PDF files.'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            extractor = ExpenseExtractor()
            results = []
            total_transactions = 0
            total_amount = 0
            successful_extractions = 0
            failed_extractions = 0
            
            for uploaded_file in uploaded_files:
                try:
                    # Save uploaded file temporarily
                    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(uploaded_file.name)[1]) as temp_file:
                        for chunk in uploaded_file.chunks():
                            temp_file.write(chunk)
                        temp_file_path = temp_file.name
                    
                    try:
                        # Extract data from file with enhanced processing
                        extracted_data = extractor.extract_from_file(temp_file_path)
                        
                        # Add user information if authenticated
                        if request.user.is_authenticated:
                            extracted_data['user_id'] = request.user.id
                            extracted_data['extracted_by'] = request.user.username
                        
                        # Create transaction records
                        transactions = []
                        for item in extracted_data['line_items']:
                            category, created = Category.objects.get_or_create(
                                name=item['category'],
                                defaults={'name': item['category']}
                            )
                            
                            transaction = Transaction.objects.create(
                                user=request.user if request.user.is_authenticated else None,
                                description=item['description'],
                                amount=item['amount'],
                                category=category,
                                date=extracted_data.get('date') or datetime.now().date(),
                                vendor=extracted_data.get('vendor', 'Unknown'),
                                source_file=uploaded_file.name
                            )
                            transactions.append({
                                'id': transaction.id,
                                'description': transaction.description,
                                'amount': float(transaction.amount),
                                'category': transaction.category.name,
                                'date': transaction.date.isoformat(),
                                'vendor': transaction.vendor
                            })
                        
                        # Update totals
                        total_transactions += len(transactions)
                        total_amount += extracted_data.get('total_amount', 0)
                        successful_extractions += 1
                        
                        results.append({
                            'file_name': uploaded_file.name,
                            'success': True,
                            'transactions_count': len(transactions),
                            'total_amount': extracted_data.get('total_amount'),
                            'vendor': extracted_data.get('vendor'),
                            'date': extracted_data.get('date'),
                            'confidence_score': extracted_data['summary']['confidence_score'],
                            'quality_score': extracted_data['summary']['quality_score'],
                            'needs_review': extracted_data['summary']['needs_review'],
                            'ocr_engine': extracted_data.get('ocr_engine', 'unknown')
                        })
                        
                    finally:
                        # Clean up temporary file
                        if os.path.exists(temp_file_path):
                            os.unlink(temp_file_path)
                            
                except Exception as e:
                    failed_extractions += 1
                    results.append({
                        'file_name': uploaded_file.name,
                        'success': False,
                        'error': str(e)
                    })
            
            # Prepare enhanced response
            response_data = {
                'success': True,
                'message': f'Bulk extraction completed. {successful_extractions} successful, {failed_extractions} failed.',
                'summary': {
                    'total_files': len(uploaded_files),
                    'successful_extractions': successful_extractions,
                    'failed_extractions': failed_extractions,
                    'total_transactions': total_transactions,
                    'total_amount': total_amount
                },
                'results': results
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logging.error(f"Error in bulk expense extraction: {str(e)}")
            return Response(
                {'error': f'Bulk extraction failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DeleteUserDataView(APIView):
    """Delete all user data for privacy compliance"""
    
    def post(self, request):
        try:
            user = request.user
            
            # Delete all user-related data
            deleted_data = {
                'expenses': 0,
                'transactions': 0,
                'budgets': 0,
                'monthly_incomes': 0,
                'custom_categories': 0
            }
            
            # Delete expenses
            expenses_count = Expense.objects.filter(user=user).count()
            Expense.objects.filter(user=user).delete()
            deleted_data['expenses'] = expenses_count
            
            # Delete transactions
            transactions_count = Transaction.objects.filter(user=user).count()
            Transaction.objects.filter(user=user).delete()
            deleted_data['transactions'] = transactions_count
            
            # Delete budgets
            budgets_count = Budget.objects.filter(user=user).count()
            Budget.objects.filter(user=user).delete()
            deleted_data['budgets'] = budgets_count
            
            # Delete monthly incomes
            incomes_count = MonthlyIncome.objects.filter(user=user).count()
            MonthlyIncome.objects.filter(user=user).delete()
            deleted_data['monthly_incomes'] = incomes_count
            
            # Delete custom categories (user-specific categories)
            custom_categories_count = Category.objects.filter(user=user).count()
            Category.objects.filter(user=user).delete()
            deleted_data['custom_categories'] = custom_categories_count
            
            return Response({
                'message': 'All user data deleted successfully',
                'deleted_data': deleted_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Error deleting user data: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ExportUserDataView(APIView):
    """Export all user data for data portability"""
    
    def get(self, request):
        try:
            user = request.user
            
            # Gather all user data
            user_data = {
                'user_info': {
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'date_joined': user.date_joined.isoformat()
                },
                'expenses': [],
                'transactions': [],
                'budgets': [],
                'monthly_incomes': [],
                'custom_categories': []
            }
            
            # Export expenses
            expenses = Expense.objects.filter(user=user).select_related('category', 'payment_method')
            for expense in expenses:
                user_data['expenses'].append({
                    'date': expense.date.isoformat(),
                    'merchant': expense.merchant,
                    'amount': float(expense.amount),
                    'currency': expense.currency,
                    'category': expense.category.name if expense.category else None,
                    'payment_method': expense.payment_method.name if expense.payment_method else None,
                    'description': expense.description,
                    'created_at': expense.created_at.isoformat()
                })
            
            # Export transactions
            transactions = Transaction.objects.filter(user=user)
            for transaction in transactions:
                user_data['transactions'].append({
                    'description': transaction.description,
                    'amount': float(transaction.amount) if transaction.amount else None,
                    'category': transaction.category,
                    'date': transaction.date.isoformat() if transaction.date else None,
                    'created_at': transaction.created_at.isoformat()
                })
            
            # Export budgets
            budgets = Budget.objects.filter(user=user).select_related('category')
            for budget in budgets:
                user_data['budgets'].append({
                    'category': budget.category.name,
                    'amount': float(budget.amount),
                    'currency': budget.currency,
                    'month': budget.month,
                    'year': budget.year
                })
            
            # Export monthly incomes
            monthly_incomes = MonthlyIncome.objects.filter(user=user)
            for income in monthly_incomes:
                user_data['monthly_incomes'].append({
                    'amount': float(income.amount),
                    'month': income.month,
                    'year': income.year,
                    'created_at': income.created_at.isoformat()
                })
            
            # Export custom categories
            custom_categories = Category.objects.filter(user=user)
            for category in custom_categories:
                user_data['custom_categories'].append({
                    'name': category.name
                })
            
            return Response(user_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Error exporting user data: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PrivacySettingsView(APIView):
    """Manage user privacy settings"""
    
    def get(self, request):
        """Get current privacy settings"""
        try:
            user = request.user
            
            # Count user's data
            data_counts = {
                'expenses': Expense.objects.filter(user=user).count(),
                'transactions': Transaction.objects.filter(user=user).count(),
                'budgets': Budget.objects.filter(user=user).count(),
                'monthly_incomes': MonthlyIncome.objects.filter(user=user).count(),
                'custom_categories': Category.objects.filter(user=user).count()
            }
            
            return Response({
                'data_counts': data_counts,
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'account_created': user.date_joined.isoformat()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Error retrieving privacy settings: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Update privacy settings"""
        try:
            # For now, just return success - can be extended with specific privacy controls
            return Response({
                'message': 'Privacy settings updated successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Error updating privacy settings: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
