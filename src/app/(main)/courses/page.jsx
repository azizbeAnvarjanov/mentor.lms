// app/courses/page.jsx

import { CoursesProvider } from "@/app/context/CoursesContext";
import CoursesContent from "@/components/CoursesContent";

// Lazy load client component to avoid server error

export default function CoursesPage() {
  return (
    <CoursesProvider>
      <CoursesContent />
    </CoursesProvider>
  );
}
