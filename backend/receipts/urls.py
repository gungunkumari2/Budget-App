from django.urls import path
from .views import UploadReceiptView, TransactionListView, CategoryTotalsView, BudgetListView, MonthlyIncomeView, BudgetSummaryView, BudgetCategoriesView, DashboardSummaryView, DashboardTrendsView, ChatView, LoginView, RegisterView, ExpenseListView, ExpenseStatsView, CategoryListView, PaymentMethodListView, LogoutView, UserProfileView, TokenRefreshView

urlpatterns = [
    path('', UploadReceiptView.as_view(), name='upload-receipt'),
    path('transactions/', TransactionListView.as_view(), name='transaction-list'),
    path('category-totals/', CategoryTotalsView.as_view(), name='category-totals'),
    path('budgets/', BudgetListView.as_view(), name='budget-list'),
    path('monthly-income/', MonthlyIncomeView.as_view(), name='monthly-income'),
    path('budget-summary/', BudgetSummaryView.as_view(), name='budget-summary'),
    path('budget-categories/', BudgetCategoriesView.as_view(), name='budget-categories'),
    path('dashboard-summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('dashboard-trends/', DashboardTrendsView.as_view(), name='dashboard-trends'),
    path('chat/', ChatView.as_view(), name='chat'),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('expenses/', ExpenseListView.as_view(), name='expense-list'),
    path('expense-stats/', ExpenseStatsView.as_view(), name='expense-stats'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('payment-methods/', PaymentMethodListView.as_view(), name='payment-method-list'),
] 