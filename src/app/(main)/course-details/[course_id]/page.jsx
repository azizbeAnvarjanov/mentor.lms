"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BannerUpload from "@/components/BannerUpload";
import CoursePublishToggle from "@/components/CoursePublishToggle";
import { Pen, PencilLine } from "lucide-react";
import CreateChapterForm from "@/components/CreateChapterForm";
import BackButton from "@/components/BackButton";
import { useCourseDetails } from "@/app/actions/CourseDetailsActions";

export default function CourseDetailsPage() {
  const { course_id } = useParams();
  const [editing, setEditing] = useState(false);

  const {
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
  } = useCourseDetails(course_id);

  useEffect(() => {
    if (course_id) fetchCourse();
  }, [course_id, fetchCourse]);

  if (!course) {
    return <div className="p-6">Yuklanmoqda...</div>;
  }

  return (
    <div>
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
                    <Button
                      onClick={() => {
                        handleUpdate(), setEditing(false);
                      }}
                      disabled={loading}
                    >
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
                <div>
                  <h2 className="text-2xl font-semibold">{course.name}</h2>
                  <br />
                  <p className="text-muted-foreground">
                    {course.description || "Tavsif mavjud emas"}
                  </p>
                  <div className="flex absolute right-3 top-3">
                    <Button variant="outline" onClick={() => setEditing(true)}>
                      <Pen />
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
            onBannerChange={(url) => setBannerUrl(url)}
          />
        </div>
        <div className="w-[60%]">
          <CreateChapterForm course_id={course_id} />
        </div>
      </div>
    </div>
  );
}
