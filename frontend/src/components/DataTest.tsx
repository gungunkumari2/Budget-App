import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DataTest() {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [
          dashboardSummary,
          expenseStats,
          categories,
          paymentMethods,
          expenses,
          transactions
        ] = await Promise.all([
          apiService.getDashboardSummary(),
          apiService.getExpenseStats(),
          apiService.getCategories(),
          apiService.getPaymentMethods(),
          apiService.getExpenses(),
          apiService.getTransactions()
        ]);

        setData({
          dashboardSummary: dashboardSummary.data,
          expenseStats: expenseStats.data,
          categories: categories.data,
          paymentMethods: paymentMethods.data,
          expenses: expenses.data,
          transactions: transactions.data
        });
      } catch (err: any) {
        console.error('Data fetch error:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) return <div className="text-center py-8">Loading data...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Data Verification</h2>
      
      {/* Dashboard Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(data.dashboardSummary, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Expense Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(data.expenseStats, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categories ({data.categories?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(data.categories, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods ({data.paymentMethods?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(data.paymentMethods, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses ({data.expenses?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(data.expenses?.slice(0, 5), null, 2)}
          </pre>
          {data.expenses?.length > 5 && (
            <p className="text-sm text-gray-500 mt-2">
              Showing first 5 of {data.expenses.length} expenses
            </p>
          )}
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({data.transactions?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(data.transactions, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
} 