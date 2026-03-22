import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { GA4_MEASUREMENT_ID } from '@/config/analyticsPublic';

/**
 * Fires page_view on every SPA route change (Ads + GA4 when configured).
 * Place inside <BrowserRouter> in App.tsx.
 */
export function RouteTracker() {
    const location = useLocation();
    const isFirst = useRef(true);

    useEffect(() => {
        // Skip the initial mount – gtag config sends first page_view
        if (isFirst.current) {
            isFirst.current = false;
            return;
        }

        if (typeof window === 'undefined' || !window.gtag) return;

        const path = location.pathname + location.search;
        window.gtag('event', 'page_view', {
            page_location: window.location.href,
            page_path: path,
            page_title: document.title,
        });
        if (GA4_MEASUREMENT_ID.startsWith('G-')) {
            window.gtag('config', GA4_MEASUREMENT_ID, {
                page_path: path,
                page_title: document.title,
            });
        }
    }, [location]);

    return null;
}
