import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';
const API_PREFIX = '/api/upload-receipt';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Don't add Authorization header for login and register requests
    const isAuthRequest = config.url?.includes('/login/') || config.url?.includes('/register/');
    
    if (!isAuthRequest) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't try to refresh tokens for authentication endpoints
    const isAuthRequest = originalRequest.url?.includes('/login/') || originalRequest.url?.includes('/register/');
    
    // If the error is 401 and we haven't already tried to refresh and it's not an auth request
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          console.log('Attempting to refresh token...');
          const response = await axios.post(`${API_BASE_URL}${API_PREFIX}/token/refresh/`, {
            refresh: refreshToken
          });

          const { access } = response.data;
          localStorage.setItem('token', access);
          console.log('Token refreshed successfully');

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Only redirect if we're not already on the login page
        if (window.location.pathname !== '/signin' && window.location.pathname !== '/register') {
          window.location.href = '/signin';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_PREFIX}/login/`,
  REGISTER: `${API_PREFIX}/register/`,
  LOGOUT: `${API_PREFIX}/logout/`,
  PROFILE: `${API_PREFIX}/profile/`,
  TOKEN_REFRESH: `${API_PREFIX}/token/refresh/`,
  
  // Dashboard
  DASHBOARD_SUMMARY: `${API_PREFIX}/dashboard-summary/`,
  DASHBOARD_TRENDS: `${API_PREFIX}/dashboard-trends/`,
  
  // Budget & Categories
  BUDGET_CATEGORIES: `${API_PREFIX}/budget-categories/`,
  BUDGET_SUMMARY: `${API_PREFIX}/budget-summary/`,
  CATEGORIES: `${API_PREFIX}/categories/`,
  PAYMENT_METHODS: `${API_PREFIX}/payment-methods/`,
  
  // Expenses
  EXPENSES: `${API_PREFIX}/expenses/`,
  EXPENSE_STATS: `${API_PREFIX}/expense-stats/`,
  
  // Transactions
  TRANSACTIONS: `${API_PREFIX}/transactions/`,
  
  // Upload
  UPLOAD_RECEIPT: `${API_PREFIX}/`,
  
  // Chat
  CHAT: `${API_PREFIX}/chat/`,
  
  // JWT Token endpoints (standard Django REST framework JWT)
  TOKEN: '/api/token/',
  TOKEN_REFRESH_STANDARD: '/api/token/refresh/',
} as const;

// API Service functions
export const apiService = {
  // Authentication
  login: (data: { email: string; password: string }) => {
    console.log('Making login request to:', API_ENDPOINTS.LOGIN);
    console.log('Request data:', { email: data.email, password: '***' });
    return apiClient.post(API_ENDPOINTS.LOGIN, data);
  },
  
  register: (data: { username: string; email: string; password: string }) =>
    apiClient.post(API_ENDPOINTS.REGISTER, data),
  
  logout: (data: { refresh: string }) =>
    apiClient.post(API_ENDPOINTS.LOGOUT, data),
  
  getProfile: () => apiClient.get(API_ENDPOINTS.PROFILE),
  
  refreshToken: (data: { refresh: string }) =>
    apiClient.post(API_ENDPOINTS.TOKEN_REFRESH, data),
  
  // Dashboard
  getDashboardSummary: () => apiClient.get(API_ENDPOINTS.DASHBOARD_SUMMARY),
  getDashboardTrends: () => apiClient.get(API_ENDPOINTS.DASHBOARD_TRENDS),
  
  // Budget & Categories
  getBudgetCategories: () => apiClient.get(API_ENDPOINTS.BUDGET_CATEGORIES),
  getBudgetSummary: () => apiClient.get(API_ENDPOINTS.BUDGET_SUMMARY),
  getCategories: () => apiClient.get(API_ENDPOINTS.CATEGORIES),
  getPaymentMethods: () => apiClient.get(API_ENDPOINTS.PAYMENT_METHODS),
  
  // Expenses
  getExpenses: (params?: {
    category?: number;
    start_date?: string;
    end_date?: string;
    min_amount?: number;
    max_amount?: number;
    merchant?: string;
  }) => apiClient.get(API_ENDPOINTS.EXPENSES, { params }),
  getExpenseStats: () => apiClient.get(API_ENDPOINTS.EXPENSE_STATS),
  
  // Transactions
  getTransactions: () => apiClient.get(API_ENDPOINTS.TRANSACTIONS),
  
  // Upload
  uploadReceipt: (formData: FormData) =>
    apiClient.post(API_ENDPOINTS.UPLOAD_RECEIPT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  // Chat
  sendChatMessage: (data: { message: string }) =>
    apiClient.post(API_ENDPOINTS.CHAT, data),
  
  // JWT Token (standard Django REST framework JWT)
  getToken: (data: { username: string; password: string }) =>
    apiClient.post(API_ENDPOINTS.TOKEN, data),
};

// Data type definitions for API responses
export interface BudgetCategory {
  id: number;
  name: string;
  budget_limit: number;
  amount_spent: number;
  percentage_used: number;
  color: string;
  status: 'over' | 'under' | 'normal';
}

export interface DashboardSummary {
  monthly_income: number;
  total_expenses: number;
  savings_rate: number;
  currency: string;
  recent_transactions: Array<{
    id: number;
    description: string;
    amount: number;
    date: string;
    category: string;
  }>;
}

export interface DashboardTrend {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  created_at: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface RegisterResponse extends LoginResponse {
  message: string;
}

export interface ChatResponse {
  message: string;
  timestamp: string;
}

export interface Expense {
  id: number;
  user: number;
  date: string;
  merchant: string;
  amount: number;
  currency: string;
  category: {
    id: number;
    name: string;
  };
  payment_method: {
    id: number;
    name: string;
  } | null;
  description: string;
  created_at: string;
}

export interface ExpenseStats {
  current_month_total: number;
  category_breakdown: Array<{
    category__name: string;
    total: number;
    count: number;
  }>;
  top_merchants: Array<{
    merchant: string;
    total: number;
    count: number;
  }>;
  recent_expenses: Expense[];
}

export interface Category {
  id: number;
  name: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
}

export default apiClient; 