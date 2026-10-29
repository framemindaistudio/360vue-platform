import { NextResponse } from "next/server";
import { apiEditor, apiUser } from "@/lib/hq/auth";
import { apiError } from "@/lib/hq/api";
import { OPS } from "@/lib/hq/roles";
import { approvePayment, clarifyPayment, pendingPayments } from "@/lib/hq/payment-approval";
import { PortalError } from "@/lib/portal/auth";

/** GET → payments waiting for review · POST { action: "approve" | "clarify", invoiceId, paymentId, note? } */
export async function GET() {
  const { error } = await apiUser(OPS);
  if (error) return error;
  try {
    return NextResponse.json({ payments: await pendingPayments() });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  const { user, error } = await apiEditor(OPS);
  if (error) return error;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const invoiceId = String(body.invoiceId ?? "");
    const paymentId = String(body.paymentId ?? "");
    if (body.action === "approve") return NextResponse.json(await approvePayment(invoiceId, paymentId, user.name));
    if (body.action === "clarify") {
      await clarifyPayment(invoiceId, paymentId, String(body.note ?? ""), user.name);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    if (e instanceof PortalError) return NextResponse.json({ error: e.message }, { status: e.status });
    return apiError(e);
  }
}
