"use client";

import { ImportExcelDialog } from "@/components/ImportExcelDialog";
import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Download, Pen, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BackButton from "@/components/BackButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TestDetailsPage() {
  const params = useParams();
  const test_id = params.test_id;
  const [question, setQuestion] = useState("");
  const [testStatus, setTestStatus] = useState(false);
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questionList, setQuestionList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const supabase = createClient();
  
  function generateRandomBigInt(min = 1001n, max = 999999999999999n) {
    const range = max - min + 1n;
    const rand = BigInt(Math.floor(Math.random() * Number(range)));
    return min + rand;
  }


  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from("questions")
      .select("*, options(*)")
      .eq("test_id", test_id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else {
      setQuestionList(data);
    }
  };

  useEffect(() => {
    if (test_id) fetchQuestions();
  }, [test_id]);

  const fetchStatus = async () => {
    const { data, error } = await supabase
      .from("tests_duplicate")
      .select("test_status")
      .eq("id", test_id);
    if (error) {
      console.error(error);
    } else {
      setTestStatus(data[0]?.test_status);
      console.log(data[0]?.test_status);
    }
  };
  useEffect(() => {
    fetchStatus();
  }, [test_id]);

  const handleOptionChange = (value, index) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const resetForm = () => {
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(null);
    setIsEditing(false);
    setEditQuestionId(null);
  };

  const handleCreateOrUpdateQuestion = async () => {
    if (!question || options.some((opt) => !opt) || correctIndex === null) {
      alert(
        "Savol va barcha variantlar to‘ldirilishi hamda to‘g‘ri javob tanlanishi kerak."
      );
      return;
    }

    setLoading(true);

    if (isEditing) {
      await supabase
        .from("questions")
        .update({ question_text: question })
        .eq("id", editQuestionId);
      await supabase.from("options").delete().eq("question_id", editQuestionId);

      const updatedOptions = options.map((opt, i) => ({
        question_id: editQuestionId,
        option_text: opt,
        is_correct: i === correctIndex,
      }));
      const { error: insertError } =  await supabase
        .from("options")
        .insert(updatedOptions);

      if (insertError) {
        console.error(insertError);
        alert("Variantlar yaratishda xatolik");
        setLoading(false);
        return;
      }
      resetForm();
      await fetchQuestions();
    } else {
      const { data: qData, error: qError } = await supabase
        .from("questions")
        .insert([{ question_text: question, test_id: test_id }])
        .select()
        .single();

      if (qError) {
        console.error(qError);
        alert("Savol yaratishda xatolik");
        setLoading(false);
        return;
      }

      const newOptions = options.map((opt, i) => ({
        id: generateRandomBigInt().toString(),
        question_id: qData.id,
        option_text: opt,
        is_correct: i === correctIndex,
      }));

      const { error: insertError } = await supabase
        .from("options")
        .insert(newOptions);

      if (insertError) {
        console.error(insertError);
        alert("Variantlar yaratishda xatolik");
        setLoading(false);
        return;
      }
    }

    await fetchQuestions();
    resetForm();
    setLoading(false);
  };

  const handleDeleteMultiple = async () => {
    const confirm = window.confirm("Tanlangan savollarni o‘chirmoqchimisiz?");
    if (!confirm) return;

    for (const qId of selectedQuestions) {
      const { error: deleteError } = await supabase.from("options").delete().eq("question_id", qId);
      if (deleteError) {
        console.error(deleteError);
        alert("Variantlar o'chirishda xatolik");
        setLoading(false);
        return;
      }
      await supabase.from("questions").delete().eq("id", qId);
    }

    setSelectedQuestions([]);
    setSelectAll(false);
    await fetchQuestions();
  };

  const handleEdit = (q) => {
    setQuestion(q.question_text);
    setOptions(q.options.map((opt) => opt.option_text));
    setCorrectIndex(q.options.findIndex((opt) => opt.is_correct));
    setIsEditing(true);
    setEditQuestionId(q.id);
  };

  const handleExport = () => {
    const exportData = questionList.map((q) => {
      const correct = q.options.find((o) => o.is_correct)?.option_text || "";
      return {
        Savol: q.question_text,
        Variant1: q.options[0]?.option_text || "",
        Variant2: q.options[1]?.option_text || "",
        Variant3: q.options[2]?.option_text || "",
        Variant4: q.options[3]?.option_text || "",
        "To‘g‘ri javob": correct,
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Savollar");
    XLSX.writeFile(workbook, `test_${test_id}_savollar.xlsx`);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questionList.map((q) => q.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleSingleSelect = (id) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]
    );
  };

  const handleChangeStatus = async (value) => {
    try {
      setLoading(true);

      if (value === "true") {
        // Faollashtirish uchun oldin questionsni tekshiramiz
        const {
          data: questionData,
          error: questionError,
        } = await supabase.from("questions").select("*").eq("test_id", test_id);

        if (questionError) {
          console.error(questionError);
          toast.error("Savollarni yuklashda xato");
          return;
        }

        if (questionData.length > 0) {
          const { error: updateError } = await supabase
            .from("tests_duplicate")
            .update({ test_status: true })
            .eq("id", test_id);

          if (updateError) {
            console.error(updateError);
            toast.error("Statusni faollashtirishda xato yuz berdi");
          } else {
            fetchStatus();
            toast.success("Test faollashtirildi!");
          }
        } else {
          toast.error("Savollar mavjud emas, avval savol yarating");
        }
      } else if (value === "false") {
        // No faol qilish uchun savolni tekshirish shart emas
        const { error: updateError } = await supabase
          .from("tests_duplicate")
          .update({ test_status: false })
          .eq("id", test_id);

        if (updateError) {
          console.error(updateError);
          toast.error("Statusni nofaol qilishda xato yuz berdi");
        } else {
          fetchStatus();
          toast.success("Test nofaol qilindi!");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Xato yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="">
      <ResizablePanel defaultSize={20} minSize={20}>
        <Card className="p-4 h-full overflow-auto border-none">
          <div className="flex items-center gap-2 w-full">
            <BackButton />
            <ImportExcelDialog test_id={test_id} onImport={fetchQuestions} />
          </div>
          <h2 className="text-xl font-bold">
            {isEditing ? "Savolni tahrirlash" : "Savol yaratish"}
          </h2>
          <Input
            type="text"
            placeholder="Savol matni"
            className="w-full p-2 border rounded"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <div className="space-y-3">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder={`Variant ${i + 1}`}
                  className="flex-1 p-2 border rounded"
                  value={opt}
                  onChange={(e) => handleOptionChange(e.target.value, i)}
                />
                <Label className="flex items-center gap-1 text-sm">
                  <Input
                    type="radio"
                    name="correct"
                    checked={correctIndex === i}
                    onChange={() => setCorrectIndex(i)}
                  />
                  To‘g‘ri
                </Label>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreateOrUpdateQuestion} disabled={loading}>
              {loading
                ? isEditing
                  ? "Yangilanyapti..."
                  : "Yaratilmoqda..."
                : isEditing
                ? "Yangilash"
                : "Savolni yaratish"}
            </Button>
            {isEditing && (
              <Button variant="secondary" onClick={resetForm}>
                Bekor qilish
              </Button>
            )}
          </div>
        </Card>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={80} minSize={40}>
        <div className="h-full overflow-auto border-l">
          <div className="flex items-center border-b justify-between p-2">
            <h1 className="font-medium">Yuklangan savollar</h1>
            <div className="flex gap-2 align-bottom">
              <Button
                size="sm"
                variant="destructive"
                className="font-normal"
                disabled={selectedQuestions.length === 0}
                onClick={handleDeleteMultiple}
              >
                <Trash />
                O'chirish
              </Button>
              <Button
                className="font-normal"
                size="sm"
                onClick={handleExport}
                disabled={questionList.length === 0}
              >
                <Download />
                Eksport
              </Button>
              <Select
                value={String(testStatus)}
                onValueChange={handleChangeStatus}
                disabled={loading}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue
                    placeholder={
                      String(testStatus) === "true" ? "Faol" : "No faol"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">
                    <div className="w-[10px] h-[10px] bg-green-400 rounded-full"></div>
                    Faol
                  </SelectItem>
                  <SelectItem value="false">
                    <div className="w-[10px] h-[10px] bg-red-400 rounded-full"></div>
                    No faol
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="overflow-auto">
            <Table>
              <TableHeader className="sticky top-0  z-10">
                <TableRow>
                  <TableHead className="text-center">
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Savol</TableHead>
                  <TableHead>Variant A</TableHead>
                  <TableHead>Variant B</TableHead>
                  <TableHead>Variant C</TableHead>
                  <TableHead>Variant D</TableHead>
                  <TableHead>To‘g‘ri javob</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questionList.map((q) => {
                  const correct =
                    q.options.find((o) => o.is_correct)?.option_text || "";
                  return (
                    <TableRow key={q.id}>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={selectedQuestions.includes(q.id)}
                          onCheckedChange={() => toggleSingleSelect(q.id)}
                        />
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="line-clamp-1">{q.question_text}</p>
                      </TableCell>
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <TableCell key={idx} className="max-w-[100px]">
                          <p className="line-clamp-1">
                            {q.options[idx]?.option_text || ""}
                          </p>
                        </TableCell>
                      ))}
                      <TableCell className="text-green-600 font-semibold max-w-[100px]">
                        <p className="line-clamp-1">{correct}</p>
                      </TableCell>
                      {/* <TableCell className="max-w-[10px] min-w-[10px]">
                        <Button variant="ghost" onClick={() => handleEdit(q)}>
                          <Pen />
                        </Button>
                      </TableCell> */}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
