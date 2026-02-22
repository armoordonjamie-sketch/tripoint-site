import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Fires a page_view event on every SPA route change.
 * Place inside <BrowserRouter> in App.tsx.
 */
export function RouteTracker() {
    const location = useLocation();
    const isFirst = useRef(true);

    useEffect(() => {
        // Skip the initial mount – gtag already fires page_view from index.html
        if (isFirst.current) {
            isFirst.current = false;
            return;
        }

        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'page_view', {
                page_location: window.location.href,
                page_path: location.pathname + location.search,
                page_title: document.title,
            });
        }
    }, [location]);

    return null;
}
