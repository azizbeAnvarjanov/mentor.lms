"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

export function useCourseDetails(course_id) {
  const supabase = createClient();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bannerUrl, setBannerUrl] = useState(null);

  const fetchCourse = useCallback(async () => {
    const { data, error } = await supabase
      .from("courses_duplicate")
      .select("*")
      .eq("course_id", course_id)
      .single();

    if (error) {
      alert("Kurs topilmadi");
    } else {
      setCourse(data);
      setName(data.name || "");
      setDescription(data.description || "");
      setBannerUrl(data.banner_url || "");
      setIsPublished(data.status || false);
    }
  }, [course_id, supabase]);

  const handleUpdate = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("courses_duplicate")
      .update({ name, description })
      .eq("course_id", course_id);

    setLoading(false);

    if (error) {
      alert("Yangilashda xatolik: " + error.message);
    } else {
      await fetchCourse();
    }
  };

  return {
    course,
    name,
    description,
    bannerUrl,
    isPublished,
    loading,
    setName,
    setDescription,
    setBannerUrl,
    fetchCourse,
    handleUpdate,
  };
}
