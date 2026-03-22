import { GOOGLE_ADS_CUSTOMER_ID } from '@/config/analyticsPublic';
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
// Event queue - buffers events until gtag is available, then flushes
// ---------------------------------------------------------------------------
type QueuedEvent = { name: string; params: Record<string, string> };
const queue: QueuedEvent[] = [];
const conversionQueue: string[] = [];

function flushConversions() {
    if (typeof window === 'undefined' || !window.gtag) return;
    while (conversionQueue.length) {
        const sendTo = conversionQueue.shift()!;
        window.gtag('event', 'conversion', { send_to: sendTo });
        if (DEBUG) console.log('[track:conversion:flushed]', sendTo);
    }
}

/** Drain queued events + conversions (call whenever gtag is available) */
function flush() {
    if (typeof window === 'undefined' || !window.gtag) return;
    while (queue.length) {
        const ev = queue.shift()!;
        window.gtag('event', ev.name, ev.params);
        if (DEBUG) console.log('[track:flushed]', ev.name, ev.params);
    }
    flushConversions();
}

// Poll for gtag readiness (gtag loads async from google-tag-init.ts)
if (typeof window !== 'undefined') {
    const interval = setInterval(() => {
        if (window.gtag) {
            flush();
            clearInterval(interval);
        }
    }, 200);
    setTimeout(() => clearInterval(interval), 10_000);
}

// ---------------------------------------------------------------------------
// UUID helper for event deduplication
// ---------------------------------------------------------------------------
function eventId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Google Ads conversion send_to (AW-XXXXX/label)
// Create one conversion action per goal in Google Ads → Goals → Conversions.
// ---------------------------------------------------------------------------
const AW = GOOGLE_ADS_CUSTOMER_ID;
const DEFAULT_BOOKING_LABEL = 'cJwYCL_clPwbEOfymvdC';

function buildSendTo(label: string | undefined): string | null {
    if (!label || !label.trim()) return null;
    return `${AW}/${label.trim()}`;
}

/** Resolved booking/payment primary send_to (always has a value for core funnel) */
const bookingSendToResolved =
    buildSendTo(import.meta.env.VITE_GOOGLE_ADS_CONV_BOOKING) ?? `${AW}/${DEFAULT_BOOKING_LABEL}`;

/**
 * All conversion labels - set env vars to the label segment AFTER AW-XXXXX/
 * WhatsApp defaults to booking label until you create a dedicated “WhatsApp lead” action.
 */
export const CONVERSIONS = {
    /** Primary lead: WhatsApp (falls back to booking label until VITE_GOOGLE_ADS_CONV_WHATSAPP is set) */
    whatsappLead: buildSendTo(import.meta.env.VITE_GOOGLE_ADS_CONV_WHATSAPP) ?? bookingSendToResolved,
    emailLead: buildSendTo(import.meta.env.VITE_GOOGLE_ADS_CONV_EMAIL),
    phoneCall: buildSendTo(import.meta.env.VITE_GOOGLE_ADS_CONV_PHONE),
    contactForm: buildSendTo(import.meta.env.VITE_GOOGLE_ADS_CONV_CONTACT),
    /** User reached slot calendar (postcode + service validated) */
    bookingAvailability: buildSendTo(import.meta.env.VITE_GOOGLE_ADS_CONV_BOOKING_AVAILABILITY),
    /** User picked a time slot */
    bookingSlotSelected: buildSendTo(import.meta.env.VITE_GOOGLE_ADS_CONV_BOOKING_SLOT),
    /** Booking API success without redirect to payment (manual review or confirmed without deposit gateway) */
    bookingConfirmed: bookingSendToResolved,
    /** Deposit / card payment completed */
    paymentCompleted:
        buildSendTo(import.meta.env.VITE_GOOGLE_ADS_CONV_PAYMENT) ?? bookingSendToResolved,
    /** “Book now” CTAs site-wide - optional micro-conversion */
    bookNowClick: buildSendTo(import.meta.env.VITE_GOOGLE_ADS_CONV_BOOK_NOW),
} as const;

// ---------------------------------------------------------------------------
// Typed event names (GA4 + Google Ads audience / key events)
// ---------------------------------------------------------------------------
export type AnalyticsEvent =
    | 'click_book_now'
    | 'click_whatsapp'
    | 'click_phone_header'
    | 'click_phone_footer'
    | 'click_email_footer'
    | 'click_social'
    | 'click_contact'
    | 'click_review_prompt'
    | 'submit_contact_form'
    | 'submit_booking_request'
    | 'confirm_booking'
    | 'view_service'
    | 'view_booking_form'
    | 'booking_availability_ok'
    | 'booking_slot_selected'
    | 'payment_completed'
    | 'zone_check';

// ---------------------------------------------------------------------------
// Main tracking function
// ---------------------------------------------------------------------------

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
        flush(); // drain any pre-gtag queue first
        window.gtag('event', eventName, eventParams);
    } else {
        queue.push({ name: eventName, params: eventParams });
        if (DEBUG) console.log('[track:queued]', eventName);
    }
};

// ---------------------------------------------------------------------------
// Google Ads conversion measurement (queued until gtag ready)
// ---------------------------------------------------------------------------

export const trackConversion = (sendTo: string | null | undefined) => {
    if (!sendTo) {
        if (DEBUG) console.log('[track:conversion]', 'skipped (no send_to)');
        return;
    }
    if (typeof window !== 'undefined' && window.gtag) {
        flush();
        window.gtag('event', 'conversion', { send_to: sendTo });
        if (DEBUG) console.log('[track:conversion]', sendTo);
    } else {
        conversionQueue.push(sendTo);
        if (DEBUG) console.log('[track:conversion:queued]', sendTo);
    }
};

/** tel: - GA event + Ads phone conversion when label configured */
export function trackPhoneLead(place: 'footer' | (string & {})) {
    if (place === 'footer') trackEvent('click_phone_footer');
    else trackEvent('click_phone_header', { location: place });
    trackConversion(CONVERSIONS.phoneCall);
}

/** WhatsApp - primary lead path; fires Ads conversion (defaults to booking label until WHATSAPP env set) */
export function trackWhatsAppLead(location: string) {
    trackEvent('click_whatsapp', { location });
    trackConversion(CONVERSIONS.whatsappLead);
}

/** Email mailto - footer / contact */
export function trackEmailLead(location: string) {
    trackEvent('click_email_footer', { location });
    trackConversion(CONVERSIONS.emailLead);
}

/** Book Online CTAs - optional Ads micro-conversion if VITE_GOOGLE_ADS_CONV_BOOK_NOW set */
export function trackBookNowClick(location: string) {
    trackEvent('click_book_now', { location });
    trackConversion(CONVERSIONS.bookNowClick);
}
