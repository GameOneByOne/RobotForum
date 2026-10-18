"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { parseProjectForm } from "@/lib/projects/plan";

export async function saveProject(
  _previous: { error: string },
  form: FormData,
): Promise<{ error: string }> {
  let slug: string;
  try {
    if (!hasSupabaseEnv()) throw new Error("项目保存暂不可用，请稍后再试。");
    const input = parseProjectForm(form);
    const user = await requireCurrentUser();
    const rawId = form.get("projectId");
    const id = typeof rawId === "string" && rawId ? rawId : null;
    if (
      id &&
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      )
    )
      throw new Error("项目标识无效。");
    const client = await createClient();
    const { data, error } = await client
      .rpc("save_project_plan", {
        p_project_id: id,
        p_project: {
          ...input,
          authorName: user.displayName || user.email.split("@")[0] || "Member",
        },
      })
      .single<{ project_id: string; project_slug: string }>();
    if (error || !data) {
      console.error("Project save failed", error?.code, error?.message);
      throw new Error("项目保存失败，请检查关联文章是否仍可用后重试。");
    }
    slug = data.project_slug;
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "项目保存失败，请稍后重试。",
    };
  }
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${slug}`);
  revalidatePath("/search");
  redirect(`/projects/${encodeURIComponent(slug)}`);
}
