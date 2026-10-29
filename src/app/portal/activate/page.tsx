import { Suspense } from "react";
import type { Metadata } from "next";
import { ActivateForm } from "@/components/portal/ActivateForm";

export const metadata: Metadata = { title: "Set your password" };

export default function ActivatePage() {
  return (
    <Suspense fallback={null}>
      <ActivateForm />
    </Suspense>
  );
}
