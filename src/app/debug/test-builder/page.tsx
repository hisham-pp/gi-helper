"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
  getTestImages,
  getTestResult,
  getTestSets,
  saveTestResult,
  getMaterials,
} from "./actions";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  List,
  Code,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PillDropdown } from "@/components/ui/PillDropdown";
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
    case 1:
      return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    case 2:
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case 3:
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case 4:
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case 5:
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
};

const getRarityBg = (rarity: number) => {
  switch (rarity) {
    case 1:
      return "bg-gradient-to-br from-slate-600 to-slate-800";
    case 2:
      return "bg-gradient-to-br from-emerald-500 to-emerald-800";
    case 3:
      return "bg-gradient-to-br from-blue-400 to-blue-700";
    case 4:
      return "bg-gradient-to-br from-purple-400 to-purple-800";
    case 5:
      return "bg-gradient-to-br from-amber-400 to-amber-700";
    default:
      return "bg-gradient-to-br from-slate-600 to-slate-800";
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [itemToAdd, setItemToAdd] = useState<Material | null>(null);
  const [quantityToAdd, setQuantityToAdd] = useState<number | string>(1);

  const searchInputRef = useRef<HTMLInputElement>(null);

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
        const defaultContent = '{\n  "items": []\n}';
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
    const qty =
      typeof quantityToAdd === "number"
        ? quantityToAdd
        : parseInt(quantityToAdd as string) || 1;
    const newItems = [
      { id: itemToAdd.id, name: itemToAdd.name, quantity: qty },
      ...visualItems,
    ];
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
      setSelectedIndex((prev) =>
        Math.min(prev + 1, filteredMaterials.length - 1),
      );
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
      item.id === id ? { ...item, quantity: newQuantity } : item,
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
      .filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.id.includes(searchQuery.toLowerCase()),
      )
      .slice(0, 10); // Limit suggestions
  }, [materials, searchQuery]);

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-start bg-transparent p-4 pt-8 md:p-8">
      {/* Top Navigation Bar */}
      <div className="mb-6 flex w-full max-w-7xl items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/debug"
            className="text-on-surface flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 active:scale-95 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Back to Debugger</span>
            <span className="sm:hidden">Back</span>
          </Link>

          {/* Pill-styled Test Sets Dropdown */}
          {testSets.length > 0 && (
            <PillDropdown
              value={selectedSet}
              onChange={setSelectedSet}
              label="Test Set:"
              panelZIndex="z-[100]"
              options={testSets.map((s) => ({ value: s, label: s }))}
            />
          )}

          {/* Pill-styled Image Dropdown */}
          {images.length > 0 && (
            <PillDropdown
              value={selectedImage}
              onChange={setSelectedImage}
              label="Image:"
              icon={<ImageIcon className="h-4 w-4 text-primary" />}
              panelZIndex="z-[90]"
              options={images.map((img) => ({ value: img, label: img }))}
            />
          )}
        </div>

        <h1 className="hidden text-xl font-bold tracking-tight md:block md:text-2xl">
          Scanner Test Builder
        </h1>

        <ThemeToggle />
      </div>

      <div className="flex w-full max-w-7xl flex-col gap-6 lg:flex-row">
        {/* Left Column: Image Preview */}
        <div className="flex min-h-[400px] flex-1 flex-col gap-4">
          {selectedImage ? (
            <>
              <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-surface/50 p-4 backdrop-blur-md lg:min-h-[500px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/samples/${selectedSet}/${selectedImage}`}
                  alt={selectedImage}
                  className="max-h-[600px] max-w-full rounded-lg object-contain shadow-md"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-surface/50 p-3 backdrop-blur-md">
                <button
                  onClick={handlePrevImage}
                  className="flex items-center gap-1.5 rounded bg-white/5 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-white/10"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev Image
                </button>
                <div className="text-muted-foreground hidden truncate px-4 text-sm sm:block">
                  {images.indexOf(selectedImage) + 1} / {images.length}
                </div>
                <button
                  onClick={handleNextImage}
                  className="flex items-center gap-1.5 rounded bg-white/5 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-white/10"
                >
                  Next Image <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-muted-foreground flex min-h-[400px] flex-1 flex-col items-center justify-center rounded-xl border border-white/10 bg-surface/50 backdrop-blur-md">
              <div className="mb-4 text-4xl">🖼️</div>
              <p>Select an image to view</p>
            </div>
          )}
        </div>

        {/* Right Column: Editor */}
        <div className="flex min-h-[600px] w-full shrink-0 flex-col gap-4 lg:w-[500px]">
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-surface/50 p-4 backdrop-blur-md sm:flex-row sm:items-center">
            <h2 className="flex items-center gap-2 font-semibold">
              {selectedSet} Expected Result
              {hasUnsavedChanges && (
                <span className="flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-normal text-amber-500">
                  <AlertCircle className="mr-1 h-3 w-3" /> Unsaved
                </span>
              )}
            </h2>

            <div className="flex gap-2">
              <div className="flex rounded-md border border-white/10 bg-background/50 p-0.5">
                <button
                  onClick={() => setVisualMode(true)}
                  className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
                    visualMode
                      ? "bg-white/10 text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  Visual
                </button>
                <button
                  onClick={() => setVisualMode(false)}
                  className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
                    !visualMode
                      ? "bg-white/10 text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Code className="h-3.5 w-3.5" />
                  JSON
                </button>
              </div>

              {!visualMode && (
                <button
                  onClick={formatJson}
                  className="rounded-md border border-white/10 px-3 py-1.5 text-xs transition-colors hover:bg-white/5"
                >
                  Format JSON
                </button>
              )}

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
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
          <div className="flex min-h-[350px] flex-1 flex-col gap-3 rounded-xl border border-white/10 bg-surface/50 p-4 backdrop-blur-md">
            {visualMode ? (
              <div className="flex h-full flex-col gap-6">
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
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-md border border-white/10 bg-surface shadow-xl">
                      {filteredMaterials.map((m, index) => (
                        <button
                          key={m.id}
                          onClick={() => openQuantityModal(m)}
                          className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                            selectedIndex === index
                              ? "bg-white/10"
                              : "hover:bg-white/10"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <div
                            className={`h-8 w-8 shrink-0 rounded ${getRarityBg(m.rarity)} relative flex items-center justify-center overflow-hidden`}
                          >
                            <img
                              src={m.image}
                              alt={m.name}
                              className="h-full w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate">{m.name}</div>
                            <div className="text-muted-foreground truncate font-mono text-xs">
                              {m.id}
                            </div>
                          </div>
                          <div className="shrink-0 text-xs tracking-widest text-yellow-500">
                            {"★".repeat(m.rarity)}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Visual Items List */}
                <div className="flex-1 space-y-2 overflow-y-auto pr-2">
                  {visualItems.length === 0 ? (
                    <div className="text-muted-foreground flex h-40 flex-col items-center justify-center text-sm">
                      <List className="mb-2 h-8 w-8 opacity-50" />
                      <p>No items added yet.</p>
                      <p>Search and add items from above.</p>
                    </div>
                  ) : (
                    visualItems.map((item) => {
                      const material = materials.find((m) => m.id === item.id);
                      const rarity = material?.rarity || 1;

                      return (
                        <div
                          key={item.id}
                          className={`group flex items-center gap-4 rounded-lg border bg-background/30 p-2 transition-colors hover:bg-background/50 ${getRarityColor(rarity)} border-opacity-50`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <div
                            className={`h-12 w-12 shrink-0 rounded-md ${getRarityBg(rarity)} relative flex flex-col justify-end overflow-hidden shadow-sm`}
                          >
                            <img
                              src={material?.image || ""}
                              alt={item.name || item.id}
                              className="absolute inset-0 h-full w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                            <div className="relative z-10 w-full bg-gradient-to-t from-black/60 to-transparent pb-0.5 text-center text-[10px] leading-none tracking-widest text-yellow-300 drop-shadow-md">
                              {"★".repeat(rarity)}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1 text-foreground">
                            <div className="truncate text-sm font-semibold">
                              {item.name || material?.name || item.id}
                            </div>
                            <div className="truncate font-mono text-xs opacity-70">
                              {item.id}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 rounded-md border border-white/5 bg-black/20 p-0.5">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.id,
                                  Math.max(0, item.quantity - 1),
                                )
                              }
                              className="text-muted-foreground rounded p-1 transition-colors hover:bg-white/10 hover:text-foreground"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateQuantity(
                                  item.id,
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="w-12 rounded bg-transparent text-center text-sm font-medium focus:bg-white/5 focus:outline-none"
                              min="0"
                            />
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity + 1)
                              }
                              className="text-muted-foreground rounded p-1 transition-colors hover:bg-white/10 hover:text-foreground"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-muted-foreground rounded-md p-2 opacity-0 transition-colors hover:bg-red-400/10 hover:text-red-400 focus:opacity-100 group-hover:opacity-100"
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
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
                className="h-full w-full resize-none rounded-md border border-white/10 bg-background/50 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                spellCheck={false}
                placeholder="Enter expected JSON result..."
              />
            )}
          </div>
        </div>
      </div>

      {/* Quantity Modal */}
      {itemToAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-surface p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold">Add Quantity</h3>
            <div className="mb-6 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div
                className={`h-12 w-12 shrink-0 rounded-md ${getRarityBg(itemToAdd.rarity)} relative flex items-center justify-center overflow-hidden`}
              >
                <img
                  src={itemToAdd.image}
                  alt={itemToAdd.name}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="truncate font-medium">{itemToAdd.name}</div>
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
              className="mb-6 w-full rounded-md border border-white/10 bg-background/50 px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              min="1"
              placeholder="1"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setItemToAdd(null)}
                className="rounded-md border border-white/10 px-4 py-2 text-sm transition-colors hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddItem}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
