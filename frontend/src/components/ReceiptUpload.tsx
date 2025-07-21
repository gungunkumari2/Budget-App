import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Camera, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

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
    text?: string; // Added for text extraction
    csv?: any[]; // Added for CSV extraction
  };
}

export const ReceiptUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((files: FileList) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const newFiles: UploadedFile[] = Array.from(files)
      .filter(file => allowedTypes.includes(file.type) || file.name.endsWith('.csv'))
      .map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        status: 'uploading' as const,
        progress: 0,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      }));

    if (newFiles.length === 0) {
      toast({
        title: 'Unsupported file type',
        description: 'Only JPG, PNG, PDF, and CSV files are allowed.',
        variant: 'destructive',
      });
      return;
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    toast({
      title: 'Files uploaded successfully',
      description: `Ready to process ${newFiles.length} file(s)...`,
    });
  }, [toast]);

  // Remove simulateProcessing

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

  // Backend submission
  const handleSubmitToBackend = async () => {
    setIsSubmitting(true);
    const updatedFiles = await Promise.all(
      uploadedFiles.map(async (file) => {
        if (file.status === 'completed') return file;
        try {
          const formData = new FormData();
          formData.append('file', file.file);
          const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
          const response = await axios.post(`${BACKEND_URL}/api/upload-receipt/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const data = response.data;
          let extractedData = undefined;
          if (data.type === 'csv') {
            extractedData = { ...file.extractedData, ...{ csv: data.data } };
          } else if (data.type === 'image' || data.type === 'pdf') {
            extractedData = { ...file.extractedData, ...{ text: data.text } };
          }
          return {
            ...file,
            status: 'completed' as UploadedFile['status'],
            progress: 100,
            extractedData,
          };
        } catch (err) {
          return {
            ...file,
            status: 'error' as UploadedFile['status'],
            progress: 100,
          };
        }
      })
    );
    setUploadedFiles(updatedFiles as UploadedFile[]);
    setIsSubmitting(false);
    toast({
      title: 'Processing complete',
      description: 'All files have been processed by the backend.',
    });
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
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: 'pointer' }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,.csv"
              multiple
              className="hidden"
              onChange={e => {
                if (e.target.files) handleFileUpload(e.target.files);
              }}
            />
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
                <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  <FileText className="h-4 w-4 mr-2" />
                  Browse Files
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
                <Button variant="outline" size="sm" disabled>
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
                    {file.preview ? (
                      <img 
                        src={file.preview} 
                        alt="Receipt preview" 
                        className="w-16 h-16 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center rounded border bg-muted">
                        {file.file.type === 'application/pdf' || file.file.name.endsWith('.pdf') ? (
                          <FileText className="h-8 w-8 text-primary" />
                        ) : file.file.type.includes('csv') || file.file.name.endsWith('.csv') ? (
                          <FileText className="h-8 w-8 text-accent" />
                        ) : (
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
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
                        <div className="pt-2">
                          {file.extractedData.text && (
                            <div className="bg-muted rounded p-2 text-xs whitespace-pre-wrap max-h-40 overflow-auto">
                              {file.extractedData.text}
                            </div>
                          )}
                          {file.extractedData.csv && Array.isArray(file.extractedData.csv) && (
                            <div className="overflow-x-auto mt-2">
                              <table className="min-w-full text-xs border">
                                <thead>
                                  <tr>
                                    {Object.keys(file.extractedData.csv[0] || {}).map((col) => (
                                      <th key={col} className="border px-2 py-1 bg-muted-foreground/10">{col}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {file.extractedData.csv.map((row: any, i: number) => (
                                    <tr key={i}>
                                      {Object.values(row).map((val, j) => (
                                        <td key={j} className="border px-2 py-1">{val as string}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-6 w-full" size="lg" onClick={handleSubmitToBackend} disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Submit All to Backend'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};