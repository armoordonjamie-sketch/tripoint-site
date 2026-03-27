# GOOGLE ADS CONTEXT PROMPT — TRIPOINT DIAGNOSTICS

This is a universal reference prompt describing the **TriPoint Diagnostics Google Ads account** in full: every campaign, ad group, keyword theme, negative keyword strategy, ad copy, asset, location target, schedule, bid strategy, and early performance data.

Use this prompt to give any LLM complete context about the paid search setup when working on ad copy, keyword strategy, bid management, landing page alignment, or campaign optimisation tasks.

For the full **business** context (compliance rules, operating model, pricing, brand voice, Google Ads strategic direction), see **`tpd-master-prompt.md`** in this same folder.

For the **website and landing page** context (every route, page content, conversion flows), see **`website-context-prompt.md`** in this same folder.

---

## 1) STATUS AND DATA FRESHNESS

**Account status:** all three active campaigns are in **learning phase** (bid strategy learning).

**Data period:** all-time (from account creation to the date these CSVs were exported, approximately late March 2026).

**Important caveats:**
* Metrics are preliminary and should not be treated as statistically significant.
* The bid strategy (Portfolio Maximize Conversions) is still calibrating; CPCs and conversion rates will shift as learning completes.
* One legacy campaign (`TriPoint | Search | Mercedes Vans | Kent + SE London`) was removed and its ad groups consolidated into the current three-campaign structure.

---

## 2) CSV FILE INDEX

All source data lives in `business-docs/google-ads/`. These are Google Ads Editor / reporting exports.

| File | Description | Approx. rows | Key columns |
|------|-------------|--------------|-------------|
| `tpd-campaigns.csv` | Campaign-level settings, budget, bid strategy, location lists, status | 3 active + 1 legacy | Campaign, Budget, Bid strategy, Status, Location, Exclusion |
| `tpd-ad-groups.csv` | Ad group status, campaign mapping, early metrics | 15 ad groups | Ad group, Campaign, Status, Impr, Clicks, Conv |
| `tpd-ads.csv` | Responsive search ads with all headlines, descriptions, URLs, ad strength | ~23 RSAs | Headlines 1-15, Descriptions 1-4, Final URL, Ad strength, Campaign, Ad group |
| `tpd-keywords.csv` | All keywords with match type, campaign/ad group mapping, metrics | ~400 keywords | Keyword, Match type, Campaign, Ad group, Status, Impr, Clicks, Conv |
| `tpd-negative-keywords.csv` | Negative keywords at campaign and ad group level | ~470 negatives | Negative keyword, Match type, Campaign, Ad group, Level |
| `tpd-assets.csv` | Sitelinks, callouts, structured snippets, images, business logo | ~1100 rows | Asset, Asset type, Level, Status, Clicks, Impr |
| `tpd-ad-scedule.csv` | Ad schedule by day/campaign with metrics | ~35 rows | Day & time, Campaign, Clicks, Impr, Conv |
| `tpd-locations.csv` | Granular postcode/town targeting per campaign with metrics | ~580 rows | Location, Campaign, Clicks, Impr, Conv |
| `tpd-excluded-locations.csv` | Excluded locations per campaign | ~130 rows | Location, Campaign |
| `tpd-advanced-bid-adjustments.csv` | Call interaction data per campaign | 5 rows | Interaction type, Campaign, Interactions, Impr |
| `tpd-change-history.csv` | Full account change log (very large) | 2000+ rows | Change date, Change type, Campaign, Details |

---

## 3) ACCOUNT OVERVIEW

| Metric | Value |
|--------|-------|
| Currency | GBP |
| Bid strategy | Portfolio Maximize Conversions (shared across all 3 campaigns) |
| Daily budget | £70/day shared across all 3 campaigns (portfolio budget) |
| Budget type | Daily |
| Campaign type | Search (Standard) |
| All-time impressions | 1,358 |
| All-time clicks | 119 |
| All-time CTR | 8.76% |
| All-time cost | £305.71 |
| All-time conversions | 6 |
| All-time conv. rate | 5.04% |
| All-time avg. CPC | £2.57 |
| All-time cost/conv. | £50.95 |

---

## 4) CAMPAIGN STRUCTURE

The account runs **3 active Search campaigns**, each mapped to one of the three service families from the business model. All share the same portfolio bid strategy, a single shared £70/day budget, location targeting, and ad schedule.

### Active campaigns

| Campaign | ID | Status | Optimisation score |
|----------|----|--------|-------------------|
| Search \| Diagnostics & VOR \| Kent + SE London | 23675426289 | Eligible (Learning) | 99.39 |
| Search \| Servicing & Brakes \| Kent + SE London | 23675431602 | Eligible (Learning) | 99.80 |
| Search \| Tuning \| Commercial Vans \| Kent + SE London | 23680861130 | Eligible (Learning) | 99.51 |

All 3 campaigns share a single **£70/day portfolio budget** managed by the Portfolio Maximize Conversions bid strategy.

### Removed legacy campaign

| Campaign | Status | Context |
|----------|--------|---------|
| TriPoint \| Search \| Mercedes Vans \| Kent + SE London | Removed | Original single-campaign structure; contained Brand, Diagnostics Core, Sprinter Limp Mode, Intermittent Electrical, Emissions, VOR Triage, and Xentry Coding ad groups. Removed and consolidated into the 3-campaign structure above. |
| VOR & Mercedes Van Diagnostics | Removed | Earlier iteration with Ad group 1 (broad diagnostics) and Mercedes Sprinter Diagnostics (General). Removed and consolidated. |

---

## 5) AD GROUP MAP

### Campaign: Search | Diagnostics & VOR | Kent + SE London

| Ad group | Status | Final URL | Impr | Clicks | Conv | Avg CPC |
|----------|--------|-----------|------|--------|------|---------|
| Standard Diagnosis | Eligible | /services/diagnostic-callout | 19 | 4 | 0 | £4.17 |
| VOR / Urgent Van Diagnostics | Eligible | /services/vor-van-diagnostics | 0 | 0 | 0 | -- |
| Pre-Purchase Van Check | Eligible | /services/pre-purchase-digital-health-check | 28 | 5 | 3 | £1.03 |
| AdBlue / DPF / Emissions | Eligible | /services/diagnostic-callout | 0 | 0 | 0 | -- |
| Limp Mode / Derate | Eligible | /services/diagnostic-callout | 2 | 2 | 0 | £10.16 |

### Campaign: Search | Servicing & Brakes | Kent + SE London

| Ad group | Status | Final URL | Impr | Clicks | Conv | Avg CPC |
|----------|--------|-----------|------|--------|------|---------|
| Sprinter Servicing | Eligible | /services/sprinter-servicing | 75 | 4 | 3 | £3.53 |
| Vito Servicing | Eligible | /services/vito-servicing | 25 | 0 | 0 | -- |
| Citan Servicing | Eligible | /services/citan-servicing | 2 | 0 | 0 | -- |
| Mercedes Van Servicing & Brakes | Eligible | /services/mercedes-van-servicing | 15 | 0 | 0 | -- |
| Sprinter Brakes | Eligible | /services/sprinter-brakes | 3 | 0 | 0 | -- |
| Vito Brakes | Eligible | /services/vito-brakes | 5 | 0 | 0 | -- |
| Citan Brakes | Eligible | /services/citan-brakes | 0 | 0 | 0 | -- |

### Campaign: Search | Tuning | Commercial Vans | Kent + SE London

| Ad group | Status | Final URL | Impr | Clicks | Conv | Avg CPC |
|----------|--------|-----------|------|--------|------|---------|
| Van Economy Tune | Eligible | /services/van-economy-tune | 52 | 2 | 0 | £1.67 |
| Van Load & Driveability Tune | Eligible | /services/van-load-driveability-tune | 5 | 0 | 0 | -- |
| Fleet Van Tuning | Eligible | /services/fleet-van-tuning | 9 | 0 | 0 | -- |

---

## 6) KEYWORD STRATEGY

### Match type approach

The account uses a layered match type strategy:
* **Broad match** — for discovery and reach (e.g. `mercedes sprinter service`, `ecu remap`, `van diagnostics near me`)
* **Phrase match** — for tighter intent control (e.g. `"pre purchase vehicle check"`, `"mobile diagnostics near me"`, `"mercedes coding"`)
* **Exact match** — for high-intent precision (e.g. `[auto electrician near me]`, `[sprinter limp mode]`, `[xentry diagnostics]`)

### By campaign / ad group

**Diagnostics & VOR — Standard Diagnosis**
* Themes: mobile diagnostics, mercedes diagnostics, van diagnostics, warning light diagnosis, commercial vehicle diagnostics
* Match types: broad + phrase
* Top performer: `mercedes diagnostics near me` (broad, 7 impr, 1 click)

**Diagnostics & VOR — Pre-Purchase Van Check**
* Themes: pre purchase vehicle check, used van inspection, dealer van inspection, used van diagnostic check
* Match types: broad + phrase
* Top performer: `"pre purchase vehicle check"` (phrase, 15 impr, 5 clicks, 3 conv, £1.03 CPC)

**Diagnostics & VOR — VOR / Urgent Van Diagnostics**
* Themes: vito/sprinter wont start, van breakdown diagnosis, commercial vehicle diagnostics urgent, same day diagnostics, vor diagnostics
* Match types: broad
* Low volume in learning phase

**Diagnostics & VOR — Limp Mode / Derate**
* Themes: sprinter limp mode, vito limp mode, sprinter reduced power, turbo fault diagnosis, derate diagnosis
* Match types: broad + phrase
* `vito limp mode` (broad, 2 impr, 2 clicks, £10.16 CPC)

**Diagnostics & VOR — AdBlue / DPF / Emissions**
* Themes: adblue warning van, adblue countdown sprinter, adblue fault diagnosis, nox sensor diagnosis, sprinter dpf fault
* Match types: broad + phrase
* Zero impressions so far

**Servicing & Brakes — Sprinter Servicing**
* Themes: mercedes sprinter service, sprinter service near me, sprinter servicing, mobile sprinter service, sprinter service a/b
* Match types: broad + phrase
* Top performer: `mercedes sprinter service` (broad, 46 impr, 3 clicks, 3 conv, £4.14 CPC)

**Servicing & Brakes — Vito / Citan Servicing**
* Themes: mercedes vito/citan service, model-specific terms (w639, w447, w415, w420)
* Match types: broad + phrase
* Low volume, Vito has 25 impr with 0 clicks

**Servicing & Brakes — Mercedes Van Servicing & Brakes (hub)**
* Themes: mercedes van service, mobile van service, van brakes near me, mercedes van brakes
* Match types: broad + phrase

**Servicing & Brakes — Sprinter / Vito / Citan Brakes**
* Themes: model-specific brake pads, discs, replacements, front/rear
* Match types: broad + phrase
* Very low volume across all three

**Tuning — Van Economy Tune**
* Themes: engine remap, ecu remap, diesel remap, remap near me, stage 1, van remap, mobile remap, van tuning
* Match types: broad
* Highest volume in tuning: 52 impr, 2 clicks
* Note: broad match terms like `engine remap` and `ecu remap` cast a wide net

**Tuning — Van Load & Driveability Tune**
* Themes: van tuning, van remap, sprinter/vito/trafic/transit van tuning, sprinter van remap
* Match types: broad + exact
* Low volume: 5 impr

**Tuning — Fleet Van Tuning**
* Themes: diesel van remap
* Match types: broad
* 9 impr, 0 clicks

### Removed campaign keywords (historical context)

The legacy `TriPoint | Search | Mercedes Vans` campaign contained keyword sets for:
* **Brand** — `[tripoint diagnostics]`, `"tripoint diagnostics"`, `[tripointdiagnostics]`, etc.
* **Mercedes Diagnostics Core** — `"mercedes sprinter diagnostics"`, `"vehicle diagnostics near me"`, `"mobile mercedes diagnostics"`, etc.
* **Sprinter Limp Mode** — `[sprinter limp mode]`, `"sprinter loss of power"`, `"sprinter no boost"`, etc.
* **Intermittent Electrical / CAN Faults** — `[auto electrician near me]`, `"mobile auto electrician"`, `"sprinter electrical fault"`, etc. (highest volume in old campaign: 722 impr, 72 clicks)
* **Emissions Diagnostics** — `[sprinter dpf regeneration]`, `[sprinter scr fault]`, `"sprinter adblue countdown"`, etc. (all paused)
* **VOR / Urgent Triage** — `[van wont start]`, `"sprinter wont start"`, `"vor van diagnostics"`, etc.
* **Xentry / SCN / Module Coding** — `"mercedes coding"`, `"xentry diagnostics"`, `[scn coding]`, `"star diagnosis"`, etc.

These keywords are now `Not eligible` (campaign removed) but represent the historical intent architecture. The active campaigns carry forward the strongest themes.

---

## 7) NEGATIVE KEYWORD STRATEGY

Negatives are applied at both **campaign level** and **ad group level** to prevent cross-pollination between service families and filter out irrelevant traffic.

### Campaign-level negatives (applied to all ad groups in the campaign)

**Diagnostics & VOR campaign negatives:**
* Cross-service: `"sprinter service"`, `"vito service"`, `"citan service"`, `"economy tune"`, `"van tuning"`, `"van remap"`, brakes, `"oil change"`, `"brake pads"`, `"brake discs"`
* Mercedes car models: gla, glc, cla, gle, `"a class"`, `"c class"`, `"e class"`
* Compliance/defeat: `"dpf delete"`, `"egr delete"`, `"adblue delete"`
* DIY/informational: diy, free, download, pdf, software, scanner, manual, course, training, `"how to"`, `"code reader"`, mot, locksmith, salary, jobs, job, car, cars, key, keys, monaco
* Tool brands: --
* Fleet tuning: `"fleet tuning"`

**Servicing & Brakes campaign negatives:**
* Cross-service: diagnostic, diagnostics, tuning, remap, dpf, adblue, nox, vor, `"limp mode"`, `"warning light"`, `"electrical fault"`, `"economy tune"`, `"fleet tuning"`, `"load tune"`, `"health check"`, `"pre purchase"`, `"urgent diagnostics"`, `"key coding"`
* Mercedes car models: gla, glc, gle, cla, `"a class"`, `"c class"`, `"e class"`
* Irrelevant: mot, tyres, tyre, paint, bodywork, pdf, locksmith, course, training, salary, jobs, job, car, cars, key, keys, diy, manual, free, `"how to"`

**Tuning campaign negatives:**
* Cross-service: diagnostic, diagnostics, brakes, `"brake pads"`, `"brake discs"`, `"oil change"`, service, servicing, repairs, `"pre purchase"`, `"health check"`, `"warning light"`, `"limp mode"`, `"electrical fault"`, `"key coding"`, vor, nox, dpf
* Performance/racing: `"stage 2"`, `"stage 3"`, `"launch control"`, `"pops and bangs"`, `"smoke tune"`, flames, hardcut, crackle, amg, gti, race, dyno
* Mercedes car models: gla, glc, gle, cla, `"a class"`, `"c class"`, `"e class"`, bmw, audi
* General: mot, cars, car, jobs, job, salary, training, course, software, free, key, keys

### Ad group-level negatives (fine-tuned filtering)

**Tuning ad groups (Economy / Load / Fleet):**
* Non-van vehicles: car, cars, bike, motorcycle, motorbike, golf, fiesta, focus, polo, corsa, cupra, bmw, audi, tractor
* Performance terms: `"stage 2"`, `"stage 3"`, `"launch control"`, `"pops and bangs"`, `"crackle map"`, `"hard cut limiter"`, `"radio tuning"`, `"piano tuning"`, `"guitar tuning"`, `"tv tuning"`, `"tractor tuning"`
* Software/DIY: winols, download, software, free, `"tuning file"`, `"map file"`
* Specific to Fleet: `"vw golf"`

**Diagnostics ad groups (Emissions):**
* Defeat: `"removal"`, `"bypass"`, `"emulator"`, `"delete"`, `"off"`

**Diagnostics ad groups (Limp Mode):**
* `"cheap fix"`, `"reset"`, `"limp mode reset"`

**Diagnostics ad groups (Xentry Coding — legacy):**
* `"crack"`, `"keygen"`, `"activation"`, `"xentry download"`, `"xentry laptop"`

**Diagnostics ad groups (Core — legacy):**
* `"mot"`, `"brakes"`, `"tyres"`, `"oil change"`

**VOR Triage:**
* `"tow truck"`, `"tow"`, `"recovery"`

**Brand:**
* `"careers"`, `"jobs"`

**Intermittent Electrical (legacy):**
* `"home electrical"`, `"rcd"`, `"wiring regulations"`

---

## 8) AD COPY INVENTORY

All ads are **Responsive Search Ads (RSAs)** with up to 15 headlines and 4 descriptions. Google rotates combinations automatically.

### Diagnostics & VOR campaign

**Standard Diagnosis** (ad strength: Poor)
* Final URL: `tripointdiagnostics.co.uk/services/diagnostic-callout`
* Display path: `diagnostics/mercedes-vans`
* Key headlines: Mobile Mercedes Diagnostics, Mercedes Van Diagnostics, Warning Light Diagnosis, AdBlue & DPF Faults, Limp Mode Fault Finding, Dealer-Level Xentry Scan, Written Fix Plan, Diagnostics From £120, Commercial Van Specialist, Same-Day VOR Available, Sprinter & Vito Experts
* Key descriptions: Full-system scan, live data and guided tests with a written fix plan; Mobile Mercedes van diagnostics for warning lights, limp mode and emissions faults; Call or WhatsApp with your reg and symptoms for quick triage and booking; Kent and SE London coverage, fixed pricing confirmed before attendance

**VOR / Urgent Van Diagnostics** (ad strength: Poor)
* Final URL: `tripointdiagnostics.co.uk/services/vor-van-diagnostics`
* Display path: `vor/urgent-van`
* Key headlines: VOR Van Diagnostics, Urgent Van Diagnostics, Priority Commercial Triage, Van Won't Start Help, Fast Back On Road Focus, Same-Day Priority Slots, Mercedes Van Specialist
* Key descriptions: Priority diagnostics for off-road vans with triage to get you moving quickly; Mobile commercial vehicle fault finding across Kent and SE London

**Pre-Purchase Van Check** (ad strength: Good)
* Final URL: `tripointdiagnostics.co.uk/services/pre-purchase-digital-health-check`
* Display path: `used-van/health-check`
* Key headlines: Pre-Purchase Van Check, Used Van Health Check, Diagnostic Scan Before Buy, Mercedes Van Buyer Check, Written Condition Report, Dealer-Level Xentry Scan, Sprinter & Vito Checks, Digital Report Included
* Key descriptions: Pre-purchase digital health check with full-system scan and written condition report; Ideal before buying a used van so faults and warning lights are checked first

**Limp Mode / Derate** (ad strength: Poor)
* Final URL: `tripointdiagnostics.co.uk/services/diagnostic-callout`
* Display path: `limp-mode/reduced-power`
* Key headlines: Limp Mode Diagnostics, Reduced Power Diagnosis, Sprinter Limp Mode Help, Vito Derate Diagnosis, Dealer-Level Xentry Scan, Turbo Fault Diagnosis, Diagnostics From £120
* Key descriptions: Mobile diagnosis for limp mode, reduced power, boost and derate faults on vans

**AdBlue / DPF / Emissions** (ad strength: Good)
* Final URL: `tripointdiagnostics.co.uk/services/diagnostic-callout`
* Display path: `emissions/adblue-dpf`
* Key headlines: AdBlue Fault Diagnosis, DPF Fault Diagnosis, Mercedes Van Emissions, NOx Sensor Diagnostics, Dealer-Level Xentry Scan, Warning Light Diagnosis, Diagnostics From £120
* Key descriptions: Mobile Mercedes van diagnostics for AdBlue, DPF, NOx and emissions warning faults

### Servicing & Brakes campaign

**Sprinter Servicing** (ad strength: Good)
* Final URL: `tripointdiagnostics.co.uk/services/sprinter-servicing`
* Display path: `sprinter/servicing`
* Key headlines: Mobile Sprinter Servicing, Mercedes Sprinter Service, Minor Service From £175, Major Service From £295, W906 & W907 Covered, Genuine Mercedes Parts, Xentry Service Reset, Written Condition Report, Kent & SE London
* Key descriptions: Mobile Mercedes Sprinter servicing with genuine parts, Xentry reset and checks; Minor and major service packages at your home, yard or depot

**Vito Servicing** (ad strength: Good)
* Final URL: `tripointdiagnostics.co.uk/services/vito-servicing`
* Display path: `vito/servicing`
* Key headlines: Mobile Vito Servicing, Mercedes Vito Service, Minor Service From £175, Major Service From £295, W639 & W447 Covered, Genuine Mercedes Parts, Xentry Service Reset

**Citan Servicing** (ad strength: Average)
* Final URL: `tripointdiagnostics.co.uk/services/citan-servicing`
* Display path: `citan/servicing`
* Key headlines: Mobile Citan Servicing, Mercedes Citan Service, Minor Service From £175, Major Service From £295, W415 & W420 Covered, Genuine Mercedes Parts, Service Reset Included

**Mercedes Van Servicing & Brakes** (ad strength: Average)
* Final URL: `tripointdiagnostics.co.uk/services/mercedes-van-servicing`
* Display path: `servicing/van-service`
* Key headlines: Mobile Mercedes Van Service, Mercedes Van Servicing, Mercedes Van Brakes, Minor Service From £175, Major Service From £295, Brake Packages Available, Genuine Mercedes Parts

**Sprinter Brakes** (ad strength: Good)
* Final URL: `tripointdiagnostics.co.uk/services/sprinter-brakes`
* Display path: `sprinter/brakes`
* Key headlines: Mobile Sprinter Brakes, Mercedes Sprinter Brakes, Front Pads From £149, Pads & Discs From £329, W906 & W907 Covered, Fixed Price Brake Packages

**Vito Brakes** (ad strength: Good)
* Final URL: `tripointdiagnostics.co.uk/services/vito-brakes`
* Display path: `vito/brakes`
* Key headlines: Mobile Vito Brakes, Mercedes Vito Brakes, Front Pads From £169, Pads & Discs From £319, W639 & W447 Covered, Fixed Price Brake Packages

**Citan Brakes** (ad strength: Poor)
* Final URL: `tripointdiagnostics.co.uk/services/citan-brakes`
* Display path: `citan/brakes`
* Key headlines: Mobile Citan Brakes, Mercedes Citan Brakes, Front Pads From £169, Pads & Discs From £319, W415 & W420 Covered, Fixed Price Brake Packages

### Tuning campaign

**Van Load & Driveability Tune** (ad strength: Average)
* Final URL: `tripointdiagnostics.co.uk/services/van-load-driveability-tune`
* Display path: `load-tune/driveability`
* Key headlines: Van Load Tune From £199, Driveability Tune For Vans, Commercial Van Tuning, Better Pull Under Load, Less Gear Hunting, Diagnostic Pre-Check, Original File Backed Up
* Key descriptions: Work-focused van tuning for better low-end pull, less lag and easier loaded driving; Diagnostic pre-check completed first, with original file backup and handover notes

**Van Economy Tune** (ad strength: Poor)
* Final URL: `tripointdiagnostics.co.uk/services/van-economy-tune`
* Display path: `economy/van-tune`
* Key headlines: Van Economy Tune, Economy Tune From £199, Commercial Van Economy, Smoother Cruising Tune, Mobile Van Tuning Visit, Diagnostic Pre-Check, Original File Backed Up, Insurance Handover Note
* Key descriptions: Economy-focused commercial van tuning with a diagnostic pre-check before any work; Designed for smoother cruising and everyday drivability, with original file backup

**Fleet Van Tuning** (ad strength: Average)
* Final URL: `tripointdiagnostics.co.uk/services/fleet-van-tuning`
* Display path: `fleet/van-tuning`
* Key headlines: Fleet Van Tuning, Fleet Tuning From £169, Depot Tuning Days, 3+ Vans Volume Pricing, Commercial Fleet Remaps, Diagnostic Pre-Checks, Economy Or Load Tunes, Original Files Backed Up
* Key descriptions: Fleet van tuning for 3+ vehicles with depot visits, reports and diagnostic pre-checks; Choose economy or load-focused calibrations to suit route, payload and daily use

---

## 9) ASSET INVENTORY

### Sitelinks

Sitelinks are applied at **ad group level** and vary by campaign. Examples observed in the data:

| Sitelink title | Description lines | URL | Used in |
|----------------|-------------------|-----|---------|
| Standard Diagnosis | Full system scan onsite / Live data and fault finding | /services/diagnostic-callout | Diagnostics ad groups |
| Areas We Cover | Kent & SE London / 1 hour radius | /areas-covered | Multiple ad groups |
| Load Tune | Better pull under load / Smoother driveability | /services/van-load-driveability-tune | Tuning ad groups |

Additional sitelinks exist for VOR Diagnostics, Pre-Purchase, Sprinter Servicing, Pricing, and other service pages across different ad groups.

### Callouts

Applied at ad group level:
* Dealer-Level Tools
* Live Data Testing
* Written Fix Plan
* Xentry Service Reset
* Fixed Zone Pricing
* Mobile to Your Location
* Kent & SE London Coverage

### Structured snippets

* **Types:** Sprinter W906, Sprinter W907, Sprinter W910, Vito W447, Courier Vans, Fleet Operators, Trade Referrals

### Business logo

* Active and eligible across campaigns (shows in search results)

### Images

Multiple images uploaded at ad group level. One image was disapproved; the rest are eligible.

### Phone call asset

* Call interaction tracking is enabled (see advanced bid adjustments). One call recorded to date.

---

## 10) LOCATION TARGETING

All campaigns share the **same location inclusion and exclusion lists**.

### Targeted locations

The targeting is granular, using a mix of **named towns** and **UK postcode districts** covering Kent and South East London:

**Named towns (15):**
Chatham, Dartford, Gravesend, Grays, Hildenborough, Maidstone, Northfleet, Rochester, Royal Tunbridge Wells, Sevenoaks, Sittingbourne, Swanley, Tonbridge, West Malling, Westerham

**SE London postcodes (13):**
SE3, SE4, SE6, SE7, SE8, SE9, SE10, SE12, SE13, SE18, SE19, SE20, SE23, SE24, SE25, SE26, SE28

**BR postcodes (8):**
BR1, BR2, BR3, BR4, BR5, BR6, BR7, BR8

**DA postcodes (14):**
DA1, DA2, DA3, DA4, DA5, DA6, DA7, DA8, DA9, DA10, DA11, DA12, DA13, DA14, DA15, DA16, DA17

**TN postcodes (9):**
TN4, TN8, TN9, TN10, TN11, TN12, TN13, TN14, TN15, TN16

**ME postcodes (15):**
ME1, ME2, ME3, ME4, ME5, ME6, ME7, ME8, ME9, ME10, ME14, ME15, ME16, ME17, ME18, ME19, ME20

**Additional named locations (20+):**
Woolwich, Sidcup, Bexley, Biggin Hill, West Wickham, Beckenham, Bexleyheath, Forest Hill, Aylesford, Welling, Petts Wood, Belvedere, London Borough of Lewisham, Bromley, Royal Borough of Greenwich, Orpington, Speldhurst, Wrotham, Hever, Southborough, Pembury, Erith, Meopham, Chislehurst, Stone, Swanscombe and Greenhithe, Paddock Wood, Kings Hill, Snodland, West Kingsdown

### Excluded locations (26 per campaign)

The same exclusion list is applied to all campaigns to prevent out-of-area spend:

**UK nations/regions:** Scotland, Wales, Northern Ireland, North West, North East, South West

**Cities/boroughs far from coverage area:** Birmingham, Manchester, Brighton, Reading, Luton, Harrow, Fulham, Westminster, Hampstead, Southall, Stanwell, Wembley, Cosham, Hamble-le-Rice, East Leake, London Borough of Islington, Royal Borough of Kensington and Chelsea

**Islands:** Jersey, Guernsey, Isle of Man

### Alignment with business zones

This targeting broadly aligns with the business zone model (up to 60 minutes one-way from Tonbridge/Eltham bases). The postcode/town list covers Zones A through C. No bid adjustments are applied at location level.

---

## 11) AD SCHEDULE

All campaigns run on the **same schedule**: **6:00 AM to 10:00 PM**, every day (Mon-Sat active, Sunday included in schedule but minimal volume).

No bid adjustments are applied to any time slot.

This matches the public-facing business hours (Mon to Sat: 6 AM to 10 PM).

### Early performance by day (across all campaigns)

| Day | Clicks | Impr | Conv | Cost |
|-----|--------|------|------|------|
| Monday | 20 | 166 | 3 | £46.14 |
| Tuesday | 29 | 390 | 2 | £62.32 |
| Wednesday | 16 | 215 | 1 | £41.91 |
| Thursday | 12 | 160 | 0 | £54.70 |
| Friday | 0 | 0 | 0 | £0.00 |
| Saturday | 0 | 0 | 0 | £0.00 |

Note: very early data; Friday/Saturday may simply not have been reached yet in the learning phase.

---

## 12) BID STRATEGY AND BUDGET

### Bid strategy

* **Type:** Portfolio Maximize Conversions
* **Name:** Portfolio Maximize Conversions_8037735488-300-1774410365953-
* **Created:** 3/25/2026 3:46 AM
* **Target CPA:** not set
* **Target ROAS:** not set
* **Status:** learning

The portfolio strategy and its shared £70/day budget are applied across all 3 active campaigns, allowing Google to distribute spend towards whichever campaign/ad group is most likely to generate conversions.

### Budget

* £70/day shared portfolio budget across all 3 campaigns
* Daily budget type
* Google distributes the £70 across all 3 campaigns based on conversion opportunity

### Learning phase context

All campaigns show status reason "bidding strategy learning; unknown". During this phase:
* CPCs may be volatile
* Conversion data is too sparse for reliable optimisation
* Google is still exploring which auctions to enter
* Performance should not be judged until learning completes (typically 1-2 weeks with sufficient conversion volume)

---

## 13) EARLY PERFORMANCE SNAPSHOT

### Per-campaign summary

| Campaign | Impr | Clicks | CTR | Cost | Conv | Conv rate | CPC | Cost/conv |
|----------|------|--------|-----|------|------|-----------|-----|-----------|
| Diagnostics & VOR | 49 | 11 | 22.45% | £42.14 | 3 | 27.27% | £3.83 | £14.05 |
| Servicing & Brakes | 124 | 4 | 3.23% | £14.12 | 3 | 75.00% | £3.53 | £4.71 |
| Tuning | 66 | 2 | 3.03% | £3.35 | 0 | 0% | £1.67 | -- |

### Top performing ad groups (by conversions)

| Ad group | Campaign | Conv | Cost | Cost/conv |
|----------|----------|------|------|-----------|
| Pre-Purchase Van Check | Diagnostics & VOR | 3 | £5.13 | £1.71 |
| Sprinter Servicing | Servicing & Brakes | 3 | £14.12 | £4.71 |

### Top performing keywords (by conversions)

| Keyword | Match | Ad group | Conv | Cost | CPC |
|---------|-------|----------|------|------|-----|
| `"pre purchase vehicle check"` | Phrase | Pre-Purchase Van Check | 3 | £5.13 | £1.03 |
| `mercedes sprinter service` | Broad | Sprinter Servicing | 3 | £12.41 | £4.14 |

### Conversion notes

* 6 total conversions across the account
* All conversions have come from 2 ad groups (Pre-Purchase and Sprinter Servicing)
* The Diagnostics & VOR campaign shows a high CTR (22.45%) but conversions are concentrated in Pre-Purchase, not Standard Diagnosis
* Tuning campaign has zero conversions so far
* Conversion tracking appears to be measuring `generate_lead` events (contact form, booking, payment) via GA4 — see `website-context-prompt.md` section 13 for event definitions

---

## 14) REMOVED / LEGACY CAMPAIGN CONTEXT

### TriPoint | Search | Mercedes Vans | Kent + SE London

This was the original single-campaign structure. It contained these ad groups:

| Ad group | Focus | Impr | Clicks | Spend | Outcome |
|----------|-------|------|--------|-------|---------|
| Brand \| TriPoint | Brand terms | 25 | 0 | £0 | Low volume, no clicks |
| Mercedes Vans \| Diagnostics (Core) | General Mercedes diagnostics | 219 | 18 | £43.19 | Good CTR, 0 conversions |
| Xentry / SCN / Module Coding | Coding and STAR diagnostics | 138 | 11 | £25.15 | Decent volume, 0 conversions |
| Intermittent Electrical \| CAN Faults | Auto electrician, wiring faults | 722 | 72 | £175.28 | High volume, 0 conversions |
| Sprinter Limp Mode \| Reduced Power | Limp mode, reduced power, turbo faults | 8 | 0 | £0 | Low volume |
| Emissions Diagnostics \| AdBlue/SCR/DPF | Emissions-specific keywords | 0 | 0 | £0 | All keywords paused |
| VOR \| Urgent Triage | VOR, van wont start | 7 | 1 | £2.49 | Low volume |

### VOR & Mercedes Van Diagnostics (earlier iteration)

| Ad group | Focus | Notes |
|----------|-------|-------|
| Ad group 1 | Broad diagnostics catch-all | Generic phrase match keywords; removed |
| Mercedes Sprinter Diagnostics (General) | Sprinter-specific diagnostics | Detailed exact/phrase keywords; removed |

### Why removed

The single-campaign structure was consolidated into three separate campaigns to:
* Prevent budget competition between diagnostics, servicing, and tuning
* Enable cleaner negative keyword separation
* Allow per-family budget control
* Match the website's service architecture (three distinct service families)

The strongest keyword themes were carried forward into the new campaign structure. Legacy ad groups are `Not eligible` with reason "campaign removed" or "ad group removed; campaign removed".

---

## 15) CROSS-REFERENCES

### Master business prompt (`tpd-master-prompt.md`)

* **Section 8** — Service architecture (diagnostics / servicing / tuning families)
* **Section 12** — Google Ads / paid search context (strategic truths, campaign-family logic, tuning ad rules, measurement mindset)
* **Section 5** — Non-negotiable compliance position (emissions, manufacturer independence, tuning framing)
* **Section 7** — Pricing model (zone-based pricing that ads reference as "from £X")
* **Section 14** — Brand / visual / tone guidelines (no hype, no fake urgency, no "we are the number 1")

### Website context prompt (`website-context-prompt.md`)

* **Section 6** — Complete sitemap (every landing page URL that ads point to)
* **Section 7** — Page-by-page content (what the user sees after clicking the ad)
* **Section 8** — Service catalog (titles and descriptions matching ad copy)
* **Section 9** — Pricing model (zone A prices used in ad headlines)
* **Section 10** — Contact and conversion flows (what counts as a conversion)
* **Section 13** — Analytics (GA4 event definitions for conversion tracking)

### Landing page alignment

| Ad group | Final URL path | Website page |
|----------|---------------|--------------|
| Standard Diagnosis | /services/diagnostic-callout | Standard Diagnosis service page |
| VOR / Urgent Van Diagnostics | /services/vor-van-diagnostics | VOR Diagnosis service page |
| Pre-Purchase Van Check | /services/pre-purchase-digital-health-check | Pre-Purchase Digital Health Check page |
| AdBlue / DPF / Emissions | /services/diagnostic-callout | Standard Diagnosis (merged topic) |
| Limp Mode / Derate | /services/diagnostic-callout | Standard Diagnosis (merged topic) |
| Sprinter Servicing | /services/sprinter-servicing | Sprinter Servicing page |
| Vito Servicing | /services/vito-servicing | Vito Servicing page |
| Citan Servicing | /services/citan-servicing | Citan Servicing page |
| Mercedes Van Servicing & Brakes | /services/mercedes-van-servicing | Mercedes Van Servicing hub |
| Sprinter Brakes | /services/sprinter-brakes | Sprinter Brakes page |
| Vito Brakes | /services/vito-brakes | Vito Brakes page |
| Citan Brakes | /services/citan-brakes | Citan Brakes page |
| Van Load & Driveability Tune | /services/van-load-driveability-tune | Van Load & Driveability Tune page |
| Van Economy Tune | /services/van-economy-tune | Van Economy Tune page |
| Fleet Van Tuning | /services/fleet-van-tuning | Fleet Van Tuning page |
