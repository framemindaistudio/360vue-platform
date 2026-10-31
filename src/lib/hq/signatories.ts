import { site } from "@/lib/site";
import type { CompanySettings } from "./settings";

export interface DocSignatory {
  name: string;
  title: string;
}

/**
 * Who signs 360VUE's printed documents (invoices, receipts, quotes, purchase orders, payslips).
 *
 * 360VUE is a partnership firm with two equal partners, so by default both sign: the Founder and the Co-Founder, in
 * that order. Settings → Company → "Both partners sign" off falls back to the one signatory named in Settings.
 */
export function docSignatories(s: Pick<CompanySettings, "signBoth" | "signatoryName" | "signatoryTitle">): DocSignatory[] {
  if (s.signBoth !== false) return site.founders.map((f) => ({ name: f.name, title: f.role }));
  return [{ name: s.signatoryName || "Authorised signatory", title: s.signatoryTitle || "Authorised signatory" }];
}
