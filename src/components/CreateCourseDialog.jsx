"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";

export default function CreateCourseDialog() {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("1");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  function generateRandom8DigitNumber() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  }

  const handleCreate = async () => {
    if (!name) {
      alert("Kurs nomini kiriting");
      return;
    }

    const course_id = generateRandom8DigitNumber();

    setLoading(true);
    const { data, error } = await supabase
      .from("courses_duplicate")
      .insert([{ name, kurs: parseInt(level), course_id }])
      .select()
      .single();

    setLoading(false);

    if (error) {
      alert("Xatolik yuz berdi: " + error.message);
    } else {
      setOpen(false);
      router.push(`/course-details/${data.course_id}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Kurs yaratish</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yangi kurs yaratish</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Kurs nomi"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Select value={level} onValueChange={(val) => setLevel(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Kurs darajasi" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num}-kurs
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Yaratilmoqda..." : "Yaratish"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
