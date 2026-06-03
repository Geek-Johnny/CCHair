import type { FaceAnalysis, GenerationResult } from "@/types";
import type { Lang } from "@/lib/i18n/config";
import zh from "@/locales/zh.json";
import en from "@/locales/en.json";

const W = 1080;
const H = 1920;
const PAD = 60;
const RADIUS = 20;

// Colors
const PRIMARY = "#5c3aff";
const PRIMARY_LIGHT = "#ede9fe";
const SURFACE = "#f8f9fa";
const TEXT_DARK = "#1a1a2e";
const TEXT_MID = "#4a4a6a";
const TEXT_LIGHT = "#8888a0";
const WHITE = "#ffffff";
const DIVIDER = "#e8e8f0";

const translations = { zh, en };

interface ShareCardOptions {
  originalImage: string;
  analysis: FaceAnalysis;
  results: GenerationResult[];
  lang?: Lang;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function toImageSrc(data: string): string {
  return data.startsWith("data:") ? data : `data:image/png;base64,${data}`;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawCircleImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  radius: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  // Cover fit
  const ratio = Math.max((radius * 2) / img.width, (radius * 2) / img.height);
  const sw = img.width * ratio;
  const sh = img.height * ratio;
  ctx.drawImage(img, cx - sw / 2, cy - sh / 2, sw, sh);
  ctx.restore();

  // Border
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const chars = text.split("");
  let line = "";
  let currentY = y;

  for (const char of chars) {
    const testLine = line + char;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, currentY);
      line = char;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
  return currentY + lineHeight;
}

export async function generateShareCard(
  options: ShareCardOptions
): Promise<Blob> {
  const { originalImage, analysis, results, lang = "zh" } = options;
  const t = translations[lang].shareCard;
  const displayResults = results.slice(0, 6);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // ── Background ──
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, "#f5f3ff");
  bgGrad.addColorStop(0.3, WHITE);
  bgGrad.addColorStop(1, SURFACE);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Header bar ──
  const headerH = 120;
  const headerGrad = ctx.createLinearGradient(0, 0, W, 0);
  headerGrad.addColorStop(0, PRIMARY);
  headerGrad.addColorStop(1, "#7c5cfc");
  ctx.fillStyle = headerGrad;
  ctx.fillRect(0, 0, W, headerH);

  // Header text
  ctx.fillStyle = WHITE;
  ctx.textBaseline = "middle";
  ctx.font = "bold 42px -apple-system, 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif";
  ctx.fillText("✦  CCHair", PAD, headerH / 2);
  ctx.font = "28px -apple-system, 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillText(t.subtitle, PAD + 240, headerH / 2);

  let y = headerH + 50;

  // ── Portrait + Analysis section ──
  const portraitSize = 260;
  const portraitCx = PAD + portraitSize / 2;
  const portraitCy = y + portraitSize / 2 + 20;

  // Load and draw original image
  try {
    const portraitImg = await loadImage(toImageSrc(originalImage));
    drawCircleImage(ctx, portraitImg, portraitCx, portraitCy, portraitSize / 2);
  } catch {
    // Fallback: gray circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(portraitCx, portraitCy, portraitSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = "#e0e0e0";
    ctx.fill();
    ctx.restore();
  }

  // Analysis info card
  const cardX = PAD + portraitSize + 40;
  const cardW = W - cardX - PAD;
  const cardH = portraitSize + 40;
  const cardY = y;

  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, RADIUS);
  ctx.fillStyle = WHITE;
  ctx.fill();
  ctx.shadowColor = "rgba(0,0,0,0.06)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 4;
  ctx.fill();
  ctx.restore();

  // Analysis content
  let ty = cardY + 36;
  const labelX = cardX + 24;
  const valueX = cardX + 130;

  const infoItems = [
    { label: t.faceShape, value: analysis.faceShape },
    { label: t.skinTone, value: analysis.skinTone },
    { label: t.gender, value: analysis.gender },
    { label: t.ageRange, value: analysis.ageRange },
  ];

  for (const item of infoItems) {
    ctx.font = "24px -apple-system, 'Noto Sans SC', 'PingFang SC', sans-serif";
    ctx.fillStyle = TEXT_LIGHT;
    ctx.textBaseline = "middle";
    ctx.fillText(item.label, labelX, ty);

    ctx.font = "bold 26px -apple-system, 'Noto Sans SC', 'PingFang SC', sans-serif";
    ctx.fillStyle = TEXT_DARK;
    ctx.fillText(item.value, valueX, ty);

    ty += 44;
  }

  // Recommended styles
  if (analysis.recommendedStyles && analysis.recommendedStyles.length > 0) {
    ty += 8;
    ctx.font = "22px -apple-system, 'Noto Sans SC', 'PingFang SC', sans-serif";
    ctx.fillStyle = TEXT_LIGHT;
    ctx.fillText(t.recommended, labelX, ty);

    ctx.font = "bold 22px -apple-system, 'Noto Sans SC', 'PingFang SC', sans-serif";
    ctx.fillStyle = PRIMARY;
    const recText = analysis.recommendedStyles.slice(0, 3).join(" · ");
    ty = wrapText(ctx, recText, valueX, ty, cardW - 140, 32);
  }

  y += portraitSize + 80;

  // ── Divider ──
  ctx.strokeStyle = DIVIDER;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(W - PAD, y);
  ctx.stroke();
  y += 40;

  // ── Results section title ──
  ctx.fillStyle = TEXT_DARK;
  ctx.font = "bold 34px -apple-system, 'Noto Sans SC', 'PingFang SC', sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(`✦  ${t.sectionTitle}`, PAD, y);
  y += 60;

  // ── Results grid (3×2) ──
  const cols = 3;
  const gap = 20;
  const cellW = (W - PAD * 2 - gap * (cols - 1)) / cols;
  const cellH = cellW + 50; // image + label

  for (let i = 0; i < displayResults.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = PAD + col * (cellW + gap);
    const cy = y + row * (cellH + gap);

    // Card background
    ctx.save();
    drawRoundedRect(ctx, cx, cy, cellW, cellH, 16);
    ctx.fillStyle = WHITE;
    ctx.fill();
    ctx.shadowColor = "rgba(0,0,0,0.05)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 2;
    ctx.fill();
    ctx.restore();

    // Result image
    try {
      const resultImg = await loadImage(toImageSrc(displayResults[i].imageData));
      const imgPad = 10;
      const imgSize = cellW - imgPad * 2;
      drawRoundedRect(ctx, cx + imgPad, cy + imgPad, imgSize, imgSize, 12);
      ctx.save();
      ctx.clip();
      // Cover fit
      const ratio = Math.max(imgSize / resultImg.width, imgSize / resultImg.height);
      const sw = resultImg.width * ratio;
      const sh = resultImg.height * ratio;
      ctx.drawImage(
        resultImg,
        cx + imgPad + (imgSize - sw) / 2,
        cy + imgPad + (imgSize - sh) / 2,
        sw,
        sh
      );
      ctx.restore();
    } catch {
      drawRoundedRect(ctx, cx + 10, cy + 10, cellW - 20, cellW - 20, 12);
      ctx.fillStyle = "#f0f0f0";
      ctx.fill();
    }

    // Label
    ctx.font = "bold 22px -apple-system, 'Noto Sans SC', 'PingFang SC', sans-serif";
    ctx.fillStyle = TEXT_DARK;
    ctx.textBaseline = "top";
    const name = displayResults[i].hairstyleName;
    const nameMaxW = cellW - 16;
    const nameMetrics = ctx.measureText(name);
    const displayName = nameMetrics.width > nameMaxW ? name.slice(0, 6) + "…" : name;
    ctx.fillText(displayName, cx + 8, cy + cellW + 8);
  }

  y += Math.ceil(displayResults.length / cols) * (cellH + gap) + 20;

  // ── Footer ──
  const footerY = H - 80;
  ctx.strokeStyle = DIVIDER;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, footerY - 30);
  ctx.lineTo(W - PAD, footerY - 30);
  ctx.stroke();

  ctx.font = "24px -apple-system, 'Noto Sans SC', 'PingFang SC', sans-serif";
  ctx.fillStyle = TEXT_LIGHT;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(t.footer, W / 2, footerY + 10);
  ctx.textAlign = "left";

  // Convert to blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png", 1.0);
  });
}
