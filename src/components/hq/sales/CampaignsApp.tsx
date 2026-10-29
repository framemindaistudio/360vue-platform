"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Megaphone } from "lucide-react";
import { CollectionManager } from "@/components/hq/CollectionManager";
import { PageHeader } from "@/components/hq/ui";
import { api, useCollection } from "@/components/hq/data";
import type { CountedSlot } from "@/lib/campaigns";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

type Stats = Record<string, { total: number; used: number; left: number; full: boolean; counted: CountedSlot[] }>;

const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));
const day = (iso: string) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");

function Meter({ used, total }: { used: number; total: number }) {
  const pct = total ? Math.min(100, Math.round((used / total) * 100)) : 0;
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-graphite/10" role="progressbar" aria-valuenow={used} aria-valuemin={0} aria-valuemax={total} aria-label="Slots used">
      <div className="h-full rounded-full bg-lime transition-[width]" style={{ width: `${pct}%` }} />
    </div>
  );
}

/** HQ → Campaigns: create launch offers (Founding 100 and the next ones) and watch their slots fill. */
export function CampaignsApp() {
  const campaigns = useCollection("campaigns");
  const [stats, setStats] = useState<Stats>({});
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api<{ stats: Stats }>("/api/hq/campaigns")
      .then((j) => setStats(j.stats))
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load the slot counts."));
  }, []);
  useEffect(() => {
    load();
  }, [load, campaigns.records]);

  const live = campaigns.records.filter((c) => str(c.status) === "live");

  return (
    <div>
      <PageHeader
        eyebrow="Sales"
        icon="Megaphone"
        title="Campaigns"
        description="Launch offers with a limited number of slots. A slot is used when a campaign project's advance is approved — matched to the bank in Finance → Invoices → Record payment. The website counter updates by itself."
      />
      {error && <p className="mb-4 rounded border border-bad/30 bg-bad/10 px-3 py-2 text-sm text-bad">{error}</p>}

      {live.length > 0 && (
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          {live.map((c) => {
            const st = stats[c.id];
            const slug = str(c.slug);
            return (
              <section key={c.id} className="rounded-[var(--radius-md)] border border-graphite/15 bg-paper-50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="annot text-blueprint">Live campaign</p>
                    <h2 className="mt-1 text-xl font-semibold text-graphite">
                      {str(c.name)} · {Number(c.discountPercent) || 0}% off
                    </h2>
                  </div>
                  <Megaphone className="size-6 text-blueprint" aria-hidden />
                </div>
                {st ? (
                  <>
                    <p className="mt-4 text-3xl font-semibold tabular text-graphite">
                      {st.left} <span className="text-base font-normal text-charcoal">of {st.total} slots left</span>
                    </p>
                    <div className="mt-2">
                      <Meter used={st.used} total={st.total} />
                    </div>
                    <p className="mt-2 text-xs text-charcoal">
                      {st.used} used{st.full ? " — full: the website now says all slots are taken" : ""}
                    </p>
                    {st.counted.length > 0 && (
                      <ol className="mt-4 max-h-56 divide-y divide-graphite/10 overflow-y-auto rounded border border-graphite/10 bg-white text-sm">
                        {st.counted.map((x, i) => (
                          <li key={x.key} className="flex items-center justify-between gap-3 px-3 py-2">
                            <span>
                              <span className="mr-2 font-mono text-xs text-blueprint">#{i + 1 + (st.used - st.counted.length)}</span>
                              {x.projectId ? (
                                <a href={`/hq/projects/${x.projectId}`} className="font-medium hover:underline">
                                  {x.title}
                                </a>
                              ) : (
                                <span className="font-medium">{x.title}</span>
                              )}
                            </span>
                            <span className="shrink-0 text-xs text-charcoal">
                              {day(x.approvedAt)}
                              {x.approvedBy ? ` · ${x.approvedBy}` : ""}
                            </span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </>
                ) : (
                  <p className="mt-4 text-sm text-charcoal">Counting slots…</p>
                )}
                {slug && c.showOnWebsite !== false && (
                  <a href={`${site.website}/offers/${slug}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blueprint hover:underline">
                    View the offer page <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                )}
              </section>
            );
          })}
        </div>
      )}

      <CollectionManager
        name="campaigns"
        defaults={{ status: "draft", discountPercent: 40, serviceIds: ["tours"], totalSlots: 100, usedBefore: 0, showOnWebsite: true }}
        newLabel="New campaign"
        emptyText="Create your first launch offer — e.g. Founding 100: 40% off the first 100 tour projects."
        extraColumns={[
          {
            key: "slots",
            label: "Slots left",
            render: (r) => {
              const st = stats[r.id];
              return st ? <span className={cn("tabular", st.full && "text-bad")}>{st.full ? "Full" : `${st.left} / ${st.total}`}</span> : "—";
            },
            sortValue: (r) => stats[r.id]?.left ?? 0,
          },
        ]}
        drawerExtra={(r) => {
          const st = r.id ? stats[String(r.id)] : undefined;
          return (
            <section className="mt-6 rounded-[var(--radius-md)] border border-graphite/15 bg-paper-50 p-5">
              <p className="annot mb-2 text-blueprint">How slots are counted</p>
              <p className="text-sm text-charcoal">
                Pick this campaign on a quote (Quotes → Discounts → Campaign). The project and its invoices carry it. When you record the client&apos;s advance and tick
                <strong> “matched to bank”</strong>, that project uses one slot — once, however many payments follow. A refunded payment frees the slot.
              </p>
              {st && (
                <div className="mt-4">
                  <p className="mb-1 text-sm font-semibold text-graphite">
                    {st.used} of {st.total} used · {st.left} left
                  </p>
                  <Meter used={st.used} total={st.total} />
                </div>
              )}
            </section>
          );
        }}
      />
    </div>
  );
}
