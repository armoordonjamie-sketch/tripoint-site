const DEFAULT_GA4_ID = 'G-TE618HYTQ2';

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
