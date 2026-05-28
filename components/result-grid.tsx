"use client";

import { Loader2 } from "lucide-react";
import ResultCard from "@/components/result-card";
import type { GenerationResult } from "@/types";

interface ResultGridProps {
  results: GenerationResult[];
  generating: boolean;
}

export default function ResultGrid({ results, generating }: ResultGridProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {results.length === 0 && !generating ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-surface-400">
            上传人像照并选择发型后，效果将在这里展示
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {results.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))}

          {generating && (
            <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-surface-300 bg-white p-12">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                <span className="text-xs text-surface-400">生成中...</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
