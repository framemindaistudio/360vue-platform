/**
 * The rate card: every price 360VUE's founders control from HQ → Money → Rate Card.
 *
 * One JSON document in the private data repository (data/ratecard.json) with two parts:
 *
 *   RATES    what clients pay — every service with its groups and options, the multi-service and plan-length
 *            discounts and the standard terms. Everyone who
 *            prepares or reads a quote receives this part.
 *
 *   PLANNER  what running 360VUE costs and what it aims for — monthly fixed costs, one-time setup budget,
 *            targets, revenue streams and the share of each service's price 360VUE keeps. Private: only the
 *            roles that see Finance receive it.
 *
 * Quotes copy the prices they use at the moment they are made, so changing a rate never changes a quote already sent.
 */
import type { Service } from "@/lib/content/catalog";

export interface SocialContract {
  months: number;
  label: string;
  discountPercent: number;
  badge?: string;
}

export interface BundleStep {
  services: number;
  discountPercent: number;
}

export interface Milestone {
  label: string;
  percent: number;
}

export interface QuoteTerms {
  validityDays: number;
  revisionRounds: number;
  milestones: Milestone[];
}

export interface RateCard {
  gstPercent: number;
  services: Service[];
  socialContracts: SocialContract[];
  bundleSteps: BundleStep[];
  terms: QuoteTerms;
}

export interface MoneyLine {
  id: string;
  label: string;
  amount: number;
}

export interface RevenueStream {
  id: string;
  name: string;
  model: string;
  potential: string;
  stage: string;
}

export interface PlanTargets {
  monthlyRevenue: number;
  projectsPerMonth: number;
  avgProjectValue: number;
  /** hosting & care plans running at once, and the average monthly fee of one */
  socialRetainers: number;
  avgRetainer: number;
  /** month-on-month growth of the project count, in percent, for the 12-month projection */
  growthPercent: number;
}

/** Planning assumptions behind HQ → Business Planner. Private. */
export interface PlannerBook {
  /** monthly fixed costs (rent, tools, salaries…) */
  fixedCosts: MoneyLine[];
  /** one-time setup and gear budget */
  capex: MoneyLine[];
  targets: PlanTargets;
  streams: RevenueStream[];
  /** the share of each service's price 360VUE keeps after direct costs, in percent: keys are service ids */
  margins: Record<string, number>;
}

export interface PriceBook {
  version: 1;
  rates: RateCard;
  planner: PlannerBook;
  updatedAt?: string;
  updatedBy?: string;
}
