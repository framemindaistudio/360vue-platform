# 360VUE — website and HQ

**See Every Angle.** 360° virtual tours, photography and immersive experiences.

One codebase, **two websites**, one deployment (the same architecture as FrameMind and JOVE, with its own data):

| | What | Where |
|---|---|---|
| 🌐 **Public website** | Home (video hero, live 360° demo viewer, service reels), Services & packages, Industries, Demo tours, How it works, About, FAQs, Get a Quote. The quote form files its enquiry straight into HQ. | `/` on **360vue.website** |
| 🛠 **360VUE HQ** | The internal operations portal | `/hq` (optionally `hq.360vue.website`) |

The public site lives in `src/app/(site)` and `src/components/site`; its pictures and clips are in `public/media`, the 4K logo kit in `public/brand/kit`. Package prices on the site are read from HQ's Rate Card (cached 10 minutes, refreshed at once when the Rate Card is saved).

HQ is a separate company with separate data. It has its own session cookie (`vue360_hq`), its own private data repository, and refuses to read or write if `GITHUB_REPO` points at a FrameMind or JOVE repository (`src/lib/store/index.ts → pointsAtOtherCompany`).

| Area | Modules |
|---|---|
| Overview | Command Center, Tasks, Activity Log |
| Sales | Enquiries, Clients CRM, Quotes (tour packages and add-ons from the Rate Card) |
| Delivery | Projects (the eight-step tour workflow, milestones, handover), Production, Capture Days (call sheets, restricted areas, backups), Travel, Feedback & Testimonials |
| Brand & social | Social Studio (designs, plan, captions, founders' plans) |
| Money | Finance (invoices per milestone, expenses, GST, CA pack), Rate Card, Team & Payroll, Business Planner |
| Legal | Documents to Sign (client services agreement, statements of work, change requests, handover, NDAs, offer letters, releases) |
| Kit | Gear & Assets, Tools & Vendors |
| Knowledge | Presentations, Operations Library, Printables, File Vault, Brand Kit |

## Two repositories: code and data

| Repository | Visibility | Holds |
|---|---|---|
| **`360vue-platform`** (this one) | **Public** | Only the website and HQ **code** and public media. Vercel deploys from it. No passwords, no company data. |
| `360vue-hq-data` | **private** | HQ's database: `data/*.json`, `data/ratecard.json`, `OPERATIONS/` (company profile, SOPs, capture playbook, pricing, legal, 90-day plan) and `vault/`. |

There is no database server. HQ reads and writes the private data repo through the GitHub API, so every save is a commit with history. In development, without `GITHUB_*` variables, it uses the local `data/`, `OPERATIONS/`, `vault/` and `secure/` folders (all gitignored).

## Run it locally

```bash
npm install
npm run dev
```

The website opens on http://localhost:3012 and HQ on http://localhost:3012/hq. Logins come from `HQ_USERS` in `.env.local`; create them with `node scripts/make-hq-env.mjs --generate --local`.

## Deploy on Vercel

1. Import this repo in Vercel (framework: Next.js, root directory: the repo root).
2. Create a fine-grained GitHub token with access to `360vue-hq-data` only: **Contents: Read and write**.
3. Vercel → Project → Settings → Environment Variables → import `.env.vercel` (made by `node scripts/make-hq-env.mjs`), and paste the token after `GITHUB_TOKEN=`.
4. Vercel → Project → Domains: add `360vue.website` and `www.360vue.website` (redirect one to the other); optionally `hq.360vue.website`, which opens HQ.
5. Deploy, sign in at `/hq`, then fill **Settings** (legal name, address, contact, GSTIN, Udyam, bank/UPI, SAC code) and confirm the **Rate Card**.

Optional env vars: `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_PHONE`, `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_LOCATION`, `NEXT_PUBLIC_INSTAGRAM`, `NEXT_PUBLIC_LINKEDIN`, `NEXT_PUBLIC_YOUTUBE` (shown on the website only when set), `NEXT_PUBLIC_LEGAL_NAME`.

Add or remove one login later with `node scripts/hq-user.mjs`.

## Brand assets

- `scripts/brand-assets.py` rebuilds every logo file from the Higgsfield renders (kept out of git in `.assets-raw/`). The wordmark is set in Montserrat by the script, so the letters are always exact.
- Website photographs and clips are AI-generated illustrations of example spaces. The site labels them as illustrative; never present them as client work.

## Where things are

- `src/lib/content/catalog.ts` — the starting rate card (packages from the company profile) and the commercial terms.
- `src/lib/site.ts` — the company profile used by the site, papers and prints.
- `src/lib/site-content.ts` — the website's industries, features and FAQs.
- `src/lib/hq/collections.ts` — every HQ record type and its fields.
- `src/components/site/PanoViewer.tsx` — the 360° viewer (three.js).
