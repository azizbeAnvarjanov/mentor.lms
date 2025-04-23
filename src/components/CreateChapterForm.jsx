"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Grip, Pen, Plus } from "lucide-react";
import Link from "next/link";

const generateChapterId = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

function SortableChapter({ chapter, course_id }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: chapter.chapter_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center justify-between bg-gray-100 p-2 rounded-md border mb-2"
    >
      <div className="flex gap-2 items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div {...listeners} className="cursor-move text-gray-500">
            <Grip />
          </div>
          <p className="font-semibold w-[350px] line-clamp-1">{chapter.name}</p>
        </div>
        <div className="flex items-center text-sm gap-2">
          <p
            className={`font-semibold px-3 text-white rounded-full ${
              chapter.chapter_status === "false"
                ? "bg-gray-600"
                : "bg-green-600"
            }`}
          >
            {chapter.chapter_status === "false" ? "Faol emas" : "Faol"}
          </p>
          <Link
            href={`/course-details/${course_id}/chapter/${chapter.chapter_id}`}
            variant="outline"
            className="mx-2"
          >
            <Pen size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}

const CreateChapterForm = ({ course_id }) => {
  const supabase = createClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [chapters, setChapters] = useState([]);

  const fetchChapters = async () => {
    const { data, error } = await supabase
      .from("chapters")
      .select("*")
      .eq("course_id", course_id)
      .order("order", { ascending: true });

    if (!error) setChapters(data);
  };

  useEffect(() => {
    fetchChapters();
  }, [course_id]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Nom kiritilishi shart!");

    setLoading(true);
    const chapter_id = generateChapterId();

    const { data, error } = await supabase.from("chapters").insert([
      {
        chapter_id,
        course_id,
        name: name.trim(),
        order: chapters.length + 1,
        description: "",
        video_link: "",
        chapter_status: "false",
      },
    ]);

    if (error) {
      toast.error("Xatolik: Chapter yaratilmadi");
      console.error(error);
    } else {
      toast.success("Chapter yaratildi");
      setName("");
      setShowForm(false);
      fetchChapters();
    }

    setLoading(false);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = chapters.findIndex((c) => c.chapter_id === active.id);
    const newIndex = chapters.findIndex((c) => c.chapter_id === over.id);

    const newOrder = arrayMove(chapters, oldIndex, newIndex);
    const updated = newOrder.map((c, index) => ({ ...c, order: index + 1 }));
    setChapters(updated);

    for (const c of updated) {
      await supabase
        .from("chapters")
        .update({ order: c.order })
        .eq("chapter_id", c.chapter_id);
    }

    toast.success("Tartib yangilandi");
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="rounded-lg bg-white">
        {!showForm ? (
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">Mavzular</h3>

            <Button variant="outline" onClick={() => setShowForm(true)}>
              <Plus />
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              name="name"
              placeholder="Mavzu nomi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Yaratilmoqda..." : "Saqlash"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setName("");
                }}
              >
                Bekor qilish
              </Button>
            </div>
          </form>
        )}
      </div>
      <br />
      {chapters.length > 0 && (
        <div className="rounded-lg bg-white">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={chapters.map((c) => c.chapter_id)}
              strategy={verticalListSortingStrategy}
            >
              {chapters.map((chapter) => (
                <SortableChapter
                  key={chapter.chapter_id}
                  chapter={chapter}
                  course_id={course_id}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
};

export default CreateChapterForm;
