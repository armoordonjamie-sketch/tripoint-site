import ReactGA from 'react-ga4';
import { GA4_MEASUREMENT_ID } from '@/config/analyticsPublic';

const GA_ID = GA4_MEASUREMENT_ID;

let initialized = false;

function isDebugMode(): boolean {
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

    console.log('[GA4] Initialised', {
        measurementId: GA_ID,
        testModeEnabled: false,
        debug_mode: debug,
    });
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
    safeGa(() => {
        ReactGA.send({
            hitType: 'pageview',
            page: p,
            title: title ?? (typeof document !== 'undefined' ? document.title : ''),
        });
    });
    if (isDebugMode()) console.log('[GA4] page_view', p);
}

export function trackPhoneClick(clickLocation: string, navLabel = 'Call') {
    if (!GA_ID) return;
    safeGa(() => {
        ReactGA.event('phone_click', {
            click_location: clickLocation,
            nav_label: navLabel,
            contact_method: 'phone',
        });
    });
    if (isDebugMode()) console.log('[GA4] phone_click', clickLocation);
}

export function trackWhatsAppClick(clickLocation: string, navLabel = 'WhatsApp') {
    if (!GA_ID) return;
    safeGa(() => {
        ReactGA.event('whatsapp_click', {
            click_location: clickLocation,
            nav_label: navLabel,
            contact_method: 'whatsapp',
        });
    });
    if (isDebugMode()) console.log('[GA4] whatsapp_click', clickLocation);
}

export function trackNavClick(navTarget: string, navLabel: string, clickLocation: string) {
    if (!GA_ID) return;
    safeGa(() => {
        ReactGA.event('nav_click', {
            nav_target: navTarget,
            nav_label: navLabel,
            click_location: clickLocation,
        });
    });
    if (isDebugMode()) console.log('[GA4] nav_click', navTarget, clickLocation);
}

export function trackContactFormSuccess(serviceInterest?: string) {
    if (!GA_ID) return;
    safeGa(() => {
        ReactGA.event('generate_lead', {
            lead_type: 'contact_form',
            form_name: 'contact_form',
            service_interest: serviceInterest ?? 'general',
        });
    });
    if (isDebugMode()) console.log('[GA4] generate_lead contact_form', { service_interest: serviceInterest });
}

export function trackBookingConfirmation(serviceInterest?: string) {
    if (!GA_ID) return;
    safeGa(() => {
        ReactGA.event('generate_lead', {
            lead_type: 'booking_request',
            form_name: 'booking_form',
            service_interest: serviceInterest ?? 'general',
        });
    });
    if (isDebugMode()) console.log('[GA4] generate_lead booking_request', { service_interest: serviceInterest });
}

export function trackPaymentSuccess(serviceInterest?: string) {
    if (!GA_ID) return;
    safeGa(() => {
        ReactGA.event('generate_lead', {
            lead_type: 'booking_request',
            form_name: 'booking_form',
            payment_completed: true,
            service_interest: serviceInterest ?? 'general',
        });
    });
    if (isDebugMode()) console.log('[GA4] generate_lead payment_completed', { service_interest: serviceInterest });
}

export function trackSocialClick(platform: string, clickLocation = 'footer') {
    if (!GA_ID) return;
    safeGa(() => {
        ReactGA.event('social_click', {
            platform,
            click_location: clickLocation,
        });
    });
    if (isDebugMode()) console.log('[GA4] social_click', platform, clickLocation);
}

/**
 * Self-test utility for dev/debug. Call from console: window.__tripointGa4Test?.()
 * Only available when import.meta.env.DEV or ?debug_tracking=1
 */
export function registerGa4Test() {
    if (typeof window === 'undefined') return;
    const isDev = import.meta.env.DEV;
    const hasDebugParam = new URLSearchParams(window.location.search).has('debug_tracking');
    if (!isDev && !hasDebugParam) return;

    (window as unknown as { __tripointGa4Test?: () => void }).__tripointGa4Test = () => {
        console.log('[GA4] Running self-test events...');
        trackPhoneClick('self_test');
        trackWhatsAppClick('self_test');
        trackNavClick('/booking', 'Book Now (test)', 'self_test');
        trackContactFormSuccess('self_test');
        console.log('[GA4] Self-test complete. Check GA4 DebugView.');
    };
}
