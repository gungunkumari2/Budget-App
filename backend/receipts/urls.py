from django.urls import path
from .views import UploadReceiptView, TransactionListView

urlpatterns = [
    path('', UploadReceiptView.as_view(), name='upload-receipt'),
    path('transactions/', TransactionListView.as_view(), name='transaction-list'),
] 