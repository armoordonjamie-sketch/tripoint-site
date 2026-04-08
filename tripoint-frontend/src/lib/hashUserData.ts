/**
 * SHA-256 hashing for Google enhanced conversions (normalize then hash).
 * Align with Google Ads API normalization rules.
 */

function bufferToHex(buf: ArrayBuffer): string {
    return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

async function sha256Utf8(utf8String: string): Promise<string> {
    const data = new TextEncoder().encode(utf8String);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return bufferToHex(hash);
}

/** Lowercase, trim; remove internal whitespace (for phone after digit extraction). */
export async function normalizeAndHash(value: string): Promise<string> {
    const n = value.trim().toLowerCase().replace(/\s+/g, '');
    return sha256Utf8(n);
}

/**
 * Gmail / Googlemail: remove dots and plus-suffix from local part; then hash.
 * Other domains: lowercase + trim only.
 */
export async function normalizeAndHashEmail(email: string): Promise<string> {
    let normalized = email.trim().toLowerCase();
    const parts = normalized.split('@');
    if (parts.length > 1) {
        const domain = parts[1];
        if (domain === 'gmail.com' || domain === 'googlemail.com') {
            let local = parts[0].replace(/\./g, '');
            const plus = local.indexOf('+');
            if (plus >= 0) local = local.slice(0, plus);
            normalized = `${local}@${domain}`;
        }
    }
    return sha256Utf8(normalized.replace(/\s+/g, ''));
}

/** Best-effort UK E.164 (+44…), then normalizeAndHash. */
export async function normalizeAndHashPhone(phone: string): Promise<string> {
    const t = phone.trim();
    let digits = t.replace(/\D/g, '');
    let e164: string;
    if (digits.startsWith('44')) {
        e164 = `+${digits}`;
    } else if (digits.startsWith('0') && digits.length >= 10) {
        e164 = `+44${digits.slice(1)}`;
    } else if (t.startsWith('+')) {
        e164 = `+${digits}`;
    } else {
        e164 = `+${digits}`;
    }
    return normalizeAndHash(e164);
}
