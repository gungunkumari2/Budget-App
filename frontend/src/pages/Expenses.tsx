import ExpenseList from '@/components/ExpenseList';

const ExpensesPage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          Expenses
        </h1>
        <p className="text-muted-foreground mt-2">
          Track and manage your expenses with detailed filtering and analytics
        </p>
      </div>
      <ExpenseList />
    </div>
  );
};

export default ExpensesPage; 