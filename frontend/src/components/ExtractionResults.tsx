import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertTriangle, Edit, Save, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface FieldData {
  id: string;
  label: string;
  value: string;
  confidence: number;
  status: 'valid' | 'warning' | 'error';
  suggestion?: string;
}

interface ExtractionResultsProps {
  extractedData: FieldData[];
  onUpdateField: (id: string, value: string) => void;
  onAcceptSuggestion: (id: string) => void;
}

export const ExtractionResults = ({ extractedData, onUpdateField, onAcceptSuggestion }: ExtractionResultsProps) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (field: FieldData) => {
    setEditingField(field.id);
    setEditValue(field.value);
  };

  const handleSave = (id: string) => {
    onUpdateField(id, editValue);
    setEditingField(null);
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-error" />;
      default:
        return null;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-success';
    if (confidence >= 0.7) return 'text-warning';
    return 'text-error';
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Extracted Data</span>
          <Badge variant="outline" className="text-sm">
            {extractedData.filter(f => f.status === 'valid').length}/{extractedData.length} Fields Valid
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {extractedData.map((field) => (
          <div key={field.id} className="space-y-2 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <Label className="font-medium">{field.label}</Label>
              <div className="flex items-center gap-2">
                {getStatusIcon(field.status)}
                <span className={`text-sm font-mono ${getConfidenceColor(field.confidence)}`}>
                  {Math.round(field.confidence * 100)}%
                </span>
              </div>
            </div>
            
            <Progress 
              value={field.confidence * 100} 
              className={`h-1 ${field.confidence >= 0.7 ? '' : 'opacity-60'}`}
            />
            
            {editingField === field.id ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                <Button size="sm" onClick={() => handleSave(field.id)} variant="outline">
                  <Save className="h-3 w-3" />
                </Button>
                <Button size="sm" onClick={handleCancel} variant="outline">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className={`font-mono ${field.status === 'error' ? 'text-error' : ''}`}>
                  {field.value || 'No data extracted'}
                </span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => handleEdit(field)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {field.suggestion && field.status !== 'valid' && (
              <div className="mt-2 p-2 bg-warning-light rounded border-l-4 border-warning">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">AI Suggestion</p>
                    <p className="text-sm font-mono">{field.suggestion}</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => onAcceptSuggestion(field.id)}
                    className="ml-2"
                  >
                    Accept
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};