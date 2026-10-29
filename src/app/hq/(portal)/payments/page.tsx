import type { Metadata } from "next";
import { requireUser } from "@/lib/hq/auth";
import { OPS } from "@/lib/hq/roles";
import { PaymentApprovals } from "@/components/hq/finance/PaymentApprovals";

export const metadata: Metadata = { title: "Payment approvals" };

export default async function PaymentsPage() {
  await requireUser(OPS);
  return <PaymentApprovals />;
}
