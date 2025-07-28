import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
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

        const res = await axios.get('http://localhost:8000/api/upload-receipt/transactions/', config);
        setTransactions(res.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Transactions fetch error:', err);
        if (err.response?.status === 401) {
          setError('Authentication expired. Please log in again.');
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else {
          setError('Failed to load transactions. Please try again.');
        }
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) return <div className="text-center py-4">Loading transactions...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">All Transactions</h2>
      <table className="min-w-full border text-sm">
        <thead>
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Description</th>
            <th className="border px-2 py-1">Amount</th>
            <th className="border px-2 py-1">Category</th>
            <th className="border px-2 py-1">Date</th>
            <th className="border px-2 py-1">Created At</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx: any) => (
            <tr key={tx.id}>
              <td className="border px-2 py-1">{tx.id}</td>
              <td className="border px-2 py-1">{tx.description}</td>
              <td className="border px-2 py-1">{tx.amount}</td>
              <td className="border px-2 py-1">{tx.category}</td>
              <td className="border px-2 py-1">{tx.date}</td>
              <td className="border px-2 py-1">{tx.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 