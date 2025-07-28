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
    const fetchCategories = async () => {
      setLoading(true);
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

        const res = await axios.get('http://localhost:8000/api/upload-receipt/budget-categories/', config);
        setCategories(res.data);
        if (res.data.length > 0 && res.data[0].currency) {
          setCurrency(res.data[0].currency);
        }
        setLoading(false);
      } catch (err: any) {
        console.error('Categories fetch error:', err);
        if (err.response?.status === 401) {
          setError('Authentication expired. Please log in again.');
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else {
          setError('Failed to load expense breakdown');
        }
        setLoading(false);
      }
    };

    fetchCategories();
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
              <div key={`category-${i}-${cat.name}`} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></span>
                  <span className="font-medium">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{currency} {cat.amount_spent}</span>
                  <Badge variant={cat.status === 'over' ? 'destructive' : cat.status === 'normal' ? 'default' : 'secondary'}>
                    {cat.percentage_used}%
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