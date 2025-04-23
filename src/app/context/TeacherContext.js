"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const TeacherContext = createContext(null);

export function TeacherProvider({ children }) {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchTeacher() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUser(user);
          const { data: teacherData, error } = await supabase
            .from("teachers")
            .select("*, teachers_departments (name)")
            .eq("teacher_id", user.id)
            .single();

          if (error) {
            console.error("Error fetching teacher:", error);
          } else {
            setTeacher(teacherData);
          }
        }
      } catch (error) {
        console.error("Error in fetchStudent:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTeacher();
  }, []);

  return (
    <TeacherContext.Provider value={{ user, teacher, loading }}>
      {children}
    </TeacherContext.Provider>
  );
}

export function useTeacher() {
  const context = useContext(TeacherContext);
  if (context === undefined) {
    throw new Error("useStudent must be used within a TeacherProvider");
  }
  return context;
}
