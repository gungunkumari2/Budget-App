import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const API_PREFIX = '/api/upload-receipt';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if needed
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_PREFIX}/login/`,
  REGISTER: `${API_PREFIX}/register/`,
  
  // Dashboard
  DASHBOARD_SUMMARY: `${API_PREFIX}/dashboard-summary/`,
  DASHBOARD_TRENDS: `${API_PREFIX}/dashboard-trends/`,
  
  // Budget & Categories
  BUDGET_CATEGORIES: `${API_PREFIX}/budget-categories/`,
  BUDGET_SUMMARY: `${API_PREFIX}/budget-summary/`,
  
  // Transactions
  TRANSACTIONS: `${API_PREFIX}/transactions/`,
  
  // Upload
  UPLOAD_RECEIPT: `${API_PREFIX}/`,
  
  // Chat
  CHAT: `${API_PREFIX}/chat/`,
  
  // JWT Token endpoints
  TOKEN: '/api/token/',
  TOKEN_REFRESH: '/api/token/refresh/',
} as const;

// API Service functions
export const apiService = {
  // Authentication
  login: (data: { email: string; password: string }) =>
    apiClient.post(API_ENDPOINTS.LOGIN, data),
  
  register: (data: { username: string; email: string; password: string }) =>
    apiClient.post(API_ENDPOINTS.REGISTER, data),
  
  // Dashboard
  getDashboardSummary: () => apiClient.get(API_ENDPOINTS.DASHBOARD_SUMMARY),
  getDashboardTrends: () => apiClient.get(API_ENDPOINTS.DASHBOARD_TRENDS),
  
  // Budget & Categories
  getBudgetCategories: () => apiClient.get(API_ENDPOINTS.BUDGET_CATEGORIES),
  getBudgetSummary: () => apiClient.get(API_ENDPOINTS.BUDGET_SUMMARY),
  
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
  
  // JWT Token
  getToken: (data: { username: string; password: string }) =>
    apiClient.post(API_ENDPOINTS.TOKEN, data),
  
  refreshToken: (data: { refresh: string }) =>
    apiClient.post(API_ENDPOINTS.TOKEN_REFRESH, data),
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

export default apiClient; 