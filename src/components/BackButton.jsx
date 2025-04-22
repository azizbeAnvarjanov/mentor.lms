"use client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ChevronLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/"); // yoki istalgan default sahifa
    }
  };

  return <Button onClick={handleBack} variant={"outline"}><ChevronLeft /></Button>;
}
