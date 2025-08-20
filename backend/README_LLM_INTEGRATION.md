# LLM Integration for SmartBudget AI Chat

This document explains how to set up and use the Language Model (LLM) integration for the SmartBudget AI chat feature.

## Overview

The SmartBudget AI chat feature uses a Language Model to provide intelligent responses to user queries about their financial data. The application is configured to work with Ollama, a local LLM server, but can also use a mock LLM service for testing purposes.

## Configuration

The LLM settings are configured in `budjet_backend/settings.py`:

```python
# LLM Settings
LLM_SETTINGS = {
    'USE_MOCK': True,  # Set to True to use mock responses instead of real LLM
    'API_URL': 'http://localhost:11434/api',  # Only used if USE_MOCK is False
    'DEFAULT_MODEL': 'llama2',  # Only used if USE_MOCK is False
}
```

### Settings Explanation

- `USE_MOCK`: When set to `True`, the application will use mock LLM responses instead of calling a real LLM API. This is useful for testing and development.
- `API_URL`: The URL of the LLM API server. This is only used when `USE_MOCK` is `False`.
- `DEFAULT_MODEL`: The default model to use for LLM requests. This is only used when `USE_MOCK` is `False`.

## Setting Up Ollama

To use a real LLM with the application, you need to set up Ollama:

1. Install Ollama by following the instructions at [https://ollama.ai/](https://ollama.ai/)
2. Start the Ollama server
3. Pull the llama2 model (or another model of your choice):
   ```
   ollama pull llama2
   ```
4. Update the `LLM_SETTINGS` in `settings.py` to use Ollama:
   ```python
   LLM_SETTINGS = {
       'USE_MOCK': False,  # Set to False to use real LLM
       'API_URL': 'http://localhost:11434/api',
       'DEFAULT_MODEL': 'llama2',
   }
   ```

## Testing the LLM Integration

You can test the LLM integration using the provided test script:

```
python test_chat_endpoint.py
```

This script will send test messages to the chat endpoint and display the responses.

## Mock LLM Responses

When `USE_MOCK` is set to `True`, the application will use the `generate_mock_llm_response` method in `ChatView` to generate responses. This method provides predefined responses based on keywords in the user's message.

## Fallback Mechanism

If the LLM API call fails for any reason, the application will fall back to the rule-based `generate_response` method. This ensures that users always receive a response, even if the LLM service is unavailable.

## Customizing the LLM Integration

To customize the LLM integration:

1. Modify the prompt template in the `generate_ollama_response` method in `ChatView`
2. Update the mock responses in the `generate_mock_llm_response` method
3. Add additional context data to the LLM prompt to improve response quality

## Troubleshooting

- If you encounter errors with the LLM API, check that the Ollama server is running and accessible
- If the responses are not as expected, try adjusting the prompt template or using a different LLM model
- If you're using the mock LLM service, ensure that the mock responses cover the types of queries your users are likely to make