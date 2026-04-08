# Sample diagnostic report: content and URLs

Reference for the **sample diagnostic report** conversion content added to the TriPoint site.  
**Live site base URL:** `https://tripointdiagnostics.co.uk`  
**Path prefix in repo:** `tripoint-frontend/`

---

## Primary page (new)

| URL path | Full URL (production) | Source file |
|----------|------------------------|-------------|
| `/sample-diagnostic-report` | https://tripointdiagnostics.co.uk/sample-diagnostic-report | `tripoint-frontend/src/pages/SampleDiagnosticReportPage.tsx` |

**SEO (from `routes.ts`):**

- **Title:** Sample Diagnostic Report \| What You Get After a Proper Vehicle Diagnosis  
- **Meta description:** See what a real written diagnostic report looks like from TriPoint Diagnostics. Plain-English findings, evidence from live data and guided tests, and clear next steps.  
- **Canonical:** `/sample-diagnostic-report`  
- **Indexable:** yes (included in sitemap via `routes.manifest.json`)

**On-page sections (in order):**

1. **Hero** – Eyebrow “Real diagnostic proof”; H1 “What a Proper Diagnostic Visit Actually Gives You”; trust bullets; CTAs Book Standard Diagnosis, WhatsApp Your Symptoms; expandable hero image `00_front_page_proof_public_safe.png`.
2. **What you are actually paying for** – Code read vs proper diagnosis / written outcome.
3. **A real example (one recent visit)** – Intermittent EML, NOx sensor line, DPF/SCR not condemned early, compliant next steps (process-focused, not vehicle-specific).
4. **Why this diagnosis was strong** – Five cards: Plain-English conclusion; Ruled-out causes; Live data evidence; Electrical confirmation; Clear next steps.
5. **What the written outcome can include** – Seven expandable screenshots with captions (see asset URLs below).
6. **Code read vs proper diagnosis** – Two-column comparison.
7. **Why diagnosis is worth paying for** – Anchored to Standard Diagnosis Zone A from £120; link to pricing.
8. **Who this is for** – Bullet list (warning lights, intermittent faults, emissions, unproved garage theory, written answer before spend).
9. **Questions** – Four FAQs in accordion (same Q&A as page-level FAQ schema).
10. **Closing CTA** – Book Standard Diagnosis, View Pricing (no duplicate WhatsApp/phone; footer + mobile bar handle those).

**Structured data:** `BreadcrumbSchema` (Home → Services → Sample Diagnostic Report), `FaqPageSchema` for the four on-page FAQs.

---

## Static image assets (public)

All under **`/images/sample-report/`** (files in `tripoint-frontend/public/images/sample-report/`).

| File | URL path |
|------|----------|
| `00_front_page_proof_public_safe.png` | `/images/sample-report/00_front_page_proof_public_safe.png` |
| `01_plain_english_summary.png` | `/images/sample-report/01_plain_english_summary.png` |
| `02_dpf_checks_table.png` | `/images/sample-report/02_dpf_checks_table.png` |
| `03_scr_live_data_section.png` | `/images/sample-report/03_scr_live_data_section.png` |
| `04_electrical_confirmation_table.png` | `/images/sample-report/04_electrical_confirmation_table.png` |
| `05_voltage_proof_photos.png` | `/images/sample-report/05_voltage_proof_photos.png` |
| `06_technical_diagnosis_box.png` | `/images/sample-report/06_technical_diagnosis_box.png` |
| `07_next_steps_section.png` | `/images/sample-report/07_next_steps_section.png` |
| `08_recommendation_bullets.png` | `/images/sample-report/08_recommendation_bullets.png` |

**Behaviour:** Rendered via `ExpandableReportImage` (click/tap to enlarge, zoom icon affordance). `OptimizedImage` treats `/images/sample-report/` as raw assets (no optimised WebP mirror required).

**Not published:** No raw customer PDF, no reg/VIN in these crops (per asset pack notes).

---

## Internal links **to** `/sample-diagnostic-report`

| Page URL path | Full URL | Placement / CTA label |
|---------------|----------|------------------------|
| `/` (homepage) | https://tripointdiagnostics.co.uk/ | After “Why Choose TriPoint”; block “See What Your Written Diagnostic Outcome Looks Like”; CTA **See a Real Diagnostic Report**; image `01_plain_english_summary.png`. |
| `/services/diagnostic-callout` | https://tripointdiagnostics.co.uk/services/diagnostic-callout | After “What’s Included”; “What Your Written Outcome Looks Like”; 2×2 grid (01, 02, 03, 06); CTA **See the Full Report Example**. |
| `/pricing` | https://tripointdiagnostics.co.uk/pricing | Above final “Book Your Diagnostic”; “Why pay for diagnosis?” card with `08_recommendation_bullets.png`; CTA **See a real diagnostic report**. |
| `/process` | https://tripointdiagnostics.co.uk/process | Between step 2 and step 3; “Written report + options”; images 05 + 07; CTA **See a full report example**. |

**Note:** The sample report page is **not** in the main header nav; discovery is via the links above and FAQ references.

---

## FAQ entries (new / updated copy)

**URL:** https://tripointdiagnostics.co.uk/faq  

**Category: Diagnostics & Process**

| Question | Answer summary |
|----------|----------------|
| Do I get a written report after every diagnostic visit? | Yes; outcome contents; points to Sample Diagnostic Report page (linked from Standard Diagnosis, Pricing, homepage). |
| Is a diagnostic visit just a code scan? | No; live data, checks, guided tests; reasoned conclusion, not code list only. |
| Can you help if I need workshop-only work afterwards? | Yes; documented findings and next step; write-up usable elsewhere. |
| Will you recommend deletes or bypasses for AdBlue / DPF faults? | No; compliance-first; no deletes/bypasses/defeat devices. |

**Category: Emissions, AdBlue & DPF**

| Question | Answer summary |
|----------|----------------|
| Where can I see how you document an emissions-related diagnosis? | Same written outcome model; redacted walkthrough on Sample Diagnostic Report page (same link sources as above). |

---

## Component and routing (implementation reference)

| Item | Location |
|------|----------|
| Route | `tripoint-frontend/src/App.tsx` → `sample-diagnostic-report` |
| SEO manifest | `tripoint-frontend/src/routes.ts`, generated `tripoint-frontend/src/routes.manifest.json` |
| Expandable images | `tripoint-frontend/src/components/ExpandableReportImage.tsx` |
| Raw PNG path handling | `tripoint-frontend/src/components/OptimizedImage.tsx` (`useOriginalAsset` includes `/images/sample-report/`) |

---

## Regenerate sitemap entry after manifest changes

From `tripoint-frontend`:

```bash
npm run extract-routes
```

Full SSG build (if used): `npm run build:ssg` or your usual pipeline.

---

*Last aligned with site implementation in `tripoint-frontend` (sample report feature + expandable images).*
