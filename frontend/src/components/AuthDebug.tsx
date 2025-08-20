import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const AuthDebug: React.FC = () => {
  const { user, token, isAuthenticated, login, isLoading } = useAuth();
  const [localStorageData, setLocalStorageData] = useState<any>({});

  const checkLocalStorage = () => {
    const data = {
      token: localStorage.getItem('token'),
      refreshToken: localStorage.getItem('refreshToken'),
      user: localStorage.getItem('user'),
    };
    setLocalStorageData(data);
    console.log('LocalStorage data:', data);
  };

  const testLogin = async () => {
    try {
      const success = await login('jaiswalbhumi89@gmail.com', 'testpass123');
      if (success) {
        console.log('Login successful');
        checkLocalStorage();
      } else {
        console.log('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    checkLocalStorage();
    console.log('LocalStorage cleared');
  };

  useEffect(() => {
    checkLocalStorage();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
          <CardDescription>Debug authentication and localStorage issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Current State</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span>Loading:</span>
                  <Badge variant={isLoading ? "default" : "secondary"}>
                    {isLoading ? "Yes" : "No"}
                  </Badge>
                </div>
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
                  <span>Token:</span>
                  <span className="text-sm">{token ? `${token.substring(0, 20)}...` : "None"}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">LocalStorage</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span>Token:</span>
                  <Badge variant={localStorageData.token ? "default" : "destructive"}>
                    {localStorageData.token ? "Present" : "Missing"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span>Refresh Token:</span>
                  <Badge variant={localStorageData.refreshToken ? "default" : "destructive"}>
                    {localStorageData.refreshToken ? "Present" : "Missing"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span>User:</span>
                  <Badge variant={localStorageData.user ? "default" : "destructive"}>
                    {localStorageData.user ? "Present" : "Missing"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={testLogin} variant="outline" size="sm">
              Test Login
            </Button>
            <Button onClick={checkLocalStorage} variant="outline" size="sm">
              Check LocalStorage
            </Button>
            <Button onClick={clearLocalStorage} variant="outline" size="sm">
              Clear LocalStorage
            </Button>
          </div>

          <div className="text-sm text-gray-500">
            <p>Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Click "Test Login" to authenticate</li>
              <li>Check if LocalStorage shows "Present" for all items</li>
              <li>Refresh the page (F5 or Cmd+R)</li>
              <li>Check if you stay logged in</li>
              <li>If not, check the console for error messages</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 