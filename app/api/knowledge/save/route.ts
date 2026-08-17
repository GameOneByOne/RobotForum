import { NextResponse } from "next/server";

import { saveKnowledgeUpdate } from "@/lib/knowledge/actions";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await saveKnowledgeUpdate(formData);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "保存失败",
      },
      { status: 400 },
    );
  }
}
