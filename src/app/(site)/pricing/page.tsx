import type { Metadata } from "next";
import { Suspense } from "react";
import { PriceConfigurator } from "@/components/site/PriceConfigurator";
import { PricingFromQuery } from "@/components/site/PricingFromQuery";
import { CtaBand, PageHero } from "@/components/site/bits";
import { publicRateCard } from "@/lib/public-rates";

export const metadata: Metadata = {
  title: "Pricing — build your 360° tour quote",
  description: "Enter your space — area in sq ft or sq m, floors and rooms — and see the price of your 360° virtual tour or SkyVUE aerial 360° instantly, with a downloadable PDF quote.",
  alternates: { canonical: "/pricing" },
};

export const revalidate = 600;

export default async function PricingPage() {
  const rates = await publicRateCard();
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title={<>Your space. <span className="text-gold-grad">Your exact price.</span></>}
        intro="Tell us the size of your space, how many floors and rooms it has, and pick what you need. The price updates as you go — then download your quote as a PDF."
      />
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<PriceConfigurator rates={rates} />}>
            <PricingFromQuery rates={rates} />
          </Suspense>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
