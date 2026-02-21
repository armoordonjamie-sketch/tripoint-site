# SEO Audit & Page Inventory

## Page Inventory

| URL | H1 | Title | Meta Description | Primary Keyword | Status |
|-----|-----|-------|------------------|-----------------|--------|
| / | TriPoint Diagnostics | TriPoint Diagnostics - Mobile Vehicle Diagnostics & Repairs | ... | mobile vehicle diagnostics kent | Live |
| /services | Services | Services \| TriPoint Diagnostics | ... | mobile diagnostics kent | Live |
| /services/diagnostic-callout | Diagnostic Callout | Diagnostic Callout \| TriPoint Diagnostics | Mobile diagnostic callout - full-system scan... | diagnostic callout mobile | Live |
| /services/vor-van-diagnostics | VOR Van Diagnostics | VOR Van Diagnostics \| TriPoint Diagnostics | Vehicle Off Road priority diagnostic... | vor van diagnostics | Live |
| /services/emissions-diagnostics | Emissions Fault Decision Visit | Emissions Fault Decision Visit \| TriPoint Diagnostics | Compliance-first diagnosis for AdBlue, SCR, DPF... | emissions diagnostics adblue dpf | Live |
| /services/pre-purchase-digital-health-check | Pre-Purchase Digital Health Check | Pre-Purchase Digital Health Check \| TriPoint Diagnostics | Professional pre-purchase vehicle inspection... | pre-purchase health check | Live |
| /services/sprinter-limp-mode | Sprinter Limp Mode Diagnostic | Sprinter Limp Mode Diagnostic \| TriPoint Diagnostics | Professional Sprinter limp mode diagnosis... | sprinter limp mode diagnostic | Live |
| /services/adblue-countdown | AdBlue Countdown Fix | AdBlue Countdown Fix \| TriPoint Diagnostics | Professional AdBlue countdown diagnosis... | adblue countdown fix | Live |
| /services/nox-scr-diagnostics | NOx Sensor & SCR Diagnostics | NOx Sensor & SCR Diagnostics \| TriPoint Diagnostics | Professional NOx sensor and SCR diagnostic... | nox sensor scr diagnostic | Live |
| /services/dpf-regeneration-decision | DPF Warning Light Diagnostic | DPF Warning Light Diagnostic \| TriPoint Diagnostics | DPF warning light? We diagnose first... | dpf warning light diagnostic | Live |
| /services/mercedes-xentry-diagnostics-coding | Mercedes Xentry Diagnostics and Coding | Mercedes Xentry Diagnostics and Coding \| TriPoint Diagnostics | Mobile Mercedes Xentry diagnostics... | mercedes xentry diagnostics mobile | Live |
| /services/intermittent-electrical-faults | Intermittent Electrical Fault Van Diagnostic | Intermittent Electrical Fault Van Diagnostic \| TriPoint Diagnostics | Professional intermittent electrical fault diagnosis... | intermittent electrical fault van diagnostic | Live |
| /services/fleet-health-check | Fleet Diagnostic Health Check | Fleet Diagnostic Health Check \| TriPoint Diagnostics | Fleet diagnostic health checks - by arrangement... | fleet diagnostic health check | Live |
| /pricing | Pricing | Pricing \| TriPoint Diagnostics | Transparent zone-based pricing... | mobile diagnostics pricing | Live |
| /areas | (CoveragePage) | Areas \| TriPoint Diagnostics | ... | areas we cover kent | Live |
| /process | (ProcessPage) | Process \| TriPoint Diagnostics | ... | diagnostic process | Live |
| /about | About TriPoint Diagnostics | About \| TriPoint Diagnostics | About TriPoint Diagnostics... | about mobile diagnostics | Live |
| /our-work | (OurWorkPage) | Our Work \| TriPoint Diagnostics | ... | our work | Live |
| /faq | Frequently Asked Questions | Frequently Asked Questions \| TriPoint Diagnostics | Common questions about TriPoint Diagnostics... | faq diagnostics | Live |
| /booking | (BookingPage) | Booking \| TriPoint Diagnostics | ... | book diagnostic | Live |
| /contact | Get in Touch | Contact \| TriPoint Diagnostics | Get in touch with TriPoint Diagnostics... | contact diagnostics | Live |
| /blog | Blog | Blog \| TriPoint Diagnostics | Technical insights on Sprinter limp mode... | blog diagnostics | Live |
| /blog/sprinter-limp-mode-proper-diagnostic | (post title) | Sprinter Limp Mode: What a Proper Diagnostic Looks Like | ... | sprinter limp mode causes | Live |
| /blog/adblue-countdown-clearing-codes-not-fix | (post title) | AdBlue Countdown: Why Clearing Codes Isn't a Fix | ... | adblue countdown reset | Live |
| /blog/dpf-warning-light-regen-vs-worse | (post title) | DPF Warning Lights: When Regen Helps vs When It Makes Things Worse | ... | dpf warning light what to do | Live |
| /legal/privacy-policy | Privacy Policy | Privacy Policy \| TriPoint Diagnostics | ... | - | Live |
| /legal/terms | Terms | Terms \| TriPoint Diagnostics | ... | - | Live |
| /legal/disclaimer | Disclaimer | Disclaimer \| TriPoint Diagnostics | ... | - | Live |
| /legal/accessibility | Accessibility | Accessibility \| TriPoint Diagnostics | ... | - | Live |

## Redirects

| Old URL | New URL |
|---------|---------|
| /coverage | /areas |
| /services/vor-triage | /services/vor-van-diagnostics |
| /services/pre-purchase-health-check | /services/pre-purchase-digital-health-check |

## Technical SEO Fixes Applied

- **Seo.tsx**: Default OG image (`/og-default.jpg`), `og:image:width`, `og:image:height`, `og:image:alt`, `twitter:image`
- **JsonLd.tsx**: LocalBusinessSchema (AutoRepair), ServiceSchema, FaqPageSchema, BreadcrumbSchema
- **manifest.json**: PWA manifest with name, icons, theme_color
- **Prerendering**: Not implemented (Vite 7 compatibility issues documented)
- **Sitemap**: Updated with all new routes

## Keyword-to-Page Mapping

| Primary Keyword | Target Page |
|-----------------|-------------|
| sprinter limp mode diagnostic | /services/sprinter-limp-mode |
| adblue countdown fix | /services/adblue-countdown |
| nox sensor scr diagnostic | /services/nox-scr-diagnostics |
| dpf warning light diagnostic | /services/dpf-regeneration-decision |
| mercedes xentry diagnostics mobile | /services/mercedes-xentry-diagnostics-coding |
| intermittent electrical fault van diagnostic | /services/intermittent-electrical-faults |
| fleet diagnostic health check | /services/fleet-health-check |
| sprinter limp mode causes | /blog/sprinter-limp-mode-proper-diagnostic |
| adblue countdown reset | /blog/adblue-countdown-clearing-codes-not-fix |
| dpf warning light what to do | /blog/dpf-warning-light-regen-vs-worse |

## Internal Linking Map

- **Home** → Services, Pricing, Areas, Booking, About, Contact, Blog, VOR Van Diagnostics
- **Services index** → All service pages
- **Service pages** → Related services, related blog posts, Diagnostic Callout, Emissions, VOR
- **Blog** → Service pages via "Need help with this?" CTA
- **Footer** → Services, Company (About, Our Work, Blog, Contact, FAQ, Process, Areas), Legal, Contact
- **Header** → Services dropdown (all symptom-led + core), Pricing, Areas, Booking, About, Contact, Blog
