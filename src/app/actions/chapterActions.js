"use client";

import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";

export const handleDeleteVideo = async (chapter_id) => {
  const supabase = createClient();
  const { error } = await supabase.from("videos").delete().eq("id", chapter_id);

  if (error) {
    toast.error("O‘chirishda xatolik actions");
    
  } else {
    toast.success("Video o‘chirildi! actions");
  }
};
