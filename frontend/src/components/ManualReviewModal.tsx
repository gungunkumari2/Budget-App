import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Edit3, 
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

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

interface ManualReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  extractionResult: ExtractionResult | null;
  onConfirm: (correctedData: ExtractionResult) => void;
  onReject: () => void;
}

const CATEGORIES = [
  'Insurance', 'Travel', 'Education', 'Healthcare', 'Shopping',
  'Transportation', 'Food & Dining', 'Groceries', 'Entertainment', 'Utilities'
];

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

export const ManualReviewModal: React.FC<ManualReviewModalProps> = ({
  isOpen,
  onClose,
  extractionResult,
  onConfirm,
  onReject
}) => {
  const [editedData, setEditedData] = useState<ExtractionResult | null>(null);
  const [showRawText, setShowRawText] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'transactions' | 'validation'>('summary');

  useEffect(() => {
    if (extractionResult) {
      setEditedData(JSON.parse(JSON.stringify(extractionResult))); // Deep copy
    }
  }, [extractionResult]);

  if (!extractionResult || !editedData) {
    return null;
  }

  const handleVendorChange = (value: string) => {
    setEditedData(prev => prev ? {
      ...prev,
      extraction_summary: {
        ...prev.extraction_summary,
        vendor: value
      }
    } : null);
  };

  const handleDateChange = (value: string) => {
    setEditedData(prev => prev ? {
      ...prev,
      extraction_summary: {
        ...prev.extraction_summary,
        date: value
      }
    } : null);
  };

  const handleTotalAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0;
    setEditedData(prev => prev ? {
      ...prev,
      extraction_summary: {
        ...prev.extraction_summary,
        total_amount: amount
      }
    } : null);
  };

  const handleTransactionChange = (index: number, field: keyof ExtractedTransaction, value: any) => {
    setEditedData(prev => prev ? {
      ...prev,
      transactions: prev.transactions.map((transaction, i) => 
        i === index ? { ...transaction, [field]: value } : transaction
      )
    } : null);
  };

  const handleConfirm = () => {
    if (editedData) {
      onConfirm(editedData);
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Manual Review Required
          </DialogTitle>
          <DialogDescription>
            Please review and correct the extracted data before saving.
          </DialogDescription>
        </DialogHeader>

        {/* Quality Score Alert */}
        <Alert className={`border-2 ${getQualityColor(editedData.extraction_summary.quality_score)}`}>
          <div className="flex items-center gap-2">
            {getQualityIcon(editedData.extraction_summary.quality_score)}
            <AlertDescription>
              Quality Score: <strong>{editedData.extraction_summary.quality_score.toFixed(2)}</strong>
              {editedData.validation.warnings.length > 0 && (
                <span className="ml-2">• {editedData.validation.warnings.length} warnings</span>
              )}
              {editedData.validation.errors.length > 0 && (
                <span className="ml-2 text-red-600">• {editedData.validation.errors.length} errors</span>
              )}
            </AlertDescription>
          </div>
        </Alert>

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b">
          <Button
            variant={activeTab === 'summary' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('summary')}
          >
            Summary
          </Button>
          <Button
            variant={activeTab === 'transactions' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('transactions')}
          >
            Transactions ({editedData.transactions.length})
          </Button>
          <Button
            variant={activeTab === 'validation' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('validation')}
          >
            Validation
          </Button>
        </div>

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendor">Vendor/Store</Label>
                    <Input
                      id="vendor"
                      value={editedData.extraction_summary.vendor}
                      onChange={(e) => handleVendorChange(e.target.value)}
                      placeholder="Enter vendor name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={editedData.extraction_summary.date}
                      onChange={(e) => handleDateChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total-amount">Total Amount</Label>
                    <Input
                      id="total-amount"
                      type="number"
                      step="0.01"
                      value={editedData.extraction_summary.total_amount}
                      onChange={(e) => handleTotalAmountChange(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={editedData.extraction_summary.currency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Extraction Details</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRawText(!showRawText)}
                  >
                    {showRawText ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showRawText ? 'Hide' : 'Show'} Raw Text
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Confidence:</span>
                    <div className="font-medium">{editedData.extraction_summary.confidence_score.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quality Score:</span>
                    <div className={`font-medium ${getQualityColor(editedData.extraction_summary.quality_score)}`}>
                      {editedData.extraction_summary.quality_score.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Items:</span>
                    <div className="font-medium">{editedData.extraction_summary.total_items}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Categories:</span>
                    <div className="font-medium">{editedData.extraction_summary.categories_found.length}</div>
                  </div>
                </div>

                {showRawText && (
                  <div className="mt-4">
                    <Label>Raw Extracted Text</Label>
                    <div className="mt-2 p-3 bg-muted rounded-md text-sm font-mono max-h-40 overflow-y-auto">
                      {editedData.raw_extraction?.raw_text || 'No raw text available'}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Line Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {editedData.transactions.map((transaction, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Item {index + 1}</h4>
                        <Badge variant={CATEGORY_COLORS[transaction.category as keyof typeof CATEGORY_COLORS] || 'default'}>
                          {transaction.category}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={transaction.description}
                            onChange={(e) => handleTransactionChange(index, 'description', e.target.value)}
                            placeholder="Item description"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Amount</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={transaction.amount}
                            onChange={(e) => handleTransactionChange(index, 'amount', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select
                            value={transaction.category}
                            onValueChange={(value) => handleTransactionChange(index, 'category', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map(category => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Validation Tab */}
        {activeTab === 'validation' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Validation Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editedData.validation.errors.length > 0 && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Errors Found:</strong>
                      <ul className="mt-2 list-disc list-inside">
                        {editedData.validation.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {editedData.validation.warnings.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Warnings:</strong>
                      <ul className="mt-2 list-disc list-inside">
                        {editedData.validation.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {editedData.validation.suggestions.length > 0 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Suggestions:</strong>
                      <ul className="mt-2 list-disc list-inside">
                        {editedData.validation.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Is Valid:</span>
                    <div className="font-medium">
                      {editedData.validation.is_valid ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-red-600">No</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Needs Review:</span>
                    <div className="font-medium">
                      {editedData.validation.needs_review ? (
                        <span className="text-red-600">Yes</span>
                      ) : (
                        <span className="text-green-600">No</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onReject}>
            Reject
          </Button>
          <Button onClick={handleConfirm} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
