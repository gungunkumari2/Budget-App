from django.urls import path
from .views import UploadReceiptView

urlpatterns = [
    path('', UploadReceiptView.as_view(), name='upload-receipt'),
] 