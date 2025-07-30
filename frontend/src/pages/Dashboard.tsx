import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSignIcon, TrendingUpIcon, TrendingDownIcon, CalendarIcon, ReceiptIcon } from 'lucide-react';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [expenseStats, setExpenseStats] = useState<any>(null);
  const [budgetCategories, setBudgetCategories] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [summaryRes, statsRes, categoriesRes] = await Promise.all([
        apiService.getDashboardSummary(),
        apiService.getExpenseStats(),
        apiService.getBudgetCategories()
      ]);

      setDashboardData(summaryRes.data);
      setExpenseStats(statsRes.data);
      setBudgetCategories(categoriesRes.data);
    } catch (err: any) {
      console.error('Dashboard data fetch error:', err);
      if (err.response?.status === 401) {
        setError('Authentication expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        setError('Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading dashboard...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's your financial overview
        </p>
      </div>

      {/* Main Financial Overview */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">NPR {dashboardData.monthly_income?.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Your monthly earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDownIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">NPR {dashboardData.total_expenses?.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month's spending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
              <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.savings_rate?.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Of your income saved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                NPR {(dashboardData.monthly_income - dashboardData.total_expenses)?.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Available for this month</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expense Statistics */}
      {expenseStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Month Expenses</CardTitle>
              <ReceiptIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">NPR {expenseStats.current_month_total?.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month's total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Spending Category</CardTitle>
              <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {expenseStats.category_breakdown?.length > 0 ? (
                <>
                  <div className="text-2xl font-bold">{expenseStats.category_breakdown[0].category__name}</div>
                  <p className="text-xs text-muted-foreground">
                    NPR {expenseStats.category_breakdown[0].total?.toLocaleString()}
                  </p>
                </>
              ) : (
                <div className="text-2xl font-bold text-gray-400">No data</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Merchant</CardTitle>
              <ReceiptIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {expenseStats.top_merchants?.length > 0 ? (
                <>
                  <div className="text-2xl font-bold">{expenseStats.top_merchants[0].merchant}</div>
                  <p className="text-xs text-muted-foreground">
                    NPR {expenseStats.top_merchants[0].total?.toLocaleString()}
                  </p>
                </>
              ) : (
                <div className="text-2xl font-bold text-gray-400">No data</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budget Categories */}
      {budgetCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgetCategories.map((category: any) => (
                <div key={category.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{category.name}</h3>
                    <Badge 
                      variant={category.status === 'over' ? 'destructive' : 
                              category.status === 'under' ? 'default' : 'secondary'}
                    >
                      {category.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Spent:</span>
                      <span>NPR {category.amount_spent?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Budget:</span>
                      <span>NPR {category.budget_limit?.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          category.status === 'over' ? 'bg-red-500' : 
                          category.status === 'under' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min(category.percentage_used, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      {category.percentage_used?.toFixed(1)}% used
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      {dashboardData?.recent_transactions?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboardData.recent_transactions.map((transaction: any) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground">{transaction.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">NPR {transaction.amount?.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{transaction.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}