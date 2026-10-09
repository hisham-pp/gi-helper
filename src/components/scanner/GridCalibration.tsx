import React, { useRef, useEffect, useState } from 'react';
import { GridConfig } from '@/lib/cv/grid-detector';

interface GridCalibrationProps {
  imageFile: File;
  config: GridConfig;
  onChange: (config: GridConfig) => void;
}

export function GridCalibration({ imageFile, config, onChange }: GridCalibrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageBitmap, setImageBitmap] = useState<ImageBitmap | null>(null);

  useEffect(() => {
    createImageBitmap(imageFile).then(setImageBitmap);
  }, [imageFile]);

  useEffect(() => {
    if (!canvasRef.current || !imageBitmap) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw image to fit canvas
    const drawWidth = canvas.width;
    const drawHeight = (imageBitmap.height / imageBitmap.width) * canvas.width;
    canvas.height = drawHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

    // Draw grid
    const scaleX = imageBitmap.width / 1920;
    const scaleY = imageBitmap.height / 1080;
    
    // Canvas display scale vs actual image scale
    const displayScale = canvas.width / imageBitmap.width;

    ctx.strokeStyle = '#ef4444'; // Red
    ctx.lineWidth = 2;

    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.columns; col++) {
        const x = (config.startX + col * (config.cellWidth + config.gapX)) * scaleX * displayScale;
        const y = (config.startY + row * (config.cellHeight + config.gapY)) * scaleY * displayScale;
        const w = config.cellWidth * scaleX * displayScale;
        const h = config.cellHeight * scaleY * displayScale;

        // Draw cell border
        ctx.strokeRect(x, y, w, h);

        // Draw inner icon rect (blue)
        ctx.strokeStyle = '#3b82f6';
        ctx.strokeRect(x + w * 0.1, y + h * 0.1, w * 0.8, h * 0.6);

        // Draw quantity rect (green)
        ctx.strokeStyle = '#22c55e';
        ctx.strokeRect(x + w * 0.1, y + h * 0.75, w * 0.8, h * 0.2);
        
        ctx.strokeStyle = '#ef4444'; // reset to red
      }
    }
  }, [imageBitmap, config]);

  const handleChange = (key: keyof GridConfig, value: number) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="bg-surface-variant p-6 rounded-xl space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-2">Grid Calibration</h3>
        <p className="text-sm text-on-surface-variant mb-4">
          Adjust the sliders so the red boxes match your item cells exactly. 
          The blue box should cover the icon, and the green box should cover the number.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.keys(config).map((key) => (
          <div key={key} className="flex flex-col">
            <label className="text-sm font-semibold text-on-surface mb-1">
              {key} ({config[key as keyof GridConfig]})
            </label>
            <input
              type="range"
              min="0"
              max={key === 'startX' || key === 'startY' ? 1000 : 200}
              value={config[key as keyof GridConfig]}
              onChange={(e) => handleChange(key as keyof GridConfig, parseInt(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        ))}
      </div>

      <div className="relative w-full border border-outline rounded-lg overflow-hidden bg-black/10">
        <canvas ref={canvasRef} className="w-full h-auto block" width={1000} />
      </div>
    </div>
  );
}
