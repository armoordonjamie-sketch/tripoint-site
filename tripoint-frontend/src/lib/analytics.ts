import { getAttribution } from './attribution';

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

// ---------------------------------------------------------------------------
// Debug mode: add ?debug_tracking=1 to any URL to log events to console
// ---------------------------------------------------------------------------
const DEBUG =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('debug_tracking');

// ---------------------------------------------------------------------------
// Event queue – buffers events until gtag is available, then flushes
// ---------------------------------------------------------------------------
type QueuedEvent = { name: string; params: Record<string, string> };
const queue: QueuedEvent[] = [];
let flushed = false;

function flush() {
    if (flushed) return;
    if (typeof window === 'undefined' || !window.gtag) return;
    flushed = true;
    while (queue.length) {
        const ev = queue.shift()!;
        window.gtag('event', ev.name, ev.params);
        if (DEBUG) console.log('[track:flushed]', ev.name, ev.params);
    }
}

// Poll for gtag readiness (gtag loads async from index.html)
if (typeof window !== 'undefined') {
    const interval = setInterval(() => {
        if (window.gtag) {
            flush();
            clearInterval(interval);
        }
    }, 200);
    // Safety: stop polling after 10s
    setTimeout(() => clearInterval(interval), 10_000);
}

// ---------------------------------------------------------------------------
// UUID helper for event deduplication
// ---------------------------------------------------------------------------
function eventId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Typed event names (Google Ads conversion goals)
// ---------------------------------------------------------------------------
export type AnalyticsEvent =
    | 'click_book_now'
    | 'click_whatsapp'
    | 'click_phone_header'
    | 'click_phone_footer'
    | 'click_email_footer'
    | 'click_social'
    | 'click_contact'
    | 'submit_contact_form'
    | 'submit_booking_request'
    | 'confirm_booking'
    | 'view_service'
    | 'view_booking_form'
    | 'zone_check';

// ---------------------------------------------------------------------------
// Main tracking function
// ---------------------------------------------------------------------------

/**
 * Fire a custom GA4 / Google Ads event.
 *
 * - Merges stored attribution params (gclid, utm_*) automatically.
 * - Adds a unique event_id for deduplication.
 * - If gtag hasn't loaded yet, events are queued and flushed once ready.
 * - With ?debug_tracking=1, logs every call to console.
 */
export const trackEvent = (
    eventName: AnalyticsEvent,
    props?: Record<string, string | number | boolean>,
) => {
    const attribution = getAttribution();
    const eventParams: Record<string, string> = {
        event_id: eventId(),
        ...Object.fromEntries(
            Object.entries(attribution).filter(([, v]) => v != null) as [string, string][],
        ),
        ...(props
            ? Object.entries(props).reduce(
                (acc, [key, value]) => {
                    acc[key] = String(value);
                    return acc;
                },
                {} as Record<string, string>,
            )
            : {}),
    };

    if (DEBUG) {
        console.log(`[track] ${eventName}`, eventParams);
    }

    if (typeof window !== 'undefined' && window.gtag) {
        flush(); // flush any queued events first
        window.gtag('event', eventName, eventParams);
    } else {
        queue.push({ name: eventName, params: eventParams });
        if (DEBUG) console.log('[track:queued]', eventName);
    }
};

// ---------------------------------------------------------------------------
// Google Ads conversion measurement
// ---------------------------------------------------------------------------

/**
 * Fire a Google Ads conversion event (send_to format: AW-XXXXX/YYYYY).
 */
export const trackConversion = (sendTo: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'conversion', { send_to: sendTo });
        if (DEBUG) console.log('[track:conversion]', sendTo);
    }
};

// Conversion IDs from Google Ads
export const CONVERSIONS = {
    bookAppointment: 'AW-17966741863/cJwYCL_clPwbEOfymvdC',
} as const;
