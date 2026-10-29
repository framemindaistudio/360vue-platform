import { NextResponse } from "next/server";
import { apiEditor, apiUser } from "@/lib/hq/auth";
import { apiError } from "@/lib/hq/api";
import { SALES_SIDE } from "@/lib/hq/roles";
import { convertProspect, fetchFromOsm, importCsv, readPlace, summary, updateProspect } from "@/lib/hq/prospects";

/** OpenStreetMap can take a while to answer for a big city. */
export const maxDuration = 60;

/**
 * Lead finder.
 * GET → counts for every place · GET ?city= → that place's list
 * POST { action: "fetch" | "import" | "update" | "convert", city, … }
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
      case "fetch":
        return NextResponse.json(await fetchFromOsm(city, user.name));
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
  if (e instanceof Error && /^(Unknown location|Business not found|No “name”|The file needs|Could not locate|OpenStreetMap is busy)/.test(e.message)) return NextResponse.json({ error: e.message }, { status: 400 });
  return apiError(e);
}
