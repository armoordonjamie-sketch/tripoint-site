const DEFAULT_GA4_ID = 'G-TE618HYTQ2';
const DEFAULT_GOOGLE_ADS_ID = 'AW-17966741863';

/** GA4 web stream IDs always look like G-XXXXXXXX (not the numeric Property ID from Admin). */
export function isValidGa4MeasurementId(id: string): boolean {
    return /^G-[A-Z0-9]+$/i.test(id.trim());
}

function sanitizeMeasurementId(id: string | undefined): string | undefined {
    if (!id || typeof id !== 'string') return undefined;
    let cleaned = id.trim().replace(/#.*$/, '').trim();
    cleaned = cleaned.replace(/^['"]|['"]$/g, '').trim();
    if (!cleaned) return undefined;
    if (!isValidGa4MeasurementId(cleaned)) {
        console.warn(
            '[GA4] Ignoring invalid VITE_GA4_MEASUREMENT_ID. Use GA4 Admin → Data streams → your Web stream → Measurement ID (G-…), not the Property number:',
            cleaned,
        );
        return undefined;
    }
    return cleaned;
}

/**
 * Public measurement IDs. Override via .env.local for local dev.
 */
export const GA4_MEASUREMENT_ID =
    sanitizeMeasurementId(import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined) ?? DEFAULT_GA4_ID;

/** Google Ads conversion tag (enhanced conversions for leads). */
function sanitizeGoogleAdsId(id: string | undefined): string | undefined {
    if (!id || typeof id !== 'string') return undefined;
    let cleaned = id.trim().replace(/#.*$/, '').trim().replace(/^['"]|['"]$/g, '').trim();
    if (!cleaned) return undefined;
    if (!/^AW-[A-Z0-9-]+$/i.test(cleaned)) {
        console.warn('[Google Ads] Invalid VITE_GOOGLE_ADS_MEASUREMENT_ID (expected AW-…). Ignoring:', cleaned);
        return undefined;
    }
    return cleaned;
}

export const GOOGLE_ADS_MEASUREMENT_ID =
    sanitizeGoogleAdsId(import.meta.env.VITE_GOOGLE_ADS_MEASUREMENT_ID as string | undefined) ??
    DEFAULT_GOOGLE_ADS_ID;

/**
 * Full send_to for contact-form conversion, e.g. AW-17966741863/AbCdEfGhIj.
 * Leave unset in dev to skip firing the Ads conversion pixel.
 */
function sanitizeAdsConversionSendTo(id: string | undefined): string | undefined {
    if (!id || typeof id !== 'string') return undefined;
    let cleaned = id.trim().replace(/#.*$/, '').trim().replace(/^['"]|['"]$/g, '').trim();
    if (!cleaned) return undefined;
    if (!/^AW-[A-Z0-9-]+\/.+$/i.test(cleaned)) {
        console.warn(
            '[Google Ads] Invalid VITE_GOOGLE_ADS_CONVERSION_SEND_TO (expected AW-…/conversion_label). Ignoring:',
            cleaned,
        );
        return undefined;
    }
    return cleaned;
}

export const GOOGLE_ADS_CONVERSION_SEND_TO = sanitizeAdsConversionSendTo(
    import.meta.env.VITE_GOOGLE_ADS_CONVERSION_SEND_TO as string | undefined,
);
