"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/utils/supabase/client";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export default function SecureVideoPlayer({ videoId }) {
  const [videoUrl, setVideoUrl] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      setVideoUrl(`/api/video?id=${videoId}`);
    };
    load();
  }, [videoId]);

  if (!videoUrl) return <p>Yuklanmoqda...</p>;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <video controls width="100%">
        <source src={videoUrl} type="video/mp4" />
        Sizning brauzeringiz video formatni qo‘llab-quvvatlamaydi.
      </video>
    </div>
  );
}
