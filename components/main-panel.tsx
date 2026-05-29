"use client";

import { useState, useEffect, useRef } from "react";
import UploadArea from "@/components/upload-area";
import AnalysisCard from "@/components/analysis-card";
import HairStyleSelector from "@/components/hair-style-selector";
import ResultGrid from "@/components/result-grid";
import type { FaceAnalysis, GenerationResult, GenerateItem, HistoryRecord } from "@/types";
import { saveRecord, updateRecordResults } from "@/lib/db";

type AnalyzeProvider = "volcano" | "dmxapi";

const PROVIDER_LABELS: Record<AnalyzeProvider, string> = {
  volcano: "火山方舟 (Doubao)",
  dmxapi: "DMXAPI (Mimo-V2.5)",
};

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
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [generating, setGenerating] = useState<GeneratingState>({
    active: false,
    current: 0,
    total: 0,
  });
  const [provider, setProvider] = useState<AnalyzeProvider>("volcano");

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
    setResults([]);
    resultsRef.current = [];
    recordIdRef.current = null;
    setAnalyzing(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, provider }),
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
        console.error("分析失败:", data.error);
      }
    } catch (err) {
      console.error("分析请求失败:", err);
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
        } else {
          console.error(`生成失败 (${item.name}):`, data.error);
        }
      } catch (err) {
        console.error(`生成请求失败 (${item.name}):`, err);
      }
    }

    setGenerating({ active: false, current: 0, total: 0 });

    // Update IndexedDB record with full results
    const id = recordIdRef.current;
    if (id && snapshot.length > 0) {
      await updateRecordResults(id, snapshot);
    }
  };

  const isBusy = analyzing || generating.active;

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-7xl gap-4 p-4">
      {/* 左侧面板 */}
      <div className="flex w-[400px] shrink-0 flex-col gap-4 overflow-y-auto">
        {/* 模型选择 */}
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2">
          <span className="ml-1 text-xs text-gray-500">分析模型:</span>
          <div className="flex gap-1">
            {(Object.entries(PROVIDER_LABELS) as [AnalyzeProvider, string][]).map(
              ([key, label]) => (
                <button
                  key={key}
                  onClick={() => setProvider(key)}
                  disabled={isBusy}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    provider === key
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>
        <UploadArea
          onImageUpload={handleImageUpload}
          currentImage={originalImage}
          disabled={isBusy}
        />
        {(analyzing || analysis) && (
          <AnalysisCard analysis={analysis} loading={analyzing} />
        )}
      </div>

      {/* 右侧面板 */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-4">
        {originalImage && (
          <HairStyleSelector
            key={originalImage.slice(-20)}
            onGenerate={handleGenerate}
            generating={generating.active}
            disabled={!analysis}
            gender={analysis?.gender}
            recommendedStyles={analysis?.recommendedStyles}
          />
        )}
        <ResultGrid results={results} generating={generating} />
      </div>
    </div>
  );
}
