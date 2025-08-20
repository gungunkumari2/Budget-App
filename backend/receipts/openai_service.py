#!/usr/bin/env python3
"""
OpenAI AI Service Integration
============================

OpenAI API integration for SmartBudget Financial Assistant.
Provides high-quality, accurate financial responses using GPT models.
"""

import os
import requests
import json
import time
from typing import Dict, Any, Optional
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class OpenAIAIService:
    """OpenAI API Service for SmartBudget"""
    
    def __init__(self):
        # OpenAI configuration
        self.api_key = os.getenv('OPENAI_API_KEY')
        self.api_url = 'https://api.openai.com/v1/chat/completions'
        self.model = 'gpt-3.5-turbo'  # Default model
        self.timeout = 30
        
        # Get settings from Django
        llm_settings = getattr(settings, 'LLM_SETTINGS', {})
        self.api_key = llm_settings.get('OPENAI_API_KEY', self.api_key)
        self.model = llm_settings.get('OPENAI_MODEL', self.model)
        
        # Check if OpenAI is available
        self.openai_available = self._check_openai_availability()
    
    def _check_openai_availability(self) -> bool:
        """Check if OpenAI API is available"""
        if not self.api_key:
            logger.warning("OpenAI API key not found")
            return False
        
        try:
            # Test API with a simple request
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'model': self.model,
                'messages': [
                    {'role': 'user', 'content': 'Hello'}
                ],
                'max_tokens': 10
            }
            
            response = requests.post(
                self.api_url,
                headers=headers,
                json=data,
                timeout=10
            )
            
            return response.status_code == 200
        except Exception as e:
            logger.warning(f"OpenAI not available: {str(e)}")
            return False
    
    def generate_response(self, user_message: str, financial_context: Dict[str, Any]) -> str:
        """Generate AI response using OpenAI"""
        
        if not self.openai_available:
            return self._generate_fallback_response(user_message, financial_context)
        
        try:
            messages = self._build_messages(user_message, financial_context)
            response = self._call_openai(messages)
            return response
        except Exception as e:
            logger.error(f"OpenAI error: {str(e)}")
            return self._generate_fallback_response(user_message, financial_context)
    
    def _call_openai(self, messages: list) -> str:
        """Call OpenAI API"""
        
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'model': self.model,
            'messages': messages,
            'max_tokens': 150,
            'temperature': 0.3,  # Lower temperature for more consistent responses
            'top_p': 0.9,
            'frequency_penalty': 0.1,
            'presence_penalty': 0.1
        }
        
        response = requests.post(
            self.api_url,
            headers=headers,
            json=data,
            timeout=self.timeout
        )
        
        if response.status_code == 200:
            result = response.json()
            return result['choices'][0]['message']['content'].strip()
        else:
            error_msg = f"OpenAI API error: {response.status_code}"
            try:
                error_data = response.json()
                error_msg += f" - {error_data.get('error', {}).get('message', 'Unknown error')}"
            except:
                error_msg += f" - {response.text}"
            raise Exception(error_msg)
    
    def _build_messages(self, user_message: str, financial_context: Dict[str, Any]) -> list:
        """Build messages for OpenAI API"""
        
        # Extract key financial data
        monthly_income = financial_context.get('monthly_income', 0)
        total_expenses = financial_context.get('total_expenses', 0)
        category_totals = financial_context.get('category_totals', [])
        all_category_totals = financial_context.get('all_category_totals', [])
        spending_trends = financial_context.get('spending_trends', {})
        budget_info = financial_context.get('budget_info', {})
        
        # Calculate savings
        savings = monthly_income - total_expenses
        savings_rate = (savings / monthly_income * 100) if monthly_income > 0 else 0
        
        # Build category breakdown
        category_breakdown = ""
        if all_category_totals:
            category_breakdown = "\n".join([
                f"• {cat['category']}: NPR {cat['amount']:,.2f}" 
                for cat in all_category_totals
            ])
        elif category_totals:
            category_breakdown = "\n".join([
                f"• {cat['category']}: NPR {cat['amount']:,.2f}" 
                for cat in category_totals
            ])
        
        # System message with instructions
        system_message = f"""You are a comprehensive AI financial advisor with complete access to the user's financial data. You should behave like ChatGPT - intelligent, conversational, and able to provide detailed analysis and insights.

FINANCIAL DATA:
- Income: NPR {monthly_income:,.2f}
- Expenses: NPR {total_expenses:,.2f}
- Savings: NPR {savings:,.2f} ({savings_rate:.1f}%)
- Categories: {category_breakdown if category_breakdown else "No categorized expenses"}

RESPONSE GUIDELINES:
1. Be conversational and helpful like ChatGPT
2. Provide comprehensive analysis when asked about categories, spending, or financial overview
3. Use EXACT numbers from their data - do not round or estimate
4. When asked about categories, list ALL categories with amounts
5. When asked about spending, provide detailed breakdown
6. Be intelligent and insightful - provide context and analysis
7. Use natural, conversational language
8. For greetings, be friendly and informative about your capabilities
9. For financial questions, provide thorough, helpful responses
10. IMPORTANT: When asked about "lowest" or "least" spending, find the category with the SMALLEST amount
11. IMPORTANT: When asked about "highest" or "most" spending, find the category with the LARGEST amount
12. Be comprehensive - if user asks about categories, show all categories with amounts
13. Provide insights and analysis, not just raw data

You have access to all their financial data. Be helpful, comprehensive, and intelligent in your responses."""
        
        return [
            {'role': 'system', 'content': system_message},
            {'role': 'user', 'content': user_message}
        ]
    
    def _generate_fallback_response(self, user_message: str, financial_context: Dict[str, Any]) -> str:
        """Generate a fallback response when OpenAI is not available"""
        
        # Extract basic financial data
        monthly_income = financial_context.get('monthly_income', 0)
        total_expenses = financial_context.get('total_expenses', 0)
        category_totals = financial_context.get('category_totals', [])
        
        # Simple rule-based fallback
        user_message_lower = user_message.lower()
        
        # Handle greetings
        if any(word in user_message_lower for word in ['hello', 'hi', 'hey', 'greetings']):
            return "Hello! I'm your comprehensive AI financial advisor with complete knowledge of your financial data. I can help you with spending analysis, savings tracking, budget monitoring, spending trends, vendor analysis, and personalized financial advice. Ask me anything about your finances!"
        
        # Handle category questions
        if any(word in user_message_lower for word in ['categories', 'category', 'what categories']):
            source = all_category_totals if all_category_totals else category_totals
            if source:
                category_list = "\n".join([f"• {cat['category']}: NPR {cat['amount']:,.2f}" for cat in source])
                total_all = sum([c['amount'] for c in source])
                return f"Here are all your spending categories:\n\n{category_list}\n\nTotal spending across all categories: NPR {total_all:,.2f}"
            else:
                return "You don't have any categorized expenses yet. Start tracking your spending to see category breakdowns!"
        
        # Handle spending questions
        elif any(word in user_message_lower for word in ['spending', 'spent', 'expenses', 'ok spending']):
            if category_totals:
                category_list = "\n".join([f"• {cat['category']}: NPR {cat['amount']:,.2f}" for cat in category_totals])
                return f"Here's your complete spending breakdown:\n\n{category_list}\n\nTotal spending: NPR {total_expenses:,.2f}\nIncome: NPR {monthly_income:,.2f}\nSavings: NPR {savings:,.2f}"
            else:
                return f"Your total spending is NPR {total_expenses:,.2f}. Start categorizing your expenses to get detailed breakdowns!"
        
        # Handle specific category questions
        elif 'entertainment' in user_message_lower:
            entertainment_expenses = sum([cat['amount'] for cat in category_totals if 'entertainment' in cat['category'].lower()])
            if entertainment_expenses > 0:
                return f"Entertainment spending: NPR {entertainment_expenses:,.2f}"
            else:
                return "No entertainment expenses recorded."
        
        elif any(word in user_message_lower for word in ['budget', 'show me my budget']):
            return f"Your monthly budget/income is NPR {monthly_income:,.2f}. Your current spending is NPR {total_expenses:,.2f}, leaving you with NPR {savings:,.2f} in savings."
        
        elif 'least' in user_message_lower or 'lowest' in user_message_lower:
            if category_totals and len(category_totals) > 1:
                sorted_categories = sorted(category_totals, key=lambda x: x['amount'])
                lowest_category = sorted_categories[0]
                return f"Your lowest spending category is {lowest_category['category']} with NPR {lowest_category['amount']:,.2f}."
            else:
                return "You don't have enough categorized expenses to determine the lowest spending category."
        
        elif 'biggest' in user_message_lower or 'highest' in user_message_lower:
            if category_totals:
                top_category = category_totals[0]
                return f"Your highest spending category is {top_category['category']} with NPR {top_category['amount']:,.2f}."
            else:
                return "You don't have any categorized expenses yet."
        
        elif 'income' in user_message_lower:
            return f"Your monthly income is NPR {monthly_income:,.2f}. With expenses of NPR {total_expenses:,.2f}, you're saving NPR {savings:,.2f} per month."
        
        elif 'savings' in user_message_lower:
            savings = monthly_income - total_expenses
            return f"Your current savings are NPR {savings:,.2f}. This represents a savings rate of {savings_rate:.1f}% of your income."
        
        else:
            return "I'm your comprehensive AI financial advisor! I can help you with spending analysis, category breakdowns, budget monitoring, savings tracking, and financial insights. Ask me about your categories, spending, income, savings, or any financial questions!"
    
    def get_service_status(self) -> Dict[str, Any]:
        """Get the status of OpenAI service"""
        status = {
            'service': 'OpenAI',
            'available': self.openai_available,
            'model': self.model,
            'free': False,
            'local': False
        }
        
        if self.openai_available:
            status['api_key_configured'] = bool(self.api_key)
        
        return status
    
    def change_model(self, model_name: str) -> bool:
        """Change the active model"""
        try:
            # Validate model name
            valid_models = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo-preview']
            if model_name in valid_models:
                self.model = model_name
                return True
            else:
                logger.warning(f"Model {model_name} not supported. Valid models: {valid_models}")
                return False
        except Exception as e:
            logger.error(f"Error changing model: {str(e)}")
            return False
