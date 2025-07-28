import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/upload-receipt/transactions/')
      .then(res => setTransactions(res.data));
  }, []);

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