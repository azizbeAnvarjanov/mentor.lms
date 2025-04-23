"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Grip, GripVertical, Pencil, Trash, TrashIcon } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const SortableVideoItem = ({ video, onSave, handleDeleteVideo }) => {
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
        <Grip className="text-gray-500" />
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
};
