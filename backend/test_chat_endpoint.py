import requests
import json

# Test the chat endpoint with the new LLM integration
def test_chat_endpoint():
    # Replace with a valid token from your application
    token = input("Enter your authentication token: ")
    
    if not token:
        print("No token provided. Please log in to the application and get a token.")
        return
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    # Test messages to send to the chat endpoint
    test_messages = [
        "How much am I spending this month?",
        "What are my top spending categories?",
        "How can I save more money?",
        "What's my income this month?",
        "Give me a summary of my finances"
    ]
    
    for message in test_messages:
        try:
            response = requests.post(
                'http://localhost:8000/api/upload-receipt/chat/',
                headers=headers,
                json={'message': message}
            )
            
            if response.status_code == 200:
                print(f"\n--- Message: {message} ---")
                print(f"Status: {response.status_code}")
                print(f"Response: {response.json()['message']}")
            else:
                print(f"\n--- Message: {message} ---")
                print(f"Error: {response.status_code}")
                print(f"Response: {response.text}")
        except Exception as e:
            print(f"\n--- Message: {message} ---")
            print(f"Exception: {str(e)}")

if __name__ == "__main__":
    test_chat_endpoint()