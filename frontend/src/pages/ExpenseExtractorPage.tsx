import React from 'react';
import { ExpenseExtractor } from '@/components/ExpenseExtractor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Receipt, FileText, Download, CheckCircle } from 'lucide-react';

export default function ExpenseExtractorPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Expense Receipt Scanner</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Upload receipts and bills to automatically extract and categorize your expenses. 
          Supports JPG, PNG, and PDF files with intelligent categorization.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="text-center">
            <Receipt className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <CardTitle className="text-lg">Multi-Format Support</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Upload JPG, PNG images or PDF files. Our OCR technology extracts text from any receipt format.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <CardTitle className="text-lg">Smart Categorization</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Automatically categorizes expenses into 10 predefined categories using AI-powered analysis.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Download className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <CardTitle className="text-lg">Export Options</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Download results in JSON or CSV format, or save directly to your SmartBudget account.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Supported Categories
          </CardTitle>
          <CardDescription>
            Your expenses will be automatically categorized into these categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">Insurance</Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">Travel</Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">Education</Badge>
            <Badge variant="secondary" className="bg-red-100 text-red-800">Healthcare</Badge>
            <Badge variant="secondary" className="bg-pink-100 text-pink-800">Shopping</Badge>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Transportation</Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">Food & Dining</Badge>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Groceries</Badge>
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">Entertainment</Badge>
            <Badge variant="secondary" className="bg-gray-100 text-gray-800">Utilities</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Extractor Component */}
      <ExpenseExtractor />
    </div>
  );
} 