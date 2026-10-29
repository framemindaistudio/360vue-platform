import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PricingBooklet } from "@/components/hq/printables/booklets/PricingBooklet";
import { FeaturesBooklet } from "@/components/hq/printables/booklets/FeaturesBooklet";
import { IndustriesBooklet } from "@/components/hq/printables/booklets/IndustriesBooklet";
import { flatten, type SearchParams } from "@/components/hq/printables/util";

const BOOKLETS = { pricing: PricingBooklet, features: FeaturesBooklet, industries: IndustriesBooklet };
type Kind = keyof typeof BOOKLETS;

export async function generateMetadata({ params }: { params: Promise<{ kind: string }> }): Promise<Metadata> {
  const { kind } = await params;
  return { title: `${kind.charAt(0).toUpperCase()}${kind.slice(1)} booklet` };
}

/** /hq/print/brochures/booklet/<pricing|features|industries>?mode=print|read&for=… — 8-page A4 booklets. */
export default async function Page({ params, searchParams }: { params: Promise<{ kind: string }>; searchParams: Promise<SearchParams> }) {
  const { kind } = await params;
  if (!(kind in BOOKLETS)) notFound();
  const q = flatten(await searchParams);
  const Booklet = BOOKLETS[kind as Kind];
  return <Booklet mode={q.mode === "read" ? "read" : "print"} preparedFor={(q.for ?? "").trim().slice(0, 80) || undefined} />;
}
