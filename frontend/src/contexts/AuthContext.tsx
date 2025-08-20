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
  updateUserData: (userData: User) => void;
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
  // We need to ensure both token and user exist
  const isAuthenticated = !!token && !!user;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const storedToken = localStorage.getItem('token');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const storedUser = localStorage.getItem('user');

        console.log('Initializing auth from localStorage...');
        console.log('Stored token exists:', !!storedToken);
        console.log('Stored refresh token exists:', !!storedRefreshToken);
        console.log('Stored user exists:', !!storedUser);

        if (storedToken && storedUser) {
          // First set the tokens and user from localStorage
          setToken(storedToken);
          if (storedRefreshToken) {
            setRefreshToken(storedRefreshToken);
          }
          setUser(JSON.parse(storedUser));
          
          console.log('Auth data loaded from localStorage');
          
          // Then validate the token before completing initialization
          let isValid = false;
          try {
            // First try to validate with the current token
            isValid = await checkAuthStatus();
            console.log('Auth status check result:', isValid);
            
            if (!isValid && storedRefreshToken) {
              // If token is invalid but we have a refresh token, try to refresh
              console.log('Token invalid, attempting refresh...');
              const refreshed = await refreshAuthToken();
              if (!refreshed) {
                console.log('Token refresh failed, clearing auth data');
                clearAuthData();
              } else {
                console.log('Token refreshed successfully');
                isValid = true;
              }
            } else if (!isValid) {
              console.log('Token invalid and no refresh token, clearing auth data');
              clearAuthData();
            }
          } catch (error) {
            console.error('Auth check failed:', error);
            // Try to refresh token on error
            if (storedRefreshToken) {
              try {
                console.log('Attempting to refresh token after error...');
                const refreshed = await refreshAuthToken();
                if (refreshed) {
                  console.log('Token refreshed successfully after error');
                  isValid = true;
                } else {
                  console.log('Token refresh failed, clearing auth data');
                  clearAuthData();
                }
              } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                clearAuthData();
              }
            } else {
              clearAuthData();
            }
          }
        } else {
          console.log('No stored auth data found');
          clearAuthData();
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

  // Periodically check and refresh token during active sessions
  useEffect(() => {
    console.log('Setting up periodic token refresh');
    const refreshInterval = setInterval(async () => {
      // Check if we have tokens in localStorage even if state doesn't have them
      const storedToken = localStorage.getItem('token');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      
      if (!storedToken) {
        // No token in localStorage, nothing to refresh
        return;
      }
      
      // If we have a token in localStorage but not in state, set it
      if (!token && storedToken) {
        setToken(storedToken);
      }
      
      // If we have a refresh token in localStorage but not in state, set it
      if (!refreshToken && storedRefreshToken) {
        setRefreshToken(storedRefreshToken);
      }
      
      console.log('Performing periodic token refresh check');
      const tokenIsValid = await checkAuthStatus();
      
      if (!tokenIsValid && storedRefreshToken) {
        console.log('Token invalid during periodic check, attempting refresh');
        const refreshed = await refreshAuthToken();
        if (!refreshed) {
          console.log('Periodic token refresh failed, logging out');
          clearAuthData();
        } else {
          console.log('Periodic token refresh successful');
        }
      } else if (!tokenIsValid) {
        console.log('Token invalid and no refresh token available, logging out');
        clearAuthData();
      }
    }, 10 * 60 * 1000); // Check every 10 minutes
    
    return () => {
      console.log('Clearing periodic token refresh');
      clearInterval(refreshInterval);
    };
  }, []);
  
  // Refresh token when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, checking auth status');
        
        // Check if we have tokens in localStorage even if state doesn't have them
        const storedToken = localStorage.getItem('token');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        
        if (storedToken) {
          // If we have a token in localStorage but not in state, set it
          if (!token) {
            setToken(storedToken);
          }
          
          // If we have a refresh token in localStorage but not in state, set it
          if (storedRefreshToken && !refreshToken) {
            setRefreshToken(storedRefreshToken);
          }
          
          const tokenIsValid = await checkAuthStatus();
          
          if (!tokenIsValid && storedRefreshToken) {
            console.log('Token invalid on page visibility change, attempting refresh');
            const refreshed = await refreshAuthToken();
            if (!refreshed) {
              console.log('Token refresh failed on visibility change, logging out');
              clearAuthData();
            } else {
              console.log('Token refreshed successfully on visibility change');
            }
          } else if (!tokenIsValid) {
            console.log('Token invalid and no refresh token available, logging out');
            clearAuthData();
          }
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const clearAuthData = () => {
    console.log('Clearing auth data...');
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    console.log('Auth data cleared');
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
    const currentRefreshToken = refreshToken || localStorage.getItem('refreshToken');
    
    if (!currentRefreshToken) {
      console.log('No refresh token available');
      return false;
    }

    try {
      console.log('Attempting to refresh token...');
      const response = await apiService.refreshToken({ refresh: currentRefreshToken });
      const { access, refresh } = response.data;
      
      // Update state and localStorage
      setToken(access);
      setRefreshToken(refresh);
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      
      // Ensure user data is still in localStorage
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      console.log('Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Don't clear auth data here, let the caller decide
      return false;
    }
  };

  const checkAuthStatus = async (): Promise<boolean> => {
    const currentToken = token || localStorage.getItem('token');
    
    if (!currentToken) {
      console.log('No token available for auth check');
      return false;
    }

    try {
      console.log('Checking auth status with profile API...');
      const response = await apiService.getProfile();
      console.log('Auth status check successful');
      
      // Update user data if it's returned from the profile endpoint
      if (response.data && response.data.id) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        console.log('User data updated from profile');
      }
      
      // If we got here, the token is valid
      if (!token) {
        setToken(currentToken);
      }
      
      return true;
    } catch (error: any) {
      console.log('Auth status check failed:', error.response?.status, error.message);
      if (error.response?.status === 401) {
        // Token is definitely invalid
        return false;
      } else if (error.code === 'ERR_NETWORK' || !error.response) {
        // Network error - could be backend not running
        console.log('Network error during auth check - backend might be down');
        // Don't clear auth data yet, as this might be a temporary network issue
        return true;
      }
      // For other issues, assume token might still be valid
      console.log('Assuming token is valid despite error');
      return true;
    }
  };

  // Function to update user data in context and localStorage
  const updateUserData = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
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
    updateUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};