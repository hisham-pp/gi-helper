"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Circle,
  Layers,
  LocateFixed,
  MapPin,
  RotateCcw,
  Search,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";

import { LoginRequiredDialog } from "@/components/auth/login-required-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  collectibleMeta,
  mapDataSource,
  mapLayers,
  teyvatCollectibles,
  totalImportedMarkers,
  type CollectibleKind,
  type MapCollectible,
  type MapLayerId,
} from "@/lib/teyvat-map-data";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "gi-helper.teyvat-map.completed.v1";
const TEYVAT_SURFACE_MAP_SRC = "/images/map/teyvat-surface.png";

const layerBackdrop: Record<MapLayerId, string> = {
  teyvat: "bg-[#168ea3]",
  underground: "bg-stone-200 dark:bg-stone-950",
};

function loadCompletedPins() {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter(Boolean) : []);
  } catch {
    return new Set<string>();
  }
}

function saveCompletedPins(completedPins: Set<string>) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(Array.from(completedPins).sort()),
  );
}

function getMeta(kind: CollectibleKind) {
  return collectibleMeta.find((item) => item.id === kind) ?? collectibleMeta[0];
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatSourceCoordinates(pin: MapCollectible) {
  return pin.sourceCoordinates
    .map((coordinate) => coordinate.toFixed(3))
    .join(", ");
}

export function InteractiveTeyvatMap({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const [activeLayer, setActiveLayer] = useState<MapLayerId>("teyvat");
  const [activeKinds, setActiveKinds] = useState<Set<CollectibleKind>>(
    () => new Set(collectibleMeta.map((item) => item.id)),
  );
  const [completedPins, setCompletedPins] = useState<Set<string>>(
    () => new Set(),
  );
  const [selectedPinId, setSelectedPinId] = useState<string>(
    teyvatCollectibles[0]?.id ?? "",
  );
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    setCompletedPins(isAuthenticated ? loadCompletedPins() : new Set());
  }, [isAuthenticated]);

  const selectedPin = useMemo(
    () =>
      teyvatCollectibles.find((pin) => pin.id === selectedPinId) ??
      teyvatCollectibles[0],
    [selectedPinId],
  );

  const visiblePins = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return teyvatCollectibles.filter((pin) => {
      const meta = getMeta(pin.kind);
      const matchesLayer = pin.layer === activeLayer;
      const matchesKind = activeKinds.has(pin.kind);
      const matchesQuery =
        !normalizedQuery ||
        pin.label.toLowerCase().includes(normalizedQuery) ||
        pin.hint.toLowerCase().includes(normalizedQuery) ||
        meta.label.toLowerCase().includes(normalizedQuery);

      return matchesLayer && matchesKind && matchesQuery;
    });
  }, [activeKinds, activeLayer, query]);

  const completedVisible = visiblePins.filter((pin) =>
    completedPins.has(pin.id),
  ).length;
  const totalPins = teyvatCollectibles.length;
  const completedTotal = teyvatCollectibles.filter((pin) =>
    completedPins.has(pin.id),
  ).length;
  const selectedMeta = getMeta(selectedPin.kind);
  const SelectedIcon = selectedMeta.icon;

  function toggleKind(kind: CollectibleKind) {
    setActiveKinds((current) => {
      const next = new Set(current);
      if (next.has(kind)) {
        next.delete(kind);
      } else {
        next.add(kind);
      }
      return next;
    });
  }

  function togglePin(pinId: string) {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    setCompletedPins((current) => {
      const next = new Set(current);
      const isCompleted = next.has(pinId);
      if (isCompleted) {
        next.delete(pinId);
      } else {
        next.add(pinId);
      }
      saveCompletedPins(next);
      toast.success(isCompleted ? "Marker reopened." : "Marker completed.");
      return next;
    });
  }

  function resetProgress() {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    setCompletedPins(new Set());
    window.localStorage.removeItem(STORAGE_KEY);
    toast.success("Map progress reset.");
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-on-surface-variant text-sm font-bold">
            Exploration
          </p>
          <h1 className="text-on-surface mt-1 text-3xl font-bold">
            Teyvat Interactive Map
          </h1>
          <p className="text-on-surface-variant mt-2 text-sm">
            {totalImportedMarkers} individual markers imported from{" "}
            {mapDataSource.name}.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:w-auto sm:min-w-96">
          <Card variant="outlined" className="rounded-lg px-4 py-3">
            <p className="text-on-surface text-lg font-bold">
              {completedTotal}
            </p>
            <p className="text-on-surface-variant text-xs font-bold">
              Complete
            </p>
          </Card>
          <Card variant="outlined" className="rounded-lg px-4 py-3">
            <p className="text-on-surface text-lg font-bold">{totalPins}</p>
            <p className="text-on-surface-variant text-xs font-bold">Pinned</p>
          </Card>
          <Card variant="outlined" className="rounded-lg px-4 py-3">
            <p className="text-on-surface text-lg font-bold">
              {formatPercent(completedTotal / Math.max(1, totalPins))}
            </p>
            <p className="text-on-surface-variant text-xs font-bold">
              Progress
            </p>
          </Card>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_340px]">
        <aside className="space-y-4">
          <Card variant="outlined" className="rounded-lg p-4">
            <div className="mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <h2 className="text-on-surface font-bold">Layers</h2>
            </div>
            <div className="grid gap-2">
              {mapLayers.map((layer) => (
                <button
                  key={layer.id}
                  className={cn(
                    "rounded-lg border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    activeLayer === layer.id
                      ? "border-primary bg-primary-container text-primary-on-container"
                      : "text-on-surface border-outline-variant bg-surface hover:bg-primary/5",
                  )}
                  type="button"
                  onClick={() => setActiveLayer(layer.id)}
                >
                  <span className="block text-sm font-bold">{layer.label}</span>
                  <span className="text-on-surface-variant mt-1 block text-xs">
                    {layer.description}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          <Card variant="outlined" className="rounded-lg p-4">
            <div className="mb-3 flex items-center gap-2">
              <Circle className="h-4 w-4 text-primary" />
              <h2 className="text-on-surface font-bold">Collectibles</h2>
            </div>
            <div className="grid gap-2">
              {collectibleMeta.map((item) => {
                const Icon = item.icon;
                const enabled = activeKinds.has(item.id);
                return (
                  <button
                    key={item.id}
                    className={cn(
                      "flex min-h-11 items-center justify-between rounded-lg border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      enabled
                        ? "text-on-surface border-primary bg-primary/5"
                        : "text-on-surface-variant border-outline-variant bg-surface opacity-70",
                    )}
                    type="button"
                    onClick={() => toggleKind(item.id)}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          "grid h-7 w-7 place-items-center rounded-full ring-2",
                          item.colorClass,
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="truncate text-sm font-bold">
                        {item.label}
                      </span>
                    </span>
                    <span className="text-xs font-bold">{item.total}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </aside>

        <Card
          variant="outlined"
          className="min-h-[640px] overflow-hidden rounded-lg"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant p-3">
            <div className="relative min-w-64 flex-1">
              <Search className="text-on-surface-variant pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <input
                className="text-on-surface h-10 w-full rounded-lg border border-outline-variant bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                placeholder="Search marker"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                aria-label="Zoom out"
                className="h-10 w-10 rounded-lg px-0"
                type="button"
                variant="outlined"
                onClick={() =>
                  setZoom((current) => Math.max(0.85, current - 0.1))
                }
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                aria-label="Reset zoom"
                className="h-10 w-10 rounded-lg px-0"
                type="button"
                variant="outlined"
                onClick={() => setZoom(1)}
              >
                <LocateFixed className="h-4 w-4" />
              </Button>
              <Button
                aria-label="Zoom in"
                className="h-10 w-10 rounded-lg px-0"
                type="button"
                variant="outlined"
                onClick={() =>
                  setZoom((current) => Math.min(1.35, current + 0.1))
                }
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div
            className={cn(
              "relative h-[588px] overflow-auto p-4",
              layerBackdrop[activeLayer],
            )}
          >
            <div
              className="relative mx-auto h-[1200px] w-[1279px] origin-center overflow-hidden rounded-md shadow-inner transition-transform"
              style={{ transform: `scale(${zoom})` }}
            >
              {activeLayer === "teyvat" ? (
                <img
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full select-none object-fill"
                  draggable={false}
                  src={TEYVAT_SURFACE_MAP_SRC}
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center bg-stone-900 text-stone-100">
                  <p className="max-w-sm text-center text-sm font-bold">
                    Underground map art is not loaded yet. Surface pins stay
                    hidden on this layer.
                  </p>
                </div>
              )}

              {visiblePins.map((pin) => {
                const meta = getMeta(pin.kind);
                const Icon = meta.icon;
                const completed = completedPins.has(pin.id);
                const selected = selectedPin.id === pin.id;
                return (
                  <button
                    key={pin.id}
                    aria-label={pin.label}
                    className={cn(
                      "absolute grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full ring-2 transition",
                      meta.colorClass,
                      completed && "opacity-45 grayscale",
                      selected && "scale-125 shadow-lg ring-4 ring-white",
                    )}
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    type="button"
                    onClick={() => setSelectedPinId(pin.id)}
                  >
                    {completed ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </button>
                );
              })}

              <div className="text-on-surface absolute left-[74%] top-[40%] rounded-lg bg-surface/90 px-3 py-2 text-xs font-bold shadow-sm">
                Mondstadt
              </div>
              <div className="text-on-surface absolute left-[78%] top-[51%] rounded-lg bg-surface/90 px-3 py-2 text-xs font-bold shadow-sm">
                Dragonspine
              </div>
              <div className="text-on-surface absolute left-[65%] top-[61%] rounded-lg bg-surface/90 px-3 py-2 text-xs font-bold shadow-sm">
                Liyue
              </div>
            </div>
          </div>
        </Card>

        <aside className="space-y-4">
          <Card variant="outlined" className="rounded-lg p-5">
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "grid h-11 w-11 flex-shrink-0 place-items-center rounded-full ring-2",
                  selectedMeta.colorClass,
                )}
              >
                <SelectedIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-on-surface-variant text-xs font-bold">
                  {selectedMeta.label}
                </p>
                <h2 className="text-on-surface mt-1 text-xl font-bold">
                  {selectedPin.label}
                </h2>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-on-surface-variant text-xs font-bold">
                  Location
                </p>
                <p className="text-on-surface mt-1 text-sm leading-6">
                  {selectedPin.hint}
                </p>
                <p className="text-on-surface-variant mt-2 text-xs font-bold">
                  Raw source coordinates: {formatSourceCoordinates(selectedPin)}
                </p>
              </div>
              <div>
                <p className="text-on-surface-variant text-xs font-bold">
                  Route
                </p>
                <p className="text-on-surface mt-1 text-sm leading-6">
                  {selectedPin.routeNote}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Card variant="filled" className="rounded-lg px-3 py-3">
                  <p className="text-on-surface text-sm font-bold">
                    #{selectedPin.sourceId}
                  </p>
                  <p className="text-on-surface-variant text-xs font-bold">
                    Source marker
                  </p>
                </Card>
                <Card variant="filled" className="rounded-lg px-3 py-3">
                  <p className="text-on-surface text-sm font-bold">
                    {mapLayers.find((layer) => layer.id === selectedPin.layer)
                      ?.label ?? "Teyvat"}
                  </p>
                  <p className="text-on-surface-variant text-xs font-bold">
                    Layer
                  </p>
                </Card>
              </div>
              <Button
                className="w-full rounded-lg"
                type="button"
                variant={completedPins.has(selectedPin.id) ? "tonal" : "filled"}
                onClick={() => togglePin(selectedPin.id)}
              >
                {completedPins.has(selectedPin.id) ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                {completedPins.has(selectedPin.id)
                  ? "Completed"
                  : "Mark Complete"}
              </Button>
            </div>
          </Card>

          <Card variant="outlined" className="rounded-lg p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-on-surface font-bold">Visible Route</h2>
                <p className="text-on-surface-variant mt-1 text-sm">
                  {completedVisible} of {visiblePins.length} complete
                </p>
              </div>
              <Button
                aria-label="Reset progress"
                className="h-10 w-10 rounded-lg px-0"
                type="button"
                variant="outlined"
                onClick={resetProgress}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-variant">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: formatPercent(
                    completedVisible / Math.max(1, visiblePins.length),
                  ),
                }}
              />
            </div>
            <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
              {visiblePins.map((pin) => {
                const meta = getMeta(pin.kind);
                const Icon = meta.icon;
                const completed = completedPins.has(pin.id);
                return (
                  <button
                    key={pin.id}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      selectedPin.id === pin.id
                        ? "border-primary bg-primary/5"
                        : "border-outline-variant bg-surface hover:bg-primary/5",
                    )}
                    type="button"
                    onClick={() => setSelectedPinId(pin.id)}
                  >
                    <span
                      className={cn(
                        "grid h-7 w-7 flex-shrink-0 place-items-center rounded-full ring-2",
                        meta.colorClass,
                        completed && "opacity-50 grayscale",
                      )}
                    >
                      {completed ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-on-surface block truncate text-sm font-bold">
                        {pin.label}
                      </span>
                      <span className="text-on-surface-variant block text-xs font-bold">
                        {meta.label}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </aside>
      </section>

      <LoginRequiredDialog
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </div>
  );
}
