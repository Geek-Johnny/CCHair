"use client";

import { Loader2, User } from "lucide-react";
import type { FaceAnalysis } from "@/types";

interface AnalysisCardProps {
  analysis: FaceAnalysis | null;
  loading: boolean;
  error?: string | null;
}

function SkeletonLine({ width = "w-full" }: { width?: string }) {
  return <div className={`h-4 animate-pulse rounded bg-surface-200 ${width}`} />;
}

export default function AnalysisCard({ analysis, loading, error }: AnalysisCardProps) {
  return (
    <div className="rounded-xl border border-surface-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <User className="h-4 w-4 text-primary-500" />
        <h3 className="text-sm font-semibold text-surface-700">人脸分析结果</h3>
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
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          <p className="font-medium">分析失败</p>
          <p className="mt-1 text-xs text-red-500">{error}</p>
          <p className="mt-1 text-xs text-red-400">请更换图片或切换模型后重试</p>
        </div>
      ) : analysis ? (
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-lg bg-surface-50 px-3 py-2">
            <span className="text-surface-500">脸型</span>
            <span className="font-medium text-surface-800">{analysis.faceShape}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface-50 px-3 py-2">
            <span className="text-surface-500">肤色</span>
            <span className="font-medium text-surface-800">{analysis.skinTone}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface-50 px-3 py-2">
            <span className="text-surface-500">性别</span>
            <span className="font-medium text-surface-800">{analysis.gender}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface-50 px-3 py-2">
            <span className="text-surface-500">年龄段</span>
            <span className="font-medium text-surface-800">{analysis.ageRange}</span>
          </div>

          <div className="border-t border-surface-100 pt-2">
            <p className="mb-1 text-xs font-medium text-surface-400">五官特征</p>
            <div className="space-y-1 text-xs text-surface-600">
              <p>眼: {analysis.features.eyes}</p>
              <p>眉: {analysis.features.eyebrows}</p>
              <p>鼻: {analysis.features.nose}</p>
              <p>唇: {analysis.features.lips}</p>
            </div>
          </div>

          <div className="border-t border-surface-100 pt-2">
            <p className="mb-1 text-xs font-medium text-surface-400">当前发型</p>
            <div className="space-y-1 text-xs text-surface-600">
              <p>长度: {analysis.currentHair.length}</p>
              <p>发色: {analysis.currentHair.color}</p>
              <p>风格: {analysis.currentHair.style}</p>
            </div>
          </div>

          <div className="border-t border-surface-100 pt-2">
            <p className="mb-2 text-xs font-medium text-surface-400">推荐发型</p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.recommendedStyles.map((style, i) => (
                <span
                  key={i}
                  className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs text-primary-600"
                >
                  {style}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
