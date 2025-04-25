"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import Link from "next/link";
import { Paperclip, Pen, Trash } from "lucide-react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

export default function TestCreator() {
  const params = useParams();
  const chapter_id = params.chapter_id;
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState(40);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  console.log(tests);

  // Yaratilgan testlarni olish
  const fetchTests = async () => {
    const { data, error } = await supabase
      .from("tests_duplicate")
      .select("*")
      .eq("chapter_id", chapter_id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setTests(data);
  };

  useEffect(() => {
    if (chapter_id) {
      fetchTests();
    }
  }, [chapter_id]);

  // Test yaratish funksiyasi
  const handleCreateTest = async () => {
    if (!title) return alert("Test nomi bo‘sh bo‘lmasligi kerak");

    setLoading(true);

    const { data, error } = await supabase.from("tests_duplicate").insert([
      {
        name: title,
        time_limit: timeLimit,
        chapter_id: chapter_id,
        test_status: false,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Xatolik: test yaralmadi");
    } else {
      setTitle("");
      setTimeLimit(40);
      setShowForm(false);
      fetchTests(); // yangilash
    }

    setLoading(false);
  };

  const handleDeletetest = async (id) => {
    try {
      // 'question' jadvalidan tegishli testlar mavjudligini tekshirish
      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .select("*")
        .eq("test_id", id);

      if (questionError) {
        console.error(questionError);
        return;
      }

      // Agar 'question' jadvalida testga tegishli satrlar bo'lsa
      if (questionData.length > 0) {
        toast.error(
          "Bu testga tegishli savollar mavjud, avval ularni o'chiring"
        );
      } else {
        // Agar testga tegishli savollar bo'lmasa, testni o'chirish
        const { error } = await supabase
          .from("tests_duplicate")
          .delete()
          .eq("id", id);

        if (error) {
          console.error(error);
          toast.error("Testni o'chirishda xato yuz berdi");
        } else {
          toast.success("Test o'chirildi");
          fetchTests(); // yangilash
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Xato yuz berdi");
    }
  };

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">Testlar</h1>
        <Button variant={"outline"} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Bekor qilish" : "Test yaratish"}
        </Button>
      </div>

      {showForm && (
        <div className="mt-3 space-y-4">
          <div>
            <Label className="mb-2">Test nomi</Label>
            <Input
              type="text"
              placeholder="Test nomi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <Label className="mb-2">Test uchun ajratilgan vaqt</Label>
            <Input
              type="number"
              placeholder="Vaqt (daqiqalarda)"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>
          <Button onClick={handleCreateTest} disabled={loading}>
            {loading ? "Yaratilmoqda..." : "Yaratish"}
          </Button>
        </div>
      )}

      <div className="mt-3">
        {tests.length === 0 ? (
          <p>Hozircha test yo‘q</p>
        ) : (
          <ul className="space-y-2">
            {tests.map((test) => (
              <li
                key={test.id}
                className="p-3 border rounded-md hover:bg-gray-50 transition flex items-center justify-between text-sm"
              >
                <div className="font-medium">{test.name}</div>
                <div className="flex items-center gap-3">
                  <div className="bg-red-500 px-2 rounded-full text-white">
                    {test.test_status !== "false" ? "faol emas" : "faol"}
                  </div>
                  <Button
                    onClick={() => handleDeletetest(test.id)}
                    variant={"outline"}
                  >
                    <Trash />
                  </Button>
                  <Link
                    href={`/test-details/${test.id}`}
                    className="border p-2 rounded-md"
                  >
                    <Pen size={16} />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
