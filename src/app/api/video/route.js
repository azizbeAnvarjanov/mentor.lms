import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../utils/supabase/api";

export async function GET(req) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("id");
  if (!videoId) {
    return NextResponse.json(
      { error: "Video ID not provided" },
      { status: 400 }
    );
  }

  const { data: file, error: downloadError } = await supabase.storage
    .from("videos")
    .download(`lessons/${videoId}`);

  if (downloadError || !file) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  // Create a ReadableStream from the file
  const stream = new ReadableStream({
    start(controller) {
      const reader = file.stream().getReader();
      function pump() {
        reader.read().then(({ done, value }) => {
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(value);
          pump();
        });
      }
      pump();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": "inline",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
