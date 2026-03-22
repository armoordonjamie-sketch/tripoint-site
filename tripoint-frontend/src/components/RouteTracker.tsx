import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/analytics';

export function RouteTracker() {
    const location = useLocation();
    const isFirst = useRef(true);

    useEffect(() => {
        if (isFirst.current) {
            isFirst.current = false;
            trackPageView(location.pathname + location.search, document.title);
            return;
        }
        trackPageView(location.pathname + location.search, document.title);
    }, [location.pathname, location.search]);

    return null;
}
