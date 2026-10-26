/**
 * Careers: the kinds of work 360VUE hires for and the application form's questions.
 * Used by the public form handler and HQ → Enquiries, so the role names and choices are written once.
 * `hiring` is set by the founders when a role is really open; nothing is marked open by default.
 */

export type RoleId = "capture" | "editor" | "photo" | "video" | "social" | "business" | "operations" | "other";

/** The kinds of work 360VUE hires for, plus an open application. */
export const APPLY_ROLES: { id: RoleId; code: string; title: string; short: string; hiring: boolean }[] = [
  { id: "capture", code: "R-01", title: "360° Capture Operator", short: "Plan viewpoints and capture spaces on site, carefully and consistently", hiring: false },
  { id: "editor", code: "R-02", title: "Panorama Editor / Tour Builder", short: "Stitch, correct and connect panoramas into tested tours", hiring: false },
  { id: "photo", code: "R-03", title: "Interior Photographer", short: "Interiors, architecture and amenities, edited and delivered", hiring: false },
  { id: "video", code: "R-04", title: "Videographer / Video Editor", short: "Reels and showcase films of spaces — shoot, cut and grade", hiring: false },
  { id: "social", code: "R-05", title: "Social Media Executive", short: "Tour clips, before-and-afters and posts for 360VUE's channels", hiring: false },
  { id: "business", code: "R-06", title: "Business Development Executive", short: "Find businesses with great spaces, visit them and look after them", hiring: false },
  { id: "operations", code: "R-07", title: "Project Coordinator", short: "Capture dates, access, files and client updates on track", hiring: false },
  { id: "other", code: "R-00", title: "Something else", short: "Tell us the role you have in mind", hiring: false },
];

export const roleTitle = (id: unknown) => APPLY_ROLES.find((r) => r.id === id)?.title ?? "";

/** What each role is asked to tick. */
export const SKILLS: Record<RoleId, string[]> = {
  capture: ["360° cameras (Insta360 or similar)", "Tripod levelling", "Exposure and HDR", "Viewpoint planning", "Working in occupied spaces", "Drone (licensed)", "Two-wheeler / driving licence", "Kannada with clients"],
  editor: ["Panorama stitching", "Lightroom", "Photoshop retouching", "Blurring and privacy edits", "Tour platforms", "Google Street View publishing", "File management", "Quality checking"],
  photo: ["Interior photography", "Architectural photography", "Lighting", "Lightroom", "Photoshop retouching", "Twilight / exterior", "Product styling", "Drone (licensed)"],
  video: ["Camera operation", "Gimbal work", "Premiere Pro", "DaVinci Resolve", "After Effects", "Colour grading", "Sound and music", "Reels editing"],
  social: ["Content planning", "Canva", "Reels editing", "Instagram", "LinkedIn", "Analytics", "Paid ads", "Community management"],
  business: ["Sales calls", "Visiting businesses", "Proposals and quotes", "Spreadsheets or a CRM", "Google Maps prospecting", "Kannada with clients", "Partnerships", "Hospitality / real estate network"],
  operations: ["Project planning", "Client communication", "Scheduling capture days", "Spreadsheets", "Notion / Trello / Asana", "Invoicing basics", "File and backup management", "Documentation"],
  other: [],
};

/** Every role is open as any of these: the applicant picks one or more. */
export const ENGAGEMENT = ["Full-time", "Part-time", "Internship", "Freelance"];
export const WORK_MODE = ["On site (capture days)", "Remote", "Either"];
export const LANGUAGES = ["English", "Kannada", "Hindi", "Telugu", "Marathi", "Tamil"];
export const HEARD = ["Instagram", "LinkedIn", "WhatsApp", "A friend", "My college", "Google", "Other"];

/** The portfolio is the application for capture, photo and video work. */
export const linksRequired = (role: RoleId) => role === "capture" || role === "photo" || role === "video";

export interface Application {
  role: RoleId;
  roleOther: string;
  /** what they do now: "B.Sc Visual Media, 3rd year" or "Photographer at …" */
  current: string;
  student: boolean;
  experience: number;
  skills: string[];
  engagement: string[];
  workMode: string;
  languages: string[];
  links: string;
  startFrom: string;
  heardFrom: string;
}

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const pick = (v: unknown, allowed: string[]) => (Array.isArray(v) ? [...new Set(v.map(String).filter((x) => allowed.includes(x)))] : []);

/** Keeps only known choices and short text; anything else is dropped. */
export function cleanApplication(v: unknown): Application | undefined {
  if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
  const a = v as Record<string, unknown>;
  const role = APPLY_ROLES.find((r) => r.id === a.role)?.id;
  if (!role) return undefined;
  const years = Math.round(Number(a.experience) * 2) / 2;
  return {
    role,
    roleOther: role === "other" ? text(a.roleOther, 80) : "",
    current: text(a.current, 120),
    student: a.student === true,
    experience: Number.isFinite(years) ? Math.min(40, Math.max(0, years)) : 0,
    skills: pick(a.skills, SKILLS[role]),
    engagement: pick(a.engagement, ENGAGEMENT),
    workMode: WORK_MODE.includes(String(a.workMode)) ? String(a.workMode) : "",
    languages: pick(a.languages, LANGUAGES),
    links: text(a.links, 600),
    startFrom: /^\d{4}-\d{2}-\d{2}$/.test(String(a.startFrom)) ? String(a.startFrom) : "",
    heardFrom: HEARD.includes(String(a.heardFrom)) ? String(a.heardFrom) : "",
  };
}

/** The applied-for role as one line: "360° Capture Operator", or "Something else: Operations intern". */
export const appliedFor = (a: Pick<Application, "role" | "roleOther">) => (a.role === "other" ? `Something else${a.roleOther ? `: ${a.roleOther}` : ""}` : roleTitle(a.role));
