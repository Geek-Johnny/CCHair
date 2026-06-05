"use client";

import { useCallback, useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { useFingerprint } from "@/lib/use-fingerprint";
import { useTranslation } from "@/lib/i18n/hook";

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
  className?: string;
}

export default function QuotaBar({ onUpgrade, refreshKey, className = "" }: QuotaBarProps) {
  const { t } = useTranslation();
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
    <div className={`flex shrink-0 items-center gap-2 ${className}`}>
      {quota.isAdmin ? (
        <span className="whitespace-nowrap border border-emerald-300/30 bg-emerald-400/10 px-2 py-1.5 text-xs font-medium text-emerald-200 sm:px-2.5">{t("quota.admin")}</span>
      ) : isFreeUser ? (
        <span className="whitespace-nowrap border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs text-surface-300 sm:px-2.5">
          {isExhausted ? (
            t("quota.freeExhausted")
          ) : (
            <>
              {t("quota.freeRemaining")} <span className="font-semibold text-primary-200">{quota.freeRemaining}</span> {t("quota.times")}
            </>
          )}
        </span>
      ) : (
        <span className="whitespace-nowrap border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs text-surface-300 sm:px-2.5">
          {t("quota.paidRemaining")} <span className="font-semibold text-primary-200">{quota.totalRemaining}</span> {t("quota.times")}
        </span>
      )}

      {!quota.isAdmin && isExhausted && (
        <button
          onClick={onUpgrade}
          className="flex shrink-0 items-center gap-1 whitespace-nowrap bg-primary-500 px-2 py-1.5 text-xs font-semibold text-surface-950 transition-colors hover:bg-primary-300 sm:px-2.5"
        >
          <Zap className="h-3 w-3" />
          {t("quota.upgrade")}
        </button>
      )}
    </div>
  );
}
