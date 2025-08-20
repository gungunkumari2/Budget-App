# Budget App 💰

A comprehensive budget management application with AI-powered insights, expense tracking, and financial analytics.

## 🚀 Features

- **AI Chatbot**: Get intelligent financial insights and recommendations
- **Expense Tracking**: Upload receipts and manually track expenses
- **Budget Planning**: Set and monitor monthly budgets by category
- **Financial Analytics**: Visualize spending patterns and trends
- **Receipt Scanning**: AI-powered receipt data extraction
- **Dashboard**: Real-time financial overview and statistics

## 🛠️ Tech Stack

### Backend
- **Django 5.2.3** - Python web framework
- **Django REST Framework** - API development
- **SQLite** - Database (can be changed to PostgreSQL for production)
- **OpenAI API** - AI chatbot and receipt processing
- **JWT Authentication** - Secure user authentication

### Frontend
- **React 18** - User interface
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Axios** - HTTP client

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- OpenAI API key

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Budjet_App
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env

# Run migrations
python3 manage.py migrate

# Create superuser (optional)
python3 manage.py createsuperuser

# Start the backend server
python3 manage.py runserver
```

The backend will be running at `http://localhost:8000`

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be running at `http://localhost:5173`

## 🔑 Environment Variables

### Backend (.env file in backend directory)

```bash
# backend/.env
OPENAI_API_KEY=your_openai_api_key_here
```

### Frontend (.env file in frontend directory)

```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:8000
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

## 🚀 Getting Started

1. **Register/Login**: Create an account or log in to the application
2. **Set Monthly Income**: Configure your monthly income in the dashboard
3. **Add Expenses**: Upload receipts or manually add expenses
4. **Set Budgets**: Create budget limits for different categories
5. **Chat with AI**: Ask the AI chatbot for financial insights
6. **View Analytics**: Check your spending patterns and trends

## 📱 Usage

### Dashboard
- View monthly income, expenses, and budget overview
- See spending trends and category breakdowns
- Access quick financial insights

### Expense Management
- Upload receipt images for automatic data extraction
- Manually add expenses with category classification
- View and edit expense history

### AI Chatbot
- Ask questions about your spending patterns
- Get budget recommendations
- Request financial insights and analysis

### Budget Planning
- Set monthly budgets by category
- Track budget vs actual spending
- Receive budget alerts and notifications

## 🔧 Development

### Backend Development

```bash
cd backend
source venv/bin/activate
python3 manage.py runserver
```

### Frontend Development

```bash
cd frontend
npm run dev
```

### Database Management

```bash
# Create new migration
python3 manage.py makemigrations

# Apply migrations
python3 manage.py migrate

# Reset database (WARNING: This will delete all data)
python3 manage.py flush
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
python3 manage.py test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📦 Production Deployment

### Backend (Django)

1. Set `DEBUG = False` in `settings.py`
2. Configure production database (PostgreSQL recommended)
3. Set up environment variables on hosting platform
4. Configure static files and media storage
5. Set up SSL certificate

### Frontend (React)

```bash
cd frontend
npm run build
```

Deploy the `dist` folder to your hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify your API keys are correctly set
3. Ensure all dependencies are installed
4. Check that both backend and frontend servers are running

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/refresh/` - Refresh token

### Dashboard
- `GET /api/upload-receipt/dashboard-summary/` - Dashboard overview
- `GET /api/upload-receipt/expense-stats/` - Expense statistics
- `GET /api/upload-receipt/budget-summary/` - Budget summary

### Expenses
- `GET /api/upload-receipt/expenses/` - List expenses
- `POST /api/upload-receipt/upload/` - Upload receipt
- `POST /api/upload-receipt/expenses/` - Add expense

### AI Chat
- `POST /api/upload-receipt/chat/` - AI chatbot

### Budgets
- `GET /api/upload-receipt/budget-categories/` - Budget categories
- `POST /api/upload-receipt/budgets/` - Create budget

---

**Happy Budgeting! 💰📊**
