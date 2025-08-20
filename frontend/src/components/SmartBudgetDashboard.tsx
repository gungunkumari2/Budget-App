import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  PieChart,
  Upload,
  MessageCircle,
  Brain,
  Zap,
  Star,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

import { ExpenseExtractor } from './ExpenseExtractor';
import { ExpenseChart } from './ExpenseChart';
import { BudgetPlanner } from './BudgetPlanner';
import { AIChat } from './AIChat';

export const SmartBudgetDashboard = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required. Please log in again.');
          setLoading(false);
          return;
        }

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        const [summaryRes, txRes, trendsRes] = await Promise.all([
          axios.get('http://localhost:8000/api/upload-receipt/dashboard-summary/', config),
          axios.get('http://localhost:8000/api/upload-receipt/transactions/', config),
          axios.get('http://localhost:8000/api/upload-receipt/dashboard-trends/', config)
        ]);

        setDashboardData(summaryRes.data);
        setTransactions(txRes.data);
        setTrends(trendsRes.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Dashboard data fetch error:', err);
        if (err.response?.status === 401) {
          setError('Authentication expired. Please log in again.');
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else {
          setError('Failed to load dashboard data. Please try again.');
        }
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const metrics = dashboardData ? [
    {
      label: 'Monthly Income',
      value: `${dashboardData.currency} ${Number(dashboardData.monthly_income).toLocaleString()}`,
      icon: <DollarSign className="h-5 w-5" />, color: 'text-success'
    },
    {
      label: 'Total Expenses',
      value: `${dashboardData.currency} ${Number(dashboardData.total_expenses).toLocaleString()}`,
      icon: <TrendingDown className="h-5 w-5" />, color: 'text-error'
    },
    {
      label: 'Savings Rate',
      value: `${dashboardData.savings_rate}%`,
      icon: <Target className="h-5 w-5" />, color: 'text-primary'
    },
    {
      label: 'Budget Score',
      value: `${Math.round((dashboardData.savings_rate / 100) * 100)}/100`,
      icon: <Star className="h-5 w-5" />, color: 'text-warning'
    }
  ] : [];

  // Helper for trends chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trendsByMonth = trends.map((t: any) => ({
    month: months[new Date(t.month).getMonth()],
    expenses: t.total
  }));

  if (loading) return <div className="text-center py-8">Loading dashboard...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">SmartBudget</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Budget Advisor</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-1">
                <Zap className="h-3 w-3" />
                AI Active
              </Badge>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Quick Upload
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                  </div>
                  <div className={`${metric.color}`}>{metric.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Budget</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">AI Chat</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ExpenseChart />
              </div>
              <div className="space-y-6">
                {/* Recent Transactions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Latest financial activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {transactions.slice(0, 6).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              transaction.amount > 0 ? 'bg-success' : 'bg-error'
                            }`} />
                            <div>
                              <p className="font-medium text-sm">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground">{transaction.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              transaction.amount > 0 ? 'text-success' : 'text-foreground'
                            }`}>
                              {transaction.amount > 0 ? '+' : ''}{dashboardData.currency} {Math.abs(Number(transaction.amount)).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">{transaction.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <ExpenseExtractor />
          </TabsContent>

          <TabsContent value="budget">
            <BudgetPlanner />
          </TabsContent>

          <TabsContent value="analytics">
            <ExpenseChart />
          </TabsContent>

          <TabsContent value="chat">
            <AIChat />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};