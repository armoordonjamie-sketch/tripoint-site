# WEBSITE CONTEXT PROMPT — TRIPOINT DIAGNOSTICS FRONTEND

This is a universal reference prompt describing the **TriPoint Diagnostics website** in full: every page, every route, every service, how the tech works, how the design looks, how conversions happen, and where data lives.

Use this prompt to give any LLM complete context about the website when working on copy, development, SEO, analytics, content, or design tasks.

For the full **business** context (compliance rules, operating model, pricing policy, brand voice, customer journey, Google Ads strategy, and more), see the companion file: **`tpd-master-prompt.md`** in this same folder.

---

## 1) WEBSITE OVERVIEW

**Brand name:** TriPoint Diagnostics
**Tagline:** Mobile Vehicle Diagnostics & Repairs - Kent & SE London
**Site URL:** `https://tripointdiagnostics.co.uk`
**Description:** Dealer-level mobile diagnostics and compliant repairs for vans and cars across Kent and South East London. Compliance-first, no guesswork.

**Business model:** appointment-based, mobile-only, diagnostics-first vehicle diagnostics and selected repair/service business. Every job ends with a written outcome.

**Primary geography:** Kent and South East London (up to 60 minutes one-way drive time from the active base that week).

**Contact:**
* Phone: 020 8058 6095 (`+442080586095`)
* WhatsApp: via `wa.me` link (path: `message/NROKKGS6QK54G1`)
* Email: contact@tripointdiagnostics.co.uk

**Hours (public-facing):** Mon to Sat: 6 AM to 10 PM

**Legal entity:** Tripoint Diagnostics Ltd, Company No. 17038307, 476 Sidcup Road, Eltham, London

---

## 2) TECH STACK

| Layer | Technology | Version |
|-------|-----------|---------|
| UI framework | React | 19 |
| Language | TypeScript | 5.9 |
| Build tool | Vite | 7 |
| Vite plugin | `@vitejs/plugin-react` | — |
| Routing | `react-router-dom` | 7 |
| Styling | Tailwind CSS (via `@tailwindcss/vite`) | 4 |
| Forms | `react-hook-form` + `@hookform/resolvers` | — |
| Validation | Zod | 4 |
| Document head | `react-helmet-async` | — |
| Maps | Leaflet + `react-leaflet` (lazy-loaded) | — |
| Icons | `lucide-react` | — |
| Analytics | `react-ga4` | — |
| Utilities | `clsx` + `tailwind-merge` (via `cn()` helper) | — |

---

## 3) ARCHITECTURE

### Build pipeline

The site uses **SSG (static site generation)** for production and **SPA mode** in development.

**Production build (`build:ssg`):**
1. `optimize-images` — image compression
2. `vite build` — client bundle
3. `extract-routes` — generates `routes.manifest.json` from `src/routes.ts`
4. Second Vite build for SSR bundle (`entry-server.tsx` → `dist/server`)
5. `node scripts/prerender.mjs` — renders all indexable routes to static HTML, writes `404.html`, `sitemap.xml`, `robots.txt`

**Entry points:**
* `src/entry-client.tsx` — client bootstrap. Uses `createRoot` in dev, `hydrateRoot` in production (hydrates pre-rendered HTML). Initialises analytics, registers attribution capture, sets up `react-helmet-async`.
* `src/entry-server.tsx` — SSR render function for the prerender script.

**Dev proxy:**
Vite dev server proxies `/api`, `/media`, and `/webhooks` to `http://127.0.0.1:8000` (the backend).

**Path alias:** `@` maps to `src/` (configured in `tsconfig.app.json` and `vite.config.ts`).

### Source directory layout

```
src/
├── App.tsx              — Route table, lazy imports
├── routes.ts            — SEO route manifest, getSeoForPath()
├── entry-client.tsx     — Client bootstrap
├── entry-server.tsx     — SSR render
├── index.css            — Tailwind v4 theme, global styles
├── config/
│   ├── site.ts              — Brand, contact, zones, pricing, SEO defaults
│   ├── servicesCatalog.ts   — Service categories + items
│   └── analyticsPublic.ts   — GA4 measurement ID
├── data/
│   ├── areas.ts             — Per-town content for area pages
│   ├── blogPosts.ts         — Blog post content (HTML strings)
│   └── galleryImages.ts     — Photo gallery alt text + metadata
├── lib/
│   ├── analytics.ts         — GA4 init, event tracking functions
│   ├── attribution.ts       — gclid/UTM capture to localStorage + cookie
│   ├── utils.ts             — cn() class merge utility
│   └── useScrollReveal.ts   — Scroll animation hook
├── pages/
│   ├── HomePage.tsx, ServicesPage.tsx, PricingPage.tsx, etc.
│   ├── services/            — Service page components
│   ├── legal/               — Privacy, terms, disclaimer, accessibility
│   ├── areas-covered/       — CoveragePage, AreaPage
│   └── admin/               — Admin dashboard, reports, login
└── components/
    ├── Layout.tsx, Header.tsx, Footer.tsx
    ├── Seo.tsx, JsonLd.tsx, RouteTracker.tsx
    ├── MobileStickyCTA.tsx
    ├── ServicePicker.tsx, ServiceCard.tsx, ServiceIcons.tsx
    ├── PricingTable.tsx, ZoneCalculator.tsx
    ├── BookingScheduler.tsx
    ├── CoverageMap.tsx, TownChips.tsx
    ├── FaqAccordion.tsx
    ├── PhotoGallery.tsx
    ├── OptimizedImage.tsx, OptimizedLogo.tsx
    ├── CTAButton.tsx, Section.tsx, Notice.tsx
    └── TestimonialCard.tsx
```

---

## 4) DESIGN SYSTEM

**Aesthetic:** dark, premium, modern automotive. Not generic "mobile mechanic" branding.

**Key design tokens (from `src/index.css` Tailwind v4 `@theme`):**
* **Primary accent:** electric/bright blue (`--color-brand`)
* **Surfaces:** dark background palette (`--color-surface-*`)
* **Font:** Inter (loaded from Google Fonts in `index.html`)
* **Icons:** `lucide-react` line icons + custom SVG service icons (`ServiceIcons.tsx`)

**Utility function:** `cn()` in `src/lib/utils.ts` merges Tailwind classes via `clsx` + `tailwind-merge`.

**Animations:** scroll-reveal via `useScrollReveal` hook; keyframe animations defined in `index.css`.

**Blog styling:** blog post HTML content uses utility classes like `blog-lead`, `blog-image`, `blog-callout`, `blog-step`, `blog-divider`, `blog-takeaway` defined in `index.css`.

**Critical CSS:** `index.html` contains a small inline style for `[data-hero]` LCP optimisation. A Vite plugin (`asyncCssPlugin`) converts CSS `<link>` tags to non-blocking preload pattern in production.

---

## 5) SITE LAYOUT (SHARED CHROME)

All pages are wrapped in a `<Layout>` component that renders:

### Header
* Logo + "TriPoint Diagnostics" brand text
* **Services mega-menu** with three columns: Diagnostics, Servicing, Tuning (populated from `servicesCatalog.ts`)
* Nav links: Areas Covered, Pricing, Blog, About, Contact
* Action buttons: Call (phone link), WhatsApp, Book Now
* Mobile: hamburger drawer with same structure

### Footer
* "Ready to book?" strip with Book Online / WhatsApp / Call CTAs
* Brand blurb: "Dealer-level mobile diagnostics..."
* Service links grouped by category (Diagnostics, Servicing & Brakes, Tuning)
* Company links: About, Our Work, Blog, FAQ, Pricing, Process
* Legal links: Privacy Policy, Terms of Service, Disclaimer, Accessibility
* Contact block: phone, WhatsApp, email, hours, "Kent & SE London (up to 60 min radius)"
* Social: Google Reviews link
* Copyright with independence disclaimer

### MobileStickyCTA
* Fixed bottom bar on mobile: Call | WhatsApp | Book Now
* Hidden on the `/contact` page to avoid redundancy

### Layout-level JSON-LD
* `LocalBusinessSchema` (type: `AutoRepair`) — name, address, phone, hours, geo, service types, area served, price range
* `OrganizationWebsiteSchema` — Organization + WebSite with SearchAction

---

## 6) COMPLETE SITEMAP

### Marketing pages

| Route | Page | Priority |
|-------|------|----------|
| `/` | Home | 1.0 |
| `/services` | Services hub | 0.9 |
| `/pricing` | Pricing | 0.9 |
| `/areas-covered` | Coverage map + zones | 0.9 |
| `/about` | About TriPoint | 0.7 |
| `/process` | How We Work | 0.8 |
| `/faq` | FAQ (50+ questions, 8 categories) | 0.7 |
| `/booking` | Online booking | 0.9 |
| `/contact` | Contact form + quick actions | 0.8 |
| `/our-work` | Photo gallery | 0.7 |
| `/blog` | Blog index | 0.6 |

### Diagnostic service pages (indexable)

| Route | Page | Zone A |
|-------|------|--------|
| `/services/diagnostic-callout` | Standard Diagnosis | £120 |
| `/services/vor-van-diagnostics` | VOR Diagnosis (Commercial) | £160 |
| `/services/pre-purchase-digital-health-check` | Pre-Purchase Digital Health Check | £160 |

### Diagnostic redirect / merged routes (non-indexable, canonical → Standard Diagnosis)

These specialist topic URLs redirect to `/services/diagnostic-callout` with `?from=merged`:

* `/services/mercedes-xentry-diagnostics-coding`
* `/services/mobile-fault-finding`
* `/services/dpf-regeneration-and-diagnostics`
* `/services/adblue-scr-diagnostics`
* `/services/ecu-coding-and-variant-coding`
* `/services/emissions-diagnostics`
* `/services/sprinter-limp-mode`
* `/services/adblue-countdown`
* `/services/nox-scr-diagnostics`
* `/services/dpf-regeneration-decision`
* `/services/intermittent-electrical-faults`
* `/services/fleet-health-check`

Additional redirects:
* `/services/vor-triage` → `/services/vor-van-diagnostics`
* `/services/pre-purchase-health-check` → `/services/pre-purchase-digital-health-check`

### Mercedes van servicing pages

| Route | Page | Zone A |
|-------|------|--------|
| `/services/mercedes-van-servicing` | Mercedes Van Servicing (hub) | minor from £175 |
| `/services/sprinter-servicing` | Sprinter Servicing | minor from £175 |
| `/services/vito-servicing` | Vito Servicing | minor from £175 |
| `/services/citan-servicing` | Citan Servicing | minor from £175 |

### Mercedes van brake pages

| Route | Page | Zone A |
|-------|------|--------|
| `/services/sprinter-brakes` | Sprinter Brakes | from £149 |
| `/services/vito-brakes` | Vito Brakes | from £169 |
| `/services/citan-brakes` | Citan Brakes | from £169 |

### Commercial van tuning pages

| Route | Page | Zone A |
|-------|------|--------|
| `/services/van-load-driveability-tune` | Van Load & Driveability Tune | from £199 |
| `/services/van-economy-tune` | Van Economy Tune | from £199 |
| `/services/fleet-van-tuning` | Fleet Van Tuning | from £199 |

### Area pages (13 towns)

All follow the pattern `/areas-covered/:slug`:

`tonbridge`, `sevenoaks`, `bromley`, `bexley`, `greenwich`, `lewisham`, `dartford`, `orpington`, `sidcup`, `eltham`, `tunbridge-wells`, `maidstone`, `gravesend`

### Blog posts

| Route | Title |
|-------|-------|
| `/blog/om654-turbo-failure-sprinter-vito` | Why OM654 Turbochargers Are Failing in Mercedes Sprinter and Vito |
| `/blog/sprinter-limp-mode-proper-diagnostic` | Sprinter Limp Mode: What a Proper Diagnostic Looks Like |
| `/blog/adblue-countdown-clearing-codes-not-fix` | AdBlue Countdown: Why Clearing Codes Isn't a Fix |
| `/blog/dpf-warning-light-regen-vs-worse` | DPF Warning Lights: When Regen Helps vs When It Makes Things Worse |

### Payment and report routes (non-indexed)

| Route | Page |
|-------|------|
| `/pay/:token` | Payment page (deposit/balance via Stripe) |
| `/pay/:token/success` | Payment confirmation |
| `/report/:shareToken` | Shared diagnostic report viewer |

### Admin routes (non-indexed, cookie-auth)

| Route | Page |
|-------|------|
| `/admin/login` | Admin login |
| `/admin` | Admin dashboard |
| `/admin/reports` | Reports list |
| `/admin/reports/:reportId` | Report editor |

### Legal pages

| Route | Page |
|-------|------|
| `/legal/privacy-policy` | Privacy Policy |
| `/legal/terms` | Terms of Service |
| `/legal/disclaimer` | Disclaimer |
| `/legal/accessibility` | Accessibility Statement |

### Aliases

* `/areas` → `/areas-covered`
* `/coverage` → `/areas-covered`

### 404

* `*` (catch-all) → NotFoundPage (noindex)

---

## 7) PAGE-BY-PAGE CONTENT INVENTORY

### Home (`/`)

**H1:** "Mobile Vehicle Diagnostics & Repairs"
**Hero subtext:** dealer-level depth, written fix plans, Mercedes specialist
**Stats bar:** Mercedes Specialist | Up to 60 min drive | From £120

**Sections:**
1. **Our Services** — 4 lanes: Diagnostics, Servicing, Brakes, Tuning. Each with description, tags, "from £X" prices
2. **Sprinter Specialist banner** — "Mercedes Sprinter Expert"; W906/W907, OM651/654, SCR/AdBlue, DPF. CTA links to Standard Diagnosis
3. **How It Works** — 4 steps: Get in Touch → Confirm & Deposit → On-Site Diagnosis → Written Fix Plan
4. **Why TriPoint** — XENTRY & STAR; Mercedes-Benz trained; Clear communication; Mobile convenience
5. **Google Reviews** — "Happy with our service?" + link to Google review page
6. **Areas We Cover** — TownChips component + "View Full Coverage Map" link
7. **Our Work** — "Real Jobs, Real Photos" teaser grid (4 images)
8. **Latest Articles** — 3 most recent blog posts
9. **Pricing teaser** — transparent zone pricing; first 3 services from `siteConfig.pricing`
10. **FAQ teaser** — "50+ common questions" link
11. **Bottom CTA** — "Need help today?" Book / WhatsApp / Phone

**Structured data:** LocalBusiness + Organization + WebSite (from Layout)

---

### Services (`/services`)

**H1:** "Our Services"
**Subtitle:** dealer-level mobile work and booking
**Badges:** Fixed zone pricing | Kent & SE London | Mon-Sat 6-22

**Content:** `ServicePicker` component — tabbed view with 3 categories (Diagnostics / Servicing / Tuning), each listing services from `servicesCatalog.ts` with cards showing title, description, "from £X", and link.

**Footer links:** Book online, Zone pricing, FAQ
**Strip:** "Ready to book?" with phone/WhatsApp

---

### Standard Diagnosis (`/services/diagnostic-callout`)

**H1:** "Standard Diagnosis"
**Subtitle:** from £120 zone A | Mercedes cars & vans | All faults
**Merged-topic notice:** optional info banner when arrived from specialist redirect URLs (`?from=merged`)

**Sections:**
1. **How It Works** — 4 steps
2. **What We Diagnose** — warning lights, emissions/AdBlue/DPF, limp mode, electrical, Xentry/coding
3. **What's Included** — bullet list
4. **Pricing** — zone A/B/C table
5. **Examples From Our Work** — photo gallery
6. **Fleet & Commercial** — fleet-relevant messaging
7. **When We Refer to a Workshop** — mobile-safe boundary explanation
8. **FAQ** — service-specific questions
9. **Related Services** — VOR Diagnosis, Pre-Purchase

**Structured data:** ServiceSchema, BreadcrumbSchema, FaqPageSchema

---

### VOR Diagnosis (`/services/vor-van-diagnostics`)

**H1:** "VOR Diagnosis"
**Focus:** priority commercial triage, downtime cost, fleet/hire operators

**Sections:** why speed matters; who it's for; common scenarios; what's included (extends Standard + priority + 75 min); pricing; gallery; FAQ; related services

**Structured data:** ServiceSchema, BreadcrumbSchema, FaqPageSchema

---

### Pre-Purchase Digital Health Check (`/services/pre-purchase-digital-health-check`)

**H1:** "Pre-Purchase Digital Health Check"
**Focus:** buyer protection, used van due diligence

**Sections:** what could go wrong; sample findings; who it's for; when to book; what's included; what it isn't (not a full mechanical inspection); gallery; how it works; pricing; FAQ

**Structured data:** ServiceSchema, BreadcrumbSchema, FaqPageSchema

---

### Mercedes Van Servicing (`/services/mercedes-van-servicing`)

**H1:** "Mercedes Van Servicing" — Sprinter, Vito, Citan
**Focus:** dealer-level without the dealer; model matrix with links to sub-pages

**Sections:** model cards (Sprinter/Vito/Citan); dealer vs TriPoint comparison table; what every service includes; ASSYST/FSS explanation; minor from £175 / major from £295; how it works; zone pricing; FAQ; STAR/XENTRY notice

**Structured data:** ServiceSchema, BreadcrumbSchema, FaqPageSchema

---

### Model-specific servicing pages

**Sprinter Servicing** (`/services/sprinter-servicing`) — W906/W907 specific; minor/major lists; £175-£325 by zone
**Vito Servicing** (`/services/vito-servicing`) — W447 specific; minor/major packages
**Citan Servicing** (`/services/citan-servicing`) — W415/W420 specific; adds Renault-platform / Kangoo context

All follow the same pattern: hero, why specialist, what's included, pricing tables, FAQ, related services, workshop vs mobile boundaries.

---

### Brake pages

**Sprinter Brakes** (`/services/sprinter-brakes`) — "Sprinters eat brakes"; front pads from £149; pads+discs pricing; measurement-first approach
**Vito Brakes** (`/services/vito-brakes`) — workload focus; front pads from £169
**Citan Brakes** (`/services/citan-brakes`) — small van context; front pads from £169

All follow: hero, "we measure not guess", what's included, how it works, pricing, FAQ, cross-links to servicing/diagnostics.

---

### Tuning pages

**Van Load & Driveability Tune** (`/services/van-load-driveability-tune`) — better loaded pull; diagnostic pre-check; insurance declaration; before/after tables
**Van Economy Tune** (`/services/van-economy-tune`) — economy calibration; illustrative mpg/savings callouts; high-mileage focus
**Fleet Van Tuning** (`/services/fleet-van-tuning`) — 3+ vehicles; volume savings; depot days; documentation

All follow: work-van positioning (never boy-racer), diagnostic pre-check mandatory, insurance-declaration aware, original file backup, no guaranteed MPG claims.

---

### Pricing (`/pricing`)

**H1:** "Pricing"

**Sections:**
1. **ZoneCalculator** — postcode lookup → zone result via `/api/calculate-zone`
2. **Travel Zones** table — Zone A (0-25 min), B (25-45), C (45-60), Out of area (60+)
3. **PricingTable** — all services from `siteConfig.pricing.services` with zone A/B/C prices
4. **What's Included / Not Included** — bullet lists
5. **Deposits** — £30 Zone A/B, £50 Zone C/VOR; free reschedule with 24h notice; late cancellation/no-show retains deposit
6. **VOR priority notice**
7. **Book CTA**

---

### Areas Covered (`/areas-covered`)

**H1:** "Where We Cover"
**Stats:** 60 min radius | 2 bases | 13+ towns | Zones A-C

**Sections:**
1. **ZoneCalculator**
2. **CoverageMap** — Leaflet map (lazy-loaded)
3. **Operating Bases** — Tonbridge (TN9 1PP) and Eltham (SE9 4HA)
4. **Travel Zones** explanation
5. **Towns We Commonly Cover** — TownChips with links to area pages
6. **How zone is calculated**
7. **Coverage FAQ**
8. **Out-of-area notice**

---

### Area pages (`/areas-covered/:slug`)

**H1:** "Mobile Vehicle Diagnostics in {Town} | Mercedes Specialist"
**Content source:** `src/data/areas.ts` — per-town intro, included bullets, FAQs, nearby areas. Falls back to default template if no custom data.

**Sections:** intro paragraph; What's Included; Why Choose (4 cards); Popular Services (4 links); town-specific FAQs; "We Also Cover" nearby areas; Book strip

**13 towns:** Tonbridge, Sevenoaks, Bromley, Bexley, Greenwich, Lewisham, Dartford, Orpington, Sidcup, Eltham, Tunbridge Wells, Maidstone, Gravesend

---

### About (`/about`)

**H1:** "About TriPoint Diagnostics"

**Sections:**
1. **Why Mobile?** — convenience proposition
2. **Credibility** — Mercedes-Benz Truck & Van trained UK technician; independence disclaimer
3. **What Sets Us Apart** — 6 cards (XENTRY/STAR, written outcomes, compliance-first, etc.)
4. **Our Equipment & Setup** — PhotoGallery
5. **Our Approach** — numbered process steps
6. **Book CTA**

---

### Process (`/process`)

**H1:** "How We Work"

**Steps:**
1. Book + describe symptoms
2. On-site workflow (scan, live data, guided tests, isolate root cause)
3. Written report + options (fix-now / parts / workshop referral)

**Extras:** included vs not included; deposit info box; CTAs

---

### FAQ (`/faq`)

**H1:** "Frequently Asked Questions"
**Features:** search input; category filter pills

**8 categories:**
1. General
2. Booking & Pricing
3. Diagnostics & Process
4. Emissions, AdBlue & DPF
5. Mercedes & Sprinter Specialist
6. Coverage & Availability
7. Fleet & Commercial
8. Pre-Purchase Inspections

**Volume:** 50+ Q&As across all categories

**Structured data:** FaqPageSchema (full FAQ JSON-LD)

---

### Booking (`/booking`)

**H1:** "Book Online"
**Trust badges:** Mon-Sat 6-10 | Fixed zone pricing

**Content:** `BookingScheduler` component — multi-step flow:
1. Select service (fetches `/api/booking/services`)
2. Select date/time (fetches `/api/booking/availability`)
3. Confirm price (fetches `/api/booking/price`)
4. Reserve (POSTs to `/api/booking/reserve`)

**Fallback:** "Prefer to book by phone?" with phone and WhatsApp links

---

### Contact (`/contact`)

**H1:** "Contact"
**Intro:** Kent & SE London mobile diagnostics

**Quick actions:** Call, WhatsApp (recommended), Email, Book Now

**Form fields:**
* Name (required)
* Email (required)
* Phone (required)
* Postcode (required)
* Vehicle reg (optional)
* Message (required)
* Checkbox: safe working location

**Submit:** POSTs to `/api/contact/submit` with attribution data from `lib/attribution.ts`
**Success state:** 3 next steps + hours display

**Tips:** "For faster diagnosis, include:" postcode, reg, symptoms, drivable status, parking info

---

### Our Work (`/our-work`)

**H1:** "Our Work"
**Subtitle:** "Real photos... no stock photos."

**Filters:** All Work, Sprinter, Engine Bay, Diagnostics, Electrical, Emissions, Brakes, Faults Found, Tools & Equipment, Dashboard

**Content:** PhotoGallery component with images from `galleryImages.ts`

---

### Blog Index (`/blog`)

**H1:** "Blog"
**Subtitle:** "Technical insights..."
**Features:** category filter; featured post highlight + grid layout

**Structured data:** CollectionPage + BreadcrumbList

---

### Blog Posts (`/blog/:slug`)

4 published posts with long-form HTML content from `src/data/blogPosts.ts`:

1. **OM654 Turbo Failures** — workshop-level technical breakdown of turbo failures in W907 Sprinter and W447 Vito; root causes, symptoms, repair costs, prevention
2. **Sprinter Limp Mode** — common triggers, why code-clearing fails, what a proper diagnostic session involves
3. **AdBlue Countdown** — what triggers it, why it returns after clearing, what a proper decision visit does
4. **DPF Warning Lights** — forced regen vs passive, when regen is safe, when it masks deeper faults, diagnose-first approach

**Author:** TriPoint Diagnostics (all posts)
**Structured data:** Article-style content per post

---

### Payment Pages (non-indexed)

**`/pay/:token`** — fetches booking details from `/api/payments/:token/details`; shows deposit and balance payment options via Stripe checkout session URLs
**`/pay/:token/success`** — confirmation page; fires `trackPaymentSuccess()` analytics event on mount

---

### Report Viewer (non-indexed)

**`/report/:shareToken`** — fetches and displays a shared diagnostic report (vehicle info, faults, tests, media) from `/api/reports/share/:shareToken`

---

### Admin (non-indexed, credentials-based)

* `/admin/login` — staff login
* `/admin` — dashboard / bookings list
* `/admin/reports` — reports list
* `/admin/reports/:reportId` — report editor

All admin pages use `fetch('/api/admin/...')` with `credentials: 'include'`.

---

### Legal Pages

* **Privacy Policy** (`/legal/privacy-policy`) — GDPR-compliant; sections on data collected, GA4, Stripe, Google Calendar, etc. Last updated Feb 2026.
* **Terms of Service** (`/legal/terms`) — booking terms, deposits, service overview
* **Disclaimer** (`/legal/disclaimer`) — independent service disclaimer, diagnostic limitations, emissions compliance framing
* **Accessibility** (`/legal/accessibility`) — WCAG 2.1 AA aim, semantic HTML, feedback contact

---

### 404

**Catch-all `*`** — "Page not found" with links to Home and Contact. noindex.

---

## 8) SERVICE CATALOG

The service catalog (`src/config/servicesCatalog.ts`) is the single source of truth for the Services mega-menu and ServicePicker component. It defines three categories:

### Diagnostics

| Service | Description | Route | Zone A |
|---------|-------------|-------|--------|
| Standard Diagnosis | Full-system scan, live data, written outcome. Warning lights, limp mode, emissions, electrical. | `/services/diagnostic-callout` | £120 |
| VOR Van Diagnostics | Same-day priority triage for off-road commercial vans. | `/services/vor-van-diagnostics` | £160 |
| Pre-Purchase Digital Health Check | Full scan and condition report before you buy. | `/services/pre-purchase-digital-health-check` | £160 |

### Servicing

| Service | Description | Route | Zone A |
|---------|-------------|-------|--------|
| Mercedes Van Servicing | Minor and major packages - oil, filters, records. | `/services/mercedes-van-servicing` | £175 |
| Sprinter Servicing | W906 and W907 schedules at your location. | `/services/sprinter-servicing` | £175 |
| Vito Servicing | W447 planned maintenance. | `/services/vito-servicing` | £175 |
| Citan Servicing | W415 / W420 servicing. | `/services/citan-servicing` | £175 |
| Sprinter Brakes | Front and rear packages for W906 and W907. | `/services/sprinter-brakes` | £149 |
| Vito Brakes | W447 pads, discs, packaged pricing. | `/services/vito-brakes` | £169 |
| Citan Brakes | W415 / W420 mobile brake service. | `/services/citan-brakes` | £169 |

### Tuning

| Service | Description | Route | Zone A |
|---------|-------------|-------|--------|
| Van Load & Driveability Tune | Better loaded pull after diagnostic pre-check. | `/services/van-load-driveability-tune` | £199 |
| Van Economy Tune | Economy calibration for high-mileage vans. | `/services/van-economy-tune` | £199 |
| Fleet Van Tuning | Site-day fleet tuning with volume pricing. | `/services/fleet-van-tuning` | £199 |

---

## 9) PRICING MODEL

All pricing is zone-based and sourced from `src/config/site.ts`.

### Travel zones

| Zone | Drive time | Note |
|------|-----------|------|
| A | 0-25 mins | Core area |
| B | 25-45 mins | Standard coverage |
| C | 45-60 mins | Edge of radius |
| Out of area | 60+ mins | Quote only |

### Service pricing (£ by zone)

| Service | Zone A | Zone B | Zone C | Included |
|---------|--------|--------|--------|----------|
| Standard Diagnosis | 120 | 135 | 150 | Up to 60 mins on-site |
| VOR Diagnosis (Commercial) | 160 | 175 | 190 | Up to 75 mins on-site |
| Pre-Purchase Digital Health Check | 160 | 175 | 190 | Up to 75 mins on-site |
| Mercedes Van Minor Service | 175 | 190 | 205 | Full minor service at your location |
| Mercedes Van Major Service | 295 | 310 | 325 | Full major service at your location |
| Sprinter Brakes | 149 | 164 | 179 | Mobile brake service - front pads from £149 |
| Vito Brakes | 169 | 184 | 199 | Mobile brake service - front pads from £169 |
| Citan Brakes | 169 | 184 | 199 | Mobile brake service - front pads from £169 |
| Van Load & Driveability Tune | 199 | 214 | 229 | Diagnostic pre-check + Stage 1 calibration |
| Van Economy Tune | 199 | 214 | 229 | Diagnostic pre-check + economy calibration |
| Fleet Van Tuning | 199 | 214 | 229 | Fleet-day tuning with diagnostic pre-check |

### Add-ons

| Add-on | Price |
|--------|-------|
| Follow-on labour (after included on-site time) | £85/hour, billed in 15-min increments |
| Coding / adaptations / initialisation | from £45 |
| Priority dispatch upgrade (when available) | +£50 (Zone A/B) / +£70 (Zone C) |
| Early-bird / evening time band | +£20 (starts before 8 AM or after 7 PM) |
| Late call (9 PM start) | +£40 (diagnostics-only) |
| Parts collection run | from £20 |

### Deposits

| Zone | Amount |
|------|--------|
| Zone A / B | £30 |
| Zone C / VOR | £50 |

Free reschedule with 24 hours notice. Late cancellation or no-show retains deposit.

---

## 10) CONTACT AND CONVERSION FLOWS

### Primary conversion channels (sitewide)

* **Phone:** `tel:+442080586095` (display: 020 8058 6095)
* **WhatsApp:** `https://wa.me/message/NROKKGS6QK54G1`
* **Online booking:** `/booking` page with `BookingScheduler`
* **Contact form:** `/contact` page → `POST /api/contact/submit`
* **Email:** `contact@tripointdiagnostics.co.uk`

These appear in: Header, Footer, MobileStickyCTA, and CTA sections on most pages.

### Booking flow (`BookingScheduler`)

1. User selects service → `GET /api/booking/services`
2. User selects date/time → `GET /api/booking/availability?service=...&date=...`
3. Price confirmed → `GET /api/booking/price?service=...&zone=...`
4. User submits details → `POST /api/booking/reserve`
5. Redirect to payment if applicable

### Payment flow

1. Customer receives payment link (`/pay/:token`)
2. Frontend fetches details from `GET /api/payments/:token/details`
3. Customer clicks deposit or balance → `POST /api/payments/deposit-session` or `balance-session`
4. Redirect to Stripe checkout (external)
5. Return to `/pay/:token/success` on completion

### Contact form

Fields: name, email, phone, postcode, vehicle reg (optional), message, safe-location checkbox.
Submits to `POST /api/contact/submit` with attribution payload (see analytics section).

### Attribution tracking (`src/lib/attribution.ts`)

On first visit, captures and stores in localStorage + cookie:
* `gclid`, `gbraid`, `wbraid` (Google Ads click IDs)
* UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`)

This attribution data is merged into the contact form submission payload for conversion tracking.

---

## 11) COVERAGE AND ZONES

### Operating bases

| Base | Postcode | Typical weeks |
|------|----------|---------------|
| Tonbridge Base | TN9 1PP | PM weeks (founder on earlies at day job) |
| Eltham Base | SE9 4HA | AM weeks (founder on lates at day job) |

### Zone definitions

| Zone | Drive time | Note |
|------|-----------|------|
| A | 0-25 mins | Core area |
| B | 25-45 mins | Standard coverage |
| C | 45-60 mins | Edge of radius |
| Out of area | 60+ mins | Quote only, by exception |

### Named coverage towns (13)

Bromley, Bexley, Greenwich, Lewisham, Dartford, Orpington, Sidcup, Eltham, Sevenoaks, Tonbridge, Tunbridge Wells, Maidstone, Gravesend

### Area page data (`src/data/areas.ts`)

Each town has:
* `slug` — URL slug
* `name` — display name
* `intro` — town-specific intro paragraph
* `included` — bullet list of what's included
* `faqs` — town-specific FAQ pairs
* `nearbyAreas` — slugs linking to adjacent towns

---

## 12) SEO CONFIGURATION

### `Seo` component (`src/components/Seo.tsx`)

Applied on every page via `react-helmet-async`:

* **Title:** via template `%s | TriPoint Diagnostics` (from `siteConfig.defaultSeo.titleTemplate`)
* **Default title:** "TriPoint Diagnostics - Mobile Vehicle Diagnostics & Repairs | Kent & SE London"
* **Meta description:** per-page from route manifest or component props
* **Canonical:** full URL on `tripointdiagnostics.co.uk`
* **Robots:** `index, follow` by default; `noindex, nofollow` for admin, payment, 404 pages
* **Hreflang:** `en-GB` + `x-default`
* **Open Graph:** type `website`, locale `en_GB`, site name "TriPoint Diagnostics", per-page title/description
* **Twitter:** `summary_large_image` card
* **Default OG image:** `/og-default.jpg`

### Route manifest (`src/routes.ts`)

Central SEO configuration for all routes:
* `path`, `title`, `description`, `canonicalPath`, `priority`, `changefreq`, `indexable`
* Non-indexable routes set `canonicalPath` pointing to their merged/canonical page
* `getSeoForPath(pathname)` function for runtime lookups
* Used by SSG prerender for sitemap generation

### JSON-LD structured data (`src/components/JsonLd.tsx`)

| Schema type | Where used |
|-------------|-----------|
| `AutoRepair` (LocalBusiness) | Layout (all pages) |
| `Organization` + `WebSite` | Layout (all pages) |
| `Service` | Individual service pages |
| `FAQPage` | FAQ page + service pages with FAQs |
| `BreadcrumbList` | Service pages, blog, legal |
| `CollectionPage` | Blog index |

### Sitemap and robots

Generated automatically by `scripts/prerender.mjs` during SSG build from the route manifest. Only `indexable: true` routes are included in the sitemap.

---

## 13) ANALYTICS

### GA4 setup (`src/lib/analytics.ts` + `src/config/analyticsPublic.ts`)

* **Library:** `react-ga4`
* **Measurement ID:** from `VITE_GA4_MEASUREMENT_ID` env var, fallback `G-TE618HYTQ2`
* **Initialisation:** `send_page_view: false` (page views fired manually via `RouteTracker`)
* **Debug mode:** `?debug_tracking` query param in dev enables `debug_mode` and console logging
* **Self-test:** `window.__tripointGa4Test()` available in dev console

### Tracked events

| Event name | Trigger | Key parameters |
|-----------|---------|----------------|
| `page_view` | Every route/search change (via `RouteTracker`) | `page`, `title` |
| `phone_click` | Phone link clicked | `click_location`, `nav_label`, `contact_method` |
| `whatsapp_click` | WhatsApp link clicked | `click_location`, `nav_label`, `contact_method` |
| `nav_click` | Navigation link clicked | `nav_target`, `nav_label`, `click_location` |
| `generate_lead` | Contact form success | `lead_type: contact_form`, `form_name`, `service_interest` |
| `generate_lead` | Booking confirmation | `lead_type: booking_request`, `form_name: booking_form`, `service_interest` |
| `generate_lead` | Payment success | `lead_type: booking_request`, `payment_completed: true`, `service_interest` |
| `social_click` | Social link clicked | `platform`, `click_location` |

### Attribution (`src/lib/attribution.ts`)

Captures on first visit and persists to localStorage + cookie:
* Google Ads: `gclid`, `gbraid`, `wbraid`
* UTM: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`

Merged into contact form payload for server-side conversion tracking.

---

## 14) API SURFACE (FRONTEND FETCH ENDPOINTS)

All requests go to same-origin paths. In development, Vite proxies `/api`, `/media`, `/webhooks` to `http://127.0.0.1:8000`.

| Method | Endpoint | Used by |
|--------|----------|---------|
| GET | `/api/calculate-zone?postcode=` | ZoneCalculator |
| GET | `/api/booking/services` | BookingScheduler (step 1) |
| GET | `/api/booking/availability?service=&date=` | BookingScheduler (step 2) |
| GET | `/api/booking/price?service=&zone=` | BookingScheduler (step 3) |
| POST | `/api/booking/reserve` | BookingScheduler (step 4) |
| POST | `/api/contact/submit` | Contact form |
| GET | `/api/payments/:token/details` | Payment page |
| POST | `/api/payments/deposit-session` | Payment page (deposit) |
| POST | `/api/payments/balance-session` | Payment page (balance) |
| GET | `/api/reports/share/:shareToken` | Report viewer |
| various | `/api/admin/*` | Admin pages (credentials: include) |

---

## 15) BLOG CONTENT

4 published posts, all authored by "TriPoint Diagnostics":

| Post | Category | Published | Topic |
|------|----------|-----------|-------|
| OM654 Turbo Failures | Mercedes | 2026-02-23 | Technical breakdown of turbo failures in W907 Sprinter and W447 Vito — thermal stress, lubrication, DPF regen cycles |
| Sprinter Limp Mode | Mercedes | — | Common triggers, why code-clearing fails, what a proper diagnostic session involves |
| AdBlue Countdown | Emissions | — | What triggers the countdown, why it returns after clearing, what a decision visit does |
| DPF Warning Lights | Emissions | — | Forced regen vs passive, when regen is safe vs when it masks faults, diagnose-first approach |

Content format: long-form HTML strings stored in `src/data/blogPosts.ts` with blog-specific CSS classes for styling (`blog-lead`, `blog-image`, `blog-callout`, `blog-step`, etc.).

Each post has `relatedServices` linking to relevant service pages.

---

## 16) DATA SOURCES

| Data type | Source | Location |
|-----------|--------|----------|
| Brand, contact, hours, zones, pricing | Static config | `src/config/site.ts` |
| Service catalog (categories, titles, descriptions) | Static config | `src/config/servicesCatalog.ts` |
| GA4 measurement ID | Environment variable / fallback | `src/config/analyticsPublic.ts` |
| Per-town area content | Static data | `src/data/areas.ts` |
| Blog posts | Static data (HTML strings) | `src/data/blogPosts.ts` |
| Gallery images | Static data | `src/data/galleryImages.ts` |
| Route SEO metadata | Static manifest | `src/routes.ts` |
| Zone calculation | Backend API | `GET /api/calculate-zone` |
| Booking availability and pricing | Backend API | `/api/booking/*` |
| Contact form submission | Backend API | `POST /api/contact/submit` |
| Payment processing | Backend API + Stripe | `/api/payments/*` |
| Diagnostic reports | Backend API | `/api/reports/*` |
| Admin operations | Backend API | `/api/admin/*` |

No CMS is used. All editorial content is in-repo as TypeScript/HTML.

---

## 17) COMPLIANCE REMINDERS (WEBSITE-SPECIFIC)

These rules are inherited from the master business prompt and apply to all website content:

### Manufacturer independence

The website must always present TriPoint Diagnostics as **independent** — not affiliated with, not endorsed by, and not authorised by any vehicle manufacturer. The footer contains an explicit independence disclaimer.

### Emissions compliance

The website does **not** promote, offer, or reference:
* DPF delete / removal / gutting
* AdBlue / SCR bypasses or emulators
* EGR blanking or defeat
* Catalytic system removal
* Defeat devices of any kind

All emissions content (DPF, AdBlue, SCR, NOx pages and blog posts) frames the approach as **compliance-first diagnosis**, not shortcuts.

### Tuning positioning

All tuning pages frame the service as:
* Work-use optimisation (payload, torque delivery, route behaviour, economy)
* Diagnostic pre-check mandatory
* Insurance declaration required
* Original file backup retained
* No guaranteed MPG claims
* No performance / boy-racer language

### Pricing transparency

All "from £X" pricing on the website is zone A pricing. The full zone table is available on the pricing page and on each service page. No hidden costs.

### Written outcome promise

The core brand promise — "every job ends with a written outcome" — is reinforced across the homepage, service pages, process page, and FAQ. This is non-negotiable.

---

## 18) RELATIONSHIP TO MASTER PROMPT

This document covers the **website and its technical implementation**. For the full business context, including:

* Operating model (AM/PM weeks, rota, real scheduling)
* Customer journey / workflow
* Google Ads strategy
* SEO / content strategy
* Brand voice and tone guidelines
* Safety / scope boundaries
* Target customer profiles
* Task-specific response behaviour

See **`tpd-master-prompt.md`** in this same folder.
