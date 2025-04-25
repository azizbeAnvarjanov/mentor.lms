"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useTeacher } from "./TeacherContext";

const CoursesContext = createContext(null);

export function CoursesProvider({ children }) {
  const { user, teacher } = useTeacher();

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [department, setDepartment] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    if (teacher) {
      setDepartment(teacher.kafedra);
    }
  }, [teacher]);

  useEffect(() => {
    if (!teacher?.kafedra) return;

    const fetchCourses = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("courses_duplicate")
        .select("id, course_id, banner_url, name")
        .eq("department", teacher.kafedra)
        .order("created_at", { ascending: true });

      if (!error) {
        setCourses(data);
      } else {
        console.error("Error fetching courses:", error.message);
      }
      setLoading(false);
    };

    fetchCourses();
  }, [teacher?.kafedra]);

  return (
    <CoursesContext.Provider value={{ courses, loading }}>
      {children}
    </CoursesContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CoursesContext);
  if (context === null) {
    throw new Error("useCourses must be used within a CoursesProvider");
  }
  return context;
}
