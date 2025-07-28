import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';

export const ExpenseChart = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [currency, setCurrency] = useState('NPR');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:8000/api/upload-receipt/budget-categories/')
      .then(res => {
        setCategories(res.data);
        if (res.data.length > 0 && res.data[0].currency) {
          setCurrency(res.data[0].currency);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load expense breakdown');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading expense breakdown...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const totalSpent = categories.reduce((sum, cat) => sum + (cat.amount_spent || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Expense Breakdown
        </CardTitle>
        <CardDescription>Spending by category this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="w-40 h-40 rounded-full bg-gray-100 flex flex-col items-center justify-center text-2xl font-bold mb-6">
            {currency} {totalSpent.toLocaleString()}
            <span className="text-base font-normal text-muted-foreground">Total Spent</span>
          </div>
          <div className="w-full space-y-3">
            {categories.map((cat, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></span>
                  <span className="font-medium">{cat.category_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{currency} {cat.amount_spent}</span>
                  <Badge variant={cat.status === 'danger' ? 'destructive' : cat.status === 'warning' ? 'secondary' : 'default'}>
                    {cat.percent_spent}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};