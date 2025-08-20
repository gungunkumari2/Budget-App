import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  Receipt, 
  DollarSign, 
  Calendar, 
  Building2,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  AlertTriangle,
  Edit3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';
import { ManualReviewModal } from './ManualReviewModal';

interface ExtractedTransaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  vendor: string;
}

interface ValidationResult {
  is_valid: boolean;
  warnings: string[];
  errors: string[];
  suggestions: string[];
  quality_score: number;
  needs_review: boolean;
}

interface ExtractionResult {
  success: boolean;
  message: string;
  extraction_summary: {
    vendor: string;
    date: string;
    total_amount: number;
    currency: string;
    confidence_score: number;
    quality_score: number;
    total_items: number;
    categories_found: string[];
    needs_review: boolean;
  };
  transactions: ExtractedTransaction[];
  validation: ValidationResult;
  raw_extraction: any;
}

interface BulkExtractionResult {
  success: boolean;
  message: string;
  summary: {
    total_files: number;
    successful_extractions: number;
    failed_extractions: number;
    total_transactions: number;
    total_amount: number;
  };
  results: Array<{
    file_name: string;
    success: boolean;
    transactions_count?: number;
    total_amount?: number;
    vendor?: string;
    date?: string;
    confidence_score?: number;
    quality_score?: number;
    needs_review?: boolean;
    error?: string;
  }>;
}

const CATEGORY_COLORS = {
  'Insurance': 'bg-blue-100 text-blue-800',
  'Travel': 'bg-purple-100 text-purple-800',
  'Education': 'bg-green-100 text-green-800',
  'Healthcare': 'bg-red-100 text-red-800',
  'Shopping': 'bg-pink-100 text-pink-800',
  'Transportation': 'bg-yellow-100 text-yellow-800',
  'Food & Dining': 'bg-orange-100 text-orange-800',
  'Groceries': 'bg-emerald-100 text-emerald-800',
  'Entertainment': 'bg-indigo-100 text-indigo-800',
  'Utilities': 'bg-gray-100 text-gray-800',
  'Uncategorized': 'bg-gray-100 text-gray-600'
};

export const ExpenseExtractor: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionResults, setExtractionResults] = useState<ExtractionResult[]>([]);
  const [bulkResults, setBulkResults] = useState<BulkExtractionResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentReviewResult, setCurrentReviewResult] = useState<ExtractionResult | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setExtractionResults([]);
    setBulkResults(null);

    try {
      if (acceptedFiles.length === 1) {
        // Single file extraction
        await processSingleFile(acceptedFiles[0]);
      } else {
        // Bulk extraction
        await processBulkFiles(acceptedFiles);
      }
    } catch (error) {
      console.error('Extraction error:', error);
      toast({
        title: "Extraction failed",
        description: "Failed to extract expense data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  }, [toast]);

  const processSingleFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    setProgress(30);

    try {
      const response = await apiService.extractExpense(formData);
      setProgress(80);

      if (response.data.success) {
        const result = response.data;
        
        // Check if manual review is needed
        if (result.extraction_summary.needs_review || result.validation.needs_review) {
          setCurrentReviewResult(result);
          setShowReviewModal(true);
        } else {
          setExtractionResults([result]);
          toast({
            title: "Extraction successful",
            description: `Extracted ${result.extraction_summary.total_items} items from ${result.extraction_summary.vendor || 'receipt'}`,
          });
        }
      } else {
        throw new Error(response.data.error || 'Extraction failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to extract expense data');
    }
  };

  const processBulkFiles = async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    setProgress(30);

    try {
      const response = await apiService.extractExpensesBulk(formData);
      setProgress(80);

      if (response.data.success) {
        const result = response.data;
        
        // Check if any files need review
        const needsReview = result.results.some(r => r.needs_review);
        
        if (needsReview) {
          toast({
            title: "Bulk extraction completed",
            description: `${result.summary.successful_extractions} files processed. Some files need manual review.`,
          });
        } else {
          toast({
            title: "Bulk extraction successful",
            description: `Processed ${result.summary.total_files} files with ${result.summary.total_transactions} transactions`,
          });
        }
        
        setBulkResults(result);
      } else {
        throw new Error(response.data.error || 'Bulk extraction failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to extract expense data');
    }
  };

  const handleManualReviewConfirm = (correctedData: ExtractionResult) => {
    setExtractionResults([correctedData]);
    setShowReviewModal(false);
    setCurrentReviewResult(null);
    
    toast({
      title: "Data saved",
      description: "Extracted data has been reviewed and saved successfully.",
    });
  };

  const handleManualReviewReject = () => {
    setShowReviewModal(false);
    setCurrentReviewResult(null);
    
    toast({
      title: "Extraction rejected",
      description: "The extraction has been rejected. Please try again with a different file.",
      variant: "destructive",
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const downloadResults = (format: 'json' | 'csv') => {
    if (extractionResults.length === 0 && !bulkResults) return;

    let data: any;
    let filename: string;

    if (bulkResults) {
      data = bulkResults;
      filename = `bulk_extraction_results.${format}`;
    } else {
      data = extractionResults[0];
      filename = `expense_extraction_${new Date().toISOString().split('T')[0]}.${format}`;
    }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV export logic
      const csvContent = convertToCSV(data);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }

    toast({
      title: "Download started",
      description: `Results exported as ${format.toUpperCase()}`,
    });
  };

  const convertToCSV = (data: any): string => {
    if (bulkResults) {
      // Handle bulk results CSV
      const headers = ['File Name', 'Success', 'Transactions', 'Total Amount', 'Vendor', 'Date', 'Quality Score', 'Needs Review'];
      const rows = data.results.map((result: any) => [
        result.file_name,
        result.success ? 'Yes' : 'No',
        result.transactions_count || 0,
        result.total_amount || 0,
        result.vendor || '',
        result.date || '',
        result.quality_score?.toFixed(2) || '',
        result.needs_review ? 'Yes' : 'No'
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    } else {
      // Handle single extraction CSV
      const result = extractionResults[0];
      const headers = ['Vendor', 'Date', 'Total Amount', 'Currency', 'Category', 'Description', 'Amount'];
      const rows = result.transactions.map(transaction => [
        result.extraction_summary.vendor,
        result.extraction_summary.date,
        result.extraction_summary.total_amount,
        result.extraction_summary.currency,
        transaction.category,
        transaction.description,
        transaction.amount
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityIcon = (score: number) => {
    if (score >= 0.8) return <CheckCircle className="h-4 w-4" />;
    if (score >= 0.6) return <AlertTriangle className="h-4 w-4" />;
    return <XCircle className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Receipts & Bills
          </CardTitle>
          <CardDescription>
            Upload images or PDFs of receipts and bills to extract expense data automatically.
            Supports JPG, PNG, and PDF formats.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-muted-foreground mb-4">
              or click to select files
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>JPG, PNG</span>
              </div>
              <div className="flex items-center gap-1">
                <Receipt className="h-4 w-4" />
                <span>PDF</span>
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="mt-4">
              <Progress value={progress} className="mb-2" />
              <p className="text-sm text-muted-foreground text-center">
                Processing... {progress}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Single File Results */}
      {extractionResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Extraction Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {extractionResults.map((result, index) => (
              <div key={index} className="space-y-4">
                {/* Quality Alert */}
                {result.extraction_summary.needs_review && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      This extraction needs manual review. Quality score: {result.extraction_summary.quality_score.toFixed(2)}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {result.extraction_summary.currency} {result.extraction_summary.total_amount.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Amount</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{result.extraction_summary.total_items}</div>
                    <div className="text-sm text-muted-foreground">Items</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className={`text-2xl font-bold ${getQualityColor(result.extraction_summary.quality_score)}`}>
                      {result.extraction_summary.quality_score.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Quality Score</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{result.extraction_summary.confidence_score.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Confidence</div>
                  </div>
                </div>

                {/* Vendor & Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Vendor:</span>
                    <span>{result.extraction_summary.vendor || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Date:</span>
                    <span>{result.extraction_summary.date || 'Unknown'}</span>
                  </div>
                </div>

                {/* Transactions */}
                <div>
                  <h4 className="font-medium mb-3">Line Items</h4>
                  <div className="space-y-2">
                    {result.transactions.map((transaction, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge 
                            className={CATEGORY_COLORS[transaction.category as keyof typeof CATEGORY_COLORS] || 'bg-gray-100 text-gray-600'}
                          >
                            {transaction.category}
                          </Badge>
                          <span>{transaction.description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{transaction.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Validation Warnings */}
                {result.validation.warnings.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Warnings:</strong> {result.validation.warnings.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button onClick={() => downloadResults('json')} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                  <Button onClick={() => downloadResults('csv')} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  {result.extraction_summary.needs_review && (
                    <Button onClick={() => {
                      setCurrentReviewResult(result);
                      setShowReviewModal(true);
                    }} className="flex items-center gap-2">
                      <Edit3 className="h-4 w-4" />
                      Review & Edit
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Bulk Results */}
      {bulkResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Bulk Extraction Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{bulkResults.summary.total_files}</div>
                <div className="text-sm text-muted-foreground">Total Files</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">{bulkResults.summary.successful_extractions}</div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-red-600">{bulkResults.summary.failed_extractions}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{bulkResults.summary.total_transactions}</div>
                <div className="text-sm text-muted-foreground">Transactions</div>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {bulkResults.results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{result.file_name}</span>
                    {result.success ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Success
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Failed</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {result.success && (
                      <>
                        <span>{result.transactions_count} items</span>
                        <span>{result.total_amount?.toFixed(2)}</span>
                        {result.needs_review && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            Needs Review
                          </Badge>
                        )}
                      </>
                    )}
                    {!result.success && (
                      <span className="text-red-600">{result.error}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={() => downloadResults('json')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
              <Button onClick={() => downloadResults('csv')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Review Modal */}
      <ManualReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        extractionResult={currentReviewResult}
        onConfirm={handleManualReviewConfirm}
        onReject={handleManualReviewReject}
      />
    </div>
  );
}; 