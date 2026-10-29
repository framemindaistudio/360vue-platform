"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useCollection } from "@/components/hq/data";
import type { BaseRecord } from "@/lib/hq/collections";
import { site } from "@/lib/site";
import { toIso } from "./util";

const subscribe = () => () => {};

/** A value that only exists in the browser (today's date, window origin…). Returns `server` during SSR and hydration. */
export function useClientValue<T>(get: () => T, server: T): T {
  return useSyncExternalStore(subscribe, get, () => server);
}

/** Local "YYYY-MM-DD" for today, or "" until the browser has hydrated. */
export const useToday = () => useClientValue(() => toIso(new Date()), "");

/** Current month key "YYYY-MM", or "" until hydrated. */
export const useThisMonth = () => useClientValue(() => toIso(new Date()).slice(0, 7), "");

const norm = (v: unknown) => String(v ?? "").trim().toLowerCase().replace(/\s+/g, " ");

/**
 * Everyone who can have a visiting card or an ID card: the founders from the company profile (src/lib/site.ts),
 * then the active people in Team & Payroll. A founder who is also in Team & Payroll appears once, from the team
 * record (which may carry a photo, phone and emergency contact).
 */
export function usePrintPeople() {
  const { records, loading, error } = useCollection("team");
  const people = useMemo(() => {
    const team = records.filter((r) => r.status !== "inactive");
    const founders: BaseRecord[] = site.founders
      .filter((f) => !records.some((m) => m.founderId === f.id || norm(m.name) === norm(f.name)))
      .map((f) => ({ id: `founder-${f.id}`, name: f.name, role: f.role, type: "Full-time", status: "active" }) as BaseRecord);
    return [...founders, ...team];
  }, [records]);
  return { people, loading, error };
}
