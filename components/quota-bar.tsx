"use client";

import { useCallback, useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { useFingerprint } from "@/lib/use-fingerprint";

interface QuotaData {
  freeUsed: number;
  freeLimit: number;
  freeRemaining: number;
  paidCredits: number;
  totalRemaining: number;
  isAdmin?: boolean;
}

interface QuotaBarProps {
  onUpgrade?: () => void;
  refreshKey?: number;
}

export default function QuotaBar({ onUpgrade, refreshKey }: QuotaBarProps) {
  const fingerprint = useFingerprint();
  const [quota, setQuota] = useState<QuotaData | null>(null);

  const fetchQuota = useCallback(async () => {
    if (!fingerprint) return;
    try {
      const res = await fetch("/api/quota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprint }),
      });
      if (res.ok) {
        const data = await res.json();
        setQuota(data);
      }
    } catch {
      // Silently fail
    }
  }, [fingerprint]);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota, refreshKey]);

  if (!quota) return null;

  const isFreeUser = quota.paidCredits === 0;
  const isExhausted = quota.totalRemaining === 0;

  return (
    <div className="flex items-center gap-2">
      {quota.isAdmin ? (
        <span className="text-xs text-green-600 font-medium">管理员 · 无限额度</span>
      ) : isFreeUser ? (
        <span className="text-xs text-surface-500">
          {isExhausted ? (
            "免费额度已用完"
          ) : (
            <>
              免费额度剩余 <span className="font-semibold text-surface-700">{quota.freeRemaining}</span> 次
            </>
          )}
        </span>
      ) : (
        <span className="text-xs text-surface-500">
          剩余 <span className="font-semibold text-surface-700">{quota.totalRemaining}</span> 次
        </span>
      )}

      {!quota.isAdmin && isExhausted && (
        <button
          onClick={onUpgrade}
          className="flex items-center gap-1 rounded-md bg-orange-500 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-orange-600"
        >
          <Zap className="h-3 w-3" />
          升级
        </button>
      )}
    </div>
  );
}
