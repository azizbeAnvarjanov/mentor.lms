"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function CreateCourse() {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("1");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const router = useRouter();

  function generateRandom8DigitNumber() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  }
  
  // Foydalanish:
  const course_id = generateRandom8DigitNumber();
  

  const handleCreate = async () => {
    if (!name) {
      alert("Kurs nomini kiriting");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("courses_duplicate")
      .insert([{ name, kurs: parseInt(level), course_id}])
      .select()
      .single();

    setLoading(false);

    if (error) {
      alert("Xatolik yuz berdi: " + error.message);
    } else {
      router.push(`/course-details/${data.course_id}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-2xl font-semibold mb-4">Kurs yaratish</h1>
      <input
        type="text"
        placeholder="Kurs nomi"
        className="w-full p-2 border mb-4"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <select
        className="w-full p-2 border mb-4"
        value={level}
        onChange={(e) => setLevel(e.target.value)}
      >
        {[1, 2, 3, 4, 5, 6].map((num) => (
          <option key={num} value={num}>
            {num}-kurs
          </option>
        ))}
      </select>
      <button
        onClick={handleCreate}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        disabled={loading}
      >
        {loading ? "Yaratilmoqda..." : "Yaratish"}
      </button>
    </div>
  );
}
