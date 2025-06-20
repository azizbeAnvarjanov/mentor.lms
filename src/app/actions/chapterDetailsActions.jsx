"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";

export function useChapterDetails(chapter_id) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [chapter, setChapter] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [status, setStatus] = useState(false);

  const [editName, setEditName] = useState(false);
  const [editDescription, setEditDescription] = useState(false);
  const [videosLength, setVideosLength] = useState(0);

  const changeStatusChapter = () => {
    if (chapter) {
      if (videosLength < 1) {
        setStatus(false);
      } else {
        setStatus(true);
      }
    }
  };

  useEffect(() => {
    const fetchChapter = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("chapters")
        .select("*, videos(*)")
        .eq("chapter_id", chapter_id)
        .maybeSingle();

      if (error || !data) {
        toast.error("Mavzu topilmadi");
        return;
      }

      setChapter(data);
      setName(data.name || "");
      setDescription(data.description || "");
      setVideoLink(data.video_link || "");
      setLoading(false);
    };
    fetchChapter();
  }, [chapter_id]);

  useEffect(() => {
    changeStatusChapter();
  }, [chapter, videosLength]);

  const handleSave = async () => {
    const { error } = await supabase
      .from("chapters")
      .update({
        name,
        description,
        video_link: videoLink,
        chapter_status: status,
      })
      .eq("chapter_id", chapter_id);

    if (error) {
      toast.error("Xatolik: " + error.message);
    } else {
      toast.success("Muvaffaqiyatli saqlandi!");
      setEditName(false);
      setEditDescription(false);
    }
  };

  return {
    loading,
    name,
    setName,
    description,
    setDescription,
    status,
    setStatus,
    setEditName,
    editName,
    editDescription,
    setEditDescription,
    videosLength,
    setVideosLength,
    handleSave,
    changeStatusChapter,
  };
}
