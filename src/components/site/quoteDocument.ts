/**
 * The quote a visitor downloads from the price configurator: a branded A4 page written into a new window and printed,
 * so the browser's "Save as PDF" makes the file. No PDF library, and it looks the same in every browser.
 */
import { site } from "@/lib/site";
import { TERMS } from "@/lib/content/catalog";

export interface QuoteDoc {
  quoteNo: string;
  date: Date;
  validityDays: number;
  name: string;
  business: string;
  phone: string;
  email: string;
  space: string;
  lines: { label: string; price: number }[];
  included: string[];
  discount: { label: string; amount: number } | null;
  taxable: number;
  gstPercent: number;
  gst: number;
  total: number;
  hosting: string;
  /** page 2: the problem we solve and how a visitor uses what they are buying, per service */
  stories?: { name: string; problem: string; solution: string; journey: string[]; benefits: string[] }[];
  /** page 2: extras they did not pick, so they know what they can add later */
  optional?: { label: string; detail?: string; price: number; unit?: string }[];
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const day = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export function quoteHtml(q: QuoteDoc, origin: string) {
  const valid = new Date(q.date.getTime() + q.validityDays * 86_400_000);
  const contact = [site.contact.phone, site.contact.email, site.website.replace(/^https?:\/\//, "")].filter(Boolean).map(esc).join(" &nbsp;·&nbsp; ");
  const rows = q.lines.map((l) => `<tr><td>${esc(l.label)}</td><td class="r">${inr(l.price)}</td></tr>`).join("");
  return `<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><title>${esc(q.quoteNo)} — 360VUE quote for ${esc(q.name)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Montserrat,'Segoe UI',Helvetica,Arial,sans-serif;color:#1a140e;background:#e9e2d6;-webkit-print-color-adjust:exact;print-color-adjust:exact;font-size:12.5px;line-height:1.5}
.page{width:210mm;min-height:297mm;margin:0 auto;background:#fff;position:relative;overflow:hidden}
.head{background:#0e0b08;color:#f9f5ed;padding:14mm 16mm 12mm;position:relative}
.head:after{content:"";position:absolute;right:-30mm;top:-30mm;width:110mm;height:110mm;border-radius:50%;background:radial-gradient(circle,rgba(245,158,76,.35),transparent 65%)}
.brand{display:flex;align-items:center;gap:4mm;position:relative;z-index:1}
.brand img{width:16mm;height:16mm}
.word{font-weight:800;font-size:22pt;letter-spacing:.01em;line-height:1}
.vue{background:linear-gradient(180deg,#fad696,#e8a854 45%,#a4622c);-webkit-background-clip:text;background-clip:text;color:transparent}
.tag{font-size:6.5pt;letter-spacing:.42em;color:#ebd6b5;margin-top:1.5mm;font-weight:600}
.meta{position:absolute;right:16mm;top:15mm;text-align:right;z-index:1}
.meta b{display:block;font-size:7pt;letter-spacing:.25em;color:#f59e4c;font-weight:700}
.meta span{font-size:11pt;font-weight:700}
.for{margin-top:8mm;position:relative;z-index:1}
.for small{font-size:7pt;letter-spacing:.25em;color:#ebd6b5;font-weight:700}
.for h1{font-size:20pt;font-weight:700;margin-top:1mm}
.for p{color:rgba(249,245,237,.7);font-size:9.5pt}
.body{padding:9mm 16mm 22mm}
.space{border:1px solid #e6d8c2;background:#fbf7f0;border-radius:3mm;padding:4mm 5mm;font-size:10pt}
.space b{font-size:7pt;letter-spacing:.2em;color:#9a5a31;display:block;margin-bottom:1mm}
table{width:100%;border-collapse:collapse;margin-top:7mm}
th{text-align:left;font-size:7pt;letter-spacing:.2em;color:#84705c;border-bottom:1.5px solid #1a140e;padding:0 0 2mm}
td{padding:1.8mm 0;border-bottom:1px solid #eee3d3;font-size:10.5pt}
.r{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.tot td{border:none;padding:1.4mm 0}
.tot .big td{font-size:14pt;font-weight:800;border-top:1.5px solid #1a140e;padding-top:3mm}
.disc td{color:#9a5a31}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:8mm;margin-top:9mm}
h3{font-size:7.5pt;letter-spacing:.22em;color:#9a5a31;margin-bottom:2mm}
ul{list-style:none}li{padding:.8mm 0 .8mm 4.5mm;position:relative;font-size:9.5pt}
li:before{content:"";position:absolute;left:0;top:2.6mm;width:2mm;height:2mm;border-radius:50%;background:#f59e4c}
.inc{margin-top:7mm}.two{columns:2;column-gap:8mm}.two li{break-inside:avoid;font-size:9pt}
.note{font-size:8.5pt;color:#5a4a3a;margin-top:2mm}
.foot{position:absolute;left:16mm;right:16mm;bottom:10mm;border-top:1px solid #e6d8c2;padding-top:3mm;display:flex;justify-content:space-between;font-size:8pt;color:#84705c}
.page2{min-height:0;break-before:page;margin-top:6mm}
.page2 .body{padding:12mm 16mm 6mm;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.story{break-inside:avoid}
.foot2{margin:0 16mm;padding:3mm 0 8mm;border-top:1px solid #e6d8c2;display:flex;justify-content:space-between;font-size:8pt;color:#84705c}
.p2h{font-size:17pt;font-weight:800;line-height:1.15}
.p2h span{color:#c47a36}
.story{margin-top:7mm;border-top:1.5px solid #1a140e;padding-top:4mm}
.story h2{font-size:8pt;letter-spacing:.24em;color:#9a5a31;font-weight:800}
.ps{display:grid;grid-template-columns:1fr 1fr;gap:5mm;margin-top:3mm}
.ps div{border-radius:3mm;padding:3.5mm 4.5mm;font-size:9.5pt}
.ps .pb{background:#f4efe7}.ps .sol{background:#0e0b08;color:#f9f5ed}
.ps b{display:block;font-size:6.5pt;letter-spacing:.22em;margin-bottom:1mm;color:#9a5a31}.ps .sol b{color:#f59e4c}
.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm;margin-top:4mm;counter-reset:s}
.steps div{border:1px solid #e6d8c2;border-radius:3mm;padding:3mm;font-size:8.6pt;line-height:1.4;counter-increment:s}
.steps div:before{content:counter(s);display:block;width:6mm;height:6mm;border-radius:50%;background:linear-gradient(135deg,#f7cf8a,#e39b4a 50%,#a8622b);color:#0e0b08;font-weight:800;font-size:8pt;text-align:center;line-height:6mm;margin-bottom:1.5mm}
.ben{display:grid;grid-template-columns:1fr 1fr;gap:0 6mm;margin-top:3mm}
.opt td{font-size:9.5pt;padding:2mm 0}.opt small{display:block;color:#84705c;font-size:8pt}
.bar{text-align:center;padding:5mm}
.bar button{font:inherit;font-weight:700;background:linear-gradient(135deg,#f7cf8a,#e39b4a 50%,#a8622b);color:#0e0b08;border:0;border-radius:99px;padding:3mm 8mm;cursor:pointer}
@media print{body{background:#fff}.bar{display:none}.page{margin:0}}
</style></head><body>
<div class="bar"><button onclick="window.print()">Save as PDF / Print</button></div>
<div class="page">
 <div class="head">
  <div class="brand"><img src="${origin}/brand/emblem-512.png" alt=""><div><div class="word">360<span class="vue">VUE</span></div><div class="tag">SEE EVERY ANGLE.</div></div></div>
  <div class="meta"><b>QUOTE</b><span>${esc(q.quoteNo)}</span><div style="font-size:8.5pt;color:rgba(249,245,237,.65);margin-top:1mm">${day(q.date)} · valid until ${day(valid)}</div></div>
  <div class="for"><small>PREPARED FOR</small><h1>${esc(q.name)}</h1><p>${[q.business, q.phone, q.email].filter(Boolean).map(esc).join(" · ")}</p></div>
 </div>
 <div class="body">
  <div class="space"><b>YOUR SPACE</b>${esc(q.space)}</div>
  <table><thead><tr><th>YOUR QUOTE</th><th class="r">AMOUNT</th></tr></thead><tbody>${rows}</tbody></table>
  <table class="tot"><tbody>
   ${q.discount ? `<tr class="disc"><td>${esc(q.discount.label)}</td><td class="r">− ${inr(q.discount.amount)}</td></tr>` : ""}
   ${q.gstPercent > 0 ? `<tr><td>Subtotal (before GST)</td><td class="r">${inr(q.taxable)}</td></tr>
   <tr><td>GST ${q.gstPercent}%</td><td class="r">${inr(q.gst)}</td></tr>` : `<tr><td>No GST — 360VUE is not GST-registered</td><td class="r">₹0</td></tr>`}
   <tr class="big"><td>Total</td><td class="r">${inr(q.total)}</td></tr>
  </tbody></table>
  ${q.hosting ? `<p class="note">After the first 12 months: ${esc(q.hosting)}</p>` : ""}
  <div class="inc"><h3>PAYMENT &amp; TERMS</h3><ul class="two">
    <li>50% advance confirms your capture date</li>
    <li>50% before final handover or activation</li>
    <li>This is an estimate from the details you entered; we confirm the scenes and price after seeing the space</li>
    <li>Travel within 25 km included</li>
    <li>${esc(TERMS.google)}</li>
  </ul></div>
 </div>
 <div class="foot"><span>${esc(q.quoteNo)} · ${esc(q.name)}</span><span>${contact}</span></div>
</div>
${page2(q, contact)}
<script>setTimeout(function(){window.print()},700)</script>
</body></html>`;
}

/** Page 2: what problem this solves, how a visitor uses it, what the business gets, and extras they can still add. */
function page2(q: QuoteDoc, contact: string) {
  const stories = q.stories ?? [];
  const optional = q.optional ?? [];

  const story = (s: NonNullable<QuoteDoc["stories"]>[number]) => `<div class="story"><h2>${esc(s.name.toUpperCase())}</h2>
   <div class="ps"><div class="pb"><b>THE PROBLEM</b>${esc(s.problem)}</div><div class="sol"><b>WHAT WE DO</b>${esc(s.solution)}</div></div>
   <h3 style="margin-top:4mm">HOW YOUR CUSTOMER USES IT</h3>
   <div class="steps">${s.journey.map((j) => `<div>${esc(j)}</div>`).join("")}</div>
   <h3 style="margin-top:4mm">WHAT YOU GET OUT OF IT</h3>
   <ul class="ben">${s.benefits.map((b) => `<li>${esc(b)}</li>`).join("")}</ul></div>`;
  return `<div class="page page2">
 <div class="body">
  <p class="p2h">What you get, <span>and how it helps you.</span></p>
  <div class="story"><h2>INCLUDED IN YOUR QUOTE</h2><ul class="two" style="margin-top:2mm">${q.included.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
  ${stories.map(story).join("")}
  ${optional.length ? `<div class="story"><h2>YOU CAN ALSO ADD — NOW OR LATER</h2>
   <table class="opt" style="margin-top:2mm"><tbody>${optional.map((o) => `<tr><td>${esc(o.label)}${o.detail ? `<small>${esc(o.detail)}</small>` : ""}</td><td class="r">${inr(o.price)}${esc(o.unit ?? "")}</td></tr>`).join("")}</tbody></table></div>` : ""}
 </div>
 <div class="foot2"><span>${esc(q.quoteNo)}</span><span>${contact}</span></div>
</div>`;
}

/** Writes the quote into a window opened during the click (so it is not blocked) and prints it. */
export function openQuoteDocument(q: QuoteDoc, win: Window | null) {
  const html = quoteHtml(q, window.location.origin);
  const w = win ?? window.open("", "_blank");
  if (!w) {
    // pop-ups blocked: download the page instead
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    a.download = `${q.quoteNo}.html`;
    a.click();
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
