/**
 * "Should I Buy This Car?" — standalone validation experiment config.
 *
 * Everything for this feature lives under src/pages/should-i-buy-this-car/.
 * To remove the experiment: delete this folder, its three routes in App.tsx,
 * and its entries in routes.ts.
 */

/**
 * Affiliate history-check partner link shown on the thank-you page.
 * PLACEHOLDER — replace before launch, or set VITE_AFFILIATE_HISTORY_CHECK_URL
 * in .env.production to override at build time.
 */
export const AFFILIATE_HISTORY_CHECK_URL: string =
    (import.meta.env.VITE_AFFILIATE_HISTORY_CHECK_URL as string | undefined) ||
    'https://example.com/REPLACE_WITH_AFFILIATE_HISTORY_CHECK_URL';

/** Price of the optional Priority Verdict (£). Backend enforces the real charge. */
export const PRIORITY_PRICE_GBP = 7;

/** Backend endpoints — proxied via Vite (dev) / Nginx (prod): /api → FastAPI. */
export const VERDICT_SUBMIT_ENDPOINT = '/api/verdict/submit';
export const VERDICT_PRIORITY_SESSION_ENDPOINT = '/api/verdict/priority-session';
export const VERDICT_PRIORITY_CONFIRM_ENDPOINT = '/api/verdict/priority-confirm';

/** Anchor id the hero CTA smooth-scrolls to. */
export const FORM_SECTION_ID = 'verdict-form';

export const VERDICT_PATH = '/should-i-buy-this-car';
export const VERDICT_THANKS_PATH = '/should-i-buy-this-car/thanks';
export const VERDICT_PRIORITY_THANKS_PATH = '/should-i-buy-this-car/priority-thanks';
