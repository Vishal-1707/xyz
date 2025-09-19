import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyProfile } from '@/contexts/FamilyProfileContext';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, Image, File, X, Loader2 } from 'lucide-react';

interface ReportUploadProps {
  onUploadComplete: () => void;
}

const ReportUpload = ({ onUploadComplete }: ReportUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationStep, setValidationStep] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentProfile } = useFamilyProfile();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.includes('pdf') || 
                         file.type.includes('image') || 
                         file.type.includes('text') ||
                         file.name.toLowerCase().includes('.lab') ||
                         file.name.toLowerCase().includes('.report');
      const isValidSize = file.size <= 20 * 1024 * 1024; // 20MB limit
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported format. Please upload PDF, images, or text files.`,
          variant: "destructive",
        });
      }
      
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 20MB limit.`,
          variant: "destructive",
        });
      }
      
      return isValidType && isValidSize;
    });
    
    setSelectedFiles(validFiles);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (file.type.includes('image')) return <Image className="h-5 w-5 text-blue-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type.includes('text')) {
      return await file.text();
    }
    
    if (file.type.includes('image')) {
      // For images, we'll send the file directly to analysis
      return `Image file: ${file.name} - Content will be analyzed by AI vision`;
    }
    
    if (file.type.includes('pdf')) {
      // For PDFs, we'll indicate it needs processing
      return `PDF file: ${file.name} - Content will be extracted and analyzed`;
    }
    
    return `File: ${file.name} - Content type: ${file.type}`;
  };

  const handleAnalyze = async (reportData: string) => {
    try {
      const response = await fetch('/api/analyze-report', {
        method: 'POST',
        body: JSON.stringify({ report: reportData }),
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.error) {
        setError(result.error); // Show error to user
      } else {
        setSummary(result.summary);
      }
    } catch (err) {
      setError('Failed to analyze report.');
    }
  };

  const uploadFiles = async () => {
    if (!user || !currentProfile || selectedFiles.length === 0) {
      toast({
        title: "Profile required",
        description: "Please select a family profile to upload files",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        // Upload file to storage
        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('medical-reports')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Extract text content
        const extractedText = await extractTextFromFile(file);

        // Create database record
        const { data: reportData, error: dbError } = await supabase
          .from('medical_reports')
          .insert({
            user_id: user.id,
            profile_id: currentProfile.profile_id,
            file_name: file.name,
            file_path: fileName,
            file_type: file.type,
          })
          .select()
          .single();

        if (dbError) throw dbError;

        setProgress((index + 1) / selectedFiles.length * 50);
        return { reportData, extractedText };
      });

      const results = await Promise.all(uploadPromises);
      setUploading(false);
      setValidating(true);
      setValidationStep('Checking file types...');

      // Analyze each uploaded report with validation
      const analysisPromises = results.map(async ({ reportData, extractedText }, index) => {
        try {
          setValidationStep(`Validating ${reportData.file_name}...`);
          
          const { data, error } = await supabase.functions.invoke('analyze-report', {
            body: {
              reportText: extractedText,
              reportId: reportData.id,
            },
          });

          if (error) throw error;

          // Check if validation failed
          if (data?.validation_failed) {
            toast({
              title: "⚠️ Non-Medical Document Detected",
              description: `${reportData.file_name} does not appear to be a medical report. ${data.validation_message}`,
              variant: "destructive",
            });
          } else if (data?.success) {
            setValidationStep(`Analyzing ${reportData.file_name}...`);
          }

          setProgress(50 + ((index + 1) / results.length * 50));
        } catch (error) {
          console.error('Analysis error for report:', reportData.id, error);
          toast({
            title: "Processing Error",
            description: `Failed to process ${reportData.file_name}. You can retry later.`,
            variant: "destructive",
          });
        }
      });

      await Promise.all(analysisPromises);

      const successCount = results.length;
      toast({
        title: "Upload Complete!",
        description: `Processed ${successCount} file(s). Check reports page for validation results.`,
      });

      setSelectedFiles([]);
      setProgress(100);
      onUploadComplete();

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your reports. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setValidating(false);
      setAnalyzing(false);
      setProgress(0);
      setValidationStep('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Medical Reports
        </CardTitle>
        <CardDescription>
          Upload medical reports (lab results, prescriptions, medical imaging) for AI analysis.
          Non-medical documents will be detected and rejected.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Input */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Drop files here or click to browse</h3>
          <p className="text-gray-500 mb-4">
            Supports PDF, images, and text files up to 20MB each
          </p>
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || analyzing}
          >
            Choose Files
          </Button>
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Selected Files ({selectedFiles.length})</h4>
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  {getFileIcon(file)}
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{file.type.split('/')[1]?.toUpperCase() || 'FILE'}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={uploading || analyzing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Progress */}
        {(uploading || validating || analyzing) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {uploading && 'Uploading files...'}
                {validating && (validationStep || 'Validating documents...')}
                {analyzing && 'Processing analysis...'}
              </span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            
            {validating && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking if documents are medical reports...
              </div>
            )}
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={uploadFiles}
          disabled={selectedFiles.length === 0 || uploading || validating || analyzing}
          className="w-full"
          size="lg"
        >
          {uploading || validating || analyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {uploading && 'Uploading...'}
              {validating && 'Validating...'}
              {analyzing && 'Analyzing...'}
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload & Analyze ({selectedFiles.length} files)
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ReportUpload;