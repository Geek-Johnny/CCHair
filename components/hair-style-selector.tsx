"use client";

import { useState, useMemo } from "react";
import { Sparkles, Flame, Check, Palette } from "lucide-react";
import { HAIR_CATEGORIES, POPULAR_HAIRSTYLES, HAIR_COLORS } from "@/types";
import type { GenerateItem } from "@/types";

interface HairStyleSelectorProps {
  onGenerate: (items: GenerateItem[]) => void;
  generating: boolean;
  disabled: boolean;
  gender?: string;
  recommendedStyles?: string[];
}

interface CustomSlot {
  preset: string;
  custom: string;
}

const EMPTY_CUSTOM: Record<string, CustomSlot> = {
  length: { preset: "", custom: "" },
  style: { preset: "", custom: "" },
  type: { preset: "", custom: "" },
  color: { preset: "", custom: "" },
};

export default function HairStyleSelector({
  onGenerate,
  generating,
  disabled,
  gender,
  recommendedStyles,
}: HairStyleSelectorProps) {
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
  const [customHair, setCustomHair] = useState<Record<string, CustomSlot>>(EMPTY_CUSTOM);

  const toggle = (name: string) => {
    setSelectedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const isSelected = (name: string) => selectedNames.has(name);

  const filteredPopular = useMemo(
    () =>
      POPULAR_HAIRSTYLES.filter(
        (h) => gender === "男" || gender === "男性" ? h.gender === "male" : h.gender === "female"
      ),
    [gender]
  );

  const handlePreset = (cat: string, name: string) => {
    setCustomHair((prev) => {
      if (prev[cat].preset === name) {
        // Clicking the same preset again deselects it
        return { ...prev, [cat]: { preset: "", custom: "" } };
      }
      return { ...prev, [cat]: { preset: name, custom: "" } };
    });
  };

  const handleCustomInput = (cat: string, value: string) => {
    setCustomHair((prev) => ({ ...prev, [cat]: { preset: "", custom: value } }));
  };

  const hasCustom = Object.values(customHair).some(
    (c) => c.preset || c.custom
  );

  const customParts = (() => {
    const parts: string[] = [];
    Object.values(customHair).forEach((c) => {
      const v = c.preset || c.custom;
      if (v) parts.push(v);
    });
    return parts;
  })();

  const handleConfirm = () => {
    const items: GenerateItem[] = [];

    selectedNames.forEach((name) => {
      items.push({ hairstyle: name, name, tags: [name] });
    });

    if (customParts.length > 0) {
      const combined = customParts.join("+");
      items.push({ hairstyle: combined, name: combined, tags: customParts });
    }

    if (items.length === 0) return;

    onGenerate(items);

    // Auto-deselect after generation
    setSelectedNames(new Set());
    setCustomHair(EMPTY_CUSTOM);
  };

  const totalCount = selectedNames.size + (hasCustom ? 1 : 0);
  const showRec = recommendedStyles && recommendedStyles.length > 0;
  const showPopular = filteredPopular.length > 0;

  if (disabled) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4">
        <Sparkles className="h-4 w-4 text-purple-500" />
        <h3 className="text-sm font-semibold text-gray-700">选择发型</h3>
        {totalCount > 0 && (
          <span className="ml-auto text-xs text-gray-400">
            已选 {totalCount} 款
          </span>
        )}
      </div>

      <div className="space-y-4 px-4 pb-4 pt-3">
        {/* ── AI 推荐 ── */}
        {showRec && (
          <section>
            <div className="mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-medium text-amber-600">AI 推荐发型</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recommendedStyles!.map((style, i) => (
                <button
                  key={`rec-${i}`}
                  onClick={() => toggle(style)}
                  disabled={generating}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    isSelected(style)
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                  } ${generating ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── 热门发型 ── */}
        {showPopular && (
          <section>
            <div className="mb-2 flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-xs font-medium text-orange-600">
                热门发型 ·{" "}
                {gender === "男" || gender === "男性" ? "男生" : "女生"}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {filteredPopular.map((h) => (
                <div key={h.id} className="group relative">
                  <button
                    onClick={() => toggle(h.name)}
                    disabled={generating}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      isSelected(h.name)
                        ? "bg-gray-900 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } ${generating ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                  >
                    {h.name}
                  </button>
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    <p className="leading-relaxed">{h.description}</p>
                    <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-white" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 定制发型 ── */}
        <section>
          <div className="mb-2 flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs font-medium text-blue-600">定制发型</span>
          </div>
          <div className="space-y-3">
            {/* 长度 / 风格 / 类型 */}
            {HAIR_CATEGORIES.map((cat) => {
              const slot = customHair[cat.name === "按长度" ? "length" : cat.name === "按风格" ? "style" : "type"];
              const key = cat.name === "按长度" ? "length" : cat.name === "按风格" ? "style" : "type";
              return (
                <div key={cat.name}>
                  <p className="mb-1 text-[11px] text-gray-400">{cat.name}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {cat.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handlePreset(key, opt.name)}
                        disabled={generating}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                          slot.preset === opt.name
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                        } ${generating ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                      >
                        {opt.name}
                      </button>
                    ))}
                    <input
                      type="text"
                      placeholder="自行输入…"
                      value={slot.custom}
                      onChange={(e) => handleCustomInput(key, e.target.value)}
                      disabled={!!slot.preset || generating}
                      className="ml-1 h-7 w-24 rounded-md border border-gray-200 px-2 text-xs text-gray-600 outline-none placeholder:text-gray-300 focus:border-blue-400 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-300"
                    />
                  </div>
                </div>
              );
            })}

            {/* 颜色 */}
            <div>
              <p className="mb-1 text-[11px] text-gray-400">按颜色</p>
              <div className="flex flex-wrap items-center gap-1.5">
                {HAIR_COLORS.map((c) => (
                  <div key={c.id} className="group relative">
                    <button
                      onClick={() => handlePreset("color", c.name)}
                      disabled={generating}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                        customHair.color.preset === c.name
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                      } ${generating ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                    >
                      {c.name}
                    </button>
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      <p className="leading-relaxed">{c.description}</p>
                      <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-white" />
                    </div>
                  </div>
                ))}
                <input
                  type="text"
                  placeholder="自行输入…"
                  value={customHair.color.custom}
                  onChange={(e) => handleCustomInput("color", e.target.value)}
                  disabled={!!customHair.color.preset || generating}
                  className="ml-1 h-7 w-24 rounded-md border border-gray-200 px-2 text-xs text-gray-600 outline-none placeholder:text-gray-300 focus:border-blue-400 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-300"
                />
              </div>
            </div>

            {/* 定制组合预览 */}
            {customParts.length > 0 && (
              <div className="rounded-md bg-blue-50/50 px-3 py-2">
                <p className="text-[11px] text-blue-500">定制组合</p>
                <p className="mt-0.5 text-xs font-medium text-blue-700">
                  {customParts.join(" + ")}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 底部确认按钮 */}
      <div className="sticky bottom-0 border-t border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          {totalCount > 0 && (
            <span className="text-xs text-gray-400">
              已选{" "}
              <span className="font-semibold text-gray-700">{totalCount}</span>{" "}
              款发型
            </span>
          )}
          <button
            onClick={handleConfirm}
            disabled={totalCount === 0 || generating}
            className={`ml-auto flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              totalCount > 0 && !generating
                ? "bg-gray-900 text-white shadow-sm hover:bg-gray-800"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Check className="h-3.5 w-3.5" />
            生成选中发型
            {totalCount > 0 && ` (${totalCount})`}
          </button>
        </div>
      </div>
    </div>
  );
}
