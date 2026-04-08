const DEFAULT_GA4_ID = 'G-TE618HYTQ2';
const DEFAULT_GOOGLE_ADS_ID = 'AW-17966741863';

function sanitizeMeasurementId(id: string | undefined): string | undefined {
    if (!id || typeof id !== 'string') return undefined;
    const cleaned = id.trim().replace(/#.*$/, '').trim();
    return cleaned.length > 0 ? cleaned : undefined;
}

/**
 * Public measurement IDs. Override via .env.local for local dev.
 */
export const GA4_MEASUREMENT_ID =
    sanitizeMeasurementId(import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined) ?? DEFAULT_GA4_ID;

/** Google Ads conversion tag (enhanced conversions for leads). */
export const GOOGLE_ADS_MEASUREMENT_ID =
    sanitizeMeasurementId(import.meta.env.VITE_GOOGLE_ADS_MEASUREMENT_ID as string | undefined) ??
    DEFAULT_GOOGLE_ADS_ID;

/**
 * Full send_to for contact-form conversion, e.g. AW-17966741863/AbCdEfGhIj.
 * Leave unset in dev to skip firing the Ads conversion pixel.
 */
export const GOOGLE_ADS_CONVERSION_SEND_TO = sanitizeMeasurementId(
    import.meta.env.VITE_GOOGLE_ADS_CONVERSION_SEND_TO as string | undefined,
);
