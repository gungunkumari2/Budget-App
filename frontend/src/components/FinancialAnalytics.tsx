import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart,
  BarChart3,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface CategoryTotal {
  category: string;
  total: number;
  percentage?: number;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
  icon?: string;
}

export default function FinancialAnalytics() {
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState('NPR');

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:8000/api/upload-receipt/budget-categories/')
      .then(res => {
        const data = res.data.map((cat: any) => ({
          category: cat.category_name,
          total: cat.amount_spent,
          percentage: cat.percent_spent,
          trend: cat.status === 'danger' ? 'up' : cat.status === 'warning' ? 'stable' : 'down',
          color: cat.color,
          icon: cat.icon
        }));
        setCategoryTotals(data);
        setCurrency('NPR');
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load analytics data');
        setLoading(false);
      });
  }, []);

  const totalSpent = categoryTotals.reduce((sum, cat) => sum + cat.total, 0);
  const topCategory = categoryTotals.sort((a, b) => b.total - a.total)[0];
  const averageSpending = totalSpent / categoryTotals.length || 0;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="text-center py-8">
      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <p className="text-red-500">{error}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Analytics</h1>
          <p className="text-muted-foreground">Deep insights into your spending patterns</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <PieChart className="h-3 w-3" />
            Live Data
          </Badge>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">{currency} {totalSpent.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{categoryTotals.length}</p>
              </div>
              <PieChart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Category</p>
                <p className="text-lg font-semibold">{topCategory?.category || 'N/A'}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Spending</p>
                <p className="text-2xl font-bold">{currency} {averageSpending.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Category-wise Spending
            </CardTitle>
            <CardDescription>Detailed breakdown of your expenses by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryTotals.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color || '#3b82f6' }}
                      />
                      <div>
                        <p className="font-medium">{category.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {category.percentage?.toFixed(1)}% of total
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {currency} {category.total.toLocaleString()}
                      </span>
                      <Badge 
                        variant={category.trend === 'up' ? 'destructive' : category.trend === 'down' ? 'default' : 'secondary'}
                        className="gap-1"
                      >
                        {category.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : category.trend === 'down' ? (
                          <TrendingDown className="h-3 w-3" />
                        ) : null}
                        {category.trend}
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={category.percentage || 0} 
                    className="h-2"
                    style={{ 
                      '--progress-background': category.color || '#3b82f6'
                    } as React.CSSProperties}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Spending Insights
            </CardTitle>
            <CardDescription>Key insights and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryTotals
                .filter(cat => cat.trend === 'up')
                .slice(0, 3)
                .map((category, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-700">
                        {category.category} spending is increasing
                      </p>
                      <p className="text-sm text-red-600">
                        Consider reviewing your budget for this category
                      </p>
                    </div>
                  </div>
                ))}
              
              {categoryTotals
                .filter(cat => cat.trend === 'down')
                .slice(0, 2)
                .map((category, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-700">
                        Great control on {category.category}
                      </p>
                      <p className="text-sm text-green-600">
                        You're spending less than usual in this category
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Category Analysis</CardTitle>
          <CardDescription>Complete breakdown with trends and percentages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-right py-3 px-4 font-medium">Amount</th>
                  <th className="text-center py-3 px-4 font-medium">Percentage</th>
                  <th className="text-center py-3 px-4 font-medium">Trend</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {categoryTotals.map((category, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color || '#3b82f6' }}
                        />
                        <span className="font-medium">{category.category}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 font-semibold">
                      {currency} {category.total.toLocaleString()}
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge variant="outline">{category.percentage?.toFixed(1)}%</Badge>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge 
                        variant={category.trend === 'up' ? 'destructive' : category.trend === 'down' ? 'default' : 'secondary'}
                        className="gap-1"
                      >
                        {category.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : category.trend === 'down' ? (
                          <TrendingDown className="h-3 w-3" />
                        ) : null}
                        {category.trend}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge 
                        variant={category.trend === 'up' ? 'destructive' : category.trend === 'down' ? 'default' : 'secondary'}
                      >
                        {category.trend === 'up' ? 'High' : category.trend === 'down' ? 'Low' : 'Normal'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 