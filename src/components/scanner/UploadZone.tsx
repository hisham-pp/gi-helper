import { Upload, Loader2 } from "lucide-react";
import React from "react";

interface UploadZoneProps {
  isScanning: boolean;
  progress: number;
  onFilesSelected: (files: FileList | File[]) => void;
}

export function UploadZone({
  isScanning,
  progress,
  onFilesSelected,
}: UploadZoneProps) {
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
      className="group relative overflow-hidden rounded-[2rem] border-[0.5px] border-b-white/5 border-l-white/20 border-r-white/5 border-t-white/30 bg-gradient-to-br from-white/10 via-white/5 to-black/20 p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-2xl transition-all duration-500 hover:bg-white/10"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <label
        htmlFor="screenshot-upload"
        className={`relative z-10 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all duration-300 ${
          isDragging
            ? "scale-[0.99] border-primary/60 bg-primary/20 shadow-[inset_0_0_40px_rgba(var(--md-sys-color-primary),0.3)]"
            : "border-white/20 bg-black/10 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] hover:border-white/40 hover:bg-black/20 hover:shadow-[inset_0_0_30px_rgba(0,0,0,0.3)]"
        } ${isScanning ? "pointer-events-none scale-95 opacity-60" : ""}`}
      >
        {isScanning ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <span className="text-on-surface text-lg font-medium">
              Scanning Images... {progress}%
            </span>
            <div className="mt-4 h-2 w-64 overflow-hidden rounded-full bg-surface-variant">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-5 text-center">
            <div className="mb-2 rounded-full border border-b-transparent border-l-white/20 border-r-transparent border-t-white/30 bg-gradient-to-br from-primary/30 to-primary/10 p-5 text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_16px_rgba(0,0,0,0.3)] backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
              <Upload className="h-10 w-10 drop-shadow-md" />
            </div>
            <span className="text-on-surface text-2xl font-bold tracking-tight drop-shadow-sm">
              Click to upload or drag & drop
            </span>
            <span className="text-on-surface/80 max-w-sm text-sm font-medium drop-shadow-sm">
              Select multiple inventory screenshots to process them all at once.
              For best results, use uncompressed 16:9 images.
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
