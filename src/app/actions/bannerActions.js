"use client";

import { createClient } from "@/utils/supabase/client";

export const uploadBanner = async ({
  file,
  courseId,
  setUploading,
  setProgress,
  setUrl,
  setImageLoading,
  onBannerChange,
}) => {
  const supabase = createClient();

  if (!file || !courseId) return;

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${courseId}/${fileName}`;

  setUploading(true);
  setProgress(0);

  const { error } = await supabase.storage
    .from("bannerlar")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    alert("Yuklashda xatolik: " + error.message);
    setUploading(false);
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from("bannerlar")
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData?.publicUrl;
  if (!publicUrl) {
    alert("URL olinmadi");
    setUploading(false);
    return;
  }

  const { error: updateError } = await supabase
    .from("courses_duplicate")
    .update({ banner_url: publicUrl })
    .eq("course_id", courseId);

  if (updateError) {
    alert("Baza yangilashda xatolik: " + updateError.message);
    setUploading(false);
    return;
  }

  // Fake progress simulyatsiyasi
  let tempProgress = 0;
  const interval = setInterval(() => {
    tempProgress += 10;
    setProgress(tempProgress);
    if (tempProgress >= 100) {
      clearInterval(interval);
      setUploading(false);
      setUrl(publicUrl);
      setImageLoading(true);
    }
  }, 50);

  onBannerChange?.(publicUrl);
};

export const deleteBanner = async ({
  url,
  courseId,
  setUploading,
  setUrl,
  setProgress,
  setImageLoading,
  onBannerChange,
}) => {
  const supabase = createClient();

  if (!url || !courseId) return;

  const pathParts = url.split("/").slice(-2);
  const filePath = pathParts.join("/");

  setUploading(true);

  const { error: deleteError } = await supabase.storage
    .from("bannerlar")
    .remove([filePath]);

  if (deleteError) {
    alert("Rasmni o'chirishda xatolik: " + deleteError.message);
    setUploading(false);
    return;
  }

  const { error: updateError } = await supabase
    .from("courses_duplicate")
    .update({ banner_url: null })
    .eq("course_id", courseId);

  if (updateError) {
    alert("Baza yangilashda xatolik: " + updateError.message);
    setUploading(false);
    return;
  }

  setUrl(null);
  setProgress(0);
  setUploading(false);
  setImageLoading(false);
  onBannerChange?.(null);
};
