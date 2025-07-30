import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ApiTest() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAllApis = async () => {
    setLoading(true);
    setError(null);
    const results: any = {};

    try {
      // Test each API endpoint
      const endpoints = [
        { name: 'Dashboard Summary', fn: () => apiService.getDashboardSummary() },
        { name: 'Expense Stats', fn: () => apiService.getExpenseStats() },
        { name: 'Categories', fn: () => apiService.getCategories() },
        { name: 'Payment Methods', fn: () => apiService.getPaymentMethods() },
        { name: 'Expenses', fn: () => apiService.getExpenses() },
        { name: 'Transactions', fn: () => apiService.getTransactions() },
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await endpoint.fn();
          results[endpoint.name] = {
            status: 'SUCCESS',
            data: response.data,
            count: Array.isArray(response.data) ? response.data.length : 'N/A'
          };
        } catch (err: any) {
          results[endpoint.name] = {
            status: 'ERROR',
            error: err.message,
            statusCode: err.response?.status
          };
        }
      }

      setResults(results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">API Test</h2>
        <Button onClick={testAllApis} disabled={loading}>
          {loading ? 'Testing...' : 'Test All APIs'}
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-600 font-medium">Error: {error}</div>
          </CardContent>
        </Card>
      )}

      {Object.keys(results).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(results).map(([name, result]: [string, any]) => (
            <Card key={name} className={result.status === 'ERROR' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
              <CardHeader>
                <CardTitle className={result.status === 'ERROR' ? 'text-red-800' : 'text-green-800'}>
                  {name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">
                    Status: <span className={result.status === 'ERROR' ? 'text-red-600' : 'text-green-600'}>{result.status}</span>
                  </div>
                  {result.status === 'SUCCESS' && (
                    <div className="text-sm">
                      Count: {result.count}
                    </div>
                  )}
                  {result.status === 'ERROR' && (
                    <div className="text-sm text-red-600">
                      Error: {result.error}
                      {result.statusCode && <div>Status Code: {result.statusCode}</div>}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</div>
            <div>User: {localStorage.getItem('user') ? 'Present' : 'Missing'}</div>
            <div>Backend URL: {import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 