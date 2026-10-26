/**
 * What a client signs: the Client Services Agreement (the standing terms), a Statement of Work for each project, a
 * Change Request when the scope moves, the Project Acceptance and Handover at the end, and the Testimonial Release.
 *
 * The commercial terms follow the 360VUE company profile: 50% advance to confirm the booking and 50% before final
 * handover or activation; the quote states viewpoints, areas, branding, embedding and publishing help, hosting
 * duration, revision rounds, travel, timeline, ownership, permitted use and retention of source files; property
 * permissions and privacy procedures are written; no search ranking or sales result from Google Maps is promised.
 * Figures that are the founders' choice are boxes; open points are in each template's "lawyer" list.
 */
import { b, brand, companyIntro, dateOf, docDate, fill, firstName, line, money, moneyWords, num, or, partySign, plain, studioSign, val } from "../text";
import type { SignField, SignTemplate } from "../types";
import { gstLine, hello, lawAndDisputes, otherSign, partyIntro, points, pointsOrLines, SEAT, SEAT_NOTE, tidy } from "./shared";

const clientSign = (ctx: Parameters<SignTemplate["build"]>[0], heading = "For the Client") => otherSign(ctx, heading, ctx.party.kind === "client" && !!ctx.party.person);

const PROJECT: SignField = { key: "project", label: "Project", kind: "text", from: "project.title|proposal.title", required: true, placeholder: "360° virtual tour — ground floor and terrace" };
const QUOTE_NO: SignField = { key: "quoteNo", label: "Quote number", kind: "text", from: "proposal.number", half: true };
const QUOTE_DATE: SignField = { key: "quoteDate", label: "Quote date", kind: "date", from: "proposal.date", half: true };

/* ───────────────────────────── 1 · client services agreement ───────────────────────────── */

export const clientServicesAgreement: SignTemplate = {
  id: "client-services-agreement",
  version: "1.0",
  title: "Client Services Agreement",
  name: "Services agreement",
  group: "clients",
  kind: "agreement",
  parties: ["client"],
  signs: "both",
  blurb: "The standing terms for all work with a client: fees and milestones, revisions, the client's inputs, ownership of the work, confidentiality, liability and ending. Each project then has its own Statement of Work.",
  when: "Before the first project with a client (once; each project adds a Statement of Work)",
  series: "CLI",
  source: "14_LEGAL/02_Client_Services_Agreement.md",
  keep: "Term + 8 years",
  initials: true,
  requiredForClients: true,
  lawyer: [
    "Liability cap (clause 11): the fees paid under the Statement of Work in the 12 months before the claim is a usual figure — confirm it.",
    "Use of the work (clause 8): the client gets a licence for the permitted use on the quote and 360VUE keeps copyright and the source files. Confirm the wording under the Copyright Act, 1957, and whether some clients should get an assignment instead.",
    "Capturing a property: confirm the owner's-permission wording, and how people who appear in public areas are handled under the Digital Personal Data Protection Act, 2023.",
    "Late payment: the agreement lets 360VUE hold the delivery; it adds no interest. Decide whether to add interest under the MSMED Act, 2006 (Udyam-registered suppliers have a statutory right to interest on payments delayed past 45 days).",
    SEAT_NOTE,
  ],
  fields: [
    { key: "paymentDays", label: "Invoices are paid within (days)", kind: "number", default: "7", half: true },
    { key: "feedbackDays", label: "Client feedback within (working days)", kind: "number", default: "3", half: true, help: "How long the client takes to review a stage before the timeline moves." },
    { key: "revisions", label: "Revision rounds", kind: "number", default: "2", half: true },
    { key: "radius", label: "Travel included within (km)", kind: "number", default: "25", half: true },
    { key: "retention", label: "Source files kept for (months)", kind: "number", default: "12", half: true },
    { key: "noticeDays", label: "Notice to end (days)", kind: "number", default: "15", half: true },
    { key: "portfolio", label: "Portfolio", kind: "select", default: "yes", half: true, options: [{ value: "yes", label: "360VUE may show the tour after delivery" }, { value: "no", label: "Client asked: no portfolio use" }] },
    SEAT,
  ],
  build(ctx) {
    const J = brand(ctx);
    const portfolio = val(ctx, "portfolio") !== "no";
    return [
      { t: "title", text: "Client Services Agreement" },
      { t: "p", text: `This Agreement is made on ${b(docDate(ctx))} between ${companyIntro(ctx)} ("${b(J)}"), a 360° virtual tour and visual production business, and ${partyIntro(ctx)} (the "${b("Client")}").` },
      {
        t: "clause",
        title: "What this Agreement covers",
        items: [
          `${J} captures the Client's physical spaces and delivers 360° virtual tours, panoramic and still photography, video and related immersive work. The work for each project — the areas and number of viewpoints, branding, embedding and publishing help, hosting, deliverables, timeline and price — is set out in a Statement of Work (or an accepted quote) that refers to this Agreement.`,
          "Where a Statement of Work and this Agreement differ, the Statement of Work applies for that project.",
        ],
      },
      {
        t: "clause",
        title: "Fees and payment",
        items: [
          `The Client pays the fees in the Statement of Work in the milestones it sets — usually 50% in advance to confirm the booking and 50% before final handover or activation. ${gstLine(ctx)}.`,
          `Invoices are paid within ${fill(ctx, "paymentDays", 10)} days by bank transfer or UPI. Prices are in Indian rupees.`,
          `The capture date is confirmed once the advance is received. If a payment is late, ${J} may hold the delivery or the activation of the tour, and the timeline moves by the time lost.`,
          `Travel beyond ${fill(ctx, "radius", 6)} km, additional areas or viewpoints, platform fees and any permits are charged only as the Statement of Work or a written approval sets out.`,
        ],
      },
      {
        t: "clause",
        title: "Access, permission and the capture day",
        items: [
          "The Client confirms that it owns or controls the space, or has the property owner's permission for the capture, and arranges access on the agreed date and time.",
          "The Client tells ${J} in advance which areas are restricted or private, gets the space ready (lights working, clutter cleared) and informs staff and visitors that a capture is taking place.".replace("${J}", J),
          `If the capture cannot go ahead on the day because access, readiness or permission is missing, ${J} may charge for the visit and the rescheduled date.`,
        ],
      },
      {
        t: "clause",
        title: "Privacy",
        items: [
          `${J} does not capture areas the Client has marked restricted. Before delivery it removes or blurs identifiable people and unintended sensitive information (documents, screens, number plates) where necessary.`,
          "Each party handles any personal data in the work only for the project, keeps it secure, and deletes it when it is no longer needed.",
        ],
      },
      {
        t: "clause",
        title: "Revisions and changes",
        items: [
          `The project includes ${fill(ctx, "revisions", 10)} rounds of revisions on the agreed viewpoints, hotspots, labels and edits, unless the Statement of Work says otherwise.`,
          `New areas, extra viewpoints, re-capture after changes to the space and other changes of scope are agreed in a written Change Request, with their cost and effect on the timeline, before ${J} does them.`,
        ],
      },
      {
        t: "clause",
        title: "Delivery and acceptance",
        items: [
          `${J} tests navigation, image clarity, mobile display, loading and links before delivery, and delivers the tour link, embed code and exports the Statement of Work lists. The Client accepts the delivery, or lists the faults against the agreed scope, within ${fill(ctx, "feedbackDays", 10)} working days.`,
          `Silence after that time counts as acceptance. ${J} fixes faults against the agreed scope at no charge.`,
        ],
      },
      {
        t: "clause",
        title: "Hosting and Google Maps",
        items: [
          "Hosting is for the period the Statement of Work states; it is not unlimited. Any renewal and its charge are agreed in writing before the period ends.",
          `Where the Statement of Work includes Google Street View publishing help, ${J} helps publish eligible panoramic content under Google's own terms. Google decides what it accepts and shows. ${J} does not promise any search ranking, visits or sales from publication.`,
        ],
      },
      {
        t: "clause",
        title: "Use of the work and source files",
        items: [
          `When the Client has paid in full for a project, the Client may use the final deliverables for the permitted use the Statement of Work states — usually on its own website, listings, Google Maps and social media, for as long as it likes. ${J} keeps the copyright, the raw captures and the source files.`,
          `${J} keeps the source files for ${fill(ctx, "retention", 6)} months after delivery, so that small updates can be made, and may delete them after that.`,
          "Until full payment the deliverables stay with 360VUE and the Client may not publish or use them. Music, fonts and platforms stay under their own licences.".replace("360VUE", J),
        ],
      },
      {
        t: "clause",
        title: "Portfolio",
        items: [
          portfolio
            ? `After delivery, ${J} may show the work, with the Client's name and logo, in its portfolio, sample tours and social media, without revealing anything confidential or anything from a restricted area. The Client may withdraw this permission for future use at any time in writing.`
            : `${J} will not show the Client's tour, photographs or name in its portfolio or social media without the Client's written permission.`,
        ],
      },
      {
        t: "clause",
        title: "Confidentiality",
        items: ["Each party keeps the other's confidential information secret, uses it only for the work, and returns or deletes it when the work ends. This lasts for 3 years after the last project, and without limit of time for personal data."],
      },
      {
        t: "clause",
        title: "Warranties and liability",
        items: [
          `${J} does the work with reasonable skill and care. It does not promise a particular business result, ranking, reach or revenue.`,
          `Neither party is liable for indirect or consequential loss, or for lost profits. ${J}'s total liability for a project is limited to the fees the Client paid for it in the 12 months before the claim.`,
        ],
      },
      {
        t: "clause",
        title: "Ending the work",
        items: [
          `Either party may end this Agreement, or a project, with ${fill(ctx, "noticeDays", 10)} days' written notice, or at once if the other commits a serious breach that it does not put right within 7 days of being told.`,
          `On ending, the Client pays for the work done and the costs committed up to that day, and ${J} delivers the work paid for.`,
        ],
      },
      { t: "clause", title: "Law and disputes", items: [lawAndDisputes(ctx, "This Agreement is"), "This Agreement, with its Statements of Work and Change Requests, is the whole agreement between the parties. A change to it is made in writing and signed by both."] },
      { t: "p", text: "Signed by the parties on the date first written above." },
      { t: "sign", blocks: [...studioSign(ctx), clientSign(ctx)] },
    ];
  },
  cover(ctx) {
    return plain(`${hello(ctx.party.person || ctx.party.name)}, attached is our Client Services Agreement — the standing terms for working together: payment, access to the space, privacy, hosting, and how you can use the tour. Please read it, sign and date the last page, initial the others and send us a scan. Happy to walk through any part of it on a call.`);
  },
};

/* ───────────────────────────── 2 · statement of work ───────────────────────────── */

export const statementOfWork: SignTemplate = {
  id: "statement-of-work",
  version: "1.0",
  title: "Statement of Work",
  name: "Statement of Work",
  group: "clients",
  kind: "agreement",
  parties: ["client"],
  signs: "both",
  blurb: "One project under the Client Services Agreement: what is delivered, the timeline, the price, the payment milestones, the revisions and the support period.",
  when: "When a quote is accepted, before the advance is invoiced",
  series: "CLI",
  source: "14_LEGAL/02_Client_Services_Agreement.md",
  keep: "Term + 8 years",
  initials: true,
  requiredForClients: true,
  lawyer: ["Where no Client Services Agreement is signed yet, the SOW says its terms apply: make sure the client has received it."],
  fields: [
    PROJECT,
    QUOTE_NO,
    QUOTE_DATE,
    { key: "deliverables", label: "Deliverables (one per line)", kind: "textarea", required: true, placeholder: "360° virtual tour — 12 viewpoints: entrance, dining hall, private dining, terrace\nNavigation hotspots and room labels\nBranded starting screen\nShareable link and website embed code" },
    { key: "excluded", label: "Not included (optional, one per line)", kind: "textarea", placeholder: "Kitchen and staff areas\nDrone footage" },
    { key: "start", label: "Start", kind: "date", from: "project.startDate", half: true },
    { key: "due", label: "Delivery date", kind: "date", from: "project.dueDate", half: true },
    { key: "fee", label: "Fee (before GST)", kind: "money", from: "project.agreedAmount|proposal.total", required: true, half: true },
    { key: "revisions", label: "Revision rounds", kind: "number", from: "proposal.revisionRounds", default: "2", half: true },
    { key: "capture", label: "Capture date", kind: "date", half: true },
    { key: "hosting", label: "Hosting included", kind: "text", placeholder: "12 months from activation", default: "As in the quote", half: true },
    { key: "use", label: "Permitted use", kind: "text", default: "The Client's website, listings, Google Maps and social media" },
    { key: "milestones", label: "Payment milestones (one per line)", kind: "textarea", default: "50% — advance, to confirm the booking\n50% — before final handover or activation", help: "One line per milestone, as on the quote." },
    { key: "contact", label: "Client's contact for reviews", kind: "text", from: "client.contactName", half: true },
  ],
  build(ctx) {
    const J = brand(ctx);
    const excluded = points(ctx, "excluded");
    const ref = [val(ctx, "quoteNo") && `quote ${val(ctx, "quoteNo")}`, val(ctx, "quoteDate") && `dated ${dateOf(ctx, "quoteDate")}`].filter(Boolean).join(" ");
    return [
      { t: "title", text: "Statement of Work", sub: tidy(ctx, "project", 80) },
      { t: "p", text: `This Statement of Work is made on ${b(docDate(ctx))} between ${companyIntro(ctx)} ("${b(J)}") and ${partyIntro(ctx)} (the "${b("Client")}"), under the Client Services Agreement between them. ${ref ? `It follows ${ref}, which the Client accepted.` : ""}` },
      { t: "clause", title: "Deliverables", items: pointsOrLines(ctx, "deliverables", 4) },
      ...(excluded.length ? [{ t: "clause" as const, title: "Not included", items: excluded.map((x) => `${x}.`) }] : []),
      {
        t: "table",
        widths: [32, 68],
        rows: [
          ["Project", tidy(ctx, "project", 80)],
          ["Start", dateOf(ctx, "start")],
          ["Capture date", dateOf(ctx, "capture")],
          ["Delivery", `${dateOf(ctx, "due")}, provided access, approvals and payments are on time`],
          ["Fee", `${moneyWords(ctx, "fee")}, before GST`],
          ["Revisions", `${fill(ctx, "revisions", 10)} rounds`],
          ["Hosting", fill(ctx, "hosting", 60)],
          ["Permitted use", fill(ctx, "use", 70)],
          ["Client's contact", fill(ctx, "contact", 60)],
        ],
      },
      { t: "clause", title: "Payment milestones", items: [...pointsOrLines(ctx, "milestones", 2), `${gstLine(ctx)}. Each milestone is invoiced when it falls due.`] },
      { t: "clause", title: "Handover", items: [`On final payment ${J} delivers the tour link, embed code and agreed exports, and activates hosting for the period above. The Client uses the work as the Client Services Agreement sets out.`] },
      { t: "p", text: "Signed by the parties on the date first written above." },
      { t: "sign", blocks: [...studioSign(ctx), clientSign(ctx)] },
    ];
  },
  cover(ctx) {
    return plain(`${hello(ctx.party.person || ctx.party.name)}, attached is the Statement of Work for ${tidy(ctx, "project", 30)}: deliverables, timeline, price and milestones as in the quote you accepted. Please sign and send back a scan, and we will raise the advance invoice so we can start.`);
  },
};

/* ───────────────────────────── 3 · change request ───────────────────────────── */

export const changeRequest: SignTemplate = {
  id: "change-request",
  version: "1.0",
  title: "Change Request",
  name: "Change request",
  group: "clients",
  kind: "form",
  parties: ["client"],
  signs: "both",
  blurb: "Records a change to a project's scope — a new page or feature, a new direction after sign-off, extra revision rounds — with its cost and its effect on the timeline, before the work is done.",
  when: "Whenever the client asks for something outside the agreed scope",
  series: "CLI",
  source: "14_LEGAL/02_Client_Services_Agreement.md",
  keep: "Term + 8 years",
  lawyer: [],
  fields: [
    PROJECT,
    { key: "change", label: "The change asked for", kind: "textarea", required: true, placeholder: "Add the rooftop terrace: 4 more viewpoints\nRe-capture the lobby after the renovation" },
    { key: "cost", label: "Extra cost (before GST, 0 if none)", kind: "money", required: true, half: true },
    { key: "days", label: "Extra working days on the timeline", kind: "number", default: "0", half: true },
    { key: "newDue", label: "New delivery date (optional)", kind: "date", half: true },
  ],
  build(ctx) {
    const J = brand(ctx);
    const cost = num(ctx, "cost");
    return [
      { t: "title", text: "Change Request", sub: tidy(ctx, "project", 80) },
      { t: "p", text: `${partyIntro(ctx)} (the "${b("Client")}") asks ${J} to change the agreed scope of ${b(tidy(ctx, "project", 60))} as follows.` },
      { t: "clause", title: "The change", items: pointsOrLines(ctx, "change", 3) },
      {
        t: "table",
        widths: [36, 64],
        rows: [
          ["Extra cost", cost === 0 ? "None" : `${money(ctx, "cost")} before GST, invoiced with the next milestone`],
          ["Effect on the timeline", `${fill(ctx, "days", 10)} working days${val(ctx, "newDue") || ctx.blank ? `; new delivery date ${dateOf(ctx, "newDue")}` : ""}`],
        ],
      },
      { t: "p", text: `Everything else in the Statement of Work stays as it was. ${J} starts the change when this request is signed by both.` },
      { t: "sign", blocks: [clientSign(ctx, "Approved for the Client"), ...studioSign(ctx)] },
    ];
  },
  cover(ctx) {
    return plain(`${hello(ctx.party.person || ctx.party.name)}, as discussed, here is the change request for ${tidy(ctx, "project", 30)} with its cost and timeline. Sign it and we'll start on the change right away.`);
  },
};

/* ───────────────────────────── 4 · project acceptance and handover ───────────────────────────── */

export const projectAcceptance: SignTemplate = {
  id: "project-acceptance",
  version: "1.0",
  title: "Project Acceptance and Handover",
  name: "Acceptance & handover",
  group: "clients",
  kind: "form",
  parties: ["client"],
  signs: "both",
  blurb: "The client confirms the project was delivered and handed over: the deliverables, the source files and access, the walkthrough, and the start of the support period.",
  when: "At handover, with the final invoice",
  series: "CLI",
  source: "03_SOP/07_Delivery_and_Handover.md",
  keep: "Term + 8 years",
  lawyer: [],
  fields: [
    PROJECT,
    { key: "delivered", label: "Delivered (one per line)", kind: "textarea", required: true, placeholder: "360° tour live at the shared link\nEmbed code placed on www.example.com\n24 edited still photographs" },
    { key: "handed", label: "Handed over (one per line)", kind: "textarea", default: "Tour link and embed code\nFinal panoramas and photographs in the shared folder\nGoogle Maps publishing help, where included\nWalkthrough of the tour on a call" },
    { key: "supportUntil", label: "Support until (optional)", kind: "date", from: "project.supportUntil", half: true },
  ],
  build(ctx) {
    const J = brand(ctx);
    return [
      { t: "title", text: "Project Acceptance and Handover", sub: tidy(ctx, "project", 80) },
      { t: "p", text: `${partyIntro(ctx)} (the "${b("Client")}") confirms that ${J} has delivered and handed over ${b(tidy(ctx, "project", 60))}.` },
      { t: "h", text: "Delivered" },
      { t: "checks", items: pointsOrLines(ctx, "delivered", 4) },
      { t: "h", text: "Handed over" },
      { t: "checks", items: pointsOrLines(ctx, "handed", 4) },
      {
        t: "p",
        text: `With the final payment, the Client may use the work as the Client Services Agreement sets out. ${val(ctx, "supportUntil") || ctx.blank ? `Hosting and fixes for faults against the agreed scope continue until ${dateOf(ctx, "supportUntil")}. ` : ""}New areas, re-capture or changes after today are quoted separately.`,
      },
      { t: "fields", cols: 1, rows: [["Anything still open (write \"Nothing\" if there is nothing)", ""]] },
      { t: "sign", blocks: [clientSign(ctx, "Accepted for the Client"), ...studioSign(ctx)] },
    ];
  },
  cover(ctx) {
    return plain(`${hello(ctx.party.person || ctx.party.name)}, thank you for working with us on ${tidy(ctx, "project", 30)}! Attached is the handover note listing what was delivered and handed over. Please check it, sign and send it back with the final payment.`);
  },
};

/* ───────────────────────────── 5 · testimonial release ───────────────────────────── */

export const testimonialRelease: SignTemplate = {
  id: "testimonial-release",
  version: "1.0",
  title: "Testimonial and Name Release",
  name: "Testimonial release",
  group: "clients",
  kind: "declaration",
  parties: ["client", "other"],
  signs: "party",
  blurb: "A client allows 360VUE to publish their words, name, photo and logo as a testimonial.",
  when: "When a client gives a testimonial",
  series: "CLI",
  source: "12_CASE_STUDIES/01_Testimonials_and_Case_Studies.md",
  keep: "As long as the testimonial is used + 3 years",
  lawyer: [],
  fields: [{ key: "quote", label: "The testimonial (as they gave it)", kind: "textarea", required: true }],
  build(ctx) {
    const J = brand(ctx);
    return [
      { t: "title", text: "Testimonial and Name Release" },
      { t: "p", text: `${b(or(ctx.party.person || ctx.party.name, 60))}${ctx.party.person && ctx.party.name ? ` of ${b(ctx.party.name)}` : ""} gives ${J} the following testimonial:` },
      { t: "note", text: `“${val(ctx, "quote") || line(150)}”` },
      { t: "p", text: "Tick what you allow:" },
      { t: "checks", items: ["My words as above (lightly edited for length, never changed in meaning)", "My name and role", "My photograph", "The business's name and logo", "A video of me saying it"] },
      { t: "p", text: `${J} may use what is ticked on its website, social media, proposals and presentations. No payment is due for this use. I may withdraw this permission for future use at any time by writing to ${J}; it cannot recall what is already printed.` },
      { t: "sign", blocks: [partySign(ctx, "Signature", { lines: ["Date"] })] },
    ];
  },
  cover(ctx) {
    return plain(`${hello(ctx.party.person || ctx.party.name)}, thank you so much for the kind words! Before we share them, please tick what you're happy for us to use, sign and send back the attached release.`);
  },
};

export const CLIENT_DOCS: SignTemplate[] = [clientServicesAgreement, statementOfWork, changeRequest, projectAcceptance, testimonialRelease];

