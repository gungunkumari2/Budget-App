import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Camera, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  extractedData?: {
    amount?: string;
    merchant?: string;
    date?: string;
    category?: string;
  };
}

export const ReceiptUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = useCallback((files: FileList) => {
    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'uploading' as const,
      progress: 0,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Simulate processing
    newFiles.forEach(uploadFile => {
      simulateProcessing(uploadFile.id);
    });

    toast({
      title: "Files uploaded successfully",
      description: `Processing ${newFiles.length} file(s)...`,
    });
  }, [toast]);

  const simulateProcessing = (fileId: string) => {
    const interval = setInterval(() => {
      setUploadedFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          if (file.progress < 100) {
            return { ...file, progress: file.progress + 10 };
          } else {
            clearInterval(interval);
            return {
              ...file,
              status: 'completed',
              extractedData: {
                amount: '$' + (Math.random() * 100 + 10).toFixed(2),
                merchant: ['Starbucks', 'Amazon', 'Walmart', 'Target'][Math.floor(Math.random() * 4)],
                date: new Date().toLocaleDateString(),
                category: ['Food & Dining', 'Shopping', 'Groceries', 'Entertainment'][Math.floor(Math.random() * 4)]
              }
            };
          }
        }
        return file;
      }));
    }, 200);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-error" />;
    }
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return 'bg-warning/10 text-warning-foreground border-warning/20';
      case 'completed':
        return 'bg-success/10 text-success-foreground border-success/20';
      case 'error':
        return 'bg-error/10 text-error-foreground border-error/20';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Receipts & Statements
          </CardTitle>
          <CardDescription>
            Upload receipts, bank statements, or invoices for AI-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Drop files here or click to upload</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports JPG, PNG, PDF, CSV files up to 10MB
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Browse Files
                </Button>
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
                <Button variant="outline" size="sm">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Bank Import
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Results</CardTitle>
            <CardDescription>
              AI is extracting and categorizing your financial data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    {file.preview && (
                      <img 
                        src={file.preview} 
                        alt="Receipt preview" 
                        className="w-16 h-16 object-cover rounded border"
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{file.file.name}</h4>
                          <Badge className={getStatusColor(file.status)}>
                            {getStatusIcon(file.status)}
                            <span className="ml-1 capitalize">{file.status}</span>
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      
                      {file.status !== 'completed' && (
                        <Progress value={file.progress} className="h-2" />
                      )}
                      
                      {file.extractedData && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Amount</p>
                            <p className="font-semibold text-lg">{file.extractedData.amount}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Merchant</p>
                            <p className="font-medium">{file.extractedData.merchant}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Date</p>
                            <p className="font-medium">{file.extractedData.date}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Category</p>
                            <Badge variant="secondary">{file.extractedData.category}</Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};