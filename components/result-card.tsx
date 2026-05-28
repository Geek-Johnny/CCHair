"use client";

import { useState } from "react";
import { Download, Expand } from "lucide-react";
import type { GenerationResult } from "@/types";

interface ResultCardProps {
  result: GenerationResult;
}

export default function ResultCard({ result }: ResultCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = `cchair-${result.hairstyleName}-${result.id}.png`;
    link.href = result.imageData.startsWith("data:")
      ? result.imageData
      : `data:image/png;base64,${result.imageData}`;
    link.click();
  };

  return (
    <>
      <div className="group relative overflow-hidden rounded-xl border border-surface-200 bg-white">
        <div className="aspect-square overflow-hidden">
          <img
            src={result.imageData.startsWith("data:") ? result.imageData : `data:image/png;base64,${result.imageData}`}
            alt={result.hairstyleName}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>

        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
          <button
            onClick={() => setLightboxOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-surface-700"
          >
            <Expand className="h-4 w-4" />
          </button>
          <button
            onClick={handleDownload}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-surface-700"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>

        <div className="p-2.5">
          <p className="text-sm font-medium text-surface-800">{result.hairstyleName}</p>
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
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img
              src={result.imageData.startsWith("data:") ? result.imageData : `data:image/png;base64,${result.imageData}`}
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
