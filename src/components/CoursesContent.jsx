// app/courses/CoursesContent.jsx
"use client";

import { useCourses } from "@/app/context/CoursesContext";
import { useState } from "react";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";

export default function CoursesContent() {
  const { loading, courses } = useCourses();
  const [search, setSearch] = useState("");

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <Input
          placeholder="Qidirish"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-[300px] md:w-[400px] lg:w-[500px] bg-white"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-56 border"></Skeleton>
          <Skeleton className="h-56 border"></Skeleton>
          <Skeleton className="h-56 border"></Skeleton>
          <Skeleton className="h-56 border"></Skeleton>
          <Skeleton className="h-56 border"></Skeleton>
          <Skeleton className="h-56 border"></Skeleton>
          <Skeleton className="h-56 border"></Skeleton>
          <Skeleton className="h-56 border"></Skeleton>
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-4 gap-4">
          {courses
            .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
            .map((course) => (
              <Link
                href={`/course-details/${course.course_id}`}
                key={course.id}
                className="rounded-xl border overflow-hidden shadow-md max-w-sm"
              >
                <div className="w-full h-48 overflow-hidden relative border-b border-gray-300 dark:border-gray-600">
                  <img
                    src={course.banner_url || "/placeholder.jpg"}
                    alt={course.name}
                    className="rounded-t-xl object-contain w-full h-full"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <div className="font-medium">{course.name}</div>
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
