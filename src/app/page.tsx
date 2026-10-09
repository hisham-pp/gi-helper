"use client";

import { useState, useCallback, useEffect } from "react";
import { Upload, Loader2, CheckCircle2, Download, Trash2 } from "lucide-react";
import Tesseract from "tesseract.js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import materialsData from "@/data/materials.json";

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [detectedItems, setDetectedItems] = useState<{ id: string; name: string; quantity: number }[]>([]);

  // Load any previously detected items from localStorage to persist
  useEffect(() => {
    const saved = localStorage.getItem("scanner_detected_items");
    if (saved) {
      try {
        setDetectedItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved items", e);
      }
    }
  }, []);

  // Save to localStorage whenever detected items change
  useEffect(() => {
    localStorage.setItem("scanner_detected_items", JSON.stringify(detectedItems));
  }, [detectedItems]);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setIsScanning(true);
      setProgress(0);

      try {
        let fullText = "";
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const result = await Tesseract.recognize(file, "eng", {
            logger: (m) => {
              if (m.status === "recognizing text") {
                setProgress(Math.round(((i + m.progress) / files.length) * 100));
              }
            },
          });
          fullText += result.data.text + "\n";
        }

        parseScannedText(fullText);
        toast.success("Scanning complete");
      } catch (error) {
        console.error("OCR Error:", error);
        toast.error("Failed to scan images");
      } finally {
        setIsScanning(false);
        // Reset file input
        e.target.value = '';
      }
    },
    []
  );

  const parseScannedText = (text: string) => {
    const foundMap = new Map<string, { id: string; name: string; quantity: number }>();
    
    // Add existing items to map first
    detectedItems.forEach(item => {
      foundMap.set(item.id, { ...item });
    });

    const textLower = text.toLowerCase();

    for (const material of materialsData) {
      const nameLower = material.name.toLowerCase();
      if (textLower.includes(nameLower)) {
        const index = textLower.indexOf(nameLower);
        const surroundingText = textLower.substring(
          Math.max(0, index - 20), 
          Math.min(textLower.length, index + nameLower.length + 20)
        );
        const numbers = surroundingText.match(/\d+/g);
        
        let quantity = 1;
        if (numbers && numbers.length > 0) {
           quantity = parseInt(numbers[0], 10);
        }

        if (foundMap.has(material.id)) {
           foundMap.get(material.id)!.quantity += quantity;
        } else {
           foundMap.set(material.id, { id: material.id, name: material.name, quantity });
        }
      }
    }

    setDetectedItems(Array.from(foundMap.values()));
  };

  const toGOODFormat = (name: string) => {
    return name
      .replace(/['"-]/g, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  };

  const exportGoodFormat = () => {
    if (detectedItems.length === 0) {
      toast.error("No items to export");
      return;
    }

    const goodMaterials: Record<string, number> = {};
    detectedItems.forEach(item => {
      goodMaterials[toGOODFormat(item.name)] = item.quantity;
    });

    const goodData = {
      format: "GOOD",
      version: 2,
      source: "GenshinMaterialScanner",
      materials: goodMaterials
    };

    const blob = new Blob([JSON.stringify(goodData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Exported to GOOD format!");
  };

  const clearItems = () => {
    if (confirm("Are you sure you want to clear all scanned items?")) {
      setDetectedItems([]);
      toast.success("Items cleared");
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-on-surface">Genshin Inventory Scanner</h1>
          <p className="text-on-surface-variant">
            Upload your inventory screenshots to extract materials and export them in .GOOD format.
          </p>
        </div>

        <div className="rounded-2xl border border-outline-variant bg-surface p-8">
          <label
            htmlFor="screenshot-upload"
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant bg-surface-variant/30 p-12 hover:bg-surface-variant/50 transition-colors ${isScanning ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {isScanning ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <span className="text-lg font-medium">Scanning Images... {progress}%</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <Upload className="h-12 w-12 text-primary" />
                <span className="text-lg font-medium text-on-surface">Click to upload or drag and drop screenshots</span>
                <span className="text-sm text-on-surface-variant">Select multiple images to process them all at once</span>
              </div>
            )}
            <input
              id="screenshot-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              disabled={isScanning}
            />
          </label>
        </div>

        {detectedItems.length > 0 && (
          <div className="rounded-2xl border border-outline-variant bg-surface p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant pb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-on-surface">
                <CheckCircle2 className="h-6 w-6 text-success" />
                Scanned Inventory ({detectedItems.length} items)
              </h2>
              <div className="flex items-center gap-3">
                <Button onClick={clearItems} variant="text" className="text-error hover:bg-error/10">
                  <Trash2 className="h-4 w-4 mr-2" /> Clear
                </Button>
                <Button onClick={exportGoodFormat} variant="filled" className="bg-primary text-on-primary">
                  <Download className="h-4 w-4 mr-2" /> Export .GOOD JSON
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[60vh] overflow-y-auto p-2">
              {detectedItems.map((item) => (
                <div key={item.id} className="flex flex-col p-4 rounded-xl bg-surface-variant/30 border border-outline-variant hover:border-primary/50 transition-colors">
                  <span className="font-semibold text-sm truncate text-on-surface" title={item.name}>{item.name}</span>
                  <span className="text-xs text-on-surface-variant mt-1 font-medium">Quantity: {item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
