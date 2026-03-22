/**
 * Loads gtag.js once: Google Ads + optional GA4 (VITE_GA4_MEASUREMENT_ID).
 * Must run before React so analytics.ts can queue events until gtag exists.
 */
declare global {
    interface Window {
        dataLayer: unknown[];
        gtag?: (...args: unknown[]) => void;
    }
}

import { GA4_MEASUREMENT_ID, GOOGLE_ADS_CUSTOMER_ID } from '@/config/analyticsPublic';

const GOOGLE_ADS_ID = GOOGLE_ADS_CUSTOMER_ID;
const GA4_ID = GA4_MEASUREMENT_ID;

function injectGtag() {
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
        window.dataLayer.push(args);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GOOGLE_ADS_ID);
    if (GA4_ID && GA4_ID.startsWith('G-')) {
        gtag('config', GA4_ID, {
            send_page_view: true,
        });
    }

    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
    document.head.appendChild(s);
}

function loadWhenIdle() {
    if (typeof window === 'undefined') return;
    if ('requestIdleCallback' in window && typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(() => injectGtag(), { timeout: 3000 });
    } else {
        window.addEventListener('load', () => setTimeout(injectGtag, 0));
    }
}

loadWhenIdle();
