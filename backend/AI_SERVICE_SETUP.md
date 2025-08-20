# AI Service Integration Setup Guide

## 🎯 **Overview**

Your SmartBudget AI Financial Assistant now supports multiple AI services for intelligent, ChatGPT-like responses. The system automatically chooses the best available AI service based on your configuration.

## 🤖 **Supported AI Services**

### 1. **OpenAI (GPT-4, GPT-3.5)**
- **Best for**: High-quality, accurate financial advice
- **Cost**: Pay-per-use (typically $0.002-0.03 per 1K tokens)
- **Setup**: Requires OpenAI API key

### 2. **Anthropic (Claude)**
- **Best for**: Detailed analysis and explanations
- **Cost**: Pay-per-use (typically $0.003-0.015 per 1K tokens)
- **Setup**: Requires Anthropic API key

### 3. **Hugging Face**
- **Best for**: Open-source models
- **Cost**: Free tier available, paid for premium models
- **Setup**: Requires Hugging Face API key

### 4. **OpenAI (Cloud)**
- **Best for**: High accuracy, reliable responses, production use
- **Cost**: Pay-per-use (very affordable)
- **Setup**: Requires OpenAI API key

## 🚀 **Quick Setup**

### Option 1: OpenAI (Recommended)

1. **Get OpenAI API Key**:
   - Go to [OpenAI Platform](https://platform.openai.com/)
   - Sign up/Login and create an API key
   - Copy your API key

2. **Set Environment Variable**:
   ```bash
   export OPENAI_API_KEY="sk-your-openai-api-key-here"
   ```

3. **Update Settings**:
   ```python
   # In backend/budjet_backend/settings.py
   LLM_SETTINGS = {
       'USE_MOCK': False,  # Enable real AI services
       'API_URL': 'http://localhost:11434/api',
       'DEFAULT_MODEL': 'llama2',
   }
   ```

### Option 2: Anthropic (Claude)

1. **Get Anthropic API Key**:
   - Go to [Anthropic Console](https://console.anthropic.com/)
   - Sign up/Login and create an API key
   - Copy your API key

2. **Set Environment Variable**:
   ```bash
   export ANTHROPIC_API_KEY="sk-ant-your-anthropic-api-key-here"
   ```

3. **Update Settings** (same as OpenAI)

### Option 3: OpenAI (Cloud)

1. **Get OpenAI API Key**:
   ```bash
   # Visit https://platform.openai.com/api-keys
   # Create a new API key
   ```

2. **Set Environment Variable**:
   ```bash
   export OPENAI_API_KEY="sk-your-api-key-here"
   ```

3. **Update Settings**:
   ```python
   LLM_SETTINGS = {
       'USE_MOCK': False,
       'API_URL': 'https://api.openai.com/v1',
       'DEFAULT_MODEL': 'gpt-3.5-turbo',  # or gpt-4 for better performance
   }
   ```

## 🔧 **Configuration Options**

### Environment Variables

Set these in your shell or `.env` file:

```bash
# OpenAI
export OPENAI_API_KEY="sk-your-key"

# Anthropic
export ANTHROPIC_API_KEY="sk-ant-your-key"

# Hugging Face
export HUGGINGFACE_API_KEY="hf-your-key"

# Django Settings
export DJANGO_SETTINGS_MODULE="budjet_backend.settings"
```

### Django Settings

```python
# backend/budjet_backend/settings.py

LLM_SETTINGS = {
    'USE_MOCK': False,  # Set to False to use real AI services
    'API_URL': 'https://api.openai.com/v1',  # OpenAI endpoint
    'DEFAULT_MODEL': 'gpt-3.5-turbo',  # Default model for OpenAI
}

# AI Service Configuration
# The system will automatically choose the best available service:
# 1. OpenAI (if OPENAI_API_KEY is set)
# 2. Anthropic (if ANTHROPIC_API_KEY is set)
# 3. Hugging Face (if HUGGINGFACE_API_KEY is set)
# 4. OpenAI (if API key is set)
# 5. Mock responses (if none available)
```

## 🧪 **Testing Your Setup**

Run the test script to verify your AI service configuration:

```bash
cd backend
python3 test_ai_integration.py
```

Expected output:
```
🤖 Testing AI Service Integration
==================================================
Preferred Service: openai
Use Mock: False
Available Services: OpenAI

🧪 Testing AI Responses:
----------------------------------------

1. Question: 'tell me how much i expense in entertainment'
----------------------------------------------
Response: Based on your financial data, I don't see any entertainment expenses recorded this month...
✅ Good response generated
```

## 💰 **Cost Comparison**

| Service | Cost per 1K tokens | Best For |
|---------|-------------------|----------|
| OpenAI GPT-3.5 | $0.002 | General use, cost-effective |
| OpenAI GPT-4 | $0.03 | High-quality responses |
| Anthropic Claude | $0.003-0.015 | Detailed analysis |
| Hugging Face | Free/Paid | Open-source models |
| OpenAI | Pay-per-use | High accuracy, reliable |

## 🔒 **Security & Privacy**

- **OpenAI/Anthropic**: Data sent to cloud servers
- **Hugging Face**: Data sent to cloud servers
- **OpenAI**: Data sent to OpenAI servers, but very secure and reliable

## 🎯 **Expected Behavior**

With AI services configured, your chatbot will:

✅ **Answer specific questions** like "how much i expense in entertainment"  
✅ **Provide detailed analysis** of your financial data  
✅ **Give personalized advice** based on your spending patterns  
✅ **Use natural language** like ChatGPT  
✅ **Handle any financial question** with intelligence  

## 🚨 **Troubleshooting**

### Common Issues:

1. **"Mock AI Response"**:
   - Set `USE_MOCK: False` in settings
   - Ensure API keys are set correctly

2. **"API key not configured"**:
   - Check environment variables are set
   - Restart your Django server

3. **"Connection timeout"**:
   - Check internet connection
   - Verify API endpoints are accessible

4. **OpenAI not working**:
- Ensure API key is set: `echo $OPENAI_API_KEY`
- Check API key is valid: Visit OpenAI dashboard

### Debug Commands:

```bash
# Check environment variables
echo $OPENAI_API_KEY
echo $ANTHROPIC_API_KEY

# Test OpenAI
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models

# Test Django settings
python3 manage.py shell
>>> from django.conf import settings
>>> print(settings.LLM_SETTINGS)
```

## 🎉 **Success Indicators**

Your AI integration is working when:

- ✅ Chatbot responds to specific questions
- ✅ Responses include your actual financial data
- ✅ No more generic "financial overview" responses
- ✅ Natural, conversational language
- ✅ Specific amounts and percentages mentioned

**Your SmartBudget AI Financial Assistant is now powered by real AI!** 🚀
