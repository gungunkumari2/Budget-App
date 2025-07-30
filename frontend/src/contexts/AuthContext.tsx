import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshAuthToken: () => Promise<boolean>;
  checkAuthStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is authenticated
  const isAuthenticated = !!token && !!user;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedRefreshToken && storedUser) {
          setToken(storedToken);
          setRefreshToken(storedRefreshToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid
          const isValid = await checkAuthStatus();
          if (!isValid) {
            // Try to refresh token
            const refreshed = await refreshAuthToken();
            if (!refreshed) {
              // Clear invalid tokens
              clearAuthData();
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearAuthData = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  const setAuthData = (newToken: string, newRefreshToken: string, newUser: User) => {
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login with:', { email, password: '***' });
      const response = await apiService.login({ email, password });
      console.log('Login response received:', response.data);
      
      const { access, refresh, user: userData } = response.data;
      
      setAuthData(access, refresh, userData);
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      return true;
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        }
      });
      
      // Provide specific error messages based on the error type
      let errorMessage = "Login failed. Please try again.";
      
      if (error.code === 'ERR_NETWORK_ERROR' || error.message.includes('Network Error')) {
        errorMessage = "Cannot connect to server. Please make sure the backend server is running.";
      } else if (error.response?.status === 401) {
        errorMessage = error.response?.data?.error || "Invalid email or password. Please check your credentials.";
      } else if (error.response?.status === 404) {
        errorMessage = "Login endpoint not found. Please check if the backend server is running.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.register({ username, email, password });
      const { access, refresh, user: userData } = response.data;
      
      setAuthData(access, refresh, userData);
      
      toast({
        title: "Registration successful",
        description: "Welcome to SmartBudget!",
      });
      
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error.response?.data?.error || "Failed to create account",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      if (refreshToken) {
        await apiService.logout({ refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    }
  };

  const refreshAuthToken = async (): Promise<boolean> => {
    if (!refreshToken) return false;

    try {
      const response = await apiService.refreshToken({ refresh: refreshToken });
      const { access, refresh } = response.data;
      
      setToken(access);
      setRefreshToken(refresh);
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      clearAuthData();
      return false;
    }
  };

  const checkAuthStatus = async (): Promise<boolean> => {
    if (!token) return false;

    try {
      await apiService.getProfile();
      return true;
    } catch (error: any) {
      if (error.response?.status === 401) {
        return false;
      }
      return true; // Assume valid if it's not an auth error
    }
  };

  const value: AuthContextType = {
    user,
    token,
    refreshToken,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshAuthToken,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 