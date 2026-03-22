/**
 * Public measurement IDs (also visible in gtag in DevTools). Override via .env.local for staging.
 */
export const GA4_MEASUREMENT_ID =
    (import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined) ?? 'G-M8NGL90Z1R';

export const GOOGLE_ADS_CUSTOMER_ID =
    (import.meta.env.VITE_GOOGLE_ADS_ID as string | undefined) ?? 'AW-17966741863';
