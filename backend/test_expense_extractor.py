#!/usr/bin/env python3
"""
Test script for the Expense Extractor
Demonstrates how to use the expense extraction functionality.
"""

import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budjet_backend.settings')
django.setup()

from receipts.expense_extractor import ExpenseExtractor
import json

def test_expense_extractor():
    """Test the expense extractor with sample data."""
    
    print("=== Expense Extractor Test ===\n")
    
    # Initialize the extractor
    extractor = ExpenseExtractor()
    
    # Test text (simulating OCR output from a receipt)
    sample_receipt_text = """
    WALMART STORE #1234
    RECEIPT
    
    Date: 12/15/2024
    Time: 14:30:25
    
    ITEMS:
    Milk 2% 1gal          $3.99
    Bread Whole Wheat     $2.49
    Bananas 2lb           $1.98
    Chicken Breast 1lb    $8.99
    Rice White 5lb        $4.99
    Apples Red 3lb        $5.97
    Yogurt Greek 6oz      $1.29
    Pasta Spaghetti 1lb   $1.99
    
    SUBTOTAL:             $31.69
    TAX:                  $2.54
    TOTAL:                $34.23
    
    Thank you for shopping at Walmart!
    """
    
    print("Sample Receipt Text:")
    print("-" * 50)
    print(sample_receipt_text)
    print("-" * 50)
    
    # Process the text
    print("\nProcessing text...")
    extracted_data = extractor._process_extracted_text(sample_receipt_text, "sample_receipt.txt")
    
    # Display results
    print("\n=== EXTRACTION RESULTS ===")
    print(f"Vendor: {extracted_data.get('vendor', 'Unknown')}")
    print(f"Date: {extracted_data.get('date', 'Unknown')}")
    print(f"Total Amount: ${extracted_data.get('total_amount', 0):.2f}")
    print(f"Currency: {extracted_data.get('currency', 'USD')}")
    print(f"Confidence Score: {extracted_data['summary']['confidence_score']:.2f}")
    
    print(f"\nLine Items ({len(extracted_data['line_items'])}):")
    for i, item in enumerate(extracted_data['line_items'], 1):
        print(f"  {i}. {item['description']}: ${item['amount']:.2f} ({item['category']})")
    
    # Test categorization
    print("\n=== CATEGORIZATION TEST ===")
    test_items = [
        "Gasoline",
        "Movie ticket",
        "Doctor visit",
        "Hotel room",
        "Electricity bill",
        "Restaurant meal",
        "Car insurance",
        "Grocery shopping",
        "Flight ticket",
        "Internet service"
    ]
    
    for item in test_items:
        category = extractor._categorize_item(item)
        print(f"  {item} -> {category}")
    
    # Save results to JSON
    output_file = "test_extraction_results.json"
    extractor.save_to_json(extracted_data, output_file)
    print(f"\nResults saved to: {output_file}")
    
    # Save results to CSV
    output_csv = "test_extraction_results.csv"
    extractor.save_to_csv(extracted_data, output_csv)
    print(f"Results saved to: {output_csv}")
    
    print("\n=== TEST COMPLETED ===")

def test_categorization():
    """Test the categorization logic with various items."""
    
    print("\n=== CATEGORIZATION DETAILED TEST ===")
    
    extractor = ExpenseExtractor()
    
    test_cases = [
        # Insurance
        ("Health insurance premium", "Insurance"),
        ("Car insurance payment", "Insurance"),
        ("Home insurance", "Insurance"),
        
        # Travel
        ("Hotel booking", "Travel"),
        ("Flight ticket", "Travel"),
        ("Airport parking", "Travel"),
        
        # Education
        ("University tuition", "Education"),
        ("Online course", "Education"),
        ("Textbook purchase", "Education"),
        
        # Healthcare
        ("Doctor appointment", "Healthcare"),
        ("Pharmacy medicine", "Healthcare"),
        ("Dental cleaning", "Healthcare"),
        
        # Shopping
        ("New shoes", "Shopping"),
        ("Electronics store", "Shopping"),
        ("Clothing purchase", "Shopping"),
        
        # Transportation
        ("Gas station", "Transportation"),
        ("Bus fare", "Transportation"),
        ("Taxi ride", "Transportation"),
        
        # Food & Dining
        ("Restaurant dinner", "Food & Dining"),
        ("Pizza delivery", "Food & Dining"),
        ("Coffee shop", "Food & Dining"),
        
        # Groceries
        ("Supermarket shopping", "Groceries"),
        ("Fresh vegetables", "Groceries"),
        ("Milk and bread", "Groceries"),
        
        # Entertainment
        ("Movie theater", "Entertainment"),
        ("Concert tickets", "Entertainment"),
        ("Gym membership", "Entertainment"),
        
        # Utilities
        ("Electricity bill", "Utilities"),
        ("Water service", "Utilities"),
        ("Internet provider", "Utilities"),
    ]
    
    correct = 0
    total = len(test_cases)
    
    for item, expected_category in test_cases:
        predicted_category = extractor._categorize_item(item)
        is_correct = predicted_category == expected_category
        if is_correct:
            correct += 1
        
        status = "✓" if is_correct else "✗"
        print(f"  {status} {item} -> {predicted_category} (expected: {expected_category})")
    
    accuracy = (correct / total) * 100
    print(f"\nCategorization Accuracy: {accuracy:.1f}% ({correct}/{total})")

if __name__ == "__main__":
    test_expense_extractor()
    test_categorization() 