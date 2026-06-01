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

const ANALYZE_PROVIDER = "dmxapi";

interface GeneratingState {
  active: boolean;
  current: number;
  total: number;
}

interface MainPanelProps {
  loadRecord?: HistoryRecord | null;
  onRecordLoaded?: () => void;
}

export default function MainPanel({ loadRecord, onRecordLoaded }: MainPanelProps) {
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
        body: JSON.stringify({ image: base64, provider: ANALYZE_PROVIDER }),
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
        const msg = data.error || "分析失败，请重试";
        setAnalysisError(msg);
        addError(msg);
      }
    } catch (err) {
      const msg = "网络错误，请检查网络后重试";
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
          body: JSON.stringify({ image: originalImage, hairstyle: item.hairstyle }),
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
          addError("额度已用完，升级后可继续生成");
          break;
        } else {
          addError(`「${item.name}」生成失败: ${data.error || "未知错误"}`);
        }
      } catch {
        addError(`「${item.name}」网络错误，请重试`);
      }
    }

    setGenerating({ active: false, current: 0, total: 0 });

    // Update IndexedDB record with full results
    const id = recordIdRef.current;
    if (id && snapshot.length > 0) {
      await updateRecordResults(id, snapshot);
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
      <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-7xl flex-col gap-4 p-4 md:flex-row">
        {/* 左侧面板 */}
        <div className="flex max-h-[50vh] w-full flex-col gap-4 overflow-y-auto md:max-h-none md:w-[400px] md:shrink-0">
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
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-4">
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
    </>
  );
}
