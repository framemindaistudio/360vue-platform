import { portalApiUser } from "@/lib/portal/auth";
import { clientInvoice, PortalError } from "@/lib/portal/data";
import { invoiceTotalsWithPayments } from "@/lib/hq/collections";
import { site } from "@/lib/site";

/**
 * GET ?id= → the signed-in client's own invoice as a printable page (with its payments as a receipt section).
 * "Save as PDF" in the browser makes the file. Another client's invoice is "not found", never shown.
 */
const esc = (v: unknown) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
const inr = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const day = (d: unknown) => (d ? new Date(String(d)).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "");

export async function GET(req: Request) {
  const { user, error } = await portalApiUser();
  if (error) return new Response("Please sign in to your 360VUE portal again.", { status: 401 });
  try {
    const { inv, settings } = await clientInvoice(user, new URL(req.url).searchParams.get("id") || "");
    const t = invoiceTotalsWithPayments(inv);
    const items = Array.isArray(inv.items) ? (inv.items as Record<string, unknown>[]) : [];
    const pays = (Array.isArray(inv.payments) ? (inv.payments as Record<string, unknown>[]) : []).filter((p) => p.refunded !== true);
    const gstOn = t.gstPercent > 0;
    const from = [settings.legalName || site.name, settings.addressLine1, settings.addressLine2, [settings.city, settings.state, settings.pincode].filter(Boolean).join(", "), settings.phone, settings.email, gstOn && settings.gstin ? `GSTIN ${settings.gstin}` : ""].filter(Boolean);
    const payTo = [settings.upiId && `UPI: ${settings.upiId}`, settings.bankAccountName && `A/c name: ${settings.bankAccountName}`, settings.bankName && `Bank: ${settings.bankName}`, settings.bankAccountNumber && `A/c no.: ${settings.bankAccountNumber}`, settings.bankIfsc && `IFSC: ${settings.bankIfsc}`].filter(Boolean);
    const html = `<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(gstOn ? "Tax invoice" : "Invoice")} ${esc(inv.number)} — ${esc(site.name)}</title>
<style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{font-family:Montserrat,'Segoe UI',Arial,sans-serif;color:#1a140e;margin:0;background:#efe8dc;font-size:13px;line-height:1.5}
.page{max-width:820px;margin:16px auto;background:#fff;padding:36px 40px}.top{display:flex;justify-content:space-between;gap:24px;border-bottom:2px solid #1a140e;padding-bottom:16px}
.brand{font-weight:800;font-size:26px}.brand span{color:#b46a2c}h1{font-size:13px;letter-spacing:.25em;color:#9a5a31;margin:0 0 6px}
table{width:100%;border-collapse:collapse;margin-top:20px}th{text-align:left;font-size:11px;letter-spacing:.15em;color:#84705c;border-bottom:1px solid #1a140e;padding:6px 0}td{padding:8px 0;border-bottom:1px solid #eee3d3}
.r{text-align:right}.tot td{border:none;padding:3px 0}.big td{font-size:16px;font-weight:800;border-top:2px solid #1a140e;padding-top:8px}.muted{color:#6b5a48;font-size:12px}
.box{margin-top:20px;background:#fbf7f0;border:1px solid #e6d8c2;border-radius:8px;padding:12px 14px}.bar{text-align:center;padding:12px}.bar button{font:inherit;font-weight:700;background:#e39b4a;border:0;border-radius:99px;padding:10px 22px;cursor:pointer}
@media print{body{background:#fff}.bar{display:none}.page{margin:0;padding:0}}</style></head><body>
<div class="bar"><button onclick="window.print()">Save as PDF / Print</button></div>
<div class="page">
<div class="top"><div><div class="brand">360<span>VUE</span></div><div class="muted">${from.map(esc).join("<br>")}</div></div>
<div class="r"><h1>${gstOn ? "TAX INVOICE" : "INVOICE"}</h1><div><b>${esc(inv.number)}</b></div><div class="muted">Date: ${esc(day(inv.date))}${inv.dueDate ? `<br>Due: ${esc(day(inv.dueDate))}` : ""}</div></div></div>
<div class="box"><b>Billed to</b><br>${esc(inv.customerName)}${inv.customerAddress ? `<br>${esc(inv.customerAddress)}` : ""}${inv.customerGstin ? `<br>GSTIN ${esc(inv.customerGstin)}` : ""}${inv.milestone ? `<br><span class="muted">For: ${esc(inv.milestone)}</span>` : ""}</div>
<table><thead><tr><th>Description</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Amount</th></tr></thead><tbody>
${items.map((it) => `<tr><td>${esc(it.description)}</td><td class="r">${esc(it.qty)}</td><td class="r">${inr(Number(it.rate) || 0)}</td><td class="r">${inr((Number(it.qty) || 0) * (Number(it.rate) || 0))}</td></tr>`).join("")}
</tbody></table>
<table class="tot"><tbody>
${t.discount ? `<tr><td>Discount</td><td class="r">− ${inr(t.discount)}</td></tr>` : ""}
${gstOn ? `<tr><td>Taxable value</td><td class="r">${inr(t.taxable)}</td></tr><tr><td>GST ${t.gstPercent}%</td><td class="r">${inr(t.gst)}</td></tr>` : ""}
<tr class="big"><td>Total</td><td class="r">${inr(t.total)}</td></tr>
<tr><td>Received</td><td class="r">${inr(t.paid)}</td></tr>
<tr><td><b>Balance due</b></td><td class="r"><b>${inr(t.balance)}</b></td></tr>
</tbody></table>
${gstOn ? "" : `<p class="muted">${esc(settings.legalName || site.name)} is not registered under GST, so no GST is charged on this invoice.</p>`}
${pays.length ? `<div class="box"><b>Payments received (receipt)</b><table><tbody>${pays.map((p) => `<tr><td>${esc(day(p.date))}${p.mode ? ` · ${esc(p.mode)}` : ""}${p.reference ? ` · ref. ${esc(p.reference)}` : ""}</td><td class="r">${inr(Number(p.amount) || 0)}${p.reconciled === true ? " ✓ confirmed" : " · being verified"}</td></tr>`).join("")}</tbody></table></div>` : ""}
${t.balance > 0 && payTo.length ? `<div class="box"><b>How to pay the balance</b><br>${payTo.map(esc).join("<br>")}<br><span class="muted">Please mention invoice ${esc(inv.number)} with your payment.</span></div>` : ""}
${settings.invoiceTerms ? `<p class="muted" style="margin-top:18px">${esc(settings.invoiceTerms)}</p>` : ""}
</div></body></html>`;
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store" } });
  } catch (e) {
    if (e instanceof PortalError) return new Response(e.message, { status: e.status });
    console.error("[portal invoice]", e instanceof Error ? e.message : e);
    return new Response("Could not open this invoice. Please try again.", { status: 500 });
  }
}
