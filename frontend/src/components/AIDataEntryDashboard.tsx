import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentUpload } from './DocumentUpload';
import { ExtractionResults } from './ExtractionResults';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { Brain, Database, Shield, Cpu, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FieldData {
  id: string;
  label: string;
  value: string;
  confidence: number;
  status: 'valid' | 'warning' | 'error';
  suggestion?: string;
}

export const AIDataEntryDashboard = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<FieldData[]>([]);
  const [activeTab, setActiveTab] = useState('upload');

  // Mock analytics data
  const analyticsData = {
    totalProcessed: 1247,
    successRate: 94,
    averageAccuracy: 92,
    processingTime: 2.3,
    trendsData: [
      { name: 'Invoice Numbers', value: 98, color: 'hsl(var(--success))' },
      { name: 'Dates', value: 95, color: 'hsl(var(--primary))' },
      { name: 'Amounts', value: 89, color: 'hsl(var(--warning))' },
      { name: 'Names', value: 85, color: 'hsl(var(--accent))' }
    ],
    statusData: [
      { name: 'Processed', value: 1150, color: 'hsl(var(--success))' },
      { name: 'Processing', value: 45, color: 'hsl(var(--warning))' },
      { name: 'Failed', value: 52, color: 'hsl(var(--error))' }
    ]
  };

  const mockExtractedData: FieldData[] = [
    {
      id: '1',
      label: 'Invoice Number',
      value: 'INV-2024-001',
      confidence: 0.98,
      status: 'valid'
    },
    {
      id: '2',
      label: 'Date',
      value: '2024-01-15',
      confidence: 0.92,
      status: 'valid'
    },
    {
      id: '3',
      label: 'Total Amount',
      value: '$1,234.56',
      confidence: 0.87,
      status: 'warning',
      suggestion: '$1,234.50'
    },
    {
      id: '4',
      label: 'Vendor Name',
      value: 'Acme Corp',
      confidence: 0.65,
      status: 'error',
      suggestion: 'ACME Corporation'
    },
    {
      id: '5',
      label: 'Tax Amount',
      value: '$123.45',
      confidence: 0.94,
      status: 'valid'
    }
  ];

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setUploadProgress(0);
    setActiveTab('results');

    // Simulate processing with progress updates
    const progressSteps = [
      { step: 20, message: 'Uploading document...' },
      { step: 40, message: 'Extracting text with OCR...' },
      { step: 60, message: 'Processing with NLP...' },
      { step: 80, message: 'Validating data...' },
      { step: 100, message: 'Complete!' }
    ];

    for (const progress of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUploadProgress(progress.step);
    }

    // Set mock extracted data
    setExtractedData(mockExtractedData);
    setIsProcessing(false);
  };

  const handleUpdateField = (id: string, value: string) => {
    setExtractedData(prev => 
      prev.map(field => 
        field.id === id 
          ? { ...field, value, status: 'valid' as const, confidence: 0.99 }
          : field
      )
    );
  };

  const handleAcceptSuggestion = (id: string) => {
    setExtractedData(prev => 
      prev.map(field => 
        field.id === id && field.suggestion
          ? { ...field, value: field.suggestion, status: 'valid' as const, confidence: 0.95, suggestion: undefined }
          : field
      )
    );
  };

  const serviceBadges = [
    { name: 'OCR Service', status: 'active', icon: Brain },
    { name: 'NLP Engine', status: 'active', icon: Cpu },
    { name: 'Validation AI', status: 'active', icon: Shield },
    { name: 'Data Store', status: 'active', icon: Database }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Data Entry System</h1>
                <p className="text-sm text-muted-foreground">Automated Document Processing</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {serviceBadges.map((service, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    <service.icon className="h-3 w-3" />
                    <span className="text-xs">{service.name}</span>
                    <div className="w-2 h-2 rounded-full bg-success" />
                  </Badge>
                ))}
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Document Upload</TabsTrigger>
            <TabsTrigger value="results">Extraction Results</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="upload" className="space-y-6">
              <DocumentUpload
                onFileUpload={handleFileUpload}
                isProcessing={isProcessing}
                uploadProgress={uploadProgress}
              />
              
              {/* Recent uploads preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Uploads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground text-center py-8">
                    Upload your first document to get started with AI-powered data extraction
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              {extractedData.length > 0 ? (
                <ExtractionResults
                  extractedData={extractedData}
                  onUpdateField={handleUpdateField}
                  onAcceptSuggestion={handleAcceptSuggestion}
                />
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Data Extracted Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload a document to see AI-powered data extraction in action
                    </p>
                    <Button onClick={() => setActiveTab('upload')}>
                      Upload Document
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analytics">
              <AnalyticsDashboard data={analyticsData} />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};