import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
  id: number;
  name: string;
  budget_limit: number;
  amount_spent: number;
  percentage_used: number;
  status: string;
  color: string;
}

interface AIInsight {
  type: 'warning' | 'success' | 'suggestion';
  title: string;
  description: string;
  action: string;
}

export const BudgetPlanner = () => {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBudgetData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        console.log('Token found:', !!token); // Debug log
        
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

        console.log('Making API requests...'); // Debug log

        const [summaryRes, catRes] = await Promise.all([
          axios.get('http://localhost:8000/api/upload-receipt/dashboard-summary/', config),
          axios.get('http://localhost:8000/api/upload-receipt/budget-categories/', config)
        ]);

        console.log('API responses received:', { summary: summaryRes.data, categories: catRes.data }); // Debug log

        setSummary(summaryRes.data);
        setCategories(catRes.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Budget data fetch error:', err);
        console.error('Error response:', err.response?.data);
        console.error('Error status:', err.response?.status);
        
        if (err.response?.status === 401) {
          setError('Authentication expired. Please log in again.');
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          console.log('Cleared invalid token from localStorage');
        } else {
          setError(`Failed to load budget data: ${err.message}`);
        }
        setLoading(false);
      }
    };

    fetchBudgetData();
  }, []);

  const updateCategoryBudget = (index: number, newAmount: number) => {
    setCategories(prev => prev.map((cat, i) =>
      i === index ? { ...cat, budget_limit: newAmount } : cat
    ));
    // Optionally: send PATCH/PUT to backend here
  };

  const getBudgetStatus = (spent: number, allocated: number) => {
    const percentage = (spent / allocated) * 100;
    if (percentage > 100) return { status: 'over', color: 'text-error', icon: AlertTriangle };
    if (percentage > 80) return { status: 'warning', color: 'text-warning', icon: AlertTriangle };
    return { status: 'good', color: 'text-success', icon: CheckCircle };
  };

  // Fallback AI insights using free API
  const getFallbackAIInsights = async (financialData: any): Promise<AIInsight[]> => {
    try {
      setAiInsightsLoading(true);
      
      // Use a free AI service (you can replace with any free AI API)
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a financial advisor. Provide 3 budget insights based on the user\'s financial data. Return only JSON array with objects containing: type (warning/success/suggestion), title, description, action.'
          },
          {
            role: 'user',
            content: `Analyze this financial data and provide budget insights: ${JSON.stringify(financialData)}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || 'sk-free-key'}`,
          'Content-Type': 'application/json'
        }
      });

      const insights = JSON.parse(response.data.choices[0].message.content);
      return insights;
    } catch (error) {
      console.error('AI insights error:', error);
      // Return default insights if API fails
      return [
        {
          type: 'suggestion',
          title: 'Budget Tracking',
          description: 'Start tracking your expenses regularly to get better insights.',
          action: 'Learn More'
        },
        {
          type: 'success',
          title: 'Financial Planning',
          description: 'Consider setting up a monthly budget to control your spending.',
          action: 'Get Started'
        },
        {
          type: 'warning',
          title: 'Savings Goal',
          description: 'Aim to save at least 20% of your income for financial security.',
          action: 'Set Goals'
        }
      ];
    } finally {
      setAiInsightsLoading(false);
    }
  };

  if (loading) return <div>Loading budget data...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const currency = summary?.currency || 'NPR';
  const monthlyIncome = summary?.monthly_income || 0;
  const totalAllocated = categories.reduce((sum, cat) => sum + cat.budget_limit, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.amount_spent, 0);
  const remainingBudget = monthlyIncome - totalAllocated;

  // Generate dynamic AI insights based on real backend data
  const generateAIInsights = (): AIInsight[] => {
    const insights: AIInsight[] = [];
    
    if (!categories.length) return insights;

    // Find categories over budget
    const overBudgetCategories = categories.filter(cat => 
      cat.amount_spent > cat.budget_limit && cat.budget_limit > 0
    );
    
    if (overBudgetCategories.length > 0) {
      const topOverBudget = overBudgetCategories[0];
      insights.push({
        type: 'warning',
        title: `${topOverBudget.name} Over Budget`,
        description: `You've exceeded your ${topOverBudget.name} budget by ${currency} ${(topOverBudget.amount_spent - topOverBudget.budget_limit).toLocaleString()}. Consider reviewing your spending in this category.`,
        action: 'View Tips'
      });
    }

    // Find categories under budget (good performance)
    const underBudgetCategories = categories.filter(cat => 
      cat.amount_spent < cat.budget_limit * 0.8 && cat.budget_limit > 0
    );
    
    if (underBudgetCategories.length > 0) {
      const topUnderBudget = underBudgetCategories[0];
      insights.push({
        type: 'success',
        title: `Great ${topUnderBudget.name} Savings!`,
        description: `You're ${((topUnderBudget.budget_limit - topUnderBudget.amount_spent) / topUnderBudget.budget_limit * 100).toFixed(0)}% under budget for ${topUnderBudget.name}. Keep up the good work!`,
        action: 'See Details'
      });
    }

    // Budget optimization suggestions
    const totalBudgeted = categories.reduce((sum, cat) => sum + cat.budget_limit, 0);
    const totalSpent = categories.reduce((sum, cat) => sum + cat.amount_spent, 0);
    const monthlyIncome = summary?.monthly_income || 0;
    
    if (totalBudgeted > monthlyIncome * 0.9) {
      insights.push({
        type: 'suggestion',
        title: 'Budget Allocation Review',
        description: `Your total budget (${currency} ${totalBudgeted.toLocaleString()}) is ${((totalBudgeted / monthlyIncome) * 100).toFixed(0)}% of your income. Consider reducing some categories to increase savings.`,
        action: 'Apply Changes'
      });
    }

    // Savings rate insights
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - totalSpent) / monthlyIncome * 100) : 0;
    
    if (savingsRate < 10) {
      insights.push({
        type: 'warning',
        title: 'Low Savings Rate',
        description: `Your savings rate is ${savingsRate.toFixed(1)}%. Aim for at least 20% of your income for better financial security.`,
        action: 'Get Tips'
      });
    } else if (savingsRate >= 20) {
      insights.push({
        type: 'success',
        title: 'Excellent Savings!',
        description: `You're saving ${savingsRate.toFixed(1)}% of your income, which is above the recommended 20%. Great job!`,
        action: 'See Details'
      });
    }

    // If no specific insights, provide general advice
    if (insights.length === 0) {
      insights.push({
        type: 'suggestion',
        title: 'Budget Optimization',
        description: 'Your budget looks balanced. Consider tracking your spending more closely to identify potential savings opportunities.',
        action: 'Learn More'
      });
    }

    return insights.slice(0, 3); // Limit to 3 insights
  };

  const aiInsights = generateAIInsights();

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Income</p>
                <p className="text-2xl font-bold text-success">{currency} {monthlyIncome.toLocaleString()}</p>
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
                <p className="text-2xl font-bold">{currency} {totalAllocated.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-error">{currency} {totalSpent.toLocaleString()}</p>
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
                  {currency} {Math.abs(remainingBudget).toLocaleString()}
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
              <Button size="sm" onClick={() => {}}>
                Apply All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categories.map((category, index) => {
              const spentPercentage = (category.amount_spent / (category.budget_limit || 1)) * 100;
              const statusInfo = getBudgetStatus(category.amount_spent, category.budget_limit || 1);
              const StatusIcon = statusInfo.icon;

              return (
                <div key={`category-${index}-${category.name}`} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💰</span>
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {currency} {category.amount_spent} of {currency} {category.budget_limit} spent
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
                      <Label className="text-sm">Budget: {currency} {category.budget_limit}</Label>
                      <Slider
                        value={[category.budget_limit]}
                        onValueChange={(value) => updateCategoryBudget(index, value[0])}
                        max={1000}
                        min={0}
                        step={50}
                        className="mt-2"
                      />
                    </div>
                    {showRecommendations && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">AI Suggests</p>
                        <p className="font-semibold text-primary">{currency} {category.budget_limit}</p>
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
              <div key={`insight-${index}-${insight.title}`} className="flex items-start gap-4 p-4 border rounded-lg">
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