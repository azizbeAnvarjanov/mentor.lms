"use client";

import { logout } from "@/app/(login)/login/actions";
import { useTeacher } from "@/app/context/TeacherContext";
import AvatarNavbar from "./AvatarNavbar";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import CreateCourseDialog from "./CreateCourseDialog";

export default function Navbar() {
  const { user, teacher, loading } = useTeacher();

  if (loading) return <Skeleton className="h-16 border-b"></Skeleton>;
  if (!teacher) return <div>No student data</div>;

  return (
    <nav className="bg-white shadow-sm fixed left-0 top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="w-full border-gray-300 h-[7vh] flex items-center px-2">
            <Link href={"/"} className="w-[50px] h-[50px] flex relative">
              <Image src={"/logo.png"} alt="" fill className="object-contain" />
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <CreateCourseDialog teacher={teacher}/>
            <AvatarNavbar user={user} teacher={teacher} />
          </div>
        </div>
      </div>
    </nav>
  );
}
