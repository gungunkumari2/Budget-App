# Expense Receipt Scanner & Data Extractor

A comprehensive solution for automatically extracting and categorizing expense data from receipts and bills. Supports both image (JPG/PNG) and PDF formats with intelligent categorization into predefined expense categories.

## Features

- **Multi-format Support**: Handles JPG, PNG, and PDF files
- **OCR Integration**: Uses Tesseract OCR for text extraction
- **Intelligent Categorization**: Automatically categorizes items into 10 predefined categories
- **Structured Output**: Returns clean JSON/CSV data with vendor, date, amounts, and categories
- **Bulk Processing**: Process multiple files at once
- **Confidence Scoring**: Provides confidence scores for extraction quality
- **Django Integration**: Seamlessly integrates with your SmartBudget application

## Categories

The system automatically categorizes expenses into these 10 categories:

1. **Insurance** - Health, auto, home, life insurance
2. **Travel** - Hotels, flights, transportation, bookings
3. **Education** - Tuition, courses, books, training
4. **Healthcare** - Medical, dental, pharmacy, treatment
5. **Shopping** - Clothing, electronics, accessories, retail
6. **Transportation** - Gas, parking, public transit, rideshare
7. **Food & Dining** - Restaurants, cafes, takeout, delivery
8. **Groceries** - Supermarkets, food stores, produce
9. **Entertainment** - Movies, concerts, sports, fitness
10. **Utilities** - Electricity, water, internet, phone, cable

## Installation

### 1. Install System Dependencies

#### macOS:
```bash
# Install Tesseract OCR
brew install tesseract

# Install poppler (for PDF processing)
brew install poppler
```

#### Ubuntu/Debian:
```bash
# Install Tesseract OCR
sudo apt-get update
sudo apt-get install tesseract-ocr

# Install poppler-utils (for PDF processing)
sudo apt-get install poppler-utils
```

#### Windows:
1. Download and install Tesseract from: https://github.com/UB-Mannheim/tesseract/wiki
2. Download and install poppler from: http://blog.alivate.com.au/poppler-windows/
3. Add both to your system PATH

### 2. Install Python Dependencies

```bash
cd backend
pip install -r requirements_extraction.txt
```

### 3. Install spaCy English Model

```bash
python -m spacy download en_core_web_sm
```

## Usage

### 1. Command Line Usage

```bash
# Extract from a single file
python expense_extractor.py receipt.jpg --output-json results.json --output-csv results.csv

# Extract from multiple files
python expense_extractor.py receipt1.jpg receipt2.pdf --output-json results.json
```

### 2. Python API Usage

```python
from receipts.expense_extractor import ExpenseExtractor

# Initialize extractor
extractor = ExpenseExtractor()

# Extract from file
data = extractor.extract_from_file('receipt.jpg')

# Save results
extractor.save_to_json(data, 'results.json')
extractor.save_to_csv(data, 'results.csv')

# Access extracted data
print(f"Vendor: {data['vendor']}")
print(f"Total Amount: ${data['total_amount']}")
print(f"Items: {len(data['line_items'])}")

for item in data['line_items']:
    print(f"- {item['description']}: ${item['amount']} ({item['category']})")
```

### 3. Django API Endpoints

#### Single File Extraction
```bash
curl -X POST http://localhost:8000/api/upload-receipt/extract-expense/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@receipt.jpg"
```

#### Bulk File Extraction
```bash
curl -X POST http://localhost:8000/api/upload-receipt/extract-expenses-bulk/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@receipt1.jpg" \
  -F "files=@receipt2.pdf"
```

### 4. Frontend Integration

The expense extractor is integrated into your SmartBudget frontend. Users can:

1. Navigate to the expense extraction page
2. Drag and drop receipt files (JPG, PNG, PDF)
3. View extracted data with automatic categorization
4. Download results in JSON or CSV format
5. Save transactions directly to their account

## API Response Format

### Single File Response
```json
{
  "success": true,
  "message": "Expense data extracted successfully",
  "extraction_summary": {
    "vendor": "Walmart",
    "date": "2024-12-15",
    "total_amount": 34.23,
    "currency": "USD",
    "confidence_score": 0.85,
    "total_items": 8,
    "categories_found": ["Groceries"]
  },
  "transactions": [
    {
      "id": 1,
      "description": "Milk 2% 1gal",
      "amount": 3.99,
      "category": "Groceries",
      "date": "2024-12-15",
      "vendor": "Walmart"
    }
  ],
  "raw_extraction": {
    // Full extraction data including OCR text
  }
}
```

### Bulk Response
```json
{
  "success": true,
  "message": "Processed 3 files",
  "summary": {
    "total_files": 3,
    "successful_extractions": 2,
    "failed_extractions": 1,
    "total_transactions": 15,
    "total_amount": 156.78
  },
  "results": [
    {
      "file_name": "receipt1.jpg",
      "success": true,
      "transactions_count": 8,
      "total_amount": 34.23,
      "vendor": "Walmart",
      "date": "2024-12-15",
      "confidence_score": 0.85
    }
  ]
}
```

## Testing

Run the test script to verify the installation:

```bash
python test_expense_extractor.py
```

This will:
- Test the extraction logic with sample data
- Test categorization accuracy
- Generate sample output files
- Display confidence scores

## Configuration

### Customizing Categories

You can modify the categories and keywords in `expense_extractor.py`:

```python
CATEGORIES = {
    'Your Category': [
        'keyword1', 'keyword2', 'keyword3'
    ],
    # Add more categories...
}
```

### Tesseract Configuration

If Tesseract is not in your PATH, specify the path:

```python
extractor = ExpenseExtractor(tesseract_path='/usr/local/bin/tesseract')
```

### spaCy Model

For better NLP processing, ensure you have the English model installed:

```bash
python -m spacy download en_core_web_sm
```

## Troubleshooting

### Common Issues

1. **Tesseract not found**: Install Tesseract OCR and ensure it's in your PATH
2. **PDF processing fails**: Install poppler-utils (Linux) or poppler (macOS)
3. **spaCy model missing**: Run `python -m spacy download en_core_web_sm`
4. **Permission errors**: Ensure proper file permissions for uploaded files

### Performance Tips

1. **Image Quality**: Higher resolution images produce better OCR results
2. **File Size**: Large PDFs may take longer to process
3. **Batch Processing**: Use bulk extraction for multiple files
4. **Caching**: Results are cached in the database for faster retrieval

## Contributing

To improve the expense extractor:

1. Add new category keywords
2. Improve OCR preprocessing
3. Enhance categorization algorithms
4. Add support for new file formats
5. Optimize performance

## License

This expense extractor is part of the SmartBudget application and follows the same licensing terms. 