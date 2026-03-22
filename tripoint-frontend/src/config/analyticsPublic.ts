/**
 * Public measurement IDs. Override via .env.local for staging.
 */
export const GA4_MEASUREMENT_ID =
    (import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined) ?? 'G-M8NGL90Z1R';
