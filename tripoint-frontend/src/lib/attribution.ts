/**
 * Attribution / Click-ID capture for Google Ads conversion tracking.
 *
 * Captures gclid, gbraid, wbraid, and utm_* parameters from the landing URL
 * and persists them in localStorage + cookie fallback so they survive page
 * navigations within the SPA and are available for conversion events.
 */

const STORAGE_KEY = 'tp_attribution';
const COOKIE_NAME = 'tp_attribution';
const EXPIRY_DAYS = 30;

/** The params we care about. */
const ATTRIBUTION_KEYS = [
    'gclid',
    'gbraid',
    'wbraid',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
] as const;

export type AttributionData = Partial<Record<(typeof ATTRIBUTION_KEYS)[number], string>>;

// ---------------------------------------------------------------------------
// Cookie helpers (fallback when localStorage is unavailable / private mode)
// ---------------------------------------------------------------------------

function setCookie(name: string, value: string, days: number) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

function save(data: AttributionData) {
    const json = JSON.stringify(data);
    try {
        localStorage.setItem(STORAGE_KEY, json);
    } catch {
        /* quota / private mode */
    }
    setCookie(COOKIE_NAME, json, EXPIRY_DAYS);
}

function load(): AttributionData {
    try {
        const ls = localStorage.getItem(STORAGE_KEY);
        if (ls) return JSON.parse(ls) as AttributionData;
    } catch {
        /* ignore */
    }
    const ck = getCookie(COOKIE_NAME);
    if (ck) {
        try {
            return JSON.parse(ck) as AttributionData;
        } catch {
            /* ignore */
        }
    }
    return {};
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Call once on app bootstrap (main.tsx).
 * Reads attribution params from the current URL and merges them into storage.
 * New params overwrite old ones; existing params not present in the URL are kept.
 */
export function captureAttributionFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const incoming: AttributionData = {};
    let found = false;

    for (const key of ATTRIBUTION_KEYS) {
        const value = params.get(key);
        if (value) {
            incoming[key] = value;
            found = true;
        }
    }

    if (found) {
        // Merge: new values win, old values are preserved for missing keys
        const existing = load();
        save({ ...existing, ...incoming });
    }
}

/**
 * Returns the stored attribution data (or an empty object if none).
 */
export function getAttribution(): AttributionData {
    return load();
}

/**
 * Appends stored attribution params to a URL (for outbound links like WhatsApp).
 * Skips params already present in the URL.
 */
export function decorateUrl(url: string): string {
    const data = load();
    const entries = Object.entries(data).filter(([, v]) => v);
    if (entries.length === 0) return url;

    try {
        const u = new URL(url);
        for (const [key, value] of entries) {
            if (!u.searchParams.has(key)) {
                u.searchParams.set(key, value!);
            }
        }
        return u.toString();
    } catch {
        // Non-URL string (e.g. tel: link) – return as-is
        return url;
    }
}
