"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Trash2, Clock, ImageIcon } from "lucide-react";
import type { HistoryRecord } from "@/types";
import { getAllRecords, deleteRecord } from "@/lib/db";
import { useTranslation } from "@/lib/i18n/hook";

interface HistoryPanelProps {
  onClose: () => void;
  onLoadRecord: (record: HistoryRecord) => void;
}

export default function HistoryPanel({
  onClose,
  onLoadRecord,
}: HistoryPanelProps) {
  const { t } = useTranslation();
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const all = await getAllRecords();
      setRecords(all);
    } catch (err) {
      console.error("加载历史记录失败:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteRecord(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full border-l border-white/10 bg-surface-950 shadow-2xl md:w-[380px]">
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary-200" />
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-200">
              {t("history.title")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-surface-400 transition-colors hover:bg-white/10 hover:text-surface-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="h-[calc(100vh-4rem)] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/15 border-t-primary-300" />
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-surface-400">
              <Clock className="h-8 w-8" />
              <p className="text-sm">{t("history.empty")}</p>
            </div>
          ) : (
            <div className="space-y-1 p-3">
              {records.map((record) => (
                <div
                  key={record.id}
                  onClick={() => onLoadRecord(record)}
                  className="group flex cursor-pointer items-start gap-3 border border-transparent p-3 transition-colors hover:border-primary-300/20 hover:bg-white/[0.045]"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden bg-white/10">
                    {record.originalImage ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={`data:image/jpeg;base64,${record.originalImage}`}
                          alt=""
                          fill
                          sizes="48px"
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-surface-500" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-surface-100">
                      {record.analysis.faceShape} · {record.analysis.gender}
                    </p>
                    <p className="mt-0.5 text-[11px] text-surface-400">
                      {record.results.length > 0
                        ? t("history.resultCount", { count: record.results.length })
                        : t("history.analysisOnly")}
                    </p>
                    <p className="mt-0.5 text-[11px] text-surface-300">
                      {formatDate(record.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, record.id)}
                    className="shrink-0 p-1 text-surface-500 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
