"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { Pen, Save } from "lucide-react";
import BackButton from "@/components/BackButton";

import VideoUpload from "@/components/VideoUpload";
import { useChapterDetails } from "@/app/actions/chapterDetailsActions";
import UploadPPTDialog from "@/components/UploadPPTDialog";
import TabsFiles from "@/components/TabsFiles";

export default function ChapterEdit() {
  const { chapter_id } = useParams();

  const {
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
  } = useChapterDetails(chapter_id);

  if (loading) return <p>Yuklanmoqda...</p>;

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <BackButton />
            <h2 className="text-xl font-semibold">Mavzuni tahrirlash</h2>
          </div>
        </div>
        <Button onClick={handleSave} variant={"outline"}>
          Barchasini saqlash <Save />
        </Button>
      </div>
      <div className="flex items-start gap-4 mt-3">
        <div className="w-[50%]">
          <div className=" mx-auto">
            {/* Name */}
            <div>
              {editName ? (
                <div className="border p-3 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-sm font-medium">Mavzu nomi</h1>
                    <Button size={"sm"} onClick={() => setEditName(false)}>
                      Saqlash
                    </Button>
                  </div>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              ) : (
                <div className="border p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <h1 className="text-sm font-medium">Mavzu nomi</h1>

                    <Button variant="outline" onClick={() => setEditName(true)}>
                      <Pen />
                    </Button>
                  </div>
                  <p onDoubleClick={() => setEditName(true)}>
                    {name || "Nomi yo'q"}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              {editDescription ? (
                <div className="mt-4 border  p-3 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="font-medium">Mavzu tavsifi</h1>
                    <Button size="sm" onClick={() => setEditDescription(false)}>
                      Saqlash
                    </Button>
                  </div>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              ) : (
                <div className="mt-4 border  p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <h1 className="font-medium">Chapter tavsifi</h1>
                    <Button
                      variant="outline"
                      onClick={() => setEditDescription(true)}
                    >
                      <Pen />
                    </Button>
                  </div>
                  <div className="mt-2">
                    <p
                      onDoubleClick={() => setEditDescription(true)}
                      className=""
                    >
                      {description || "Tavsif yo'q"}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <TabsFiles chapter_id={chapter_id} />
          </div>
        </div>
        <div className="w-[50%]">
          {/* Status */}
          <div className="flex items-center gap-4 p-3 mb-3 border rounded-md justify-between">
            <label className="text-sm font-medium">Mavzu statusi</label>
            <Switch
              checked={status}
              onCheckedChange={(val) => {
                if (videosLength < 1) {
                  toast.error("Faollashtirish uchun mavzuga video joylang!");
                  return;
                }
                setStatus(val); // bu val => boolean (true/false)
              }}
            />
          </div>

          <VideoUpload
            chapter_id={chapter_id}
            setVideosLength={setVideosLength}
            changeStatusChapter={changeStatusChapter}
          />
        </div>
      </div>
    </div>
  );
}
