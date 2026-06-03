"use client";

import { useState } from "react";
import { Loader2, Download, ImageIcon, Share2 } from "lucide-react";
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
  const handleBatchDownload = () => {
    results.forEach((result, i) => {
      setTimeout(() => {
        const link = document.createElement("a");
        const pad = String(i + 1).padStart(2, "0");
        link.download = `cchair-${pad}-${result.hairstyleName}.png`;
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
    try {
      const blob = await generateShareCard({ originalImage, analysis, results, lang });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `cchair-share-${Date.now()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("生成分享卡片失败:", err);
    } finally {
      setGeneratingCard(false);
    }
  };

  const showEmpty = results.length === 0 && !generating.active;
  const canShare = results.length > 0 && originalImage && analysis;

  return (
    <div>
      {/* Toolbar */}
      {results.length > 0 && (
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs text-surface-400">
            {t("result.total", { count: results.length })}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareCard}
              disabled={generating.active || generatingCard || !canShare}
              className="flex items-center gap-1.5 rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              {t("result.downloadAll")}
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {showEmpty ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <ImageIcon className="h-10 w-10 text-surface-300" />
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
            <div className="flex animate-[fadeInUp_0.3s_ease-out] items-center justify-center rounded-xl border-2 border-dashed border-surface-300 bg-white p-12">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                <span className="text-xs text-surface-400">
                  {t("result.generating", { current: generating.current, total: generating.total })}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
