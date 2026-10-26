/**
 * The founders' personal-brand plans for Social Studio: what each profile is for, who reads it, what to post,
 * when, the lines to start a post from, and what never to post.
 * Source: OPERATIONS/08_SOCIAL_MEDIA (content strategy: LinkedIn at three posts a week in the founder voice, Sunday
 * planning, the honesty reminder) and 01_BRAND (voice and tone).
 *
 * 360VUE is young. No line here assumes a client, a result, a number or a quote that does not exist yet; the few
 * that need something to have happened first say so in `after`. Names and roles are read from site.founders.
 */

export type FounderId = "hrishikesh" | "chinmay";
/** the "Posted from" value of the content plan for a founder's own profile */
export type FounderAccount = "Hrishikesh (personal)" | "Chinmay (personal)";

export interface Pillar {
  id: string;
  name: string;
  about: string;
  /** what to post under it */
  posts: string[];
}

export interface Slot {
  day: string;
  where: string;
  what: string;
}

export interface Prompt {
  /** a pillar id */
  pillar: string;
  /** the line a post starts from; the dots are where the founder carries on */
  text: string;
  /** set when the line may be used only once something has really happened */
  after?: string;
  /** a caution for this line */
  tip?: string;
}

export interface FounderPlan {
  id: FounderId;
  account: FounderAccount;
  /** what follows the role in the profile headline */
  headline: string;
  /** what the profile is for */
  purpose: string;
  readers: { who: string; wants: string }[];
  /** how it sounds */
  voice: string[];
  pillars: Pillar[];
  rhythm: Slot[];
  rhythmNote: string;
  prompts: Prompt[];
  /** what not to post */
  avoid: string[];
}

const READERS = [
  { who: "Restaurant, café and hotel owners", wants: "To see what a tour of a space like theirs looks like, and that you understand how customers choose a place." },
  { who: "Property developers, agents and showrooms", wants: "Proof that a tour is captured carefully and delivered on time." },
  { who: "Web designers, interior designers and consultants", wants: "A partner they can refer clients to without worrying." },
];

const VOICE = [
  "First person, from the site. Show the space, then say one thing about it.",
  "Precise about the craft of capture, without superlatives.",
  "Exact with numbers, and only real ones. A plan is written as a plan.",
];

const PILLARS: Pillar[] = [
  {
    id: "craft",
    name: "Capture craft",
    about: "How a space is planned, captured, stitched and connected.",
    posts: ["Where the viewpoints go, and why", "A before and after of a stitch", "Lighting a room for 360°", "What a capture day looks like"],
  },
  {
    id: "spaces",
    name: "Spaces worth seeing",
    about: "Why a customer's first look at a place matters, by industry.",
    posts: ["What diners look for before they book a table", "Why a banquet hall should be walked, not described", "How a showroom tour is different from a hotel tour"],
  },
  {
    id: "process",
    name: "How we work",
    about: "Scoping, pricing, privacy and delivery, told in the open.",
    posts: ["Why the scope comes before the price", "How we handle private areas and people", "What a client gets at delivery"],
  },
  {
    id: "studio",
    name: "Building 360VUE honestly",
    about: "Starting a tour business, told as it is.",
    posts: ["What you got wrong, and what you changed", "The gear in the bag this month", "A lesson from a capture"],
  },
];

const RHYTHM: Slot[] = [
  { day: "Mon", where: "LinkedIn", what: "Founder post: capture craft." },
  { day: "Wed", where: "Instagram", what: "A 10-second clip walking through a tour (client spaces only with approval)." },
  { day: "Fri", where: "LinkedIn", what: "Founder post: how we work, or the week in the open." },
  { day: "Daily", where: "All", what: "Ten minutes: answer every comment and message within 24 hours." },
  { day: "Sun", where: "HQ", what: "Choose next week's posts and put them in the plan." },
];

const PROMPTS: Prompt[] = [
  { pillar: "craft", text: "Where we put the viewpoints in a café, and why: ..." },
  { pillar: "craft", text: "Before and after: the same panorama, stitched and corrected: ...", after: "Only with the client's approval to show their space." },
  { pillar: "craft", text: "The one setting I check before every capture: ..." },
  { pillar: "spaces", text: "What customers want to see before they visit a restaurant: ..." },
  { pillar: "spaces", text: "A space that looks better in a tour than in photos, and why: ..." },
  { pillar: "process", text: "Why we write the scope before the price: ..." },
  { pillar: "process", text: "How we keep private areas private on a capture day: ..." },
  { pillar: "process", text: "What Google Maps publishing does, and what it does not promise: ..." },
  { pillar: "studio", text: "What I got wrong this week: ..." },
  { pillar: "studio", text: "The gear in the bag this month: ..." },
  { pillar: "studio", text: "Our first paid tour. What I learned: ...", after: "Only once the project has been delivered." },
];

const AVOID = [
  "A client's name, space or results before the client has approved it in writing.",
  "Any restricted area, a document, a screen, or a person who has not agreed to appear.",
  "A count of clients, tours or results before it is real. A plan is written as a plan.",
  "A testimonial, an award or press that does not exist.",
  "A promise of Google rankings, visits or sales.",
  "What things cost us, margins and planning numbers. They stay in HQ.",
  "Someone else's work as ours, and a competitor's name or a comparison.",
];

const plan = (id: FounderId, account: FounderAccount, role: string): FounderPlan => ({
  id,
  account,
  headline: `${role}, 360VUE · 360° virtual tours, photography and immersive experiences`,
  purpose:
    "This is where a business owner looks you up before letting 360VUE into their space. It should show the person behind the camera and the business: how you plan a capture, how carefully you treat a client's space, and that you tell the truth about what a young company has and has not done.",
  readers: READERS,
  voice: VOICE,
  pillars: PILLARS,
  rhythm: RHYTHM,
  rhythmNote: "LinkedIn carries two founder posts a week each. 360VUE's own channels keep their own cadence in the Plan tab.",
  prompts: PROMPTS,
  avoid: AVOID,
});

export const FOUNDER_PLANS: Record<FounderId, FounderPlan> = {
  hrishikesh: plan("hrishikesh", "Hrishikesh (personal)", "Founder"),
  chinmay: plan("chinmay", "Chinmay (personal)", "Co-Founder"),
};
export const FOUNDER_ORDER: FounderId[] = ["hrishikesh", "chinmay"];
