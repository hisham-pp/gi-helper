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
      className="relative rounded-[2rem] border-[0.5px] border-t-white/30 border-l-white/20 border-b-white/5 border-r-white/5 bg-gradient-to-br from-white/10 via-white/5 to-black/20 p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-2xl overflow-hidden group transition-all duration-500 hover:bg-white/10"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <label
        htmlFor="screenshot-upload"
        className={`relative z-10 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all duration-300 ${
          isDragging 
            ? "border-primary/60 bg-primary/20 scale-[0.99] shadow-[inset_0_0_40px_rgba(var(--md-sys-color-primary),0.3)]" 
            : "border-white/20 bg-black/10 hover:border-white/40 hover:bg-black/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] hover:shadow-[inset_0_0_30px_rgba(0,0,0,0.3)]"
        } ${isScanning ? "opacity-60 pointer-events-none scale-95" : ""}`}
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
          <div className="flex flex-col items-center space-y-5 text-center">
            <div className="p-5 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full mb-2 text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_16px_rgba(0,0,0,0.3)] border border-t-white/30 border-l-white/20 border-b-transparent border-r-transparent group-hover:scale-110 transition-transform duration-300 backdrop-blur-md">
              <Upload className="h-10 w-10 drop-shadow-md" />
            </div>
            <span className="text-2xl font-bold text-on-surface drop-shadow-sm tracking-tight">
              Click to upload or drag & drop
            </span>
            <span className="text-sm font-medium text-on-surface/80 max-w-sm drop-shadow-sm">
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
