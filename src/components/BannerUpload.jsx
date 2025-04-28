"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

import { uploadBanner, deleteBanner } from "@/app/actions/bannerActions";
import { Card, CardContent } from "./ui/card";
import { Trash } from "lucide-react";
import InputUploadBanner from "./InputUploadBanner";

export default function BannerUpload({ courseId, bannerUrl, onBannerChange }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (bannerUrl && bannerUrl !== "") {
      setUrl(bannerUrl);
      setImageLoading(true);
    }
  }, [bannerUrl]);

  const handleDelete = async () => {
    await deleteBanner({
      url,
      courseId,
      setUploading,
      setUrl,
      setProgress,
      setImageLoading,
      onBannerChange,
    });
  };

  return (
    <div className="p-3 border mt-4 rounded-md">
      <Label className="block text-lg font-medium mb-3">
        Kurs banner rasmi
      </Label>
      {url && (
        <div className="relative h-80 rounded-md overflow-hidden group">
          {imageLoading && (
            <Skeleton className="absolute top-0 left-0 w-full h-full z-0" />
          )}
          <Image
            src={url}
            alt="Banner"
            fill
            className="object-contain z-10"
            onLoad={() => setImageLoading(false)}
          />

          {/* Hover qilinganda chiqadigan overlay */}
          {!uploading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="z-30"
              >
                <Trash />
              </Button>
            </div>
          )}
        </div>
      )}

      {uploading && (
        <div>
          <Progress value={progress} />
          <div className="text-sm text-muted-foreground mt-1">{progress}%</div>
        </div>
      )}

      <InputUploadBanner
        courseId={courseId}
        onBannerChange={onBannerChange}
        bannerUrl={bannerUrl}
      />
    </div>
  );
}
