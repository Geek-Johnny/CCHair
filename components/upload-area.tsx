"use client";

import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 10;

interface UploadAreaProps {
  onImageUpload: (base64: string) => void;
  onError?: (message: string) => void;
  currentImage: string | null;
  disabled: boolean;
}

export default function UploadArea({ onImageUpload, onError, currentImage, disabled }: UploadAreaProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        onError?.("仅支持 JPG、PNG、WebP 格式的图片");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        onError?.("图片过大，请压缩至 10MB 以内后重试");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64 = result.split(",")[1];
        onImageUpload(base64);
      };
      reader.readAsDataURL(file);
    },
    [onImageUpload, onError]
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
              alt="人像预览"
              className="mx-auto max-h-64 rounded-lg object-contain"
            />
            <p className="mt-2 text-center text-xs text-surface-500">点击重新上传</p>
          </div>
        ) : (
          <>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
              <Upload className="h-5 w-5 text-primary-500" />
            </div>
            <p className="text-sm font-medium text-surface-700">点击或拖拽上传人像照</p>
            <p className="mt-1 text-xs text-surface-400">支持 JPG/PNG/WebP</p>
          </>
        )}
      </div>
    </>
  );
}
