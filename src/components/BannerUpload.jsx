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
    <Card className=" mt-6">
      <CardContent>
        <Label className="block text-lg font-medium">Kurs banner rasmi</Label>
        <br />
        {url && (
          <div className="relative h-80 rounded-md overflow-hidden border group">
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
            <div className="text-sm text-muted-foreground mt-1">
              {progress}%
            </div>
          </div>
        )}

        {/* {!url && !uploading && (
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
        )} */}

        <InputUploadBanner
          courseId={courseId}
          onBannerChange={onBannerChange}
          bannerUrl={bannerUrl}
        />
      </CardContent>
    </Card>
  );
}
