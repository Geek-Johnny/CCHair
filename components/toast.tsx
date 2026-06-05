"use client";

import { useState, useCallback, useEffect } from "react";
import { X, AlertCircle, CheckCircle, Info } from "lucide-react";

export interface Toast {
  id: string;
  type: "error" | "success" | "info";
  message: string;
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ICONS = {
  error: AlertCircle,
  success: CheckCircle,
  info: Info,
} as const;

const STYLES = {
  error: "border-red-400/30 bg-red-500/15 text-red-100",
  success: "border-emerald-300/30 bg-emerald-500/15 text-emerald-100",
  info: "border-primary-300/30 bg-primary-500/15 text-primary-100",
} as const;

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const Icon = ICONS[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div
      className={`flex items-center gap-2 border px-3 py-2.5 text-sm shadow-2xl backdrop-blur-xl ${STYLES[toast.type]}`}
      style={{ animation: "fadeInUp 0.2s ease-out" }}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 p-0.5 opacity-60 hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function useToastManager() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    toasts,
    removeToast,
    addError: useCallback((msg: string) => addToast("error", msg), [addToast]),
    addSuccess: useCallback((msg: string) => addToast("success", msg), [addToast]),
    addInfo: useCallback((msg: string) => addToast("info", msg), [addToast]),
  };
}

export default function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-16 z-[100] flex w-80 flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
