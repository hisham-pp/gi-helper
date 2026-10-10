"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { getTestImages, getTestResult, getTestSets, saveTestResult, getMaterials } from "./actions";
import { ArrowLeft, Save, AlertCircle, Plus, Minus, Trash2, List, Code, ChevronDown, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import Image from "next/image";

type ExpectedItem = {
  id: string;
  name?: string;
  quantity: number;
};

type Material = {
  id: string;
  name: string;
  image: string;
  rarity: number;
};

const getRarityColor = (rarity: number) => {
  switch (rarity) {
    case 1: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    case 2: return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case 3: return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case 4: return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case 5: return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
};

const getRarityBg = (rarity: number) => {
  switch (rarity) {
    case 1: return "bg-gradient-to-br from-slate-600 to-slate-800";
    case 2: return "bg-gradient-to-br from-emerald-500 to-emerald-800";
    case 3: return "bg-gradient-to-br from-blue-400 to-blue-700";
    case 4: return "bg-gradient-to-br from-purple-400 to-purple-800";
    case 5: return "bg-gradient-to-br from-amber-400 to-amber-700";
    default: return "bg-gradient-to-br from-slate-600 to-slate-800";
  }
};

export default function TestBuilderPage() {
  const [testSets, setTestSets] = useState<string[]>([]);
  const [selectedSet, setSelectedSet] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [jsonContent, setJsonContent] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Visual Editor State
  const [materials, setMaterials] = useState<Material[]>([]);
  const [visualMode, setVisualMode] = useState(true);
  const [visualItems, setVisualItems] = useState<ExpectedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSetDropdownOpen, setIsSetDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [itemToAdd, setItemToAdd] = useState<Material | null>(null);
  const [quantityToAdd, setQuantityToAdd] = useState<number | string>(1);
  const [isImageDropdownOpen, setIsImageDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const imageDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSetDropdownOpen(false);
      }
      if (imageDropdownRef.current && !imageDropdownRef.current.contains(event.target as Node)) {
        setIsImageDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Fetch initial data
  useEffect(() => {
    getTestSets().then((sets) => {
      setTestSets(sets);
      if (sets.length > 0) {
        setSelectedSet(sets[0]);
      }
    });
    getMaterials().then(setMaterials);
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
        const defaultContent = "{\n  \"items\": []\n}";
        const rawContent = content || defaultContent;
        setJsonContent(rawContent);
        setHasUnsavedChanges(false);

        // Sync visual items on load
        try {
          const parsed = JSON.parse(rawContent);
          if (parsed && Array.isArray(parsed.items)) {
            setVisualItems(parsed.items);
          }
        } catch (e) {
          console.error("Failed to parse initial JSON", e);
        }
      });
    } else {
      setJsonContent("");
      setVisualItems([]);
      setHasUnsavedChanges(false);
    }
  }, [selectedSet]);

  // Sync Visual -> JSON
  const syncVisualToJson = (items: ExpectedItem[]) => {
    setVisualItems(items);
    setJsonContent(JSON.stringify({ items }, null, 2));
    setHasUnsavedChanges(true);
  };

  // Sync JSON -> Visual
  const syncJsonToVisual = (content: string) => {
    setJsonContent(content);
    setHasUnsavedChanges(true);
    try {
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.items)) {
        setVisualItems(parsed.items);
      }
    } catch (e) {
      // Don't sync if JSON is invalid while typing
    }
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    syncJsonToVisual(e.target.value);
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

  // Visual Editor Handlers
  const openQuantityModal = (material: Material) => {
    const existing = visualItems.find((i) => i.id === material.id);
    if (existing) {
      toast.info(`${material.name} is already in the list.`);
      setSearchQuery("");
      return;
    }
    setItemToAdd(material);
    setQuantityToAdd("");
  };

  const confirmAddItem = () => {
    if (!itemToAdd) return;
    const qty = typeof quantityToAdd === "number" ? quantityToAdd : parseInt(quantityToAdd as string) || 1;
    const newItems = [{ id: itemToAdd.id, name: itemToAdd.name, quantity: qty }, ...visualItems];
    syncVisualToJson(newItems);
    setItemToAdd(null);
    setSearchQuery("");
    
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredMaterials.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredMaterials.length > 0) {
        openQuantityModal(filteredMaterials[selectedIndex]);
      }
    }
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    const newItems = visualItems.map((item) => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    syncVisualToJson(newItems);
  };

  const handleRemoveItem = (id: string) => {
    const newItems = visualItems.filter((item) => item.id !== id);
    syncVisualToJson(newItems);
  };

  const handlePrevImage = () => {
    if (images.length === 0) return;
    const currentIndex = images.indexOf(selectedImage);
    const newIndex = (currentIndex - 1 + images.length) % images.length;
    setSelectedImage(images[newIndex]);
  };
  
  const handleNextImage = () => {
    if (images.length === 0) return;
    const currentIndex = images.indexOf(selectedImage);
    const newIndex = (currentIndex + 1) % images.length;
    setSelectedImage(images[newIndex]);
  };

  const filteredMaterials = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return materials
      .filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.id.includes(searchQuery.toLowerCase()))
      .slice(0, 10); // Limit suggestions
  }, [materials, searchQuery]);

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-start bg-transparent p-4 pt-8 md:p-8">
      {/* Top Navigation Bar */}
      <div className="mb-6 flex w-full max-w-7xl items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/debug"
            className="text-on-surface flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 active:scale-95 sm:text-sm shrink-0"
          >
            <ArrowLeft className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Back to Debugger</span>
            <span className="sm:hidden">Back</span>
          </Link>
          
          {/* Pill-styled Test Sets Dropdown */}
          <div className="relative z-[100]" ref={dropdownRef}>
            <button
              onClick={() => setIsSetDropdownOpen(!isSetDropdownOpen)}
              className="text-on-surface flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs shadow-sm backdrop-blur-md transition-all hover:bg-white/20 active:scale-95 sm:text-sm"
            >
              <span className="text-muted-foreground hidden sm:inline">Test Set:</span>
              <span className="font-bold">{selectedSet || (testSets.length === 0 ? "None" : "Select...")}</span>
              <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
            </button>
            
            {isSetDropdownOpen && testSets.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-48 rounded-2xl border border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl p-1.5 flex flex-col gap-1 max-h-60 overflow-y-auto">
                {testSets.map((set) => (
                  <button
                    key={set}
                    onClick={() => {
                      setSelectedSet(set);
                      setIsSetDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-full transition-all shrink-0 ${
                      selectedSet === set ? "bg-primary/20 text-primary font-semibold" : "text-foreground font-medium hover:bg-white/10"
                    }`}
                  >
                    {set}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pill-styled Image Dropdown */}
          {images.length > 0 && (
            <div className="relative z-[90]" ref={imageDropdownRef}>
              <button
                onClick={() => setIsImageDropdownOpen(!isImageDropdownOpen)}
                className="text-on-surface flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs shadow-sm backdrop-blur-md transition-all hover:bg-white/20 active:scale-95 sm:text-sm"
              >
                <ImageIcon className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground hidden sm:inline">Image:</span>
                <span className="font-bold max-w-[150px] sm:max-w-[200px] truncate">{selectedImage || "Select..."}</span>
                <ChevronDown className="w-4 h-4 ml-1 opacity-50 shrink-0" />
              </button>
              
              {isImageDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl border border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl p-1.5 flex flex-col gap-1 max-h-60 overflow-y-auto">
                  {images.map((img) => (
                    <button
                      key={img}
                      onClick={() => {
                        setSelectedImage(img);
                        setIsImageDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-full transition-all truncate shrink-0 ${
                        selectedImage === img ? "bg-primary/20 text-primary font-semibold" : "text-foreground font-medium hover:bg-white/10"
                      }`}
                      title={img}
                    >
                      {img}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <h1 className="hidden md:block text-xl font-bold tracking-tight md:text-2xl">
          Scanner Test Builder
        </h1>

        <ThemeToggle />
      </div>

      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6">
        {/* Left Column: Image Preview */}
        <div className="flex-1 flex flex-col gap-4 min-h-[400px]">
          {selectedImage ? (
            <>
              <div className="relative rounded-xl border border-white/10 bg-surface/50 p-4 backdrop-blur-md flex items-center justify-center min-h-[300px] lg:min-h-[500px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={`/samples/${selectedSet}/${selectedImage}`} 
                  alt={selectedImage} 
                  className="max-h-[600px] max-w-full object-contain rounded-lg shadow-md"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-surface/50 p-3 backdrop-blur-md">
                <button 
                  onClick={handlePrevImage} 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev Image
                </button>
                <div className="text-sm text-muted-foreground truncate px-4 hidden sm:block">
                  {images.indexOf(selectedImage) + 1} / {images.length}
                </div>
                <button 
                  onClick={handleNextImage} 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
                >
                  Next Image <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 rounded-xl border border-white/10 bg-surface/50 backdrop-blur-md flex flex-col items-center justify-center text-muted-foreground min-h-[400px]">
              <div className="text-4xl mb-4">🖼️</div>
              <p>Select an image to view</p>
            </div>
          )}
        </div>

        {/* Right Column: Editor */}
            <div className="w-full lg:w-[500px] shrink-0 flex flex-col gap-4 min-h-[600px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface/50 border border-white/10 p-4 rounded-xl backdrop-blur-md">
                <h2 className="font-semibold flex items-center gap-2">
                  {selectedSet} Expected Result
                  {hasUnsavedChanges && (
                    <span className="flex items-center text-xs font-normal text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3 mr-1" /> Unsaved
                    </span>
                  )}
                </h2>
                
                <div className="flex gap-2">
                  <div className="flex bg-background/50 rounded-md border border-white/10 p-0.5">
                    <button
                      onClick={() => setVisualMode(true)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                        visualMode ? "bg-white/10 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      Visual
                    </button>
                    <button
                      onClick={() => setVisualMode(false)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                        !visualMode ? "bg-white/10 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Code className="w-3.5 h-3.5" />
                      JSON
                    </button>
                  </div>
                  
                  {!visualMode && (
                    <button
                      onClick={formatJson}
                      className="px-3 py-1.5 text-xs rounded-md border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      Format JSON
                    </button>
                  )}

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

              {/* Editor Workspace */}
              <div className="flex-1 rounded-xl border border-white/10 bg-surface/50 p-4 backdrop-blur-md flex flex-col gap-3 min-h-[350px]">
                {visualMode ? (
                  <div className="flex flex-col gap-6 h-full">
                    {/* Add Item Combobox */}
                    <div className="relative">
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        placeholder="Search materials to add..."
                        className="w-full rounded-md border border-white/10 bg-background/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {filteredMaterials.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 rounded-md border border-white/10 bg-surface shadow-xl z-20 max-h-60 overflow-y-auto">
                          {filteredMaterials.map((m, index) => (
                            <button
                              key={m.id}
                              onClick={() => openQuantityModal(m)}
                              className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
                                selectedIndex === index ? "bg-white/10" : "hover:bg-white/10"
                              }`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <div className={`shrink-0 w-8 h-8 rounded ${getRarityBg(m.rarity)} flex items-center justify-center overflow-hidden`}>
                                <img src={m.image} alt={m.name} className="w-full h-full object-contain" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="truncate">{m.name}</div>
                                <div className="text-xs text-muted-foreground font-mono truncate">{m.id}</div>
                              </div>
                              <div className="text-xs tracking-widest text-yellow-500 shrink-0">
                                {"★".repeat(m.rarity)}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Visual Items List */}
                    <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                      {visualItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
                          <List className="w-8 h-8 mb-2 opacity-50" />
                          <p>No items added yet.</p>
                          <p>Search and add items from above.</p>
                        </div>
                      ) : (
                        visualItems.map((item) => {
                          const material = materials.find((m) => m.id === item.id);
                          const rarity = material?.rarity || 1;
                          
                          return (
                            <div key={item.id} className={`flex items-center gap-4 bg-background/30 border rounded-lg p-2 group hover:bg-background/50 transition-colors ${getRarityColor(rarity)} border-opacity-50`}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <div className={`shrink-0 w-12 h-12 rounded-md ${getRarityBg(rarity)} shadow-sm flex flex-col justify-end overflow-hidden relative`}>
                                <img 
                                  src={material?.image || "/images/materials/placeholder.png"} 
                                  alt={item.name || item.id} 
                                  className="absolute inset-0 w-full h-full object-contain"
                                  onError={(e) => { (e.target as HTMLImageElement).src = "/images/materials/placeholder.png" }}
                                />
                                <div className="relative z-10 w-full text-center text-[10px] leading-none tracking-widest text-yellow-300 drop-shadow-md pb-0.5 bg-gradient-to-t from-black/60 to-transparent">
                                  {"★".repeat(rarity)}
                                </div>
                              </div>
                              
                              <div className="flex-1 min-w-0 text-foreground">
                                <div className="text-sm font-semibold truncate">{item.name || material?.name || item.id}</div>
                                <div className="text-xs opacity-70 truncate font-mono">{item.id}</div>
                              </div>
                              
                              <div className="flex items-center gap-1 bg-black/20 rounded-md border border-white/5 p-0.5">
                                <button 
                                  onClick={() => handleUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                  className="p-1 hover:bg-white/10 rounded text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <input 
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
                                  className="w-12 text-center bg-transparent text-sm font-medium focus:outline-none focus:bg-white/5 rounded"
                                  min="0"
                                />
                                <button 
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  className="p-1 hover:bg-white/10 rounded text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <button 
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={jsonContent}
                    onChange={handleJsonChange}
                    className="w-full h-full rounded-md border border-white/10 bg-background/50 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    spellCheck={false}
                    placeholder="Enter expected JSON result..."
                  />
                )}
              </div>
        </div>
      </div>

      {/* Quantity Modal */}
      {itemToAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-surface p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold">Add Quantity</h3>
            <div className="flex items-center gap-4 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className={`shrink-0 w-12 h-12 rounded-md ${getRarityBg(itemToAdd.rarity)} flex items-center justify-center overflow-hidden`}>
                <img src={itemToAdd.image} alt={itemToAdd.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <div className="font-medium truncate">{itemToAdd.name}</div>
              </div>
            </div>
            <input
              type="number"
              autoFocus
              value={quantityToAdd}
              onChange={(e) => setQuantityToAdd(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmAddItem();
                if (e.key === "Escape") setItemToAdd(null);
              }}
              className="w-full rounded-md border border-white/10 bg-background/50 px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary mb-6"
              min="1"
              placeholder="1"
            />
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setItemToAdd(null)} 
                className="px-4 py-2 text-sm rounded-md border border-white/10 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmAddItem} 
                className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
