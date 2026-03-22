# GA4 Implementation Plan (react-ga4, no Google Ads)

Full GA4 setup using react-ga4. All Google Ads code removed.

---

## 1. Install react-ga4

```bash
npm install react-ga4
```

---

## 2. Remove Google Ads and gtag

### Files to delete or gut

- **[src/lib/google-tag-init.ts](tripoint-frontend/src/lib/google-tag-init.ts)** – Delete. react-ga4 loads GA4 directly; no gtag needed.

### Files to edit

- **[src/config/analyticsPublic.ts](tripoint-frontend/src/config/analyticsPublic.ts)** – Remove `GOOGLE_ADS_CUSTOMER_ID`. Keep only:

```ts
export const GA4_MEASUREMENT_ID =
    (import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined) ?? 'G-M8NGL90Z1R';
```

- **[src/entry-client.tsx](tripoint-frontend/src/entry-client.tsx)** – Remove `import './lib/google-tag-init';`.

- **[.env.example](tripoint-frontend/.env.example)** – Remove all `VITE_GOOGLE_ADS_*` vars. Keep only `VITE_GA4_MEASUREMENT_ID`.

- **[src/vite-env.d.ts](tripoint-frontend/src/vite-env.d.ts)** – Remove all `VITE_GOOGLE_ADS_*` declarations.

- **index.html** – Remove any `gtag` or Google Ads scripts if present (likely none; gtag was injected by google-tag-init).

---

## 3. New analytics module (react-ga4)

Replace [src/lib/analytics.ts](tripoint-frontend/src/lib/analytics.ts) with:

```ts
import ReactGA from 'react-ga4';

const GA_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;

const DEBUG =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('debug_tracking');

export function initAnalytics() {
    if (!GA_ID) return;
    ReactGA.initialize(GA_ID, {
        testMode: import.meta.env.DEV,
        gaOptions: { debug_mode: DEBUG },
    });
}

export function trackPageView(path?: string, title?: string) {
    if (!GA_ID) return;
    const p = path ?? window.location.pathname + window.location.search;
    ReactGA.send({
        hitType: 'pageview',
        page: p,
        title: title ?? document.title,
    });
    if (DEBUG) console.log('[GA4] page_view', p);
}

export function trackPhoneClick(clickLocation: string, navLabel = 'Call') {
    if (!GA_ID) return;
    ReactGA.event('phone_click', {
        click_location: clickLocation,
        nav_label: navLabel,
        contact_method: 'phone',
    });
    if (DEBUG) console.log('[GA4] phone_click', clickLocation);
}

export function trackWhatsAppClick(clickLocation: string, navLabel = 'WhatsApp') {
    if (!GA_ID) return;
    ReactGA.event('whatsapp_click', {
        click_location: clickLocation,
        nav_label: navLabel,
        contact_method: 'whatsapp',
    });
    if (DEBUG) console.log('[GA4] whatsapp_click', clickLocation);
}

export function trackNavClick(navTarget: string, navLabel: string, clickLocation: string) {
    if (!GA_ID) return;
    ReactGA.event('nav_click', {
        nav_target: navTarget,
        nav_label: navLabel,
        click_location: clickLocation,
    });
    if (DEBUG) console.log('[GA4] nav_click', navTarget, clickLocation);
}

export function trackContactFormSuccess(serviceInterest?: string) {
    if (!GA_ID) return;
    ReactGA.event('generate_lead', {
        lead_type: 'contact_form',
        form_name: 'contact_form',
        service_interest: serviceInterest ?? 'general',
    });
    if (DEBUG) console.log('[GA4] generate_lead contact_form');
}

export function trackBookingConfirmation(serviceInterest?: string) {
    if (!GA_ID) return;
    ReactGA.event('generate_lead', {
        lead_type: 'booking_request',
        form_name: 'booking_form',
        service_interest: serviceInterest ?? 'general',
    });
    if (DEBUG) console.log('[GA4] generate_lead booking_request');
}

export function trackPaymentSuccess(serviceInterest?: string) {
    if (!GA_ID) return;
    ReactGA.event('generate_lead', {
        lead_type: 'booking_request',
        form_name: 'booking_form',
        payment_completed: true,
        service_interest: serviceInterest ?? 'general',
    });
    if (DEBUG) console.log('[GA4] generate_lead payment_completed');
}

// Optional: social / outbound
export function trackSocialClick(platform: string, clickLocation = 'footer') {
    if (!GA_ID) return;
    ReactGA.event('social_click', {
        platform,
        click_location: clickLocation,
    });
}
```

**Note:** react-ga4 uses `ReactGA.gtag()` for custom events. Use `ReactGA.send({ hitType: 'pageview', ... })` for page views (SPA route changes).

---

## 4. Init analytics at app bootstrap

**[src/entry-client.tsx](tripoint-frontend/src/entry-client.tsx):**

```ts
import { initAnalytics } from '@/lib/analytics';

initAnalytics();  // before createRoot/hydrateRoot

const root = document.getElementById('root')!;
const app = (
    <StrictMode>
        <HelmetProvider>
            <BrowserRouter>
                <RouteTracker />
                <AppRoutes />
            </BrowserRouter>
        </HelmetProvider>
    </StrictMode>
);
```

---

## 5. RouteTracker (page views)

Replace [src/components/RouteTracker.tsx](tripoint-frontend/src/components/RouteTracker.tsx) with:

```tsx
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/analytics';

export function RouteTracker() {
    const location = useLocation();
    const isFirst = useRef(true);

    useEffect(() => {
        if (isFirst.current) {
            isFirst.current = false;
            trackPageView(location.pathname + location.search, document.title);
            return;
        }
        trackPageView(location.pathname + location.search, document.title);
    }, [location.pathname, location.search]);

    return null;
}
```

- Send page_view on initial mount and on every route change.
- react-ga4 does not auto-send page_view on SPA navigation; manual tracking is required.

---

## 6. Call-site migration (remove Ads, use new helpers)

### Import changes

- Remove: `trackConversion`, `CONVERSIONS`, `trackBookNowClick`, `trackPhoneLead`, `trackWhatsAppLead`, `trackEmailLead`, `trackEvent`
- Use: `trackPhoneClick`, `trackWhatsAppClick`, `trackNavClick`, `trackContactFormSuccess`, `trackBookingConfirmation`, `trackPaymentSuccess`, `trackSocialClick`

### Mapping

| Old | New |
|-----|-----|
| `trackPhoneLead(loc)` | `trackPhoneClick(loc)` |
| `trackWhatsAppLead(loc)` | `trackWhatsAppClick(loc)` |
| `trackBookNowClick(loc)` | `trackNavClick('/booking', 'Book Now', loc)` |
| `trackEvent('click_contact')` or Contact NavLink | `trackNavClick('/contact', 'Contact', loc)` |
| `trackEvent('submit_contact_form')` + `trackConversion(CONVERSIONS.contactForm)` | `trackContactFormSuccess()` |
| `trackEvent('confirm_booking')` + `trackConversion(...)` | `trackBookingConfirmation(selectedCategory?.id)` |
| `trackEvent('payment_completed')` + `trackConversion(...)` | `trackPaymentSuccess()` |
| `trackEvent('click_social', { platform })` | `trackSocialClick(platform)` |
| `trackEmailLead(loc)` | Remove or add `trackEmailClick(loc)` (optional) |

### click_location values

Normalize to: `header`, `footer`, `sticky_mobile`, `hero`, `service_card`, `contact_page`, `booking`, etc.

### Files to update

- [Header](tripoint-frontend/src/components/Header.tsx) – Phone, WhatsApp, Book; add nav_click for Contact
- [Footer](tripoint-frontend/src/components/Footer.tsx) – Book, WhatsApp, Phone; add nav_click for Contact
- [MobileStickyCTA](tripoint-frontend/src/components/MobileStickyCTA.tsx) – Phone, WhatsApp, Book
- [ContactPage](tripoint-frontend/src/pages/ContactPage.tsx) – Form success, Phone, WhatsApp, Book
- [BookingScheduler](tripoint-frontend/src/components/BookingScheduler.tsx) – confirm_booking, booking_slot_selected, booking_availability_ok (drop or keep as optional); remove all trackConversion calls
- [PaymentSuccessPage](tripoint-frontend/src/pages/PaymentSuccessPage.tsx) – payment_completed → trackPaymentSuccess()
- All ~13 service pages, HomePage, ServicesPage, PricingPage, CoveragePage, AreaPage, BookingPage – replace old helpers with new ones

### Optional: drop micro-events

Per plan, simplify to 5 core events. Drop or ignore:

- `view_booking_form`, `booking_availability_ok`, `booking_slot_selected`, `zone_check` – unless you want funnel steps; if so, add a lightweight event like `booking_progress` with a step param.

---

## 7. Attribution (optional retention)

[src/lib/attribution.ts](tripoint-frontend/src/lib/attribution.ts) uses `getAttribution()` for UTM/click-id. If it was only for Google Ads, it can be removed or stubbed. If you use it for other purposes (e.g. server-side or marketing tools), keep it. The new analytics module does not depend on it.

---

## 8. Privacy policy

Update [PrivacyPolicyPage](tripoint-frontend/src/pages/legal/PrivacyPolicyPage.tsx) – remove references to "Google Ads conversion tracking" if present; keep GA4 analytics mention.

---

## 9. GA4 UI setup (manual)

1. **Enhanced Measurement** – On in Admin → Data streams → Web.
2. **Custom dimensions** (event-scoped):
   - `click_location`
   - `nav_label`
   - `nav_target`
   - `lead_type`
   - `form_name`
   - `service_interest`
3. **Key events** – Mark `generate_lead` (and optionally `phone_click`, `whatsapp_click`) as key events.
4. **DebugView** – Use `?debug_tracking=1` or GA4 DebugView to verify events.

---

## 10. Checklist

- [ ] `npm install react-ga4`
- [ ] Delete `src/lib/google-tag-init.ts`
- [ ] Remove Google Ads from `analyticsPublic.ts`, `.env.example`, `vite-env.d.ts`
- [ ] Remove `import './lib/google-tag-init'` from entry-client
- [ ] Replace `src/lib/analytics.ts` with new react-ga4 module
- [ ] Add `initAnalytics()` in entry-client
- [ ] Update RouteTracker to use `trackPageView`
- [ ] Update Header, Footer, MobileStickyCTA
- [ ] Update ContactPage, BookingScheduler, PaymentSuccessPage
- [ ] Update all service pages and landing pages
- [ ] Remove `trackConversion` / `CONVERSIONS` from all files
- [ ] Update PrivacyPolicyPage if needed
- [ ] Create custom dimensions in GA4
- [ ] Test with DebugView
