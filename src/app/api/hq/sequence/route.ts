import { NextResponse } from "next/server";
import { apiEditor } from "@/lib/hq/auth";
import { apiError } from "@/lib/hq/api";
import { nextSequence } from "@/lib/hq/records";
import { OPS } from "@/lib/hq/roles";

/** POST { kind: "invoice" | "proposal" | "po" | "order" } → { value } */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const kind = body.kind as string;
  if (!["invoice", "proposal", "po", "order"].includes(kind)) return NextResponse.json({ error: "Unknown sequence" }, { status: 400 });
  const { user, error } = await apiEditor(OPS);
  if (error) return error;
  try {
    const value = await nextSequence(kind as "invoice" | "proposal" | "po" | "order", user.name);
    return NextResponse.json({ value });
  } catch (e) {
    return apiError(e);
  }
}
