/**
 * One-tap contact links (call / WhatsApp / email) and polite first messages.
 * Indian numbers without a country code get +91.
 */

/** Digits with country code, e.g. "919876543210" — or "" when unusable. */
export function phoneDigits(phone: unknown) {
  let d = String(phone ?? "").replace(/\D/g, "");
  if (!d) return "";
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  if (d.length === 10) d = `91${d}`;
  return d.length >= 10 ? d : "";
}

export function telHref(phone: unknown) {
  const raw = String(phone ?? "").trim();
  if (!raw) return null;
  const d = phoneDigits(raw);
  return d ? `tel:+${d}` : `tel:${raw.replace(/[^\d+]/g, "")}`;
}

export function whatsappHref(phone: unknown, text: string) {
  const d = phoneDigits(phone);
  if (!d) return null;
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}

export function mailHref(email: unknown, subject?: string, body?: string) {
  const e = String(email ?? "").trim();
  if (!e || !/^\S+@\S+\.\S+$/.test(e)) return null;
  const q = new URLSearchParams();
  if (subject) q.set("subject", subject);
  if (body) q.set("body", body);
  const qs = q.toString().replace(/\+/g, "%20");
  return `mailto:${e}${qs ? `?${qs}` : ""}`;
}

export function firstName(name: unknown) {
  const n = String(name ?? "").trim();
  if (!n) return "";
  const parts = n.split(/\s+/);
  // skip honorifics like "Dr." / "Mrs."
  const first = /^(dr|mr|mrs|ms|miss|prof|sri|smt|shri)\.?$/i.test(parts[0]) && parts[1] ? `${parts[0]} ${parts[1]}` : parts[0];
  return first;
}

type IntroKind = "project" | "contact" | "careers" | "partner" | "client";

/**
 * A warm, short first message — used for WhatsApp and email bodies. It promises nothing 360VUE has not
 * published: a short call or site visit, a written scope, a clear price.
 * `applyingFor` is the role an applicant named, such as "360° Capture Intern".
 */
export function introMessage({ kind, name, organisation, sender, applyingFor }: { kind: string; name?: unknown; organisation?: unknown; sender: string; applyingFor?: string }) {
  const k = (["project", "contact", "careers", "partner", "client"].includes(kind) ? kind : "contact") as IntroKind;
  const hello = firstName(name) ? `Hi ${firstName(name)},` : "Hi,";
  const org = String(organisation ?? "").trim();
  const me = `this is ${sender} from 360VUE.`;
  switch (k) {
    case "careers":
      return `${hello} ${me} Thank you for applying${applyingFor ? ` for the ${applyingFor} role` : ""}. I've gone through what you sent and would like to know a little more about you and your work. Could we set up a short call this week?`;
    case "partner":
      return `${hello} ${me} Thank you for reaching out about working together. We work with web designers, interior designers and property consultants who want tours for their clients. Would a quick call this week suit you?`;
    case "project":
    case "client":
      return `${hello} ${me} Thank you for reaching out${org ? ` about ${org}` : ""}. Tell us a little about the space — the areas you'd like customers to see and roughly how big it is — and we'll send a written scope and a clear price. We can also visit to plan the capture. When would be a good time to talk?`;
    default:
      return `${hello} ${me} Thank you for getting in touch. How can we help? Happy to set up a quick call at a time that suits you.`;
  }
}

export function introSubject(kind: string, organisation?: unknown) {
  const org = String(organisation ?? "").trim();
  switch (kind) {
    case "careers":
      return "Your application to 360VUE";
    case "partner":
      return "Working together — 360VUE";
    case "project":
    case "client":
      return `Your virtual tour${org ? ` — ${org}` : ""} · 360VUE`;
    default:
      return "Thank you for contacting 360VUE";
  }
}
