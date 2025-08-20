import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const AuthTest: React.FC = () => {
  const { user, token, isAuthenticated, login } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testLogin = async () => {
    try {
      const success = await login('jaiswalbhumi89@gmail.com', 'testpass123');
      if (success) {
        console.log('Login successful');
      } else {
        console.log('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const testTransactionsAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Testing transactions API...');
      console.log('Token:', token);
      console.log('Is authenticated:', isAuthenticated);
      
      const response = await apiService.getTransactions();
      console.log('Transactions response:', response.data);
      setTransactions(response.data);
    } catch (error: any) {
      console.error('API Error:', error);
      setError(error.response?.data?.detail || error.message);
    } finally {
      setLoading(false);
    }
  };

  const testLocalStorage = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    
    console.log('LocalStorage Token:', storedToken);
    console.log('LocalStorage User:', storedUser);
    console.log('LocalStorage RefreshToken:', storedRefreshToken);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
          <CardDescription>Test authentication and API calls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Current Status</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span>Authenticated:</span>
                  <Badge variant={isAuthenticated ? "default" : "destructive"}>
                    {isAuthenticated ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span>User:</span>
                  <span className="text-sm">{user?.username || "None"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Email:</span>
                  <span className="text-sm">{user?.email || "None"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Token:</span>
                  <span className="text-sm">{token ? `${token.substring(0, 20)}...` : "None"}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Actions</h3>
              <div className="space-y-2">
                <Button onClick={testLogin} variant="outline" size="sm">
                  Test Login
                </Button>
                <Button onClick={testTransactionsAPI} variant="outline" size="sm" disabled={loading}>
                  {loading ? "Loading..." : "Test Transactions API"}
                </Button>
                <Button onClick={testLocalStorage} variant="outline" size="sm">
                  Check LocalStorage
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">Error: {error}</p>
            </div>
          )}

          {transactions.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Transactions ({transactions.length})</h3>
              <div className="space-y-2">
                {transactions.slice(0, 5).map((transaction, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    <div className="flex justify-between">
                      <span className="font-medium">{transaction.description}</span>
                      <span className="text-green-600">${transaction.amount}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.category} • {transaction.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 