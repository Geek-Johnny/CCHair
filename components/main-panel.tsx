"use client";

import { useState, useEffect, useRef } from "react";
import UploadArea from "@/components/upload-area";
import AnalysisCard from "@/components/analysis-card";
import HairStyleSelector from "@/components/hair-style-selector";
import ResultGrid from "@/components/result-grid";
import ToastContainer, { useToastManager } from "@/components/toast";
import type { FaceAnalysis, GenerationResult, GenerateItem, HistoryRecord } from "@/types";
import { POPULAR_HAIRSTYLES } from "@/types";
import { saveRecord, updateRecordResults } from "@/lib/db";
import { useFingerprint } from "@/lib/use-fingerprint";
import { useTranslation } from "@/lib/i18n/hook";

const ANALYZE_PROVIDER = "dmxapi";

interface GeneratingState {
  active: boolean;
  current: number;
  total: number;
}

interface MainPanelProps {
  loadRecord?: HistoryRecord | null;
  onRecordLoaded?: () => void;
  onQuotaRefresh?: () => void;
}

export default function MainPanel({ loadRecord, onRecordLoaded, onQuotaRefresh }: MainPanelProps) {
  const { t, lang } = useTranslation();
  const fingerprint = useFingerprint();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FaceAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [generating, setGenerating] = useState<GeneratingState>({
    active: false,
    current: 0,
    total: 0,
  });
  const { toasts, removeToast, addError, addSuccess } = useToastManager();

  // Refs for tracking state across closures
  const resultsRef = useRef<GenerationResult[]>([]);
  const recordIdRef = useRef<string | null>(null);

  // Load a history record (from page.tsx prop)
  useEffect(() => {
    if (loadRecord) {
      setOriginalImage(loadRecord.originalImage);
      setAnalysis(loadRecord.analysis);
      setResults(loadRecord.results);
      resultsRef.current = loadRecord.results;
      recordIdRef.current = loadRecord.id;
      onRecordLoaded?.();
    }
  }, [loadRecord]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleImageUpload = async (base64: string) => {
    setOriginalImage(base64);
    setAnalysis(null);
    setAnalysisError(null);
    setResults([]);
    resultsRef.current = [];
    recordIdRef.current = null;
    setAnalyzing(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, provider: ANALYZE_PROVIDER, lang }),
      });
      const data = await res.json();
      if (res.ok) {
        setAnalysis(data.analysis);

        // Save to IndexedDB
        const id = `history-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const record: HistoryRecord = {
          id,
          originalImage: base64,
          analysis: data.analysis,
          results: [],
          createdAt: Date.now(),
        };
        await saveRecord(record);
        recordIdRef.current = id;
      } else {
        const msg = data.error || t("mainPanel.analysisError");
        setAnalysisError(msg);
        addError(msg);
      }
    } catch (err) {
      const msg = t("mainPanel.networkError");
      setAnalysisError(msg);
      addError(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerate = async (items: GenerateItem[]) => {
    if (!originalImage || items.length === 0) return;
    // Snapshot current results (for appending new ones)
    const snapshot = [...resultsRef.current];
    const totalNew = items.length;
    setGenerating({ active: true, current: 0, total: totalNew });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      setGenerating({ active: true, current: i + 1, total: totalNew });

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: originalImage, hairstyle: item.hairstyle, fingerprint }),
        });
        const data = await res.json();
        if (res.ok) {
          const result: GenerationResult = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            hairstyleName: item.name,
            hairstyleTags: item.tags,
            imageData: data.image,
            timestamp: Date.now(),
          };
          snapshot.push(result);
          resultsRef.current = snapshot;
          setResults([...snapshot]);
        } else if (data.code === "QUOTA_EXCEEDED") {
          addError(t("mainPanel.quotaExceeded"));
          break;
        } else {
          addError(t("mainPanel.generateFailed", { name: item.name, error: data.error || t("mainPanel.unknownError") }));
        }
      } catch (err) {
        console.error(`生成失败 [${item.name}]:`, err);
        addError(t("mainPanel.generateFailedRetry", { name: item.name }));
      }
    }

    setGenerating({ active: false, current: 0, total: 0 });
    onQuotaRefresh?.();

    // Update IndexedDB record with full results
    const id = recordIdRef.current;
    if (id && snapshot.length > 0) {
      try {
        await updateRecordResults(id, snapshot);
      } catch (err) {
        console.warn("历史记录保存失败:", err);
        addError(t("mainPanel.historySaveFailed"));
      }
    }
  };

  const handleRandomGenerate = () => {
    if (!analysis) return;

    // Build pool: AI recommended + gender-filtered popular styles
    const isMale = analysis.gender === "男" || analysis.gender === "男性";
    const genderKnown = analysis.gender !== undefined && analysis.gender !== null && analysis.gender !== "";

    const pool: string[] = [];

    // Add AI recommended styles
    if (analysis.recommendedStyles) {
      pool.push(...analysis.recommendedStyles);
    }

    // Add popular styles filtered by gender
    const popular = genderKnown
      ? POPULAR_HAIRSTYLES.filter((h) => isMale ? h.gender === "male" : h.gender === "female")
      : POPULAR_HAIRSTYLES;
    pool.push(...popular.map((h) => h.name));

    // Deduplicate
    const unique = [...new Set(pool)];

    // Shuffle and pick 6
    for (let i = unique.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unique[i], unique[j]] = [unique[j], unique[i]];
    }

    const selected = unique.slice(0, 6);
    const items: GenerateItem[] = selected.map((name) => ({
      hairstyle: name,
      name,
      tags: [name],
    }));

    // Clear previous results and generate
    setResults([]);
    resultsRef.current = [];
    handleGenerate(items);
  };

  const isBusy = analyzing || generating.active;

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {/* 移动端：单列滚动 | 桌面端：左右分栏 */}
      <div className="studio-shell mx-auto max-w-7xl p-4 pb-20 md:min-h-[calc(100vh-4rem)] md:pb-8">
        <div className="mb-5 flex flex-col justify-between gap-3 border-b border-white/10 pb-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-300">
              {t("mainPanel.kicker")}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-wide text-surface-50 md:text-4xl">
              {t("mainPanel.heroTitle")}
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-6 text-surface-300">
            {t("mainPanel.heroSubtitle")}
          </p>
        </div>
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          {/* 左侧面板 */}
          <div className="flex w-full flex-col gap-4 md:w-[410px] md:shrink-0">
            <UploadArea
              onImageUpload={handleImageUpload}
              onError={addError}
              currentImage={originalImage}
              disabled={isBusy}
            />
            {(analyzing || analysisError || analysis) && (
              <AnalysisCard analysis={analysis} loading={analyzing} error={analysisError} />
            )}
          </div>

          {/* 右侧面板 */}
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            {originalImage && (
              <HairStyleSelector
                key={originalImage.slice(-20)}
                onGenerate={handleGenerate}
                onRandomGenerate={handleRandomGenerate}
                generating={generating.active}
                disabled={!analysis}
                gender={analysis?.gender}
                recommendedStyles={analysis?.recommendedStyles}
              />
            )}
            <ResultGrid
              results={results}
              generating={generating}
              originalImage={originalImage}
              analysis={analysis}
            />
          </div>
        </div>
      </div>
    </>
  );
}
