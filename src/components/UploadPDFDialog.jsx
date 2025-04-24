import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import {
  CircleFadingPlus,
  FileChartPie,
  LayoutGrid,
  Plus,
  PlusCircle,
  PlusCircleIcon,
  Trash,
  WrapText,
} from "lucide-react";
import Image from "next/image";
import MenuToggle from "./MenuToggle";

export default function UploadPDFDialog({ chapterId }) {
  const [open, setOpen] = useState(false);
  const [pptName, setPptName] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pptList, setPptList] = useState([]);
  const [grid, setGrid] = useState("list");

  const supabase = createClient();

  useEffect(() => {
    const fetchPPTs = async () => {
      const { data: chapterData, error } = await supabase
        .from("chapters")
        .select("notes")
        .eq("chapter_id", chapterId)
        .single();

      if (error) {
        toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
      } else {
        setPptList(chapterData?.notes || []);
      }
    };

    fetchPPTs();
  }, [chapterId]);

  const handleUpload = async () => {
    if (!file || !pptName) return toast.error("Nom va fayl tanlanishi kerak");

    setUploading(true);
    setProgress(0);

    // Fake progress simulyatsiyasi
    let fakeProgress = 0;
    const progressInterval = setInterval(() => {
      fakeProgress += 5;
      if (fakeProgress < 90) {
        setProgress(fakeProgress);
      }
    }, 700); // Har 200ms da 5% oshiradi

    const filePath = `pdf/${chapterId}/${file.name}`;
    const { data, error } = await supabase.storage
      .from("pdf")
      .upload(filePath, file, {
        upsert: true,
      });

    clearInterval(progressInterval); // Yuklash tugasa, to‘xtatamiz

    if (error) {
      setProgress(0);
      toast.error("Yuklashda xatolik yuz berdi");
      setUploading(false);
      return;
    }

    setProgress(100); // Muvaffaqiyatli tugadi

    const { data: urlData } = supabase.storage
      .from("pdf")
      .getPublicUrl(filePath);
    const url = urlData.publicUrl;

    const newPPTs = [
      ...pptList,
      {
        url,
        name: pptName,
      },
    ];

    const { error: updateError } = await supabase
      .from("chapters")
      .update({ notes: newPPTs })
      .eq("chapter_id", chapterId);

    if (updateError) {
      toast.error("Ma'lumotni yangilashda xatolik yuz berdi");
    } else {
      toast.success("Fayl muvaffaqiyatli yuklandi");
      setOpen(false);
      setPptName("");
      setFile(null);
      setPptList(newPPTs);
    }

    setUploading(false);
  };

  const handleDelete = async (pptName) => {
    const ppt = pptList.find((p) => p.name === pptName);
    if (!ppt) return;

    if (!confirm("Haqiqatan ham ushbu faylni o'chirmoqchimisiz?")) return;

    try {
      // Fayl yo‘lini URL dan chiqarib olish
      const fileUrl = new URL(ppt.url);
      const parts = fileUrl.pathname.split("/");
      const fileName = decodeURIComponent(parts[parts.length - 1]);

      const filePath = `pdf/${chapterId}/${fileName}`;
      console.log("Storage fayl yo‘li:", filePath);

      // Storage'dan faylni o‘chirish
      const { error: storageError } = await supabase.storage
        .from("pdf")
        .remove([filePath]);

      if (storageError) {
        console.error("Storage'dan o‘chirish xatosi:", storageError);
        toast.error("Faylni storage'dan o‘chirishda xatolik!");
        return;
      }

      // pptList ni yangilash
      const updatedPPTs = pptList.filter((p) => p.name !== pptName);
      setPptList(updatedPPTs);

      // Bazani yangilash
      const { error: dbError } = await supabase
        .from("chapters")
        .update({ notes: updatedPPTs })
        .eq("chapter_id", chapterId);

      if (dbError) {
        console.error("Ma'lumotlar bazasini yangilashda xatolik:", dbError);
        toast.error("Bazani yangilashda xatolik yuz berdi!");
      } else {
        toast.success("Fayl muvaffaqiyatli o‘chirildi!");
      }
    } catch (err) {
      console.error("Xatolik yuz berdi:", err);
      toast.error("Faylni o‘chirishda kutilmagan xatolik!");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-medium text-xl">PDF fayllar</h1>

        <div className="flex items-center gap-1 ">
          <Button
            onClick={() => setOpen(true)}
            className="bg-muted mr-2 text-black border hover:bg-muted"
          >
            Yuklash <CircleFadingPlus />
          </Button>
          <Button
            onClick={() => setGrid("list")}
            variant="outline"
            className={`hover:bg-muted ${
              grid === "list" ? "bg-muted text-black border" : ""
            }`}
          >
            <WrapText strokeWidth={1.5} />
          </Button>
          <Button
            onClick={() => setGrid("grid")}
            variant="outline"
            className={`hover:bg-muted  ${
              grid === "grid" ? "bg-muted text-black border" : ""
            }`}
          >
            <LayoutGrid strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      <div
        className={`${
          grid === "grid" ? "mt-4 grid grid-cols-4 gap-3" : "mt-4 space-y-2"
        }`}
      >
        {pptList.map((ppt, index) => (
          <div
            key={index}
            className={`${
              grid === "grid"
                ? "bg-muted border py-5 px-1.5 rounded-md grid place-items-center text-center relative"
                : "flex items-center justify-between bg-muted border p-2 rounded-md"
            }`}
          >
            <div
              className={`${grid === "grid" ? "" : "flex items-center gap-3"}`}
            >
              <div
                className={`${
                  grid === "grid"
                    ? "w-20 h-20 relative mx-auto"
                    : "w-8 h-8 relative"
                }`}
              >
                <Image
                  fill
                  src={"/pdf.png"}
                  className="object-contain"
                  alt="ppt file"
                />
              </div>

              <Link
                href={ppt.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${
                  grid === "grid"
                    ? "underline font-medium text-[12px] line-clamp-1 mt-2"
                    : "underline font-medium text-sm"
                }`}
              >
                {ppt.name}
              </Link>
            </div>
            <div className="absolute right-1 top-0">
              <MenuToggle ppt={ppt} handleDelete={handleDelete} />
            </div>
            {grid === "list" && (
              <Button
                className="w-[30px] h-[30px]"
                variant="destructive"
                onClick={() => handleDelete(ppt.name)}
              >
                <Trash />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>PPT yuklash</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pptName">Fayl nomi</Label>
              <Input
                id="pptName"
                value={pptName}
                onChange={(e) => setPptName(e.target.value)}
                placeholder="Masalan: Mavzu prezentatsiyasi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Fayl tanlang (.ppt yoki .pptx)</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
            {uploading && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <div className="text-sm text-center text-gray-600">
                  {progress}% yuklandi
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              disabled={!pptName || !file || uploading}
              onClick={handleUpload}
            >
              Yuklash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
