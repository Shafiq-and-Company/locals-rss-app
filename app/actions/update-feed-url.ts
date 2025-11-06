"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateFeedUrl } from "@/lib/feeds";

export async function updateFeedUrlAction(formData: FormData) {
  const id = formData.get("feedId");
  const url = formData.get("url");

  if (typeof id !== "string" || id.trim().length === 0) {
    redirect("/sources?error=Missing+feed+identifier");
  }

  if (typeof url !== "string" || url.trim().length === 0) {
    redirect("/sources?error=Feed+URL+is+required");
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url.trim());
  } catch {
    redirect("/sources?error=Please+enter+a+valid+URL");
  }

  try {
    await updateFeedUrl(id, parsedUrl.toString());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update feed URL.";
    redirect(`/sources?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/", "page");
  revalidatePath("/sources", "page");
  redirect(`/sources?updated=${encodeURIComponent(id)}`);
}
