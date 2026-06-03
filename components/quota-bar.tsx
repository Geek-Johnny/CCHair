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
}

export default function QuotaBar({ onUpgrade, refreshKey }: QuotaBarProps) {
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
    <div className="flex items-center gap-2">
      {quota.isAdmin ? (
        <span className="text-xs text-green-600 font-medium">{t("quota.admin")}</span>
      ) : isFreeUser ? (
        <span className="text-xs text-surface-500">
          {isExhausted ? (
            t("quota.freeExhausted")
          ) : (
            <>
              {t("quota.freeRemaining")} <span className="font-semibold text-surface-700">{quota.freeRemaining}</span> {t("quota.times")}
            </>
          )}
        </span>
      ) : (
        <span className="text-xs text-surface-500">
          {t("quota.paidRemaining")} <span className="font-semibold text-surface-700">{quota.totalRemaining}</span> {t("quota.times")}
        </span>
      )}

      {!quota.isAdmin && isExhausted && (
        <button
          onClick={onUpgrade}
          className="flex items-center gap-1 rounded-md bg-orange-500 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-orange-600"
        >
          <Zap className="h-3 w-3" />
          {t("quota.upgrade")}
        </button>
      )}
    </div>
  );
}
