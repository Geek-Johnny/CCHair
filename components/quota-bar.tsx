"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

interface QuotaData {
  freeUsed: number;
  freeLimit: number;
  paidCredits: number;
  totalRemaining: number;
}

interface QuotaBarProps {
  onUpgrade?: () => void;
}

export default function QuotaBar({ onUpgrade }: QuotaBarProps) {
  const [quota, setQuota] = useState<QuotaData | null>(null);

  useEffect(() => {
    fetchQuota();
  }, []);

  const fetchQuota = async () => {
    try {
      const res = await fetch("/api/quota");
      if (res.ok) {
        const data = await res.json();
        setQuota(data);
      }
    } catch {
      // Silently fail
    }
  };

  if (!quota) return null;

  const isFreeUser = quota.paidCredits === 0;
  const isExhausted = quota.totalRemaining === 0;

  return (
    <div className="flex items-center gap-2">
      {isFreeUser ? (
        <span className="text-xs text-surface-500">
          免费额度 <span className="font-semibold text-surface-700">{quota.freeUsed}</span>/{quota.freeLimit} 次
        </span>
      ) : (
        <span className="text-xs text-surface-500">
          剩余 <span className="font-semibold text-surface-700">{quota.totalRemaining}</span> 次
        </span>
      )}

      {isExhausted && (
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
