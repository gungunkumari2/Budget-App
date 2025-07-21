import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SimpleChart } from './SimpleChart';
import { TrendingUp, TrendingDown, Activity, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface AnalyticsData {
  totalProcessed: number;
  successRate: number;
  averageAccuracy: number;
  processingTime: number;
  trendsData: Array<{ name: string; value: number; color: string }>;
  statusData: Array<{ name: string; value: number; color: string }>;
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
}

export const AnalyticsDashboard = ({ data }: AnalyticsDashboardProps) => {
  const metrics = [
    {
      title: 'Documents Processed',
      value: data.totalProcessed,
      icon: Activity,
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Success Rate',
      value: `${data.successRate}%`,
      icon: CheckCircle,
      trend: '+5%',
      trendUp: true
    },
    {
      title: 'Average Accuracy',
      value: `${data.averageAccuracy}%`,
      icon: TrendingUp,
      trend: '+2%',
      trendUp: true
    },
    {
      title: 'Avg Processing Time',
      value: `${data.processingTime}s`,
      icon: Clock,
      trend: '-8%',
      trendUp: true
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <metric.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="mt-2 flex items-center">
                {metric.trendUp ? (
                  <TrendingUp className="h-3 w-3 text-success mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-error mr-1" />
                )}
                <span className={`text-xs ${metric.trendUp ? 'text-success' : 'text-error'}`}>
                  {metric.trend}
                </span>
                <span className="text-xs text-muted-foreground ml-1">vs last week</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart
          title="Field Extraction Accuracy"
          data={data.trendsData}
          type="progress"
        />
        
        <SimpleChart
          title="Document Status Distribution"
          data={data.statusData}
          type="bar"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Processing Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: '2 min ago', doc: 'Invoice_2024_001.pdf', status: 'success', accuracy: 98 },
              { time: '5 min ago', doc: 'Medical_Record_789.jpg', status: 'warning', accuracy: 85 },
              { time: '8 min ago', doc: 'Application_Form_456.pdf', status: 'success', accuracy: 95 },
              { time: '12 min ago', doc: 'Receipt_Scanner_123.png', status: 'error', accuracy: 65 }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-success' :
                    activity.status === 'warning' ? 'bg-warning' : 'bg-error'
                  }`} />
                  <div>
                    <p className="font-medium text-sm">{activity.doc}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={activity.status === 'success' ? 'default' : 'secondary'}
                    className={
                      activity.status === 'success' ? 'bg-success text-success-foreground' :
                      activity.status === 'warning' ? 'bg-warning text-warning-foreground' :
                      'bg-error text-error-foreground'
                    }
                  >
                    {activity.accuracy}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};