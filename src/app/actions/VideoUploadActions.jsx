"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { arrayMove } from "@dnd-kit/sortable";
export function useVideoUploadingDetails(chapter_id, setVideosLength) {
  const supabase = createClient();
  const [uploadType, setUploadType] = useState("link");
  const [videoLink, setVideoLink] = useState("");
  const [videoName, setVideoName] = useState("");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("view");
  const [showForm, setShowForm] = useState(false); // Formani ko‘rsatish uchun

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .eq("chapter_id", chapter_id)
      .order("order", { ascending: true });

    setVideosLength(data.length);
    if (!error) setVideos(data || []);
  };

  useEffect(() => {
    fetchVideos();
  }, [chapter_id]);

  const handleAddVideo = async () => {
    if (!videoLink.trim() || !videoName.trim()) {
      toast.error("Video nomi va linkini kiriting!");
      return;
    }

    setLoading(true);
    const { data: existing } = await supabase
      .from("videos")
      .select("order")
      .eq("chapter_id", chapter_id)
      .order("order", { ascending: false })
      .limit(1);

    const nextOrder = (existing?.[0]?.order || 0) + 1;

    const { error } = await supabase.from("videos").insert([
      {
        chapter_id,
        video_link: videoLink,
        name: videoName,
        order: nextOrder,
      },
    ]);

    if (error) {
      toast.error("Video saqlanmadi");
    } else {
      toast.success("Video qo‘shildi");
      setVideoLink("");
      setVideoName("");
      setShowForm(!showForm);
      fetchVideos();
    }

    setLoading(false);
  };

  const getEmbedLink = (link) => {
    const match = link.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : "";
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = videos.findIndex((v) => v.id === active.id);
    const newIndex = videos.findIndex((v) => v.id === over.id);
    const newOrder = arrayMove(videos, oldIndex, newIndex);

    setVideos(newOrder);

    await Promise.all(
      newOrder.map((video, index) =>
        supabase
          .from("videos")
          .update({ order: index + 1 })
          .eq("id", video.id)
      )
    );
  };

  const handleUpdateVideo = async (id, newName, newLink) => {
    const { error } = await supabase
      .from("videos")
      .update({ name: newName, video_link: newLink })
      .eq("id", id);

    if (error) toast.error("O'zgartirishda xatolik");
    else {
      toast.success("O'zgartirildi");
      fetchVideos();
    }
  };
  const handleDeleteVideo = async (video_id) => {
    const { error } = await supabase.from("videos").delete().eq("id", video_id);

    if (error) {
      toast.error("O‘chirishda xatolik");
    } else {
      toast.success("Video o‘chirildi!");
      fetchVideos();
      setVideosLength(videos.length);
    }
  };

  return {
    loading,
    uploadType,
    setUploadType,
    videoLink,
    setVideoLink,
    videoName,
    setVideoName,
    videos,
    tab,
    setTab,
    showForm,
    setShowForm,
    handleAddVideo,
    getEmbedLink,
    handleDragEnd,
    handleUpdateVideo,
    handleDeleteVideo,
  };
}
