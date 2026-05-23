/**
 * Pathname-derived context for GA4 and lead tracking (no PII).
 */
import { getSeoForPath } from '@/routes';
import { SERVICES_BY_CATEGORY, type ServiceCategoryId } from '@/config/servicesCatalog';

export type PageType =
    | 'home'
    | 'services_index'
    | 'service_detail'
    | 'areas_index'
    | 'area_detail'
    | 'booking'
    | 'contact'
    | 'blog_index'
    | 'blog_post'
    | 'faq'
    | 'pricing'
    | 'payment'
    | 'payment_success'
    | 'about'
    | 'process'
    | 'our_work'
    | 'report_viewer'
    | 'admin'
    | 'legal'
    | 'not_found'
    | 'other';

/** Commercial buckets: diagnostics, servicing, brakes, tuning, general */
export type ServiceCategoryAnalytics = 'diagnostics' | 'servicing' | 'brakes' | 'tuning' | 'general';

export interface PageAnalyticsContext {
    /** Path + query, e.g. /booking?x=1 */
    page: string;
    page_type: PageType;
    service_category: ServiceCategoryAnalytics;
    /** Display label for the primary service when on a service URL */
    service_name: string;
    /** areas-covered slug only */
    area_slug: string;
}

const BRAKE_SLUG_RE = /-brakes$/;

/** href path -> catalog category + title */
const SERVICE_PATH_META: Map<
    string,
    { category: ServiceCategoryId; title: string; priceSlug: string }
> = new Map();

for (const cat of ['diagnostics', 'servicing', 'tuning'] as const) {
    for (const s of SERVICES_BY_CATEGORY[cat]) {
        try {
            const path = new URL(s.href, 'https://example.com').pathname;
            SERVICE_PATH_META.set(path, { category: cat, title: s.title, priceSlug: s.priceSlug });
        } catch {
            /* ignore */
        }
    }
}

function titleCaseSegment(slug: string): string {
    return slug
        .split('-')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function slugToServiceCategory(slug: string): ServiceCategoryAnalytics {
    if (BRAKE_SLUG_RE.test(slug)) {
        return 'brakes';
    }
    const path = `/services/${slug}`;
    const meta = SERVICE_PATH_META.get(path);
    if (!meta) return 'general';
    if (meta.category === 'diagnostics') return 'diagnostics';
    if (meta.category === 'servicing') return 'servicing';
    if (meta.category === 'tuning') return 'tuning';
    return 'general';
}

function normalizePath(path: string): string {
    const [p, q] = path.split('?');
    const noTrail = p.replace(/\/+$/, '') || '/';
    return q ? `${noTrail}?${q}` : noTrail;
}

function pathnameOnly(fullPath: string): string {
    return fullPath.split('?')[0]?.replace(/\/+$/, '') || '/';
}

/**
 * Resolve page analytics from a full path (pathname + optional search).
 * Safe for SSR: pass path explicitly; omit document.
 */
export function getPageAnalyticsContextFromPath(fullPath: string): PageAnalyticsContext {
    const page = normalizePath(fullPath);
    const pathOnly = pathnameOnly(page);
    const segments = pathOnly === '/' ? [] : pathOnly.slice(1).split('/').filter(Boolean);

    let page_type: PageType = 'other';
    let service_category: ServiceCategoryAnalytics = 'general';
    let service_name = '';
    let area_slug = '';

    if (pathOnly === '/') {
        page_type = 'home';
    } else if (pathOnly === '/services') {
        page_type = 'services_index';
    } else if (pathOnly === '/areas-covered') {
        page_type = 'areas_index';
    } else if (pathOnly === '/booking') {
        page_type = 'booking';
    } else if (pathOnly === '/contact') {
        page_type = 'contact';
    } else if (pathOnly === '/blog') {
        page_type = 'blog_index';
    } else if (pathOnly === '/faq') {
        page_type = 'faq';
    } else if (pathOnly === '/pricing') {
        page_type = 'pricing';
    } else if (pathOnly === '/about') {
        page_type = 'about';
    } else if (pathOnly === '/process') {
        page_type = 'process';
    } else if (pathOnly === '/our-work') {
        page_type = 'our_work';
    } else if (segments[0] === 'services' && segments[1]) {
        page_type = 'service_detail';
        const slug = segments[1];
        service_category = slugToServiceCategory(slug);
        const meta = SERVICE_PATH_META.get(`/services/${slug}`);
        service_name = meta?.title ?? titleCaseSegment(slug);
    } else if (segments[0] === 'areas-covered' && segments[1]) {
        page_type = 'area_detail';
        area_slug = segments[1];
    } else if (segments[0] === 'blog' && segments[1]) {
        page_type = 'blog_post';
    } else if (pathOnly === '/payment-success' || (segments[0] === 'pay' && segments[2] === 'success')) {
        page_type = 'payment_success';
    } else if (segments[0] === 'pay' && segments[1]) {
        page_type = 'payment';
    } else if (segments[0] === 'report' && segments[1]) {
        page_type = 'report_viewer';
    } else if (segments[0] === 'admin') {
        page_type = 'admin';
    } else if (segments[0] === 'legal' && segments[1]) {
        page_type = 'legal';
    }

    return {
        page,
        page_type,
        service_category,
        service_name,
        area_slug,
    };
}

/** Client: current location path + search */
export function getPageAnalyticsContext(): PageAnalyticsContext {
    if (typeof window === 'undefined') {
        return getPageAnalyticsContextFromPath('/');
    }
    return getPageAnalyticsContextFromPath(window.location.pathname + window.location.search);
}

/** Document title fallback when RouteTracker runs before Seo updates */
export function getAnalyticsTitleForPath(pathOnly: string): string | undefined {
    const n = pathnameOnly(pathOnly);
    const seo = getSeoForPath(n);
    return seo?.title;
}
