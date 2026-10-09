import { Upload, Loader2 } from "lucide-react";
import React from "react";

interface UploadZoneProps {
  isScanning: boolean;
  progress: number;
  onFilesSelected: (files: FileList | File[]) => void;
}

export function UploadZone({ isScanning, progress, onFilesSelected }: UploadZoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isScanning) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (isScanning) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
  };
  return (
    <div 
      className="rounded-2xl border border-outline-variant bg-surface p-8 shadow-sm"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <label
        htmlFor="screenshot-upload"
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all ${
          isDragging ? "border-primary bg-primary/5" : "border-outline-variant bg-surface-variant/30 hover:bg-surface-variant/50 hover:border-primary/50"
        } ${isScanning ? "opacity-60 pointer-events-none" : ""}`}
      >
        {isScanning ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <span className="text-lg font-medium text-on-surface">Scanning Images... {progress}%</span>
            <div className="w-64 h-2 bg-surface-variant rounded-full overflow-hidden mt-4">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="p-4 bg-primary/10 rounded-full mb-2 text-primary">
              <Upload className="h-10 w-10" />
            </div>
            <span className="text-xl font-semibold text-on-surface">Click to upload or drag & drop</span>
            <span className="text-sm text-on-surface-variant max-w-sm">
              Select multiple inventory screenshots to process them all at once. For best results, use uncompressed 16:9 images.
            </span>
          </div>
        )}
        <input
          id="screenshot-upload"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleChange}
          disabled={isScanning}
        />
      </label>
    </div>
  );
}
