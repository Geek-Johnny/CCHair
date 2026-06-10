"use client";

import { useEffect, useState } from "react";
import { Loader2, Download, ImageIcon, Share2, X } from "lucide-react";
import ResultCard from "@/components/result-card";
import { generateShareCard } from "@/lib/share-card";
import type { GenerationResult, FaceAnalysis } from "@/types";
import { useTranslation } from "@/lib/i18n/hook";

interface GeneratingState {
  active: boolean;
  current: number;
  total: number;
}

interface ResultGridProps {
  results: GenerationResult[];
  generating: GeneratingState;
  originalImage?: string | null;
  analysis?: FaceAnalysis | null;
}

export default function ResultGrid({ results, generating, originalImage, analysis }: ResultGridProps) {
  const { t, lang } = useTranslation();
  const [generatingCard, setGeneratingCard] = useState(false);
  const [shareCardUrl, setShareCardUrl] = useState<string | null>(null);
  const [shareCardError, setShareCardError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (shareCardUrl) URL.revokeObjectURL(shareCardUrl);
    };
  }, [shareCardUrl]);

  const handleBatchDownload = () => {
    results.forEach((result, i) => {
      setTimeout(() => {
        const link = document.createElement("a");
        const pad = String(i + 1).padStart(2, "0");
        link.download = `hairmirra-${pad}-${result.hairstyleName}.png`;
        link.href = result.imageData.startsWith("data:")
          ? result.imageData
          : `data:image/png;base64,${result.imageData}`;
        link.click();
      }, i * 300);
    });
  };

  const handleShareCard = async () => {
    if (!originalImage || !analysis || results.length === 0) return;
    setGeneratingCard(true);
    setShareCardError(null);
    try {
      const blob = await generateShareCard({ originalImage, analysis, results, lang });
      const url = URL.createObjectURL(blob);
      setShareCardUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch (err) {
      console.error("生成分享卡片失败:", err);
      setShareCardError(t("mainPanel.unknownError"));
    } finally {
      setGeneratingCard(false);
    }
  };

  const closeShareCardPreview = () => {
    setShareCardUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setShareCardError(null);
  };

  const handleDownloadShareCard = () => {
    if (!shareCardUrl) return;
    const link = document.createElement("a");
    link.download = `hairmirra-share-${Date.now()}.png`;
    link.href = shareCardUrl;
    link.click();
  };

  const showEmpty = results.length === 0 && !generating.active;
  const canShare = results.length > 0 && originalImage && analysis;

  return (
    <div className="min-h-0">
      {/* Toolbar */}
      {results.length > 0 && (
        <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
          <p className="text-xs uppercase tracking-[0.18em] text-surface-400">
            {t("result.total", { count: results.length })}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareCard}
              disabled={generating.active || generatingCard || !canShare}
              className="flex items-center gap-1.5 bg-primary-400 px-3 py-1.5 text-xs font-semibold text-surface-950 shadow-sm transition-colors hover:bg-primary-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generatingCard ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Share2 className="h-3.5 w-3.5" />
              )}
              {t("result.shareCard")}
            </button>
            <button
              onClick={handleBatchDownload}
              disabled={generating.active}
              className="flex items-center gap-1.5 border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-surface-300 transition-colors hover:border-primary-300/40 hover:bg-primary-500/10 hover:text-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              {t("result.downloadAll")}
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {showEmpty ? (
        <div className="studio-panel flex min-h-72 flex-col items-center justify-center gap-3 py-16">
          <ImageIcon className="h-10 w-10 text-primary-300/60" />
          <p className="text-sm text-surface-400">
            {t("result.empty")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {results.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))}

          {generating.active && (
            <div className="studio-panel-soft flex animate-[fadeInUp_0.3s_ease-out] items-center justify-center border-2 border-dashed border-primary-300/25 p-12">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary-300" />
                <span className="text-xs text-surface-300">
                  {t("result.generating", { current: generating.current, total: generating.total })}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {shareCardUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={closeShareCardPreview}
        >
          <div
            className="flex w-full max-w-4xl flex-col overflow-hidden border border-white/10 bg-surface-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-200">
                {t("result.previewTitle")}
              </p>
              <button
                onClick={closeShareCardPreview}
                className="p-1 text-surface-400 transition-colors hover:text-surface-100"
                aria-label={t("common.cancel")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex max-h-[75vh] flex-col gap-4 p-4 md:flex-row">
              <button
                type="button"
                onClick={closeShareCardPreview}
                className="group flex min-h-0 flex-1 items-center justify-center overflow-hidden border border-white/10 bg-black/20 p-0"
                aria-label={t("common.cancel")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shareCardUrl}
                  alt={t("result.previewTitle")}
                  className="max-h-[70vh] w-full object-contain transition-opacity group-hover:opacity-95"
                />
              </button>
              <div className="flex w-full flex-col gap-3 md:w-52 md:shrink-0">
                <p className="text-sm leading-6 text-surface-300">
                  {t("shareCard.subtitle")}
                </p>
                {shareCardError && (
                  <p className="text-xs text-red-300">{shareCardError}</p>
                )}
                <button
                  onClick={handleDownloadShareCard}
                  className="flex items-center justify-center gap-1.5 bg-primary-400 px-4 py-2 text-sm font-semibold text-surface-950 transition-colors hover:bg-primary-300"
                >
                  <Download className="h-4 w-4" />
                  {t("result.downloadCard")}
                </button>
                <button
                  onClick={closeShareCardPreview}
                  className="border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-surface-300 transition-colors hover:border-primary-300/40 hover:text-primary-100"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
