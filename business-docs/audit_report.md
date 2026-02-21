# TriPoint Diagnostics - Website Audit Report

**Audited:** 17 February 2026  
**Site:** [tripointdiagnostics.co.uk](https://tripointdiagnostics.co.uk)  
**Method:** Full source-code review (React SPA codebase) + business document cross-reference  
**Companion files:** [page_inventory.csv](file:///c:/Users/JamiePC/Desktop/TriPoint-site/business-docs/page_inventory.csv) · [issues.json](file:///c:/Users/JamiePC/Desktop/TriPoint-site/business-docs/issues.json)

---

## Executive Summary

The site is **well-structured, well-designed, and content-rich** for a pre-launch mobile diagnostics brand. It clearly communicates services, pricing, compliance stance, and coverage - which puts it ahead of most competitors.

However, there are **4 critical issues** that must be fixed before inviting any real traffic, and **10 high/medium issues** that will significantly impact conversions, trust, and SEO if left unaddressed.

### Scorecard

| Area | Score | Comment |
|------|:-----:|---------|
| **Content & Clarity** | 8/10 | Excellent service copy, clear pricing, strong compliance messaging |
| **Trust & Social Proof** | 3/10 | No reviews, no founder bio, broken social links, placeholder legal pages |
| **Conversion Paths** | 5/10 | Good CTAs on most pages, but contact form is broken, no mobile sticky CTA, dead-end gallery |
| **SEO** | 4/10 | Good meta titles/descriptions, but SPA with no SSR, no schema markup, no OG images |
| **Legal / Compliance** | 4/10 | Legal pages exist but have unfilled placeholders; no cookie consent; no company registration |
| **Technical** | 7/10 | Clean codebase, Plausible analytics, zone calculator works, booking system functional |

---

## 🚨 Critical Issues (Fix Before Launch)

### 1. Contact form doesn't send emails
**Where:** [/contact](https://tripointdiagnostics.co.uk/contact)  
**Problem:** The form's `onSubmit` handler saves to `localStorage` only. There's a `TODO` comment: *"Wire to email API (SendGrid, Resend, Zapier/Make webhook, etc.)"*  
**Impact:** Every enquiry submitted via the contact page is **silently lost**. Zero leads captured.  
**Fix:** Wire to ZeptoMail (already used in booking system) or a Make/Zapier webhook.

### 2. Pricing mismatch - hero claims "from £80" but minimum is £120
**Where:** [/ (homepage hero)](https://tripointdiagnostics.co.uk/)  
**Problem:** The hero stats section says "Diagnostics from £80+" but the actual cheapest service (Diagnostic Callout, Zone A) is £120 per `siteConfig.pricing`.  
**Impact:** Bait-and-switch feeling. Visitors expecting £80 see £120 on the pricing page → immediate trust damage.  
**Fix:** Update to "from £120" or remove the pricing stat from the hero entirely.

### 3. Legal pages have unfilled placeholders
**Where:** [/legal/privacy-policy](https://tripointdiagnostics.co.uk/legal/privacy-policy), [/legal/terms](https://tripointdiagnostics.co.uk/legal/terms), [/legal/disclaimer](https://tripointdiagnostics.co.uk/legal/disclaimer)  
**Problem:** All three legal pages display bracketed placeholders:
- `Last updated: [DATE]`
- `Contact us at [EMAIL]` / `[EMAIL ADDRESS]`
- `Payment methods accepted: [SPECIFY METHODS]`

**Impact:** Unprofessional and non-compliant with UK GDPR. Visitors who scroll down will see these and question legitimacy.  
**Fix:** Fill in all placeholders with actual values. Takes 5 minutes.

### 4. Social media links point to REPLACE_ME URLs
**Where:** Footer (all pages)  
**Problem:** `siteConfig.social` has:
```
facebook: 'https://facebook.com/REPLACE_ME'
instagram: 'https://instagram.com/REPLACE_ME'
google: 'https://g.page/REPLACE_ME'
```
**Impact:** Clicking any social icon leads to a broken page. Destroys credibility.  
**Fix:** Set up real social profiles and update `site.ts`, or hide social icons until profiles exist.

---

## ⚠️ High Priority Issues

### 5. No customer reviews or testimonials
**Where:** Entire site  
**Impact:** Social proof is the #1 trust driver for local service businesses. The site has zero reviews, testimonials, or rating widgets. Without them, every trust claim is unverified.  
**Fix:** Add a testimonials section to the homepage. Even 2-3 real quotes from early customers or beta testers would help. Long-term, embed Google Reviews.

### 6. No company registration details
**Where:** Footer  
**Impact:** If TriPoint is a Ltd company, UK Companies Act 2006 requires company name, number, and registered office on the website. Even as a sole trader, displaying this builds trust.  
**Fix:** Add to footer bottom: Company number, registered office, VAT number (if registered).

### 7. No cookie/storage consent banner
**Where:** All pages  
**Impact:** The site uses `localStorage` to store contact form submissions and booking data. UK PECR requires informed consent for persistent client-side storage.  
**Fix:** Add a minimal consent banner. Plausible is cookieless, so the banner can be lightweight.

### 8. SPA with no server-side rendering
**Where:** Technical  
**Impact:** The entire site is client-rendered React. Search engines (especially Bing) may not fully index the content. All pages return the same empty HTML shell to crawlers.  
**Fix:** Short-term: use Prerender.io or a pre-rendering plugin. Long-term: migrate to Next.js or Astro.

### 9. No structured data / Schema.org markup
**Where:** All pages  
**Impact:** Missing LocalBusiness, Service, and FAQPage schemas means no rich snippets in search results - no star ratings, no FAQ dropdowns, no pricing in SERPs.  
**Fix:** Add JSON-LD for LocalBusiness (homepage), Service (each service page), FAQPage (/faq).

### 10. No sticky mobile CTA
**Where:** All pages on mobile  
**Impact:** On mobile, the "Book Now" button is behind the hamburger menu. As users scroll long pages (homepage has 500+ lines of content), there's no visible conversion path. Likely losing 30%+ of mobile conversions.  
**Fix:** Add a fixed bottom bar on mobile with "Book" and "Call" buttons.

### 11. About page has no founder bio or photo
**Where:** [/about](https://tripointdiagnostics.co.uk/about)  
**Impact:** For a sole-trader mobile service, customers want to know WHO is coming to their home/depot. A faceless "About" page is a missed trust opportunity.  
**Fix:** Add a short founder section: name, photo, background, training/certifications.

---

## 📋 Medium Priority Issues

| # | Issue | Page | Fix |
|---|-------|------|-----|
| 12 | Homepage title not keyword-optimised | / | Lead meta title with "Mobile Vehicle Diagnostics Kent" |
| 13 | No OG image for social sharing | All | Create 1200×630px branded image, set in SEO config |
| 14 | Coverage page has "map coming soon" placeholder | /coverage | Replace with static Google Maps embed |
| 15 | Blog is entirely placeholder | /blog | Remove from nav until content exists, or write 1-2 articles |
| 16 | WhatsApp link uses non-standard format | All | Test `wa.me/message/NROKKGS6QK54G1` on iOS + Android; may need fallback |
| 17 | Analytics tracking incomplete | Various | Add `trackEvent` to all CTAs, not just header/footer phone |
| 18 | Our Work gallery has no CTA | /our-work | Add "Book a diagnostic" CTA at bottom of gallery |
| 19 | ServiceCard from-prices don't match config prices | /, /services | Update fromPrice props to match siteConfig.pricing values |
| 20 | Operating hours on site differ from business reality | Footer, /faq | Hours rotate AM/PM weeks; clarify or adjust displayed hours |

---

## 💡 Low Priority / Nice-to-Have

| # | Issue | Fix |
|---|-------|-----|
| 21 | Hero images have empty alt text | Add keyword-rich alt text |
| 22 | FAQ accordion has basic accessibility | Add `aria-controls` and `role="region"` |
| 23 | No WebP image format used | Convert gallery images to WebP with srcset |
| 24 | Services dropdown 200ms blur timeout | Increase timeout or use hover intent |

---

## 🔑 Questions for the Business Owner

These require your input before I can fix them:

1. **What is the correct "from" price for the homepage hero?** The hero says £80+ but your pricing doc says Zone A Diagnostic Callout is £120. Should I update to £120, or is there a cheaper service I'm not seeing?

2. **What is your company registration status?** Sole trader, Ltd, or partnership? I need this for the footer and legal pages.

3. **Do you have real social media profiles?** Facebook, Instagram, Google Business Profile? If not, should I hide the social links from the footer?

4. **What payment methods do you accept?** The Terms page has a `[SPECIFY METHODS]` placeholder. Bank transfer? Card payment via Square/Stripe? Cash?

5. **Do you have any customer reviews or testimonials?** Even WhatsApp messages or screenshots of positive feedback would work as initial social proof.

6. **Should the blog stay in navigation?** It's entirely placeholder. Recommend hiding it until you have at least one article.

7. **Are you happy with the rotating AM/PM hours schedule?** The site shows "6am–10pm Mon–Sat" but your pricing doc shows rotating availability based on your day-job shifts. Which should the site display?

8. **Do you want a Google Maps embed on the coverage page?** This would replace the "interactive map coming soon" placeholder. I can add a static map with your two base locations and radius circles.

---

## Recommended Fix Priority (Effort-Weighted)

```
Week 1 (Launch blockers - all 30min or less):
├── Fix contact form → wire to ZeptoMail/webhook
├── Fix hero pricing → change £80 to £120
├── Fill legal page placeholders
├── Fix or hide social links
└── Add company registration to footer

Week 2 (High-impact wins):
├── Add sticky mobile CTA bar
├── Add founder bio + photo to About page
├── Add testimonials section to homepage
├── Add OG image
└── Replace coverage map placeholder

Week 3 (SEO & polish):
├── Add Schema.org structured data
├── Set up pre-rendering (Prerender.io)
├── Complete analytics event tracking
├── Add gallery page CTA
└── Blog: write 1 article or hide from nav
```

---

## What's Already Good

The site has a lot going for it. Worth acknowledging:

- ✅ **Clear, professional copy** - service descriptions are specific, honest, and outcome-focused
- ✅ **Transparent pricing** - zone-based model with no hidden fees is a major trust builder
- ✅ **Compliance-first positioning** - emissions stance is well-articulated and legally sound
- ✅ **Real work photos** - 50+ genuine photos with category filter (no stock images)
- ✅ **Working booking system** - Google Calendar integration, zone calculator, deposit info
- ✅ **Privacy-friendly analytics** - Plausible instead of Google Analytics
- ✅ **Good SEO foundations** - every page has meta title, description, canonical URL, and OG tags
- ✅ **Mobile-responsive design** - all pages render well on mobile (just needs sticky CTA)
- ✅ **Dark theme execution** - the electric blue / dark surface aesthetic is modern and premium
