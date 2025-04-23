"use client";
import { useTeacher } from "@/app/context/TeacherContext";
import getInitials from "@/app/hooks/getInitials";
import BackButton from "@/components/BackButton";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const page = () => {
  const { user, teacher, loading } = useTeacher();
  if (loading) return <Skeleton className="h-16 border-b"></Skeleton>;
  if (!teacher) return <div>No student data</div>;
  const av = getInitials(teacher?.fio);

  return (
    <div className="w-full max-w-xl mx-auto md:px-4">
      <BackButton />
      <div className="w-24 h-24 text-2xl font-medium mx-auto my-3 border-2 rounded-full bg-muted grid place-content-center">
        <p>{av}</p>
      </div>
      <h1 className="text-center font-medium text-lg sm:text-xl">
        {teacher.fio}
      </h1>
      <h1 className="text-center text-[#909090] text-sm sm:text-base">
        {user.email}
      </h1>
      <br />
      <div className="space-y-2">
        <div className="border-t flex items-center justify-between p-2 text-sm sm:text-base">
          <p className="font-medium">Email pochta:</p>
          <p className="text-right break-all">{user.email}</p>
        </div>
        <div className="border-t flex items-center justify-between p-2 text-sm sm:text-base">
          <p className="font-medium">O'qituvchi ID:</p>
          <p>{teacher.teacher_id}</p>
        </div>
        <div className="border-t flex items-center justify-between p-2 text-sm sm:text-base">
          <p className="font-medium">Ro'li:</p>
          <p className="capitalize">
            {teacher.role === "mudir" ? "Kafedra mudiri" : "O'qituvchi"}
          </p>
        </div>
        <div className="border-t flex items-center justify-between p-2 text-sm sm:text-base">
          <p className="font-medium">Kafedra:</p>
          <p>{teacher.teachers_departments.name}</p>
        </div>
      </div>
      <br />
    </div>
  );
};

export default page;
