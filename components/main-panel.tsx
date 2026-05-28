"use client";

import { useState } from "react";
import UploadArea from "@/components/upload-area";
import AnalysisCard from "@/components/analysis-card";
import HairStyleSelector from "@/components/hair-style-selector";
import ResultGrid from "@/components/result-grid";
import type { FaceAnalysis, GenerationResult } from "@/types";

export default function MainPanel() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FaceAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [generating, setGenerating] = useState(false);

  const handleImageUpload = async (base64: string) => {
    setOriginalImage(base64);
    setAnalysis(null);
    setResults([]);
    setAnalyzing(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });
      const data = await res.json();
      if (res.ok) {
        setAnalysis(data.analysis);
      } else {
        console.error("分析失败:", data.error);
      }
    } catch (err) {
      console.error("分析请求失败:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerate = async (hairstyle: string, name: string, tags: string[]) => {
    if (!originalImage) return;
    setGenerating(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: originalImage, hairstyle }),
      });
      const data = await res.json();
      if (res.ok) {
        const result: GenerationResult = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          hairstyleName: name,
          hairstyleTags: tags,
          imageData: data.image,
          timestamp: Date.now(),
        };
        setResults((prev) => [...prev, result]);
      } else {
        console.error("生成失败:", data.error);
      }
    } catch (err) {
      console.error("生成请求失败:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-7xl gap-4 p-4">
      {/* 左侧面板 */}
      <div className="flex w-[400px] shrink-0 flex-col gap-4 overflow-y-auto">
        <UploadArea
          onImageUpload={handleImageUpload}
          currentImage={originalImage}
          disabled={analyzing || generating}
        />
        {(analyzing || analysis) && (
          <AnalysisCard analysis={analysis} loading={analyzing} />
        )}
      </div>

      {/* 右侧面板 */}
      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
        {originalImage && (
          <HairStyleSelector
            onGenerate={handleGenerate}
            generating={generating}
            disabled={!analysis}
          />
        )}
        <ResultGrid results={results} generating={generating} />
      </div>
    </div>
  );
}
