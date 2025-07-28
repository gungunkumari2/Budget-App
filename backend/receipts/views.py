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
                        file=file_obj,
                        description=str(row),
                        amount=row.get('amount'),
                        category=row.get('category', ''),
                        date=row.get('date')
                    )
                return Response({'type': 'csv', 'data': data})

            # Handle Excel files (optional)
            elif suffix in ['.xlsx', '.xls']:
                try:
                    df = pd.read_excel(tmp_path)
                except Exception as e:
                    return Response({'error': f'Excel parsing failed: {str(e)}'}, status=400)
                data = df.to_dict(orient="records")
                for row in data:
                    Transaction.objects.create(
                        file=file_obj,
                        description=str(row),
                        amount=row.get('amount'),
                        category=row.get('category', ''),
                        date=row.get('date')
                    )
                return Response({'type': 'excel', 'data': data})

            else:
                return Response({'error': f'Unsupported file type: {suffix}'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            tb = traceback.format_exc()
            print(f"Error in upload-receipt: {tb}")
            return Response({'error': str(e), 'traceback': tb}, status=500)
        finally:
            os.remove(tmp_path)

class TransactionListView(generics.ListAPIView):
    queryset = Transaction.objects.all().order_by('-date')
    serializer_class = TransactionSerializer

class CategoryTotalsView(APIView):
    def get(self, request):
        year = request.GET.get('year', date.today().year)
        data = (
            Transaction.objects
            .filter(date__year=year)
            .values('category')
            .annotate(total=Sum('amount'))
            .order_by('-total')
        )
        return Response(list(data))

class BudgetListView(generics.ListAPIView):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer

class MonthlyIncomeView(generics.ListAPIView):
    serializer_class = MonthlyIncomeSerializer
    def get_queryset(self):
        user = self.request.user if self.request.user.is_authenticated else None
        now = timezone.now()
        return MonthlyIncome.objects.filter(user=user, month=now.month, year=now.year) or MonthlyIncome.objects.all()

# --- Budget Summary Endpoint ---
class BudgetSummaryView(APIView):
    def get(self, request):
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

        return Response({
            "monthly_income": monthly_income,
            "total_expenses": total_expenses,
            "saving_rate": round(saving_rate, 2),
            "budget_score": round(budget_score, 2),
            "currency": "NPR"
        })

# --- Budget Categories Endpoint ---
class BudgetCategoriesView(APIView):
    def get(self, request):
        now = timezone.now()
        categories = Category.objects.all()
        data = []
        for cat in categories:
            # Budget limit for this category
            budget = Budget.objects.filter(category=cat).first()
            budget_limit = budget.amount if budget else 0

            # Amount spent in this category this month
            amount_spent = Expense.objects.filter(
                category=cat, date__year=now.year, date__month=now.month
            ).aggregate(total=Sum('amount'))['total'] or 0

            percent_spent = (amount_spent / budget_limit * 100) if budget_limit else 0
            if percent_spent < 90:
                status_str = "normal"
            elif percent_spent <= 100:
                status_str = "warning"
            else:
                status_str = "danger"

            data.append({
                "category_name": cat.name,
                "budget_limit": budget_limit,
                "amount_spent": amount_spent,
                "percent_spent": round(percent_spent, 2),
                "status": status_str,
                "icon": getattr(cat, "icon", "🍽️"),  # Placeholder
                "color": getattr(cat, "color", "#3b82f6"),  # Placeholder
            })
        return Response(data)

class DashboardSummaryView(APIView):
    def get(self, request):
        now = timezone.now()
        monthly_income = MonthlyIncome.objects.filter(
            month=now.month, year=now.year
        ).aggregate(total=Sum('amount'))['total'] or 0

        total_expenses = Expense.objects.filter(
            date__year=now.year, date__month=now.month
        ).aggregate(total=Sum('amount'))['total'] or 0

        total_budgeted = Budget.objects.aggregate(total=Sum('amount'))['total'] or 0
        total_savings = monthly_income - total_expenses
        saving_rate = ((monthly_income - total_expenses) / monthly_income * 100) if monthly_income else 0
        budget_score = 100
        if total_budgeted:
            percent_spent = (total_expenses / total_budgeted) * 100
            budget_score = max(0, 100 - max(0, percent_spent - 100))

        return Response({
            "monthly_income": monthly_income,
            "total_expenses": total_expenses,
            "total_budgeted": total_budgeted,
            "total_savings": total_savings,
            "saving_rate": round(saving_rate, 2),
            "budget_score": round(budget_score, 2),
            "currency": "NPR"
        })

from django.db.models.functions import TruncMonth
class DashboardTrendsView(APIView):
    def get(self, request):
        now = timezone.now()
        expenses = (
            Expense.objects
            .filter(date__year=now.year)
            .annotate(month=TruncMonth('date'))
            .values('month')
            .annotate(total=Sum('amount'))
            .order_by('month')
        )
        return Response(list(expenses))

class ChatView(APIView):
    def post(self, request):
        user_message = request.data.get('message', '').lower()
        
        # Get user's financial data for context
        now = timezone.now()
        monthly_income = MonthlyIncome.objects.filter(
            month=now.month, year=now.year
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        total_expenses = Expense.objects.filter(
            date__year=now.year, date__month=now.month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        categories = Category.objects.all()
        category_totals = []
        for cat in categories:
            amount_spent = Expense.objects.filter(
                category=cat, date__year=now.year, date__month=now.month
            ).aggregate(total=Sum('amount'))['total'] or 0
            if amount_spent > 0:
                category_totals.append({
                    'category': cat.name,
                    'amount': amount_spent
                })
        
        # Sort categories by amount spent
        category_totals.sort(key=lambda x: x['amount'], reverse=True)
        
        # Generate response based on user message
        response = self.generate_response(user_message, monthly_income, total_expenses, category_totals)
        
        return Response({
            'message': response,
            'timestamp': timezone.now()
        })
    
    def generate_response(self, user_message, monthly_income, total_expenses, category_totals):
        savings = monthly_income - total_expenses
        savings_rate = ((monthly_income - total_expenses) / monthly_income * 100) if monthly_income else 0
        
        if 'income' in user_message or 'salary' in user_message:
            return f"Your monthly income is NPR {monthly_income:,.2f}. This is your total earnings for the current month."
        
        elif 'expense' in user_message or 'spending' in user_message:
            return f"Your total expenses this month are NPR {total_expenses:,.2f}. This includes all your spending across different categories."
        
        elif 'savings' in user_message or 'save' in user_message:
            if savings > 0:
                return f"Great! You've saved NPR {savings:,.2f} this month, which is {savings_rate:.1f}% of your income. Keep up the good work!"
            else:
                return f"Your expenses (NPR {total_expenses:,.2f}) exceed your income (NPR {monthly_income:,.2f}) by NPR {abs(savings):,.2f}. Consider reviewing your spending habits."
        
        elif 'category' in user_message or 'categories' in user_message:
            if category_totals:
                top_category = category_totals[0]
                response = f"Your top spending categories this month:\n"
                for i, cat in enumerate(category_totals[:3], 1):
                    response += f"{i}. {cat['category']}: NPR {cat['amount']:,.2f}\n"
                return response
            else:
                return "You haven't recorded any expenses this month yet."
        
        elif 'budget' in user_message:
            if savings_rate >= 20:
                return f"Excellent! You're saving {savings_rate:.1f}% of your income, which is above the recommended 20% savings rate."
            elif savings_rate >= 10:
                return f"You're saving {savings_rate:.1f}% of your income. Consider increasing your savings to reach the recommended 20%."
            else:
                return f"Your savings rate is {savings_rate:.1f}%. Try to increase your savings to at least 20% of your income for better financial security."
        
        elif 'help' in user_message or 'what' in user_message:
            return """I can help you with:
• Your income and expenses
• Savings analysis
• Category-wise spending
• Budget recommendations
• Financial tips

Just ask me about any of these topics!"""
        
        else:
            return f"I can help you understand your finances. You have NPR {monthly_income:,.2f} income and NPR {total_expenses:,.2f} expenses this month. Ask me about your income, expenses, savings, or categories!"
