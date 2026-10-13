"use client";

import React, { useState } from "react";
import { GridSession } from "@/lib/grid-detector";
import {
  Layers,
  Edit2,
  Trash2,
  Check,
  X,
  Plus,
  Download,
} from "lucide-react";

interface SessionBarProps {
  sessions: GridSession[];
  activeSessionId: string | null;
  imageCount: number;
  onSelectSession: (id: string) => void;
  onCreateSession: (name: string) => void;
  onRenameSession: (id: string, newName: string) => void;
  onDeleteSession: (id: string) => void;
  onExportSession: () => void;
}

export function SessionBar({
  sessions,
  activeSessionId,
  imageCount,
  onSelectSession,
  onCreateSession,
  onRenameSession,
  onDeleteSession,
  onExportSession,
}: SessionBarProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleStartRename = (session: GridSession) => {
    setEditingId(session.id);
    setEditName(session.name);
  };

  const handleSaveRename = () => {
    if (!editingId || !editName.trim()) return;
    onRenameSession(editingId, editName.trim());
    setEditingId(null);
  };

  const handleSaveCreate = () => {
    if (!newSessionName.trim()) return;
    onCreateSession(newSessionName.trim());
    setNewSessionName("");
    setIsCreating(false);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold text-white sm:text-base">
            Sessions:
          </span>
        </div>

        {/* Sessions Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;

            if (editingId === session.id) {
              return (
                <div
                  key={session.id}
                  className="flex items-center gap-1 rounded-xl border border-primary bg-primary/20 px-2 py-1"
                >
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-32 rounded bg-black/40 px-2 py-0.5 text-xs text-white outline-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveRename();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                  <button
                    onClick={handleSaveRename}
                    className="text-emerald-400 hover:text-emerald-300"
                    title="Save name"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-white/60 hover:text-white"
                    title="Cancel"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={session.id}
                className={`group flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <button onClick={() => onSelectSession(session.id)}>
                  {session.name}
                </button>

                {isActive && (
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => handleStartRename(session)}
                      className="hover:text-white"
                      title="Rename Session"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    {sessions.length > 1 && (
                      <button
                        onClick={() => onDeleteSession(session.id)}
                        className="hover:text-red-400"
                        title="Delete Session"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* New Session Button / Input */}
          {isCreating ? (
            <div className="flex items-center gap-1.5 rounded-xl border border-primary bg-white/10 px-2 py-1">
              <input
                type="text"
                placeholder="Session Name..."
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                className="w-36 rounded bg-black/40 px-2 py-0.5 text-xs text-white outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveCreate();
                  if (e.key === "Escape") setIsCreating(false);
                }}
              />
              <button
                onClick={handleSaveCreate}
                className="rounded bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground"
              >
                Save
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-1 rounded-xl border border-dashed border-white/20 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/80 hover:border-primary hover:bg-white/10 hover:text-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Export & Stats */}
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
          {imageCount} Image{imageCount === 1 ? "" : "s"}
        </span>
        <button
          onClick={onExportSession}
          disabled={imageCount === 0}
          className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-white/20 disabled:opacity-40"
          title="Download JSON calibrations for this session"
        >
          <Download className="h-3.5 w-3.5 text-emerald-400" />
          <span>Export Session Grids</span>
        </button>
      </div>
    </div>
  );
}
