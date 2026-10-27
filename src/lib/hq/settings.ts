/** Company settings stored in data/settings.json (object, not array). Editable in HQ → Settings. */
export interface CompanySettings {
  legalName: string;
  brandName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  gstin: string;
  pan: string;
  sacCode: string;
  /** Udyam (MSME) registration number, printed on the letterhead, quotes and invoices when set */
  udyamNumber: string;
  bankAccountName: string;
  bankName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  upiId: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  proposalPrefix: string;
  nextProposalNumber: number;
  poPrefix: string;
  nextPoNumber: number;
  orderPrefix: string;
  nextOrderNumber: number;
  financialYear: string;
  signatoryName: string;
  signatoryTitle: string;
  invoiceTerms: string;
  baseLocation: string;
  monthlyRevenueTarget: number;
  projectsPerMonthTarget: number;
  fuelCostPerKm: number;
  /** who receives the morning email, separated by commas (empty: no email) */
  digestEmails: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const defaultSettings: CompanySettings = {
  legalName: "360VUE",
  brandName: "360VUE",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  stateCode: "",
  pincode: "",
  phone: "+91 78993 04889",
  email: "framemindaistudio@gmail.com",
  website: "360vue.website",
  gstin: "",
  pan: "",
  // the SAC code for 360° tours and photography: confirm it with your CA, then set it in Settings
  sacCode: "",
  udyamNumber: "",
  bankAccountName: "",
  bankName: "",
  bankAccountNumber: "",
  bankIfsc: "",
  upiId: "",
  invoicePrefix: "VUE/26-27/",
  nextInvoiceNumber: 1,
  proposalPrefix: "VUE-Q-",
  nextProposalNumber: 1,
  poPrefix: "VUE-PO-",
  nextPoNumber: 1,
  // order numbers (spare series)
  orderPrefix: "VUE-OR-",
  nextOrderNumber: 1,
  financialYear: "2026-27",
  signatoryName: "Hrishikesh Kulkarni",
  signatoryTitle: "Founder",
  invoiceTerms:
    "Payment as agreed in the quote — 50% advance to confirm the booking and 50% before final handover or activation. Hosting and maintenance are billed separately. Bank transfer / UPI to the account below. Prices in INR.",
  baseLocation: "",
  monthlyRevenueTarget: 0,
  projectsPerMonthTarget: 0,
  fuelCostPerKm: 9,
  digestEmails: "",
};

export const SETTINGS_PATH = "data/settings.json";
