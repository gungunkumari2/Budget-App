import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface DocumentUploadProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
  uploadProgress: number;
}

export const DocumentUpload = ({ onFileUpload, isProcessing, uploadProgress }: DocumentUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      onFileUpload(file);
    }
  }, [onFileUpload]);

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <FileText className="h-5 w-5" />
          Document Upload
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
            ${dragActive ? 'border-primary bg-primary/5' : 'border-border'}
            ${isProcessing ? 'pointer-events-none opacity-50' : 'hover:border-primary/50 hover:bg-muted/50'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.tiff"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isProcessing}
          />
          
          <div className="space-y-4">
            {!uploadedFile ? (
              <>
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">Drop your document here</p>
                  <p className="text-muted-foreground">or click to browse files</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Supports PDF, JPG, PNG, TIFF formats
                  </p>
                </div>
              </>
            ) : isProcessing ? (
              <>
                <div className="animate-pulse-glow">
                  <FileText className="h-12 w-12 mx-auto text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium">Processing Document</p>
                  <p className="text-muted-foreground">{uploadedFile.name}</p>
                  <Progress value={uploadProgress} className="mt-3" />
                  <p className="text-sm text-muted-foreground mt-2">
                    AI is extracting and validating data...
                  </p>
                </div>
              </>
            ) : (
              <>
                <CheckCircle className="h-12 w-12 mx-auto text-success" />
                <div>
                  <p className="text-lg font-medium text-success">Upload Complete</p>
                  <p className="text-muted-foreground">{uploadedFile.name}</p>
                </div>
              </>
            )}
          </div>
        </div>
        
        {uploadedFile && !isProcessing && (
          <div className="mt-4 flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => {
                setUploadedFile(null);
                const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                if (input) input.value = '';
              }}
            >
              Upload Another Document
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};