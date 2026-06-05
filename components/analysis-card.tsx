"use client";

import { Loader2, User } from "lucide-react";
import type { FaceAnalysis } from "@/types";
import { useTranslation } from "@/lib/i18n/hook";

interface AnalysisCardProps {
  analysis: FaceAnalysis | null;
  loading: boolean;
  error?: string | null;
}

function SkeletonLine({ width = "w-full" }: { width?: string }) {
  return <div className={`h-4 animate-pulse bg-white/10 ${width}`} />;
}

export default function AnalysisCard({ analysis, loading, error }: AnalysisCardProps) {
  const { t } = useTranslation();
  const recommendedStyles = Array.isArray(analysis?.recommendedStyles)
    ? analysis.recommendedStyles
    : [];
  const features = analysis?.features;
  const currentHair = analysis?.currentHair;

  return (
    <div className="studio-panel p-4">
      <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
        <User className="h-4 w-4 text-primary-200" />
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-200">{t("analysis.title")}</h3>
      </div>

      {loading ? (
        <div className="space-y-3">
          <SkeletonLine />
          <SkeletonLine width="w-3/4" />
          <SkeletonLine width="w-5/6" />
          <SkeletonLine width="w-2/3" />
          <SkeletonLine width="w-4/5" />
        </div>
      ) : error ? (
        <div className="border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <p className="font-medium text-red-100">{t("analysis.error")}</p>
          <p className="mt-1 text-xs text-red-200/80">{error}</p>
          <p className="mt-1 text-xs text-red-200/60">{t("analysis.errorHint")}</p>
        </div>
      ) : analysis ? (
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between border border-white/10 bg-white/[0.04] px-3 py-2">
            <span className="text-surface-400">{t("analysis.faceShape")}</span>
            <span className="font-medium text-surface-50">{analysis.faceShape}</span>
          </div>
          <div className="flex items-center justify-between border border-white/10 bg-white/[0.04] px-3 py-2">
            <span className="text-surface-400">{t("analysis.skinTone")}</span>
            <span className="font-medium text-surface-50">{analysis.skinTone}</span>
          </div>
          <div className="flex items-center justify-between border border-white/10 bg-white/[0.04] px-3 py-2">
            <span className="text-surface-400">{t("analysis.gender")}</span>
            <span className="font-medium text-surface-50">{analysis.gender}</span>
          </div>
          <div className="flex items-center justify-between border border-white/10 bg-white/[0.04] px-3 py-2">
            <span className="text-surface-400">{t("analysis.ageRange")}</span>
            <span className="font-medium text-surface-50">{analysis.ageRange}</span>
          </div>

          <div className="border-t border-white/10 pt-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-primary-300">{t("analysis.features")}</p>
            <div className="space-y-1 text-xs leading-5 text-surface-300">
              <p>{t("analysis.eyes")}: {features?.eyes || "-"}</p>
              <p>{t("analysis.eyebrows")}: {features?.eyebrows || "-"}</p>
              <p>{t("analysis.nose")}: {features?.nose || "-"}</p>
              <p>{t("analysis.lips")}: {features?.lips || "-"}</p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-primary-300">{t("analysis.currentHair")}</p>
            <div className="space-y-1 text-xs leading-5 text-surface-300">
              <p>{t("analysis.length")}: {currentHair?.length || "-"}</p>
              <p>{t("analysis.color")}: {currentHair?.color || "-"}</p>
              <p>{t("analysis.style")}: {currentHair?.style || "-"}</p>
            </div>
          </div>

          {recommendedStyles.length > 0 && (
            <div className="border-t border-white/10 pt-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-primary-300">{t("analysis.recommended")}</p>
              <div className="flex flex-wrap gap-1.5">
                {recommendedStyles.map((style, i) => (
                  <span
                    key={i}
                    className="border border-primary-300/35 bg-primary-500/10 px-2.5 py-1 text-xs text-primary-100"
                  >
                    {style}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
