"use client";

import { useEffect, useState } from "react";
import { getTestImages, getTestResult, getTestSets, saveTestResult } from "./actions";
import { ArrowLeft, Save, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function TestBuilderPage() {
  const [testSets, setTestSets] = useState<string[]>([]);
  const [selectedSet, setSelectedSet] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [jsonContent, setJsonContent] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    getTestSets().then((sets) => {
      setTestSets(sets);
      if (sets.length > 0) {
        setSelectedSet(sets[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedSet) {
      getTestImages(selectedSet).then((imgs) => {
        setImages(imgs);
        if (imgs.length > 0) {
          setSelectedImage(imgs[0]);
        } else {
          setSelectedImage("");
        }
      });
    }
  }, [selectedSet]);

  useEffect(() => {
    if (selectedSet) {
      getTestResult(selectedSet).then((content) => {
        setJsonContent(content || "{\n  \"items\": []\n}");
        setHasUnsavedChanges(false);
      });
    } else {
      setJsonContent("");
      setHasUnsavedChanges(false);
    }
  }, [selectedSet]);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonContent(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!selectedSet) return;
    
    setIsSaving(true);
    const result = await saveTestResult(selectedSet, jsonContent);
    setIsSaving(false);

    if (result.success) {
      toast.success("Test result saved successfully!");
      setHasUnsavedChanges(false);
    } else {
      toast.error("Failed to save: " + result.error);
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      setJsonContent(JSON.stringify(parsed, null, 2));
    } catch (e) {
      toast.error("Invalid JSON, cannot format");
    }
  };

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-start bg-transparent p-4 pt-8 md:p-8">
      {/* Top Navigation Bar */}
      <div className="mb-6 flex w-full max-w-7xl items-center justify-between">
        <Link
          href="/debug"
          className="text-on-surface flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 active:scale-95 sm:text-sm"
        >
          <ArrowLeft className="h-4 w-4 text-primary" />
          <span>Back to Debugger</span>
        </Link>
        
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">
          Scanner Test Builder
        </h1>

        <ThemeToggle />
      </div>

      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
          <div className="rounded-xl border border-white/10 bg-surface/50 p-4 backdrop-blur-md">
            <h2 className="mb-3 font-semibold">Test Sets</h2>
            <select 
              value={selectedSet} 
              onChange={(e) => setSelectedSet(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {testSets.map((set) => (
                <option key={set} value={set}>{set}</option>
              ))}
              {testSets.length === 0 && <option value="">No sets found</option>}
            </select>
          </div>

          <div className="flex-1 rounded-xl border border-white/10 bg-surface/50 p-4 backdrop-blur-md overflow-hidden flex flex-col min-h-[300px]">
            <h2 className="mb-3 font-semibold">Images ({images.length})</h2>
            <div className="flex-1 overflow-y-auto pr-2 space-y-1">
              {images.map((img) => (
                <button
                  key={img}
                  onClick={() => setSelectedImage(img)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md truncate transition-colors ${
                    selectedImage === img 
                      ? "bg-primary/20 text-primary font-medium" 
                      : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                  }`}
                  title={img}
                >
                  {img}
                </button>
              ))}
              {images.length === 0 && (
                <div className="text-sm text-muted-foreground italic">No images found in set</div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-4 min-h-[600px]">
          {selectedImage ? (
            <>
              {/* Image Preview */}
              <div className="relative rounded-xl border border-white/10 bg-surface/50 p-2 backdrop-blur-md flex items-center justify-center min-h-[300px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={`/samples/${selectedSet}/${selectedImage}`} 
                  alt={selectedImage} 
                  className="max-h-[500px] max-w-full object-contain rounded-lg shadow-md"
                />
              </div>

              {/* JSON Editor */}
              <div className="flex-1 rounded-xl border border-white/10 bg-surface/50 p-4 backdrop-blur-md flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold flex items-center gap-2">
                    {selectedSet} Expected Result (JSON)
                    {hasUnsavedChanges && (
                      <span className="flex items-center text-xs font-normal text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3 mr-1" /> Unsaved
                      </span>
                    )}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={formatJson}
                      className="px-3 py-1.5 text-xs rounded-md border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      Format JSON
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save
                    </button>
                  </div>
                </div>
                
                <textarea
                  value={jsonContent}
                  onChange={handleJsonChange}
                  className="flex-1 w-full rounded-md border border-white/10 bg-background/50 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none min-h-[300px]"
                  spellCheck={false}
                  placeholder="Enter expected JSON result..."
                />
              </div>
            </>
          ) : (
            <div className="flex-1 rounded-xl border border-white/10 bg-surface/50 backdrop-blur-md flex flex-col items-center justify-center text-muted-foreground min-h-[400px]">
              <div className="text-4xl mb-4">🖼️</div>
              <p>Select an image to view and add expected results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
