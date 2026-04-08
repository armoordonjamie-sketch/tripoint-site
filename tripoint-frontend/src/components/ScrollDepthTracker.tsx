import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackScrollDepth } from '@/lib/analytics';
import { getPageAnalyticsContextFromPath } from '@/lib/analyticsContext';

function shouldTrackPath(pathname: string): boolean {
    if (pathname === '/' || pathname === '/pricing' || pathname === '/booking') return true;
    if (pathname.startsWith('/services')) return true;
    return false;
}

/**
 * Fires GA4 scroll_depth at 25 / 50 / 75 / 100% milestones on key marketing routes.
 */
export function ScrollDepthTracker() {
    const location = useLocation();
    const fired = useRef<Set<number>>(new Set());

    useEffect(() => {
        fired.current.clear();
    }, [location.pathname]);

    useEffect(() => {
        if (!shouldTrackPath(location.pathname)) return;

        const ctx = getPageAnalyticsContextFromPath(location.pathname + location.search);

        const onScroll = () => {
            const doc = document.documentElement;
            const scrollTop = window.scrollY || doc.scrollTop;
            const h = doc.scrollHeight - doc.clientHeight;
            if (h <= 0) return;
            const pct = Math.round((scrollTop / h) * 100);
            for (const milestone of [25, 50, 75, 100]) {
                if (pct >= milestone && !fired.current.has(milestone)) {
                    fired.current.add(milestone);
                    trackScrollDepth(milestone, ctx);
                }
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, [location.pathname, location.search]);

    return null;
}
