"use client";

import { useState, useCallback, useEffect } from "react";
import { Download, Expand, Share2 } from "lucide-react";
import type { GenerationResult } from "@/types";

interface ResultCardProps {
  result: GenerationResult;
}

function getImageSrc(data: string) {
  return data.startsWith("data:") ? data : `data:image/png;base64,${data}`;
}

export default function ResultCard({ result }: ResultCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  const handleDownload = useCallback(() => {
    const link = document.createElement("a");
    link.download = `cchair-${result.hairstyleName}-${result.id.slice(0, 8)}.png`;
    link.href = getImageSrc(result.imageData);
    link.click();
  }, [result]);

  const handleShare = useCallback(async () => {
    const text = `看我用 CCHair 生成的「${result.hairstyleName}」发型效果！`;

    // Web Share API (mobile)
    if (navigator.share) {
      try {
        const res = await fetch(getImageSrc(result.imageData));
        const blob = await res.blob();
        const file = new File([blob], `cchair-${result.hairstyleName}.png`, {
          type: "image/png",
        });
        await navigator.share({ title: "CCHair 发型效果", text, files: [file] });
        return;
      } catch {
        // user cancelled or failed — silently fall through to clipboard
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // clipboard not available either
    }
  }, [result]);

  return (
    <>
      <div
        className="group relative overflow-hidden rounded-xl border border-surface-200 bg-white"
        style={{ animation: "fadeInUp 0.3s ease-out" }}
      >
        <div className="aspect-square overflow-hidden">
          <img
            src={getImageSrc(result.imageData)}
            alt={result.hairstyleName}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>

        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
          <button
            onClick={() => setLightboxOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-surface-700 shadow-sm transition-transform hover:scale-110"
          >
            <Expand className="h-4 w-4" />
          </button>
          <button
            onClick={handleDownload}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-surface-700 shadow-sm transition-transform hover:scale-110"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleShare}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-surface-700 shadow-sm transition-transform hover:scale-110"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        <div className="p-2.5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-surface-800">
              {result.hairstyleName}
            </p>
            {shared && (
              <span className="text-[10px] text-primary-500">已复制</span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {result.hairstyleTags.map((tag, i) => (
              <span
                key={i}
                className="rounded-full bg-surface-100 px-2 py-0.5 text-[10px] text-surface-500"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getImageSrc(result.imageData)}
              alt={result.hairstyleName}
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
            />
            <p className="mt-2 text-center text-sm text-white">
              {result.hairstyleName}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
