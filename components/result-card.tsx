"use client";

import { useState, useCallback, useEffect } from "react";
import { Download, Expand, Share2 } from "lucide-react";
import type { GenerationResult } from "@/types";
import { useTranslation } from "@/lib/i18n/hook";

interface ResultCardProps {
  result: GenerationResult;
}

function getImageSrc(data: string) {
  return data.startsWith("data:") ? data : `data:image/png;base64,${data}`;
}

export default function ResultCard({ result }: ResultCardProps) {
  const { t } = useTranslation();
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
    const text = t("result.shareText", { name: result.hairstyleName });

    // Web Share API (mobile)
    if (navigator.share) {
      try {
        const res = await fetch(getImageSrc(result.imageData));
        const blob = await res.blob();
        const file = new File([blob], `cchair-${result.hairstyleName}.png`, {
          type: "image/png",
        });
        await navigator.share({ title: t("result.shareTitle"), text, files: [file] });
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
  }, [result, t]);

  return (
    <>
      <div
        className="studio-panel group relative overflow-hidden"
        style={{ animation: "fadeInUp 0.3s ease-out" }}
      >
        <div className="aspect-square overflow-hidden bg-surface-950">
          <img
            src={getImageSrc(result.imageData)}
            alt={result.hairstyleName}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>

        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/45 group-hover:opacity-100">
          <button
            onClick={() => setLightboxOpen(true)}
            className="flex h-9 w-9 items-center justify-center border border-white/20 bg-surface-50/95 text-surface-950 shadow-sm transition-transform hover:scale-110"
          >
            <Expand className="h-4 w-4" />
          </button>
          <button
            onClick={handleDownload}
            className="flex h-9 w-9 items-center justify-center border border-white/20 bg-surface-50/95 text-surface-950 shadow-sm transition-transform hover:scale-110"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleShare}
            className="flex h-9 w-9 items-center justify-center border border-white/20 bg-surface-50/95 text-surface-950 shadow-sm transition-transform hover:scale-110"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-surface-50">
              {result.hairstyleName}
            </p>
            {shared && (
              <span className="text-[10px] text-primary-200">{t("result.copied")}</span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {result.hairstyleTags.map((tag, i) => (
              <span
                key={i}
                className="border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-surface-400"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
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
              className="max-h-[85vh] max-w-full border border-white/15 object-contain shadow-2xl"
            />
            <p className="mt-3 text-center text-sm text-surface-100">
              {result.hairstyleName}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
