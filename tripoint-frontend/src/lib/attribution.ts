/**
 * Attribution / Click-ID capture for Google Ads conversion tracking.
 *
 * Policy: latest-touch with non-blank preservation; new URL params merge into storage;
 * keys not in the URL keep prior values. Visits with no tracked params do not change storage.
 * Expiry: 90 days from last capture (when URL params were merged).
 *
 * Persists in localStorage + cookie fallback so data survives SPA navigation and is
 * available for phone/WhatsApp/contact/booking/payment lead events.
 */

const STORAGE_KEY = 'tp_attribution';
const COOKIE_NAME = 'tp_attribution';
const CAPTURED_AT_KEY = '_captured_at';
/** Google Ads-aligned window for first-party attribution storage */
export const EXPIRY_DAYS = 90;

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

type RawStored = AttributionData & { [CAPTURED_AT_KEY]?: string };

export type AttributionDebugInfo = {
    attribution: AttributionData;
    capturedAt: string | null;
    storageSource: 'localStorage' | 'cookie' | 'none';
    expired: boolean;
};

// ---------------------------------------------------------------------------
// Cookie helpers (fallback when localStorage is unavailable / private mode)
// ---------------------------------------------------------------------------

function setCookie(name: string, value: string, days: number) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    const secure = typeof window !== 'undefined' && window.location?.protocol === 'https:' ? ';Secure' : '';
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax${secure}`;
}

function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
}

// ---------------------------------------------------------------------------
// Internal load / save
// ---------------------------------------------------------------------------

function stripInternal(raw: RawStored): AttributionData {
    const { [CAPTURED_AT_KEY]: _c, ...rest } = raw;
    return rest;
}

function isExpired(capturedAt: string | undefined): boolean {
    if (!capturedAt) return false;
    const t = Date.parse(capturedAt);
    if (Number.isNaN(t)) return false;
    return Date.now() - t > EXPIRY_DAYS * 864e5;
}

function clearAllStorage() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        /* ignore */
    }
    deleteCookie(COOKIE_NAME);
}

function parseRaw(json: string): RawStored | null {
    try {
        return JSON.parse(json) as RawStored;
    } catch {
        return null;
    }
}

/** Load raw blob + which source won (localStorage preferred). */
function loadRawWithSource(): { raw: RawStored; source: 'localStorage' | 'cookie' | 'none' } {
    if (typeof window === 'undefined') {
        return { raw: {}, source: 'none' };
    }
    try {
        const ls = localStorage.getItem(STORAGE_KEY);
        if (ls) {
            const raw = parseRaw(ls);
            if (raw) return { raw, source: 'localStorage' };
        }
    } catch {
        /* ignore */
    }
    const ck = getCookie(COOKIE_NAME);
    if (ck) {
        const raw = parseRaw(ck);
        if (raw) return { raw, source: 'cookie' };
    }
    return { raw: {}, source: 'none' };
}

function loadRaw(): RawStored {
    return loadRawWithSource().raw;
}

function saveRaw(raw: RawStored) {
    const json = JSON.stringify(raw);
    try {
        localStorage.setItem(STORAGE_KEY, json);
    } catch {
        /* quota / private mode */
    }
    setCookie(COOKIE_NAME, json, EXPIRY_DAYS);
}

/**
 * Returns public attribution fields, or {} if expired or empty.
 */
function load(): AttributionData {
    const { raw, source } = loadRawWithSource();
    if (source === 'none') return {};
    const at = raw[CAPTURED_AT_KEY];
    if (isExpired(at)) {
        clearAllStorage();
        return {};
    }
    return stripInternal(raw);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Call once on app bootstrap.
 * Reads attribution params from the current URL and merges into storage.
 */
export function captureAttributionFromUrl() {
    if (typeof window === 'undefined') return;
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

    if (!found) return;

    let existing = loadRaw();
    const at = existing[CAPTURED_AT_KEY];
    if (isExpired(at)) {
        existing = {};
    }
    const merged: RawStored = {
        ...stripInternal(existing),
        ...incoming,
        [CAPTURED_AT_KEY]: new Date().toISOString(),
    };
    saveRaw(merged);
}

/**
 * Returns stored attribution (no internal keys). Empty if expired or unset.
 */
export function getAttribution(): AttributionData {
    return load();
}

/** Remove all stored attribution (testing). */
export function clearAttribution() {
    if (typeof window === 'undefined') return;
    clearAllStorage();
}

/** Debug snapshot: public fields, capture time, storage source, expiry flag. */
export function getAttributionDebug(): AttributionDebugInfo {
    if (typeof window === 'undefined') {
        return { attribution: {}, capturedAt: null, storageSource: 'none', expired: false };
    }
    const { raw, source } = loadRawWithSource();
    const at = raw[CAPTURED_AT_KEY];
    const expired = isExpired(at);
    if (expired && source !== 'none') {
        clearAllStorage();
    }
    const attribution = expired ? {} : stripInternal(raw);
    return {
        attribution,
        capturedAt: at ?? null,
        storageSource: source,
        expired,
    };
}

/** Attach window helpers for console debugging. */
export function registerAttributionDebugHelpers() {
    if (typeof window === 'undefined') return;
    const w = window as unknown as {
        __tripointAttributionDebug?: () => AttributionDebugInfo;
        __tripointAttributionClear?: () => void;
    };
    w.__tripointAttributionDebug = () => getAttributionDebug();
    w.__tripointAttributionClear = () => clearAttribution();
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
        return url;
    }
}
