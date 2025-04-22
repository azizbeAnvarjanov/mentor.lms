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
import { GripVertical, Pencil, Trash, TrashIcon } from "lucide-react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Label } from "./ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function VideoUpload({
  chapter_id,
  setVideosLength,
  changeStatusChapter,
}) {
  const [uploadType, setUploadType] = useState("link");
  const [videoLink, setVideoLink] = useState("");
  const [videoName, setVideoName] = useState("");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("view");
  const supabase = createClient();
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

function SortableVideoItem({ video, onSave, handleDeleteVideo }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: video.id });

  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(video.name);
  const [link, setLink] = useState(video.video_link);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center gap-2 p-3 border rounded-md bg-gray-50"
    >
      <div {...listeners} className="cursor-grab">
        <GripVertical className="text-gray-500" />
      </div>

      {edit ? (
        <div className="flex flex-col w-full gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          <Input value={link} onChange={(e) => setLink(e.target.value)} />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onSave(video.id, name, link);
                setEdit(false);
              }}
            >
              Saqlash
            </Button>
            <Button variant="ghost" onClick={() => setEdit(false)}>
              Bekor qilish
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1">
            <p className="font-medium">{video.name}</p>
            <p className="text-sm text-muted-foreground truncate">
              {video.video_link}
            </p>
          </div>
          <Button size="sm" onClick={() => setEdit(true)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant={"destructive"}
            size="sm"
            onClick={() => handleDeleteVideo(video.id)}
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  );
}
