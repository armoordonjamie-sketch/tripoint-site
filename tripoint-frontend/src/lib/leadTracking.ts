/**
 * Non-blocking handoff to POST /api/leads/track (Sheets + dedupe on server).
 * Never includes message body, phone, email, reg, VIN, full postcode, or free-text notes.
 *
 * journey_id: one UUID per browser session (grouping).
 * event_id: fresh UUID per request (idempotency key; repeat actions in-session are allowed).
 */
import { getAttribution } from '@/lib/attribution';
import { getPageAnalyticsContext, type PageAnalyticsContext } from '@/lib/analyticsContext';

const JOURNEY_ID_KEY = 'tripoint_journey_id';
/** Legacy session key (pre–journey_id model); migrated once into JOURNEY_ID_KEY. */
const LEGACY_SESSION_LEAD_ID_KEY = 'tripoint_lead_id';
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

function basePayload(
    event_name: string,
    lead_channel: LeadChannel,
    ctx: PageAnalyticsContext,
): LeadTrackPayload {
    const attr = getAttribution();
    const title = typeof document !== 'undefined' ? document.title : '';
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
    };
}

export function buildLeadTrackPayload(
    event_name: string,
    lead_channel: LeadChannel,
    extras: Partial<Omit<LeadTrackPayload, 'journey_id' | 'event_id'>> = {},
    contextOverride?: PageAnalyticsContext,
): LeadTrackPayload {
    const ctx = contextOverride ?? getPageAnalyticsContext();
    const base = basePayload(event_name, lead_channel, ctx);
    const { journey_id: _j, event_id: _e, ...safeExtras } = extras as Partial<LeadTrackPayload>;
    return {
        ...base,
        ...safeExtras,
        journey_id: base.journey_id,
        event_id: base.event_id,
        occurred_at: extras.occurred_at ?? base.occurred_at,
    };
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
    options?: { blocking?: boolean; context?: PageAnalyticsContext },
): void {
    try {
        const payload = buildLeadTrackPayload(event_name, lead_channel, extras ?? {}, options?.context);
        sendPayload(payload, options?.blocking ?? false);
    } catch {
        /* never break UX */
    }
}
