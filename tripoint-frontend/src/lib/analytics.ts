import ReactGA from 'react-ga4';

const GA_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;

const DEBUG =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('debug_tracking');

export function initAnalytics() {
    if (!GA_ID) return;
    ReactGA.initialize(GA_ID, {
        testMode: import.meta.env.DEV,
        gaOptions: { debug_mode: DEBUG, send_page_view: false },
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

export function trackSocialClick(platform: string, clickLocation = 'footer') {
    if (!GA_ID) return;
    ReactGA.event('social_click', {
        platform,
        click_location: clickLocation,
    });
}
