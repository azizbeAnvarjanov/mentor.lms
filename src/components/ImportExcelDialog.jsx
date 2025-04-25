"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { useParams } from "next/navigation";
import { Download } from "lucide-react";

export function ImportExcelDialog() {
  const params = useParams();
  const test_id = params.test_id;
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    try {
      setLoading(true);
      setProgress(0);
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          const [header, ...rows] = json;

          if (
            !header ||
            header[0] !== "Savol" ||
            header[1] !== "Variant1" ||
            header[2] !== "Variant2" ||
            header[3] !== "Variant3" ||
            header[4] !== "Variant4" ||
            header[5] !== "To‘g‘ri javob"
          ) {
            throw new Error(
              "Shablon mos emas. Iltimos, to‘g‘ri formatda yuklang."
            );
          }

          let count = 0;
          for (const row of rows) {
            const [questionText, a, b, c, d, correctIndexStr] = row;

            const { data: question, error: qError } = await supabase
              .from("questions")
              .insert({ question_text: questionText, test_id: test_id })
              .select()
              .single();

            if (qError)
              throw new Error("Savol qo‘shishda xatolik: " + qError.message);

            const options = [a, b, c, d].map((text, index) => ({
              question_id: question.id,
              option_text: text,
              is_correct: Number(correctIndexStr) === index + 1,
            }));

            const { error: optError } = await supabase
              .from("options")
              .insert(options);
            if (optError)
              throw new Error(
                "Variant qo‘shishda xatolik: " + optError.message
              );

            count++;
            setProgress(Math.round((count / rows.length) * 100));
          }

          toast.success("Savollar muvaffaqiyatli yuklandi");
          setOpen(false);
        } catch (err) {
          console.error(err);
          toast.error(err.message);
        } finally {
          setLoading(false);
          setProgress(0);
        }
      };

      reader.onerror = () => {
        throw new Error("Faylni o‘qishda xatolik yuz berdi");
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
      setLoading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          Savollarni import qilish <Download />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Excel orqali savollarni import qilish</DialogTitle>
          <DialogDescription>
            Faylni pastga tashlang yoki kompyuterdan yuklang.
          </DialogDescription>
        </DialogHeader>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="w-full h-32 border-2 border-dashed border-gray-400 rounded flex items-center justify-center text-gray-600 text-sm mb-4"
        >
          Faylni shu yerga tashlang
        </div>

        <Button
          variant="secondary"
          className="w-full mb-2"
          onClick={() => fileInputRef.current.click()}
          disabled={loading}
        >
          {loading ? "Yuklanmoqda..." : "Kompyuterdan yuklash"}
        </Button>
        <input
          type="file"
          accept=".xlsx, .xls"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />

        {loading && (
          <div className="w-full mt-4 space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-center text-gray-700">
              {progress}% yuklanmoqda...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
