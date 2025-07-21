import { BudgetPlanner } from '@/components/BudgetPlanner';

const BudgetPage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          Budget Planning
        </h1>
        <p className="text-muted-foreground mt-2">
          Set and manage your budget goals with AI-powered recommendations
        </p>
      </div>
      <BudgetPlanner />
    </div>
  );
};

export default BudgetPage;