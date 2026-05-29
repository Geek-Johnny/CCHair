"use client";

import { useState, useCallback } from "react";
import Header from "@/components/header";
import MainPanel from "@/components/main-panel";
import HistoryPanel from "@/components/history-panel";
import type { HistoryRecord } from "@/types";

export default function Home() {
  const [showHistory, setShowHistory] = useState(false);
  const [loadRecord, setLoadRecord] = useState<HistoryRecord | null>(null);

  const handleLoadRecord = useCallback((record: HistoryRecord) => {
    setLoadRecord(record);
    setShowHistory(false);
  }, []);

  const handleRecordLoaded = useCallback(() => {
    setLoadRecord(null);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header onHistoryClick={() => setShowHistory(true)} />
      <main className="flex-1">
        <MainPanel
          loadRecord={loadRecord}
          onRecordLoaded={handleRecordLoaded}
        />
      </main>
      {showHistory && (
        <HistoryPanel
          onClose={() => setShowHistory(false)}
          onLoadRecord={handleLoadRecord}
        />
      )}
    </div>
  );
}
