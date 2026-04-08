/**
 * Non-blocking handoff to POST /api/leads/track (Sheets + dedupe on server).
 * Never includes message body, phone, email, reg, VIN, full postcode, or free-text notes.
 *
 * journey_id: one UUID per browser session (grouping).
 * event_id: fresh UUID per request (idempotency key; repeat actions in-session are allowed).
 */
import { GA4_MEASUREMENT_ID } from '@/config/analyticsPublic';
import { getAttribution } from '@/lib/attribution';
import { getPageAnalyticsContext, type PageAnalyticsContext } from '@/lib/analyticsContext';

const JOURNEY_ID_KEY = 'tripoint_journey_id';
/** Legacy session key (pre-journey_id model); migrated once into JOURNEY_ID_KEY. */
const LEGACY_SESSION_LEAD_ID_KEY = 'tripoint_lead_id';
/** Session cache for GA4 IDs when gtag resolves after cookie write (MP linkage). */
const GA_CLIENT_STORAGE_KEY = 'tripoint_ga_client_id';
const GA_SESSION_STORAGE_KEY = 'tripoint_ga_session_id';
const API_PATH = '/api/leads/track';

export type LeadChannel = 'phone' | 'whatsapp' | 'contact_form' | 'booking' | 'payment';

export interface LeadTrackPayload {
    journey_id: string;
    event_id: string;
    event_name: string;
    occurred_at: string;
    lead_channel: LeadChannel;
    click_location?: string;
    nav_label?: string;
    nav_target?: string;
    contact_method?: string;
    lead_type?: string;
    form_name?: string;
    service_interest?: string;
    payment_completed?: boolean;
    page: string;
    title: string;
    page_type: string;
    service_category: string;
    service_name: string;
    area_slug: string;
    booking_step?: string;
    zone_result?: string;
    content_type?: string;
    content_id?: string;
    gclid?: string;
    gbraid?: string;
    wbraid?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    lead_value?: number;
    /** GA4 web client_id from _ga cookie (Measurement Protocol linkage) */
    ga_client_id?: string;
    /** GA4 session id from _ga_<STREAM> cookie */
    ga_session_id?: string;
    user_agent?: string;
    /** Google Ads order_id / gtag transaction_id (e.g. session journey_id). */
    order_id?: string;
    /** SHA-256 hex for enhanced conversions (no raw PII). */
    hashed_email?: string;
    hashed_phone?: string;
}

function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
}

/** G-XXXX → suffix for _ga_XXXX cookie name */
function measurementIdToCookieSuffix(measurementId: string): string {
    return measurementId.replace(/^G-/i, '');
}

function readGa4IdsFromCookies(): { ga_client_id?: string; ga_session_id?: string } {
    if (typeof document === 'undefined') return {};

    const ga = getCookie('_ga');
    let ga_client_id: string | undefined;
    if (ga) {
        const parts = ga.split('.');
        if (parts.length >= 4 && parts[0].startsWith('GA')) {
            ga_client_id = parts.slice(2).join('.');
        }
    }

    const stream = measurementIdToCookieSuffix(GA4_MEASUREMENT_ID);
    const sessionCookie = getCookie(`_ga_${stream}`);
    let ga_session_id: string | undefined;
    if (sessionCookie) {
        const parts = sessionCookie.split('.');
        if (parts.length >= 3 && (parts[0] === 'GS1' || parts[0] === 'GS2')) {
            ga_session_id = parts[2];
        }
    }

    const out: { ga_client_id?: string; ga_session_id?: string } = {};
    if (ga_client_id) out.ga_client_id = ga_client_id;
    if (ga_session_id) out.ga_session_id = ga_session_id;
    return out;
}

function readGa4IdsFromSessionStorage(): { ga_client_id?: string; ga_session_id?: string } {
    if (typeof sessionStorage === 'undefined') return {};
    try {
        const c = sessionStorage.getItem(GA_CLIENT_STORAGE_KEY)?.trim();
        const s = sessionStorage.getItem(GA_SESSION_STORAGE_KEY)?.trim();
        const out: { ga_client_id?: string; ga_session_id?: string } = {};
        if (c) out.ga_client_id = c;
        if (s) out.ga_session_id = s;
        return out;
    } catch {
        return {};
    }
}

/**
 * Ask gtag for client_id / session_id and cache in sessionStorage (callbacks are async).
 * Call after ReactGA.initialize so MP payloads have IDs even if _ga is not written yet.
 */
function hydrateGa4IdsViaGtag(measurementId: string): void {
    if (typeof window === 'undefined' || !measurementId) return;
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag !== 'function') return;
    try {
        gtag('get', measurementId, 'client_id', (cid: unknown) => {
            const v = cid != null ? String(cid).trim() : '';
            if (!v) return;
            try {
                sessionStorage.setItem(GA_CLIENT_STORAGE_KEY, v);
            } catch {
                /* ignore */
            }
        });
        gtag('get', measurementId, 'session_id', (sid: unknown) => {
            const v = sid != null ? String(sid).trim() : '';
            if (!v) return;
            try {
                sessionStorage.setItem(GA_SESSION_STORAGE_KEY, v);
            } catch {
                /* ignore */
            }
        });
    } catch {
        /* ignore */
    }
}

/**
 * Schedule gtag hydration (immediate + delayed retries while the tag finishes loading).
 */
export function scheduleGa4WebIdHydration(measurementId: string): void {
    if (typeof window === 'undefined' || !measurementId) return;
    const run = () => hydrateGa4IdsViaGtag(measurementId);
    run();
    window.setTimeout(run, 250);
    window.setTimeout(run, 1500);
}

/**
 * Read GA4 web stream identifiers: cookies first, then sessionStorage from gtag hydration.
 * No PII; opaque IDs only.
 */
export function getGa4WebIds(): { ga_client_id?: string; ga_session_id?: string } {
    const fromCookies = readGa4IdsFromCookies();
    const fromStore = readGa4IdsFromSessionStorage();
    const out: { ga_client_id?: string; ga_session_id?: string } = {};
    out.ga_client_id = fromCookies.ga_client_id ?? fromStore.ga_client_id;
    out.ga_session_id = fromCookies.ga_session_id ?? fromStore.ga_session_id;
    return out;
}

export function getSessionJourneyId(): string {
    if (typeof window === 'undefined') return '';
    try {
        let id = sessionStorage.getItem(JOURNEY_ID_KEY);
        if (!id) {
            const legacy = sessionStorage.getItem(LEGACY_SESSION_LEAD_ID_KEY);
            if (legacy) {
                id = legacy;
                sessionStorage.setItem(JOURNEY_ID_KEY, id);
                sessionStorage.removeItem(LEGACY_SESSION_LEAD_ID_KEY);
            }
        }
        if (!id) {
            id = crypto.randomUUID();
            sessionStorage.setItem(JOURNEY_ID_KEY, id);
        }
        return id;
    } catch {
        return crypto.randomUUID();
    }
}

export function getEventId(): string {
    return crypto.randomUUID();
}

function resolveClickIdType(attr: ReturnType<typeof getAttribution>): string {
    if (attr.gclid) return 'gclid';
    if (attr.wbraid) return 'wbraid';
    if (attr.gbraid) return 'gbraid';
    return 'none';
}

function basePayload(
    event_name: string,
    lead_channel: LeadChannel,
    ctx: PageAnalyticsContext,
): LeadTrackPayload {
    const attr = getAttribution();
    const ga4 = getGa4WebIds();
    const title = typeof document !== 'undefined' ? document.title : '';
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    return {
        journey_id: getSessionJourneyId(),
        event_id: getEventId(),
        event_name,
        occurred_at: new Date().toISOString(),
        lead_channel,
        page: ctx.page,
        title,
        page_type: ctx.page_type,
        service_category: ctx.service_category,
        service_name: ctx.service_name,
        area_slug: ctx.area_slug,
        gclid: attr.gclid,
        gbraid: attr.gbraid,
        wbraid: attr.wbraid,
        utm_source: attr.utm_source,
        utm_medium: attr.utm_medium,
        utm_campaign: attr.utm_campaign,
        utm_content: attr.utm_content,
        utm_term: attr.utm_term,
        ga_client_id: ga4.ga_client_id,
        ga_session_id: ga4.ga_session_id,
        ...(ua ? { user_agent: ua } : {}),
    };
}

export function buildLeadTrackPayload(
    event_name: string,
    lead_channel: LeadChannel,
    extras: Partial<Omit<LeadTrackPayload, 'journey_id' | 'event_id'>> = {},
    contextOverride?: PageAnalyticsContext,
    options?: { eventId?: string },
): LeadTrackPayload {
    const ctx = contextOverride ?? getPageAnalyticsContext();
    const base = basePayload(event_name, lead_channel, ctx);
    const { journey_id: _j, event_id: _e, ...safeExtras } = extras as Partial<LeadTrackPayload>;
    const payload: LeadTrackPayload = {
        ...base,
        ...safeExtras,
        journey_id: base.journey_id,
        event_id: options?.eventId?.trim() || base.event_id,
        occurred_at: extras.occurred_at ?? base.occurred_at,
    };

    if (import.meta.env.DEV) {
        const attr = getAttribution();
        const clickType = resolveClickIdType(attr);
        console.log(
            `[LeadTracking] payload for ${event_name}: click_id=${clickType} | ga_client_id=${payload.ga_client_id ? 'yes' : 'no'} | ga_session_id=${payload.ga_session_id ? 'yes' : 'no'}`,
        );
    }

    return payload;
}

function sendPayload(payload: LeadTrackPayload, blocking: boolean): void {
    const body = JSON.stringify(payload);
    const url = typeof window !== 'undefined' ? `${window.location.origin}${API_PATH}` : API_PATH;

    try {
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            const blob = new Blob([body], { type: 'application/json' });
            const ok = navigator.sendBeacon(url, blob);
            if (ok) return;
        }
    } catch {
        /* fall through */
    }

    const run = () => {
        fetch(API_PATH, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true,
        }).catch(() => {
            /* ignore */
        });
    };

    if (blocking) {
        void run();
    } else {
        run();
    }
}

/** Phone/WhatsApp: non-blocking. Contact/booking/payment success: blocking optional. */
export function trackLeadToBackend(
    event_name: string,
    lead_channel: LeadChannel,
    extras?: Partial<Omit<LeadTrackPayload, 'journey_id' | 'event_id'>>,
    options?: { blocking?: boolean; context?: PageAnalyticsContext; eventId?: string },
): void {
    try {
        const payload = buildLeadTrackPayload(event_name, lead_channel, extras ?? {}, options?.context, {
            eventId: options?.eventId,
        });
        sendPayload(payload, options?.blocking ?? false);
    } catch {
        /* never break UX */
    }
}
