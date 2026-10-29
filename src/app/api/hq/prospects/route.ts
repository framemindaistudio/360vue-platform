import { NextResponse } from "next/server";
import { apiEditor, apiUser } from "@/lib/hq/auth";
import { apiError } from "@/lib/hq/api";
import { SALES_SIDE } from "@/lib/hq/roles";
import { addFound, addManual, convertProspect, importCsv, placeCenter, readPlace, summary, updateProspect } from "@/lib/hq/prospects";

/** Saving a list to the data repository can take a few seconds. */
export const maxDuration = 30;

/**
 * Lead finder.
 * GET → counts for every place · GET ?city= → that place's list
 * POST { action: "center" | "add" | "import" | "update" | "convert", city, … }
 *   (the browser searches OpenStreetMap itself — see lib/osm-leads.ts — and sends what it found with "add")
 */
export async function GET(req: Request) {
  const { error } = await apiUser(SALES_SIDE);
  if (error) return error;
  try {
    const city = new URL(req.url).searchParams.get("city");
    if (!city) return NextResponse.json({ summary: await summary() });
    const { file } = await readPlace(city);
    return NextResponse.json({ place: file });
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: Request) {
  const { user, error } = await apiEditor(SALES_SIDE);
  if (error) return error;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const city = String(body.city ?? "");
    switch (body.action) {
      case "center":
        return NextResponse.json(await placeCenter(city, user.name));
      case "add":
        return NextResponse.json(await addFound(city, body.found, user.name));
      case "manual":
        return NextResponse.json({ prospect: await addManual(city, (body.business as Record<string, unknown>) ?? {}, user.name) });
      case "import":
        return NextResponse.json(await importCsv(city, String(body.csv ?? "").slice(0, 2_000_000), user.name));
      case "update":
        return NextResponse.json({ prospect: await updateProspect(city, String(body.id ?? ""), { status: body.status as string | undefined, notes: body.notes as string | undefined, owner: body.owner as string | undefined }, user.name) });
      case "convert":
        return NextResponse.json(await convertProspect(city, String(body.id ?? ""), user.name));
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (e) {
    return fail(e);
  }
}

function fail(e: unknown) {
  if (e instanceof Error && /^(Unknown location|Business not found|Nothing to add|No “name”|The file needs|Could not locate|OpenStreetMap is busy)/.test(e.message)) return NextResponse.json({ error: e.message }, { status: 400 });
  return apiError(e);
}
