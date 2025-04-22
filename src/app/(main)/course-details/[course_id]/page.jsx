"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BannerUpload from "@/components/BannerUpload";
import CoursePublishToggle from "@/components/CoursePublishToggle";
import InputUploadBanner from "@/components/InputUploadBanner";
import { PencilLine } from "lucide-react";
import CreateChapterForm from "@/components/CreateChapterForm";
import BackButton from "@/components/BackButton";

export default function CourseDetailsPage() {
  const { course_id } = useParams();
  const supabase = createClient();

  const [course, setCourse] = useState(null);
  const [editing, setEditing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bannerUrl, setBannerUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCourse = async () => {
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
      setIsPublished(data.status || "");
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("courses_duplicate")
      .update({ name, description })
      .eq("course_id", course_id);

    setLoading(false);

    if (error) {
      alert("Yangilashda xatolik: " + error.message);
    } else {
      setEditing(false);
      fetchCourse();
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [course_id]);

  if (!course) {
    return <div className="p-6">Yuklanmoqda...</div>;
  }

  return (
    <div >
      <BackButton />
      <div className="mx-auto gap-4 flex relative mt-3">
        <div className="w-[40%]">
          <Card className="relative">
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Kurs nomi"
                  />
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Kurs tavsifi"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleUpdate} disabled={loading}>
                      {loading ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditing(false);
                        setName(course.name);
                        setDescription(course.description || "");
                      }}
                    >
                      Bekor qilish
                    </Button>
                  </div>
                </>
              ) : (
                <div className="">
                  <h2 className="text-2xl font-semibold">{course.name}</h2>
                  <br />
                  <p className="text-muted-foreground">
                    {course.description || "Tavsif mavjud emas"}
                  </p>
                  <div className="flex absolute right-3 top-3">
                    <Button onClick={() => setEditing(true)}>
                      <PencilLine />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <br />
          <CoursePublishToggle
            courseId={course_id}
            isPublished={isPublished}
            bannerUrl={bannerUrl}
          />
          <BannerUpload
            courseId={course_id}
            bannerUrl={bannerUrl}
            onBannerChange={(url) => setBannerUrl(url)} // 🔄 banner o‘zgarsa yangilash
          />
        </div>
        <div className="w-[60%]">
          <CreateChapterForm course_id={course_id} />
        </div>
      </div>
    </div>
  );
}
