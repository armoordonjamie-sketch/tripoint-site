import ReactGA from 'react-ga4';
import { GA4_MEASUREMENT_ID, GOOGLE_ADS_CONVERSION_SEND_TO, GOOGLE_ADS_MEASUREMENT_ID } from '@/config/analyticsPublic';
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

/**
 * Verbose logs + GA4 gtag `debug_mode` (shows hits in GA4 DebugView).
 * - Local: add ?debug_tracking to the URL.
 * - Production: add ?ga_debug=1 (or set sessionStorage tripoint_ga_debug = "1" then reload).
 */
function isDebugMode(): boolean {
    if (typeof window === 'undefined') return false;
    const sp = new URLSearchParams(window.location.search);
    if (import.meta.env.PROD) {
        const q = sp.get('ga_debug');
        if (q === '1' || q === 'true' || sp.has('ga_debug')) {
            try {
                sessionStorage.setItem('tripoint_ga_debug', '1');
            } catch {
                /* ignore */
            }
            return true;
        }
        try {
            return sessionStorage.getItem('tripoint_ga_debug') === '1';
        } catch {
            return false;
        }
    }
    return sp.has('debug_tracking');
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
    out.page_path = c.page;
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

    const debug = isDebugMode();
    ReactGA.initialize(GA_ID, {
        testMode: false,
        gaOptions: {
            debug_mode: debug,
            send_page_view: false,
        },
        gtagOptions: debug ? { debug_mode: true } : undefined,
    });

    scheduleGa4WebIdHydration(GA_ID);

    const awId = GOOGLE_ADS_MEASUREMENT_ID;
    if (awId) {
        safeGa(() => {
            const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
            if (typeof gtag !== 'function') return;
            gtag('config', awId, {
                allow_enhanced_conversions: true,
                send_page_view: false,
            });
        });
        if (import.meta.env.DEV) {
            console.log('[Google Ads] gtag config', { measurementId: awId, allow_enhanced_conversions: true });
        }
    }

    if (import.meta.env.DEV || debug) {
        console.log('[GA4] Initialised', {
            measurementId: GA_ID,
            testModeEnabled: false,
            debug_mode: debug,
            hint: import.meta.env.PROD
                ? 'Open GA4 Admin → Configure → DebugView while using ?ga_debug=1'
                : 'Add ?debug_tracking for verbose logs + DebugView',
        });
    }
}

export type GoogleAdsContactConversionParams = {
    valueGbp: number;
    transactionId: string;
    hashedEmailHex: string;
    hashedPhoneHex: string;
};

/**
 * Tag-side enhanced conversions for leads: set hashed user_data then fire conversion.
 * No-op if VITE_GOOGLE_ADS_CONVERSION_SEND_TO is unset (recommended for local dev).
 */
export function fireGoogleAdsContactConversion(params: GoogleAdsContactConversionParams): void {
    const sendTo = GOOGLE_ADS_CONVERSION_SEND_TO;
    if (!sendTo) {
        if (import.meta.env.DEV || isDebugMode()) {
            console.warn('[Google Ads] Skipping conversion: VITE_GOOGLE_ADS_CONVERSION_SEND_TO not set');
        }
        return;
    }
    safeGa(() => {
        const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
        if (typeof gtag !== 'function') return;
        gtag('set', 'user_data', {
            sha256_email_address: params.hashedEmailHex,
            sha256_phone_number: params.hashedPhoneHex,
        });
        gtag('event', 'conversion', {
            send_to: sendTo,
            value: params.valueGbp,
            currency: 'GBP',
            transaction_id: params.transactionId,
        });
    });
    if (isDebugMode()) {
        console.log('[Google Ads] conversion fired', { send_to: sendTo, transaction_id: params.transactionId });
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
            page_path: ctx.page,
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
    /** Matches gtag transaction_id / Google Ads order_id (typically session journey_id). */
    orderId?: string;
    /** Override auto-generated event_id for this lead row (contact form). */
    eventId?: string;
    /** SHA-256 hex (enhanced conversions / API upload). */
    hashedEmail?: string;
    hashedPhone?: string;
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
            ReactGA.event('lead_contact_form', params);
        });
    }
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : undefined;
    trackLeadToBackend(
        'generate_lead',
        'contact_form',
        {
            lead_type: 'contact_form',
            form_name: 'contact_form',
            service_interest: interest,
            ...(options?.orderId ? { order_id: options.orderId } : {}),
            ...(ua ? { user_agent: ua } : {}),
            ...(options?.hashedEmail ? { hashed_email: options.hashedEmail } : {}),
            ...(options?.hashedPhone ? { hashed_phone: options.hashedPhone } : {}),
        },
        { blocking: true, context: options?.context, eventId: options?.eventId },
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
                ...(options?.vehicleMake ? { vehicle_make: options.vehicleMake } : {}),
                ...(options?.vehicleModel ? { vehicle_model: options.vehicleModel } : {}),
            },
            options?.context,
        );
        safeGa(() => {
            ReactGA.event('generate_lead', params);
            ReactGA.event('lead_booking_request', params);
        });
    }
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : undefined;
    trackLeadToBackend(
        'generate_lead',
        'booking',
        {
            lead_type: 'booking_request',
            form_name: 'booking_form',
            service_interest: interest,
            payment_completed: options?.paymentCompleted,
            lead_value: options?.leadValue ?? options?.valueGbp,
            ...(options?.orderId ? { order_id: options.orderId } : {}),
            ...(ua ? { user_agent: ua } : {}),
            ...(options?.hashedEmail ? { hashed_email: options.hashedEmail } : {}),
            ...(options?.hashedPhone ? { hashed_phone: options.hashedPhone } : {}),
        },
        { blocking: true, context: options?.context, eventId: options?.eventId },
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
                ...(options?.vehicleMake ? { vehicle_make: options.vehicleMake } : {}),
                ...(options?.vehicleModel ? { vehicle_model: options.vehicleModel } : {}),
            },
            options?.context,
        );
        safeGa(() => {
            ReactGA.event('generate_lead', params);
            ReactGA.event('booking_paid', params);
        });
    }
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : undefined;
    trackLeadToBackend(
        'generate_lead',
        'payment',
        {
            lead_type: 'booking_request',
            form_name: 'booking_form',
            payment_completed: true,
            service_interest: interest,
            lead_value: options?.leadValue ?? options?.valueGbp,
            ...(options?.orderId ? { order_id: options.orderId } : {}),
            ...(ua ? { user_agent: ua } : {}),
            ...(options?.hashedEmail ? { hashed_email: options.hashedEmail } : {}),
            ...(options?.hashedPhone ? { hashed_phone: options.hashedPhone } : {}),
        },
        { blocking: true, context: options?.context, eventId: options?.eventId },
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
    | 'booking_reserve_submit'
    | 'booking_check_availability'
    | 'booking_no_availability'
    | 'booking_form_error'
    | 'booking_abandoned';

export function trackBookingFunnelEvent(
    eventName: BookingFunnelEventName,
    opts: {
        booking_step: string;
        service_interest?: string;
        lead_value?: number;
        /** For booking_no_availability / booking_form_error */
        error_detail?: string;
        context?: PageAnalyticsContext;
    },
) {
    if (!GA_ID) return;
    const params = mergeGaParams(
        {
            booking_step: opts.booking_step,
            ...(opts.service_interest ? { service_interest: opts.service_interest } : {}),
            ...(opts.lead_value != null ? { lead_value: opts.lead_value } : {}),
            ...(opts.error_detail ? { error_detail: opts.error_detail.slice(0, 120) } : {}),
        },
        opts.context,
    );
    safeGa(() => {
        ReactGA.event(eventName, params);
    });
}

/** Scroll depth milestone (25 / 50 / 75 / 100) for engagement reporting. */
export function trackScrollDepth(percent: number, context?: PageAnalyticsContext) {
    if (!GA_ID) return;
    const params = mergeGaParams({ scroll_depth_percent: percent }, context);
    safeGa(() => {
        ReactGA.event('scroll_depth', params);
    });
}

/** FAQ accordion opened (question text truncated for GA4 param limits). */
export function trackFaqOpen(question: string, context?: PageAnalyticsContext) {
    if (!GA_ID) return;
    const q = question.length > 120 ? `${question.slice(0, 117)}...` : question;
    const params = mergeGaParams({ question: q, content_type: 'faq' }, context);
    safeGa(() => {
        ReactGA.event('faq_open', params);
    });
}

/**
 * Self-test utility for dev. Call from console: window.__tripointGa4Test?.()
 * Only available in development (not in production)
 */
export function registerGa4Test() {
    if (typeof window === 'undefined') return;

    (window as unknown as { __tripointGa4Test?: () => void }).__tripointGa4Test = () => {
        if (import.meta.env.PROD && !isDebugMode()) {
            console.warn('[GA4] Load the site with ?ga_debug=1 (then reload if needed), open DebugView, then run __tripointGa4Test() again.');
            return;
        }
        console.log('[GA4] Running self-test events...');
        trackPhoneClick('self_test');
        trackWhatsAppClick('self_test');
        trackNavClick('/booking', 'Book Now (test)', 'self_test');
        trackContactFormSuccess('self_test');
        console.log('[GA4] Self-test complete. Check GA4 DebugView.');
    };
}
