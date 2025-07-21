import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Lightbulb,
  Settings
} from 'lucide-react';

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  recommended: number;
  color: string;
  icon: string;
}

const initialCategories: BudgetCategory[] = [
  { id: '1', name: 'Food & Dining', allocated: 800, spent: 650, recommended: 750, color: '#ef4444', icon: '🍕' },
  { id: '2', name: 'Transportation', allocated: 400, spent: 420, recommended: 450, color: '#f97316', icon: '🚗' },
  { id: '3', name: 'Shopping', allocated: 300, spent: 280, recommended: 250, color: '#eab308', icon: '🛍️' },
  { id: '4', name: 'Entertainment', allocated: 200, spent: 150, recommended: 180, color: '#22c55e', icon: '🎬' },
  { id: '5', name: 'Utilities', allocated: 350, spent: 340, recommended: 340, color: '#3b82f6', icon: '⚡' },
];

export const BudgetPlanner = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [monthlyIncome, setMonthlyIncome] = useState(5200);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const totalRecommended = categories.reduce((sum, cat) => sum + cat.recommended, 0);
  const remainingBudget = monthlyIncome - totalAllocated;
  const savingsGoal = monthlyIncome * 0.2; // 20% savings goal

  const updateCategoryBudget = (id: string, newAmount: number) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, allocated: newAmount } : cat
    ));
  };

  const applyRecommendations = () => {
    setCategories(prev => prev.map(cat => ({ ...cat, allocated: cat.recommended })));
    setShowRecommendations(false);
  };

  const getBudgetStatus = (spent: number, allocated: number) => {
    const percentage = (spent / allocated) * 100;
    if (percentage > 100) return { status: 'over', color: 'text-error', icon: AlertTriangle };
    if (percentage > 80) return { status: 'warning', color: 'text-warning', icon: AlertTriangle };
    return { status: 'good', color: 'text-success', icon: CheckCircle };
  };

  const aiInsights = [
    {
      type: 'warning',
      title: 'Transportation Over Budget',
      description: 'You\'ve exceeded your transportation budget by $20. Consider using public transport.',
      action: 'View Tips'
    },
    {
      type: 'success',
      title: 'Great Food Savings!',
      description: 'You\'re $150 under budget for food this month. Keep up the good work!',
      action: 'See Details'
    },
    {
      type: 'suggestion',
      title: 'Optimize Your Budget',
      description: 'Based on your spending patterns, we suggest reallocating $100 from shopping to savings.',
      action: 'Apply Changes'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Income</p>
                <p className="text-2xl font-bold text-success">${monthlyIncome.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budgeted</p>
                <p className="text-2xl font-bold">${totalAllocated.toLocaleString()}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-error">${totalSpent.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-error" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-success' : 'text-error'}`}>
                  ${Math.abs(remainingBudget).toLocaleString()}
                </p>
              </div>
              <div className={`h-8 w-8 ${remainingBudget >= 0 ? 'text-success' : 'text-error'}`}>
                {remainingBudget >= 0 ? <CheckCircle className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Budget Categories
            </CardTitle>
            <CardDescription>Manage your monthly spending limits</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowRecommendations(!showRecommendations)}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              AI Suggestions
            </Button>
            {showRecommendations && (
              <Button size="sm" onClick={applyRecommendations}>
                Apply All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categories.map((category) => {
              const spentPercentage = (category.spent / category.allocated) * 100;
              const statusInfo = getBudgetStatus(category.spent, category.allocated);
              const StatusIcon = statusInfo.icon;

              return (
                <div key={category.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          ${category.spent} of ${category.allocated} spent
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
                      <Badge variant={spentPercentage > 100 ? 'destructive' : spentPercentage > 80 ? 'secondary' : 'default'}>
                        {spentPercentage.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>

                  <Progress 
                    value={Math.min(spentPercentage, 100)} 
                    className="h-2"
                  />

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label className="text-sm">Budget: ${category.allocated}</Label>
                      <Slider
                        value={[category.allocated]}
                        onValueChange={(value) => updateCategoryBudget(category.id, value[0])}
                        max={1000}
                        min={0}
                        step={50}
                        className="mt-2"
                      />
                    </div>
                    
                    {showRecommendations && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">AI Suggests</p>
                        <p className="font-semibold text-primary">${category.recommended}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Budget Insights
          </CardTitle>
          <CardDescription>Personalized recommendations to optimize your budget</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className={`p-2 rounded-full ${
                  insight.type === 'warning' ? 'bg-warning/10' :
                  insight.type === 'success' ? 'bg-success/10' :
                  'bg-primary/10'
                }`}>
                  {insight.type === 'warning' ? (
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  ) : insight.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <Lightbulb className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                </div>
                <Button variant="outline" size="sm">
                  {insight.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};