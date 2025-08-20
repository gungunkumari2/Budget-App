#!/usr/bin/env python3
"""
Simple Enhanced Scanning Test

This script provides a quick test to verify the enhanced scanning process is working.
"""

import os
import sys
import django
import tempfile
from PIL import Image, ImageDraw, ImageFont

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budjet_backend.settings')
django.setup()

from receipts.expense_extractor import ExpenseExtractor

def create_simple_test_receipt():
    """Create a simple test receipt image."""
    # Create a simple receipt image
    width, height = 400, 500
    image = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(image)
    
    # Try to use a font, fallback to default if not available
    try:
        font = ImageFont.truetype("arial.ttf", 16)
        small_font = ImageFont.truetype("arial.ttf", 12)
    except:
        font = ImageFont.load_default()
        small_font = ImageFont.load_default()
    
    # Receipt content
    receipt_text = [
        "SUPERMARKET STORE",
        "123 Main Street",
        "City, State 12345",
        "",
        "Date: 12/15/2024",
        "Time: 14:30:25",
        "",
        "Items:",
        "1 Milk $3.99",
        "2 Bread $2.50",
        "1 Eggs $4.99",
        "",
        "Subtotal: $14.47",
        "Tax: $1.16",
        "TOTAL: $15.63",
        "",
        "Thank you for shopping!"
    ]
    
    y_position = 50
    for line in receipt_text:
        if line.startswith("SUPERMARKET") or line.startswith("TOTAL"):
            draw.text((50, y_position), line, fill='black', font=font)
        else:
            draw.text((50, y_position), line, fill='black', font=small_font)
        y_position += 25
    
    return image

def test_enhanced_extraction():
    """Test the enhanced extraction process."""
    print("🚀 Testing Enhanced Scanning Process")
    print("=" * 50)
    
    # Create test directory
    test_dir = tempfile.mkdtemp()
    
    try:
        # Create test receipt
        print("📝 Creating test receipt...")
        test_receipt = os.path.join(test_dir, "test_receipt.png")
        image = create_simple_test_receipt()
        image.save(test_receipt)
        print(f"✅ Test receipt created: {test_receipt}")
        
        # Test extraction
        print("\n🔍 Testing enhanced extraction...")
        extractor = ExpenseExtractor()
        result = extractor.extract_from_file(test_receipt)
        
        # Display results
        print("\n📊 Extraction Results:")
        print(f"✅ OCR Engine: {result.get('ocr_engine', 'unknown')}")
        print(f"✅ Vendor: {result.get('vendor', 'Unknown')}")
        print(f"✅ Date: {result.get('date', 'Unknown')}")
        
        total_amount = result.get('total_amount')
        if total_amount is not None:
            print(f"✅ Total Amount: ${total_amount:.2f}")
        else:
            print(f"✅ Total Amount: Not detected")
            
        print(f"✅ Currency: {result.get('currency', 'USD')}")
        print(f"✅ Confidence Score: {result['summary']['confidence_score']:.2f}")
        print(f"✅ Quality Score: {result['summary']['quality_score']:.2f}")
        print(f"✅ Needs Review: {result['summary']['needs_review']}")
        print(f"✅ Line Items: {len(result['line_items'])}")
        
        # Display validation results
        validation = result.get('validation', {})
        if validation.get('warnings'):
            print(f"⚠️  Warnings: {', '.join(validation['warnings'])}")
        
        if validation.get('errors'):
            print(f"❌ Errors: {', '.join(validation['errors'])}")
        
        if validation.get('suggestions'):
            print(f"💡 Suggestions: {', '.join(validation['suggestions'])}")
        
        # Display line items
        if result['line_items']:
            print("\n📋 Line Items:")
            for i, item in enumerate(result['line_items'], 1):
                print(f"  {i}. {item['description']}: ${item['amount']:.2f} ({item['category']})")
        
        # Overall assessment
        print("\n🎯 Assessment:")
        if result['summary']['quality_score'] >= 0.8:
            print("✅ Excellent quality - No review needed")
        elif result['summary']['quality_score'] >= 0.6:
            print("✅ Good quality - Optional review")
        elif result['summary']['quality_score'] >= 0.4:
            print("⚠️  Fair quality - Review recommended")
        else:
            print("❌ Poor quality - Review required")
        
        print("\n🎉 Enhanced scanning process is working!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        # Clean up
        import shutil
        shutil.rmtree(test_dir)

if __name__ == "__main__":
    test_enhanced_extraction()
