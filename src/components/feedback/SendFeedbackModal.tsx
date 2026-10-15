"use client";

import { createPortal } from "react-dom";
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  CircleAlert,
  Dices,
  Globe,
  ImagePlus,
  Loader2,
  Lock,
  MessageSquareHeart,
  Send,
  TriangleAlert,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassSegmentedControl } from "@/components/ui/GlassSegmentedControl";
import { randomCharacter, type Character } from "@/lib/characters";
import { compressFeedbackImage } from "@/lib/feedback/compress-image";
import { containsProfanity } from "@/lib/feedback/profanity";
import { markFeedbackSent } from "@/lib/feedback/prompt";
import {
  FEEDBACK_KINDS,
  FEEDBACK_LIMITS,
  feedbackErrorMessage,
  PUBLIC_FEEDBACK_KIND,
  type FeedbackKind,
} from "@/lib/feedback/types";
import { useModalMotion } from "@/lib/use-modal-motion";
import { usePauseBackground } from "@/lib/use-pause-background";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { useWiggleOnChange } from "@/lib/use-wiggle-on-change";
import { ANONYMOUS_NAME, FeedbackAvatar } from "./FeedbackCard";
import { KIND_META } from "./feedback-kinds";

interface Attachment {
  id: number;
  blob: Blob;
  /** Object URL for the preview; revoked on removal and unmount. */
  url: string;
}

interface SendFeedbackModalProps {
  onClose: () => void;
  /** Runs once the message is saved and the modal has closed. */
  onSent: (kind: FeedbackKind) => void;
}

const KIND_OPTIONS = FEEDBACK_KINDS.map((kind) => {
  const Icon = KIND_META[kind].icon;
  return { value: kind, label: KIND_META[kind].label, icon: <Icon className="h-3.5 w-3.5" /> };
});

/**
 * The send form: kind, name, message and up to 3 screenshots (picked,
 * dropped or pasted; shrunk in the browser before upload). The name starts as
 * a random character's, with their avatar; the dice picks another. Only
 * "feedback" is posted publicly. FeedbackBoard mounts it only while open.
 */
export function SendFeedbackModal({ onClose, onSent }: SendFeedbackModalProps) {
  const [kind, setKind] = useState<FeedbackKind>(PUBLIC_FEEDBACK_KIND);
  // Client-only (mounted after a click), so the random pick can't mismatch hydration
  const [character, setCharacter] = useState<Character>(() => randomCharacter());
  const [name, setName] = useState(character.name);
  const [message, setMessage] = useState("");
  // Honeypot: hidden from people, bots fill it in
  const [website, setWebsite] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [shrinking, setShrinking] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentsRef = useRef(attachments);
  attachmentsRef.current = attachments;
  const shrinkingRef = useRef(0);
  const nextIdRef = useRef(0);
  const avatarRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const id = useId();

  usePauseBackground();
  const { dialogRef, backdropRef, close, closeThen } = useModalMotion(onClose);
  // The whole dialog squashes when the kind changes (public/private note, placeholder)
  useWiggleOnChange(dialogRef, kind, reducedMotion);
  const safeClose = useCallback(() => {
    if (!submitting) close();
  }, [close, submitting]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") safeClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [safeClose]);

  useEffect(
    () => () => attachmentsRef.current.forEach((attachment) => URL.revokeObjectURL(attachment.url)),
    [],
  );

  const addFiles = useCallback(async (files: File[]) => {
    const images = files.filter((file) => file.type.startsWith("image/"));
    if (images.length < files.length) toast.error("Only images can be attached.");

    const room = FEEDBACK_LIMITS.images - attachmentsRef.current.length - shrinkingRef.current;
    if (images.length > room) {
      toast.error(`You can attach up to ${FEEDBACK_LIMITS.images} images.`);
    }
    const accepted = images.slice(0, Math.max(0, room));
    if (accepted.length === 0) return;

    shrinkingRef.current += accepted.length;
    setShrinking(shrinkingRef.current);
    await Promise.all(
      accepted.map(async (file) => {
        try {
          const blob = await compressFeedbackImage(file);
          const attachment = { id: nextIdRef.current++, blob, url: URL.createObjectURL(blob) };
          setAttachments((prev) => [...prev, attachment]);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Couldn't add that image.");
        } finally {
          shrinkingRef.current -= 1;
          setShrinking(shrinkingRef.current);
        }
      }),
    );
  }, []);

  // Paste a screenshot straight from the clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []).filter((file) =>
        file.type.startsWith("image/"),
      );
      if (files.length === 0) return;
      e.preventDefault();
      void addFiles(files);
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [addFiles]);

  const handleRandomCharacter = () => {
    const next = randomCharacter(character.id);
    setCharacter(next);
    // A name of their own stays; the character's name follows the avatar
    if (!name.trim() || name === character.name) setName(next.name);
    if (!reducedMotion) {
      avatarRef.current?.animate(
        [{ scale: "0.82" }, { scale: "1.1", offset: 0.55 }, { scale: "1" }],
        { duration: 360, easing: "ease-out" },
      );
    }
  };

  const removeAttachment = (attachmentId: number) => {
    setAttachments((prev) => {
      const removed = prev.find((attachment) => attachment.id === attachmentId);
      if (removed) URL.revokeObjectURL(removed.url);
      return prev.filter((attachment) => attachment.id !== attachmentId);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void addFiles(Array.from(e.dataTransfer.files));
  };

  const trimmedLength = message.trim().length;
  const canSend =
    trimmedLength >= FEEDBACK_LIMITS.messageMin &&
    message.length <= FEEDBACK_LIMITS.messageMax &&
    shrinking === 0 &&
    !submitting;
  const flagged = useMemo(() => containsProfanity(`${name}\n${message}`), [name, message]);
  const isPublic = kind === PUBLIC_FEEDBACK_KIND;
  const slotsUsed = attachments.length + shrinking;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    setSubmitting(true);
    setError(null);

    const form = new FormData();
    form.set("kind", kind);
    form.set("name", name.trim());
    form.set("avatar", character.id);
    form.set("message", message.trim());
    form.set("website", website);
    attachments.forEach((attachment, index) => {
      const extension = attachment.blob.type === "image/webp" ? "webp" : "jpg";
      form.append("images", attachment.blob, `image-${index + 1}.${extension}`);
    });

    try {
      const res = await fetch("/api/feedback", { method: "POST", body: form });
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      if (!res.ok) {
        setError(
          data?.message ?? feedbackErrorMessage(res.status === 413 ? "image_too_large" : undefined),
        );
        setSubmitting(false);
        return;
      }
      toast.success(
        isPublic
          ? "Thanks! Your feedback is posted."
          : "Thanks! Your message went privately to the developer.",
      );
      markFeedbackSent();
      closeThen(() => onSent(kind));
    } catch {
      setError(feedbackErrorMessage("unavailable"));
      setSubmitting(false);
    }
  };

  // Portal to <body>: an ancestor's transform (the page transition) would
  // otherwise trap the fixed overlay and the glass blur inside it.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/55 backdrop-blur-sm"
        onClick={safeClose}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        className="glass-card glass-card--lg glass-card--raised relative z-10 flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="glass-chip h-10 w-10 justify-center rounded-xl text-cyan-300">
              <MessageSquareHeart className="h-5 w-5" />
            </div>
            <div>
              <h2 id={`${id}-title`} className="text-lg font-bold tracking-tight text-white">
                Send feedback
              </h2>
              <p className="text-xs text-white/60">Thanks for helping make GI Helper better</p>
            </div>
          </div>
          <button
            type="button"
            onClick={safeClose}
            className="glass-icon-btn h-9 w-9 rounded-full"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          id={`${id}-form`}
          onSubmit={handleSubmit}
          className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6"
        >
          {/* Kind */}
          <div className="space-y-2">
            <span className="block text-xs font-bold uppercase tracking-wider text-white/70">
              What is it?
            </span>
            <GlassSegmentedControl
              ariaLabel="Message type"
              options={KIND_OPTIONS}
              value={kind}
              onChange={setKind}
            />
            <p className="flex items-center gap-1.5 text-xs text-white/60">
              {isPublic ? (
                <>
                  <Globe className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
                  Shown publicly on the Feedback page.
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
                  Private: only the developer reads this.
                </>
              )}
            </p>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor={`${id}-name`} className="text-xs font-semibold text-white/80">
              Name <span className="font-normal text-white/45">(optional)</span>
            </label>
            <div className="flex items-center gap-2.5">
              <div ref={avatarRef} className="shrink-0" title={character.name}>
                <FeedbackAvatar
                  avatar={character.id}
                  name={name}
                  className="h-11 w-11 text-base"
                />
              </div>
              <GlassInput
                id={`${id}-name`}
                value={name}
                onValueChange={setName}
                maxLength={FEEDBACK_LIMITS.nameMax}
                autoComplete="off"
                placeholder={ANONYMOUS_NAME}
                clearable
                className="min-w-0 flex-1"
              />
              <button
                type="button"
                onClick={handleRandomCharacter}
                className="glass-icon-btn h-10 w-10 shrink-0 rounded-xl"
                title="Random character"
                aria-label="Pick another random character"
              >
                <Dices className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor={`${id}-message`} className="text-xs font-semibold text-white/80">
                Message
              </label>
              <span className="font-mono text-[11px] text-white/45">
                {message.length} / {FEEDBACK_LIMITS.messageMax}
              </span>
            </div>
            <textarea
              id={`${id}-message`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={6}
              maxLength={FEEDBACK_LIMITS.messageMax}
              placeholder={KIND_META[kind].placeholder}
              className="glass-input block min-h-32 w-full resize-y rounded-xl px-3.5 py-2.5 text-sm leading-relaxed"
            />
            {flagged && (
              <p className="flex items-center gap-1.5 text-xs text-amber-300">
                <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                Some words will be masked with asterisks.
              </p>
            )}
          </div>

          {/* Images */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs font-semibold text-white/80">
                Screenshots <span className="font-normal text-white/45">(optional)</span>
              </span>
              <span className="font-mono text-[11px] text-white/45">
                {slotsUsed} / {FEEDBACK_LIMITS.images}
              </span>
            </div>

            {slotsUsed > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                  <div key={attachment.id} className="glass-well relative overflow-hidden rounded-xl">
                    <img
                      src={attachment.url}
                      alt={`Screenshot ${index + 1}`}
                      className="h-20 w-28 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment.id)}
                      className="glass-icon-btn absolute right-1 top-1 h-6 w-6 rounded-full"
                      aria-label={`Remove screenshot ${index + 1}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {Array.from({ length: shrinking }, (_, index) => (
                  <div
                    key={`shrinking-${index}`}
                    className="glass-well flex h-20 w-28 items-center justify-center rounded-xl"
                    aria-label="Preparing image"
                  >
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
                  </div>
                ))}
              </div>
            )}

            {slotsUsed < FEEDBACK_LIMITS.images && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`glass-well flex w-full flex-col items-center justify-center gap-1 rounded-2xl border border-dashed px-4 py-5 text-center transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${
                  dragging ? "border-cyan-300/70" : "border-white/15 hover:border-white/30"
                }`}
              >
                <ImagePlus className="h-5 w-5 text-cyan-300" />
                <span className="text-xs font-semibold text-white/80">Add screenshots</span>
                <span className="text-[11px] text-white/50">
                  Click, drop or paste, up to {FEEDBACK_LIMITS.images} images
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                void addFiles(Array.from(e.target.files ?? []));
                e.target.value = "";
              }}
            />
          </div>

          <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
            <label>
              Website
              <input
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </label>
          </div>

          {error && (
            <p
              role="alert"
              className="flex items-start gap-1.5 rounded-xl bg-rose-500/10 px-3 py-2 text-xs text-rose-300"
            >
              <CircleAlert className="mt-px h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4 sm:px-6">
          <span className="hidden text-[11px] text-white/45 sm:block">
            Please don&apos;t include personal details.
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={safeClose}
              disabled={submitting}
              className="glass-btn px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              form={`${id}-form`}
              disabled={!canSend}
              className="glass-btn glass-btn--primary px-5 py-2 text-sm font-bold"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {submitting ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
