"use client";

import { useCallback, useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";

interface UploadAreaProps {
  onImageUpload: (base64: string) => void;
  currentImage: string | null;
  disabled: boolean;
}

export default function UploadArea({ onImageUpload, currentImage, disabled }: UploadAreaProps) {
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64 = result.split(",")[1];
        onImageUpload(base64);
      };
      reader.readAsDataURL(file);
    },
    [onImageUpload]
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

  const handleClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFile(file);
    };
    input.click();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onClick={disabled ? undefined : handleClick}
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
  );
}
