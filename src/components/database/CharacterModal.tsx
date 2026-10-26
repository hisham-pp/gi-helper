"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Swords,
  MapPin,
  Sparkles,
  Users,
  Award,
} from "lucide-react";
import { type Character, characterAvatarUrl } from "@/lib/characters";
import { getRarityStyles } from "@/lib/materials/ui";
import { GameIcon } from "@/components/ui/GameIcon";
import { RarityStars } from "@/components/inventory/shared";
import { ElementTag, ELEMENT_ACCENTS } from "./DatabaseNav";
import { WEAPON_TYPE_NAMES } from "@gi/good";
import { toast } from "sonner";
import { useModalMotion, usePauseBackground } from "@/lib/hooks";
import { triggerHaptic } from "@/lib/haptics";

interface CharacterModalProps {
  character: Character;
  constellation?: number;
  onClose: () => void;
  onNavigateNext?: () => void;
  onNavigatePrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  total?: number;
  index?: number;
}

const TALENT_LABEL: Record<string, string> = {
  auto: "Normal Attack",
  skill: "Elemental Skill",
  burst: "Elemental Burst",
};

/** Character details modal in the /db/characters database. */
export function CharacterModal({
  character,
  constellation,
  onClose,
  onNavigateNext,
  onNavigatePrev,
  hasNext,
  hasPrev,
  total,
  index,
}: CharacterModalProps) {
  const [copied, setCopied] = useState(false);
  usePauseBackground();
  const { dialogRef, backdropRef, close } = useModalMotion(onClose);
  const [navDirection, setNavDirection] = useState<"next" | "prev" | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    setCopied(false);
    const el = dialogRef.current;
    if (!el) return;

    el.style.transform = "";
    el.style.opacity = "";
    el.style.transition = "";

    if (navDirection) {
      const animClass = navDirection === "next" ? "anim-slide-in-right" : "anim-slide-in-left";
      el.classList.remove("anim-slide-in-right", "anim-slide-in-left");
      void el.offsetWidth;
      el.classList.add(animClass);
    }
  }, [character, navDirection, dialogRef]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    const onTouchMoveNative = (e: TouchEvent) => {
      if (isDraggingRef.current && e.cancelable) {
        e.preventDefault();
      }
    };

    el.addEventListener("touchmove", onTouchMoveNative, { passive: false });
    return () => {
      el.removeEventListener("touchmove", onTouchMoveNative);
    };
  }, [dialogRef]);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      isDraggingRef.current = false;
      const el = dialogRef.current;
      if (el) {
        el.style.transition = "none";
        el.classList.remove("anim-slide-in-right", "anim-slide-in-left");
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (!isDraggingRef.current && Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }

    if (Math.abs(deltaX) > 8) {
      isDraggingRef.current = true;
      e.stopPropagation();
    }

    if (!isDraggingRef.current) return;
    e.stopPropagation();

    let effectiveX = deltaX;
    if ((deltaX > 0 && !hasPrev) || (deltaX < 0 && !hasNext)) {
      effectiveX = deltaX * 0.22;
    }

    const el = dialogRef.current;
    if (el) {
      const rotate = effectiveX * 0.025;
      const opacity = Math.max(0.65, 1 - Math.abs(effectiveX) / 380);
      el.style.transform = `translateX(${effectiveX}px) rotate(${rotate}deg)`;
      el.style.opacity = `${opacity}`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    e.stopPropagation();
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    const wasDragging = isDraggingRef.current;
    isDraggingRef.current = false;

    const el = dialogRef.current;
    if (!el) return;

    if (wasDragging && Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0 && hasNext && onNavigateNext) {
        triggerHaptic("light");
        el.style.transition = "transform 0.18s ease-out, opacity 0.18s ease-out";
        el.style.transform = "translateX(-120px) rotate(-4deg)";
        el.style.opacity = "0";
        setNavDirection("next");
        onNavigateNext();
        return;
      } else if (deltaX > 0 && hasPrev && onNavigatePrev) {
        triggerHaptic("light");
        el.style.transition = "transform 0.18s ease-out, opacity 0.18s ease-out";
        el.style.transform = "translateX(120px) rotate(4deg)";
        el.style.opacity = "0";
        setNavDirection("prev");
        onNavigatePrev();
        return;
      }
    }

    el.style.transition = "transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease-out";
    el.style.transform = "translateX(0px) rotate(0deg)";
    el.style.opacity = "1";
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      } else if (e.key === "ArrowRight" && hasNext && onNavigateNext) {
        setNavDirection("next");
        onNavigateNext();
      } else if (e.key === "ArrowLeft" && hasPrev && onNavigatePrev) {
        setNavDirection("prev");
        onNavigatePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasNext, hasPrev, onNavigateNext, onNavigatePrev, close]);

  const rarity = character.rarity || 4;
  const styles = getRarityStyles(rarity);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(character.key);
    setCopied(true);
    toast.success(`Copied Key: "${character.key}"`);
    setTimeout(() => setCopied(false), 2000);
  };

  const isTraveler = Boolean(character.talentBoostsByElement);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden overscroll-none touch-none select-none"
      onTouchMove={(e) => {
        if (e.target === e.currentTarget && e.cancelable) {
          e.preventDefault();
        }
      }}
    >
      <style>{`
        @keyframes modal-slide-in-right {
          from { opacity: 0; transform: translateX(56px) scale(0.985); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes modal-slide-in-left {
          from { opacity: 0; transform: translateX(-56px) scale(0.985); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        .anim-slide-in-right {
          animation: modal-slide-in-right 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .anim-slide-in-left {
          animation: modal-slide-in-left 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/55 backdrop-blur-sm touch-none overscroll-none"
        onClick={close}
        onTouchMove={(e) => {
          if (e.cancelable) e.preventDefault();
        }}
      />

      <div
        ref={dialogRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onAnimationEnd={(e) => {
          if (e.target === dialogRef.current) {
            dialogRef.current?.classList.remove("anim-slide-in-right", "anim-slide-in-left");
          }
        }}
        style={{ "--glass-accent": styles.accent } as React.CSSProperties}
        className="glass-card glass-card--lg glass-card--raised relative z-10 flex h-[580px] sm:h-[600px] max-h-[90vh] sm:max-h-[86vh] w-full max-w-lg flex-col overflow-hidden p-5 sm:p-6 touch-pan-y will-change-transform"
      >
        <div className="flex flex-1 flex-col min-h-0 w-full overflow-y-auto pr-0.5 overscroll-contain touch-pan-y">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-4 shrink-0">
            <div className="flex items-center gap-2">
              {index !== undefined && total !== undefined && (
                <span className="glass-chip gap-1 px-3 py-1 font-mono text-xs font-bold text-white">
                  <span className="font-bold text-cyan-300">#</span>
                  {index + 1}
                  <span className="ml-0.5 text-[10px] text-white/40">/ {total}</span>
                </span>
              )}
              <span className={`glass-chip px-2.5 py-1 text-xs font-semibold ${styles.starColor}`}>
                {rarity}★ Character
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setNavDirection("prev");
                  onNavigatePrev?.();
                }}
                disabled={!hasPrev}
                className="glass-icon-btn hidden h-8 w-8 rounded-full sm:inline-flex"
                title="Previous Character (Left Arrow)"
                aria-label="Previous Character"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setNavDirection("next");
                  onNavigateNext?.();
                }}
                disabled={!hasNext}
                className="glass-icon-btn hidden h-8 w-8 rounded-full sm:inline-flex"
                title="Next Character (Right Arrow)"
                aria-label="Next Character"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={close}
                className="glass-icon-btn h-8 w-8 rounded-full sm:ml-2"
                title="Close (Escape)"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="glass-divider shrink-0" />

          {/* Character Main Profile */}
          <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-start shrink-0">
            {/* Big Avatar Frame */}
            <div className="glass-well glass-well--tinted relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl">
              <GameIcon
                src={characterAvatarUrl(character.id)}
                alt={character.name}
                size={96}
                className="h-24 w-24 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]"
                fallback={<Users className="h-10 w-10 text-white/40" />}
              />
            </div>

            {/* Title & Metadata */}
            <div className="flex flex-1 flex-col items-center sm:items-start">
              <RarityStars rarity={rarity} className="text-sm drop-shadow" />

              <h2 className="mt-1 text-center text-xl font-bold tracking-tight text-white drop-shadow-md sm:text-left sm:text-2xl">
                {character.name}
              </h2>

              {character.title && (
                <p className="text-xs italic text-white/60 sm:text-sm">
                  {character.title}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <ElementTag element={character.element} />

                <span className="glass-chip gap-1.5 px-3 py-1 text-xs font-medium text-white/85">
                  <Swords className="h-3.5 w-3.5 text-cyan-300" />
                  {WEAPON_TYPE_NAMES[character.weaponType] ?? character.weaponType}
                </span>

                {character.region && (
                  <span className="glass-chip gap-1.5 px-3 py-1 text-xs font-medium text-white/75">
                    <MapPin className="h-3.5 w-3.5 text-cyan-300/80" />
                    {character.region}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Inventory Ownership Banner */}
          <div className="glass-well mt-4 flex items-center justify-between rounded-2xl p-3 shrink-0">
            <div className="flex items-center gap-2 text-xs">
              <Award className="h-4 w-4 text-emerald-400" />
              <span className="text-white/70">Inventory status:</span>
              {constellation !== undefined ? (
                <span className="font-semibold text-emerald-300">
                  Owned · Constellation {constellation} (C{constellation})
                </span>
              ) : (
                <span className="text-white/50 italic">Not in your inventory</span>
              )}
            </div>
          </div>

          {/* Key / GOOD ID Bar */}
          <div className="glass-well mt-3 flex items-center justify-between rounded-2xl p-2 pl-3.5 shrink-0">
            <div className="flex items-center gap-2 overflow-hidden text-xs">
              <span className="font-mono text-white/40">GOOD Key:</span>
              <code className="truncate font-mono font-semibold text-cyan-300">
                {character.key}
              </code>
            </div>
            <button
              onClick={handleCopyKey}
              className="glass-btn shrink-0 gap-1.5 px-3 py-1.5 text-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Key</span>
                </>
              )}
            </button>
          </div>

          {/* Talent Boosts Section */}
          <div className="mt-4 flex flex-1 flex-col min-h-0">
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/50 shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              Constellation Talent Boosts (+3 Levels)
            </h4>

            <div className="glass-well mt-2 flex-1 min-h-0 overflow-y-auto rounded-2xl p-3.5 text-xs text-white/80">
              {character.talentBoosts && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <span className="font-mono text-xs font-bold text-amber-300">C3: Constellation 3</span>
                    <p className="mt-1 text-white font-medium">
                      +3 {TALENT_LABEL[character.talentBoosts.c3] ?? character.talentBoosts.c3}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <span className="font-mono text-xs font-bold text-amber-300">C5: Constellation 5</span>
                    <p className="mt-1 text-white font-medium">
                      +3 {TALENT_LABEL[character.talentBoosts.c5] ?? character.talentBoosts.c5}
                    </p>
                  </div>
                </div>
              )}

              {isTraveler && character.talentBoostsByElement && (
                <div className="space-y-2">
                  <p className="text-[11px] text-white/60 mb-2">
                    Traveler talent boosts vary depending on resonance element:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(character.talentBoostsByElement).map(([el, boosts]) => (
                      <div
                        key={el}
                        className="rounded-xl border border-white/10 bg-white/5 p-2.5"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor: ELEMENT_ACCENTS[el]
                                ? `rgb(${ELEMENT_ACCENTS[el]})`
                                : "#ffffff",
                            }}
                          />
                          <span className="font-bold text-white text-[11px]">{el} Traveler</span>
                        </div>
                        <div className="text-[10px] text-white/70 space-y-0.5 font-mono">
                          <div>C3: +3 {TALENT_LABEL[boosts.c3] ?? boosts.c3}</div>
                          <div>C5: +3 {TALENT_LABEL[boosts.c5] ?? boosts.c5}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!character.talentBoosts && !character.talentBoostsByElement && (
                <span className="italic text-white/40">No constellation talent boosts recorded.</span>
              )}
            </div>
          </div>

          {/* Footer Navigation Tip */}
          <div className="glass-divider mt-4 shrink-0" />
          <div className="flex items-center justify-between pt-3 text-[11px] text-white/40 shrink-0">
            <span className="hidden sm:inline">Tip: Use Arrow keys to browse characters in order</span>
            <span className="sm:hidden">Tip: Swipe left/right to browse</span>
            <span className="font-mono">Esc to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
