
import React, { useState, useRef } from "react";
import { Upload, X, Check, Image, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

interface FileUploadFieldProps {
  id: string;
  label: string;
  accept: string;
  multiple?: boolean;
  onChange: (files: File[] | FileList) => void;
  onPreview?: (dataUrl: string) => void;
  previewUrl?: string;
  form?: any;
  name?: string;
  required?: boolean;
}

const FileUploadField = ({
  id,
  label,
  accept,
  multiple = false,
  onChange,
  onPreview,
  previewUrl,
  form,
  name,
  required = false,
}: FileUploadFieldProps) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [fileSelected, setFileSelected] = useState(!!previewUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files: FileList | File[]) => {
    if (files.length === 0) return;

    // Validate file types
    const validFiles = Array.from(files).filter(file => {
      const fileType = file.type;
      if (accept.includes('*')) return true;
      if (accept.includes(fileType)) return true;
      
      // Check extensions
      const extensions = accept.split(',').map(ext => ext.trim());
      const fileName = file.name.toLowerCase();
      return extensions.some(ext => 
        ext.startsWith('.') && fileName.endsWith(ext.toLowerCase())
      );
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid file type",
        description: "Please upload files with the correct format.",
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      onChange(validFiles);
      setFileSelected(true);
      
      // If we need to preview the first file
      if (onPreview && validFiles[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            onPreview(e.target.result as string);
          }
        };
        reader.readAsDataURL(validFiles[0]);
      }

      toast({
        title: "Files selected",
        description: `${validFiles.length} file(s) selected successfully.`,
      });
    }
  };

  const renderContent = () => {
    if (fileSelected && previewUrl) {
      const isImage = previewUrl.startsWith('data:image');
      return (
        <div className="relative w-full">
          {isImage ? (
            <div className="relative">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="max-w-full h-auto max-h-40 mx-auto rounded border" 
              />
              <div className="absolute top-0 right-0 bg-background/80 p-1 rounded-bl">
                <Check className="h-4 w-4 text-green-500" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-4 border rounded bg-muted/20">
              <FileText className="h-8 w-8 text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground">File selected</span>
              <Check className="h-4 w-4 text-green-500 ml-2" />
            </div>
          )}
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="absolute top-0 right-0"
            onClick={() => {
              setFileSelected(false);
              if (fileInputRef.current) fileInputRef.current.value = '';
              if (form && name) form.setValue(name, '');
              if (onPreview) onPreview('');
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <div 
        className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50'}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-sm text-center text-muted-foreground mb-1">
          Drag & drop your files here or click to browse
        </p>
        <p className="text-xs text-center text-muted-foreground">
          {accept === 'image/*' 
            ? 'Supported formats: JPG, PNG, GIF, WebP' 
            : accept === 'application/pdf' 
              ? 'PDF files only' 
              : `Accepted formats: ${accept}`}
        </p>
      </div>
    );
  };

  if (form && name) {
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel required={required}>{label}</FormLabel>
            <FormControl>
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Input
                  id={id}
                  type="file"
                  accept={accept}
                  multiple={multiple}
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFiles(e.target.files);
                      field.onChange(e.target.files[0]);
                    }
                  }}
                />
                {renderContent()}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={`block ${required ? 'after:content-["*"] after:ml-1 after:text-destructive' : ''}`}>
        {label}
      </Label>
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Input
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
            }
          }}
        />
        {renderContent()}
      </div>
    </div>
  );
};

export default FileUploadField;
