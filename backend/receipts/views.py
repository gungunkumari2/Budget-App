from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
import tempfile
import os
from PIL import Image
import pytesseract
import pandas as pd
import traceback
from rest_framework import generics
from .models import Transaction
from .serializers import TransactionSerializer

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
            if suffix in ['.jpg', '.jpeg', '.png']:
                image = Image.open(tmp_path)
                text = pytesseract.image_to_string(image)
                if easyocr_reader:
                    easyocr_text = "\n".join([line[1] for line in easyocr_reader.readtext(tmp_path)])
                    text += f"\n(EasyOCR)\n{easyocr_text}"
                # Save the extracted text as a Transaction
                transaction = Transaction.objects.create(
                    description=text.strip()
                )
                return Response({'type': 'image', 'text': text.strip(), 'transaction_id': transaction.id})
            elif suffix == '.pdf':
                if convert_from_path is None:
                    return Response({'error': 'pdf2image not installed'}, status=500)
                images = convert_from_path(tmp_path)
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
                    description=full_text
                )
                return Response({'type': 'pdf', 'text': full_text, 'transaction_id': transaction.id})
            elif suffix == '.csv':
                df = pd.read_csv(tmp_path)
                data = df.to_dict(orient="records")
                # Create a Transaction for each row
                for row in data:
                    Transaction.objects.create(
                        description=str(row),
                        amount=row.get('amount'),
                        category=row.get('category', ''),
                        date=row.get('date')
                    )
                return Response({'type': 'csv', 'data': data})
            else:
                return Response({'error': 'Unsupported file type.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            tb = traceback.format_exc()
            print(f"Error in upload-receipt: {tb}")
            return Response({'error': str(e), 'traceback': tb}, status=500)
        finally:
            os.remove(tmp_path)

class TransactionListView(generics.ListAPIView):
    queryset = Transaction.objects.all().order_by('-date')
    serializer_class = TransactionSerializer
