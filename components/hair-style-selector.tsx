"use client";

import { useState, useMemo } from "react";
import { Sparkles, Flame, Check, Palette, Dice5 } from "lucide-react";
import { HAIR_CATEGORIES, POPULAR_HAIRSTYLES, HAIR_COLORS } from "@/types";
import type { GenerateItem } from "@/types";
import { useTranslation } from "@/lib/i18n/hook";

interface HairStyleSelectorProps {
  onGenerate: (items: GenerateItem[]) => void;
  onRandomGenerate: () => void;
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
  onRandomGenerate,
  generating,
  disabled,
  gender,
  recommendedStyles,
}: HairStyleSelectorProps) {
  const { t } = useTranslation();
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

  const isMale = gender === "男" || gender === "男性";
  const genderKnown = gender !== undefined && gender !== null && gender !== "";
  const allColors = useMemo(() => [...HAIR_COLORS.male, ...HAIR_COLORS.female], []);
  const colorGroups = genderKnown
    ? [{
        key: isMale ? "male" : "female",
        label: isMale ? t("hairStyle.male") : t("hairStyle.female"),
        colors: HAIR_COLORS[isMale ? "male" : "female"],
      }]
    : [
        { key: "male", label: t("hairStyle.male"), colors: HAIR_COLORS.male },
        { key: "female", label: t("hairStyle.female"), colors: HAIR_COLORS.female },
      ];

  const filteredPopular = useMemo(
    () =>
      genderKnown
        ? POPULAR_HAIRSTYLES.filter((h) => isMale ? h.gender === "male" : h.gender === "female")
        : POPULAR_HAIRSTYLES,
    [isMale, genderKnown]
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

  const selectedColorPreset = allColors.find((c) => c.name === customHair.color.preset);

  const customParts = (() => {
    const display: string[] = [];
    const prompt: string[] = [];

    Object.entries(customHair).forEach(([key, c]) => {
      if (!c.preset && !c.custom) return;

      if (key === "color" && c.preset) {
        display.push(selectedColorPreset?.name || c.preset);
        prompt.push(`${selectedColorPreset?.name || c.preset} ${selectedColorPreset?.hex || ""}`.trim());
        return;
      }

      const v = c.preset || c.custom;
      display.push(v);
      prompt.push(v);
    });

    return { display, prompt };
  })();

  const handleConfirm = () => {
    const items: GenerateItem[] = [];

    selectedNames.forEach((name) => {
      items.push({ hairstyle: name, name, tags: [name] });
    });

    if (customParts.display.length > 0) {
      const displayName = customParts.display.join("+");
      const promptName = customParts.prompt.join("+");
      items.push({ hairstyle: promptName, name: displayName, tags: customParts.display });
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
    <div className="studio-panel overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-4">
        <Sparkles className="h-4 w-4 text-primary-200" />
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-200">{t("hairStyle.title")}</h3>
        <div className="ml-auto flex items-center gap-2">
          {totalCount > 0 && (
            <span className="text-xs text-surface-400">
              {t("hairStyle.selected", { count: totalCount })}
            </span>
          )}
          <button
            onClick={onRandomGenerate}
            disabled={generating}
            className={`flex items-center gap-1.5 border px-3 py-1.5 text-xs font-semibold transition-all ${
              generating
                ? "cursor-not-allowed border-white/10 bg-white/5 text-surface-500"
                : "border-primary-300/50 bg-primary-500/10 text-primary-100 hover:bg-primary-500/20"
            }`}
          >
            <Dice5 className="h-3.5 w-3.5" />
            {t("hairStyle.random")}
          </button>
        </div>
      </div>

      <div className="space-y-5 px-4 py-4">
        {/* ── AI 推荐 ── */}
        {showRec && (
          <section>
            <div className="mb-3 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary-300" />
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-primary-300">{t("hairStyle.aiRecommended")}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recommendedStyles!.map((style, i) => (
                <button
                  key={`rec-${i}`}
                  onClick={() => toggle(style)}
                  disabled={generating}
                  className={`border px-3 py-1.5 text-xs font-medium transition-all ${
                    isSelected(style)
                      ? "border-primary-300 bg-primary-300 text-surface-950 shadow-[0_0_18px_rgba(232,183,86,0.18)]"
                      : "border-primary-300/35 bg-primary-500/10 text-primary-100 hover:bg-primary-500/20"
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
            <div className="mb-3 flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-primary-300" />
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-primary-300">
                {t("hairStyle.popular")}
                {genderKnown && (
                  <> · {isMale ? t("hairStyle.male") : t("hairStyle.female")}</>
                )}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredPopular.map((h) => (
                <div key={h.id} className="group relative">
                  <button
                    onClick={() => toggle(h.name)}
                    disabled={generating}
                    className={`border px-3 py-1.5 text-xs font-medium transition-all ${
                      isSelected(h.name)
                        ? "border-surface-50 bg-surface-50 text-surface-950"
                        : "border-white/10 bg-white/[0.045] text-surface-200 hover:border-white/25 hover:bg-white/[0.08]"
                    } ${generating ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                  >
                    {h.name}
                  </button>
                  <div className="pointer-events-none absolute left-0 top-full z-10 mt-2 w-48 max-w-[calc(100vw-2rem)] border border-primary-300/25 bg-surface-950 px-3 py-2 text-xs text-surface-300 opacity-0 shadow-2xl transition-opacity group-hover:opacity-100">
                    <p className="max-h-10 overflow-hidden leading-5">{h.description}</p>
                    <div className="absolute left-4 bottom-full border-4 border-transparent border-b-surface-950" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 定制发型 ── */}
        <section>
          <div className="mb-3 flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-primary-300" />
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-primary-300">{t("hairStyle.custom")}</span>
          </div>
          <div className="space-y-3">
            {/* 长度 / 风格 / 类型 */}
            {HAIR_CATEGORIES.map((cat) => {
              const slot = customHair[cat.name === "按长度" ? "length" : cat.name === "按风格" ? "style" : "type"];
              const key = cat.name === "按长度" ? "length" : cat.name === "按风格" ? "style" : "type";
              return (
                <div key={cat.name}>
                  <p className="mb-2 text-[11px] text-surface-400">{t(`hairStyle.category.${key}`)}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {cat.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handlePreset(key, opt.name)}
                        disabled={generating}
                        className={`border px-2.5 py-1 text-xs font-medium transition-all ${
                          slot.preset === opt.name
                            ? "border-primary-300 bg-primary-300 text-surface-950"
                            : "border-white/10 bg-white/[0.035] text-surface-300 hover:border-primary-300/35 hover:text-primary-100"
                        } ${generating ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                      >
                        {opt.name}
                      </button>
                    ))}
                    <input
                      type="text"
                      placeholder={t("hairStyle.customPlaceholder")}
                      value={slot.custom}
                      onChange={(e) => handleCustomInput(key, e.target.value)}
                      disabled={!!slot.preset || generating}
                      className="ml-1 h-7 w-24 border border-white/10 bg-surface-950/60 px-2 text-xs text-surface-100 outline-none placeholder:text-surface-500 focus:border-primary-300 disabled:cursor-not-allowed disabled:bg-white/[0.03] disabled:text-surface-600"
                    />
                  </div>
                </div>
              );
            })}

            {/* 颜色 */}
            <div>
              <p className="mb-2 text-[11px] text-surface-400">
                {t("hairStyle.category.color")}
                {genderKnown && <> · {isMale ? t("hairStyle.male") : t("hairStyle.female")}</>}
              </p>
              <div className="space-y-4">
                {colorGroups.map((group) => (
                  <div key={group.key}>
                    {!genderKnown && (
                      <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-primary-300">{group.label}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {group.colors.map((c) => (
                        <div key={c.id} className="group relative">
                          <button
                            onClick={() => handlePreset("color", c.name)}
                            disabled={generating}
                            className={`inline-flex min-h-8 items-center gap-2 border px-2.5 py-1 text-xs font-medium transition-all ${
                              customHair.color.preset === c.name
                                ? "border-primary-300 bg-primary-300 text-surface-950"
                                : "border-white/10 bg-white/[0.035] text-surface-300 hover:border-primary-300/35 hover:text-primary-100"
                            } ${generating ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                          >
                            <span
                              className={`h-2.5 w-2.5 shrink-0 rounded-full border ${
                                customHair.color.preset === c.name ? "border-surface-950/20" : "border-white/15"
                              }`}
                              style={{ backgroundColor: c.hex }}
                            />
                            <span className="truncate">{c.name}</span>
                          </button>
                          <div className="pointer-events-none absolute left-0 top-full z-10 mt-2 w-48 max-w-[calc(100vw-2rem)] border border-primary-300/25 bg-surface-950 px-3 py-2 text-xs text-surface-300 opacity-0 shadow-2xl transition-opacity group-hover:opacity-100">
                            <p className="max-h-10 overflow-hidden leading-5">{c.description}</p>
                            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-primary-300">{c.hex}</p>
                            <div className="absolute left-4 bottom-full border-4 border-transparent border-b-surface-950" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <input
                  type="text"
                  placeholder={t("hairStyle.customPlaceholder")}
                  value={customHair.color.custom}
                  onChange={(e) => handleCustomInput("color", e.target.value)}
                  disabled={!!customHair.color.preset || generating}
                  className="h-9 w-full border border-white/10 bg-surface-950/60 px-3 text-xs text-surface-100 outline-none placeholder:text-surface-500 focus:border-primary-300 disabled:cursor-not-allowed disabled:bg-white/[0.03] disabled:text-surface-600"
                />
              </div>
            </div>

            {/* 定制组合预览 */}
            {customParts.display.length > 0 && (
              <div className="border border-primary-300/25 bg-primary-500/10 px-3 py-2">
                <p className="text-[11px] text-primary-300">{t("hairStyle.customCombination")}</p>
                <p className="mt-0.5 text-xs font-medium text-primary-100">
                  {customParts.display.join(" + ")}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 底部确认按钮 */}
      <div className="border-t border-white/10 bg-surface-950/85 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          {totalCount > 0 && (
            <span className="text-xs text-surface-400">
              {t("hairStyle.selectedCount", { count: totalCount })}
            </span>
          )}
          <button
            onClick={handleConfirm}
            disabled={totalCount === 0 || generating}
            className={`ml-auto flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-all ${
              totalCount > 0 && !generating
                ? "studio-button-gold"
                : "cursor-not-allowed border border-white/10 bg-white/5 text-surface-500"
            }`}
          >
            <Check className="h-3.5 w-3.5" />
            {t("hairStyle.generate")}
            {totalCount > 0 && ` (${totalCount})`}
          </button>
        </div>
      </div>
    </div>
  );
}
