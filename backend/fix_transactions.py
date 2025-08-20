#!/usr/bin/env python3
"""
Fix transaction user associations and test API
"""

import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budjet_backend.settings')
django.setup()

from django.contrib.auth.models import User
from receipts.models import Transaction
import requests

def fix_transactions():
    """Fix transaction user associations"""
    
    print("=== Fixing Transaction User Associations ===")
    
    # Get Bhumi user
    try:
        user = User.objects.get(email='jaiswalbhumi89@gmail.com')
        print(f"Found user: {user.username} (ID: {user.id})")
    except User.DoesNotExist:
        print("❌ Bhumi user not found!")
        return
    
    # Check current state
    transactions_with_user = Transaction.objects.filter(user=user)
    transactions_without_user = Transaction.objects.filter(user__isnull=True)
    
    print(f"Transactions with user: {transactions_with_user.count()}")
    print(f"Transactions without user: {transactions_without_user.count()}")
    
    # Assign orphaned transactions to Bhumi if they don't have a user
    if transactions_without_user.exists():
        print("Assigning orphaned transactions to Bhumi...")
        updated_count = transactions_without_user.update(user=user)
        print(f"Updated {updated_count} transactions")
    
    # Final check
    final_transactions = Transaction.objects.filter(user=user)
    print(f"Final transactions for Bhumi: {final_transactions.count()}")
    
    return user

def test_api_with_auth(user):
    """Test API with authentication"""
    
    print("\n=== Testing API with Authentication ===")
    
    # Get authentication token
    try:
        login_response = requests.post(
            'http://localhost:8000/api/upload-receipt/login/',
            json={
                'email': 'jaiswalbhumi89@gmail.com',
                'password': 'testpass123'
            }
        )
        
        if login_response.status_code == 200:
            token_data = login_response.json()
            access_token = token_data['access']
            print("✅ Login successful")
            print(f"Token: {access_token[:50]}...")
            
            # Test transactions API
            headers = {'Authorization': f'Bearer {access_token}'}
            transactions_response = requests.get(
                'http://localhost:8000/api/upload-receipt/transactions/',
                headers=headers
            )
            
            if transactions_response.status_code == 200:
                transactions_data = transactions_response.json()
                print(f"✅ Transactions API successful")
                print(f"Found {len(transactions_data)} transactions")
                
                # Show sample transactions
                for i, transaction in enumerate(transactions_data[:3], 1):
                    print(f"  {i}. {transaction['description']}: ${transaction['amount']} ({transaction['category']})")
                
                return True
            else:
                print(f"❌ Transactions API failed: {transactions_response.status_code}")
                print(f"Response: {transactions_response.text}")
                return False
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ API test failed: {e}")
        return False

def test_frontend_ready():
    """Test if frontend is ready"""
    
    print("\n=== Testing Frontend Readiness ===")
    
    # Test if frontend is accessible (check multiple ports)
    frontend_ports = [8081, 8082, 8083, 5173]
    for port in frontend_ports:
        try:
            frontend_response = requests.get(f'http://localhost:{port}', timeout=3)
            if frontend_response.status_code == 200:
                print(f"✅ Frontend is accessible on port {port}")
                return True
        except Exception:
            continue
    print("❌ Frontend not accessible on any common port")
    return False

def main():
    """Main function"""
    
    print("🔧 Fixing Bhumi's Data Issues")
    print("=" * 50)
    
    # Fix transactions
    user = fix_transactions()
    
    # Test API
    api_success = test_api_with_auth(user)
    
    # Test frontend
    frontend_ready = test_frontend_ready()
    
    # Summary
    print("\n" + "=" * 50)
    print("📋 SUMMARY")
    print("=" * 50)
    
    if api_success:
        print("✅ Backend API is working correctly")
        print("✅ Bhumi has transactions in the database")
        print("✅ Authentication is working")
    else:
        print("❌ Backend API has issues")
    
    if frontend_ready:
        print("✅ Frontend is accessible")
    else:
        print("❌ Frontend is not accessible")
    
    if api_success and frontend_ready:
        print("\n🎉 Everything looks good!")
        print("The issue is likely in the frontend authentication flow.")
        print("Try logging in again in the frontend.")
    else:
        print("\n🔧 Some issues need to be fixed.")
    
    print("\n📝 Next Steps:")
    print("1. Make sure both servers are running:")
    print("   - Backend: python3 manage.py runserver 8000")
    print("   - Frontend: npm run dev")
    print("2. Go to http://localhost:8083/signin")
    print("3. Login with: jaiswalbhumi89@gmail.com / testpass123")
    print("4. Check if data appears in the dashboard")

if __name__ == '__main__':
    main() 