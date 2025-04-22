"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { Card, CardContent } from "./ui/card";

export default function CoursePublishToggle({
  courseId,
  isPublished,
  bannerUrl,
}) {
  const supabase = createClient();
  const [status, setStatus] = useState(
    isPublished ? "published" : "unpublished"
  );

  useEffect(() => {
    if (bannerUrl === null) {
      handleStatusChange("unpublished");
    }
  }, [bannerUrl]);

  const handleStatusChange = async (value) => {
    if (value === "published") {
      // 1. Tekshir: banner borligiga
      if (!bannerUrl) {
        toast.error("Banner mavjud emas. Avval banner yuklang!");
        return;
      }

      // 2. Tekshir: kamida bitta published chapter borligiga
      const { data: chapters, error: chapterError } = await supabase
        .from("chapters")
        .select("*")
        .eq("course_id", courseId)
        .eq("chapter_status", true);

      if (chapterError) {
        toast.error("Chapterlarni tekshirishda xatolik: " + chapterError.message);
        return;
      }

      if (!chapters || chapters.length === 0) {
        toast.error(
          "Hech bo‘lmasa bitta 'Published' holatidagi mavzu (chapter) mavjud emas!"
        );
        return;
      }

      toast.success("Kursni nashr qilish uchun barcha shartlar bajarildi.");
    }

    // 3. Statusni yangilash
    const { error } = await supabase
      .from("courses_duplicate")
      .update({ status: value === "published" })
      .eq("course_id", courseId);

    if (error) {
      toast.error("Status yangilashda xatolik: " + error.message);
    } else {
      setStatus(value);
      toast.success("Status muvaffaqiyatli yangilandi.");
    }
  };

  return (
    <Card>
      <CardContent>
        <label className="block mb-2 text-sm font-medium">Kurs holati</label>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Statusni tanlang" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="published">
              <div className="w-[10px] h-[10px] bg-green-400 rounded-full"></div>
              Nashr etilgan
            </SelectItem>
            <SelectItem value="unpublished">
              <div className="w-[10px] h-[10px] bg-red-400 rounded-full"></div>
              Nashr etilmagan
            </SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
