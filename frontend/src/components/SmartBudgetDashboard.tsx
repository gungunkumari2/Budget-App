import React, { useState } from 'react';
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

import { ReceiptUpload } from './ReceiptUpload';
import { ExpenseChart } from './ExpenseChart';
import { BudgetPlanner } from './BudgetPlanner';
import { AIChat } from './AIChat';

interface FinancialMetric {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

export const SmartBudgetDashboard = () => {
  const [selectedTab, setSelectedTab] = useState('overview');

  const metrics: FinancialMetric[] = [
    {
      label: 'Monthly Income',
      value: '$5,200',
      change: 4.2,
      trend: 'up',
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-success'
    },
    {
      label: 'Total Expenses',
      value: '$3,850',
      change: -2.1,
      trend: 'down',
      icon: <TrendingDown className="h-5 w-5" />,
      color: 'text-success'
    },
    {
      label: 'Savings Rate',
      value: '26%',
      change: 3.8,
      trend: 'up',
      icon: <Target className="h-5 w-5" />,
      color: 'text-primary'
    },
    {
      label: 'Budget Score',
      value: '85/100',
      change: 5.2,
      trend: 'up',
      icon: <Star className="h-5 w-5" />,
      color: 'text-warning'
    }
  ];

  const aiInsights = [
    {
      type: 'success',
      title: 'Great savings this month!',
      description: 'You\'re on track to save $1,350 this month, exceeding your goal by $150.',
      priority: 'high'
    },
    {
      type: 'warning',
      title: 'Food spending spike detected',
      description: 'Your food expenses are 15% higher than usual. Consider meal planning.',
      priority: 'medium'
    },
    {
      type: 'tip',
      title: 'Optimize subscriptions',
      description: 'You could save $45/month by switching to annual plans for your streaming services.',
      priority: 'low'
    }
  ];

  const recentTransactions = [
    { id: 1, merchant: 'Starbucks', amount: -4.85, category: 'Food & Dining', date: '2024-01-15' },
    { id: 2, merchant: 'Uber', amount: -12.50, category: 'Transportation', date: '2024-01-15' },
    { id: 3, merchant: 'Salary Deposit', amount: 2600, category: 'Income', date: '2024-01-15' },
    { id: 4, merchant: 'Amazon', amount: -89.99, category: 'Shopping', date: '2024-01-14' },
    { id: 5, merchant: 'Netflix', amount: -15.99, category: 'Entertainment', date: '2024-01-14' }
  ];

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
                    <div className="flex items-center gap-1">
                      {metric.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-success" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-success" />
                      )}
                      <span className="text-xs text-success">+{metric.change}%</span>
                    </div>
                  </div>
                  <div className={`${metric.color}`}>
                    {metric.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Insights Banner */}
        <Card className="mb-6 bg-gradient-primary border-0">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4 text-white">
              <div className="p-2 rounded-full bg-white/20">
                <Brain className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">AI Financial Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {aiInsights.map((insight, index) => (
                    <div key={index} className="p-3 rounded-lg bg-white/10 backdrop-blur">
                      <div className="flex items-start gap-2">
                        {insight.type === 'success' ? (
                          <CheckCircle className="h-4 w-4 mt-0.5" />
                        ) : insight.type === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 mt-0.5" />
                        ) : (
                          <Zap className="h-4 w-4 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{insight.title}</p>
                          <p className="text-xs opacity-90 mt-1">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                      {recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              transaction.amount > 0 ? 'bg-success' : 'bg-error'
                            }`} />
                            <div>
                              <p className="font-medium text-sm">{transaction.merchant}</p>
                              <p className="text-xs text-muted-foreground">{transaction.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              transaction.amount > 0 ? 'text-success' : 'text-foreground'
                            }`}>
                              {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
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
            <ReceiptUpload />
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