import { useEffect, useState } from 'react';
import { apiService, Expense, ExpenseStats } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, FilterIcon, DollarSignIcon, TrendingUpIcon } from 'lucide-react';
import { format } from 'date-fns';

interface Category {
  id: number;
  name: string;
}

export default function ExpenseList() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [limit, setLimit] = useState<number>(20);
  const [offset, setOffset] = useState<number>(0);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<any>(null);
  const [filters, setFilters] = useState({
    category: 'all',
    merchant: '',
    start_date: '',
    end_date: '',
    min_amount: '',
    max_amount: '',
  });

  useEffect(() => {
    fetchAllData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, month, year]);

  const fetchAllData = async (reset: boolean = false) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching data...');
      const params = getFilterParams();
      params.month = month;
      params.year = year;
      params.limit = limit;
      params.offset = reset ? 0 : offset;

      const [expensesRes, statsRes, categoriesRes, dashboardRes] = await Promise.all([
        apiService.getExpenses(params),
        apiService.getExpenseStats(),
        apiService.getCategories(),
        apiService.getDashboardSummary()
      ]);

      console.log('Data fetched successfully:', {
        expenses: expensesRes.data?.length,
        stats: statsRes.data,
        categories: categoriesRes.data?.length,
        dashboard: dashboardRes.data
      });

      // Debug: Log the actual values being received
      console.log('🔍 DEBUG - Dashboard Summary Data:', dashboardRes.data);
      console.log('🔍 DEBUG - Total Expenses Value:', dashboardRes.data?.total_expenses);
      console.log('🔍 DEBUG - Expected Value: 60500');
      console.log('🔍 DEBUG - Stats Data:', statsRes.data);
      console.log('🔍 DEBUG - Current Month Total:', statsRes.data?.current_month_total);

      const newExpenses = expensesRes.data || [];
      setExpenses(reset ? newExpenses : [...expenses, ...newExpenses]);
      setStats(statsRes.data);
      setCategories(categoriesRes.data || []);
      setDashboardSummary(dashboardRes.data);
      setOffset((reset ? 0 : offset) + (newExpenses.length || 0));
    } catch (err: any) {
      console.error('Data fetch error:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      if (err.response?.status === 401) {
        setError('Authentication expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (err.code === 'NETWORK_ERROR') {
        setError('Network error. Please check your connection.');
      } else {
        setError(`Failed to load data: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getFilterParams = () => {
    const params: any = {};
    if (filters.category && filters.category !== 'all') params.category = filters.category;
    if (filters.merchant) params.merchant = filters.merchant;
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    if (filters.min_amount) params.min_amount = filters.min_amount;
    if (filters.max_amount) params.max_amount = filters.max_amount;
    return params;
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      merchant: '',
      start_date: '',
      end_date: '',
      min_amount: '',
      max_amount: '',
    });
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
    setOffset(0);
    fetchAllData(true);
  };

  const getCategoryColor = (categoryName: string) => {
    const colors = {
      'Food & Dining': 'bg-red-100 text-red-800',
      'Transportation': 'bg-blue-100 text-blue-800',
      'Utilities': 'bg-green-100 text-green-800',
      'Entertainment': 'bg-yellow-100 text-yellow-800',
      'Groceries': 'bg-purple-100 text-purple-800',
      'Shopping': 'bg-pink-100 text-pink-800',
      'Healthcare': 'bg-cyan-100 text-cyan-800',
      'Education': 'bg-lime-100 text-lime-800',
      'Travel': 'bg-orange-100 text-orange-800',
      'Insurance': 'bg-indigo-100 text-indigo-800',
    };
    return colors[categoryName as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <div className="text-center py-8">Loading expenses...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Dashboard Summary Cards */}
      {dashboardSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">NPR {dashboardSummary.monthly_income?.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">NPR {dashboardSummary.total_expenses?.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
              <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardSummary.savings_rate?.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses Count</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expenses.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Month Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">NPR {stats.current_month_total.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.category_breakdown.length > 0 ? (
                <div className="text-2xl font-bold">{stats.category_breakdown[0].category__name}</div>
              ) : (
                <div className="text-2xl font-bold text-gray-400">No data</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Month</label>
              <Input
                type="number"
                min={1}
                max={12}
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value || '1'))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Year</label>
              <Input
                type="number"
                min={2000}
                max={2100}
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value || `${new Date().getFullYear()}`))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Merchant</label>
              <Input
                placeholder="Search merchant..."
                value={filters.merchant}
                onChange={(e) => setFilters({...filters, merchant: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Amount Range</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  value={filters.min_amount}
                  onChange={(e) => setFilters({...filters, min_amount: e.target.value})}
                />
                <Input
                  placeholder="Max"
                  type="number"
                  value={filters.max_amount}
                  onChange={(e) => setFilters({...filters, max_amount: e.target.value})}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({...filters, start_date: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({...filters, end_date: e.target.value})}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses ({expenses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No expenses found matching your filters.
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <CalendarIcon className="h-6 w-6 text-gray-600" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">{expense.merchant}</div>
                      <div className="text-sm text-gray-500">{expense.description}</div>
                      <div className="text-sm text-gray-400">
                        {expense.date ? format(new Date(expense.date), 'MMM dd, yyyy') : 'No date'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">NPR {expense.amount.toLocaleString()}</div>
                    <Badge className={getCategoryColor(expense.category.name)}>
                      {expense.category.name}
                    </Badge>
                    {expense.payment_method && (
                      <div className="text-sm text-gray-500 mt-1">
                        {expense.payment_method.name}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex justify-center pt-2">
                <Button variant="outline" onClick={() => fetchAllData(false)}>Show more</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 