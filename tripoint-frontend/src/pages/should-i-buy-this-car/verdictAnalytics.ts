/**
 * Self-contained analytics for the "Should I Buy This Car?" experiment.
 *
 * Reuses the site's already-initialised react-ga4 instance (a singleton, set up in
 * src/lib/analytics.ts) AND pushes to window.dataLayer + console.log, so the three
 * conversion events are reliably fireable and easy to wire into Google Ads / GA4 later.
 *
 * Where each event fires:
 *   verdict_request_submit    - on a successful FREE verdict submit  (ShouldIBuyThisCarPage)
 *   affiliate_click           - just before opening the affiliate link (ThanksPage)
 *   priority_verdict_purchase - when the Priority success page loads   (PriorityThanksPage)
 */
import ReactGA from 'react-ga4';

export type VerdictEventName =
    | 'verdict_request_submit'
    | 'affiliate_click'
    | 'priority_verdict_purchase';

export function trackVerdictEvent(
    name: VerdictEventName,
    params: Record<string, unknown> = {},
): void {
    if (typeof window === 'undefined') return;

    // dataLayer (works with GTM and is independent of GA being ready yet)
    try {
        const w = window as unknown as { dataLayer?: unknown[] };
        w.dataLayer = w.dataLayer || [];
        w.dataLayer.push({ event: name, ...params });
    } catch {
        /* no-op */
    }

    // GA4 (same react-ga4 singleton the rest of the site uses)
    try {
        ReactGA.event(name, params as Record<string, string | number | boolean>);
    } catch {
        /* GA not initialised yet - dataLayer + console already captured it */
    }

    // Visible in DevTools so you can confirm the trigger before wiring Ads/GA4.
    console.log('[verdict analytics]', name, params);
}
