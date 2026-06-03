"use client";

import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useTranslation } from "@/lib/i18n/hook";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 10;
const MAX_BASE64_SIZE = 3.5 * 1024 * 1024; // 3.5MB base64 limit (Vercel serverless ~4.5MB)

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      // Scale down if too large (max 2048px on longest side)
      const maxDim = 2048;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height / width) * maxDim);
          width = maxDim;
        } else {
          width = Math.round((width / height) * maxDim);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      // Try JPEG first, fallback to lower quality
      let quality = 0.85;
      let base64 = canvas.toDataURL("image/jpeg", quality).split(",")[1];

      // Reduce quality if still too large
      while (base64.length > MAX_BASE64_SIZE && quality > 0.3) {
        quality -= 0.15;
        base64 = canvas.toDataURL("image/jpeg", quality).split(",")[1];
      }

      resolve(base64);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

interface UploadAreaProps {
  onImageUpload: (base64: string) => void;
  onError?: (message: string) => void;
  currentImage: string | null;
  disabled: boolean;
}

export default function UploadArea({ onImageUpload, onError, currentImage, disabled }: UploadAreaProps) {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        onError?.(t("upload.errorType"));
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        onError?.(t("upload.errorSize"));
        return;
      }
      try {
        const base64 = await compressImage(file);
        onImageUpload(base64);
      } catch {
        onError?.(t("upload.errorProcess"));
      }
    },
    [onImageUpload, onError, t]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
      />
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors
          ${dragging ? "border-primary-400 bg-primary-50" : "border-surface-300 bg-white hover:border-surface-400"}
          ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        {currentImage ? (
          <div className="relative w-full">
            <img
              src={`data:image/jpeg;base64,${currentImage}`}
              alt={t("upload.previewAlt")}
              className="mx-auto max-h-64 rounded-lg object-contain"
            />
            <p className="mt-2 text-center text-xs text-surface-500">{t("upload.reupload")}</p>
          </div>
        ) : (
          <>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
              <Upload className="h-5 w-5 text-primary-500" />
            </div>
            <p className="text-sm font-medium text-surface-700">{t("upload.dropzone")}</p>
            <p className="mt-1 text-xs text-surface-400">{t("upload.formats")}</p>
          </>
        )}
      </div>
    </>
  );
}
