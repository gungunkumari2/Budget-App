import { ReceiptUpload } from '@/components/ReceiptUpload';

const Upload = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          Upload Documents
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload receipts, bank statements, and other financial documents for AI processing
        </p>
      </div>
      <ReceiptUpload />
    </div>
  );
};

export default Upload;