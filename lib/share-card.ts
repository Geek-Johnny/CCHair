import type { FaceAnalysis, GenerationResult } from "@/types";
import type { Lang } from "@/lib/i18n/config";
import zh from "@/locales/zh.json";
import en from "@/locales/en.json";

const W = 1080;
const H = 1920;
const PAD = 56;
const RADIUS = 18;

// Colors
const GOLD_LIGHT = "#f1d48a";
const GOLD_SOFT = "rgba(224,176,78,0.12)";
const SURFACE = "#0f0e0b";
const PANEL = "#171511";
const TEXT_MAIN = "#f7f0e4";
const TEXT_SECONDARY = "#c7bfae";
const TEXT_MUTED = "#928870";
const WHITE = "#ffffff";
const DIVIDER = "rgba(255,255,255,0.08)";

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
  ctx.strokeStyle = GOLD_LIGHT;
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
  bgGrad.addColorStop(0, "#11100d");
  bgGrad.addColorStop(0.45, "#0f0e0b");
  bgGrad.addColorStop(1, SURFACE);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(180, 160, 10, 180, 160, 420);
  glow.addColorStop(0, "rgba(224,176,78,0.18)");
  glow.addColorStop(1, "rgba(224,176,78,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // ── Header bar ──
  const headerH = 120;
  const headerGrad = ctx.createLinearGradient(0, 0, W, 0);
  headerGrad.addColorStop(0, "#15130f");
  headerGrad.addColorStop(1, "#0f0e0b");
  ctx.fillStyle = headerGrad;
  ctx.fillRect(0, 0, W, headerH);
  ctx.strokeStyle = "rgba(224,176,78,0.28)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, headerH - 1);
  ctx.lineTo(W, headerH - 1);
  ctx.stroke();

  // Header text
  ctx.fillStyle = GOLD_LIGHT;
  ctx.textBaseline = "middle";
  ctx.font = "bold 42px Didot, 'Bodoni 72', Georgia, 'Times New Roman', serif";
  ctx.fillText("HairMirra", PAD, headerH / 2);
  ctx.font = "28px -apple-system, 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif";
  ctx.fillStyle = "rgba(247,240,228,0.72)";
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
  ctx.fillStyle = "rgba(23,21,17,0.96)";
  ctx.fill();
  ctx.strokeStyle = "rgba(224,176,78,0.18)";
  ctx.lineWidth = 1;
  ctx.stroke();
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
    ctx.fillStyle = TEXT_MUTED;
    ctx.textBaseline = "middle";
    ctx.fillText(item.label, labelX, ty);

    ctx.font = "bold 26px -apple-system, 'Noto Sans SC', 'PingFang SC', sans-serif";
    ctx.fillStyle = TEXT_MAIN;
    ctx.fillText(item.value, valueX, ty);

    ty += 44;
  }

  // Recommended styles
  if (analysis.recommendedStyles && analysis.recommendedStyles.length > 0) {
    ty += 8;
    ctx.font = "22px -apple-system, 'Noto Sans SC', 'PingFang SC', sans-serif";
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText(t.recommended, labelX, ty);

    ctx.font = "bold 22px -apple-system, 'Noto Sans SC', 'PingFang SC', sans-serif";
    ctx.fillStyle = GOLD_LIGHT;
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
  ctx.fillStyle = GOLD_LIGHT;
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
    ctx.fillStyle = PANEL;
    ctx.fill();
    ctx.strokeStyle = "rgba(224,176,78,0.16)";
    ctx.lineWidth = 1;
    ctx.stroke();
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
      ctx.fillStyle = "#1b1914";
      ctx.fill();
    }

    // Label
    ctx.font = "bold 22px -apple-system, 'Noto Sans SC', 'PingFang SC', sans-serif";
    ctx.fillStyle = TEXT_MAIN;
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
  ctx.fillStyle = TEXT_SECONDARY;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(t.footer, W / 2, footerY + 10);
  ctx.textAlign = "left";

  // Convert to blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png", 1.0);
  });
}
