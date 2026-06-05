"use client";

import { useState } from "react";
import { Check, X, Sparkles, Loader2 } from "lucide-react";
import { PLANS, type PlanKey } from "@/types/plan";
import { useFingerprint } from "@/lib/use-fingerprint";
import { useTranslation } from "@/lib/i18n/hook";

interface PlanSelectorProps {
  onClose: () => void;
}

export default function PlanSelector({ onClose }: PlanSelectorProps) {
  const { t } = useTranslation();
  const fingerprint = useFingerprint();
  const [purchasing, setPurchasing] = useState<PlanKey | null>(null);

  const handlePurchase = async (plan: PlanKey) => {
    if (!fingerprint) {
      alert(t("plan.fingerprintLoading"));
      return;
    }

    setPurchasing(plan);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, fingerprint }),
      });
      const data = await res.json();
      if (res.ok) {
        // TODO: 跳转实际支付页面
        alert(t("plan.orderSuccess", { orderId: data.orderId, payUrl: data.payUrl }));
      } else {
        alert(data.error || t("plan.orderFailed"));
      }
    } catch {
      alert(t("plan.networkError"));
    } finally {
      setPurchasing(null);
    }
  };

  const plans: { key: PlanKey; recommended?: boolean }[] = [
    { key: "go" },
    { key: "plus", recommended: true },
    { key: "pro" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="studio-panel relative w-full max-w-3xl p-6" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 text-surface-400 transition-colors hover:bg-white/10 hover:text-surface-100"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-2 inline-flex items-center gap-1.5 border border-primary-300/35 bg-primary-500/10 px-3 py-1 text-sm font-medium text-primary-100">
            <Sparkles className="h-3.5 w-3.5" />
            {t("plan.discount")}
          </div>
          <h2 className="text-xl font-bold text-surface-50">{t("plan.title")}</h2>
          <p className="mt-1 text-sm text-surface-400">{t("plan.subtitle")}</p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {plans.map(({ key, recommended }) => {
            const plan = PLANS[key];
            const perUnit = (plan.price / plan.credits / 100).toFixed(2);
            const originalPerUnit = (plan.originalPrice / plan.credits / 100).toFixed(2);

            return (
              <div
                key={key}
                className={`relative border p-5 transition-all ${
                  recommended
                    ? "border-primary-300 bg-primary-500/10 shadow-[0_18px_44px_rgba(185,129,40,0.14)]"
                    : "border-white/10 bg-white/[0.035] hover:border-white/20"
                }`}
              >
                {recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-300 px-3 py-0.5 text-xs font-semibold text-surface-950">
                    {t("plan.recommended")}
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-sm font-medium text-surface-400">{plan.description}</p>
                  <h3 className="mt-1 text-lg font-bold text-surface-50">{plan.name}</h3>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary-100">¥{plan.price / 100}</span>
                    <span className="text-sm text-surface-400 line-through">¥{plan.originalPrice / 100}</span>
                  </div>
                  <p className="mt-1 text-xs text-surface-400">
                    {t("plan.pricePerUnit", { credits: plan.credits, price: perUnit })}
                  </p>
                </div>

                <ul className="mb-5 space-y-2">
                  <li className="flex items-center gap-2 text-sm text-surface-300">
                    <Check className="h-4 w-4 text-primary-300" />
                    {t("plan.featureGenerations", { credits: plan.credits })}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-surface-300">
                    <Check className="h-4 w-4 text-primary-300" />
                    {t("plan.featureStyles")}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-surface-300">
                    <Check className="h-4 w-4 text-primary-300" />
                    {t("plan.featureDownload")}
                  </li>
                </ul>

                <button
                  onClick={() => handlePurchase(key)}
                  disabled={purchasing !== null || !fingerprint}
                  className={`w-full py-2.5 text-sm font-semibold transition-colors ${
                    recommended
                      ? "studio-button-gold disabled:opacity-50"
                      : "border border-white/10 bg-white/[0.06] text-surface-200 hover:border-primary-300/40 hover:text-primary-100 disabled:opacity-50"
                  }`}
                >
                  {purchasing === key ? (
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  ) : (
                    t("plan.buyNow")
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="mt-4 text-center text-xs text-surface-500">
          {t("plan.footer")}
        </p>
      </div>
    </div>
  );
}
