import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

interface ChartData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

const mockData: ChartData[] = [
  { category: 'Food & Dining', amount: 1250, percentage: 35, color: '#ef4444', trend: 'up', trendPercentage: 12 },
  { category: 'Transportation', amount: 850, percentage: 24, color: '#f97316', trend: 'down', trendPercentage: 5 },
  { category: 'Shopping', amount: 650, percentage: 18, color: '#eab308', trend: 'up', trendPercentage: 8 },
  { category: 'Entertainment', amount: 450, percentage: 13, color: '#22c55e', trend: 'stable', trendPercentage: 2 },
  { category: 'Utilities', amount: 350, percentage: 10, color: '#3b82f6', trend: 'down', trendPercentage: 3 },
];

const monthlyData = [
  { month: 'Jan', income: 5000, expenses: 3200 },
  { month: 'Feb', income: 5200, expenses: 3400 },
  { month: 'Mar', income: 5000, expenses: 3600 },
  { month: 'Apr', income: 5400, expenses: 3550 },
  { month: 'May', income: 5200, expenses: 3850 },
  { month: 'Jun', income: 5600, expenses: 3950 },
];

export const ExpenseChart = () => {
  const totalExpenses = mockData.reduce((sum, item) => sum + item.amount, 0);
  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];
  const savingsRate = ((currentMonth.income - currentMonth.expenses) / currentMonth.income * 100).toFixed(1);

  const PieChart = () => {
    let cumulativePercentage = 0;
    
    return (
      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          {mockData.map((item, index) => {
            const startAngle = cumulativePercentage * 3.6;
            const endAngle = (cumulativePercentage + item.percentage) * 3.6;
            const largeArcFlag = item.percentage > 50 ? 1 : 0;
            
            const startX = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
            const startY = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
            const endX = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
            const endY = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);
            
            const pathData = [
              `M 50 50`,
              `L ${startX} ${startY}`,
              `A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              'Z'
            ].join(' ');
            
            cumulativePercentage += item.percentage;
            
            return (
              <path
                key={index}
                d={pathData}
                fill={item.color}
                opacity="0.8"
                className="hover:opacity-100 transition-opacity cursor-pointer"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">${totalExpenses.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">Total Spent</span>
        </div>
      </div>
    );
  };

  const BarChart = () => {
    const maxValue = Math.max(...monthlyData.map(d => Math.max(d.income, d.expenses)));
    
    return (
      <div className="space-y-4">
        {monthlyData.slice(-6).map((data, index) => (
          <div key={data.month} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{data.month}</span>
              <div className="flex gap-4">
                <span className="text-success">+${data.income.toLocaleString()}</span>
                <span className="text-error">-${data.expenses.toLocaleString()}</span>
              </div>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-income rounded-full"
                style={{ width: `${(data.income / maxValue) * 100}%` }}
              />
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-expense rounded-full"
                style={{ width: `${(data.expenses / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Expense Breakdown
          </CardTitle>
          <CardDescription>Spending by category this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <PieChart />
            <div className="space-y-3">
              {mockData.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">${item.amount.toLocaleString()}</span>
                    <Badge variant={item.trend === 'up' ? 'destructive' : item.trend === 'down' ? 'default' : 'secondary'}>
                      {item.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : item.trend === 'down' ? (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      ) : null}
                      {item.trendPercentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Trends
          </CardTitle>
          <CardDescription>Income vs expenses over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-success">${currentMonth.income.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Income</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-error">${currentMonth.expenses.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Expenses</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{savingsRate}%</p>
                <p className="text-sm text-muted-foreground">Savings Rate</p>
              </div>
            </div>
            
            <BarChart />
            
            <div className="flex justify-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-income" />
                <span className="text-sm text-muted-foreground">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-expense" />
                <span className="text-sm text-muted-foreground">Expenses</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};