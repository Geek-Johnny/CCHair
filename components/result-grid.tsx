"use client";

import { Loader2, Download } from "lucide-react";
import ResultCard from "@/components/result-card";
import type { GenerationResult } from "@/types";

interface GeneratingState {
  active: boolean;
  current: number;
  total: number;
}

interface ResultGridProps {
  results: GenerationResult[];
  generating: GeneratingState;
}

export default function ResultGrid({ results, generating }: ResultGridProps) {
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

  const showEmpty = results.length === 0 && !generating.active;

  return (
    <div>
      {/* Toolbar */}
      {results.length > 0 && (
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs text-surface-400">
            共 <span className="font-semibold text-surface-600">{results.length}</span> 张
          </p>
          <button
            onClick={handleBatchDownload}
            disabled={generating.active}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            全部下载
          </button>
        </div>
      )}

      {/* Grid */}
      {showEmpty ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-surface-400">
            上传人像照并选择发型后，效果将在这里展示
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
                  正在生成 {generating.current}/{generating.total}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
