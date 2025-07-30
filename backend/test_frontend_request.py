#!/usr/bin/env python3
import requests
import json

def test_frontend_request():
    """Test the exact same request that the frontend is making"""
    
    url = "http://localhost:8000/api/upload-receipt/login/"
    data = {
        "email": "jaiswalbhumi89@gmail.com",
        "password": "testpass123"
    }
    
    headers = {
        "Content-Type": "application/json",
        "Accept": "*/*",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    print("=== Testing Frontend-Style Request ===")
    print(f"URL: {url}")
    print(f"Headers: {headers}")
    print(f"Data: {data}")
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 200:
            print("✅ Request successful!")
            return True
        else:
            print("❌ Request failed!")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_frontend_request()
    if success:
        print("\n🎉 Frontend-style request works!")
    else:
        print("\n❌ Frontend-style request failed!") 