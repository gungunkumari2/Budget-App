#!/usr/bin/env python3
"""
Enhanced Expense Bill Scanner and Data Extractor for Nepali Receipts
Scans receipts/bills (images or PDFs) and extracts structured transaction data
with automatic categorization into predefined categories for Nepali context.
"""

import os
import re
import json
import csv
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import pdf2image
import spacy
from collections import defaultdict
import logging
import easyocr
import cv2
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ExpenseExtractor:
    """
    Enhanced expense extractor with Nepali currency support and local context.
    Supports both image and PDF formats with multiple OCR engines and validation.
    """
    
    # Predefined categories with Nepali context and keywords for classification
    CATEGORIES = {
        'Insurance': [
            'insurance', 'premium', 'policy', 'coverage', 'health insurance',
            'auto insurance', 'life insurance', 'home insurance', 'car insurance',
            'बीमा', 'प्रीमियम', 'पालिसी', 'स्वास्थ्य बीमा', 'जीवन बीमा'
        ],
        'Travel': [
            'hotel', 'flight', 'airline', 'booking', 'reservation', 'travel',
            'vacation', 'trip', 'lodging', 'accommodation', 'airport', 'ticket',
            'होटल', 'उडान', 'एयरलाइन', 'बुकिङ', 'यात्रा', 'टिकट'
        ],
        'Education': [
            'tuition', 'course', 'class', 'education', 'school', 'university',
            'college', 'training', 'workshop', 'seminar', 'textbook', 'student',
            'शिक्षण', 'कोर्स', 'कक्षा', 'शिक्षा', 'स्कूल', 'विश्वविद्यालय', 'कलेज'
        ],
        'Healthcare': [
            'medical', 'doctor', 'hospital', 'pharmacy', 'medicine', 'healthcare',
            'dental', 'clinic', 'prescription', 'treatment', 'therapy', 'health',
            'चिकित्सा', 'डाक्टर', 'अस्पताल', 'फार्मेसी', 'दवाई', 'स्वास्थ्य'
        ],
        'Shopping': [
            'clothing', 'shoes', 'accessories', 'electronics', 'appliances',
            'furniture', 'jewelry', 'cosmetics', 'beauty', 'fashion', 'retail',
            'लुगा', 'जुत्ता', 'सामान', 'इलेक्ट्रोनिक्स', 'फर्निचर', 'गहना'
        ],
        'Transportation': [
            'gas', 'fuel', 'parking', 'taxi', 'uber', 'lyft', 'bus', 'train',
            'subway', 'metro', 'transportation', 'fare', 'toll', 'maintenance',
            'पेट्रोल', 'डिजेल', 'पार्किङ', 'ट्याक्सी', 'बस', 'भाडा'
        ],
        'Food & Dining': [
            'restaurant', 'cafe', 'dining', 'food', 'meal', 'lunch', 'dinner',
            'breakfast', 'takeout', 'delivery', 'fast food', 'pizza', 'burger',
            'रेस्टुरेन्ट', 'क्याफे', 'खाना', 'भोजन', 'दिनको खाना', 'रातको खाना'
        ],
        'Groceries': [
            'grocery', 'supermarket', 'market', 'food store', 'produce',
            'vegetables', 'fruits', 'meat', 'dairy', 'bread', 'pantry',
            'किराना', 'सुपरमार्केट', 'बजार', 'सब्जी', 'फल', 'मासु', 'दूध'
        ],
        'Entertainment': [
            'movie', 'theater', 'concert', 'show', 'game', 'entertainment',
            'amusement', 'park', 'museum', 'gallery', 'sports', 'fitness',
            'चलचित्र', 'थिएटर', 'कन्सर्ट', 'खेल', 'मनोरञ्जन', 'फिटनेस'
        ],
        'Utilities': [
            'electricity', 'water', 'gas', 'internet', 'phone', 'cable',
            'utility', 'bill', 'service', 'electric', 'power', 'heating',
            'बिजुली', 'पानी', 'ग्यास', 'इन्टरनेट', 'फोन', 'बिल'
        ],
        'Banking & Finance': [
            'bank', 'atm', 'withdrawal', 'deposit', 'loan', 'credit',
            'debit', 'transfer', 'payment', 'banking', 'finance',
            'बैंक', 'एटिएम', 'निकासी', 'जम्मा', 'ऋण', 'क्रेडिट'
        ],
        'Government Services': [
            'government', 'tax', 'license', 'permit', 'registration',
            'passport', 'citizenship', 'voter', 'election',
            'सरकार', 'कर', 'लाइसेन्स', 'पासपोर्ट', 'नागरिकता'
        ]
    }
    
    def __init__(self, tesseract_path: Optional[str] = None):
        """
        Initialize the enhanced expense extractor for Nepali context.
        
        Args:
            tesseract_path: Path to tesseract executable (if not in PATH)
        """
        if tesseract_path:
            pytesseract.pytesseract.tesseract_cmd = tesseract_path
        
        # Try to load spaCy model for better NLP processing
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.warning("spaCy model not found. Install with: python -m spacy download en_core_web_sm")
            self.nlp = None
        
        # Initialize EasyOCR as fallback with Nepali language support
        try:
            self.easyocr_reader = easyocr.Reader(['en', 'ne'])  # English and Nepali
        except Exception as e:
            logger.warning(f"EasyOCR not available: {e}")
            self.easyocr_reader = None
    
    def extract_from_file(self, file_path: str) -> Dict[str, Any]:
        """
        Extract expense data from a file with enhanced error recovery for Nepali context.
        
        Args:
            file_path: Path to the input file
            
        Returns:
            Dictionary containing extracted expense data with quality metrics
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        file_ext = os.path.splitext(file_path)[1].lower()
        
        if file_ext in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']:
            return self._extract_from_image_with_recovery(file_path)
        elif file_ext == '.pdf':
            return self._extract_from_pdf_with_recovery(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_ext}")
    
    def _extract_from_image_with_recovery(self, image_path: str) -> Dict[str, Any]:
        """Extract text from image using multiple OCR engines with fallback for Nepali text."""
        extraction_attempts = []
        
        # Attempt 1: Standard Tesseract OCR
        try:
            image = Image.open(image_path)
            text = pytesseract.image_to_string(image)
            extraction_attempts.append({
                'engine': 'tesseract',
                'text': text,
                'confidence': self._calculate_text_confidence(text)
            })
        except Exception as e:
            logger.warning(f"Tesseract OCR failed: {e}")
        
        # Attempt 2: Enhanced image preprocessing + Tesseract
        try:
            enhanced_image = self._preprocess_image(image_path)
            text = pytesseract.image_to_string(enhanced_image)
            extraction_attempts.append({
                'engine': 'tesseract_enhanced',
                'text': text,
                'confidence': self._calculate_text_confidence(text)
            })
        except Exception as e:
            logger.warning(f"Enhanced Tesseract OCR failed: {e}")
        
        # Attempt 3: EasyOCR fallback with Nepali support
        if self.easyocr_reader:
            try:
                results = self.easyocr_reader.readtext(image_path)
                text = "\n".join([result[1] for result in results])
                extraction_attempts.append({
                    'engine': 'easyocr_nepali',
                    'text': text,
                    'confidence': self._calculate_text_confidence(text)
                })
            except Exception as e:
                logger.warning(f"EasyOCR failed: {e}")
        
        # Select best extraction result
        if not extraction_attempts:
            raise Exception("All OCR engines failed")
        
        best_attempt = max(extraction_attempts, key=lambda x: x['confidence'])
        logger.info(f"Selected {best_attempt['engine']} with confidence {best_attempt['confidence']:.2f}")
        
        return self._process_extracted_text_with_validation(best_attempt['text'], image_path, best_attempt)
    
    def _extract_from_pdf_with_recovery(self, pdf_path: str) -> Dict[str, Any]:
        """Extract text from PDF using multiple OCR engines with fallback for Nepali text."""
        try:
            # Convert PDF to images
            images = pdf2image.convert_from_path(pdf_path)
            all_text = ""
            page_results = []
            
            for i, image in enumerate(images):
                # Save image temporarily for OCR processing
                temp_image_path = f"/tmp/pdf_page_{i}.png"
                image.save(temp_image_path)
                
                try:
                    page_text = self._extract_from_image_with_recovery(temp_image_path)
                    all_text += f"\n--- Page {i+1} ---\n{page_text['raw_text']}"
                    page_results.append(page_text)
                finally:
                    # Clean up temporary file
                    if os.path.exists(temp_image_path):
                        os.unlink(temp_image_path)
            
            return self._process_extracted_text_with_validation(all_text, pdf_path, {'engine': 'pdf_multi_page'})
            
        except Exception as e:
            logger.error(f"Error extracting from PDF: {e}")
            raise
    
    def _preprocess_image(self, image_path: str) -> Image.Image:
        """Enhance image for better OCR accuracy, optimized for Nepali text."""
        try:
            # Load image
            image = cv2.imread(image_path)
            
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply noise reduction
            denoised = cv2.fastNlMeansDenoising(gray)
            
            # Apply adaptive thresholding for better text separation
            thresh = cv2.adaptiveThreshold(
                denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )
            
            # Apply morphological operations to clean up artifacts
            kernel = np.ones((1, 1), np.uint8)
            processed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
            
            # Convert back to PIL Image
            pil_image = Image.fromarray(processed)
            
            # Enhance contrast for better readability
            enhancer = ImageEnhance.Contrast(pil_image)
            enhanced = enhancer.enhance(2.0)
            
            return enhanced
            
        except Exception as e:
            logger.warning(f"Image preprocessing failed: {e}")
            return Image.open(image_path)
    
    def _calculate_text_confidence(self, text: str) -> float:
        """Calculate confidence score for extracted text with Nepali currency support."""
        if not text.strip():
            return 0.0
        
        # Check for common receipt elements including Nepali patterns
        confidence_factors = {
            'has_amount': bool(re.search(r'[रू₹]\s*\d+[,\d]*\.?\d*|\d+[,\d]*\.?\d*\s*रू|\$\d+[,\d]*\.?\d*', text)),
            'has_date': bool(re.search(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{1,2}-\d{1,2}', text)),
            'has_vendor': bool(re.search(r'[A-Z\s]{3,}|[अ-ह\s]{3,}', text)),  # English and Nepali characters
            'has_items': bool(re.search(r'\d+\s+[A-Za-z\s]+|\d+\s+[अ-ह\s]+', text)),
            'text_length': min(len(text) / 100, 1.0),  # Normalize by expected length
            'has_currency': bool(re.search(r'[रू₹\$]', text))
        }
        
        # Calculate weighted confidence
        weights = {
            'has_amount': 0.3,
            'has_date': 0.2,
            'has_vendor': 0.2,
            'has_items': 0.15,
            'text_length': 0.1,
            'has_currency': 0.05
        }
        
        confidence = sum(confidence_factors[factor] * weights[factor] for factor in confidence_factors)
        return min(confidence, 1.0)
    
    def _process_extracted_text_with_validation(self, text: str, source_file: str, ocr_info: Dict) -> Dict[str, Any]:
        """
        Process extracted text with enhanced validation and quality control for Nepali context.
        
        Args:
            text: Raw OCR text
            source_file: Source file path
            ocr_info: Information about OCR engine used
            
        Returns:
            Structured expense data with validation results
        """
        logger.info("Processing extracted text with validation...")
        
        # Clean and normalize text
        cleaned_text = self._clean_text(text)
        
        # Extract basic information
        vendor = self._extract_vendor(cleaned_text)
        date = self._extract_date(cleaned_text)
        total_amount = self._extract_total_amount(cleaned_text)
        
        # Extract line items
        line_items = self._extract_line_items(cleaned_text)
        
        # Categorize line items
        categorized_items = []
        for item in line_items:
            category = self._categorize_item(item['description'])
            item['category'] = category
            categorized_items.append(item)
        
        # Validate extracted data
        validation_results = self._validate_extraction({
            'vendor': vendor,
            'date': date,
            'total_amount': total_amount,
            'line_items': categorized_items,
            'raw_text': cleaned_text
        })
        
        # Calculate overall confidence
        overall_confidence = self._calculate_overall_confidence(
            ocr_info.get('confidence', 0.5),
            validation_results
        )
        
        return {
            'source_file': source_file,
            'extraction_date': datetime.now().isoformat(),
            'ocr_engine': ocr_info.get('engine', 'unknown'),
            'vendor': vendor,
            'date': date,
            'total_amount': total_amount,
            'currency': self._extract_currency(cleaned_text),
            'line_items': categorized_items,
            'raw_text': cleaned_text,
            'validation': validation_results,
            'summary': {
                'total_items': len(categorized_items),
                'categories_found': list(set(item['category'] for item in categorized_items)),
                'confidence_score': overall_confidence,
                'quality_score': validation_results['quality_score'],
                'needs_review': validation_results['needs_review']
            }
        }
    
    def _validate_extraction(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate extracted data and provide quality metrics for Nepali context."""
        validation_results = {
            'is_valid': True,
            'warnings': [],
            'errors': [],
            'suggestions': [],
            'quality_score': 0.0,
            'needs_review': False
        }
        
        # Validate vendor
        if not data['vendor'] or data['vendor'] == 'Unknown':
            validation_results['warnings'].append('Vendor not detected')
            validation_results['quality_score'] -= 0.2
        
        # Validate date
        if not data['date']:
            validation_results['warnings'].append('Date not detected')
            validation_results['quality_score'] -= 0.2
        
        # Validate total amount
        if not data['total_amount'] or data['total_amount'] <= 0:
            validation_results['errors'].append('Invalid or missing total amount')
            validation_results['quality_score'] -= 0.3
            validation_results['needs_review'] = True
        
        # Validate line items
        if not data['line_items']:
            validation_results['warnings'].append('No line items detected')
            validation_results['quality_score'] -= 0.2
        
        # Check for suspicious amounts (Nepali context - typical receipt amounts)
        if data['total_amount'] and data['total_amount'] > 100000:  # NPR 100,000
            validation_results['suggestions'].append('High amount detected - please verify')
        
        # Calculate quality score (0-1 scale)
        validation_results['quality_score'] = max(0.0, 1.0 + validation_results['quality_score'])
        
        # Determine if manual review is needed
        if (validation_results['quality_score'] < 0.7 or 
            len(validation_results['errors']) > 0 or
            len(validation_results['warnings']) > 2):
            validation_results['needs_review'] = True
        
        return validation_results
    
    def _calculate_overall_confidence(self, ocr_confidence: float, validation_results: Dict) -> float:
        """Calculate overall confidence score combining OCR and validation."""
        # Weight OCR confidence and validation quality
        ocr_weight = 0.6
        validation_weight = 0.4
        
        overall_confidence = (
            ocr_confidence * ocr_weight + 
            validation_results['quality_score'] * validation_weight
        )
        
        return min(overall_confidence, 1.0)
    
    def _clean_text(self, text: str) -> str:
        """Enhanced text cleaning with better OCR artifact removal for Nepali text."""
        # Remove extra whitespace and normalize
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Remove common OCR artifacts while preserving Nepali characters
        text = re.sub(r'[^\w\s\.\,\$\-\+\/\@\#\&\*\(\)\[\]\{\}\u0900-\u097F]', ' ', text)
        
        # Fix common OCR mistakes for Nepali numbers
        text = re.sub(r'[0O]', '0', text)  # Replace O with 0 in numbers
        text = re.sub(r'[1l]', '1', text)  # Replace l with 1 in numbers
        
        return text
    
    def _extract_vendor(self, text: str) -> Optional[str]:
        """Enhanced vendor extraction with support for Nepali business names."""
        # Look for common vendor patterns including Nepali text
        vendor_patterns = [
            r'(?:STORE|VENDOR|MERCHANT|FROM|AT|दोकान|स्टोर)\s*:?\s*([A-Z\s\u0900-\u097F]{3,})',
            r'^([A-Z][A-Z\s\u0900-\u097F]{3,})\s*$',  # Line with only vendor name
            r'([A-Z][A-Z\s\u0900-\u097F]{3,})\s*(?:INC|LLC|LTD|CORP|CO|प्रा\.लि\.|लि\.)',  # Vendor with company suffix
            r'(?:RECEIPT FROM|BILL FROM|बिल बाट)\s*:?\s*([A-Z\s\u0900-\u097F]{3,})',
        ]
        
        for pattern in vendor_patterns:
            match = re.search(pattern, text, re.MULTILINE)
            if match:
                vendor = match.group(1).strip()
                if len(vendor) > 2:  # Minimum vendor name length
                    return vendor
        
        return None
    
    def _extract_date(self, text: str) -> Optional[str]:
        """Enhanced date extraction with multiple formats including Nepali calendar."""
        date_patterns = [
            r'(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})',  # MM/DD/YYYY or DD/MM/YYYY
            r'(\d{4})-(\d{1,2})-(\d{1,2})',  # YYYY-MM-DD
            r'(\d{1,2})\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{2,4})',  # DD MMM YYYY
            r'(\d{1,2})\s+(?:बैशाख|जेठ|असार|श्रावण|भदौ|असोज|कार्तिक|मंसिर|पुष|माघ|फाल्गुन|चैत)\s+(\d{2,4})',  # Nepali months
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text)
            if match:
                try:
                    if len(match.groups()) == 3:
                        if len(match.group(3)) == 2:  # YY format
                            year = '20' + match.group(3)
                        else:
                            year = match.group(3)
                        
                        month = match.group(1) if len(match.group(1)) <= 2 else match.group(2)
                        day = match.group(2) if len(match.group(1)) <= 2 else match.group(1)
                        
                        return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
                except:
                    continue
        
        return None
    
    def _extract_total_amount(self, text: str) -> Optional[float]:
        """Enhanced total amount extraction with Nepali currency support."""
        # Look for total amount patterns including Nepali currency
        total_patterns = [
            r'(?:TOTAL|GRAND TOTAL|AMOUNT DUE|BALANCE|कुल|जम्मा)\s*:?\s*[रू₹\$]?\s*(\d+[,\d]*\.?\d*)',
            r'[रू₹\$]\s*(\d+[,\d]*\.?\d*)\s*(?:TOTAL|DUE|कुल)',
            r'(?:TOTAL|GRAND TOTAL|कुल)\s*[रू₹\$]?\s*(\d+[,\d]*\.?\d*)',
            r'[रू₹\$]\s*(\d+[,\d]*\.?\d*)\s*$',  # Amount at end of line
        ]
        
        for pattern in total_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    amount_str = match.group(1).replace(',', '')
                    amount = float(amount_str)
                    if amount > 0:
                        return amount
                except ValueError:
                    continue
        
        return None
    
    def _extract_line_items(self, text: str) -> List[Dict[str, Any]]:
        """Enhanced line item extraction with support for Nepali text."""
        line_items = []
        
        # Split text into lines
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Look for line item patterns including Nepali text
            item_patterns = [
                r'(\d+)\s+(.+?)\s+[रू₹\$]?\s*(\d+[,\d]*\.?\d*)',  # Qty Description Amount
                r'(.+?)\s+[रू₹\$]?\s*(\d+[,\d]*\.?\d*)',  # Description Amount
                r'(\d+)\s+(.+?)\s+(\d+[,\d]*\.?\d*)',  # Qty Description Amount (no currency)
            ]
            
            for pattern in item_patterns:
                match = re.search(pattern, line)
                if match:
                    try:
                        if len(match.groups()) == 3:
                            qty = int(match.group(1))
                            description = match.group(2).strip()
                            amount_str = match.group(3).replace(',', '')
                            amount = float(amount_str)
                        else:
                            qty = 1
                            description = match.group(1).strip()
                            amount_str = match.group(2).replace(',', '')
                            amount = float(amount_str)
                        
                        # Skip if description is too short or amount is invalid
                        if len(description) < 2 or amount <= 0:
                            continue
                        
                        line_items.append({
                            'quantity': qty,
                            'description': description,
                            'amount': amount
                        })
                        break
                    except ValueError:
                        continue
        
        return line_items
    
    def _categorize_item(self, description: str) -> str:
        """Enhanced categorization with fuzzy matching for Nepali context."""
        description_lower = description.lower()
        
        # Calculate category scores
        category_scores = {}
        for category, keywords in self.CATEGORIES.items():
            score = 0
            for keyword in keywords:
                if keyword.lower() in description_lower:
                    score += 1
            category_scores[category] = score
        
        # Return category with highest score
        if category_scores:
            best_category = max(category_scores.items(), key=lambda x: x[1])
            if best_category[1] > 0:
                return best_category[0]
        
        return 'Uncategorized'
    
    def _extract_currency(self, text: str) -> str:
        """Extract currency from text with Nepali currency support."""
        currency_patterns = {
            r'[रू₹]': 'NPR',  # Nepali Rupees
            r'[\$]': 'USD',   # US Dollars
            r'[\€]': 'EUR',   # Euros
            r'[\£]': 'GBP',   # British Pounds
            r'[\¥]': 'JPY',   # Japanese Yen
        }
        
        for pattern, currency in currency_patterns.items():
            if re.search(pattern, text):
                return currency
        
        return 'NPR'  # Default to Nepali Rupees for Nepali context
    
    def save_to_json(self, data: Dict[str, Any], output_path: str):
        """Save extracted data to JSON file."""
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        logger.info(f"Data saved to JSON: {output_path}")
    
    def save_to_csv(self, data: Dict[str, Any], output_path: str):
        """Save extracted data to CSV file."""
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            
            # Write header
            writer.writerow(['Vendor', 'Date', 'Total Amount', 'Currency', 'Category', 'Description', 'Amount'])
            
            # Write line items
            for item in data['line_items']:
                writer.writerow([
                    data.get('vendor', ''),
                    data.get('date', ''),
                    data.get('total_amount', ''),
                    data.get('currency', ''),
                    item.get('category', ''),
                    item.get('description', ''),
                    item.get('amount', '')
                ])
        
        logger.info(f"Data saved to CSV: {output_path}")

def main():
    """Main function for command-line usage."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Enhanced expense data extraction from Nepali receipts and bills')
    parser.add_argument('input_file', help='Path to input file (image or PDF)')
    parser.add_argument('--output-json', help='Output JSON file path')
    parser.add_argument('--output-csv', help='Output CSV file path')
    parser.add_argument('--tesseract-path', help='Path to tesseract executable')
    
    args = parser.parse_args()
    
    try:
        # Initialize extractor
        extractor = ExpenseExtractor(tesseract_path=args.tesseract_path)
        
        # Extract data
        print(f"Processing file: {args.input_file}")
        data = extractor.extract_from_file(args.input_file)
        
        # Print results
        print("\n=== ENHANCED EXTRACTION RESULTS (Nepali Context) ===")
        print(f"OCR Engine: {data.get('ocr_engine', 'unknown')}")
        print(f"Vendor: {data.get('vendor', 'Unknown')}")
        print(f"Date: {data.get('date', 'Unknown')}")
        print(f"Total Amount: {data.get('currency', 'NPR')} {data.get('total_amount', 0):.2f}")
        print(f"Currency: {data.get('currency', 'NPR')}")
        print(f"Confidence: {data['summary']['confidence_score']:.2f}")
        print(f"Quality Score: {data['summary']['quality_score']:.2f}")
        print(f"Needs Review: {data['summary']['needs_review']}")
        
        if data['validation']['warnings']:
            print(f"\nWarnings: {', '.join(data['validation']['warnings'])}")
        
        if data['validation']['errors']:
            print(f"Errors: {', '.join(data['validation']['errors'])}")
        
        print(f"\nLine Items ({len(data['line_items'])}):")
        for item in data['line_items']:
            print(f"  - {item['description']}: {data.get('currency', 'NPR')} {item['amount']:.2f} ({item['category']})")
        
        # Save outputs
        if args.output_json:
            extractor.save_to_json(data, args.output_json)
        
        if args.output_csv:
            extractor.save_to_csv(data, args.output_csv)
        
        # Save default outputs if none specified
        if not args.output_json and not args.output_csv:
            base_name = os.path.splitext(args.input_file)[0]
            extractor.save_to_json(data, f"{base_name}_extracted.json")
            extractor.save_to_csv(data, f"{base_name}_extracted.csv")
        
    except Exception as e:
        logger.error(f"Error processing file: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main()) 