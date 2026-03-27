import ReactGA from 'react-ga4';
import { GA4_MEASUREMENT_ID } from '@/config/analyticsPublic';
import {
    getPageAnalyticsContext,
    getPageAnalyticsContextFromPath,
    getAnalyticsTitleForPath,
    type PageAnalyticsContext,
    type PageType,
    type ServiceCategoryAnalytics,
} from '@/lib/analyticsContext';
import { scheduleGa4WebIdHydration, trackLeadToBackend } from '@/lib/leadTracking';

const GA_ID = GA4_MEASUREMENT_ID;

let initialized = false;

function isDebugMode(): boolean {
    if (import.meta.env.PROD) return false;
    return typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug_tracking');
}

function safeGa<T>(fn: () => T): T | void {
    try {
        return fn();
    } catch (err) {
        if (import.meta.env.DEV || isDebugMode()) {
            console.warn('[GA4] Event failed:', err);
        }
    }
}

const testModeEnabled = false;

/** GA4 event params: page context (snake_case custom dimensions). */
export type PageContextGaParams = {
    page: string;
    page_type: PageType | string;
    service_category: ServiceCategoryAnalytics | string;
    service_name: string;
    area_slug: string;
};

function pathnameOnly(fullPath: string): string {
    return fullPath.split('?')[0]?.replace(/\/+$/, '') || '/';
}

export function getCurrentPageContextForGa(): PageContextGaParams {
    const c = getPageAnalyticsContext();
    return {
        page: c.page,
        page_type: c.page_type,
        service_category: c.service_category,
        service_name: c.service_name,
        area_slug: c.area_slug,
    };
}

function mergeGaParams(
    base: Record<string, string | number | boolean | undefined | null>,
    context?: PageAnalyticsContext,
): Record<string, string | number | boolean | undefined> {
    const c = context ?? getPageAnalyticsContext();
    const out: Record<string, string | number | boolean | undefined> = {};
    for (const [k, v] of Object.entries(base)) {
        if (v === null || v === undefined) continue;
        out[k] = typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ? v : String(v);
    }
    out.page = c.page;
    out.page_type = c.page_type;
    out.service_category = c.service_category;
    if (c.service_name) out.service_name = c.service_name;
    if (c.area_slug) out.area_slug = c.area_slug;
    return out;
}

export function initAnalytics() {
    if (typeof window !== 'undefined') {
        (window as unknown as { __tripointGa4Info?: () => Ga4Info }).__tripointGa4Info = getGa4Info;
    }

    if (import.meta.env.DEV && !GA_ID) {
        console.warn('[GA4] VITE_GA4_MEASUREMENT_ID is not set. Analytics disabled.');
        return;
    }
    if (!GA_ID) return;

    if (initialized) return;
    initialized = true;

    const debug = import.meta.env.PROD ? false : isDebugMode();
    ReactGA.initialize(GA_ID, {
        testMode: false,
        gaOptions: {
            debug_mode: debug,
            send_page_view: false,
        },
        gtagOptions: debug ? { debug_mode: true } : undefined,
    });

    scheduleGa4WebIdHydration(GA_ID);

    if (import.meta.env.DEV) {
        console.log('[GA4] Initialised', {
            measurementId: GA_ID,
            testModeEnabled: false,
            debug_mode: debug,
        });
    }
}

export interface Ga4Info {
    measurementId: string;
    analyticsInitialised: boolean;
    testModeEnabled: boolean;
    debugTrackingEnabled: boolean;
}

function getGa4Info(): Ga4Info {
    return {
        measurementId: GA_ID,
        analyticsInitialised: initialized,
        testModeEnabled,
        debugTrackingEnabled: isDebugMode(),
    };
}

export function trackPageView(path?: string, title?: string) {
    if (!GA_ID) return;
    const p = path ?? (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/');
    const ctx = getPageAnalyticsContextFromPath(p);
    const pathOnly = pathnameOnly(p);
    const resolvedTitle =
        (title && title.trim()) ||
        (typeof document !== 'undefined' ? document.title : '') ||
        getAnalyticsTitleForPath(pathOnly) ||
        '';
    safeGa(() => {
        ReactGA.send({
            hitType: 'pageview',
            page: ctx.page,
            title: resolvedTitle,
            page_type: ctx.page_type,
            service_category: ctx.service_category,
            service_name: ctx.service_name,
            area_slug: ctx.area_slug,
        });
    });
    if (isDebugMode()) console.log('[GA4] page_view', ctx.page, ctx);
}

export function trackPhoneClick(clickLocation: string, navLabel = 'Call', context?: PageAnalyticsContext) {
    if (GA_ID) {
        const params = mergeGaParams(
            {
                click_location: clickLocation,
                nav_label: navLabel,
                contact_method: 'phone',
            },
            context,
        );
        safeGa(() => {
            ReactGA.event('phone_click', params);
        });
    }
    trackLeadToBackend(
        'phone_click',
        'phone',
        {
            click_location: clickLocation,
            nav_label: navLabel,
            contact_method: 'phone',
        },
        { context },
    );
    if (isDebugMode()) console.log('[GA4] phone_click', clickLocation);
}

export function trackWhatsAppClick(clickLocation: string, navLabel = 'WhatsApp', context?: PageAnalyticsContext) {
    if (GA_ID) {
        const params = mergeGaParams(
            {
                click_location: clickLocation,
                nav_label: navLabel,
                contact_method: 'whatsapp',
            },
            context,
        );
        safeGa(() => {
            ReactGA.event('whatsapp_click', params);
        });
    }
    trackLeadToBackend(
        'whatsapp_click',
        'whatsapp',
        {
            click_location: clickLocation,
            nav_label: navLabel,
            contact_method: 'whatsapp',
        },
        { context },
    );
    if (isDebugMode()) console.log('[GA4] whatsapp_click', clickLocation);
}

export function trackNavClick(navTarget: string, navLabel: string, clickLocation: string, context?: PageAnalyticsContext) {
    if (!GA_ID) return;
    const params = mergeGaParams(
        {
            nav_target: navTarget,
            nav_label: navLabel,
            click_location: clickLocation,
        },
        context,
    );
    safeGa(() => {
        ReactGA.event('nav_click', params);
    });
    if (isDebugMode()) console.log('[GA4] nav_click', navTarget, clickLocation);
}

export interface GenerateLeadOptions {
    serviceInterest?: string;
    paymentCompleted?: boolean;
    /** GBP numeric when known (deposit, balance, or total) */
    valueGbp?: number;
    leadValue?: number;
    context?: PageAnalyticsContext;
    /** Reserved for server-side / future trusted flows only */
    leadQuality?: string;
    disqualifyReason?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    qualifiedLeadValue?: number;
}

export function trackContactFormSuccess(serviceInterest?: string, options?: GenerateLeadOptions) {
    const interest = serviceInterest ?? options?.serviceInterest ?? 'general';
    if (GA_ID) {
        const params = mergeGaParams(
            {
                lead_type: 'contact_form',
                form_name: 'contact_form',
                service_interest: interest,
                ...(options?.leadValue != null ? { lead_value: options.leadValue } : {}),
                ...(options?.leadQuality ? { lead_quality: options.leadQuality } : {}),
                ...(options?.disqualifyReason ? { disqualify_reason: options.disqualifyReason } : {}),
                ...(options?.vehicleMake ? { vehicle_make: options.vehicleMake } : {}),
                ...(options?.vehicleModel ? { vehicle_model: options.vehicleModel } : {}),
                ...(options?.qualifiedLeadValue != null ? { qualified_lead_value: options.qualifiedLeadValue } : {}),
            },
            options?.context,
        );
        safeGa(() => {
            ReactGA.event('generate_lead', params);
        });
    }
    trackLeadToBackend(
        'generate_lead',
        'contact_form',
        {
            lead_type: 'contact_form',
            form_name: 'contact_form',
            service_interest: interest,
        },
        { blocking: true, context: options?.context },
    );
    if (isDebugMode()) console.log('[GA4] generate_lead contact_form', { service_interest: interest });
}

export function trackBookingConfirmation(serviceInterest?: string, options?: GenerateLeadOptions) {
    const interest = serviceInterest ?? options?.serviceInterest ?? 'general';
    if (GA_ID) {
        const params = mergeGaParams(
            {
                lead_type: 'booking_request',
                form_name: 'booking_form',
                service_interest: interest,
                ...(options?.leadValue != null ? { lead_value: options.leadValue } : {}),
                ...(options?.valueGbp != null ? { value: options.valueGbp, currency: 'GBP' } : {}),
            },
            options?.context,
        );
        safeGa(() => {
            ReactGA.event('generate_lead', params);
        });
    }
    trackLeadToBackend(
        'generate_lead',
        'booking',
        {
            lead_type: 'booking_request',
            form_name: 'booking_form',
            service_interest: interest,
            payment_completed: options?.paymentCompleted,
            lead_value: options?.leadValue ?? options?.valueGbp,
        },
        { blocking: true, context: options?.context },
    );
    if (isDebugMode()) console.log('[GA4] generate_lead booking_request', { service_interest: interest });
}

export function trackPaymentSuccess(serviceInterest?: string, options?: GenerateLeadOptions) {
    const interest = serviceInterest ?? options?.serviceInterest ?? 'general';
    if (GA_ID) {
        const params = mergeGaParams(
            {
                lead_type: 'booking_request',
                form_name: 'booking_form',
                payment_completed: true,
                service_interest: interest,
                ...(options?.valueGbp != null ? { value: options.valueGbp, currency: 'GBP' } : {}),
                ...(options?.leadValue != null ? { lead_value: options.leadValue } : {}),
            },
            options?.context,
        );
        safeGa(() => {
            ReactGA.event('generate_lead', params);
        });
    }
    trackLeadToBackend(
        'generate_lead',
        'payment',
        {
            lead_type: 'booking_request',
            form_name: 'booking_form',
            payment_completed: true,
            service_interest: interest,
            lead_value: options?.leadValue ?? options?.valueGbp,
        },
        { blocking: true, context: options?.context },
    );
    if (isDebugMode()) console.log('[GA4] generate_lead payment_completed', { service_interest: interest });
}

export function trackSocialClick(platform: string, clickLocation = 'footer', context?: PageAnalyticsContext) {
    if (!GA_ID) return;
    const params = mergeGaParams({ platform, click_location: clickLocation }, context);
    safeGa(() => {
        ReactGA.event('social_click', params);
    });
    if (isDebugMode()) console.log('[GA4] social_click', platform, clickLocation);
}

export function trackSelectContent(
    contentType: string,
    contentId: string,
    extra?: Record<string, string | number | boolean | undefined>,
    context?: PageAnalyticsContext,
) {
    if (!GA_ID) return;
    const params = mergeGaParams(
        {
            content_type: contentType,
            content_id: contentId,
            ...extra,
        },
        context,
    );
    safeGa(() => {
        ReactGA.event('select_content', params);
    });
    if (isDebugMode()) console.log('[GA4] select_content', contentType, contentId);
}

export function trackSearch(searchTerm: string, searchLocation: string, context?: PageAnalyticsContext) {
    if (!GA_ID) return;
    const term = searchTerm.length > 80 ? searchTerm.slice(0, 80) : searchTerm;
    const params = mergeGaParams(
        {
            search_term: term,
            search_location: searchLocation,
        },
        context,
    );
    safeGa(() => {
        ReactGA.event('search', params);
    });
}

export function trackZoneLookup(zoneResult: string, context?: PageAnalyticsContext) {
    if (!GA_ID) return;
    const params = mergeGaParams({ zone_result: zoneResult }, context);
    safeGa(() => {
        ReactGA.event('zone_lookup', params);
    });
}

export type BookingFunnelEventName =
    | 'booking_start'
    | 'booking_step_view'
    | 'booking_service_select'
    | 'booking_slot_select'
    | 'booking_reserve_submit';

export function trackBookingFunnelEvent(
    eventName: BookingFunnelEventName,
    opts: {
        booking_step: string;
        service_interest?: string;
        lead_value?: number;
        context?: PageAnalyticsContext;
    },
) {
    if (!GA_ID) return;
    const params = mergeGaParams(
        {
            booking_step: opts.booking_step,
            ...(opts.service_interest ? { service_interest: opts.service_interest } : {}),
            ...(opts.lead_value != null ? { lead_value: opts.lead_value } : {}),
        },
        opts.context,
    );
    safeGa(() => {
        ReactGA.event(eventName, params);
    });
}

/**
 * Self-test utility for dev. Call from console: window.__tripointGa4Test?.()
 * Only available in development (not in production)
 */
export function registerGa4Test() {
    if (typeof window === 'undefined' || import.meta.env.PROD) return;

    (window as unknown as { __tripointGa4Test?: () => void }).__tripointGa4Test = () => {
        console.log('[GA4] Running self-test events...');
        trackPhoneClick('self_test');
        trackWhatsAppClick('self_test');
        trackNavClick('/booking', 'Book Now (test)', 'self_test');
        trackContactFormSuccess('self_test');
        console.log('[GA4] Self-test complete. Check GA4 DebugView.');
    };
}
