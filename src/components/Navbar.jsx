"use client";

import { useTeacher } from "@/app/context/TeacherContext";
import AvatarNavbar from "./AvatarNavbar";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import CreateCourseDialog from "./CreateCourseDialog";
import { ModeToggle } from "./ModeToggle";

export default function Navbar() {
  const { user, teacher, loading } = useTeacher();

  if (loading) return <Skeleton className="h-16 border-b rounded-none"></Skeleton>;
  if (!teacher) return <div>No student data</div>;

  return (
    <nav className="dark:bg-[#0a0a0a] dark:border-b shadow-sm fixed left-0 top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex justify-between h-16">
          <div className="w-full h-[7vh] flex items-center px-2">
            <Link href={"/"} className="w-[50px] h-[50px] flex relative">
              <Image src={"/logo.png"} alt="" fill className="object-contain" />
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <CreateCourseDialog teacher={teacher} />
            <AvatarNavbar user={user} teacher={teacher} />
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
