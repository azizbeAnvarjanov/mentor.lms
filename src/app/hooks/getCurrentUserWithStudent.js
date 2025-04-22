// app/lib/getCurrentUserWithStudent.ts
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function getCurrentUserWithStudent() {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    redirect("/login"); // foydalanuvchi login qilmagan bo‘lsa
  }

  const { data: studentData, error: studentError } = await supabase
    .from("teachers")
    .select("*")
    .eq("teacher_id", userData.user.id)
    .single();
    

  if (studentError || !studentData) {
    redirect("/error"); // student topilmasa yoki xatolik bo‘lsa
  }

  return {
    user: userData.user,
    teacher: studentData,
  };
}
