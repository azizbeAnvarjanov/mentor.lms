// components/VideoUpload.jsx
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Label } from "./ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortableVideoItem } from "./SortableVideoItem";
import { useVideoUploadingDetails } from "@/app/actions/VideoUploadActions";

export default function VideoUpload({
  chapter_id,
  setVideosLength,
  changeStatusChapter,
}) {
  const {
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
  } = useVideoUploadingDetails(
    chapter_id,
    setVideosLength,
    changeStatusChapter
  );

  return (
    <div className="p-4 bg-white border rounded-xl space-y-4">
      <h2 className="text-lg font-semibold">Video joylash</h2>
      <div className="mb-4">
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Yopish" : "Video qo‘shish"}
        </Button>
        <br />
      </div>

      {showForm && (
        <div className="space-y-2 border border-gray-300 p-4 rounded-md bg-gray-50">
          <div className="space-y-2">
            <Label>Joylash turi:</Label>
            <Select value={uploadType} onValueChange={setUploadType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Joylash turini tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="link">Link orqali</SelectItem>
                <SelectItem value="file" disabled>
                  Kompyuterdan (Tez orada)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {uploadType === "link" && (
            <>
              <label className="block text-sm font-medium">Video nomi</label>
              <Input
                type="text"
                value={videoName}
                onChange={(e) => setVideoName(e.target.value)}
              />
              <label className="block text-sm font-medium">
                YouTube video link
              </label>
              <Input
                type="text"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
              />
              <Button onClick={handleAddVideo} disabled={loading}>
                {loading ? "Yuklanmoqda..." : "Joylash"}
              </Button>
            </>
          )}
        </div>
      )}

      {videos.length > 0 && (
        <Tabs value={tab} onValueChange={setTab} className="mt-6">
          <TabsList className="w-full flex gap-2">
            <TabsTrigger value="view" className="flex-1">
              Ko'rish
            </TabsTrigger>
            <TabsTrigger value="sort" className="flex-1">
              Tartiblash / O‘zgartirish
            </TabsTrigger>
          </TabsList>

          <TabsContent value="view">
            <Carousel
              className="w-full max-w-xl relative mt-4"
              opts={{ drag: false }}
            >
              <CarouselContent>
                {videos.map((video) => (
                  <CarouselItem key={video.id}>
                    <div className="relative aspect-video overflow-hidden w-full rounded-md border-2">
                      <iframe
                        className="w-[80%] mx-auto h-full"
                        src={getEmbedLink(video.video_link)}
                        title={video.name}
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <p className="text-center mt-2 font-medium">{video.name}</p>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-3 top-1/2 -translate-y-1/2 z-10" />
              <CarouselNext className="absolute right-3 top-1/2 -translate-y-1/2 z-10" />
            </Carousel>
          </TabsContent>

          <TabsContent value="sort">
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={videos.map((v) => v.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4 mt-4">
                  {videos.map((video) => (
                    <SortableVideoItem
                      key={video.id}
                      video={video}
                      onSave={handleUpdateVideo}
                      handleDeleteVideo={handleDeleteVideo}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
