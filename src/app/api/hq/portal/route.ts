import { NextResponse } from "next/server";
import { apiEditor, apiUser } from "@/lib/hq/auth";
import { apiError } from "@/lib/hq/api";
import { getRecord, listRecords } from "@/lib/hq/records";
import { OPS, STAFF } from "@/lib/hq/roles";
import { mailReady, sendMail } from "@/lib/hq/mail";
import { INVITE_DAYS, inviteClient, PortalError, publicAccount, updatePortalAccounts } from "@/lib/portal/auth";
import { hqPortalView, portalEmail, publishUpdate, teamReply } from "@/lib/portal/data";
import { whatsappInvite } from "@/lib/hq/payment-approval";

/**
 * HQ's side of the client portal for one project.
 * GET ?project= → { accounts, updates, tickets, mail }
 * POST { action, project, … } → invite | pause | resume | publish | reply
 */
export async function GET(req: Request) {
  const { error } = await apiUser(STAFF);
  if (error) return error;
  try {
    const project = new URL(req.url).searchParams.get("project") || "";
    const v = await hqPortalView(project);
    return NextResponse.json({ ...v, accounts: v.accounts.map(publicAccount), mail: mailReady() });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  const { user, error } = await apiEditor(OPS);
  if (error) return error;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const projectId = String(body.project ?? "");
    const project = await getRecord("projects", projectId);
    if (!project) throw new PortalError("Project not found.", 404);
    switch (body.action) {
      case "invite": {
        const client = (await listRecords("clients")).find((c) => c.id === String(project.clientId ?? ""));
        if (!client) throw new PortalError("Link the project to a client first.");
        const email = String(body.email || client.email || "").trim();
        const name = String(body.name || client.contactName || client.name || "").trim();
        const g = await inviteClient({ email, name, clientId: client.id, projectId, freshLink: body.fresh === true }, user.name);
        let emailed = false;
        if (g.url && mailReady()) {
          const text = `Hello ${name || "there"},\n\nYour 360VUE client portal for "${String(project.title ?? "")}" is ready. Open the link below to choose your password — it works for ${INVITE_DAYS} days.`;
          await sendMail({ to: [g.email], subject: `Your 360VUE client portal — ${String(project.title ?? "")}`, text: `${text}\n\n${g.url}`, html: portalEmail("Your 360VUE client portal", text, { href: g.url, label: "Set your password" }) });
          emailed = true;
        }
        const phone = String(client.phone ?? "");
        return NextResponse.json({ ...g, emailed, whatsapp: g.url && phone ? whatsappInvite(phone, name || "there", g.url) : "" });
      }
      case "pause":
      case "resume": {
        const email = String(body.email ?? "").toLowerCase();
        await updatePortalAccounts(
          (list) => {
            const a = list.find((x) => x.email === email && x.projectIds.includes(projectId));
            if (!a) throw new PortalError("Login not found.", 404);
            a.disabled = body.action === "pause";
            a.updatedAt = new Date().toISOString();
            return list;
          },
          `Client portal: ${String(body.action)} ${email}`,
          user.name,
        );
        return NextResponse.json({ ok: true });
      }
      case "publish":
        return NextResponse.json({
          update: await publishUpdate(projectId, { title: String(body.title ?? ""), body: String(body.body ?? ""), previewUrl: String(body.previewUrl ?? ""), needsApproval: body.needsApproval === true, kind: String(body.kind ?? "") }, user.name),
        });
      case "reply":
        await teamReply(String(body.ticket ?? ""), String(body.text ?? ""), body.status ? String(body.status) : undefined, user.name);
        return NextResponse.json({ ok: true });
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (e) {
    if (e instanceof PortalError) return NextResponse.json({ error: e.message }, { status: e.status });
    return apiError(e);
  }
}
