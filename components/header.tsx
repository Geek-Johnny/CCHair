"use client";

import { Sparkles, History } from "lucide-react";

interface HeaderProps {
  onHistoryClick?: () => void;
}

export default function Header({ onHistoryClick }: HeaderProps) {
  return (
    <header className="border-b border-surface-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
        <Sparkles className="h-5 w-5 text-primary-500" />
        <span className="text-lg font-semibold text-surface-900">
          CCHair
        </span>
        <span className="text-sm text-surface-500">AI 发型设计参考</span>
        <div className="ml-auto">
          <button
            onClick={onHistoryClick}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700"
          >
            <History className="h-3.5 w-3.5" />
            历史记录
          </button>
        </div>
      </div>
    </header>
  );
}
