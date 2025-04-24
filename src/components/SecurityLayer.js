"use client";

import { useEffect, useState } from "react";

export default function SecurityLayer() {
  const [started, setStarted] = useState(false);

  /* === FullScreen’ga kirish === */
  const enterFullScreen = async () => {
    try {
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
      setStarted(true);
    } catch {
      alert("Brauzer Full Screen'ga ruxsat bermadi. Sozlamalarni tekshiring.");
    }
  };

  useEffect(() => {
    if (!started) return;

    /* FullScreen’dan chiqish */
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        alert("❗️ Full Screen rejimidan chiqdingiz – test yakunlandi.");
        // fetch("/api/violation", { method:"POST", body: JSON.stringify({ type:"fs_exit" }) });
        window.location.href = "/";
      }
    };
    document.addEventListener("fullscreenchange", handleFsChange);

    /* O‘ng‑klik blok */
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);

    /* Klaviatura cheklovlari */
    const handleKeyDown = (e) => {
      /* 1️⃣  Alt tugmasining o‘zi */
      if (e.key === "Alt") {
        e.preventDefault();
        alert("Alt tugmasini bosish taqiqlangan!");
        return;
      }

      /* 2️⃣  PrintScreen */
      if (e.key === "PrintScreen") {
        navigator.clipboard.writeText("Screenshot olish taqiqlangan!");
        alert("Screenshot olish taqiqlangan!");
        return;
      }

      /* 3️⃣  Ctrl+S, Ctrl+U, Ctrl+Shift+I, F12 */
      if (
        (e.ctrlKey && e.key === "s") ||
        (e.ctrlKey && e.key === "u") ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") ||
        e.key === "F12"
      ) {
        e.preventDefault();
        alert("Bu harakatlar cheklangan!");
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);

    /* Cleanup */
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [started]);

  /* Boshlash modal */
  if (!started) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="rounded-xl bg-white p-6 text-center w-80">
          <h2 className="mb-4 text-xl font-semibold">Testni boshlash</h2>
          <p className="mb-6 text-sm">
            “Boshlash” tugmasini bosganingizda test Full Screen rejimida
            ochiladi. Esc, Alt yoki Alt + Tab bosilsa, test yakunlanadi.
          </p>
          <button
            onClick={enterFullScreen}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Boshlash
          </button>
        </div>
      </div>
    );
  }

  return null; // test boshlandi, himoya faollashdi
}
