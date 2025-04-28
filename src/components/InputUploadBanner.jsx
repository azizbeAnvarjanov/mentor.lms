"use client";

import { AlertCircleIcon, ImageUpIcon, XIcon, UploadIcon } from "lucide-react";
import { useState } from "react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { uploadBanner } from "@/app/actions/bannerActions";
import { Button } from "@/components/ui/button";

export default function InputUploadBanner({
  courseId,
  onBannerChange,
  bannerUrl,
}) {
  const maxSizeMB = 50;
  const maxSize = maxSizeMB * 1024 * 1024;
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/*",
    maxSize,
  });

  const previewUrl = files[0]?.preview || null;
  const file = files[0]?.file || null;

  const handleUpload = async () => {
    if (!file || uploading) return;

    await uploadBanner({
      file,
      courseId,
      setUploading,
      setProgress,
      setUrl: () => {}, // optional, not used here
      setImageLoading,
      onBannerChange,
    });

    // Fayl yuklangach, preview tozalanadi
    removeFile(files[0]?.id);
  };

  return (
    <div className="flex flex-col gap-2">
      {!bannerUrl && (
        <div className="relative">
          <div
            role="button"
            onClick={openFileDialog}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            data-dragging={isDragging || undefined}
            className=" hover:bg-gray-100 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border-2 bg-gray-100 cursor-pointer border-dashed border-gray-400 p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none has-[input:focus]:ring-[3px]"
          >
            <input
              {...getInputProps()}
              className="sr-only"
              aria-label="Upload file"
            />
            {previewUrl ? (
              <div className="absolute inset-0">
                <img
                  src={previewUrl}
                  alt={files[0]?.file?.name || "Uploaded image"}
                  className="size-full object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                <div
                  className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border-gray-400"
                  aria-hidden="true"
                >
                  <ImageUpIcon className="size-4 opacity-60" />
                </div>
                <p className="mb-1.5 text-sm font-medium">
                Tasviringizni shu yerga qo'ying yoki ko'rib chiqish uchun bosing
                </p>
                <p className="text-muted-foreground text-xs">
                Maksimal o'lcham: {maxSizeMB}MB
                </p>
              </div>
            )}
          </div>

          {previewUrl && (
            <div className="absolute top-4 right-4 z-20">
              <button
                type="button"
                className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/200 focus-visible:ring-[3px]"
                onClick={() => removeFile(files[0]?.id)}
                aria-label="Remove image"
              >
                <XIcon className="size-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}

      {errors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}

      {previewUrl && !uploading && (
        <Button
          onClick={handleUpload}
          className="self-center mt-2"
          disabled={!file}
        >
          <UploadIcon className="mr-2 size-4" /> Yuklash
        </Button>
      )}

      {uploading && (
        <div className="text-center text-sm text-muted-foreground mt-2">
          Yuklanmoqda... {progress}%
        </div>
      )}
    </div>
  );
}
