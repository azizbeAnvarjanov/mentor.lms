"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Save } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

export const SortableVideoItem = ({ video, onSave, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: video.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [editing, setEditing] = useState(false);
  const [editedVideo, setEditedVideo] = useState({
    name: video.name,
    video_link: video.video_link,
  });

  const handleSave = () => {
    onSave(video.id, editedVideo);
    setEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-start justify-between p-4 mb-2 bg-gray-100 border rounded-md"
    >
      <div className="flex-1 space-y-2">
        {editing ? (
          <>
            <Input
              value={editedVideo.name}
              onChange={(e) => setEditedVideo({ ...editedVideo, name: e.target.value })}
              placeholder="Video nomi"
            />
            <Input
              value={editedVideo.video_link}
              onChange={(e) => setEditedVideo({ ...editedVideo, video_link: e.target.value })}
              placeholder="Video linki"
            />
          </>
        ) : (
          <>
            <p className="font-semibold">{video.name}</p>
            <p className="text-sm text-muted-foreground">{video.video_link}</p>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2 ml-4 mt-1">
        {editing ? (
          <Button size="icon" variant="outline" onClick={handleSave}>
            <Save className="w-4 h-4" />
          </Button>
        ) : (
          <Button size="icon" variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="w-4 h-4" />
          </Button>
        )}

        {/* O‘chirish alert dialog */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="icon" variant="destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Haqiqatan ham o‘chirmoqchimisiz?</AlertDialogTitle>
              <AlertDialogDescription>
                Bu amalni bekor qilib bo‘lmaydi. Video bazadan o‘chiriladi.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Yo‘q</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(video.id)}>Ha, o‘chirish</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
