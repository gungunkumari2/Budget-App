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
from django.contrib.auth import authenticate, login as django_login
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters import rest_framework as filters

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
        total_expenses = Expense.objects.filter(date__year=now.year, date__month=now.month).aggregate(total=Sum('amount'))['total'] or 0
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
            amount_spent = Expense.objects.filter(
                user=request.user,
                category=category, 
                date__year=now.year, 
                date__month=now.month
            ).aggregate(total=Sum('amount'))['total'] or 0
            
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
        total_expenses = Expense.objects.filter(
            user=request.user,
            date__year=now.year, 
            date__month=now.month
        ).aggregate(total=Sum('amount'))['total'] or 0
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
            total_expenses = Expense.objects.filter(user=request.user, date__year=year, date__month=month).aggregate(total=Sum('amount'))['total'] or 0
            
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
        
        # Get real financial data
        monthly_income = MonthlyIncome.objects.filter(user=request.user, month=now.month, year=now.year).aggregate(total=Sum('amount'))['total'] or 0
        total_expenses = Expense.objects.filter(user=request.user, date__year=now.year, date__month=now.month).aggregate(total=Sum('amount'))['total'] or 0
        categories = Category.objects.all()
        category_totals = []
        
        for cat in categories:
            amount_spent = Expense.objects.filter(user=request.user, category=cat, date__year=now.year, date__month=now.month).aggregate(total=Sum('amount'))['total'] or 0
            if amount_spent > 0:
                category_totals.append({'category': cat.name, 'amount': amount_spent})
        
        category_totals.sort(key=lambda x: x['amount'], reverse=True)
        
        response = self.generate_response(user_message, monthly_income, total_expenses, category_totals)
        return Response({'message': response, 'timestamp': timezone.now()})

    def generate_response(self, user_message, monthly_income, total_expenses, category_totals):
        if 'income' in user_message or 'salary' in user_message or 'earn' in user_message:
            return f"Your monthly income is NPR {monthly_income:,.2f}. This is your total earnings for the current month."
        
        elif 'expense' in user_message or 'spend' in user_message or 'cost' in user_message:
            return f"Your total expenses this month are NPR {total_expenses:,.2f}. This includes all your spending across different categories."
        
        elif 'savings' in user_message or 'save' in user_message:
            savings = monthly_income - total_expenses
            savings_rate = (savings / monthly_income * 100) if monthly_income > 0 else 0
            return f"Your savings this month are NPR {savings:,.2f} ({savings_rate:.1f}% of your income). Keep up the good work!"
        
        elif 'category' in user_message or 'categories' in user_message:
            if category_totals:
                top_category = category_totals[0]
                return f"Your highest spending category is {top_category['category']} with NPR {top_category['amount']:,.2f} this month."
            else:
                return "You haven't recorded any expenses by category yet."
        
        elif 'budget' in user_message:
            return f"Your monthly budget overview: Income NPR {monthly_income:,.2f}, Expenses NPR {total_expenses:,.2f}. You have NPR {monthly_income - total_expenses:,.2f} remaining."
        
        elif 'help' in user_message or 'what' in user_message:
            return "I can help you with: income, expenses, savings, categories, and budget information. Just ask me about any of these topics!"
        
        else:
            return f"Hello! I can help you with your finances. Your current monthly income is NPR {monthly_income:,.2f} and expenses are NPR {total_expenses:,.2f}. What would you like to know more about?"

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
        
        # Filter by category
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
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
        return queryset.order_by('-date')

class ExpenseStatsView(APIView):
    def get(self, request):
        user = request.user
        now = timezone.now()
        
        # Get total expenses for current month
        current_month_expenses = Expense.objects.filter(
            user=user,
            date__year=now.year,
            date__month=now.month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
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
