import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';

const Analytics = () => {
  // Mock data for analytics
  const mockData = {
    totalProcessed: 1247,
    successRate: 94,
    averageAccuracy: 92,
    processingTime: 2.3,
    trendsData: [
      { name: 'Food', value: 85, color: '#3b82f6' },
      { name: 'Transport', value: 92, color: '#10b981' },
      { name: 'Shopping', value: 78, color: '#f59e0b' },
      { name: 'Bills', value: 96, color: '#8b5cf6' }
    ],
    statusData: [
      { name: 'Processed', value: 156, color: '#10b981' },
      { name: 'Pending', value: 23, color: '#f59e0b' },
      { name: 'Failed', value: 8, color: '#ef4444' }
    ]
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          Financial Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          Deep insights into your spending patterns and financial trends
        </p>
      </div>
      <AnalyticsDashboard data={mockData} />
    </div>
  );
};

export default Analytics;